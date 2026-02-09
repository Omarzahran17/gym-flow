import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { measurements, members } from "@/lib/db/schema"
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

    const memberMeasurements = await db.query.measurements.findMany({
      where: eq(measurements.memberId, member.id),
      orderBy: [desc(measurements.date)],
    })

    return NextResponse.json({ measurements: memberMeasurements })
  } catch (error) {
    console.error("Get measurements error:", error)
    return NextResponse.json(
      { error: "Failed to get measurements" },
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
    const { date, weight, bodyFat, chest, waist, hips, arms, thighs, notes } = body

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      )
    }

    const measurementData: any = {
      memberId: member.id,
      date: new Date(date),
    }
    
    if (weight) measurementData.weight = parseFloat(weight)
    if (bodyFat) measurementData.bodyFat = parseFloat(bodyFat)
    if (chest) measurementData.chest = parseFloat(chest)
    if (waist) measurementData.waist = parseFloat(waist)
    if (hips) measurementData.hips = parseFloat(hips)
    if (arms) measurementData.arms = parseFloat(arms)
    if (thighs) measurementData.thighs = parseFloat(thighs)
    if (notes) measurementData.notes = notes
    
    const [measurement] = await db.insert(measurements).values(measurementData).returning()

    return NextResponse.json({ measurement }, { status: 201 })
  } catch (error) {
    console.error("Create measurement error:", error)
    return NextResponse.json(
      { error: "Failed to create measurement" },
      { status: 500 }
    )
  }
}
