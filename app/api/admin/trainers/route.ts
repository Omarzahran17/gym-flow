import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { trainers, users, workoutPlans, members } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allTrainers = await db.query.trainers.findMany({
      orderBy: [desc(trainers.createdAt)],
      with: {
        user: true,
      },
    })

    const formattedTrainers = await Promise.all(
      allTrainers.map(async (trainer) => {
        const activePlans = await db.query.workoutPlans.findMany({
          where: and(
            eq(workoutPlans.trainerId, trainer.id),
            eq(workoutPlans.isActive, true)
          ),
        })

        const uniqueMemberIds = new Set(activePlans.map(p => p.memberId))

        return {
          ...trainer,
          email: trainer.user?.email || null,
          firstName: trainer.user?.name?.split(" ")[0] || null,
          lastName: trainer.user?.name?.split(" ").slice(1).join(" ") || null,
          currentClients: uniqueMemberIds.size,
        }
      })
    )

    return NextResponse.json({ trainers: formattedTrainers })
  } catch (error) {
    console.error("Get trainers error:", error)
    return NextResponse.json(
      { error: "Failed to get trainers" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email, bio, specialization, certifications, maxClients, hourlyRate } = body

    const [trainer] = await db.insert(trainers).values({
      userId: `${firstName}_${lastName}_${Date.now()}`,
      bio,
      specialization,
      certifications,
      maxClients: maxClients || 20,
      hourlyRate: hourlyRate || 50,
    }).returning()

    return NextResponse.json({ trainer }, { status: 201 })
  } catch (error) {
    console.error("Create trainer error:", error)
    return NextResponse.json(
      { error: "Failed to create trainer" },
      { status: 500 }
    )
  }
}
