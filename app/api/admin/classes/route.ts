import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { classes, trainers, members } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allClasses = await db.query.classes.findMany({
      with: {
        trainer: {
          with: {
            user: true,
          },
        },
      },
      orderBy: [desc(classes.createdAt)],
    })

    const formattedClasses = allClasses.map(cls => ({
      ...cls,
      trainer: cls.trainer ? {
        ...cls.trainer,
        name: cls.trainer.user?.name || cls.trainer.userId,
        email: cls.trainer.user?.email || null,
      } : null,
    }))

    return NextResponse.json({ classes: formattedClasses })
  } catch (error) {
    console.error("Get classes error:", error)
    return NextResponse.json(
      { error: "Failed to get classes" },
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
    const { name, description, maxCapacity, durationMinutes, trainerId, color } = body

    if (!name) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 }
      )
    }

    const [newClass] = await db.insert(classes).values({
      name,
      description: description || "",
      maxCapacity: maxCapacity || 20,
      durationMinutes: durationMinutes || 60,
      trainerId: trainerId || null,
      color: color || "#3b82f6",
    }).returning()

    return NextResponse.json({ class: newClass }, { status: 201 })
  } catch (error) {
    console.error("Create class error:", error)
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    )
  }
}