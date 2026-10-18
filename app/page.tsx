import { db } from '@/lib/db'
import { SATURATION } from '@/lib/route'

// Tiers are live load data; prerendering at build time would freeze stale numbers.
export const dynamic = 'force-dynamic'

const pct = (n: number) => Math.round(Math.min(Math.max(n, 0), 100))

export default async function Page() {
  const tiers = await db.tier.findMany({
    orderBy: { name: 'desc' },
    include: { _count: { select: { models: true } } },
  })

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
            const load = pct(tier.loadPct)
            const saturated = load >= SATURATION

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
                    {load}% · {tier._count.models} models
                  </span>
                </div>

                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-surface"
                  role="progressbar"
                  aria-label={`${tier.name} load`}
                  aria-valuenow={load}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={saturated ? 'h-full bg-danger' : 'h-full bg-accent'}
                    style={{ width: `${load}%` }}
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