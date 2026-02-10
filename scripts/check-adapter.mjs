import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config({ path: '/home/yxu/yxu/gym-app/gym-app/.env' })

const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL)

// Check all columns in account table
const accountColumns = await sql(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'account'
`)

console.log("Account table columns:")
for (const col of accountColumns) {
  console.log(`  ${col.column_name}: ${col.data_type}`)
}

// Check account entries
const accounts = await sql(`
  SELECT id, account_id, provider_id, user_id, password 
  FROM account 
  WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@gymflow.com')
`)

console.log("\nAccount entries:")
for (const a of accounts) {
  console.log(`  ${a.user_id}:`)
  console.log(`    provider_id: ${a.provider_id}`)
  console.log(`    password: ${a.password?.substring(0, 30)}...`)
}
