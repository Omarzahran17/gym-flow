import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { memberSubscriptions, subscriptionPlans, members, attendance } from "@/lib/db/schema"
import { and, eq, gte, lte, sql, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month"
    
    let startDate: Date
    let endDate: Date = new Date()
    
    if (period === "month") {
      startDate = startOfMonth(new Date())
      endDate = endOfMonth(new Date())
    } else if (period === "quarter") {
      startDate = subMonths(new Date(), 3)
    } else if (period === "year") {
      startDate = subMonths(new Date(), 12)
    } else {
      // Custom date range
      const start = searchParams.get("startDate")
      const end = searchParams.get("endDate")
      startDate = start ? new Date(start) : subMonths(new Date(), 1)
      endDate = end ? new Date(end) : new Date()
    }

    // Get subscription revenue
    const subscriptions = await db.query.memberSubscriptions.findMany({
      where: and(
        gte(memberSubscriptions.createdAt, startDate),
        lte(memberSubscriptions.createdAt, endDate)
      ),
      with: {
        plan: true,
        member: true,
      },
      orderBy: [desc(memberSubscriptions.createdAt)],
    })

    // Get attendance stats
    const attendanceRecords = await db.query.attendance.findMany({
      where: and(
        gte(attendance.checkInTime, startDate),
        lte(attendance.checkInTime, endDate)
      ),
    })

    // Calculate metrics
    const totalRevenue = subscriptions.reduce((sum, sub) => {
      return sum + (parseFloat(sub.plan?.price || "0"))
    }, 0)

    const newMembers = await db.query.members.findMany({
      where: and(
        gte(members.createdAt, startDate),
        lte(members.createdAt, endDate)
      ),
    })

    // Group revenue by plan
    const revenueByPlan: Record<string, { count: number; revenue: number }> = {}
    subscriptions.forEach((sub) => {
      const planName = sub.plan?.name || "Unknown"
      if (!revenueByPlan[planName]) {
        revenueByPlan[planName] = { count: 0, revenue: 0 }
      }
      revenueByPlan[planName].count++
      revenueByPlan[planName].revenue += parseFloat(sub.plan?.price || "0")
    })

    // Daily attendance breakdown
    const attendanceByDay: Record<string, number> = {}
    attendanceRecords.forEach((record) => {
      if (!record.checkInTime) return
      const day = format(new Date(record.checkInTime), "yyyy-MM-dd")
      attendanceByDay[day] = (attendanceByDay[day] || 0) + 1
    })

    return NextResponse.json({
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        totalRevenue,
        totalSubscriptions: subscriptions.length,
        newMembers: newMembers.length,
        totalAttendance: attendanceRecords.length,
        avgDailyAttendance: attendanceRecords.length / Math.max(1, Object.keys(attendanceByDay).length),
      },
      revenueByPlan,
      attendanceByDay,
      subscriptions: subscriptions.slice(0, 100), // Limit for performance
    })
  } catch (error) {
    console.error("Get revenue report error:", error)
    return NextResponse.json(
      { error: "Failed to generate revenue report" },
      { status: 500 }
    )
  }
}