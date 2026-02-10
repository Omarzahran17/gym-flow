import bcrypt from 'bcryptjs'

const password = "password123"

const hash = await bcrypt.hash(password, 10)
console.log("Hash:", hash)
console.log("Length:", hash.length)

const isValid = await bcrypt.compare(password, hash)
console.log("Valid:", isValid)
