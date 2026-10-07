import { describe, expect, it } from 'vitest'
import { getFrequentBeneficiaries } from '@/data/paymentsHub'
import { getExchangeRateRows } from '@/data/exchangeRates'
import {
  getPaymentTemplates,
  getSavedBeneficiaries,
  type PaymentTemplateSelection,
} from '@/data/paymentTemplates'
import { createTemplateDomesticPaymentDraft } from '@/data/paymentFlow'

describe('Payments shortcut data', () => {
  it('uses fictional template and beneficiary data instead of the supplied reference identities', () => {
    const serialized = JSON.stringify([
      ...getPaymentTemplates('RO'),
      ...getSavedBeneficiaries('RO', false),
    ])

    expect(getPaymentTemplates('RO')).toHaveLength(5)
    expect(getSavedBeneficiaries('RO', false)).toHaveLength(3)
    expect(serialized).not.toMatch(/PANAITESCU|LIL PUT|CRASMARU|NIPAA|IANCULUI/i)
    expect(serialized).toMatch(/Green Energy|Maria Popescu/i)
  })

  it('prefills amount and note for a template but leaves amount empty for a beneficiary', () => {
    const template = getPaymentTemplates('RO')[0]!
    const beneficiary = getSavedBeneficiaries('RO', false)[0]!

    const templateDraft = createTemplateDomesticPaymentDraft(template, 'RO')
    const beneficiaryDraft = createTemplateDomesticPaymentDraft(beneficiary, 'RO')

    expect(templateDraft).toMatchObject({
      beneficiaryName: template.beneficiaryName,
      accountNumber: template.accountNumber,
      amount: template.amount,
      informationForBeneficiary: template.paymentNote,
      currency: 'RON',
    })
    expect(beneficiaryDraft).toMatchObject({
      beneficiaryName: beneficiary.beneficiaryName,
      accountNumber: beneficiary.accountNumber,
      amount: '',
      informationForBeneficiary: '',
      currency: 'RON',
    })
  })

  it('synchronizes CZ beneficiaries with the hub while preserving payment details', () => {
    const hub = getFrequentBeneficiaries('CZ')
    const saved = getSavedBeneficiaries('CZ', true)
    expect(hub.length).toBeGreaterThan(0)
    expect(saved.map((selection) => selection.id)).toEqual(hub.map((person) => person.id))
    for (const person of hub) {
      const selection = saved.find((candidate) => candidate.id === person.id)!
      expect(selection).toMatchObject({
        kind: 'beneficiary', beneficiaryName: person.name,
        paymentAccountNumber: person.paymentAccountNumber, bankCode: person.paymentBankCode,
        currency: person.currency, amount: '', paymentNote: '',
      })
      const draft = createTemplateDomesticPaymentDraft(selection, 'CZ')
      expect(draft.accountNumber).toBe(person.paymentAccountNumber)
      expect(draft.bankCode).toBe(person.paymentBankCode)
      expect(draft.accountNumber).not.toContain('*')
    }
  })

  it('recalculates target values when the source currency changes', () => {
    const ronRows = getExchangeRateRows(10, 'RON')
    const eurFromRon = ronRows.find((row) => row.currency === 'EUR')
    const eurRows = getExchangeRateRows(10, 'EUR')
    const ronFromEur = eurRows.find((row) => row.currency === 'RON')

    expect(ronRows.some((row) => row.currency === 'RON')).toBe(false)
    expect(eurRows.some((row) => row.currency === 'EUR')).toBe(false)
    expect(eurFromRon?.convertedAmount).toBeCloseTo(1.9092, 4)
    expect(ronFromEur?.convertedAmount).toBeCloseTo(52.379, 4)
    expect(eurFromRon?.unitRate).toBeCloseTo(5.2379, 4)
    expect(ronFromEur?.unitRate).toBeCloseTo(0.1909, 4)
  })

  it('keeps the selection contract compatible with either templates or beneficiaries', () => {
    const selections: PaymentTemplateSelection[] = [
      getPaymentTemplates('RO')[0]!,
      getSavedBeneficiaries('RO', false)[0]!,
    ]

    expect(selections.map(({ kind }) => kind)).toEqual(['template', 'beneficiary'])
  })
})
