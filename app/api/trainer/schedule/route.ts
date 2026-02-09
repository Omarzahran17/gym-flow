import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { trainers, classSchedules, classes, classBookings } from "@/lib/db/schema"
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
      where: eq(trainers.userId, session.user.id),
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const schedules = await db.query.classSchedules.findMany({
      where: eq(classSchedules.trainerId, trainer.id),
      with: {
        class: true,
      },
    })

    const bookings = await db.query.classBookings.findMany()

    const schedule = schedules
      .filter((s) => s.class)
      .map((s) => {
        const bookedCount = bookings.filter(
          (b) => b.scheduleId === s.id
        ).length

        return {
          id: s.id,
          classId: s.class!.id,
          className: s.class!.name,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime || "",
          room: s.room,
          maxCapacity: s.class!.maxCapacity || 20,
          bookedCount,
          color: s.class!.color || "#3b82f6",
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
