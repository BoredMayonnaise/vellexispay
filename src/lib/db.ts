import { PrismaClient } from '@prisma/client'

// Next.js dev server hot-reloads modules; a global keeps one client per process.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}