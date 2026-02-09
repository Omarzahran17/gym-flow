import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, trainers, attendance, memberSubscriptions, subscriptionPlans } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // Get member stats
    const allMembers = await db.query.members.findMany()
    const activeMembers = allMembers.filter(m => m.status === "active")
    
    // Get trainer count
    const allTrainers = await db.query.trainers.findMany()
    
    // Get today's attendance using raw query for date comparison
    const todayAttendanceRaw = await db.select().from(attendance).where(
      sql`${attendance.date} >= ${todayStr}`
    )
    
    // Calculate monthly revenue from actual subscription plan prices
    const activeSubscriptions = await db.query.memberSubscriptions.findMany({
      where: eq(memberSubscriptions.status, "active"),
    })
    
    const allPlans = await db.query.subscriptionPlans.findMany()
    
    let monthlyRevenue = 0
    for (const sub of activeSubscriptions) {
      const plan = allPlans.find(p => p.id === sub.planId)
      if (plan) {
        // Convert yearly prices to monthly equivalent
        const monthlyPrice = plan.interval === "year" ? plan.price / 12 : plan.price
        monthlyRevenue += monthlyPrice
      }
    }

    return NextResponse.json({
      stats: {
        totalMembers: allMembers.length,
        activeMembers: activeMembers.length,
        totalTrainers: allTrainers.length,
        todayAttendance: todayAttendanceRaw.length,
        monthlyRevenue,
      },
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to get dashboard stats" },
      { status: 500 }
    )
  }
}
