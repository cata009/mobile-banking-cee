// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Actions from '@/app/components/accounts/AccountActionBar'
import Info from '@/app/components/accounts/AccountDetailsInfoField'
import Row from '@/app/components/accounts/AccountTransactionRow'
import Avatar from '@/app/components/transactions/TransactionAvatar'
import Party from '@/app/components/transactions/TransactionPartyAvatar'
import Pair from '@/app/components/transactions/TransactionPairAvatar'
import Profile from '@/app/components/ProfileAvatar'
import Visibility from '@/app/components/AmountVisibilityButton'
import FrozenActions from '../fixtures/baseline-banking-identity-before/AccountActionBar'
import FrozenInfo from '../fixtures/baseline-banking-identity-before/AccountDetailsInfoField'
import FrozenRow from '../fixtures/baseline-banking-identity-before/AccountTransactionRow'
import FrozenAvatar from '../fixtures/baseline-banking-identity-before/TransactionAvatar'
import FrozenParty from '../fixtures/baseline-banking-identity-before/TransactionPartyAvatar'
import FrozenPair from '../fixtures/baseline-banking-identity-before/TransactionPairAvatar'
import FrozenProfile from '../fixtures/baseline-banking-identity-before/ProfileAvatar'
import FrozenVisibility from '../fixtures/baseline-banking-identity-before/AmountVisibilityButton'
import type { AccountTransaction } from '@/data/accountDetails'
import { resolveTransactionRow } from '@/app/components/contracts/transactionRow'
import { resolveTransactionAvatarIdentity } from '@/features/accounts-payments/transactionAvatarIdentity'
import { readFileSync } from 'node:fs'
import {
  PFM_CATEGORY_ICONS,
  PFM_ICON_GLYPH_PATHS,
} from '../../native-spike/src/experiences/pi/current/banking/pfmGlyphs'
vi.mock('@/app/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (_key: string, fallback: string) => fallback }),
}))
afterEach(cleanup)
const transaction: AccountTransaction = {
  id: 't',
  day: '13',
  month: 'OCT',
  monthKey: '2026-10',
  monthTitle: 'October',
  label: 'Maria Ionescu',
  amount: -12,
  type: 'debit',
  category: 'Transfers',
  pfmCategory: 'Transfers',
  pfmSubcategory: 'Transfer',
  status: 'Booked',
  source: 'account',
  currency: 'RON',
  details: 'Payment details',
}
function normalize(html: string) {
  return html
    .replace(/:[\w]+:/g, ':generated:')
    .replace(/-r[\w]+-/g, '-generated-')
    .replace(/\s+/g, ' ')
}

/** Only the approved List-source delta is applied to the frozen baseline.
 * 1517:2355 / 1517:2372: white surface, dark month, bold fractional amount.
 * 1517:2380: 80px base row, 2px content gaps and a centred 32px status line.
 * The base is a minimum so larger text can grow without clipping.
 * All data, SVGs, semantics, callback ownership and Evo markup stay frozen. */
function approvedListSourceMarkup(html: string, pending: boolean) {
  const template = document.createElement('template')
  template.innerHTML = html
  const row = template.content.querySelector<HTMLElement>('[data-ds-label="AccountTransactionRow 375x80"]')!
  row.className =
    row.className
      .replace('bg-transparent', 'bg-[var(--uc-surface)]')
      .replace(' py-[20px]', '')
      .replace('h-[92px]', 'h-[80px]')
      .replace('h-[80px]', 'min-h-[80px]') + (pending ? ' py-[2px]' : ' py-[18px]')
  const month = row.querySelector<HTMLElement>('[data-transaction-date] p:last-child')
  if (month) month.className = month.className.replace('--uc-text-muted', '--uc-text')
  for (const amount of row.querySelectorAll<HTMLElement>('p.uc-type-n2-strong')) {
    const [integer, fraction] = Array.from(amount.children) as HTMLElement[]
    if (!integer || !fraction) continue
    const originalText = amount.textContent
    if (/^[,.]/.test(fraction.textContent ?? '')) {
      integer.textContent += fraction.textContent![0]
      fraction.textContent = fraction.textContent!.slice(1)
    }
    fraction.className = 'uc-type-n5-strong uppercase tracking-[0px]'
    expect(amount.textContent).toBe(originalText)
  }
  if (pending) {
    const details = row.querySelector<HTMLElement>('div.items-end')!
    details.className = details.className.replace('gap-[4px]', 'gap-[2px]')
    const status = row.querySelector<HTMLElement>('[data-pending-status]')!
    status.className = status.className
      .replace('flex ', 'flex h-[32px] ')
      .replace('uc-type-n5-strong ', 'uc-type-n5-strong leading-[15px] ')
  }
  return normalize(template.innerHTML)
}
describe('banking identity frozen preservation', () => {
  it('reuses only the original Source PFM SVG path data in the Native avatar', () => {
    const source = readFileSync('src/app/components/pfm/PfmCategoryIcon.tsx', 'utf8')
    const paths = new Set([...source.matchAll(/d:\s*["']([^"']+)["']/g)].map((match) => match[1]))
    expect(paths.size).toBeGreaterThan(20)
    for (const collection of [PFM_CATEGORY_ICONS, PFM_ICON_GLYPH_PATHS])
      for (const categoryPaths of Object.values(collection))
        for (const path of categoryPaths ?? []) expect(paths.has(path.d)).toBe(true)
  })
  it('keeps category/pair/merchant/party precedence and identity fallback policy in the feature', () => {
    const pair = {
      from: { kind: 'currency' as const, currency: 'EUR' as const },
      to: { kind: 'currency' as const, currency: 'RON' as const },
    }
    const combined = {
      ...transaction,
      source: 'card' as const,
      label: 'Carrefour',
      merchantId: 'carrefour' as const,
      transferPair: pair,
    }
    expect(resolveTransactionAvatarIdentity(combined, { presentation: 'category', pfmVariant: 'glyph' })).toMatchObject(
      { kind: 'category', pfmVariant: 'glyph' },
    )
    expect(resolveTransactionAvatarIdentity(combined)).toMatchObject({ kind: 'pair', pair })
    expect(resolveTransactionAvatarIdentity({ ...combined, transferPair: undefined })).toMatchObject({
      kind: 'merchant',
      merchant: { id: 'carrefour' },
    })
    expect(
      resolveTransactionAvatarIdentity(
        { ...transaction, source: 'card', label: 'Unknown processor' },
        { pfmVariant: 'glyph' },
      ),
    ).toMatchObject({ kind: 'category', pfmVariant: 'category-circle' })
    expect(resolveTransactionAvatarIdentity({ ...transaction, merchantId: 'carrefour', type: 'credit' })).toMatchObject(
      { kind: 'party', name: 'Maria Ionescu', direction: 'in' },
    )
  })
  it.each(['start', 'center', 'end', 'between'] as const)(
    'retains action alignment=%s, treatment and hidden slots',
    (align) => {
      for (const iconTreatment of ['bare', 'bubble'] as const) {
        const items = Array.from({ length: 5 }, (_, i) => ({
          id: String(i),
          iconName: 'account-details' as const,
          label: `Action\n${i}`,
          hidden: i === 1,
          pressed: i === 2,
          iconColor: 'var(--uc-action)',
        }))
        const props = { items, align, iconTreatment, className: 'test', style: { gap: 12 } }
        const { container, rerender, unmount } = render(<FrozenActions {...props} />)
        const before = normalize(container.innerHTML)
        rerender(<Actions {...props} />)
        expect(normalize(container.innerHTML)).toBe(before)
        expect(container.querySelectorAll('button')).toHaveLength(4)
        unmount()
      }
    },
  )
  it.each([undefined, <span key="a">Icon</span>, 0])('retains account info trailing variant %#', (trailingIcon) => {
    const props = { title: 'IBAN', subtitle: 'RO12 UNCR 1234 5678', trailingIcon }
    const { container, rerender } = render(<FrozenInfo {...props} />)
    const before = normalize(container.innerHTML)
    rerender(<Info {...props} />)
    expect(normalize(container.innerHTML)).toBe(before)
  })
  it.each([false, true])('retains transaction evo=%s status/format/category-owner variants', (evo2027) => {
    for (const status of ['Booked', 'Pending'] as const)
      for (const avatarPresentation of ['identity', 'category'] as const)
        for (const formattedAmount of ['1,234.56', '1.234,56', '••••']) {
          const props = {
            transaction: { ...transaction, status },
            formattedAmount,
            currency: 'RON',
            evo2027,
            avatarPresentation,
            showTransactionDate: true,
            accountLabel: 'Current account',
            detailsLabel: 'Owner details',
            compact: true,
            onCategoryClick: vi.fn(),
            onClick: vi.fn(),
          }
          const { container, rerender, unmount } = render(<FrozenRow {...props} />)
          const before = evo2027
            ? normalize(container.innerHTML)
            : approvedListSourceMarkup(container.innerHTML, status === 'Pending')
          rerender(<Row {...props} />)
          expect(normalize(container.innerHTML)).toBe(before)
          unmount()
        }
    expect(
      resolveTransactionRow({ pending: true, evo2027, amount: 0, type: 'credit', formattedAmount: '0,00' }).sign,
    ).toBe('+')
  })
  const identities: Partial<AccountTransaction>[] = [
    { source: 'card', label: 'Carrefour', merchantId: 'carrefour' },
    { source: 'card', label: 'ATM cash withdrawal' },
    { label: 'Maria Ionescu', type: 'credit' },
    { label: 'Bank fee' },
    { transferPair: { from: { kind: 'account', account: 'current' }, to: { kind: 'account', account: 'savings' } } },
    { transferPair: { from: { kind: 'currency', currency: 'EUR' }, to: { kind: 'currency', currency: 'RON' } } },
  ]
  it.each(identities)('retains automatic identity %#', (identity) => {
    for (const size of [32, 42, 64])
      for (const presentation of ['identity', 'category'] as const) {
        const props = {
          transaction: { ...transaction, ...identity },
          size,
          presentation,
          elevated: true,
          pfmVariant: 'glyph' as const,
        }
        const { container, rerender, unmount } = render(<FrozenAvatar {...props} />)
        const before = normalize(container.innerHTML)
        rerender(<Avatar {...props} />)
        expect(normalize(container.innerHTML)).toBe(before)
        unmount()
      }
  })
  it.each(['in', 'out'] as const)('retains party badge %s and original direction SVG', (direction) => {
    const props = { name: 'Asociația Proprietari', direction, size: 42 }
    const { container, rerender } = render(<FrozenParty {...props} />)
    const before = normalize(container.innerHTML)
    rerender(<Party {...props} />)
    expect(normalize(container.innerHTML)).toBe(before)
  })
  it('retains pair endpoint currency substitution and geometry', () => {
    const pair = {
      from: { kind: 'account' as const, account: 'current' as const },
      to: { kind: 'account' as const, account: 'deposit' as const },
    }
    const props = { pair, currency: 'CZK' as const, size: 42 }
    const { container, rerender } = render(<FrozenPair {...props} />)
    const before = normalize(container.innerHTML)
    rerender(<Pair {...props} />)
    expect(normalize(container.innerHTML)).toBe(before)
    expect(container.querySelector('[data-currency-flag="CZK"]')).toBeTruthy()
  })
  it.each(['initials', 'ai', 'photo'] as const)(
    'retains profile %s fallback/normalization/photo variants',
    (variant) => {
      for (const initials of [undefined, '', ' m r ', 'Ștefan'])
        for (const photoStyle of ['full', 'profile'] as const) {
          const props = {
            variant,
            initials,
            photoStyle,
            showNotification: true,
            size: 34,
            ariaLabel: 'Profile',
            imageSrc:
              variant === 'photo' ? 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E' : undefined,
          }
          const { container, rerender, unmount } = render(<FrozenProfile {...props} />)
          const before = normalize(container.innerHTML)
          rerender(<Profile {...props} />)
          expect(normalize(container.innerHTML)).toBe(before)
          unmount()
        }
    },
  )
  it.each([false, true])('keeps amount visibility controlled hidden=%s', (hidden) => {
    const onToggle = vi.fn(),
      props = { hidden, onToggle }
    const { container, rerender } = render(<FrozenVisibility {...props} />)
    const before = normalize(container.innerHTML)
    rerender(<Visibility {...props} />)
    expect(normalize(container.innerHTML)).toBe(before)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', String(hidden))
  })
  it('delegates transaction/category callbacks with exact object and disables hidden action slots', () => {
    const onClick = vi.fn(),
      onCategoryClick = vi.fn(),
      hidden = vi.fn()
    const { rerender } = render(
      <Row
        transaction={transaction}
        formattedAmount="12.00"
        currency="RON"
        onClick={onClick}
        onCategoryClick={onCategoryClick}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Change category for Maria Ionescu' }))
    expect(onCategoryClick).toHaveBeenCalledExactlyOnceWith(transaction)
    expect(onClick).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Open transaction Maria Ionescu' }))
    expect(onClick).toHaveBeenCalledExactlyOnceWith(transaction)
    rerender(<Actions items={[{ id: 'h', label: 'Hidden', hidden: true, onClick: hidden }]} />)
    fireEvent.click(screen.getByRole('button', { hidden: true }))
    expect(hidden).not.toHaveBeenCalled()
  })
})
