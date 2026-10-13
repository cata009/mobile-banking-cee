import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'
import { createInsuranceExport } from '@/features/insurance/mobileFirstInsuranceExports'
import {
  filterInsuranceDocuments,
  getInsuranceActions,
  insurancePremiumCents,
  getInsuranceFavorites,
  saveInsuranceFavorites,
  normalizeInsuranceFavorites,
  selectHomepageInsurance,
  selectInsuranceFavorite,
  validateInsuranceDocumentFilter,
  type InsurancePolicy,
  type InsuranceDocument,
} from '@/features/insurance/mobileFirstInsurance'
import { ITALY_INSURANCE_POLICIES, insuranceDocuments } from '@/experiences/pi/it/mobile-first/insuranceContent'

describe('Insurance feature policies', () => {
  it('keeps preferences scoped to a portfolio and ignores its record order', () => {
    const subset = ITALY_INSURANCE_POLICIES.filter((p) => p.id === 'auto-12' || p.id === 'futuro-25')
    saveInsuranceFavorites(['futuro-25'], subset)
    expect(getInsuranceFavorites([...subset].reverse())).toEqual(['futuro-25'])
    expect(getInsuranceFavorites(ITALY_INSURANCE_POLICIES)).toBeNull()
  })
  it('exports a real workbook with escaped literal cells and rejects cross-policy documents', () => {
    const policy = ITALY_INSURANCE_POLICIES[0]!
    const document = { ...insuranceDocuments(policy.id)[0]!, title: '=SUM(1,2) & <Contract>' }
    const files = unzipSync(createInsuranceExport(policy, [document], 'xlsx'))
    expect(strFromU8(files['xl/worksheets/sheet1.xml']!)).toContain('=SUM(1,2) &amp; &lt;Contract&gt;')
    expect(strFromU8(files['xl/worksheets/sheet1.xml']!)).toContain('t="inlineStr"')
    expect(() => createInsuranceExport(policy, [{ ...document, policyId: 'auto-12' }], 'pdf')).toThrow()
    const hiddenPdf = strFromU8(createInsuranceExport(policy, [document], 'pdf', true))
    expect(hiddenPdf).toContain('%PDF-')
    expect(hiddenPdf).not.toContain('450.00')
  })
  it('allows two active favorites, excludes inactive policies and honors their order', () => {
    expect(
      normalizeInsuranceFavorites(['famiglia-20', 'incendio-30', 'auto-12', 'annullata-28'], ITALY_INSURANCE_POLICIES),
    ).toEqual(['famiglia-20', 'incendio-30'])
    expect(selectInsuranceFavorite(['famiglia-20', 'incendio-30'], 'futuro-25', ITALY_INSURANCE_POLICIES)).toEqual([
      'futuro-25',
      'famiglia-20',
    ])
    expect(selectHomepageInsurance(ITALY_INSURANCE_POLICIES, ['incendio-30', 'famiglia-20']).map((p) => p.id)).toEqual([
      'incendio-30',
      'famiglia-20',
    ])
  })
  it('keeps modules/documents/management unavailable for an assistance-only product', () => {
    const legacy = ITALY_INSURANCE_POLICIES.find((p) => p.id === 'incendio-30') as InsurancePolicy
    expect(getInsuranceActions(legacy)).toEqual(['contact'])
  })
  it('reconciles the monthly premium with all monthly module premiums in cents', () => {
    expect(insurancePremiumCents(ITALY_INSURANCE_POLICIES.find((p) => p.id === 'famiglia-20')!)).toBe(45000)
  })
  it('validates date ranges and filters real document categories with inclusive endpoints', () => {
    const documents: InsuranceDocument[] = [
      {
        id: 'one',
        policyId: 'famiglia-20',
        title: 'Contratto di polizza',
        category: 'Contratti',
        date: '2024-10-10',
        reference: 'a',
        read: true,
      },
      {
        id: 'two',
        policyId: 'famiglia-20',
        title: 'Set Informativo',
        category: 'Moduli',
        date: '2024-10-19',
        reference: 'b',
        read: true,
      },
    ]
    expect(
      filterInsuranceDocuments(documents, { from: '2024-10-10', to: '2024-10-19', category: 'Contratti' }).map(
        (d) => d.id,
      ),
    ).toEqual(['one'])
    expect(validateInsuranceDocumentFilter({ from: '2025-01-01', to: '2024-01-01', category: '' })).not.toBeNull()
  })
})
