import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { classBookings, classSchedules, classes, members } from "@/lib/db/schema"
import { eq, and, count } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { addDays, startOfWeek } from "date-fns"
import { checkMemberSubscription } from "@/lib/subscription"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get member from user
    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let bookings
    if (startDate && endDate) {
      bookings = await db.query.classBookings.findMany({
        where: and(
          eq(classBookings.memberId, member.id),
          eq(classBookings.status, "confirmed")
        ),
        with: {
          schedule: {
            with: {
              class: true,
            },
          },
        },
      })
      
      // Filter by date range in memory
      const start = new Date(startDate)
      const end = new Date(endDate)
      bookings = bookings.filter(b => {
        const bookingDate = new Date(b.bookingDate)
        return bookingDate >= start && bookingDate <= end
      })
    } else {
      bookings = await db.query.classBookings.findMany({
        where: and(
          eq(classBookings.memberId, member.id),
          eq(classBookings.status, "confirmed")
        ),
        with: {
          schedule: {
            with: {
              class: true,
            },
          },
        },
        orderBy: [classBookings.bookingDate],
      })
    }

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Get class bookings error:", error)
    return NextResponse.json(
      { error: "Failed to get class bookings" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get member from user
    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const subscriptionCheck = await checkMemberSubscription(member.id)
    
    if (!subscriptionCheck.hasSubscription || !subscriptionCheck.isActive) {
      return NextResponse.json(
        { error: "Active subscription required", code: "SUBSCRIPTION_REQUIRED" },
        { status: 403 }
      )
    }

    if (subscriptionCheck.limits && subscriptionCheck.limits.classesRemaining <= 0) {
      return NextResponse.json(
        { 
          error: `You've reached your weekly class limit (${subscriptionCheck.plan?.maxClassesPerWeek} classes). Upgrade your plan for more access.`,
          code: "CLASS_LIMIT_REACHED",
          limit: subscriptionCheck.plan?.maxClassesPerWeek,
          used: subscriptionCheck.usage?.classesThisWeek
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { scheduleId, bookingDate } = body

    if (!scheduleId || !bookingDate) {
      return NextResponse.json(
        { error: "Schedule ID and booking date are required" },
        { status: 400 }
      )
    }

    // Get schedule and class details
    const schedule = await db.query.classSchedules.findFirst({
      where: eq(classSchedules.id, scheduleId),
      with: {
        class: true,
      },
    })

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    // Check if already booked - query all and filter in memory due to date type mismatch
    const existingBookings = await db.query.classBookings.findMany({
      where: and(
        eq(classBookings.scheduleId, scheduleId),
        eq(classBookings.memberId, member.id)
      ),
    })
    
    const existingBooking = existingBookings.find(b => {
      const bDate = new Date(b.bookingDate)
      const checkDate = new Date(bookingDate)
      return bDate.toDateString() === checkDate.toDateString()
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: "You are already booked for this class" },
        { status: 400 }
      )
    }

    // Check capacity - query all and filter in memory
    const allBookingsForSchedule = await db.query.classBookings.findMany({
      where: and(
        eq(classBookings.scheduleId, scheduleId),
        eq(classBookings.status, "confirmed")
      ),
    })
    
    const bookingsForDate = allBookingsForSchedule.filter(b => {
      const bDate = new Date(b.bookingDate)
      const checkDate = new Date(bookingDate)
      return bDate.toDateString() === checkDate.toDateString()
    })
    
    const bookingCount = { count: bookingsForDate.length }

    const maxCapacity = schedule.class?.maxCapacity ?? 20
    if (bookingCount.count >= maxCapacity) {
      return NextResponse.json(
        { error: "This class is full. You can join the waitlist instead." },
        { status: 400 }
      )
    }

    // Create booking
    const bookingData: any = {
      scheduleId,
      memberId: member.id,
      bookingDate: bookingDate,
      status: "confirmed",
    }
    
    const [booking] = await db.insert(classBookings).values(bookingData).returning()

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error("Create class booking error:", error)
    return NextResponse.json(
      { error: "Failed to create class booking" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get member from user
    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("id")

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      )
    }

    const [booking] = await db.delete(classBookings)
      .where(
        and(
          eq(classBookings.id, parseInt(bookingId)),
          eq(classBookings.memberId, member.id)
        )
      )
      .returning()

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cancel class booking error:", error)
    return NextResponse.json(
      { error: "Failed to cancel class booking" },
      { status: 500 }
    )
  }
}