import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Try to understand how better-auth works
const betterAuthPkg = require('better-auth/package.json')
console.log("Better-Auth version:", betterAuthPkg.version)

const drizzleAdapter = require('better-auth/adapters/drizzle')
console.log("Drizzle adapter:", typeof drizzleAdapter)
