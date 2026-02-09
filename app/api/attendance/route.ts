import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendance, members } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId, method = "qr_code" } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Create attendance record
    const [record] = await db
      .insert(attendance)
      .values({
        memberId,
        method,
      })
      .returning();

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("Attendance error:", error);
    return NextResponse.json(
      { error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const date = searchParams.get("date");

    let query = db.query.attendance.findMany({
      with: {
        member: true,
      },
      orderBy: (attendance, { desc }) => [desc(attendance.checkInTime)],
    });

    // Note: In a real implementation, you'd add filters based on memberId and date

    return NextResponse.json({ attendance: await query });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { error: "Failed to get attendance records" },
      { status: 500 }
    );
  }
}
