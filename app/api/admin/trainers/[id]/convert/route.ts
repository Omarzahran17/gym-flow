import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { trainers, users, classes } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
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

    // Set trainer_id to null for all classes by this trainer
    await db.update(classes)
      .set({ trainerId: null })
      .where(eq(classes.trainerId, trainerId))

    await db.delete(trainers).where(eq(trainers.id, trainerId))

    await db.update(users)
      .set({ role: "member" })
      .where(eq(users.id, trainer.userId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Convert trainer to member error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to convert trainer to member" },
      { status: 500 }
    )
  }
}
