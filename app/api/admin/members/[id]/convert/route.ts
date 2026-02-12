import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  members,
  trainers,
  users,
  memberSubscriptions,
  attendance,
  workoutPlanAssignments,
  measurements,
  progressPhotos,
  personalRecords,
  memberAchievements,
  classBookings
} from "@/lib/db/schema"
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
    const userId = id

    // Find member by userId
    const member = await db.query.members.findFirst({
      where: eq(members.userId, userId),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const existingTrainer = await db.query.trainers.findFirst({
      where: eq(trainers.userId, userId),
    })

    if (existingTrainer) {
      return NextResponse.json({ error: "User is already a trainer" }, { status: 400 })
    }

    const result = await db.transaction(async (tx) => {
      console.log("Starting conversion for member:", member.id, "userId:", userId)
      
      // 1. Create trainer record
      console.log("Creating trainer record with userId:", userId)
      const [newTrainer] = await tx.insert(trainers).values({
        userId: userId,
        specialization: "General Fitness",
        maxClients: 20,
      }).returning()
      console.log("Trainer created with ID:", newTrainer.id)

      // 2. Update user role in users table
      console.log("Updating user role to trainer for userId:", userId)
      await tx.update(users)
        .set({ role: "trainer" })
        .where(eq(users.id, userId))

      // 3. Clean up related records to avoid FK constraints
      console.log("Cleaning up member-related records...")
      await tx.delete(memberSubscriptions).where(eq(memberSubscriptions.memberId, member.id))
      await tx.delete(attendance).where(eq(attendance.memberId, member.id))
      await tx.delete(workoutPlanAssignments).where(eq(workoutPlanAssignments.memberId, member.id))
      await tx.delete(measurements).where(eq(measurements.memberId, member.id))
      await tx.delete(progressPhotos).where(eq(progressPhotos.memberId, member.id))
      await tx.delete(personalRecords).where(eq(personalRecords.memberId, member.id))
      await tx.delete(memberAchievements).where(eq(memberAchievements.memberId, member.id))
      await tx.delete(classBookings).where(eq(classBookings.memberId, member.id))

      // 4. Delete member record
      console.log("Deleting member record:", member.id)
      await tx.delete(members).where(eq(members.id, member.id))

      console.log("Conversion completed successfully")
      return newTrainer
    })

    return NextResponse.json({ success: true, trainerId: result.id })
  } catch (error) {
    console.error("Convert member to trainer error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to convert member to trainer" },
      { status: 500 }
    )
  }
}
