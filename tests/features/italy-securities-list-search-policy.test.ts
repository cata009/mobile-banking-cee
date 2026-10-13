import { expect, it } from 'vitest'
import { canCreateWatchlist, validateSecuritySearchBounds } from '@/features/investments/mobileFirstSecurities'

it.each([0, 1, 9, 10, 11])('retains the ten-watchlist creation limit at count %s', (count) => {
  expect(canCreateWatchlist(count)).toBe(count < 10)
})

it('keeps the date-bound error ahead of all numeric-bound errors', () => {
  expect(
    validateSecuritySearchBounds({
      maturityFrom: '2025-12-31',
      maturityTo: '2025-01-01',
      minPerformance: '10',
      maxPerformance: '1',
    }),
  ).toBe('La data iniziale deve precedere la data finale.')
})

it.each(['Performance', 'Yield', 'Strike'] as const)('retains source Number conversion for %s ranges', (kind) => {
  const min = `min${kind}` as const
  const max = `max${kind}` as const
  for (const [lower, upper] of [
    ['1', '2'],
    ['2', '1'],
    ['', '1'],
    ['3,5', '1,5'],
    ['1e1', '3'],
    ['0', '-1'],
  ]) {
    const sourceError =
      lower && upper && Number(lower) > Number(upper)
        ? 'Il valore minimo deve essere inferiore al valore massimo.'
        : null
    expect(validateSecuritySearchBounds({ [min]: lower, [max]: upper })).toBe(sourceError)
  }
})

it('allows partial bounds and equal endpoints as the source does', () => {
  expect(validateSecuritySearchBounds({ maturityFrom: '2025-01-01' })).toBeNull()
  expect(
    validateSecuritySearchBounds({
      maturityFrom: '2025-01-01',
      maturityTo: '2025-01-01',
      minPerformance: '2',
      maxPerformance: '2',
    }),
  ).toBeNull()
})
