import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, memberSubscriptions, classSchedules } from "@/lib/db/schema"
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

    const today = new Date()
    const dayOfWeek = today.getDay()

    const recentMembers = await db.query.members.findMany({
      orderBy: [desc(members.joinDate)],
      limit: 5,
      with: {
        user: true,
      },
    })

    const membersWithDetails = await Promise.all(
      recentMembers
        .filter(member => member.user)
        .map(async (member) => {
        const subscription = await db.query.memberSubscriptions.findFirst({
          where: eq(memberSubscriptions.memberId, member.id),
        })
        return {
          id: member.id,
          name: member.user?.name || member.userId,
          email: member.user?.email || "No email",
          joinDate: member.joinDate,
          subscriptionStatus: subscription?.status || "inactive",
        }
      })
    )

    const todaySchedules = await db.query.classSchedules.findMany({
      where: eq(classSchedules.dayOfWeek, dayOfWeek),
      with: {
        class: {
          with: {
            trainer: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    })

    const todayClasses = todaySchedules
      .filter(s => s.class)
      .map(schedule => ({
        id: schedule.class!.id,
        name: schedule.class!.name,
        time: schedule.startTime.slice(0, 5),
        room: schedule.room,
        trainerName: schedule.class!.trainer?.user?.name || "TBD",
        color: schedule.class!.color,
        maxCapacity: schedule.class!.maxCapacity,
      }))
      .sort((a, b) => a.time.localeCompare(b.time))

    return NextResponse.json({
      recentMembers: membersWithDetails,
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
