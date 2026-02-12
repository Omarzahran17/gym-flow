import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, trainers } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify trainer exists
    const trainer = await db.query.trainers.findFirst({
      where: eq(trainers.userId, session.user.id),
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer profile not found" }, { status: 404 })
    }

    // Get all members with their user details and workout plan assignments
    const allMembers = await db.query.members.findMany({
      orderBy: [desc(members.createdAt)],
      with: {
        user: true,
        assignedWorkoutPlans: {
          with: {
            plan: true,
          },
        },
      },
    })

    // Map to include counts and active plan status
    const formattedMembers = allMembers.map((m) => {
      const plans = m.assignedWorkoutPlans.map((a) => a.plan)
      const activePlan = plans.find((p) => p?.isActive) || null

      return {
        ...m,
        assignedPlans: plans.length,
        activePlan: activePlan,
      }
    })

    return NextResponse.json({ members: formattedMembers })
  } catch (error) {
    console.error("Get members error:", error)
    return NextResponse.json(
      { error: "Failed to get members" },
      { status: 500 }
    )
  }
}
