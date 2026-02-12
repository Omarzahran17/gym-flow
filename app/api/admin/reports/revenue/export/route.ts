import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { memberSubscriptions, subscriptionPlans, members, attendance } from "@/lib/db/schema"
import { and, gte, lte, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const formatType = searchParams.get("format") || "csv"
    const period = searchParams.get("period") || "month"

    // Calculate date range
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
      startDate = subMonths(new Date(), 1)
    }

    // Get data
    const subscriptions = await db.query.memberSubscriptions.findMany({
      where: and(
        gte(memberSubscriptions.createdAt, startDate),
        lte(memberSubscriptions.createdAt, endDate)
      ),
      with: {
        plan: true,
      },
      orderBy: [desc(memberSubscriptions.createdAt)],
      limit: 1000,
    })

    // Get member count
    const newMembers = await db.query.members.findMany({
      where: and(
        gte(members.createdAt, startDate),
        lte(members.createdAt, endDate)
      ),
    })

    // Get attendance
    const attendanceRecords = await db.query.attendance.findMany({
      where: and(
        gte(attendance.checkInTime, startDate),
        lte(attendance.checkInTime, endDate)
      ),
      limit: 1000,
    })

    // Calculate metrics
    const totalRevenue = subscriptions.reduce((sum, sub) => {
      return sum + (parseFloat(sub.plan?.price || "0") || 0)
    }, 0)

    // Group revenue by plan
    const revenueByPlan: Record<string, { count: number; revenue: number }> = {}
    subscriptions.forEach((sub) => {
      const planName = sub.plan?.name || "Unknown"
      if (!revenueByPlan[planName]) {
        revenueByPlan[planName] = { count: 0, revenue: 0 }
      }
      revenueByPlan[planName].count++
      revenueByPlan[planName].revenue += parseFloat(sub.plan?.price || "0") || 0
    })

    if (formatType === "csv") {
      const headers = ["Date", "Member ID", "Plan", "Amount", "Status"]
      const rows = subscriptions.map((sub) => {
        const createdAt = sub.createdAt ? new Date(sub.createdAt) : new Date()
        return [
          format(createdAt, "yyyy-MM-dd"),
          sub.memberId?.toString() || "",
          sub.plan?.name || "Unknown",
          `$${sub.plan?.price || "0"}`,
          sub.status || "unknown",
        ]
      })

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="revenue-report-${period}-${format(new Date(), "yyyy-MM-dd")}.csv"`,
        },
      })
    } else {
      return NextResponse.json({
        data: {
          period: { start: startDate, end: endDate, period },
          summary: {
            totalRevenue,
            totalSubscriptions: subscriptions.length,
            newMembers: newMembers.length,
            totalAttendance: attendanceRecords.length,
            avgDailyAttendance: Math.round(attendanceRecords.length / 30),
          },
          revenueByPlan,
          subscriptions: subscriptions.map((sub) => ({
            date: sub.createdAt,
            memberId: sub.memberId,
            planName: sub.plan?.name || "Unknown",
            amount: sub.plan?.price || "0",
            status: sub.status,
          })),
        },
      })
    }
  } catch (error) {
    console.error("Export revenue report error:", error)
    return NextResponse.json(
      { error: "Failed to export revenue report" },
      { status: 500 }
    )
  }
}
