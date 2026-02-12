import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"
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

    const messages = await db.query.contactMessages.findMany({
      orderBy: [desc(contactMessages.createdAt)],
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Get contact messages error:", error)
    return NextResponse.json(
      { error: "Failed to get messages" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" },
        { status: 400 }
      )
    }

    await db.update(contactMessages)
      .set({ status })
      .where(eq(contactMessages.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update contact message error:", error)
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    )
  }
}
