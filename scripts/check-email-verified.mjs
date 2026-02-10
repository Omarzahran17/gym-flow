import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config({ path: '/home/yxu/yxu/gym-app/gym-app/.env' })

const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

// Check email verification status
const users = await sql(`
  SELECT u.id, u.email, u.email_verified, a.password, a.provider_id
  FROM users u 
  LEFT JOIN account a ON u.id = a.user_id 
  WHERE u.email LIKE '%@gymflow.com'
`)

console.log("User verification status:")
for (const u of users) {
  console.log(`  ${u.email}:`)
  console.log(`    email_verified: ${u.email_verified}`)
  console.log(`    provider_id: ${u.provider_id}`)
  console.log(`    has password: ${!!u.password}`)
}
