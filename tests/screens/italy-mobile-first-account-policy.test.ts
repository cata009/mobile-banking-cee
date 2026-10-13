import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import {
  accountFilterError,
  accountNameError,
  accountPeriod,
  accountSplitError,
  matchesAccountMovement,
  selectAccountFavorite,
  type AccountMovement,
} from '@/features/accounts-payments/mobileFirstAccounts'
import { createAccountExcel, createAccountPdf } from '@/features/accounts-payments/mobileFirstAccountExports'

describe('Conti policies and exports', () => {
  const movement: AccountMovement = {
    id: 'test',
    name: '=Edison energia',
    category: 'Utenze',
    amount: -24.9,
    date: '2025-02-28',
    icon: 'utilities',
  }
  it('validates search ranges and uses inclusive dates and absolute amounts', () => {
    expect(
      matchesAccountMovement(movement, {
        tag: 'edison utenze',
        from: '2025-02-28',
        to: '2025-02-28',
        min: '24.9',
        max: '24.9',
      }),
    ).toBe(true)
    expect(matchesAccountMovement(movement, { tag: '', from: '', to: '', min: '25', max: '' })).toBe(false)
    expect(accountFilterError({ tag: '', from: '2025-02-28', to: '2025-01-01', min: '', max: '' })).not.toBeNull()
    expect(accountPeriod(1, '2025-03-31')).toEqual({ from: '2025-02-28', to: '2025-03-31' })
  })
  it('enforces two internal favorites and validates names and split totals in cents', () => {
    expect(selectAccountFavorite(['a', 'b'], 'c', false)).toEqual(['c', 'a'])
    expect(selectAccountFavorite(['a', 'b'], 'c', true)).toEqual(['a', 'b'])
    expect(accountNameError('Conto famiglia')).toBeNull()
    expect(accountNameError('  ')).not.toBeNull()
    expect(accountNameError('Conto!')).not.toBeNull()
    expect(
      accountSplitError(-0.3, [
        { category: 'Casa', amount: '0.1' },
        { category: 'Utenze', amount: '0.2' },
      ]),
    ).toBeNull()
    expect(
      accountSplitError(-100, [
        { category: 'Casa', amount: '40' },
        { category: 'Utenze', amount: '50' },
      ]),
    ).not.toBeNull()
  })
  it('creates a real Excel workbook with numeric amounts and formula-safe text', () => {
    const files = unzipSync(createAccountExcel([movement]))
    const sheet = strFromU8(files['xl/worksheets/sheet1.xml']!)
    expect(sheet).toContain('t="inlineStr"')
    expect(sheet).toContain('=Edison energia')
    expect(sheet).toContain('<v>-24.9</v>')
    expect(sheet).not.toContain('<f>')
    expect(files['[Content_Types].xml']).toBeDefined()
  })
  it('rejects split amounts with fractions of a cent', () => {
    expect(
      accountSplitError(-120, [
        { category: 'Casa', amount: '60.004' },
        { category: 'Utenze', amount: '60.004' },
      ]),
    ).not.toBeNull()
  })
  it('creates a PDF with valid offsets and a page for every exported group', () => {
    const pdf = new TextDecoder().decode(
      createAccountPdf(Array.from({ length: 65 }, (_, i) => ({ ...movement, id: `${i}` }))),
    )
    expect(pdf).toMatch(/^%PDF-1.4/)
    expect(pdf).toContain('/Count 2')
    const offset = Number(pdf.match(/startxref\n(\d+)/)?.[1])
    expect(pdf.slice(offset, offset + 4)).toBe('xref')
  })
})
