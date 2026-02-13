import { db } from "./db"
import { achievements, memberAchievements, members, personalRecords, measurements, progressPhotos, attendance } from "./db/schema"
import { eq, and, gte, sql } from "drizzle-orm"

// Check and award achievements for a member
export async function checkAchievements(memberId: number) {
  try {
    // Get member
    const member = await db.query.members.findFirst({
      where: eq(members.id, memberId),
    })

    if (!member) {
      console.error("Member not found for achievement check:", memberId)
      return
    }

    // Get all achievements
    const allAchievements = await db.query.achievements.findMany()
    
    // Get already earned achievements
    const earnedAchievementsList = await db.query.memberAchievements.findMany({
      where: eq(memberAchievements.memberId, memberId),
    })
    const earnedIds = new Set(earnedAchievementsList.map(ea => ea.achievementId))

    // Get counts for different criteria
    const personalRecordsCount = await getPersonalRecordsCount(memberId)
    const measurementsCount = await getMeasurementsCount(memberId)
    const photosCount = await getProgressPhotosCount(memberId)
    const workoutsCount = await getWorkoutsCount(memberId)

    // Check each achievement
    for (const achievement of allAchievements) {
      // Skip if already earned
      if (earnedIds.has(achievement.id)) continue

      let shouldAward = false

      switch (achievement.criteriaType) {
        case "workouts_completed":
          shouldAward = workoutsCount >= (achievement.criteriaValue || 1)
          break
        case "personal_records":
          shouldAward = personalRecordsCount >= (achievement.criteriaValue || 1)
          break
        case "measurements_logged":
          shouldAward = measurementsCount >= (achievement.criteriaValue || 1)
          break
        case "photos_uploaded":
          shouldAward = photosCount >= (achievement.criteriaValue || 1)
          break
      }

      if (shouldAward) {
        await awardAchievement(memberId, achievement.id)
        console.log(`Awarded achievement "${achievement.name}" to member ${memberId}`)
      }
    }
  } catch (error) {
    console.error("Error checking achievements:", error)
  }
}

// Award an achievement to a member
async function awardAchievement(memberId: number, achievementId: number) {
  try {
    await db.insert(memberAchievements).values({
      memberId,
      achievementId,
      earnedAt: new Date(),
    })
  } catch (error) {
    console.error("Error awarding achievement:", error)
  }
}

// Get personal records count
async function getPersonalRecordsCount(memberId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(personalRecords)
    .where(eq(personalRecords.memberId, memberId))
  
  return result[0]?.count || 0
}

// Get measurements count
async function getMeasurementsCount(memberId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(measurements)
    .where(eq(measurements.memberId, memberId))
  
  return result[0]?.count || 0
}

// Get progress photos count
async function getProgressPhotosCount(memberId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(progressPhotos)
    .where(eq(progressPhotos.memberId, memberId))
  
  return result[0]?.count || 0
}

// Get workouts count (using attendance/check-ins)
async function getWorkoutsCount(memberId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(attendance)
    .where(eq(attendance.memberId, memberId))
  
  return result[0]?.count || 0
}
