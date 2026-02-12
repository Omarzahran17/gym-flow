import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, trainers, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      console.log("Convert member to trainer: Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const memberId = parseInt(id)

    console.log(`Converting member ${memberId} to trainer`)

    const member = await db.query.members.findFirst({
      where: eq(members.id, memberId),
    })

    if (!member) {
      console.log(`Member ${memberId} not found`)
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    console.log(`Found member: ${member.userId}`)

    const existingTrainer = await db.query.trainers.findFirst({
      where: eq(trainers.userId, member.userId),
    })

    if (existingTrainer) {
      console.log(`User ${member.userId} is already a trainer`)
      return NextResponse.json({ error: "User is already a trainer" }, { status: 400 })
    }

    console.log(`Creating trainer record for user ${member.userId}`)
    const [newTrainer] = await db.insert(trainers).values({
      userId: member.userId,
      specialization: "General Fitness",
      maxClients: 20,
    }).returning()

    console.log(`Updating user ${member.userId} role to trainer`)
    await db.update(users)
      .set({ role: "trainer" })
      .where(eq(users.id, member.userId))

    console.log(`Deleting member record ${memberId}`)
    await db.delete(members).where(eq(members.id, memberId))

    console.log(`Successfully converted member ${memberId} to trainer ${newTrainer.id}`)
    return NextResponse.json({ success: true, trainerId: newTrainer.id })
  } catch (error) {
    console.error("Convert member to trainer error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to convert member to trainer" },
      { status: 500 }
    )
  }
}
