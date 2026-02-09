import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { personalRecords, members } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get member from user
    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const records = await db.query.personalRecords.findMany({
      where: eq(personalRecords.memberId, member.id),
      orderBy: [desc(personalRecords.date)],
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error("Get personal records error:", error)
    return NextResponse.json(
      { error: "Failed to get personal records" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get member from user
    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const body = await request.json()
    const { exerciseName, weight, reps, date } = body

    if (!exerciseName || !date) {
      return NextResponse.json(
        { error: "Exercise name and date are required" },
        { status: 400 }
      )
    }

    const recordData: any = {
      memberId: member.id,
      exerciseName,
      date: new Date(date),
    }
    
    if (weight) recordData.weight = parseFloat(weight)
    if (reps) recordData.reps = parseInt(reps)
    
    const [record] = await db.insert(personalRecords).values(recordData).returning()

    return NextResponse.json({ record }, { status: 201 })
  } catch (error) {
    console.error("Create personal record error:", error)
    return NextResponse.json(
      { error: "Failed to create personal record" },
      { status: 500 }
    )
  }
}
