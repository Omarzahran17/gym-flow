import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, users, trainers } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    })

    const allMembers = await db.query.members.findMany()
    const allTrainers = await db.query.trainers.findMany()

    const membersMap = new Map(allMembers.map(m => [m.userId, m]))
    const trainersMap = new Map(allTrainers.map(t => [t.userId, t]))

    const formattedUsers = allUsers
      .filter(user => user.role === "member" || user.role === "trainer" || user.role === "admin")
      .map((user) => {
        const memberData = membersMap.get(user.id)
        const trainerData = trainersMap.get(user.id)

        return {
          id: user.id,
          userId: user.id,
          email: user.email || null,
          name: user.name || null,
          role: user.role || "member",
          isMember: !!memberData,
          isTrainer: !!trainerData,
          createdAt: user.createdAt,
          // Member info
          phone: (user as any).phone || memberData?.phone || null,
          emergencyContact: memberData?.emergencyContact || null,
          healthNotes: memberData?.healthNotes || null,
          status: memberData?.status || "active",
          joinDate: memberData?.joinDate || null,
          // Trainer info
          bio: trainerData?.bio || null,
          specialization: trainerData?.specialization || null,
          certifications: trainerData?.certifications || null,
        }
      })

    return NextResponse.json({ members: formattedUsers })
  } catch (error) {
    console.error("Get members error:", error)
    return NextResponse.json(
      { error: "Failed to get members" },
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
    const { firstName, lastName, email, phone, emergencyContact, healthNotes } = body

    // Create member record
    const [member] = await db.insert(members).values({
      userId: `${firstName}_${lastName}_${Date.now()}`, // In real app, this would be the auth user ID
      phone,
      emergencyContact,
      healthNotes,
      status: "active",
      qrCode: `GYM-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    }).returning()

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    console.error("Create member error:", error)
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    )
  }
}
