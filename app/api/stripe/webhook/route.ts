import { db } from "@/lib/db"
import { members, memberSubscriptions, subscriptionPlans } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log(`Processing webhook event: ${event.type}`)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any
        await handleInvoicePaymentFailed(invoice)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any
        await handleSubscriptionUpdated(subscription)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any
        await handleSubscriptionDeleted(subscription)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const subscriptionId = session.subscription as string
  const metadata = session.metadata

  if (!metadata?.memberId || !metadata?.planId) {
    console.error("Missing metadata in checkout session")
    return
  }

  const memberId = parseInt(metadata.memberId)
  const planId = parseInt(metadata.planId)

  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any

  await db.update(members)
    .set({ status: "active" })
    .where(eq(members.id, memberId))

  const currentPeriodStart = subscription.current_period_start 
    ? new Date(Number(subscription.current_period_start) * 1000) 
    : new Date()
  let currentPeriodEnd = subscription.current_period_end 
    ? new Date(Number(subscription.current_period_end) * 1000) 
    : null
  
  // Calculate end date based on plan interval if not provided by Stripe
  if (!currentPeriodEnd || currentPeriodEnd.getTime() === currentPeriodStart.getTime()) {
    const plan = await db.query.subscriptionPlans.findFirst({
      where: eq(subscriptionPlans.id, planId),
    })
    const interval = plan?.interval || 'month'
    const endDate = new Date(currentPeriodStart)
    if (interval === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else if (interval === 'month') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (interval === 'week') {
      endDate.setDate(endDate.getDate() + 7)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }
    currentPeriodEnd = endDate
  }

  const existingSub = await db.query.memberSubscriptions.findFirst({
    where: eq(memberSubscriptions.stripeSubscriptionId, subscriptionId),
  })

  if (existingSub) {
    await db.update(memberSubscriptions)
      .set({
        status: subscription.status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      })
      .where(eq(memberSubscriptions.id, existingSub.id))
  } else {
    await db.insert(memberSubscriptions).values({
      memberId,
      stripeSubscriptionId: subscriptionId,
      planId,
      status: subscription.status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    })
  }

  console.log(`Checkout completed for member ${memberId}`)
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription
  
  if (!subscriptionId) return

  await db.update(memberSubscriptions)
    .set({ status: "active" })
    .where(eq(memberSubscriptions.stripeSubscriptionId, subscriptionId))

  console.log(`Payment succeeded for subscription ${subscriptionId}`)
}

async function handleInvoicePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription
  
  if (!subscriptionId) return

  await db.update(memberSubscriptions)
    .set({ status: "past_due" })
    .where(eq(memberSubscriptions.stripeSubscriptionId, subscriptionId))

  console.log(`Payment failed for subscription ${subscriptionId}`)
}

async function handleSubscriptionUpdated(subscription: any) {
  const existingSub = await db.query.memberSubscriptions.findFirst({
    where: eq(memberSubscriptions.stripeSubscriptionId, subscription.id),
  })

  if (!existingSub) {
    console.error(`Subscription ${subscription.id} not found in database`)
    return
  }

  const currentPeriodStart = subscription.current_period_start 
    ? new Date(Number(subscription.current_period_start) * 1000) 
    : new Date()
  let currentPeriodEnd = subscription.current_period_end 
    ? new Date(Number(subscription.current_period_end) * 1000) 
    : null
  
  // Calculate end date based on plan interval if not provided by Stripe
  if (!currentPeriodEnd || currentPeriodEnd.getTime() === currentPeriodStart.getTime()) {
    const plan = existingSub.planId 
      ? await db.query.subscriptionPlans.findFirst({
          where: eq(subscriptionPlans.id, existingSub.planId),
        })
      : null
    const interval = plan?.interval || 'month'
    const endDate = new Date(currentPeriodStart)
    if (interval === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else if (interval === 'month') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (interval === 'week') {
      endDate.setDate(endDate.getDate() + 7)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }
    currentPeriodEnd = endDate
  }
  
  const canceledAt = subscription.canceled_at 
    ? new Date(Number(subscription.canceled_at) * 1000) 
    : null

  await db.update(memberSubscriptions)
    .set({
      status: subscription.status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      canceledAt,
    })
    .where(eq(memberSubscriptions.id, existingSub.id))

  console.log(`Subscription ${subscription.id} updated`)
}

async function handleSubscriptionDeleted(subscription: any) {
  const existingSub = await db.query.memberSubscriptions.findFirst({
    where: eq(memberSubscriptions.stripeSubscriptionId, subscription.id),
  })

  if (!existingSub) {
    console.error(`Subscription ${subscription.id} not found in database`)
    return
  }

  await db.update(memberSubscriptions)
    .set({
      status: "canceled",
      endedAt: new Date(),
    })
    .where(eq(memberSubscriptions.id, existingSub.id))

  if (existingSub.memberId) {
    await db.update(members)
      .set({ status: "inactive" })
      .where(eq(members.id, existingSub.memberId))
  }

  console.log(`Subscription ${subscription.id} deleted`)
}
