import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { progressPhotos, members } from "@/lib/db/schema"
import { checkAchievements } from "@/lib/achievements"
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

    const photos = await db.query.progressPhotos.findMany({
      where: eq(progressPhotos.memberId, member.id),
      orderBy: [desc(progressPhotos.date)],
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error("Get progress photos error:", error)
    return NextResponse.json(
      { error: "Failed to get progress photos" },
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

    const body = await request.json()
    const { date, url, blobUrl, type, notes, memberId } = body

    let targetMemberId: number

    if ((session.user as any).role === "trainer") {
      if (!memberId) {
        return NextResponse.json({ error: "Member ID is required for trainers" }, { status: 400 })
      }
      targetMemberId = parseInt(memberId)
    } else {
      // Get member from user
      const member = await db.query.members.findFirst({
        where: eq(members.userId, session.user.id),
      })

      if (!member) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 })
      }
      targetMemberId = member.id
    }

    if (!date || !url) {
      return NextResponse.json(
        { error: "Date and URL are required" },
        { status: 400 }
      )
    }

    console.log("Creating progress photo for member:", targetMemberId, "date:", date)

    const photoData: any = {
      memberId: targetMemberId,
      date: new Date(date),
      url,
      type: type || "progress",
    }

    if (blobUrl) photoData.blobUrl = blobUrl
    if (notes) photoData.notes = notes

    const [photo] = await db.insert(progressPhotos).values(photoData).returning()

    // Check for achievements after uploading progress photo
    await checkAchievements(targetMemberId)

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error("Create progress photo error:", error)
    return NextResponse.json(
      { error: "Failed to create progress photo" },
      { status: 500 }
    )
  }
}
