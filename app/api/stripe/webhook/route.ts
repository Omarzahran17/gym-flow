import { db } from "@/lib/db"
import { members, memberSubscriptions, subscriptionPlans } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
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
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
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

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Update member status
  await db.update(members)
    .set({ status: "active" })
    .where(eq(members.id, memberId))

  // Create or update subscription record
  const existingSub = await db.query.memberSubscriptions.findFirst({
    where: eq(memberSubscriptions.stripeSubscriptionId, subscriptionId),
  })

  if (existingSub) {
    await db.update(memberSubscriptions)
      .set({
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      })
      .where(eq(memberSubscriptions.id, existingSub.id))
  } else {
    await db.insert(memberSubscriptions).values({
      memberId,
      stripeSubscriptionId: subscriptionId,
      planId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
  }

  console.log(`Checkout completed for member ${memberId}`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  if (!subscriptionId) return

  await db.update(memberSubscriptions)
    .set({ status: "active" })
    .where(eq(memberSubscriptions.stripeSubscriptionId, subscriptionId))

  console.log(`Payment succeeded for subscription ${subscriptionId}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  if (!subscriptionId) return

  await db.update(memberSubscriptions)
    .set({ status: "past_due" })
    .where(eq(memberSubscriptions.stripeSubscriptionId, subscriptionId))

  console.log(`Payment failed for subscription ${subscriptionId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const existingSub = await db.query.memberSubscriptions.findFirst({
    where: eq(memberSubscriptions.stripeSubscriptionId, subscription.id),
  })

  if (!existingSub) {
    console.error(`Subscription ${subscription.id} not found in database`)
    return
  }

  await db.update(memberSubscriptions)
    .set({
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    })
    .where(eq(memberSubscriptions.id, existingSub.id))

  console.log(`Subscription ${subscription.id} updated`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
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

  // Update member status
  if (existingSub.memberId) {
    await db.update(members)
      .set({ status: "inactive" })
      .where(eq(members.id, existingSub.memberId))
  }

  console.log(`Subscription ${subscription.id} deleted`)
}
