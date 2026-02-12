import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { classSchedules } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const scheduleId = parseInt(id)

    if (isNaN(scheduleId)) {
      return NextResponse.json(
        { error: "Invalid schedule ID" },
        { status: 400 }
      )
    }

    await db.delete(classSchedules).where(eq(classSchedules.id, scheduleId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete class schedule error:", error)
    return NextResponse.json(
      { error: "Failed to delete class schedule" },
      { status: 500 }
    )
  }
}
