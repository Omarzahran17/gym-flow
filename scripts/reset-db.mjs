import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL)

async function reset() {
  console.log("🗑️  Deleting test data...")
  
  await sql`DELETE FROM member_subscriptions WHERE id > 0`
  console.log("✅ member_subscriptions")
  
  await sql`DELETE FROM members WHERE user_id LIKE 'member-%'`
  console.log("✅ members")
  
  await sql`DELETE FROM trainers WHERE user_id LIKE 'trainer-%'`
  console.log("✅ trainers")
  
  await sql`DELETE FROM session WHERE user_id LIKE '%'`
  console.log("✅ session")
  
  await sql`DELETE FROM account WHERE user_id LIKE 'admin-%' OR user_id LIKE 'trainer-%' OR user_id LIKE 'member-%'`
  console.log("✅ account")
  
  await sql`DELETE FROM users WHERE email LIKE '%@gymflow.com'`
  console.log("✅ users")
  
  console.log("🎉 Done!")
}

reset().catch(console.error)
