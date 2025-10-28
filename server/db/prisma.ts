// Load environment variables first
import dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'

// Create a single Prisma Client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Enable query logging (helpful for learning!)
})

// Handle cleanup on shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
