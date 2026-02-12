import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")

    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 })
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    })

    return NextResponse.json({ exists: !!existingUser })
  } catch (error) {
    console.error("Check phone error:", error)
    return NextResponse.json(
      { error: "Failed to check phone" },
      { status: 500 }
    )
  }
}
