import { beforeEach, describe, expect, it } from 'vitest'
import {
  MY_BANKER_CLIENTS,
  MY_BANKER_MIN_PEER_GROUP,
  MY_BANKER_PEERS,
  MY_BANKER_RETAIL_CATALOGUE,
  type MyBankerCatalogueProduct,
  type MyBankerPeer,
} from '@/data/myBankerCore'
import {
  analyzeMyBanker,
  buildPeerGroup,
  buildRecommendations,
  clampToRange,
  deriveAge,
  getAgeBand,
  getHeldProductKeys,
  getCoverage,
  getIncomeBand,
  getLeadRecommendation,
  getMyBankerEventLog,
  recordMyBankerEvent,
  resetMyBankerEventLog,
  resolveRate,
  simulateProduct,
} from '@/app/screens/my-banker/myBankerState'
import type { Product } from '@/data/products'

const TODAY = new Date('2026-09-10T12:00:00Z')

function product(key: MyBankerCatalogueProduct['key']): MyBankerCatalogueProduct {
  const found = MY_BANKER_RETAIL_CATALOGUE.find((candidate) => candidate.key === key)
  if (!found) throw new Error(`unknown catalogue product ${key}`)
  return found
}

describe('My Banker bands', () => {
  it('derives age from the date of birth without counting an unreached birthday', () => {
    expect(deriveAge('1988-04-17', TODAY)).toBe(38)
    expect(deriveAge('1988-09-11', TODAY)).toBe(37)
    expect(deriveAge('1988-09-10', TODAY)).toBe(38)
    expect(deriveAge('not-a-date', TODAY)).toBeNull()
  })

  it('places ages in the five bands from the spec', () => {
    expect(getAgeBand(24)?.id).toBe('under-25')
    expect(getAgeBand(25)?.id).toBe('25-34')
    expect(getAgeBand(44)?.id).toBe('35-44')
    expect(getAgeBand(45)?.id).toBe('45-54')
    expect(getAgeBand(80)?.id).toBe('55-plus')
  })

  it('places monthly income in the four bands from the spec', () => {
    expect(getIncomeBand(1_499)?.id).toBe('to-1499')
    expect(getIncomeBand(1_500)?.id).toBe('1500-2499')
    expect(getIncomeBand(3_499)?.id).toBe('2500-3499')
    expect(getIncomeBand(3_500)?.id).toBe('3500-plus')
  })
})

describe('My Banker peer group', () => {
  it('keeps only peers matching both the age band and the income band', () => {
    const group = buildPeerGroup(MY_BANKER_CLIENTS.established, MY_BANKER_PEERS, TODAY)

    expect(group?.ageBand.id).toBe('35-44')
    expect(group?.incomeBand.id).toBe('2500-3499')
    expect(group?.size).toBe(24)
    expect(group?.peers.every((peer) => peer.age >= 35 && peer.age <= 44)).toBe(true)
    expect(
      group?.peers.every((peer) => peer.monthlyIncomeEur >= 2_500 && peer.monthlyIncomeEur <= 3_499),
    ).toBe(true)
    expect(group?.isPublishable).toBe(true)
  })

  it('marks a group under the minimum size as not publishable', () => {
    const group = buildPeerGroup(MY_BANKER_CLIENTS.prospect, MY_BANKER_PEERS, TODAY)

    expect(group?.size).toBe(3)
    expect(group?.size).toBeLessThan(MY_BANKER_MIN_PEER_GROUP)
    expect(group?.isPublishable).toBe(false)
  })
})

describe('My Banker recommendations', () => {
  const peers: MyBankerPeer[] = [
    { id: 'a', age: 40, monthlyIncomeEur: 3_000, products: ['overdraft', 'credit-card'] },
    { id: 'b', age: 41, monthlyIncomeEur: 3_100, products: ['overdraft', 'credit-card'] },
    { id: 'c', age: 42, monthlyIncomeEur: 3_200, products: ['overdraft'] },
    { id: 'd', age: 43, monthlyIncomeEur: 3_300, products: ['overdraft'] },
    { id: 'e', age: 44, monthlyIncomeEur: 3_400, products: ['cash-loan'] },
  ]

  it('sorts by adoption descending and marks held products as in use', () => {
    const group = buildPeerGroup(MY_BANKER_CLIENTS.established, peers, TODAY)
    const rows = buildRecommendations(group, new Set(['credit-card']))

    expect(rows.map((row) => row.product.key).slice(0, 3)).toEqual([
      'overdraft',
      'credit-card',
      'cash-loan',
    ])
    expect(rows[0]).toMatchObject({ adoptionPercent: 80, peersUsing: 4, status: 'recommended' })
    expect(rows[1]).toMatchObject({ adoptionPercent: 40, status: 'in-use' })
    expect(rows[2]).toMatchObject({ adoptionPercent: 20, status: 'recommended' })
  })

  it('keeps every catalogue product visible, including unused ones', () => {
    const group = buildPeerGroup(MY_BANKER_CLIENTS.established, peers, TODAY)
    const rows = buildRecommendations(group, new Set())

    expect(rows).toHaveLength(MY_BANKER_RETAIL_CATALOGUE.length)
    expect(rows.filter((row) => row.adoptionPercent === 0)).toHaveLength(3)
  })

  it('publishes no percentage and no peer count below the minimum group size', () => {
    const group = buildPeerGroup(MY_BANKER_CLIENTS.established, peers.slice(0, 4), TODAY)
    const rows = buildRecommendations(group, new Set())

    expect(group?.isPublishable).toBe(false)
    expect(rows.every((row) => row.adoptionPercent === null && row.peersUsing === null)).toBe(true)
    expect(rows.map((row) => row.product.key)).toEqual(
      MY_BANKER_RETAIL_CATALOGUE.map((entry) => entry.key),
    )
  })

  it('sorts "no info" rows last when only some rows have data', () => {
    const group = buildPeerGroup(MY_BANKER_CLIENTS.established, peers, TODAY)
    const rows = buildRecommendations(group, new Set())
    const firstNoData = rows.findIndex((row) => row.adoptionPercent === 0)

    expect(rows.slice(0, firstNoData).every((row) => (row.adoptionPercent ?? 0) > 0)).toBe(true)
  })
})

describe('My Banker held products', () => {
  it('maps the retail portfolio onto catalogue keys and ignores unrelated types', () => {
    const portfolio = [
      { id: '1', type: 'credit_card', name: 'Credit card', accountNumber: '', balance: 0, currency: 'RSD' },
      { id: '2', type: 'term_deposit', name: 'Deposit', accountNumber: '', balance: 0, currency: 'RSD' },
      { id: '3', type: 'saving_account', name: 'Savings', accountNumber: '', balance: 0, currency: 'RSD' },
      { id: '4', type: 'current_account', name: 'Current', accountNumber: '', balance: 0, currency: 'RSD' },
    ] as unknown as Product[]

    expect([...getHeldProductKeys(portfolio)].sort()).toEqual(['credit-card', 'term-deposit'])
  })
})

describe('My Banker rates and simulation', () => {
  it('reads the rate Core parameterized for the amount, currency and term', () => {
    const deposit = product('term-deposit')

    expect(resolveRate(deposit, { currency: 'RSD', amount: 600_000, termMonths: 12 })).toBe(4.05)
    expect(resolveRate(deposit, { currency: 'RSD', amount: 600_000, termMonths: 6 })).toBe(3.15)
    expect(resolveRate(deposit, { currency: 'RSD', amount: 2_000_000, termMonths: 12 })).toBe(4.55)
    expect(resolveRate(deposit, { currency: 'EUR', amount: 5_000, termMonths: 24 })).toBe(2.45)
  })

  it('returns no rate when the combination falls outside the rate card', () => {
    expect(resolveRate(product('term-deposit'), { currency: 'RSD', amount: 10, termMonths: 12 })).toBeNull()
    expect(simulateProduct(product('term-deposit'), { currency: 'RSD', amount: 10, termMonths: 12 })).toBeNull()
  })

  it('calculates an annuity installment for lending products', () => {
    const simulation = simulateProduct(product('cash-loan'), {
      currency: 'RSD',
      amount: 900_000,
      termMonths: 48,
    })

    expect(simulation?.kind).toBe('installment')
    expect(simulation?.ratePercent).toBe(12.2)
    expect(simulation?.value).toBeCloseTo(23_788.93, 1)
    expect(simulation?.totalAtMaturity).toBeNull()
  })

  it('calculates an indicative return for deposit and fund products', () => {
    const simulation = simulateProduct(product('term-deposit'), {
      currency: 'RSD',
      amount: 600_000,
      termMonths: 12,
    })

    expect(simulation?.kind).toBe('return')
    expect(simulation?.value).toBeCloseTo(24_300, 0)
    expect(simulation?.totalAtMaturity).toBeCloseTo(624_300, 0)
  })

  it('calculates monthly interest for revolving products, which have no term', () => {
    const simulation = simulateProduct(product('overdraft'), {
      currency: 'RSD',
      amount: 80_000,
      termMonths: 0,
    })

    expect(simulation?.kind).toBe('revolving')
    expect(simulation?.ratePercent).toBe(23.9)
    expect(simulation?.value).toBeCloseTo(1_593.33, 2)
  })

  it('clamps an entered amount into the configured range and step', () => {
    const range = { min: 10_000, max: 300_000, step: 5_000 }

    expect(clampToRange(1, range)).toBe(10_000)
    expect(clampToRange(999_999, range)).toBe(300_000)
    expect(clampToRange(82_400, range)).toBe(80_000)
  })
})

describe('My Banker analysis entry point', () => {
  it('falls back to an unavailable state for an out-of-scope client type', () => {
    expect(
      analyzeMyBanker({
        client: { ...MY_BANKER_CLIENTS.established, clientType: 'PL' },
        peers: MY_BANKER_PEERS,
        heldProducts: [],
        today: TODAY,
      }),
    ).toEqual({ state: 'unavailable' })
  })

  it('falls back to an unavailable state when the date of birth cannot be read', () => {
    expect(
      analyzeMyBanker({
        client: { ...MY_BANKER_CLIENTS.established, dateOfBirth: '' },
        peers: MY_BANKER_PEERS,
        heldProducts: [],
        today: TODAY,
      }),
    ).toEqual({ state: 'unavailable' })
  })

  it('returns a ready analysis for the shipped Serbian persona', () => {
    const analysis = analyzeMyBanker({
      client: MY_BANKER_CLIENTS.established,
      peers: MY_BANKER_PEERS,
      heldProducts: [],
      today: TODAY,
    })

    expect(analysis.state).toBe('ready')
    if (analysis.state !== 'ready') return
    expect(analysis.peerGroup.size).toBe(24)
    expect(analysis.recommendations[0]?.product.key).toBe('overdraft')
    expect(analysis.recommendations[0]?.adoptionPercent).toBe(63)
    expect(analysis.recommendations.every((row) => row.status === 'recommended')).toBe(true)
  })
})

describe('My Banker tracking', () => {
  beforeEach(() => {
    resetMyBankerEventLog()
  })

  it('records view, expand, simulation and submission as distinct events', () => {
    const base = { clientId: 'RS-1', productKey: 'overdraft', timestamp: '2026-09-10T10:00:00.000Z' } as const

    recordMyBankerEvent({ ...base, type: 'card_view' })
    recordMyBankerEvent({ ...base, type: 'card_expand' })
    recordMyBankerEvent({ ...base, type: 'simulation_run', detail: { amount: 80_000 } })
    recordMyBankerEvent({ ...base, type: 'send_request', detail: { amount: 80_000 } })

    expect(getMyBankerEventLog().map((event) => event.type)).toEqual([
      'card_view',
      'card_expand',
      'simulation_run',
      'send_request',
    ])
    expect(getMyBankerEventLog()[3]).toMatchObject({
      clientId: 'RS-1',
      productKey: 'overdraft',
      timestamp: '2026-09-10T10:00:00.000Z',
    })
  })
})

describe('My Banker coverage and lead', () => {
  const peers: MyBankerPeer[] = [
    { id: 'a', age: 40, monthlyIncomeEur: 3_000, products: ['overdraft', 'credit-card'] },
    { id: 'b', age: 41, monthlyIncomeEur: 3_100, products: ['overdraft', 'credit-card'] },
    { id: 'c', age: 42, monthlyIncomeEur: 3_200, products: ['overdraft'] },
    { id: 'd', age: 43, monthlyIncomeEur: 3_300, products: ['overdraft'] },
    { id: 'e', age: 44, monthlyIncomeEur: 3_400, products: ['cash-loan'] },
  ]

  it('counts what the client holds against the catalogue, in catalogue order', () => {
    const group = buildPeerGroup(MY_BANKER_CLIENTS.established, peers, TODAY)
    const coverage = getCoverage(buildRecommendations(group, new Set(['credit-card', 'term-deposit'])))

    expect(coverage).toMatchObject({ held: 2, total: MY_BANKER_RETAIL_CATALOGUE.length })
    expect(coverage.segments.map((segment) => segment.key)).toEqual(
      MY_BANKER_RETAIL_CATALOGUE.map((product) => product.key),
    )
    expect(coverage.segments.filter((segment) => segment.held).map((segment) => segment.key).sort()).toEqual([
      'credit-card',
      'term-deposit',
    ])
  })

  it('leads with the most-used product the client does not hold', () => {
    const group = buildPeerGroup(MY_BANKER_CLIENTS.established, peers, TODAY)

    expect(getLeadRecommendation(buildRecommendations(group, new Set()))?.product.key).toBe('overdraft')
    expect(getLeadRecommendation(buildRecommendations(group, new Set(['overdraft'])))?.product.key).toBe(
      'credit-card',
    )
  })

  it('has no lead to argue for when the peer group is unpublishable', () => {
    const group = buildPeerGroup(MY_BANKER_CLIENTS.established, peers.slice(0, 4), TODAY)

    expect(getLeadRecommendation(buildRecommendations(group, new Set()))).toBeNull()
  })

  it(`opens every simulation on a group figure inside the product own range`, () => {
    MY_BANKER_RETAIL_CATALOGUE.forEach((product) => {
      const range = product.amountRanges.find((entry) => entry.currency === product.peerTypical.currency)
      expect(range, `${product.key} has no range for its typical currency`).toBeDefined()
      expect(product.peerTypical.amount).toBeGreaterThanOrEqual(range!.min)
      expect(product.peerTypical.amount).toBeLessThanOrEqual(range!.max)

      if (product.termMonths) {
        expect(product.peerTypical.termMonths).not.toBeNull()
        expect(product.peerTypical.termMonths!).toBeGreaterThanOrEqual(product.termMonths.min)
        expect(product.peerTypical.termMonths!).toBeLessThanOrEqual(product.termMonths.max)
      } else {
        expect(product.peerTypical.termMonths).toBeNull()
      }

      expect(
        simulateProduct(product, {
          currency: product.peerTypical.currency,
          amount: product.peerTypical.amount,
          termMonths: product.peerTypical.termMonths ?? 0,
        }),
        `${product.key} has no rate at the group figure`,
      ).not.toBeNull()
    })
  })
})
