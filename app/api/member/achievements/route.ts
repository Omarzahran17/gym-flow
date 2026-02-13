import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { achievements, memberAchievements, members } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

// Seed default achievements if none exist
const defaultAchievements = [
  { name: "First Workout", description: "Complete your first workout", icon: "🎯", criteriaType: "workouts_completed", criteriaValue: 1, points: 10 },
  { name: "Week Warrior", description: "Complete 7 workouts", icon: "🔥", criteriaType: "workouts_completed", criteriaValue: 7, points: 50 },
  { name: "Month Master", description: "Complete 30 workouts", icon: "💪", criteriaType: "workouts_completed", criteriaValue: 30, points: 200 },
  { name: "First PR", description: "Set your first personal record", icon: "🏆", criteriaType: "personal_records", criteriaValue: 1, points: 25 },
  { name: "PR Machine", description: "Set 10 personal records", icon: "🥇", criteriaType: "personal_records", criteriaValue: 10, points: 100 },
  { name: "Weight Tracker", description: "Log 5 measurements", icon: "📊", criteriaType: "measurements_logged", criteriaValue: 5, points: 25 },
  { name: "Photo Journey", description: "Upload 3 progress photos", icon: "📸", criteriaType: "photos_uploaded", criteriaValue: 3, points: 30 },
]

async function seedAchievements() {
  const existing = await db.query.achievements.findMany()
  console.log("Seeding achievements, found:", existing.length)
  if (existing.length === 0) {
    await db.insert(achievements).values(defaultAchievements)
    console.log("Inserted default achievements")
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Seed achievements if needed
    await seedAchievements()

    // Get member from user
    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Get all achievements with earned status
    const allAchievements = await db.query.achievements.findMany()
    const earnedAchievements = await db.query.memberAchievements.findMany({
      where: eq(memberAchievements.memberId, member.id),
      with: {
        achievement: true,
      },
      orderBy: [desc(memberAchievements.earnedAt)],
    })

    const earnedIds = new Set(earnedAchievements.map(ea => ea.achievementId))

    const achievementsWithStatus = allAchievements.map(achievement => ({
      ...achievement,
      earned: earnedIds.has(achievement.id),
      earnedAt: earnedAchievements.find(ea => ea.achievementId === achievement.id)?.earnedAt,
    }))

    const totalPoints = earnedAchievements.reduce((sum, ea) => sum + (ea.achievement?.points || 0), 0)

    return NextResponse.json({ 
      achievements: achievementsWithStatus,
      earnedCount: earnedAchievements.length,
      totalPoints,
    })
  } catch (error) {
    console.error("Get achievements error:", error)
    return NextResponse.json(
      { error: "Failed to get achievements" },
      { status: 500 }
    )
  }
}
