import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config({ path: '/home/yxu/yxu/gym-app/gym-app/.env' })

const { neon } = require('@neondatabase/serverless')
const bcrypt = require('bcryptjs')

const sql = neon(process.env.DATABASE_URL)

// Find the user and manually verify the password
async function testLogin() {
  const email = "admin@gymflow.com"
  const password = "password123"
  
  // Get user and account
  const result = await sql(`
    SELECT u.id, u.email, a.password 
    FROM users u 
    JOIN account a ON u.id = a.user_id 
    WHERE u.email = $1 AND a.provider_id = 'email'
  `, [email])
  
  if (result.length === 0) {
    console.log("❌ User not found")
    return
  }
  
  const user = result[0]
  console.log("✅ User found:", user.email)
  console.log("   User ID:", user.id)
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.password)
  console.log("   Password valid:", isValid)
  
  if (!isValid) {
    console.log("   Stored hash:", user.password.substring(0, 20) + "...")
    
    // Try generating a new hash
    const newHash = await bcrypt.hash(password, 10)
    console.log("   New hash:", newHash.substring(0, 20) + "...")
  }
}

testLogin()
