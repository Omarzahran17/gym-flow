import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { trainers, members, workoutPlans, workoutPlanAssignments, planExercises, exercises, attendance, memberAchievements, achievements } from "@/lib/db/schema"
import { eq, and, desc, inArray } from "drizzle-orm"
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
    const memberIdNum = parseInt(id)

    const trainer = await db.query.trainers.findFirst({
      where: eq(trainers.userId, session.user.id),
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const memberAssignments = await db.query.workoutPlanAssignments.findMany({
      where: and(
        eq(workoutPlanAssignments.memberId, memberIdNum),
      ),
    })

    if (memberAssignments.length === 0) {
      return NextResponse.json({ error: "Member not found or not assigned to you" }, { status: 404 })
    }

    const planIds = memberAssignments.map(a => a.planId).filter((id): id is number => typeof id === 'number')

    let memberPlans: any[] = []

    if (planIds.length > 0) {
      memberPlans = await db.query.workoutPlans.findMany({
        where: and(
          inArray(workoutPlans.id, planIds),
          eq(workoutPlans.trainerId, trainer.id)
        ),
        with: {
          exercises: {
            with: {
              exercise: true,
            },
          },
        },
        orderBy: [desc(workoutPlans.createdAt)],
      })
    }

    const member = await db.query.members.findFirst({
      where: eq(members.id, memberIdNum),
      with: {
        user: true,
        achievements: {
          with: {
            achievement: true,
          },
          orderBy: [desc(memberAchievements.earnedAt)],
          limit: 10,
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const allAttendance = await db.query.attendance.findMany({
      where: eq(attendance.memberId, memberIdNum),
    })

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentAttendance = allAttendance.filter(
      (a) => a.checkInTime && new Date(a.checkInTime) >= thirtyDaysAgo
    )
    const attendanceRate = Math.round((recentAttendance.length / 30) * 100)

    const formattedMember = {
      id: member.id,
      name: member.user?.name || member.userId,
      email: member.user?.email || null,
      phone: member.phone,
      status: member.status,
      joinDate: member.joinDate,
      workoutPlans: memberPlans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        isActive: plan.isActive,
        startDate: plan.startDate,
        exercises: plan.exercises.map((pe: any) => ({
          id: pe.id,
          exerciseId: pe.exerciseId,
          exerciseName: pe.exercise?.name || "Unknown",
          sets: pe.sets,
          reps: pe.reps,
        })),
      })),
      stats: {
        totalWorkouts: allAttendance.length,
        attendanceRate: Math.min(attendanceRate, 100),
      },
      achievements: member.achievements.map((ma) => ({
        id: ma.achievementId,
        name: ma.achievement?.name || "Achievement",
        icon: ma.achievement?.icon,
        earnedAt: ma.earnedAt,
      })),
    }

    return NextResponse.json({ member: formattedMember })
  } catch (error) {
    console.error("Get trainer member error:", error)
    return NextResponse.json(
      { error: "Failed to get member" },
      { status: 500 }
    )
  }
}
