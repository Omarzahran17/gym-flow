import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config({ path: '/home/yxu/yxu/gym-app/gym-app/.env' })

const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

async function deleteTestUsers() {
  console.log("🗑️  Deleting test users...")
  
  await sql`DELETE FROM class_bookings WHERE id > 0`
  await sql`DELETE FROM attendance WHERE id > 0`
  await sql`DELETE FROM class_schedules WHERE id > 0`
  await sql`DELETE FROM classes WHERE id > 0`
  await sql`DELETE FROM member_subscriptions WHERE id > 0`
  await sql`DELETE FROM members WHERE user_id LIKE 'member-%' OR user_id LIKE 'admin-%' OR user_id LIKE 'trainer-%'`
  await sql`DELETE FROM trainers WHERE user_id LIKE 'member-%' OR user_id LIKE 'admin-%' OR user_id LIKE 'trainer-%'`
  await sql`DELETE FROM session WHERE user_id LIKE 'member-%' OR user_id LIKE 'admin-%' OR user_id LIKE 'trainer-%'`
  await sql`DELETE FROM account WHERE user_id LIKE 'member-%' OR user_id LIKE 'admin-%' OR user_id LIKE 'trainer-%'`
  await sql`DELETE FROM users WHERE email LIKE '%@gymflow.com' OR email LIKE '%@example.com'`
  
  console.log("✅ Deleted all test users and related data")
}

deleteTestUsers().catch(console.error)
