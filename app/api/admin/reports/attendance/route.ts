import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { attendance, members } from "@/lib/db/schema"
import { and, eq, gte, lte, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get("months") || "3")
    
    const endDate = new Date()
    const startDate = subMonths(endDate, months)

    // Get attendance records
    const attendanceRecords = await db.query.attendance.findMany({
      where: and(
        gte(attendance.checkInTime, startDate),
        lte(attendance.checkInTime, endDate)
      ),
      with: {
        member: true,
      },
    })

    // Daily stats
    const dailyStats: Record<string, { count: number; uniqueMembers: Set<number> }> = {}
    const allDays = eachDayOfInterval({ start: startDate, end: endDate })
    
    allDays.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd")
      dailyStats[dateStr] = { count: 0, uniqueMembers: new Set() }
    })

    attendanceRecords.forEach((record) => {
      if (!record.checkInTime) return
      const dateStr = format(new Date(record.checkInTime), "yyyy-MM-dd")
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].count++
        if (record.memberId) {
          dailyStats[dateStr].uniqueMembers.add(record.memberId)
        }
      }
    })

    // Day of week stats
    const dayOfWeekStats = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      day,
      name: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day],
      total: 0,
      count: 0,
    }))

    attendanceRecords.forEach((record) => {
      if (!record.checkInTime) return
      const day = getDay(new Date(record.checkInTime))
      dayOfWeekStats[day].total++
    })

    // Calculate averages
    dayOfWeekStats.forEach((stat) => {
      const weeksCount = Math.ceil(months * 30 / 7)
      stat.count = weeksCount
    })

    // Peak hours
    const hourlyStats: Record<number, number> = {}
    attendanceRecords.forEach((record) => {
      if (!record.checkInTime) return
      const hour = new Date(record.checkInTime).getHours()
      hourlyStats[hour] = (hourlyStats[hour] || 0) + 1
    })

    const peakHours = Object.entries(hourlyStats)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Member retention (simplified)
    const uniqueMembersThisMonth = new Set(
      attendanceRecords
        .filter((r) => r.checkInTime && new Date(r.checkInTime) >= subMonths(new Date(), 1))
        .map((r) => r.memberId)
    ).size

    const uniqueMembersLastMonth = new Set(
      attendanceRecords
        .filter((r) => {
          if (!r.checkInTime) return false
          const date = new Date(r.checkInTime)
          return date >= subMonths(new Date(), 2) && date < subMonths(new Date(), 1)
        })
        .map((r) => r.memberId)
    ).size

    return NextResponse.json({
      period: {
        start: startDate,
        end: endDate,
        months,
      },
      summary: {
        totalCheckIns: attendanceRecords.length,
        uniqueMembers: new Set(attendanceRecords.map((r) => r.memberId)).size,
        avgDailyAttendance: Math.round(attendanceRecords.length / allDays.length),
        memberRetention: uniqueMembersLastMonth > 0
          ? Math.round((uniqueMembersThisMonth / uniqueMembersLastMonth) * 100)
          : 100,
      },
      dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        count: stats.count,
        uniqueMembers: stats.uniqueMembers.size,
      })),
      dayOfWeekStats,
      peakHours,
    })
  } catch (error) {
    console.error("Get attendance report error:", error)
    return NextResponse.json(
      { error: "Failed to generate attendance report" },
      { status: 500 }
    )
  }
}