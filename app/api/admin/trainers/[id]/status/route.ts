import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { trainers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
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
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 })
    }

    const [updatedTrainer] = await db.update(trainers)
      .set({
        isActive: isActive,
        updatedAt: new Date(),
      })
      .where(eq(trainers.id, trainerId))
      .returning()

    if (!updatedTrainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    return NextResponse.json({ trainer: updatedTrainer })
  } catch (error) {
    console.error("Update trainer status error:", error)
    return NextResponse.json(
      { error: "Failed to update trainer status" },
      { status: 500 }
    )
  }
}
