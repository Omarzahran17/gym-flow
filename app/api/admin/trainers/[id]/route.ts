import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { 
  trainers, 
  users, 
  members,
  workoutPlans,
  workoutPlanAssignments,
  memberSubscriptions,
  attendance,
  measurements,
  progressPhotos,
  personalRecords,
  memberAchievements,
  classBookings,
  session as userSession,
  account,
  verification
} from "@/lib/db/schema"
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

    const trainer = await db.query.trainers.findFirst({
      where: eq(trainers.id, trainerId),
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const userId = trainer.userId

    await db.transaction(async (tx) => {
      // Delete workout plans created by this trainer
      await tx.delete(workoutPlans).where(eq(workoutPlans.trainerId, trainerId))

      // Check if user is also a member and delete member-related records
      const member = await tx.query.members.findFirst({
        where: eq(members.userId, userId),
      })

      if (member) {
        await tx.delete(memberSubscriptions).where(eq(memberSubscriptions.memberId, member.id))
        await tx.delete(attendance).where(eq(attendance.memberId, member.id))
        await tx.delete(workoutPlanAssignments).where(eq(workoutPlanAssignments.memberId, member.id))
        await tx.delete(measurements).where(eq(measurements.memberId, member.id))
        await tx.delete(progressPhotos).where(eq(progressPhotos.memberId, member.id))
        await tx.delete(personalRecords).where(eq(personalRecords.memberId, member.id))
        await tx.delete(memberAchievements).where(eq(memberAchievements.memberId, member.id))
        await tx.delete(classBookings).where(eq(classBookings.memberId, member.id))
        
        // Delete member record
        await tx.delete(members).where(eq(members.id, member.id))
      }

      // Delete the trainer record
      await tx.delete(trainers).where(eq(trainers.id, trainerId))

      // Delete better-auth related records
      await tx.delete(userSession).where(eq(userSession.userId, userId))
      await tx.delete(account).where(eq(account.userId, userId))
      await tx.delete(verification).where(eq(verification.userId, userId))

      // Delete the user record
      await tx.delete(users).where(eq(users.id, userId))
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete trainer error:", error)
    return NextResponse.json(
      { error: "Failed to delete trainer" },
      { status: 500 }
    )
  }
}
