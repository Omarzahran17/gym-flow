import { db } from "./db"
import { members, memberSubscriptions, classBookings, attendance } from "./db/schema"
import { eq, and, gte } from "drizzle-orm"

export interface SubscriptionCheck {
  hasSubscription: boolean
  isActive: boolean
  plan?: {
    id: number
    name: string
    tier: string
    maxClassesPerWeek: number
    maxCheckInsPerDay: number
    hasTrainerAccess: boolean
    hasPersonalTraining: boolean
    hasProgressTracking: boolean
    hasAchievements: boolean
  }
  usage?: {
    classesThisWeek: number
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
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const todayStr = now.toISOString().split('T')[0]

  const weeklyBookings = await db.query.classBookings.findMany({
    where: and(
      eq(classBookings.memberId, memberId),
      gte(classBookings.createdAt, startOfWeek)
    ),
  })

  const todayAttendance = await db.query.attendance.findMany({
    where: and(
      eq(attendance.memberId, memberId),
      gte(attendance.date, todayStr)
    ),
  })

  const plan = subscription.plan
  const classesThisWeek = weeklyBookings.length
  const checkInsToday = todayAttendance.length
  const maxClasses = plan.maxClassesPerWeek || 999
  const maxCheckIns = plan.maxCheckInsPerDay || 999

  return {
    hasSubscription: true,
    isActive: subscription.status === "active",
    plan: {
      id: plan.id,
      name: plan.name,
      tier: plan.tier || "basic",
      maxClassesPerWeek: maxClasses,
      maxCheckInsPerDay: maxCheckIns,
      hasTrainerAccess: plan.hasTrainerAccess ?? false,
      hasPersonalTraining: plan.hasPersonalTraining ?? false,
      hasProgressTracking: plan.hasProgressTracking ?? true,
      hasAchievements: plan.hasAchievements ?? true,
    },
    usage: {
      classesThisWeek,
      checkInsToday,
    },
    limits: {
      classesRemaining: Math.max(0, maxClasses - classesThisWeek),
      canCheckIn: checkInsToday < maxCheckIns,
    },
  }
}

export async function getMemberByUserId(userId: string) {
  return db.query.members.findFirst({
    where: eq(members.userId, userId),
  })
}
