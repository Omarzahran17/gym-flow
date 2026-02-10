import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { trainers, workoutPlans, classSchedules } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || (session.user as any).role !== "trainer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await db.query.trainers.findFirst({
      where: eq(trainers.userId, session.user.id),
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const activePlans = await db.query.workoutPlans.findMany({
      where: and(
        eq(workoutPlans.trainerId, trainer.id),
        eq(workoutPlans.isActive, true)
      ),
      with: {
        member: {
          with: {
            user: true,
          },
        },
      },
      orderBy: [desc(workoutPlans.createdAt)],
      limit: 5,
    })

    const recentMembers = activePlans
      .filter(plan => plan.member)
      .map(plan => {
        const member = plan.member!
        return {
          id: member.id,
          name: member.user?.name || member.userId,
          email: member.user?.email || null,
          planName: plan.name,
          lastActive: plan.createdAt 
            ? getTimeAgo(new Date(plan.createdAt))
            : "Never",
        }
      })

    const today = new Date()
    const dayOfWeek = today.getDay()

    const todaySchedules = await db.query.classSchedules.findMany({
      where: eq(classSchedules.dayOfWeek, dayOfWeek),
      with: {
        class: true,
      },
    })

    const todaysSchedule = todaySchedules
      .filter(s => s.class && s.class.trainerId === trainer.id)
      .map(schedule => ({
        id: schedule.class!.id,
        time: schedule.startTime.slice(0, 5),
        member: schedule.class!.name,
        type: "Group Class",
        duration: `${schedule.class!.durationMinutes || 60} min`,
        room: schedule.room,
      }))
      .sort((a, b) => a.time.localeCompare(b.time))

    return NextResponse.json({
      recentMembers,
      todaysSchedule,
    })
  } catch (error) {
    console.error("Get trainer dashboard data error:", error)
    return NextResponse.json(
      { error: "Failed to get dashboard data" },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}
