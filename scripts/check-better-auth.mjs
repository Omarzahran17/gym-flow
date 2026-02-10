import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config({ path: '/home/yxu/yxu/gym-app/gym-app/.env' })

const bcrypt = require('bcryptjs')

// Check what better-auth might be expecting
const password = "password123"
const hash = await bcrypt.hash(password, 10)
console.log("Our hash:", hash)
console.log("Hash prefix:", hash.substring(0, 4))

// Check if better-auth uses a different bcrypt variant
const hash2 = await bcrypt.hash(password, 10)
console.log("\nSecond hash:", hash2)

// Verify our hash works
const valid = await bcrypt.compare(password, hash)
console.log("\nOur hash is valid:", valid)
