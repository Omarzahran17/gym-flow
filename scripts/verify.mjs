import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL)

async function verify() {
  const users = await sql("SELECT u.*, a.password FROM users u LEFT JOIN account a ON u.id = a.user_id WHERE u.email LIKE '%@gymflow.com'")
  
  for (const u of users) {
    console.log(`User: ${u.email}, Role: ${u.role}, Has Password: ${!!u.password}`)
  }
}

verify().catch(console.error)
