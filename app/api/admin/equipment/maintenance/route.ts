import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { equipmentMaintenance, equipment } from "@/lib/db/schema"
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
    const equipmentId = searchParams.get("equipmentId")

    if (!equipmentId) {
      return NextResponse.json(
        { error: "Equipment ID is required" },
        { status: 400 }
      )
    }

    const maintenance = await db.query.equipmentMaintenance.findMany({
      where: eq(equipmentMaintenance.equipmentId, parseInt(equipmentId)),
      orderBy: [desc(equipmentMaintenance.maintenanceDate)],
    })

    return NextResponse.json({ maintenance })
  } catch (error) {
    console.error("Get equipment maintenance error:", error)
    return NextResponse.json(
      { error: "Failed to get maintenance records" },
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
    const { equipmentId, maintenanceDate, description, cost, performedBy } = body

    if (!equipmentId || !maintenanceDate || !description) {
      return NextResponse.json(
        { error: "Equipment ID, maintenance date, and description are required" },
        { status: 400 }
      )
    }

    const maintenanceData: any = {
      equipmentId,
      maintenanceDate: new Date(maintenanceDate),
      description,
    }

    if (cost) maintenanceData.cost = parseFloat(cost)
    if (performedBy) maintenanceData.performedBy = performedBy

    const [record] = await db.insert(equipmentMaintenance).values(maintenanceData).returning()

    // Update last maintenance date on equipment
    await db.update(equipment)
      .set({ lastMaintenance: maintenanceDate })
      .where(eq(equipment.id, equipmentId))

    return NextResponse.json({ maintenance: record }, { status: 201 })
  } catch (error) {
    console.error("Create maintenance record error:", error)
    return NextResponse.json(
      { error: "Failed to create maintenance record" },
      { status: 500 }
    )
  }
}