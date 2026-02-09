import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { memberSubscriptions, subscriptionPlans, members, attendance } from "@/lib/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"
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
    const format_type = searchParams.get("format") || "csv"
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
        member: true,
      },
    })

    if (format_type === "csv") {
      // Generate CSV
      const headers = ["Date", "Member", "Plan", "Amount", "Status"]
      const rows = subscriptions.map((sub) => {
        const createdAt = sub.createdAt ? new Date(sub.createdAt) : new Date()
        return [
          format(createdAt, "yyyy-MM-dd"),
          `Member #${sub.memberId}`,
          sub.plan?.name || "Unknown",
          sub.plan?.price || "0",
          sub.status,
        ]
      })

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="revenue-report-${format(new Date(), "yyyy-MM-dd")}.csv"`,
        },
      })
    } else {
      // For PDF, return JSON data that will be used by client-side PDF generation
      // Since @react-pdf/renderer works best on the client side
      return NextResponse.json({
        data: {
          period: { start: startDate, end: endDate },
          subscriptions: subscriptions.map((sub) => ({
            date: sub.createdAt,
            memberId: sub.memberId,
            planName: sub.plan?.name || "Unknown",
            amount: sub.plan?.price || "0",
            status: sub.status,
          })),
          summary: {
            totalRevenue: subscriptions.reduce((sum, sub) => sum + parseFloat(sub.plan?.price || "0"), 0),
            totalSubscriptions: subscriptions.length,
          },
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