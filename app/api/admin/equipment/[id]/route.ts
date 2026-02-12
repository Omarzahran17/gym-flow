import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { equipment, equipmentMaintenance } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
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
    const equipmentId = parseInt(id)

    if (isNaN(equipmentId)) {
      return NextResponse.json({ error: "Invalid equipment ID" }, { status: 400 })
    }

    const item = await db.query.equipment.findFirst({
      where: eq(equipment.id, equipmentId),
      with: {
        maintenance: true,
      },
    })

    if (!item) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
    }

    return NextResponse.json({ equipment: item })
  } catch (error) {
    console.error("Get equipment error:", error)
    return NextResponse.json(
      { error: "Failed to get equipment" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const equipmentId = parseInt(id)

    if (isNaN(equipmentId)) {
      return NextResponse.json({ error: "Invalid equipment ID" }, { status: 400 })
    }

    const body = await request.json()
    const { 
      name, 
      category, 
      purchaseDate, 
      warrantyExpiry, 
      lastMaintenance, 
      nextMaintenance,
      status,
      qrCode 
    } = body

    const updateData: any = {}
    
    if (name) updateData.name = name
    if (category) updateData.category = category
    if (status) updateData.status = status
    if (purchaseDate) updateData.purchaseDate = new Date(purchaseDate)
    if (warrantyExpiry) updateData.warrantyExpiry = new Date(warrantyExpiry)
    if (lastMaintenance) updateData.lastMaintenance = new Date(lastMaintenance)
    if (nextMaintenance) updateData.nextMaintenance = new Date(nextMaintenance)
    if (qrCode !== undefined) updateData.qrCode = qrCode

    const [updated] = await db.update(equipment)
      .set(updateData)
      .where(eq(equipment.id, equipmentId))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
    }

    return NextResponse.json({ equipment: updated })
  } catch (error) {
    console.error("Update equipment error:", error)
    return NextResponse.json(
      { error: "Failed to update equipment" },
      { status: 500 }
    )
  }
}

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
    const equipmentId = parseInt(id)

    if (isNaN(equipmentId)) {
      return NextResponse.json({ error: "Invalid equipment ID" }, { status: 400 })
    }

    await db.delete(equipmentMaintenance).where(eq(equipmentMaintenance.equipmentId, equipmentId))

    const [deleted] = await db.delete(equipment)
      .where(eq(equipment.id, equipmentId))
      .returning()

    if (!deleted) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete equipment error:", error)
    return NextResponse.json(
      { error: "Failed to delete equipment" },
      { status: 500 }
    )
  }
}