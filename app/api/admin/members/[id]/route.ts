import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { 
  members, 
  users,
  trainers,
  attendance, 
  workoutPlanAssignments,
  memberSubscriptions,
  measurements,
  progressPhotos,
  personalRecords,
  memberAchievements,
  classBookings,
  session as userSession,
  account
} from "@/lib/db/schema"
import { eq, desc, and, sql } from "drizzle-orm"
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const memberWorkouts = await db.query.workoutPlanAssignments.findMany({
      where: eq(workoutPlanAssignments.memberId, memberId),
    })

    const recentAttendance = await db.query.attendance.findMany({
      where: and(
        eq(attendance.memberId, memberId),
        sql`${attendance.date} >= ${todayStr}`
      ),
      orderBy: [desc(attendance.checkInTime)],
      limit: 30,
    })

    const totalWorkouts = memberWorkouts.length
    const attendanceRate = recentAttendance.length > 0
      ? Math.round((recentAttendance.length / 30) * 100)
      : 0

    const joinDate = member.joinDate ? new Date(member.joinDate) : new Date()
    const now = new Date()
    const months = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    const memberSince = `${months} months`

    return NextResponse.json({
      member: {
        ...member,
        email: `${member.userId}@example.com`,
        firstName: member.userId.split("_")[0] || "",
        lastName: member.userId.split("_")[1] || "",
      },
      stats: {
        totalWorkouts,
        attendanceRate,
        memberSince,
      },
    })
  } catch (error) {
    console.error("Get member error:", error)
    return NextResponse.json(
      { error: "Failed to get member" },
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
    const memberId = parseInt(id)
    const body = await request.json()

    if (isNaN(memberId)) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 })
    }

    const [updatedMember] = await db.update(members)
      .set({
        phone: body.phone,
        emergencyContact: body.emergencyContact,
        healthNotes: body.healthNotes,
        status: body.status,
      })
      .where(eq(members.id, memberId))
      .returning()

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error("Update member error:", error)
    return NextResponse.json(
      { error: "Failed to update member" },
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

    const userId = member.userId

    await db.transaction(async (tx) => {
      // Delete all related member records first (to handle foreign key constraints)
      await tx.delete(memberSubscriptions).where(eq(memberSubscriptions.memberId, memberId))
      await tx.delete(attendance).where(eq(attendance.memberId, memberId))
      await tx.delete(workoutPlanAssignments).where(eq(workoutPlanAssignments.memberId, memberId))
      await tx.delete(measurements).where(eq(measurements.memberId, memberId))
      await tx.delete(progressPhotos).where(eq(progressPhotos.memberId, memberId))
      await tx.delete(personalRecords).where(eq(personalRecords.memberId, memberId))
      await tx.delete(memberAchievements).where(eq(memberAchievements.memberId, memberId))
      await tx.delete(classBookings).where(eq(classBookings.memberId, memberId))

      // Delete the member record
      await tx.delete(members).where(eq(members.id, memberId))

      // Check if user is also a trainer and delete trainer record
      const trainer = await tx.query.trainers.findFirst({
        where: eq(trainers.userId, userId),
      })
      if (trainer) {
        await tx.delete(trainers).where(eq(trainers.id, trainer.id))
      }

      // Delete better-auth related records
      await tx.delete(userSession).where(eq(userSession.userId, userId))
      await tx.delete(account).where(eq(account.userId, userId))

      // Delete the user record (this will cascade delete sessions, accounts, etc.)
      await tx.delete(users).where(eq(users.id, userId))
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete member error:", error)
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    )
  }
}
