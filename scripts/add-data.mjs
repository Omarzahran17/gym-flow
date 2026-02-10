import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config({ path: '/home/yxu/yxu/gym-app/gym-app/.env' })

const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

async function addData() {
  console.log("📊 Adding profile data...")

  // Check existing users
  const users = await sql(`
    SELECT id, email, role FROM users 
    WHERE email LIKE '%@gymflow.com' 
    ORDER BY role, email
  `)

  console.log("Found users:")
  for (const u of users) {
    console.log(`  - ${u.email} (${u.role})`)
  }

  // Add trainer profile
  const trainer = users.find(u => u.role === 'trainer')
  if (trainer) {
    try {
      await sql(`
        INSERT INTO trainers (user_id, bio, specialization, max_clients, created_at, updated_at)
        VALUES ($1, 'Certified personal trainer with 10 years of experience.', 'Strength Training, HIIT', 15, NOW(), NOW())
        ON CONFLICT (user_id) DO NOTHING
      `, [trainer.id])
      console.log("✅ Added trainer profile")
    } catch (e) {
      console.log("Trainer profile might already exist:", e.message)
    }
  }

  // Add member profiles
  const members = users.filter(u => u.role === 'member')
  for (let i = 0; i < members.length; i++) {
    const m = members[i]
    try {
      await sql(`
        INSERT INTO members (user_id, phone, status, qr_code, join_date, created_at, updated_at)
        VALUES ($1, $2, 'active', $3, NOW(), NOW(), NOW())
        ON CONFLICT (user_id) DO NOTHING
      `, [m.id, `555-${1000 + i}`, `QR-${m.id}`])
      console.log(`✅ Added member profile for ${m.email}`)
    } catch (e) {
      console.log(`Member profile might exist for ${m.email}:`, e.message)
    }
  }

  // Add subscription plans if not exist
  const plans = await sql(`SELECT COUNT(*) as count FROM subscription_plans`)
  if (parseInt(plans[0].count) === 0) {
    console.log("📦 Adding subscription plans...")
    await sql(`
      INSERT INTO subscription_plans (name, description, price, interval, tier, max_classes_per_week, max_check_ins_per_day, has_trainer_access, has_personal_training, has_progress_tracking, has_achievements, is_active, created_at)
      VALUES 
        ('Basic', 'Perfect for beginners', 29.99, 'month', 'basic', 3, 1, false, false, true, true, true, NOW()),
        ('Pro', 'For serious fitness enthusiasts', 79.99, 'month', 'pro', 10, 2, true, false, true, true, true, NOW()),
        ('Premium', 'The ultimate fitness experience', 149.99, 'month', 'premium', 999, 999, true, true, true, true, true, NOW())
    `)
    console.log("✅ Added subscription plans")
  }

  // Add member subscriptions
  const memberProfiles = await sql(`
    SELECT m.id, m.user_id, u.email 
    FROM members m 
    JOIN users u ON m.user_id = u.id 
    WHERE u.email LIKE '%@gymflow.com'
  `)

  const subscriptionPlans = await sql(`SELECT id, name FROM subscription_plans ORDER BY id`)

  for (let i = 0; i < memberProfiles.length; i++) {
    const m = memberProfiles[i]
    const planIndex = i % subscriptionPlans.length
    const plan = subscriptionPlans[planIndex]
    
    try {
      await sql(`
        INSERT INTO member_subscriptions (member_id, plan_id, status, current_period_start, current_period_end, created_at)
        VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '30 days', NOW())
        ON CONFLICT DO NOTHING
      `, [m.id, plan.id])
      console.log(`✅ Added ${plan.name} subscription for ${m.email}`)
    } catch (e) {
      console.log(`Subscription might exist for ${m.email}:`, e.message)
    }
  }

  // Add classes if not exist
  const classesCount = await sql(`SELECT COUNT(*) as count FROM classes`)
  if (parseInt(classesCount[0].count) === 0) {
    console.log("🏋️ Adding classes...")
    await sql(`
      INSERT INTO classes (name, max_capacity, duration_minutes, color, created_at)
      VALUES 
        ('Morning HIIT', 20, 45, '#ef4444', NOW()),
        ('Yoga Flow', 15, 60, '#8b5cf6', NOW()),
        ('Strength Training', 12, 60, '#3b82f6', NOW()),
        ('Spin Class', 25, 45, '#10b981', NOW()),
        ('Pilates', 18, 50, '#f59e0b', NOW())
    `)
    console.log("✅ Added classes")
  }

  // Add class schedules if not exist
  const schedulesCount = await sql(`SELECT COUNT(*) as count FROM class_schedules`)
  if (parseInt(schedulesCount[0].count) === 0) {
    console.log("📅 Adding class schedules...")
    const classes = await sql(`SELECT id FROM classes ORDER BY id`)
    const times = ["06:00", "07:00", "09:00", "12:00", "17:00"]
    const rooms = ["Room A", "Room B", "Studio 1", "Main Floor", "Room C"]
    
    let scheduleId = 1
    for (let day = 1; day <= 5; day++) {
      for (let i = 0; i < classes.length; i++) {
        const time = times[i]
        const room = rooms[i]
        await sql(`
          INSERT INTO class_schedules (class_id, day_of_week, start_time, room, created_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, [classes[i].id, day, time, room])
        scheduleId++
      }
    }
    console.log("✅ Added class schedules")
  }

  console.log("\n🎉 All data added successfully!")
}

addData().catch(console.error)
