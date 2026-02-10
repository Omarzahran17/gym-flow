import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const bcrypt = require('bcryptjs')

// Test different bcrypt configurations
async function testBcrypt() {
  const password = "password123"
  
  // Test with different rounds
  for (const rounds of [4, 8, 10, 12]) {
    const hash = await bcrypt.hash(password, rounds)
    const isValid = await bcrypt.compare(password, hash)
    console.log(`Rounds ${rounds}: ${hash.substring(0, 7)}... valid=${isValid}`)
  }
  
  // Test with genSalt
  const salt = await bcrypt.genSalt(10)
  const hashWithSalt = await bcrypt.hash(password, salt)
  const isValid2 = await bcrypt.compare(password, hashWithSalt)
  console.log(`\nWith genSalt(10): ${hashWithSalt.substring(0, 7)}... valid=${isValid2}`)
}

testBcrypt()
