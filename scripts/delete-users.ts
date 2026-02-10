import { db } from "../lib/db"
import { sql } from "drizzle-orm"

async function deleteTestUsers() {
  console.log("🗑️  Deleting old test users...")

  try {
    await db.run(sql`DELETE FROM member_subscriptions WHERE id > 0`)
  } catch (e) { console.log("member_subscriptions error:", e.message) }

  try {
    await db.run(sql`DELETE FROM members WHERE user_id LIKE 'member-%'`)
  } catch (e) { console.log("members error:", e.message) }

  try {
    await db.run(sql`DELETE FROM trainers WHERE user_id LIKE 'trainer-%'`)
  } catch (e) { console.log("trainers error:", e.message) }

  try {
    await db.run(sql`DELETE FROM session WHERE user_id LIKE '%'`)
  } catch (e) { console.log("session error:", e.message) }

  try {
    await db.run(sql`DELETE FROM account WHERE user_id LIKE 'admin-%' OR user_id LIKE 'trainer-%' OR user_id LIKE 'member-%'`)
  } catch (e) { console.log("account error:", e.message) }

  try {
    await db.run(sql`DELETE FROM users WHERE email LIKE '%@gymflow.com'`)
  } catch (e) { console.log("users error:", e.message) }

  console.log("✅ Deleted test users")
}

deleteTestUsers().catch(console.error)
