import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { classes, classSchedules } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    let schedules
    if (classId) {
      schedules = await db.query.classSchedules.findMany({
        where: eq(classSchedules.classId, parseInt(classId)),
        with: {
          class: true,
        },
      })
    } else {
      schedules = await db.query.classSchedules.findMany({
        with: {
          class: true,
        },
      })
    }

    return NextResponse.json({ schedules })
  } catch (error) {
    console.error("Get class schedules error:", error)
    return NextResponse.json(
      { error: "Failed to get class schedules" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { classId, dayOfWeek, startTime, room } = body

    if (!classId || dayOfWeek === undefined || !startTime) {
      return NextResponse.json(
        { error: "Class ID, day of week, and start time are required" },
        { status: 400 }
      )
    }

    const [schedule] = await db.insert(classSchedules).values({
      classId,
      dayOfWeek,
      startTime,
      room: room || "Main Studio",
    }).returning()

    return NextResponse.json({ schedule }, { status: 201 })
  } catch (error) {
    console.error("Create class schedule error:", error)
    return NextResponse.json(
      { error: "Failed to create class schedule" },
      { status: 500 }
    )
  }
}