import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { subscriptionPlans, memberSubscriptions } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const plans = await db.query.subscriptionPlans.findMany({
      orderBy: [desc(subscriptionPlans.createdAt)],
    })

    const allSubscriptions = await db.query.memberSubscriptions.findMany({
      where: eq(memberSubscriptions.status, "active"),
    })

    const plansWithCounts = plans.map((plan) => {
      const count = allSubscriptions.filter(
        (sub) => sub.planId === plan.id
      ).length
      return {
        ...plan,
        memberCount: count,
      }
    })

    return NextResponse.json({ plans: plansWithCounts })
  } catch (error) {
    console.error("Get subscription plans error:", error)
    return NextResponse.json(
      { error: "Failed to get subscription plans" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, interval, stripePriceId, stripeAnnualPriceId, features } = body

    const [plan] = await db.insert(subscriptionPlans).values({
      name,
      description,
      price,
      interval: interval || "month",
      stripePriceId,
      stripeAnnualPriceId,
      features: features || [],
      isActive: true,
    }).returning()

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error("Create subscription plan error:", error)
    return NextResponse.json(
      { error: "Failed to create subscription plan" },
      { status: 500 }
    )
  }
}
