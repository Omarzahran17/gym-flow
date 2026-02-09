import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { exercises } from "@/lib/db/schema"
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

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const muscleGroup = searchParams.get("muscleGroup")

    let query = db.query.exercises.findMany({
      orderBy: [desc(exercises.createdAt)],
    })

    const allExercises = await query

    // Filter in memory since Drizzle query doesn't support where clauses well with findMany
    let filteredExercises = allExercises
    if (category) {
      filteredExercises = filteredExercises.filter(e => e.category === category)
    }
    if (muscleGroup) {
      filteredExercises = filteredExercises.filter(e => e.muscleGroup === muscleGroup)
    }

    return NextResponse.json({ exercises: filteredExercises })
  } catch (error) {
    console.error("Get exercises error:", error)
    return NextResponse.json(
      { error: "Failed to get exercises" },
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

    const body = await request.json()
    const { name, category, muscleGroup, description, defaultVideoUrl } = body

    if (!name || !category || !muscleGroup) {
      return NextResponse.json(
        { error: "Name, category, and muscle group are required" },
        { status: 400 }
      )
    }

    const [exercise] = await db.insert(exercises).values({
      name,
      category,
      muscleGroup,
      description: description || "",
      defaultVideoUrl: defaultVideoUrl || null,
    }).returning()

    return NextResponse.json({ exercise }, { status: 201 })
  } catch (error) {
    console.error("Create exercise error:", error)
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    )
  }
}
