import { describe, expect, it } from 'vitest'
import { formatIbanInput, getIbanGhostSuffix, normalizeIbanInput } from '@/app/utils/ibanInputMask'

describe('IBAN input mask', () => {
  it('groups the visible IBAN while keeping the saved value free of spaces', () => {
    expect(normalizeIbanInput('cz65 0800-00', 24)).toBe('CZ65080000')
    expect(formatIbanInput('CZ65080000', 24)).toBe('CZ65 0800 00')
    expect(getIbanGhostSuffix('CZ65080000', 'CZ', 24)).toBe('## #### #### ####')
  })

  it('shows the Romanian check digits, bank letters and account positions', () => {
    expect(getIbanGhostSuffix('', 'RO', 24)).toBe('RO## XXXX **** **** **** ****')
    expect(getIbanGhostSuffix('RO', 'RO', 24)).toBe('## XXXX **** **** **** ****')
    expect(getIbanGhostSuffix('RO49', 'RO', 24)).toBe(' XXXX **** **** **** ****')
    expect(getIbanGhostSuffix('RO49AAAA', 'RO', 24)).toBe(' **** **** **** ****')
  })

  it('keeps grouped generic placeholders for other destinations and ends at the registered length', () => {
    expect(getIbanGhostSuffix('', 'CZ', 24)).toBe('CZ## #### #### #### #### ####')
    expect(getIbanGhostSuffix('GB12', 'GB', 22)).toBe(' #### #### #### #### ##')
    expect(getIbanGhostSuffix('CZ6508000000192000145399', 'CZ', 24)).toBe('')
  })
})
