import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, trainers, workoutPlans } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
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

    if (!trainer) {
      return NextResponse.json({ error: "Trainer profile not found" }, { status: 404 })
    }

    const trainerWorkoutPlans = await db.query.workoutPlans.findMany({
      where: eq(workoutPlans.trainerId, trainer.id),
      orderBy: [desc(workoutPlans.createdAt)],
    })

    if (trainerWorkoutPlans.length === 0) {
      return NextResponse.json({ members: [] })
    }

    const membersList = await db.query.members.findMany({
      orderBy: [members.createdAt],
    })

    const membersWithPlans = membersList.map(member => {
      const memberAssignments = trainerWorkoutPlans.filter(plan => 
        plan.assignments?.some(a => a.memberId === member.id)
      )
      const activePlan = memberAssignments.find(plan => plan.isActive)

      return {
        ...member,
        assignedPlans: memberAssignments.length,
        activePlan: activePlan ? {
          id: activePlan.id,
          name: activePlan.name,
          isActive: activePlan.isActive,
        } : null,
      }
    })

    return NextResponse.json({ members: membersWithPlans })
  } catch (error) {
    console.error("Get members error:", error)
    return NextResponse.json(
      { error: "Failed to get members" },
      { status: 500 }
    )
  }
}
