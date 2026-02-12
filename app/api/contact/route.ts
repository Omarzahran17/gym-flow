import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    const [newMessage] = await db.insert(contactMessages).values({
      name,
      email,
      message,
      status: "new",
    }).returning()

    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error) {
    console.error("Contact message error:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
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
