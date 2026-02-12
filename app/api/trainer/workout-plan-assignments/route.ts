import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { workoutPlanAssignments, workoutPlans } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { planId, memberIds } = body

    if (!planId || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: "Plan ID and at least one member ID are required" },
        { status: 400 }
      )
    }

    const assignments = []
    for (const memberId of memberIds) {
      const [assignment] = await db.insert(workoutPlanAssignments).values({
        planId,
        memberId: parseInt(memberId),
      }).returning()
      assignments.push(assignment)
    }

    return NextResponse.json({ assignments }, { status: 201 })
  } catch (error) {
    console.error("Assign workout plan error:", error)
    return NextResponse.json(
      { error: "Failed to assign workout plan" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId")

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
    }

    const assignments = await db.query.workoutPlanAssignments.findMany({
      where: eq(workoutPlanAssignments.planId, parseInt(planId)),
      with: {
        member: true,
      },
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error("Get assignments error:", error)
    return NextResponse.json(
      { error: "Failed to get assignments" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId")
    const memberId = searchParams.get("memberId")

    if (!planId || !memberId) {
      return NextResponse.json(
        { error: "Plan ID and member ID are required" },
        { status: 400 }
      )
    }

    await db.delete(workoutPlanAssignments).where(
      and(
        eq(workoutPlanAssignments.planId, parseInt(planId)),
        eq(workoutPlanAssignments.memberId, parseInt(memberId))
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove assignment error:", error)
    return NextResponse.json(
      { error: "Failed to remove assignment" },
      { status: 500 }
    )
  }
}
