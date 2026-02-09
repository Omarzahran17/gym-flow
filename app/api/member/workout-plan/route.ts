import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { workoutPlans, planExercises, members } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get member from user
    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Get active workout plan for member
    const plan = await db.query.workoutPlans.findFirst({
      where: and(
        eq(workoutPlans.memberId, member.id),
        eq(workoutPlans.isActive, true)
      ),
      with: {
        exercises: {
          with: {
            exercise: true,
          },
          orderBy: [planExercises.orderIndex],
        },
        trainer: true,
      },
    })

    if (!plan) {
      return NextResponse.json({ plan: null })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Get member workout plan error:", error)
    return NextResponse.json(
      { error: "Failed to get workout plan" },
      { status: 500 }
    )
  }
}
