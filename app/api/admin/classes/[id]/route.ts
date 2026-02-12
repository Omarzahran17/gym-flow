import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { classes, trainers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const classId = parseInt(id)

    const classData = await db.query.classes.findFirst({
      where: eq(classes.id, classId),
      with: {
        trainer: {
          with: {
            user: true,
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    const formattedClass = {
      ...classData,
      trainer: classData.trainer ? {
        ...classData.trainer,
        name: classData.trainer.user?.name || classData.trainer.userId,
        email: classData.trainer.user?.email || null,
      } : null,
    }

    return NextResponse.json({ class: formattedClass })
  } catch (error) {
    console.error("Get class error:", error)
    return NextResponse.json(
      { error: "Failed to get class" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const classId = parseInt(id)
    const body = await request.json()

    const [updatedClass] = await db.update(classes)
      .set({
        name: body.name,
        description: body.description,
        trainerId: body.trainerId,
        maxCapacity: body.maxCapacity,
        durationMinutes: body.durationMinutes,
        color: body.color,
      })
      .where(eq(classes.id, classId))
      .returning()

    return NextResponse.json({ class: updatedClass })
  } catch (error) {
    console.error("Update class error:", error)
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const classId = parseInt(id)

    const [deleted] = await db.delete(classes)
      .where(eq(classes.id, classId))
      .returning()

    if (!deleted) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete class error:", error)
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    )
  }
}
