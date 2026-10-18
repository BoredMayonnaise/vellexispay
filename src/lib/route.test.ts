import { describe, expect, it } from 'vitest'

import { resolveRoute, type TierLoad } from './route'

const load = (draft: number, standard: number, premium: number): TierLoad => ({
  draft,
  standard,
  premium,
})

const IDLE = load(0, 0, 0)

describe('resolveRoute', () => {
  it('serves the requested tier when it has capacity', () => {
    expect(resolveRoute('draft', IDLE)).toEqual({ tier: 'draft', shed: false })
    expect(resolveRoute('standard', IDLE)).toEqual({ tier: 'standard', shed: false })
    expect(resolveRoute('premium', IDLE)).toEqual({ tier: 'premium', shed: false })
  })

  it('serves at the saturation boundary, treating 100 as full', () => {
    expect(resolveRoute('premium', load(0, 0, 99.9))).toEqual({
      tier: 'premium',
      shed: false,
    })
    expect(resolveRoute('premium', load(0, 0, 100))).toEqual({
      tier: 'standard',
      shed: false,
    })
  })

  it('degrades to the next cheaper tier when the requested tier is full', () => {
    expect(resolveRoute('premium', load(0, 50, 100))).toEqual({
      tier: 'standard',
      shed: false,
    })
    expect(resolveRoute('standard', load(10, 100, 100))).toEqual({
      tier: 'draft',
      shed: false,
    })
  })

  it('skips a saturated fallback and degrades two tiers', () => {
    expect(resolveRoute('premium', load(0, 100, 100))).toEqual({
      tier: 'draft',
      shed: false,
    })
  })

  it('never upgrades a draft request to a costlier tier', () => {
    expect(resolveRoute('draft', load(100, 0, 0))).toEqual({ tier: 'draft', shed: true })
  })

  it('sheds only when every tier is saturated', () => {
    expect(resolveRoute('premium', load(100, 100, 100))).toEqual({
      tier: 'premium',
      shed: true,
    })
  })

  it('treats negative load as unsaturated', () => {
    expect(resolveRoute('draft', load(-1, 100, 100))).toEqual({
      tier: 'draft',
      shed: false,
    })
  })
})