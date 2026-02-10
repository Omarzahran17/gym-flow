import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config({ path: '/home/yxu/yxu/gym-app/gym-app/.env' })

const { neon } = require('@neondatabase/serverless')
const bcrypt = require('bcryptjs')

const sql = neon(process.env.DATABASE_URL)

async function resetAndSeed() {
  console.log("🗑️  Deleting old test data...")
  
  await sql`DELETE FROM class_bookings WHERE id > 0`
  await sql`DELETE FROM class_schedules WHERE id > 0`
  await sql`DELETE FROM classes WHERE id > 0`
  await sql`DELETE FROM member_subscriptions WHERE id > 0`
  await sql`DELETE FROM members WHERE user_id LIKE 'member-%'`
  await sql`DELETE FROM trainers WHERE user_id LIKE 'trainer-%'`
  await sql`DELETE FROM session WHERE user_id LIKE '%'`
  await sql`DELETE FROM account WHERE user_id LIKE 'admin-%' OR user_id LIKE 'trainer-%' OR user_id LIKE 'member-%'`
  await sql`DELETE FROM users WHERE email LIKE '%@gymflow.com'`
  await sql`DELETE FROM subscription_plans WHERE name IN ('Basic', 'Pro', 'Premium')`

  console.log("✅ Deleted old data")

  // Generate password hashes
  const passwordHash = await bcrypt.hash("password123", 10)
  console.log("Generated hash:", passwordHash)

  // Insert users first
  console.log("\n👤 Creating users...")
  await sql(`
    INSERT INTO users (id, name, email, email_verified, role, created_at, updated_at)
    VALUES 
      ('admin-user-001', 'Admin User', 'admin@gymflow.com', true, 'admin', NOW(), NOW()),
      ('trainer-user-001', 'John Trainer', 'trainer@gymflow.com', true, 'trainer', NOW(), NOW()),
      ('member-user-001', 'Member 1', 'member1@gymflow.com', true, 'member', NOW(), NOW()),
      ('member-user-002', 'Member 2', 'member2@gymflow.com', true, 'member', NOW(), NOW()),
      ('member-user-003', 'Member 3', 'member3@gymflow.com', true, 'member', NOW(), NOW())
  `)
  console.log("✅ Created users")

  // Insert accounts
  console.log("💾 Storing password hash...")
  await sql(`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES ('acc-admin-001', 'admin-account-001', 'email', 'admin-user-001', '${passwordHash}', NOW(), NOW())`)
  await sql(`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES ('acc-trainer-001', 'trainer-account-001', 'email', 'trainer-user-001', '${passwordHash}', NOW(), NOW())`)
  await sql(`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES ('acc-member-001', 'member-account-001', 'email', 'member-user-001', '${passwordHash}', NOW(), NOW())`)
  await sql(`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES ('acc-member-002', 'member-account-002', 'email', 'member-user-002', '${passwordHash}', NOW(), NOW())`)
  await sql(`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES ('acc-member-003', 'member-account-003', 'email', 'member-user-003', '${passwordHash}', NOW(), NOW())`)
  console.log("✅ Created accounts with passwords")

  // Insert trainer
  await sql(`
    INSERT INTO trainers (id, user_id, bio, specialization, max_clients, created_at, updated_at)
    VALUES 
      (100, 'trainer-user-001', 'Certified personal trainer', 'Strength Training', 15, NOW(), NOW())
  `)
  console.log("✅ Created trainer")

  // Insert subscription plans
  await sql(`
    INSERT INTO subscription_plans (name, description, price, interval, tier, max_classes_per_week, max_check_ins_per_day, has_trainer_access, has_personal_training, has_progress_tracking, has_achievements, is_active, created_at)
    VALUES 
      ('Basic', 'Perfect for beginners', 29.99, 'month', 'basic', 3, 1, false, false, true, true, true, NOW()),
      ('Pro', 'For serious fitness enthusiasts', 79.99, 'month', 'pro', 10, 2, true, false, true, true, true, NOW()),
      ('Premium', 'The ultimate fitness experience', 149.99, 'month', 'premium', 999, 999, true, true, true, true, true, NOW())
  `)
  console.log("✅ Created subscription plans")

  // Get member IDs and create subscriptions
  const members = await sql(`SELECT id, user_id FROM members WHERE user_id LIKE 'member-%' ORDER BY id`)
  const plans = await sql(`SELECT id FROM subscription_plans ORDER BY id`)
  
  for (let i = 0; i < members.length; i++) {
    const member = members[i]
    const planId = plans[i]?.id || plans[0]?.id
    if (planId) {
      await sql(`
        INSERT INTO member_subscriptions (member_id, plan_id, status, current_period_start, current_period_end, created_at)
        VALUES (${member.id}, ${planId}, 'active', NOW(), NOW() + INTERVAL '30 days', NOW())
      `)
    }
  }
  console.log("✅ Created member subscriptions")

  // Insert classes
  await sql(`
    INSERT INTO classes (id, name, max_capacity, duration_minutes, color, created_at)
    VALUES 
      (100, 'Morning HIIT', 20, 45, '#ef4444', NOW()),
      (101, 'Yoga Flow', 15, 60, '#8b5cf6', NOW()),
      (102, 'Strength Training', 12, 60, '#3b82f6', NOW()),
      (103, 'Spin Class', 25, 45, '#10b981', NOW()),
      (104, 'Pilates', 18, 50, '#f59e0b', NOW())
  `)
  console.log("✅ Created classes")

  // Insert class schedules
  const times = ["06:00", "07:00", "09:00", "12:00", "17:00", "18:00"]
  const rooms = ["Room A", "Room B", "Studio 1", "Main Floor"]
  
  let scheduleId = 1000
  for (let day = 1; day <= 5; day++) {
    for (let i = 0; i < 5; i++) {
      const time = times[i]
      const room = rooms[i]
      await sql(`
        INSERT INTO class_schedules (id, class_id, day_of_week, start_time, room, created_at)
        VALUES (${scheduleId}, ${100 + i}, ${day}, '${time}', '${room}', NOW())
      `)
      scheduleId++
    }
  }
  console.log("✅ Created class schedules")

  // Verify
  const users = await sql(`
    SELECT u.email, u.role, a.password 
    FROM users u 
    LEFT JOIN account a ON u.id = a.user_id 
    WHERE u.email LIKE '%@gymflow.com'
  `)

  console.log("\n✅ Verification:")
  for (const u of users) {
    console.log(`  ${u.email} (${u.role}): has password = ${!!u.password}`)
    const isValid = await bcrypt.compare("password123", u.password)
    console.log(`    Password valid: ${isValid}`)
  }
}

resetAndSeed().catch(console.error)
