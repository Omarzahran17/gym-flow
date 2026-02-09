import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { workoutPlans, planExercises, trainers } from "@/lib/db/schema"
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

    // Get trainer ID from user
    const trainer = await db.query.trainers.findFirst({
      where: eq(trainers.userId, session.user.id),
    })

    const plans = await db.query.workoutPlans.findMany({
      where: eq(workoutPlans.trainerId, trainer?.id || 0),
      with: {
        member: true,
        exercises: {
          with: {
            exercise: true,
          },
        },
      },
      orderBy: [desc(workoutPlans.createdAt)],
    })

    return NextResponse.json({ plans })
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

    // Get trainer ID from user
    const trainer = await db.query.trainers.findFirst({
      where: eq(trainers.userId, session.user.id),
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, memberId, startDate, endDate, exercises: planExercisesList } = body

    if (!name || !memberId) {
      return NextResponse.json(
        { error: "Name and member are required" },
        { status: 400 }
      )
    }

    // Create workout plan
    const planData: any = {
      trainerId: trainer.id,
      memberId,
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

    // Add exercises to plan
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
