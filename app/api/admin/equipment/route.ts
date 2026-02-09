import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { equipment } from "@/lib/db/schema"
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

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    let query = db.query.equipment.findMany({
      orderBy: [desc(equipment.createdAt)],
    })

    const allEquipment = await query

    // Filter in memory
    let filtered = allEquipment
    if (category) {
      filtered = filtered.filter(e => e.category === category)
    }
    if (status) {
      filtered = filtered.filter(e => e.status === status)
    }

    return NextResponse.json({ equipment: filtered })
  } catch (error) {
    console.error("Get equipment error:", error)
    return NextResponse.json(
      { error: "Failed to get equipment" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      )
    }

    const equipmentData: any = {
      name,
      category,
      status: status || "active",
    }

    if (purchaseDate) equipmentData.purchaseDate = new Date(purchaseDate)
    if (warrantyExpiry) equipmentData.warrantyExpiry = new Date(warrantyExpiry)
    if (lastMaintenance) equipmentData.lastMaintenance = new Date(lastMaintenance)
    if (nextMaintenance) equipmentData.nextMaintenance = new Date(nextMaintenance)
    if (qrCode) equipmentData.qrCode = qrCode

    const [newEquipment] = await db.insert(equipment).values(equipmentData).returning()

    return NextResponse.json({ equipment: newEquipment }, { status: 201 })
  } catch (error) {
    console.error("Create equipment error:", error)
    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 }
    )
  }
}