import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { attendance, members } from "@/lib/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"
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
    const format_type = searchParams.get("format") || "csv"
    const months = parseInt(searchParams.get("period") || "3")

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

    if (format_type === "csv") {
      // Generate CSV
      const headers = ["Date", "Day", "Time", "Member", "Method"]
      const rows = attendanceRecords.map((record) => {
        const checkInTime = record.checkInTime ? new Date(record.checkInTime) : new Date()
        return [
          format(checkInTime, "yyyy-MM-dd"),
          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][getDay(checkInTime)],
          format(checkInTime, "HH:mm"),
          `Member #${record.memberId}`,
          record.method,
        ]
      })

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="attendance-report-${format(new Date(), "yyyy-MM-dd")}.csv"`,
        },
      })
    } else {
      // For PDF, return JSON data
      return NextResponse.json({
        data: {
          period: { months, start: startDate, end: endDate },
          records: attendanceRecords.map((record) => {
            const checkInTime = record.checkInTime ? new Date(record.checkInTime) : new Date()
            return {
              date: record.checkInTime,
              day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][getDay(checkInTime)],
              time: format(checkInTime, "HH:mm"),
              memberId: record.memberId,
              method: record.method,
            }
          }),
          summary: {
            totalCheckIns: attendanceRecords.length,
            uniqueMembers: new Set(attendanceRecords.map((r) => r.memberId)).size,
          },
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