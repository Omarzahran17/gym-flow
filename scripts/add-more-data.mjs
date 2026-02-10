import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config({ path: '/home/yxu/yxu/gym-app/gym-app/.env' })

const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

async function addMoreData() {
  console.log("🏋️ Adding exercises...")
  
  const exercisesCount = await sql(`SELECT COUNT(*) as count FROM exercises`)
  if (parseInt(exercisesCount[0].count) === 0) {
    await sql(`
      INSERT INTO exercises (name, category, muscle_group, description, created_at) VALUES
        ('Bench Press', 'Strength', 'Chest', 'Classic chest exercise using barbell', NOW()),
        ('Squat', 'Strength', 'Legs', 'Fundamental lower body compound movement', NOW()),
        ('Deadlift', 'Strength', 'Back', 'Full body compound lift', NOW()),
        ('Pull-ups', 'Strength', 'Back', 'Bodyweight back exercise', NOW()),
        ('Dumbbell Row', 'Strength', 'Back', 'Unilateral back exercise', NOW()),
        ('Shoulder Press', 'Strength', 'Shoulders', 'Overhead pressing movement', NOW()),
        ('Bicep Curl', 'Isolation', 'Biceps', 'Classic arm isolation exercise', NOW()),
        ('Tricep Pushdown', 'Isolation', 'Triceps', 'Cable exercise for triceps', NOW()),
        ('Leg Press', 'Strength', 'Legs', 'Machine-based leg exercise', NOW()),
        ('Lunges', 'Strength', 'Legs', 'Unilateral leg exercise', NOW()),
        ('Plank', 'Core', 'Abs', 'Isometric core exercise', NOW()),
        ('Crunches', 'Core', 'Abs', 'Ab isolation exercise', NOW()),
        ('Russian Twist', 'Core', 'Abs', 'Rotational core exercise', NOW()),
        ('HIIT Sprints', 'Cardio', 'Full Body', 'High intensity interval training', NOW()),
        ('Burpees', 'Cardio', 'Full Body', 'Full body explosive exercise', NOW()),
        ('Box Jumps', 'Plyometric', 'Legs', 'Explosive leg power exercise', NOW()),
        ('Yoga Sun Salutation', 'Flexibility', 'Full Body', 'Flowing yoga sequence', NOW()),
        ('Foam Rolling', 'Recovery', 'Full Body', 'Self-myofascial release', NOW()),
        ('Battle Ropes', 'Cardio', 'Full Body', 'High intensity arm exercise', NOW()),
        ('Kettlebell Swing', 'Strength', 'Full Body', 'Dynamic hip hinge movement', NOW())
    `)
    console.log("✅ Added 20 exercises")
  }

  console.log("\n💪 Adding equipment...")
  const equipmentCount = await sql(`SELECT COUNT(*) as count FROM equipment`)
  if (parseInt(equipmentCount[0].count) === 0) {
    await sql(`
      INSERT INTO equipment (name, category, status, purchase_date, created_at) VALUES
        ('Bench Press #1', 'Strength', 'active', NOW() - INTERVAL '6 months', NOW()),
        ('Bench Press #2', 'Strength', 'active', NOW() - INTERVAL '6 months', NOW()),
        ('Squat Rack #1', 'Strength', 'active', NOW() - INTERVAL '6 months', NOW()),
        ('Squat Rack #2', 'Strength', 'active', NOW() - INTERVAL '6 months', NOW()),
        ('Deadlift Platform', 'Strength', 'active', NOW() - INTERVAL '6 months', NOW()),
        ('Pull-up Bar', 'Strength', 'active', NOW() - INTERVAL '6 months', NOW()),
        ('Dumbbell Set 5-50lbs', 'Strength', 'active', NOW() - INTERVAL '3 months', NOW()),
        ('Kettlebell Set', 'Strength', 'active', NOW() - INTERVAL '3 months', NOW()),
        ('Treadmill #1', 'Cardio', 'maintenance', NOW() - INTERVAL '1 month', NOW()),
        ('Treadmill #2', 'Cardio', 'active', NOW() - INTERVAL '6 months', NOW()),
        ('Treadmill #3', 'Cardio', 'active', NOW() - INTERVAL '6 months', NOW()),
        ('Spin Bike #1', 'Cardio', 'active', NOW() - INTERVAL '4 months', NOW()),
        ('Spin Bike #2', 'Cardio', 'active', NOW() - INTERVAL '4 months', NOW()),
        ('Spin Bike #3', 'Cardio', 'active', NOW() - INTERVAL '4 months', NOW()),
        ('Yoga Mats', 'Flexibility', 'active', NOW() - INTERVAL '2 months', NOW()),
        ('Foam Rollers', 'Recovery', 'active', NOW() - INTERVAL '2 months', NOW()),
        ('Cable Machine', 'Strength', 'active', NOW() - INTERVAL '5 months', NOW()),
        ('Leg Press Machine', 'Strength', 'active', NOW() - INTERVAL '5 months', NOW()),
        ('Smith Machine', 'Strength', 'active', NOW() - INTERVAL '5 months', NOW()),
        ('Battle Ropes', 'Cardio', 'active', NOW() - INTERVAL '1 month', NOW())
    `)
    console.log("✅ Added 20 equipment items")
  }

  console.log("\n📋 Adding workout plans...")
  const workoutPlansCount = await sql(`SELECT COUNT(*) as count FROM workout_plans`)
  if (parseInt(workoutPlansCount[0].count) === 0) {
    const members = await sql(`SELECT id FROM members ORDER BY id LIMIT 3`)
    const exercises = await sql(`SELECT id FROM exercises ORDER BY id`)
    
    const workoutPlanData = [
      { name: 'Beginner Full Body', description: 'Perfect for beginners starting their fitness journey', days: 3 },
      { name: 'Intermediate Strength', description: 'Build muscle and strength with compound movements', days: 4 },
      { name: 'Advanced HIIT & Strength', description: 'High intensity training for experienced members', days: 5 },
    ]
    
    for (let i = 0; i < workoutPlanData.length; i++) {
      const plan = workoutPlanData[i]
      const member = members[i]
      
      const [workoutPlan] = await sql(`
        INSERT INTO workout_plans (trainer_id, member_id, name, description, start_date, end_date, is_active, created_at)
        VALUES (1, $1, $2, $3, NOW(), NOW() + INTERVAL '90 days', true, NOW())
        RETURNING id
      `, [member.id, plan.name, plan.description])
      
      const numExercises = 6
      for (let j = 0; j < numExercises; j++) {
        const exercise = exercises[j % exercises.length]
        await sql(`
          INSERT INTO plan_exercises (plan_id, exercise_id, sets, reps, rest_seconds, order_index, created_at)
          VALUES ($1, $2, 3, '8-12', 60, $3, NOW())
        `, [workoutPlan.id, exercise.id, j + 1])
      }
      console.log(`✅ Added workout plan: ${plan.name} for member ${i + 1}`)
    }
  }

  console.log("\n🏆 Adding achievements...")
  const achievementsCount = await sql(`SELECT COUNT(*) as count FROM achievements`)
  if (parseInt(achievementsCount[0].count) === 0) {
    await sql(`
      INSERT INTO achievements (name, description, icon, category, points, created_at) VALUES
        ('First Workout', 'Complete your first workout', 'trophy', 'workout', 100, NOW()),
        ('Week Warrior', 'Exercise 7 days in a row', 'fire', 'consistency', 500, NOW()),
        ('Month Master', 'Exercise for 30 consecutive days', 'calendar', 'consistency', 1000, NOW()),
        ('Early Bird', 'Complete a workout before 6 AM', 'sun', 'time', 200, NOW()),
        ('Night Owl', 'Complete a workout after 8 PM', 'moon', 'time', 200, NOW()),
        ('Spartan', 'Complete 10 workouts in a week', 'warrior', 'volume', 750, NOW()),
        ('Iron Lifter', 'Deadlift 225 lbs', 'dumbbell', 'strength', 500, NOW()),
        ('Beast Mode', 'Squat 300 lbs', 'dumbbell', 'strength', 750, NOW()),
        ('Marathoner', 'Complete 50 workouts', 'medal', 'volume', 1500, NOW()),
        ('Century Club', 'Complete 100 workouts', 'crown', 'volume', 2500, NOW()),
        ('Flexibility Master', 'Complete 20 yoga classes', 'lotus', 'flexibility', 600, NOW()),
        ('HIIT Champion', 'Complete 15 HIIT classes', 'lightning', 'cardio', 450, NOW()),
        ('First PR', 'Set your first personal record', 'star', 'progress', 300, NOW()),
        ('Consistency King', 'Exercise 20 days this month', 'king', 'consistency', 800, NOW()),
        ('New Member', 'Join the gym', 'welcome', 'milestone', 50, NOW())
    `)
    console.log("✅ Added 15 achievements")
  }

  console.log("\n🎯 Adding member achievements...")
  const memberAchievementsCount = await sql(`SELECT COUNT(*) as count FROM member_achievements`)
  if (parseInt(memberAchievementsCount[0].count) === 0) {
    const members = await sql(`SELECT id FROM members ORDER BY id`)
    const achievements = await sql(`SELECT id FROM achievements ORDER BY id`)
    
    for (let i = 0; i < members.length; i++) {
      const member = members[i]
      const numAchievements = 3 + (i * 2)
      
      for (let j = 0; j < numAchievements; j++) {
        const achievement = achievements[j % achievements.length]
        const earnedDate = new Date()
        earnedDate.setDate(earnedDate.getDate() - Math.floor(Math.random() * 60))
        
        await sql(`
          INSERT INTO member_achievements (member_id, achievement_id, earned_at)
          VALUES ($1, $2, $3)
        `, [member.id, achievement.id, earnedDate.toISOString()])
      }
      console.log(`✅ Added achievements for member ${i + 1}`)
    }
  }

  console.log("\n📊 Adding measurements...")
  const measurementsCount = await sql(`SELECT COUNT(*) as count FROM measurements`)
  if (parseInt(measurementsCount[0].count) === 0) {
    const members = await sql(`SELECT id FROM members ORDER BY id`)
    
    for (const member of members) {
      const numMeasurements = 4 + Math.floor(Math.random() * 3)
      const weight = 150 + Math.floor(Math.random() * 50)
      const bodyFat = 15 + Math.floor(Math.random() * 10)
      const chest = 38 + Math.floor(Math.random() * 8)
      const waist = 30 + Math.floor(Math.random() * 10)
      
      for (let i = 0; i < numMeasurements; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (i * 14))
        const variation = (Math.random() - 0.5) * 2
        
        await sql(`
          INSERT INTO measurements (member_id, weight, body_fat, chest, waist, hips, recorded_at, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `, [member.id, (weight + variation).toFixed(1), (bodyFat + variation * 0.5).toFixed(1), (chest + variation).toFixed(1), (waist + variation).toFixed(1), (waist - 3 + variation).toFixed(1), date.toISOString()])
      }
      console.log(`✅ Added measurements for member ${member.id}`)
    }
  }

  console.log("\n🏅 Adding personal records...")
  const personalRecordsCount = await sql(`SELECT COUNT(*) as count FROM personal_records`)
  if (parseInt(personalRecordsCount[0].count) === 0) {
    const members = await sql(`SELECT id FROM members ORDER BY id`)
    const exercises = await sql(`SELECT id FROM exercises WHERE category = 'Strength'`)
    
    for (const member of members) {
      const numPRs = 3 + Math.floor(Math.random() * 4)
      
      for (let i = 0; i < numPRs; i++) {
        const exercise = exercises[i % exercises.length]
        const weight = 100 + Math.floor(Math.random() * 200)
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 30))
        
        await sql(`
          INSERT INTO personal_records (member_id, exercise_id, weight, reps, recorded_at, created_at)
          VALUES ($1, $2, $3, 5, $4, NOW())
        `, [member.id, exercise.id, weight, 5 + Math.floor(Math.random() * 5), date.toISOString()])
      }
      console.log(`✅ Added personal records for member ${member.id}`)
    }
  }

  console.log("\n📝 Adding attendance records...")
  const attendanceCount = await sql(`SELECT COUNT(*) as count FROM attendance`)
  if (parseInt(attendanceCount[0].count) < 20) {
    const members = await sql(`SELECT id FROM members ORDER BY id`)
    
    for (const member of members) {
      const numDays = 10 + Math.floor(Math.random() * 20)
      
      for (let i = 0; i < numDays; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const hour = 6 + Math.floor(Math.random() * 14)
        date.setHours(hour, Math.floor(Math.random() * 60), 0)
        
        await sql(`
          INSERT INTO attendance (member_id, date, method, created_at)
          VALUES ($1, $2, 'qr_code', NOW())
        `, [member.id, date.toISOString().split('T')[0]])
      }
      console.log(`✅ Added ${numDays} attendance records for member ${member.id}`)
    }
  }

  console.log("\n📸 Adding progress photos...")
  const progressPhotosCount = await sql(`SELECT COUNT(*) as count FROM progress_photos`)
  if (parseInt(progressPhotosCount[0].count) === 0) {
    const members = await sql(`SELECT id FROM members ORDER BY id`)
    
    for (const member of members) {
      const numPhotos = 2 + Math.floor(Math.random() * 3)
      
      for (let i = 0; i < numPhotos; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (i * 14))
        
        await sql(`
          INSERT INTO progress_photos (member_id, photo_url, body_part, notes, uploaded_at, created_at)
          VALUES ($1, '/progress/photo_${member.id}_${i}.jpg', $2, 'Progress photo', $3, NOW())
        `, [member.id, ['front', 'side', 'back'][i % 3], date.toISOString()])
      }
      console.log(`✅ Added ${numPhotos} progress photos for member ${member.id}`)
    }
  }

  console.log("\n✅ All additional data added successfully!")
  
  console.log("\n📊 Final Data Summary:")
  const summary = await sql(`
    SELECT 
      (SELECT COUNT(*) FROM exercises) as exercises,
      (SELECT COUNT(*) FROM equipment) as equipment,
      (SELECT COUNT(*) FROM workout_plans) as workout_plans,
      (SELECT COUNT(*) FROM plan_exercises) as plan_exercises,
      (SELECT COUNT(*) FROM achievements) as achievements,
      (SELECT COUNT(*) FROM member_achievements) as member_achievements,
      (SELECT COUNT(*) FROM measurements) as measurements,
      (SELECT COUNT(*) FROM personal_records) as personal_records,
      (SELECT COUNT(*) FROM attendance) as attendance,
      (SELECT COUNT(*) FROM progress_photos) as progress_photos
  `)
  
  console.log(`  Exercises: ${summary[0].exercises}`)
  console.log(`  Equipment: ${summary[0].equipment}`)
  console.log(`  Workout Plans: ${summary[0].workout_plans}`)
  console.log(`  Plan Exercises: ${summary[0].plan_exercises}`)
  console.log(`  Achievements: ${summary[0].achievements}`)
  console.log(`  Member Achievements: ${summary[0].member_achievements}`)
  console.log(`  Measurements: ${summary[0].measurements}`)
  console.log(`  Personal Records: ${summary[0].personal_records}`)
  console.log(`  Attendance Records: ${summary[0].attendance}`)
  console.log(`  Progress Photos: ${summary[0].progress_photos}`)
}

addMoreData().catch(console.error)
