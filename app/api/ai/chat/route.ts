import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { generateChatResponse } from "@/lib/ai/fitness-chat"
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
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      )
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    const member = await db.query.members.findFirst({
      where: eq(members.userId, userId),
    })

    const memberData = user ? {
      name: user.name || "Member",
      fitnessLevel: "intermediate",
      goals: member?.healthNotes || undefined,
    } : undefined

    const response = await generateChatResponse({
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      memberData,
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error("AI chat error:", error)
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    )
  }
}
