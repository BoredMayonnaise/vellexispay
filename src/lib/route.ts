export const TIERS = ['draft', 'standard', 'premium'] as const

export type Tier = (typeof TIERS)[number]

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
 */
export function resolveRoute(tier: Tier, load: TierLoad): RouteResult {
  let candidate: Tier | null = tier

  while (candidate !== null) {
    if (load[candidate] < SATURATION) {
      return { tier: candidate, shed: false }
    }
    candidate = CHEAPER[candidate]
  }

  return { tier, shed: true }
}