export const TIERS = ['draft', 'standard', 'premium'] as const

export type Tier = (typeof TIERS)[number]

/** Runtime guard: types are erased, so any caller can hand us junk. */
export function isTier(value: unknown): value is Tier {
  return typeof value === 'string' && (TIERS as readonly string[]).includes(value)
}

/** Percentage of tier capacity in use, 0-100. */
export type TierLoad = Readonly<Record<Tier, number>>

export interface RouteResult {
  readonly tier: Tier
  /** True when no tier had capacity and the request was shed. */
  readonly shed: boolean
}

/** Load at or above this percent means the tier is saturated. */
export const SATURATION = 100

const CHEAPER: Record<Tier, Tier | null> = {
  premium: 'standard',
  standard: 'draft',
  draft: null,
}

/**
 * Serve the requested tier while it has capacity, else degrade to the next
 * cheaper tier. Never upgrades: a cheaper tier cannot absorb a premium request.
 *
 * Fails closed. An unknown tier or unusable load sheds rather than guessing,
 * and the walk is bounded by TIERS.length so no input can spin it.
 */
export function resolveRoute(tier: unknown, load: unknown): RouteResult {
  if (!isTier(tier) || !isTierLoad(load)) {
    return { tier: isTier(tier) ? tier : 'premium', shed: true }
  }

  let candidate: Tier | null = tier

  for (let hops = 0; candidate !== null && hops < TIERS.length; hops++) {
    if (load[candidate] < SATURATION) {
      return { tier: candidate, shed: false }
    }
    candidate = CHEAPER[candidate]
  }

  return { tier, shed: true }
}

function isTierLoad(value: unknown): value is TierLoad {
  if (typeof value !== 'object' || value === null) return false
  return TIERS.every((tier) => Number.isFinite((value as Record<string, unknown>)[tier]))
}