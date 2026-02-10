import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, memberSubscriptions, classBookings, classSchedules } from "@/lib/db/schema"
import { eq, and, gte } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const weeklyBookings = await db.query.classBookings.findMany({
      where: and(
        eq(classBookings.memberId, member.id),
        gte(classBookings.createdAt, startOfWeek)
      ),
      with: {
        schedule: {
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
        },
      },
    })

    const upcomingClasses = weeklyBookings
      .filter(booking => booking.schedule?.class)
      .map(booking => ({
        id: booking.schedule!.class!.id,
        name: booking.schedule!.class!.name,
        time: booking.schedule!.startTime.slice(0, 5),
        day: getDayName(booking.schedule!.dayOfWeek),
        trainer: booking.schedule!.class!.trainer?.user?.name || "TBD",
        room: booking.schedule!.room,
      }))
      .slice(0, 5)

    const activeSubscription = await db.query.memberSubscriptions.findFirst({
      where: and(
        eq(memberSubscriptions.memberId, member.id),
        eq(memberSubscriptions.status, "active")
      ),
    })

    const totalWorkouts = weeklyBookings.length
    const goalWorkoutsPerWeek = 3
    const goalCompletion = Math.min(Math.round((totalWorkouts / goalWorkoutsPerWeek) * 100), 100)

    return NextResponse.json({
      upcomingClasses,
      goalCompletion,
      stats: {
        workoutsThisWeek: totalWorkouts,
        activeSubscription: !!activeSubscription,
      },
    })
  } catch (error) {
    console.error("Get member dashboard data error:", error)
    return NextResponse.json(
      { error: "Failed to get dashboard data" },
      { status: 500 }
    )
  }
}

function getDayName(dayOfWeek: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[dayOfWeek] || "Unknown"
}
