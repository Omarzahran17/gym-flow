import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { workoutPlans, planExercises, workoutPlanAssignments, members } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const assignment = await db.query.workoutPlanAssignments.findFirst({
      where: eq(workoutPlanAssignments.memberId, member.id),
      with: {
        plan: {
          with: {
            exercises: {
              with: {
                exercise: true,
              },
              orderBy: [planExercises.orderIndex],
            },
            trainer: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    })

    if (!assignment || !assignment.plan || !assignment.plan.isActive) {
      return NextResponse.json({ plan: null })
    }

    return NextResponse.json({ plan: assignment.plan })
  } catch (error) {
    console.error("Get member workout plan error:", error)
    return NextResponse.json(
      { error: "Failed to get workout plan" },
      { status: 500 }
    )
  }
}
