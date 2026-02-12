import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { trainers, classSchedules, classBookings, members, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await db.query.trainers.findFirst({
      where: (trainers, { eq }) => eq(trainers.userId, session.user.id),
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const schedules = await db.query.classSchedules.findMany({
      with: {
        class: true,
        bookings: {
          with: {
            member: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    })

    const schedule = schedules
      .filter((s) => s.class && s.class.trainerId === trainer.id)
      .map((s) => {
        const bookingsWithMembers = s.bookings
          .filter((b) => b.member)
          .map((b) => ({
            id: b.id,
            memberId: b.member!.id,
            memberName: b.member!.user?.name || "Unknown",
            memberEmail: b.member!.user?.email || "",
            status: b.status,
          }))

        return {
          id: s.id,
          classId: s.class!.id,
          className: s.class!.name,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.class!.durationMinutes
            ? `${parseInt(s.startTime.split(":")[0]) + Math.floor(s.class!.durationMinutes / 60)}:${parseInt(s.startTime.split(":")[1])}:00`
            : s.startTime,
          room: s.room,
          maxCapacity: s.class!.maxCapacity || 20,
          bookedCount: s.bookings.length,
          color: s.class!.color || "#3b82f6",
          bookings: bookingsWithMembers,
        }
      })

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error("Get trainer schedule error:", error)
    return NextResponse.json(
      { error: "Failed to get schedule" },
      { status: 500 }
    )
  }
}
