import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, subscriptionPlans } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

async function getOrCreateStripeCustomer(userId: string, userEmail: string): Promise<string> {
  const member = await db.query.members.findFirst({
    where: eq(members.userId, userId),
  })

  if (!member) {
    throw new Error("Member not found")
  }

  if (member.stripeCustomerId) {
    return member.stripeCustomerId
  }

  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: {
      memberId: member.id.toString(),
      userId: userId,
    },
  })

  await db.update(members)
    .set({ stripeCustomerId: customer.id })
    .where(eq(members.id, member.id))

  return customer.id
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { planId, isAnnual = false } = body

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(session.user.id, session.user.email)

    // Get member details
    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Get plan details
    const plan = await db.query.subscriptionPlans.findFirst({
      where: eq(subscriptionPlans.id, planId),
    })

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not found or inactive" }, { status: 404 })
    }

    const priceId = isAnnual && plan.stripeAnnualPriceId 
      ? plan.stripeAnnualPriceId 
      : plan.stripePriceId

    if (!priceId) {
      return NextResponse.json({ error: "Price not configured for this plan" }, { status: 400 })
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/member/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/member/subscription?canceled=true`,
      subscription_data: {
        metadata: {
          memberId: member.id.toString(),
          userId: session.user.id,
          planId: planId.toString(),
        },
      },
    })

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url })
  } catch (error) {
    console.error("Create checkout session error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
