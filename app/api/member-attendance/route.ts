import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendance, members } from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
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

    const userId = session.user.id;
    const { action } = await request.json();

    const member = await db.query.members.findFirst({
      where: eq(members.userId, userId),
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member profile not found" },
        { status: 404 }
      );
    }

    if (member.status !== "active") {
      return NextResponse.json(
        { error: "Member account is not active. Please contact support." },
        { status: 400 }
      );
    }

    const subscriptionCheck = await checkMemberSubscription(member.id);

    if (!subscriptionCheck.hasSubscription || !subscriptionCheck.isActive) {
      return NextResponse.json(
        { error: "Active subscription required for gym access. Please renew your subscription.", code: "SUBSCRIPTION_REQUIRED" },
        { status: 403 }
      );
    }

    if (subscriptionCheck.limits && !subscriptionCheck.limits.canCheckIn) {
      return NextResponse.json(
        {
          error: `Daily check-in limit reached (${subscriptionCheck.plan?.maxCheckInsPerDay || 1} per day)`,
          code: "CHECKIN_LIMIT_REACHED"
        },
        { status: 403 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingToday = await db.query.attendance.findFirst({
      where: and(
        eq(attendance.memberId, member.id),
        gte(attendance.checkInTime, today)
      ),
    });

    if (existingToday) {
      return NextResponse.json(
        { error: "Already checked in today" },
        { status: 400 }
      );
    }

    await db.insert(attendance).values({
      memberId: member.id,
      method: "self_checkin",
    });

    return NextResponse.json({
      success: true,
      message: "Check-in successful!",
    });
  } catch (error) {
    console.error("Member attendance error:", error);
    return NextResponse.json(
      { error: "Failed to process attendance" },
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

    const userId = session.user.id;

    const member = await db.query.members.findFirst({
      where: eq(members.userId, userId),
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member profile not found" },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRecord = await db.query.attendance.findFirst({
      where: and(
        eq(attendance.memberId, member.id),
        gte(attendance.checkInTime, today)
      ),
    });

    const recentRecords = await db.query.attendance.findMany({
      where: eq(attendance.memberId, member.id),
      orderBy: [desc(attendance.checkInTime)],
      limit: 10,
    });

    const formattedRecords = recentRecords.map(rec => ({
      id: rec.id,
      checkInTime: rec.checkInTime,
      date: rec.date,
    }));

    return NextResponse.json({
      todayStatus: todayRecord ? "checked_in" : "not_checked_in",
      recentRecords: formattedRecords,
    });
  } catch (error) {
    console.error("Get member attendance error:", error);
    return NextResponse.json(
      { error: "Failed to get attendance records" },
      { status: 500 }
    );
  }
}
