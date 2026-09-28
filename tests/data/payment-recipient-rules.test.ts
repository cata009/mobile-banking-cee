import { describe, expect, it } from 'vitest'
import {
  isCountryCurrencySupported,
  isValidIban,
  isValidSwiftBic,
  isValidUsBankDetails,
  isValidUsRoutingNumber,
  resolveRecipientRoute,
} from '@/data/paymentRecipientRules'

describe('recipient payment rules', () => {
  it('uses the local account format only for domestic CZK in Czechia', () => {
    expect(resolveRecipientRoute('CZ', 'CZ', 'CZK')).toBe('cz-domestic')
    expect(resolveRecipientRoute('CZ', 'CZ', 'EUR')).toBe('sepa-eur')
    expect(resolveRecipientRoute('CZ', 'RO', 'RON')).toBe('unavailable')
  })

  it('uses Romanian IBAN for a local RON payment and IBAN for SEPA EUR', () => {
    expect(resolveRecipientRoute('RO', 'RO', 'RON')).toBe('ro-domestic')
    expect(resolveRecipientRoute('RO', 'DE', 'EUR')).toBe('sepa-eur')
  })

  it('checks an IBAN against the country format and ISO 13616 check digits', () => {
    expect(isValidIban('CZ65 0800 0000 1920 0014 5399', 'CZ')).toBe(true)
    expect(isValidIban('RO49 AAAA 1B31 0075 9384 0000', 'RO')).toBe(true)
    expect(isValidIban('RO34 RNCB 0015 1854 8829 0001', 'RO')).toBe(true)
    expect(isValidIban('CZ66 0800 0000 1920 0014 5399', 'CZ')).toBe(false)
    expect(isValidIban('CZ65 0800 0000 1920 0014 5399', 'RO')).toBe(false)
  })

  it('uses account and bank identifiers instead of IBAN for US and China corridors', () => {
    expect(resolveRecipientRoute('CZ', 'US', 'USD')).toBe('foreign-us')
    expect(resolveRecipientRoute('CZ', 'CN', 'CNY')).toBe('foreign-cn')
    expect(isCountryCurrencySupported('US', 'USD')).toBe(true)
    expect(isCountryCurrencySupported('US', 'CZK')).toBe(false)
    expect(isCountryCurrencySupported('CN', 'CNY')).toBe(true)
    expect(isCountryCurrencySupported('CN', 'USD')).toBe(true)
    expect(isValidSwiftBic('CHASUS33')).toBe(true)
    expect(isValidSwiftBic('BKCHCNBJ')).toBe(true)
    expect(isValidSwiftBic('CHASUS3')).toBe(false)
    expect(isValidUsRoutingNumber('021000021')).toBe(true)
    expect(isValidUsRoutingNumber('021000022')).toBe(false)
  })

  it('requires the bank identifier that matches the selected US payment method', () => {
    expect(isValidUsBankDetails('ach', '021000021', '')).toBe(true)
    expect(isValidUsBankDetails('ach', '', 'CHASUS33')).toBe(false)
    expect(isValidUsBankDetails('wire', '021000021', '')).toBe(true)
    expect(isValidUsBankDetails('wire', '021000022', 'CHASUS33')).toBe(false)
    expect(isValidUsBankDetails('swift', '', 'CHASUS33')).toBe(true)
    expect(isValidUsBankDetails('swift', '021000021', '')).toBe(false)
  })
})
