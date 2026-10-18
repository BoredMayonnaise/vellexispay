import { db } from '@/lib/db'
import { isTier, resolveRoute, SATURATION } from '@/lib/route'
import { clampLoad, toTierLoad } from '@/lib/tiers'

// Tiers are live load data; prerendering at build time would freeze stale numbers.
export const dynamic = 'force-dynamic'

export default async function Page() {
  const tiers = await db.tier.findMany({
    orderBy: { name: 'desc' },
    include: { _count: { select: { models: true } } },
  })

  // resolveRoute needs every tier's load at once, since a request degrades across
  // tiers. Missing tiers read as 0 via toTierLoad, never as undefined.
  const load = toTierLoad(Object.fromEntries(tiers.map((t) => [t.name, t.loadPct])))

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Routing tiers</h1>
        <p className="text-sm text-ink-muted">
          Capacity in use per tier. A tier at {SATURATION}% degrades to the next cheaper
          tier.
        </p>
      </header>

      {tiers.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface-raised px-4 py-8 text-center text-sm text-ink-muted">
          No tiers in the database yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tiers.map((tier) => {
            const tierLoad = clampLoad(tier.loadPct)
            const saturated = tierLoad >= SATURATION
            // What resolveRoute would actually do with a request for this tier
            // right now. Prisma returns the enum as a string; isTier guards it.
            const verdict = isTier(tier.name)
              ? resolveRoute(tier.name, load)
              : { tier: null, shed: true }

            return (
              <li
                key={tier.id}
                className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium capitalize">{tier.name}</span>
                  <span
                    className={
                      saturated
                        ? 'font-mono text-sm text-danger'
                        : 'font-mono text-sm text-ink-muted'
                    }
                  >
                    {tierLoad}% · {tier._count.models} models
                  </span>
                </div>

                <p className="text-xs text-ink-muted">
                  {verdict.shed ? (
                    <span className="text-danger">
                      Saturated — requests to this tier would be shed.
                    </span>
                  ) : (
                    <>
                      A request here resolves to{' '}
                      <span className="font-medium capitalize text-ok">
                        {verdict.tier}
                      </span>
                      .
                    </>
                  )}
                </p>

                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-surface"
                  role="progressbar"
                  aria-label={`${tier.name} load`}
                  aria-valuenow={tierLoad}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={saturated ? 'h-full bg-danger' : 'h-full bg-accent'}
                    style={{ width: `${tierLoad}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}