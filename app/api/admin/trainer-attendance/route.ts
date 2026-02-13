import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trainerAttendance, trainers, users } from "@/lib/db/schema";
import { gte, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "today";

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (filter === "week") {
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - dayOfWeek);
    } else if (filter === "month") {
      startDate.setDate(1);
    }

    const records = await db.query.trainerAttendance.findMany({
      where: gte(trainerAttendance.checkInTime, startDate),
      orderBy: [desc(trainerAttendance.checkInTime)],
      limit: 100,
      with: {
        trainer: {
          with: {
            user: true,
          },
        },
      },
    });

    const formattedRecords = records.map(rec => ({
      id: rec.id,
      trainerName: rec.trainer?.user?.name || "Unknown Trainer",
      checkInTime: rec.checkInTime,
      checkOutTime: rec.checkOutTime,
      date: rec.date,
      status: rec.status,
    }));

    return NextResponse.json({ attendance: formattedRecords });
  } catch (error) {
    console.error("Get all trainer attendance error:", error);
    return NextResponse.json(
      { error: "Failed to get trainer attendance records" },
      { status: 500 }
    );
  }
}
