import { PrismaClient } from '@prisma/client'

import { TIERS } from '../src/lib/route'

const db = new PrismaClient()

async function main() {
  for (const name of TIERS) {
    await db.tier.upsert({
      where: { name },
      update: {},
      create: { name, loadPct: 0 },
    })
  }
  console.log(`seeded ${TIERS.length} tiers`)
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())