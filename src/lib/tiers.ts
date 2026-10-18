import { SATURATION, type Tier, type TierLoad } from './route'

import { db } from './db'

/** Clamp any input to a usable load percentage. Non-finite becomes 0. */
export function clampLoad(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.min(Math.max(Math.trunc(value), 0), SATURATION)
}

/** Build a complete TierLoad, clamping and defaulting every tier. */
export function toTierLoad(partial: Readonly<Record<string, unknown>>): TierLoad {
  return {
    draft: clampLoad(partial.draft),
    standard: clampLoad(partial.standard),
    premium: clampLoad(partial.premium),
  }
}

/** Read current load for all tiers. Missing tiers read as 0, not as an error. */
export async function readTierLoad(): Promise<TierLoad> {
  const rows = await db.tier.findMany({ select: { name: true, loadPct: true } })
  return toTierLoad(Object.fromEntries(rows.map((r) => [r.name, r.loadPct])))
}

/** Persist a clamped load for one tier. Returns false if the tier is unknown. */
export async function setTierLoad(tier: Tier, load: unknown): Promise<boolean> {
  const clamped = clampLoad(load)
  const result = await db.tier.updateMany({
    where: { name: tier },
    data: { loadPct: clamped },
  })
  return result.count > 0
}