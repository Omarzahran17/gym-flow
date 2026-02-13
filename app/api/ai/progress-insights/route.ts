import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { measurements, personalRecords, members } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { generateProgressInsights } from "@/lib/ai/progress-insights"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "member") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { goal } = body

    const member = await db.query.members.findFirst({
      where: eq(members.userId, userId),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const memberMeasurements = await db.query.measurements.findMany({
      where: eq(measurements.memberId, member.id),
      orderBy: [desc(measurements.date)],
      limit: 20,
    })

    const memberRecords = await db.query.personalRecords.findMany({
      where: eq(personalRecords.memberId, member.id),
      orderBy: [desc(personalRecords.date)],
      limit: 20,
    })

    if (memberMeasurements.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 measurements to generate insights" },
        { status: 400 }
      )
    }

    const insights = await generateProgressInsights({
      measurements: memberMeasurements.map(m => ({
        date: m.date.toString(),
        weight: m.weight ? parseFloat(m.weight.toString()) : null,
        bodyFat: m.bodyFat ? parseFloat(m.bodyFat.toString()) : null,
        chest: m.chest ? parseFloat(m.chest.toString()) : null,
        waist: m.waist ? parseFloat(m.waist.toString()) : null,
        hips: m.hips ? parseFloat(m.hips.toString()) : null,
        arms: m.arms ? parseFloat(m.arms.toString()) : null,
        thighs: m.thighs ? parseFloat(m.thighs.toString()) : null,
      })),
      personalRecords: memberRecords.map(pr => ({
        date: pr.date.toString(),
        exerciseName: pr.exerciseName,
        weight: pr.weight ? parseFloat(pr.weight.toString()) : null,
        reps: pr.reps || null,
      })),
      goal: goal || undefined,
    })

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("AI progress insights error:", error)
    return NextResponse.json(
      { error: "Failed to generate progress insights" },
      { status: 500 }
    )
  }
}
