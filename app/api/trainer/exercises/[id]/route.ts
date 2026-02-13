import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { exercises, planExercises } from "@/lib/db/schema"
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

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const exerciseId = parseInt(id)

    if (isNaN(exerciseId)) {
      return NextResponse.json({ error: "Invalid exercise ID" }, { status: 400 })
    }

    const exercise = await db.query.exercises.findFirst({
      where: eq(exercises.id, exerciseId),
    })

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 })
    }

    return NextResponse.json({ exercise })
  } catch (error) {
    console.error("Get exercise error:", error)
    return NextResponse.json(
      { error: "Failed to get exercise" },
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

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const exerciseId = parseInt(id)

    if (isNaN(exerciseId)) {
      return NextResponse.json({ error: "Invalid exercise ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, category, muscleGroup, description, defaultVideoUrl } = body

    const [exercise] = await db.update(exercises)
      .set({
        name,
        category,
        muscleGroup,
        description,
        defaultVideoUrl,
      })
      .where(eq(exercises.id, exerciseId))
      .returning()

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 })
    }

    return NextResponse.json({ exercise })
  } catch (error) {
    console.error("Update exercise error:", error)
    return NextResponse.json(
      { error: "Failed to update exercise" },
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

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const exerciseId = parseInt(id)

    if (isNaN(exerciseId)) {
      return NextResponse.json({ error: "Invalid exercise ID" }, { status: 400 })
    }

    // Delete related plan exercises first
    await db.delete(planExercises).where(eq(planExercises.exerciseId, exerciseId))

    const [exercise] = await db.delete(exercises)
      .where(eq(exercises.id, exerciseId))
      .returning()

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete exercise error:", error)
    return NextResponse.json(
      { error: "Failed to delete exercise" },
      { status: 500 }
    )
  }
}
