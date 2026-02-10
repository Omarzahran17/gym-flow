import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config({ path: '/home/yxu/yxu/gym-app/gym-app/.env' })

const { neon } = require('@neondatabase/serverless')
const bcrypt = require('bcryptjs')

const sql = neon(process.env.DATABASE_URL)

// Check everything about the admin account
const result = await sql(`
  SELECT 
    u.id, u.email, u.name, u.role, u.created_at,
    a.id as account_id, a.provider_id, a.password,
    m.id as member_id, m.status as member_status
  FROM users u 
  LEFT JOIN account a ON u.id = a.user_id 
  LEFT JOIN members m ON u.id = m.user_id
  WHERE u.email = 'admin@gymflow.com'
`)

console.log("Admin account details:")
for (const r of result) {
  console.log(JSON.stringify(r, null, 2))
}

// Try to verify the password
const storedHash = result[0]?.password
if (storedHash) {
  const isValid = await bcrypt.compare("password123", storedHash)
  console.log("\nPassword verification:", isValid)
}
