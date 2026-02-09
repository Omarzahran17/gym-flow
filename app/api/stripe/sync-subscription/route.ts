import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, memberSubscriptions, subscriptionPlans } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    if (!member.stripeCustomerId) {
      return NextResponse.json({ subscription: null })
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: member.stripeCustomerId,
      status: "all",
      limit: 10,
    })

    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    )

    if (!activeSubscription) {
      return NextResponse.json({ subscription: null })
    }

    const priceId = activeSubscription.items.data[0]?.price.id
    const plan = await db.query.subscriptionPlans.findFirst({
      where: eq(subscriptionPlans.stripePriceId, priceId),
    })

    const existingSub = await db.query.memberSubscriptions.findFirst({
      where: eq(memberSubscriptions.memberId, member.id),
    })

    const subscriptionData = {
      memberId: member.id,
      planId: plan?.id || null,
      stripeSubscriptionId: activeSubscription.id,
      status: activeSubscription.status,
      currentPeriodStart: new Date(activeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(activeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
      canceledAt: activeSubscription.canceled_at ? new Date(activeSubscription.canceled_at * 1000) : null,
    }

    if (existingSub) {
      await db.update(memberSubscriptions)
        .set(subscriptionData)
        .where(eq(memberSubscriptions.id, existingSub.id))
    } else {
      await db.insert(memberSubscriptions).values(subscriptionData)
    }

    await db.update(members)
      .set({ status: "active" })
      .where(eq(members.id, member.id))

    return NextResponse.json({ 
      subscription: {
        ...subscriptionData,
        plan,
      }
    })
  } catch (error) {
    console.error("Sync subscription error:", error)
    return NextResponse.json(
      { error: "Failed to sync subscription" },
      { status: 500 }
    )
  }
}
