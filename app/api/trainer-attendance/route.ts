import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trainerAttendance, trainers, users } from "@/lib/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

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

    const trainer = await db.query.trainers.findFirst({
      where: eq(trainers.userId, userId),
      with: {
        user: true,
      },
    });

    if (!trainer) {
      return NextResponse.json(
        { error: "Trainer profile not found" },
        { status: 404 }
      );
    }

    const today = getTodayDateString();

    const existingToday = await db.query.trainerAttendance.findFirst({
      where: and(
        eq(trainerAttendance.trainerId, trainer.id),
        eq(trainerAttendance.date, today)
      ),
    });

    if (action === "check-in") {
      if (existingToday && existingToday.status === "checked_in") {
        return NextResponse.json(
          { error: "Already checked in today" },
          { status: 400 }
        );
      }

      await db.insert(trainerAttendance).values({
        trainerId: trainer.id,
        status: "checked_in",
      });

      return NextResponse.json({
        success: true,
        message: "Check-in successful!",
        trainer: {
          id: trainer.id,
          name: trainer.user?.name,
        },
      });
    } else if (action === "check-out") {
      if (!existingToday) {
        return NextResponse.json(
          { error: "No check-in record found for today" },
          { status: 400 }
        );
      }

      if (existingToday.status === "checked_out") {
        return NextResponse.json(
          { error: "Already checked out today" },
          { status: 400 }
        );
      }

      await db.update(trainerAttendance)
        .set({
          checkOutTime: new Date(),
          status: "checked_out",
        })
        .where(eq(trainerAttendance.id, existingToday.id));

      return NextResponse.json({
        success: true,
        message: "Check-out successful!",
        trainer: {
          id: trainer.id,
          name: trainer.user?.name,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Trainer attendance error:", error);
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

    const trainer = await db.query.trainers.findFirst({
      where: eq(trainers.userId, userId),
    });

    if (!trainer) {
      return NextResponse.json(
        { error: "Trainer profile not found" },
        { status: 404 }
      );
    }

    const today = getTodayDateString();

    const todayRecord = await db.query.trainerAttendance.findFirst({
      where: and(
        eq(trainerAttendance.trainerId, trainer.id),
        eq(trainerAttendance.date, today)
      ),
      orderBy: [desc(trainerAttendance.checkInTime)],
    });

    const recentRecords = await db.query.trainerAttendance.findMany({
      where: eq(trainerAttendance.trainerId, trainer.id),
      orderBy: [desc(trainerAttendance.checkInTime)],
      limit: 10,
      with: {
        trainer: {
          with: {
            user: true,
          },
        },
      },
    });

    const formattedRecords = recentRecords.map(rec => ({
      id: rec.id,
      checkInTime: rec.checkInTime,
      checkOutTime: rec.checkOutTime,
      status: rec.status,
      date: rec.date,
    }));

    return NextResponse.json({
      todayStatus: todayRecord?.status || "not_checked_in",
      todayRecord,
      recentRecords: formattedRecords,
    });
  } catch (error) {
    console.error("Get trainer attendance error:", error);
    return NextResponse.json(
      { error: "Failed to get attendance records" },
      { status: 500 }
    );
  }
}
