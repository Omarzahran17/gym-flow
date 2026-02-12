import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members } from "@/lib/db/schema"
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

    const allMembers = await db.query.members.findMany({
      orderBy: [desc(members.createdAt)],
      with: {
        user: true,
      },
    })

    const formattedMembers = allMembers.map((member) => ({
      ...member,
      email: member.user?.email || null,
      role: member.user?.role || "member",
      firstName: member.user?.name?.split(" ")[0] || null,
      lastName: member.user?.name?.split(" ").slice(1).join(" ") || null,
    }))

    return NextResponse.json({ members: formattedMembers })
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
