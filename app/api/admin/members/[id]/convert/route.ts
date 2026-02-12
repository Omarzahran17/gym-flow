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
    const memberId = parseInt(id)

    if (isNaN(memberId)) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 })
    }

    const member = await db.query.members.findFirst({
      where: eq(members.id, memberId),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const existingTrainer = await db.query.trainers.findFirst({
      where: eq(trainers.userId, member.userId),
    })

    if (existingTrainer) {
      return NextResponse.json({ error: "User is already a trainer" }, { status: 400 })
    }

    const result = await db.transaction(async (tx) => {
      // 1. Create trainer record
      const [newTrainer] = await tx.insert(trainers).values({
        userId: member.userId,
        specialization: "General Fitness",
        maxClients: 20,
      }).returning()

      // 2. Update user role in users table
      await tx.update(users)
        .set({ role: "trainer" })
        .where(eq(users.id, member.userId))

      // 3. Clean up related records to avoid FK constraints
      await tx.delete(memberSubscriptions).where(eq(memberSubscriptions.memberId, memberId))
      await tx.delete(attendance).where(eq(attendance.memberId, memberId))
      await tx.delete(workoutPlanAssignments).where(eq(workoutPlanAssignments.memberId, memberId))
      await tx.delete(measurements).where(eq(measurements.memberId, memberId))
      await tx.delete(progressPhotos).where(eq(progressPhotos.memberId, memberId))
      await tx.delete(personalRecords).where(eq(personalRecords.memberId, memberId))
      await tx.delete(memberAchievements).where(eq(memberAchievements.memberId, memberId))
      await tx.delete(classBookings).where(eq(classBookings.memberId, memberId))

      // 4. Delete member record
      await tx.delete(members).where(eq(members.id, memberId))

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
