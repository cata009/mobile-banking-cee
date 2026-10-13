import { describe, expect, it } from 'vitest'
import {
  initialSecuritiesState,
  recordSecuritiesAssemblyTicket,
  validateSecuritiesAssemblyMobileCode,
  validateSecuritiesAssemblyRequest,
} from '@/features/investments/mobileFirstSecurities'

describe('canonical securities assembly policy', () => {
  it.each(['', '0', '-1', '1.5', '3', 'NaN', 'Infinity', '2,0'])(
    'rejects invalid requested shares %s with the unchanged source message',
    (quantity) =>
      expect(validateSecuritiesAssemblyRequest(quantity, 2)).toBe('Inserisci una quantità intera tra 1 e 2.'),
  )
  it.each(['1', '2', '2.0', ' 2 ', '1e0'])('retains the legacy Number conversion for valid shares %s', (quantity) =>
    expect(validateSecuritiesAssemblyRequest(quantity, 2)).toBeNull(),
  )
  it('matches the characterized source policy across assembly capacities and boundary quantities', () => {
    for (const available of [0, 2, 12]) {
      for (const quantity of ['', '0', '1', '1.5', '2', '3', '12', '13', '1e1', '2,0', 'Infinity']) {
        const legacyQuantity = Number(quantity)
        const legacyError =
          !Number.isInteger(legacyQuantity) || legacyQuantity < 1 || legacyQuantity > available
            ? `Inserisci una quantità intera tra 1 e ${available}.`
            : null
        expect(validateSecuritiesAssemblyRequest(quantity, available)).toBe(legacyError)
      }
    }
  })
  it.each(['', '000000', '12345', '123456 ', ' 123456', '1234567'])('rejects every non-exact Mobile Code %s', (code) =>
    expect(validateSecuritiesAssemblyMobileCode(code)).toBe('Mobile Code non corretto. Riprova.'),
  )
  it('accepts only the source demo Mobile Code', () => {
    expect(validateSecuritiesAssemblyMobileCode('123456')).toBeNull()
  })
  it('records one ticket per request without changing shares, orders, lists, or virtual portfolios', () => {
    const state = initialSecuritiesState()
    const before = structuredClone(state)
    const next = recordSecuritiesAssemblyTicket(state, 'A2A SPA')
    expect(next.assemblyTickets).toEqual({ ...state.assemblyTickets, 'A2A SPA': 1 })
    expect(recordSecuritiesAssemblyTicket(next, 'A2A SPA').assemblyTickets['A2A SPA']).toBe(2)
    expect(recordSecuritiesAssemblyTicket(state, 'We Build SPA').assemblyTickets['We Build SPA']).toBe(2)
    expect(next.orders).toBe(state.orders)
    expect(next.watchlists).toBe(state.watchlists)
    expect(next.virtualPortfolios).toBe(state.virtualPortfolios)
    expect(next.searchHistory).toBe(state.searchHistory)
    expect(state).toEqual(before)
  })
})
