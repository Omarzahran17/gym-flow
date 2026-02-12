import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"
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

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        await db.delete(contactMessages).where(eq(contactMessages.id, parseInt(id)))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete contact message error:", error)
        return NextResponse.json(
            { error: "Failed to delete message" },
            { status: 500 }
        )
    }
}
