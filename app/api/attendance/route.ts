import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendance, members } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { checkMemberSubscription } from "@/lib/subscription";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId, qrCode, method = "qr_code" } = await request.json();

    let member;

    if (qrCode) {
      member = await db.query.members.findFirst({
        where: eq(members.qrCode, qrCode),
        with: {
          user: true,
        },
      });

      if (!member) {
        return NextResponse.json(
          { error: "Invalid QR code" },
          { status: 404 }
        );
      }
    } else if (memberId) {
      member = await db.query.members.findFirst({
        where: eq(members.id, memberId),
        with: {
          user: true,
        },
      });

      if (!member) {
        return NextResponse.json(
          { error: "Member not found" },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Member ID or QR code is required" },
        { status: 400 }
      );
    }

    if (member.status !== "active") {
      return NextResponse.json(
        { error: "Member is not active" },
        { status: 400 }
      );
    }

    const subscriptionCheck = await checkMemberSubscription(member.id);
    
    if (!subscriptionCheck.hasSubscription || !subscriptionCheck.isActive) {
      return NextResponse.json(
        { error: "Active subscription required for gym access", code: "SUBSCRIPTION_REQUIRED" },
        { status: 403 }
      );
    }

    if (subscriptionCheck.limits && !subscriptionCheck.limits.canCheckIn) {
      return NextResponse.json(
        { 
          error: `Daily check-in limit reached (${subscriptionCheck.plan?.maxCheckInsPerDay} per day)`,
          code: "CHECKIN_LIMIT_REACHED"
        },
        { status: 403 }
      );
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const existingToday = await db.query.attendance.findFirst({
      where: and(
        eq(attendance.memberId, member.id),
        gte(attendance.date, todayStr)
      ),
    })

    if (existingToday) {
      return NextResponse.json(
        { error: "Already checked in today" },
        { status: 400 }
      );
    }

    await db.insert(attendance).values({
      memberId: member.id,
      method,
    });

    return NextResponse.json({ 
      success: true, 
      member: {
        id: member.id,
        name: member.user?.name || member.userId,
        email: member.user?.email,
        status: member.status,
        subscription: subscriptionCheck.plan?.name,
      }
    });
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
