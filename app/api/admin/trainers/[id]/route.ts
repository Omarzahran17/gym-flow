import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { trainers, users, workoutPlans } from "@/lib/db/schema"
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
    const trainerId = parseInt(id)

    const trainer = await db.query.trainers.findFirst({
      where: eq(trainers.id, trainerId),
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    return NextResponse.json({ trainer })
  } catch (error) {
    console.error("Get trainer error:", error)
    return NextResponse.json(
      { error: "Failed to get trainer" },
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
    const trainerId = parseInt(id)
    const body = await request.json()

    const [updatedTrainer] = await db.update(trainers)
      .set({
        bio: body.bio,
        specialization: body.specialization,
        certifications: body.certifications,
        maxClients: body.maxClients,
        hourlyRate: body.hourlyRate,
      })
      .where(eq(trainers.id, trainerId))
      .returning()

    return NextResponse.json({ trainer: updatedTrainer })
  } catch (error) {
    console.error("Update trainer error:", error)
    return NextResponse.json(
      { error: "Failed to update trainer" },
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
    const trainerId = parseInt(id)

    await db.delete(workoutPlans)
      .where(eq(workoutPlans.trainerId, trainerId))

    const [deleted] = await db.delete(trainers)
      .where(eq(trainers.id, trainerId))
      .returning()

    if (!deleted) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete trainer error:", error)
    return NextResponse.json(
      { error: "Failed to delete trainer" },
      { status: 500 }
    )
  }
}
