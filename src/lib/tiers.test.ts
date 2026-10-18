import { describe, expect, it } from 'vitest'

import { clampLoad, toTierLoad } from './tiers'

describe('clampLoad', () => {
  it('passes through in-range integers', () => {
    expect(clampLoad(0)).toBe(0)
    expect(clampLoad(50)).toBe(50)
    expect(clampLoad(99)).toBe(99)
    expect(clampLoad(100)).toBe(100)
  })

  it('clamps out-of-range values', () => {
    expect(clampLoad(-1)).toBe(0)
    expect(clampLoad(-1e9)).toBe(0)
    expect(clampLoad(101)).toBe(100)
    expect(clampLoad(1e9)).toBe(100)
  })

  it('truncates fractional values', () => {
    expect(clampLoad(42.9)).toBe(42)
    expect(clampLoad(0.4)).toBe(0)
  })

  it('returns 0 for non-numeric and non-finite input', () => {
    for (const bad of ['50', null, undefined, {}, [], NaN, Infinity, -Infinity, true]) {
      expect(clampLoad(bad)).toBe(0)
    }
  })

  it('returns 0 for a Symbol or BigInt without throwing', () => {
    expect(clampLoad(Symbol('x'))).toBe(0)
    expect(clampLoad(10n)).toBe(0)
  })
})

describe('toTierLoad', () => {
  it('fills all three tiers', () => {
    expect(toTierLoad({ draft: 10, standard: 20, premium: 30 })).toEqual({
      draft: 10,
      standard: 20,
      premium: 30,
    })
  })

  it('defaults missing tiers to 0 instead of throwing', () => {
    expect(toTierLoad({})).toEqual({ draft: 0, standard: 0, premium: 0 })
    expect(toTierLoad({ standard: 5 })).toEqual({ draft: 0, standard: 5, premium: 0 })
  })

  it('clamps each tier independently', () => {
    expect(toTierLoad({ draft: -5, standard: 250, premium: 33.7 })).toEqual({
      draft: 0,
      standard: 100,
      premium: 33,
    })
  })

  it('ignores unknown and inherited keys', () => {
    expect(toTierLoad({ draft: 1, admin: 99, __proto__: 50 })).toEqual({
      draft: 1,
      standard: 0,
      premium: 0,
    })
  })
})