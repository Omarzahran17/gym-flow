import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { workoutPlans, planExercises, workoutPlanAssignments, trainers } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await db.query.trainers.findFirst({
      where: eq(trainers.userId, session.user.id),
    })

    const plans = await db.query.workoutPlans.findMany({
      where: eq(workoutPlans.trainerId, trainer?.id || 0),
      with: {
        assignments: {
          with: {
            member: {
              with: {
                user: true,
              },
            },
          },
        },
        exercises: {
          with: {
            exercise: true,
          },
        },
      },
      orderBy: [desc(workoutPlans.createdAt)],
    })

    const plansWithMembers = plans.map(plan => ({
      ...plan,
      members: plan.assignments.map(a => a.member),
    }))

    return NextResponse.json({ plans: plansWithMembers })
  } catch (error) {
    console.error("Get workout plans error:", error)
    return NextResponse.json(
      { error: "Failed to get workout plans" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await db.query.trainers.findFirst({
      where: eq(trainers.userId, session.user.id),
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, memberIds, startDate, endDate, exercises: planExercisesList } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const planData: any = {
      trainerId: trainer.id,
      name,
      description: description || "",
      isActive: true,
    }

    if (startDate) {
      planData.startDate = new Date(startDate)
    }
    if (endDate) {
      planData.endDate = new Date(endDate)
    }

    const [plan] = await db.insert(workoutPlans).values(planData).returning()

    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      await db.insert(workoutPlanAssignments).values(
        memberIds.map((memberId: number) => ({
          planId: plan.id,
          memberId: parseInt(memberId.toString()),
        }))
      )
    }

    if (planExercisesList && planExercisesList.length > 0) {
      await db.insert(planExercises).values(
        planExercisesList.map((ex: any, index: number) => ({
          planId: plan.id,
          exerciseId: ex.exerciseId,
          sets: ex.sets || 3,
          reps: ex.reps || "10",
          weight: ex.weight || null,
          restSeconds: ex.restSeconds || 60,
          notes: ex.notes || "",
          orderIndex: index,
        }))
      )
    }

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error("Create workout plan error:", error)
    return NextResponse.json(
      { error: "Failed to create workout plan" },
      { status: 500 }
    )
  }
}
