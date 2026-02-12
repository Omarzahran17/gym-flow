import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { attendance } from "@/lib/db/schema"
import { and, gte, lte } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { format, subMonths, getDay } from "date-fns"

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
    const months = parseInt(searchParams.get("period") || "3")

    const endDate = new Date()
    const startDate = subMonths(endDate, months)

    // Get attendance records
    const attendanceRecords = await db.query.attendance.findMany({
      where: and(
        gte(attendance.checkInTime, startDate),
        lte(attendance.checkInTime, endDate)
      ),
      limit: 1000,
    })

    // Calculate stats
    const uniqueMembers = new Set(attendanceRecords.map((r) => r.memberId).filter(Boolean))
    const totalCheckIns = attendanceRecords.length

    // Group by day
    const byDay: Record<string, number> = {}
    attendanceRecords.forEach((record) => {
      if (!record.checkInTime) return
      const day = format(new Date(record.checkInTime), "yyyy-MM-dd")
      byDay[day] = (byDay[day] || 0) + 1
    })

    // Hourly stats
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

    if (formatType === "csv") {
      const headers = ["Date", "Day", "Time", "Member ID", "Method"]
      const rows = attendanceRecords.map((record) => {
        const checkInTime = record.checkInTime ? new Date(record.checkInTime) : new Date()
        return [
          format(checkInTime, "yyyy-MM-dd"),
          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][getDay(checkInTime)],
          format(checkInTime, "HH:mm"),
          record.memberId?.toString() || "",
          record.method || "unknown",
        ]
      })

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="attendance-report-${months}months-${format(new Date(), "yyyy-MM-dd")}.csv"`,
        },
      })
    } else {
      return NextResponse.json({
        data: {
          period: { months, start: startDate, end: endDate },
          summary: {
            totalCheckIns,
            uniqueMembers: uniqueMembers.size,
            avgDailyCheckIns: Math.round(totalCheckIns / 30),
          },
          peakHours,
          byDay,
          records: attendanceRecords.map((record) => {
            const checkInTime = record.checkInTime ? new Date(record.checkInTime) : new Date()
            return {
              date: format(checkInTime, "yyyy-MM-dd"),
              day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][getDay(checkInTime)],
              time: format(checkInTime, "HH:mm"),
              memberId: record.memberId,
              method: record.method,
            }
          }),
        },
      })
    }
  } catch (error) {
    console.error("Export attendance report error:", error)
    return NextResponse.json(
      { error: "Failed to export attendance report" },
      { status: 500 }
    )
  }
}