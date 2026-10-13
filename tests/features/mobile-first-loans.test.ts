import { describe, expect, it } from 'vitest'
import {
  buildLoanPortfolio,
  calculateMortgagePayment,
  validateMortgageStep,
  moveLoanFavorite,
  validateLoanName,
  isMortgageSimulation,
  createCreditDemoPdf,
} from '@/features/credit/mobileFirstLoans'

describe('Italian credit policies', () => {
  it('rejects corrupted persisted simulations instead of treating them as valid results', () => {
    const simulation = {
      id: 'saved',
      name: 'Casa',
      createdAt: '2026-10-12T12:00:00',
      rates: ['Fisso'],
      draft: {
        purpose: 'Acquisto',
        firstHome: true,
        propertyValue: 165000,
        principal: 80000,
        birthDate: '1998-06-28',
        years: 30,
      },
    }
    expect(isMortgageSimulation(simulation)).toBe(true)
    expect(isMortgageSimulation({ ...simulation, expired: 'false' })).toBe(false)
    expect(isMortgageSimulation({ ...simulation, rates: ['unknown'] })).toBe(false)
    expect(isMortgageSimulation({ ...simulation, rates: [] })).toBe(false)
    expect(isMortgageSimulation({ ...simulation, draft: { ...simulation.draft, principal: -1 } })).toBe(false)
  })
  it('produces a valid PDF cross-reference table for the actual demo document', () => {
    const pdf = createCreditDemoPdf('Attestazione interessi', ['Mutuo Casa Milano', 'Capitale 27.579,00 EUR'])
    expect(pdf).toContain('%PDF-1.4')
    expect(pdf).toContain('Documento dimostrativo - PI Italy')
    const offset = Number(pdf.match(/startxref\n(\d+)/)?.[1])
    expect(pdf.slice(offset)).toMatch(/^xref\n0 6/)
    expect(pdf).toContain('Capitale 27.579,00 EUR')
  })
  it('builds exactly the configured loan mix with stable unique identities', () => {
    expect(buildLoanPortfolio({ mortgages: 0, loans: 0 })).toEqual([])
    const loans = buildLoanPortfolio({ mortgages: 3, loans: 4 })
    expect(loans).toHaveLength(7)
    expect(new Set(loans.map((loan) => loan.id)).size).toBe(7)
    expect(loans.filter((loan) => loan.kind === 'Mutuo')).toHaveLength(3)
    expect(loans[0]?.id).toBe('mortgage-milano')
  })
  it('calculates changing principal, duration, and zero-interest payments', () => {
    expect(calculateMortgagePayment(80000, 30, 3.45)).toBeCloseTo(357.01, 2)
    expect(calculateMortgagePayment(160000, 30, 3.45)).toBeCloseTo(714.01, 2)
    expect(calculateMortgagePayment(12000, 10, 0)).toBe(100)
    expect(() => calculateMortgagePayment(0, 30, 3.45)).toThrow()
  })
  it('enforces the Figma adult and maximum maturity age requirements', () => {
    const draft = {
      purpose: 'Acquisto',
      firstHome: true,
      propertyValue: 165000,
      principal: 80000,
      birthDate: '1998-06-28',
      years: 30,
    }
    const today = new Date('2026-10-12T12:00:00Z')
    expect(validateMortgageStep(5, draft, today)).toBeNull()
    expect(validateMortgageStep(5, { ...draft, birthDate: '2010-01-01' }, today)).toBeTruthy()
    expect(validateMortgageStep(6, { ...draft, birthDate: '1950-01-01' }, today)).toBeTruthy()
    expect(validateMortgageStep(4, { ...draft, principal: 166000 }, today)).toBeTruthy()
  })
  it('moves favorites without losing or duplicating products and validates rename input', () => {
    expect(moveLoanFavorite(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c'])
    expect(moveLoanFavorite(['a', 'b'], 'a', -1)).toEqual(['a', 'b'])
    expect(validateLoanName('Casa Milano')).toBeNull()
    expect(validateLoanName('')).toBeTruthy()
    expect(validateLoanName('a'.repeat(21))).toBeTruthy()
    expect(validateLoanName('Casa <script>')).toBeTruthy()
  })
})
