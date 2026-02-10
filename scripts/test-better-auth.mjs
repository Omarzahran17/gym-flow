import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config({ path: '/home/yxu/yxu/gym-app/gym-app/.env' })

const { neon } = require('@neondatabase/serverless')

console.log("DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 50) + "...")

const sql = neon(process.env.DATABASE_URL)

const users = await sql(`
  SELECT u.id, u.email, u.name, a.password, a.provider_id 
  FROM users u 
  LEFT JOIN account a ON u.id = a.user_id 
  WHERE u.email LIKE '%@gymflow.com'
`)

console.log("Users with account info:")
for (const u of users) {
  console.log(`- ${u.email}:`)
  console.log(`  Provider: ${u.provider_id}`)
  console.log(`  Password hash: ${u.password?.substring(0, 20)}...`)
  console.log(`  Hash length: ${u.password?.length}`)
}
