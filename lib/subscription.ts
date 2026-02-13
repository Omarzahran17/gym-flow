import { db } from "./db"
import { members, memberSubscriptions, classBookings, attendance } from "./db/schema"
import { eq, and, gte } from "drizzle-orm"
import { startOfMonth } from "date-fns"

export interface SubscriptionCheck {
  hasSubscription: boolean
  isActive: boolean
  plan?: {
    id: number
    name: string
    tier: string
    maxClassesPerMonth: number
    maxCheckInsPerDay: number
    hasTrainerAccess: boolean
    hasPersonalTraining: boolean
    hasProgressTracking: boolean
    hasAchievements: boolean
  }
  usage?: {
    classesThisMonth: number
    checkInsToday: number
  }
  limits?: {
    classesRemaining: number
    canCheckIn: boolean
  }
}

export async function checkMemberSubscription(memberId: number): Promise<SubscriptionCheck> {
  const subscription = await db.query.memberSubscriptions.findFirst({
    where: and(
      eq(memberSubscriptions.memberId, memberId),
      eq(memberSubscriptions.status, "active")
    ),
    with: {
      plan: true,
    },
  })

  if (!subscription || !subscription.plan) {
    return {
      hasSubscription: false,
      isActive: false,
    }
  }

  const now = new Date()
  const startOfMonthDate = startOfMonth(now)

  const todayStr = now.toISOString().split('T')[0]
  const todayStart = new Date(todayStr)
  todayStart.setHours(0, 0, 0, 0)

  const monthlyBookings = await db.query.classBookings.findMany({
    where: and(
      eq(classBookings.memberId, memberId),
      eq(classBookings.status, "confirmed"),
      gte(classBookings.createdAt, startOfMonthDate)
    ),
  })

  const todayAttendance = await db.query.attendance.findMany({
    where: and(
      eq(attendance.memberId, memberId),
      gte(attendance.checkInTime, todayStart)
    ),
  })

  const plan = subscription.plan
  const classesThisMonth = monthlyBookings.length
  const checkInsToday = todayAttendance.length
  const maxClasses = plan.maxClassesPerMonth || 12
  const maxCheckIns = plan.maxCheckInsPerDay || 1

  return {
    hasSubscription: true,
    isActive: subscription.status === "active",
    plan: {
      id: plan.id,
      name: plan.name,
      tier: plan.tier || "basic",
      maxClassesPerMonth: maxClasses,
      maxCheckInsPerDay: maxCheckIns,
      hasTrainerAccess: plan.hasTrainerAccess ?? false,
      hasPersonalTraining: plan.hasPersonalTraining ?? false,
      hasProgressTracking: plan.hasProgressTracking ?? true,
      hasAchievements: plan.hasAchievements ?? true,
    },
    usage: {
      classesThisMonth,
      checkInsToday,
    },
    limits: {
      classesRemaining: Math.max(0, maxClasses - classesThisMonth),
      canCheckIn: checkInsToday < maxCheckIns,
    },
  }
}

export async function getMemberByUserId(userId: string) {
  return db.query.members.findFirst({
    where: eq(members.userId, userId),
  })
}
