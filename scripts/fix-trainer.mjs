import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config({ path: '/home/yxu/yxu/gym-app/gym-app/.env' })

const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

async function fixTrainer() {
  console.log("🔧 Fixing trainer account...")

  // Get trainer user ID
  const trainer = await sql(`SELECT id FROM users WHERE email = 'trainer@gymflow.com'`)
  
  if (trainer.length > 0) {
    const trainerId = trainer[0].id
    
    // Get trainer's member profile ID
    const memberProfile = await sql(`SELECT id FROM members WHERE user_id = $1`, [trainerId])
    
    if (memberProfile.length > 0) {
      const memberId = memberProfile[0].id
      
      // Delete member subscription first
      await sql(`DELETE FROM member_subscriptions WHERE member_id = $1`, [memberId])
      console.log("✅ Deleted member subscription for trainer")
      
      // Delete member profile
      await sql(`DELETE FROM members WHERE id = $1`, [memberId])
      console.log("✅ Deleted member profile for trainer")
    }

    // Add trainer profile
    await sql(`
      INSERT INTO trainers (user_id, bio, specialization, max_clients, created_at, updated_at)
      VALUES ($1, 'Certified personal trainer with 10 years of experience.', 'Strength Training, HIIT', 15, NOW(), NOW())
      ON CONFLICT (user_id) DO NOTHING
    `, [trainerId])
    console.log("✅ Added trainer profile")
  }

  // Update roles
  await sql(`UPDATE users SET role = 'trainer', updated_at = NOW() WHERE email = 'trainer@gymflow.com'`)
  await sql(`UPDATE users SET role = 'admin', updated_at = NOW() WHERE email = 'admin@gymflow.com'`)
  console.log("✅ Updated roles")

  // Verify all users
  console.log("\n📋 Final user list:")
  const users = await sql(`
    SELECT u.email, u.role, 
      (SELECT id FROM members WHERE user_id = u.id) as member_id,
      (SELECT id FROM trainers WHERE user_id = u.id) as trainer_id
    FROM users u 
    WHERE email LIKE '%@gymflow.com'
    ORDER BY u.role, u.email
  `)

  for (const u of users) {
    console.log(`  ${u.email}:`)
    console.log(`    role: ${u.role}`)
    console.log(`    member profile: ${u.member_id ? 'yes' : 'no'}`)
    console.log(`    trainer profile: ${u.trainer_id ? 'yes' : 'no'}`)
  }
}

fixTrainer().catch(console.error)
