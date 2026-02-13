import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendance, members, users } from "@/lib/db/schema";
import { gte, desc, and, lte } from "drizzle-orm";
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

    let whereCondition = gte(attendance.checkInTime, startDate);

    const checkIns = await db.query.attendance.findMany({
      where: whereCondition,
      orderBy: [desc(attendance.checkInTime)],
      limit: 100,
      with: {
        member: {
          with: {
            user: true,
          },
        },
      },
    });

    const formattedCheckIns = checkIns.map(ci => ({
      id: ci.id,
      memberName: ci.member?.user?.name || "Unknown Member",
      checkInTime: ci.checkInTime,
      date: ci.date,
      method: ci.method,
    }));

    return NextResponse.json({ attendance: formattedCheckIns });
  } catch (error) {
    console.error("Get all attendance error:", error);
    return NextResponse.json(
      { error: "Failed to get attendance records" },
      { status: 500 }
    );
  }
}
