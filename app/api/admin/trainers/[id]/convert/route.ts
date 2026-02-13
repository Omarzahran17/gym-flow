import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { trainers, users, classes, members, workoutPlans, trainerAttendance } from "@/lib/db/schema"
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

    const result = await db.transaction(async (tx) => {
      console.log("Starting conversion for trainer:", trainerId, "userId:", trainer.userId)
      
      // 1. Create member record
      console.log("Creating member record with userId:", trainer.userId)
      const [newMember] = await tx.insert(members).values({
        userId: trainer.userId,
        status: "active",
      }).returning()
      console.log("Member created with ID:", newMember.id)

      // 2. Update user role in users table
      console.log("Updating user role to member for userId:", trainer.userId)
      await tx.update(users)
        .set({ role: "member" })
        .where(eq(users.id, trainer.userId))

      // 3. Set trainer_id to null for all classes by this trainer
      console.log("Clearing trainer from classes...")
      await tx.update(classes)
        .set({ trainerId: null })
        .where(eq(classes.trainerId, trainerId))

      // 4. Set trainer_id to null for all workout plans by this trainer
      console.log("Clearing trainer from workout plans...")
      await tx.update(workoutPlans)
        .set({ trainerId: null })
        .where(eq(workoutPlans.trainerId, trainerId))

      // 5. Delete trainer attendance records
      console.log("Deleting trainer attendance records...")
      await tx.delete(trainerAttendance).where(eq(trainerAttendance.trainerId, trainerId))

      // 6. Delete trainer record
      console.log("Deleting trainer record:", trainerId)
      await tx.delete(trainers).where(eq(trainers.id, trainerId))

      console.log("Conversion completed successfully")
      return newMember
    })

    return NextResponse.json({ success: true, memberId: result.id })
  } catch (error) {
    console.error("Convert trainer to member error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to convert trainer to member" },
      { status: 500 }
    )
  }
}
