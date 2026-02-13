import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { subscriptionPlans, memberSubscriptions } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
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
    const {
      name, description, price, interval, stripePriceId, stripeAnnualPriceId, features,
      tier, maxClassesPerMonth, maxCheckInsPerDay, hasTrainerAccess, hasPersonalTraining,
      hasProgressTracking, hasAchievements
    } = body

    const [plan] = await db.insert(subscriptionPlans).values({
      name,
      description,
      price,
      interval: interval || "month",
      stripePriceId,
      stripeAnnualPriceId,
      features: features || [],
      isActive: true,
      tier: tier || "basic",
      maxClassesPerMonth: maxClassesPerMonth ?? 12,
      maxCheckInsPerDay: maxCheckInsPerDay ?? 1,
      hasTrainerAccess: hasTrainerAccess ?? false,
      hasPersonalTraining: hasPersonalTraining ?? false,
      hasProgressTracking: hasProgressTracking ?? true,
      hasAchievements: hasAchievements ?? true,
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

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, price, interval, stripePriceId, stripeAnnualPriceId, features,
      tier, maxClassesPerMonth, maxCheckInsPerDay, hasTrainerAccess, hasPersonalTraining,
      hasProgressTracking, hasAchievements
    } = body

    if (!id) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
    }

    const [plan] = await db.update(subscriptionPlans)
      .set({
        name,
        description,
        price,
        interval: interval || "month",
        stripePriceId,
        stripeAnnualPriceId,
        features: features || [],
        tier: tier || "basic",
        maxClassesPerMonth: maxClassesPerMonth ?? 12,
        maxCheckInsPerDay: maxCheckInsPerDay ?? 1,
        hasTrainerAccess: hasTrainerAccess ?? false,
        hasPersonalTraining: hasPersonalTraining ?? false,
        hasProgressTracking: hasProgressTracking ?? true,
        hasAchievements: hasAchievements ?? true,
      })
      .where(eq(subscriptionPlans.id, id))
      .returning()

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Update subscription plan error:", error)
    return NextResponse.json(
      { error: "Failed to update subscription plan" },
      { status: 500 }
    )
  }
}

