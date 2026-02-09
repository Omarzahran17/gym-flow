import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { classes, classSchedules, classBookings, members } from "@/lib/db/schema"
import { eq, and, count } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { addDays, startOfWeek, format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get("weekStart")

    // Get all active classes with schedules
    const allClasses = await db.query.classes.findMany({
      with: {
        trainer: true,
        schedules: true,
      },
    })

    // Get member if logged in as member
    let memberId: number | null = null
    if ((session.user as any).role === "member") {
      const member = await db.query.members.findFirst({
        where: eq(members.userId, session.user.id),
      })
      if (member) {
        memberId = member.id
      }
    }

    // Calculate week dates if weekStart provided
    let weekDates: Date[] = []
    if (weekStart) {
      const start = new Date(weekStart)
      for (let i = 0; i < 7; i++) {
        weekDates.push(addDays(start, i))
      }
    }

    // Build schedule with availability
    const schedule = []
    for (const classItem of allClasses) {
      for (const classSchedule of classItem.schedules || []) {
        // Get booking count for this schedule
        const [bookingCount] = await db
          .select({ count: count() })
          .from(classBookings)
          .where(
            and(
              eq(classBookings.scheduleId, classSchedule.id),
              eq(classBookings.status, "confirmed")
            )
          )

        // Check if member is booked
        let isBooked = false
        if (memberId) {
          const existingBooking = await db.query.classBookings.findFirst({
            where: and(
              eq(classBookings.scheduleId, classSchedule.id),
              eq(classBookings.memberId, memberId),
              eq(classBookings.status, "confirmed")
            ),
          })
          isBooked = !!existingBooking
        }

        const maxCapacity = classItem.maxCapacity ?? 20
        schedule.push({
          ...classSchedule,
          class: classItem,
          trainer: classItem.trainer,
          bookingsCount: bookingCount.count,
          availableSpots: maxCapacity - bookingCount.count,
          isFull: bookingCount.count >= maxCapacity,
          isBooked,
        })
      }
    }

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error("Get class schedule error:", error)
    return NextResponse.json(
      { error: "Failed to get class schedule" },
      { status: 500 }
    )
  }
}