import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, memberSubscriptions, classes, classSchedules, trainers } from "@/lib/db/schema"
import { eq, desc, and, gte, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    const dayOfWeek = today.getDay()

    // Get recent members (last 10 joined)
    const recentMembers = await db.query.members.findMany({
      orderBy: [desc(members.joinDate)],
      limit: 5,
    })

    // Get member details with subscriptions
    const membersWithDetails = await Promise.all(
      recentMembers.map(async (member) => {
        const subscription = await db.query.memberSubscriptions.findFirst({
          where: eq(memberSubscriptions.memberId, member.id),
        })
        return {
          id: member.id,
          userId: member.userId,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          joinDate: member.joinDate,
          subscriptionStatus: subscription?.status || "inactive",
        }
      })
    )

    // Get today's classes
    const todaySchedules = await db.query.classSchedules.findMany({
      where: eq(classSchedules.dayOfWeek, dayOfWeek),
      with: {
        class: true,
        trainer: true,
      },
    })

    const todayClasses = todaySchedules
      .filter(s => s.class && s.class.isActive)
      .map(schedule => ({
        id: schedule.class!.id,
        name: schedule.class!.name,
        time: schedule.startTime.slice(0, 5),
        room: schedule.room,
        trainerName: schedule.trainer 
          ? `${schedule.trainer.firstName || ""} ${schedule.trainer.lastName || ""}`.trim() 
          : schedule.trainer?.userId || "TBD",
        color: schedule.class!.color,
        maxCapacity: schedule.class!.maxCapacity,
      }))
      .sort((a, b) => a.time.localeCompare(b.time))

    return NextResponse.json({
      recentMembers: membersWithDetails.map(m => ({
        id: m.id,
        name: m.firstName && m.lastName 
          ? `${m.firstName} ${m.lastName}` 
          : m.userId,
        email: m.email || "No email",
        joinDate: m.joinDate,
      })),
      todayClasses,
    })
  } catch (error) {
    console.error("Get dashboard data error:", error)
    return NextResponse.json(
      { error: "Failed to get dashboard data" },
      { status: 500 }
    )
  }
}
