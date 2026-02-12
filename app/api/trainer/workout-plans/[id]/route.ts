import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { workoutPlans, planExercises, workoutPlanAssignments } from "@/lib/db/schema"
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

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const planId = parseInt(id)

    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    const plan = await db.query.workoutPlans.findFirst({
      where: eq(workoutPlans.id, planId),
      with: {
        assignments: {
          with: {
            member: true,
          },
        },
        exercises: {
          with: {
            exercise: true,
          },
          orderBy: [planExercises.orderIndex],
        },
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    const planWithMembers = {
      ...plan,
      members: plan.assignments?.map(a => a.member) || [],
    }

    return NextResponse.json({ plan: planWithMembers })
  } catch (error) {
    console.error("Get workout plan error:", error)
    return NextResponse.json(
      { error: "Failed to get workout plan" },
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

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const planId = parseInt(id)

    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, startDate, endDate, isActive, exercises: planExercisesList } = body

    // Update plan
    const updateData: any = {
      name,
      description,
      isActive: isActive !== undefined ? isActive : true,
    }
    
    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null
    }
    
    const [plan] = await db.update(workoutPlans)
      .set(updateData)
      .where(eq(workoutPlans.id, planId))
      .returning()

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Delete existing exercises and re-add
    if (planExercisesList) {
      await db.delete(planExercises).where(eq(planExercises.planId, planId))
      
      if (planExercisesList.length > 0) {
        await db.insert(planExercises).values(
          planExercisesList.map((ex: any, index: number) => ({
            planId: planId,
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
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Update workout plan error:", error)
    return NextResponse.json(
      { error: "Failed to update workout plan" },
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

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const planId = parseInt(id)

    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    const [plan] = await db.delete(workoutPlans)
      .where(eq(workoutPlans.id, planId))
      .returning()

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete workout plan error:", error)
    return NextResponse.json(
      { error: "Failed to delete workout plan" },
      { status: 500 }
    )
  }
}
