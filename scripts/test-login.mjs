import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config({ path: '/home/yxu/yxu/gym-app/gym-app/.env' })

const bcrypt = require('bcryptjs')

// Get the stored hash
const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

const accounts = await sql(`
  SELECT a.*, u.email 
  FROM account a 
  JOIN users u ON a.user_id = u.id 
  WHERE u.email = 'admin@gymflow.com'
`)

if (accounts.length > 0) {
  const storedHash = accounts[0].password
  console.log("Stored hash:", storedHash)
  
  // Try to verify
  const isValid = await bcrypt.compare("password123", storedHash)
  console.log("Is valid password:", isValid)
  
  // Try different common bcrypt versions
  const hash2a = await bcrypt.hash("password123", 10)
  console.log("\n$2a$ hash:", hash2a.substring(0, 4))
  const isValid2a = await bcrypt.compare("password123", hash2a)
  console.log("$2a$ is valid:", isValid2a)
} else {
  console.log("No account found")
}
