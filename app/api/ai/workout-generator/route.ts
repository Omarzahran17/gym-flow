import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { exercises } from "@/lib/db/schema"
import { generateWorkoutPlan } from "@/lib/ai/workout-generator"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || ((session.user as any).role !== "trainer" && (session.user as any).role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { goals, fitnessLevel, injuries, equipment, experienceLevel } = body

    if (!goals || !fitnessLevel || !experienceLevel) {
      return NextResponse.json(
        { error: "Goals, fitness level, and experience level are required" },
        { status: 400 }
      )
    }

    const availableExercises = await db.query.exercises.findMany()

    if (availableExercises.length === 0) {
      return NextResponse.json(
        { error: "No exercises available in the exercise library. Please add exercises first." },
        { status: 400 }
      )
    }

    const workoutPlan = await generateWorkoutPlan({
      goals,
      fitnessLevel,
      injuries: injuries || "",
      equipment: equipment || "",
      experienceLevel,
      availableExercises: availableExercises.map(e => ({
        name: e.name,
        category: e.category || "",
        muscleGroup: e.muscleGroup || "",
      })),
    })

    return NextResponse.json({ workoutPlan })
  } catch (error) {
    console.error("AI workout generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate workout plan" },
      { status: 500 }
    )
  }
}
