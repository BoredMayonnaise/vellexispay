import { describe, expect, it } from 'vitest'

import { isTier, resolveRoute, TIERS, type TierLoad } from './route'

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

describe('F1 regression: resolveRoute terminates on hostile input', () => {
  // Before the fix, CHEAPER[junk] was undefined and `undefined !== null`, so the
  // while-loop never exited. These asserts would hang the suite, not fail it.
  const junk = ['../../etc/passwd', '__proto__', 'constructor', 'toString', '', 'DR', 0, null, {}]

  it.each(junk)('sheds without hanging on %o', (input) => {
    expect(resolveRoute(input, {})).toEqual({ tier: 'premium', shed: true })
  })

  it('sheds on prototype-polluted load keys', () => {
    // JSON.parse puts __proto__ as an own property, leaving the real tier keys
    // absent — so isTierLoad fails and we shed on a tier we still recognise.
    expect(resolveRoute('draft', JSON.parse('{"__proto__": 0}'))).toEqual({
      tier: 'draft',
      shed: true,
    })
  })

  it('never walks more hops than there are tiers', () => {
    expect(TIERS.length).toBe(3)
    expect(resolveRoute('draft', load(100, 100, 100)).shed).toBe(true)
  })
})

describe('F2 regression: unusable load fails closed', () => {
  const bad: unknown[] = [null, undefined, 'draft,standard,premium', 42, [100, 0, 0]]

  it.each(bad)('sheds on load %o', (input) => {
    expect(resolveRoute('draft', input)).toEqual({ tier: 'draft', shed: true })
  })

  it('sheds when a single tier key is non-numeric', () => {
    expect(resolveRoute('premium', { ...load(0, 0, 0), standard: 'x' })).toEqual({
      tier: 'premium',
      shed: true,
    })
  })

  it('sheds on NaN and Infinity', () => {
    expect(resolveRoute('draft', load(NaN, 0, 0)).shed).toBe(true)
    expect(resolveRoute('draft', load(Infinity, 0, 0)).shed).toBe(true)
  })
})

describe('isTier', () => {
  it('accepts the three real tiers', () => {
    for (const tier of TIERS) expect(isTier(tier)).toBe(true)
  })

  it('rejects everything else', () => {
    for (const bad of ['DRAFT', 'premium ', '', 0, null, undefined, {}, []]) {
      expect(isTier(bad)).toBe(false)
    }
  })
})