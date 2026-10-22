// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ProductCard from '@/app/components/ProductCard'
import ProductsList from '@/app/components/ProductsList'
import TotalRow from '@/app/components/TotalRow'
import Shadow from '@/app/components/StackedProductShadow'
import Accordion from '@/app/components/AccordionSection'
import Balance from '@/app/components/accounts/AccountBalanceCard'
import Card, { CARD_VARIANTS, type CardVariant } from '@/app/components/cards/Card'
import FrozenProduct from '../fixtures/baseline-banking-cards-before/ProductCard'
import FrozenList from '../fixtures/baseline-banking-cards-before/ProductsList'
import FrozenTotal from '../fixtures/baseline-banking-cards-before/TotalRow'
import FrozenShadow from '../fixtures/baseline-banking-cards-before/StackedProductShadow'
import FrozenAccordion from '../fixtures/baseline-banking-cards-before/AccordionSection'
import FrozenBalance from '../fixtures/baseline-banking-cards-before/AccountBalanceCard'
import FrozenCard from '../fixtures/baseline-banking-cards-before/Card'
import { resolveProductsList } from '@/app/components/contracts/productsList'
afterEach(cleanup)
function normalized(html: string) {
  return html
    .replace(/:[\w]+:/g, ':generated:')
    .replace(/-r[\w]+-/g, '-generated-')
    .replace(/\s+/g, ' ')
}
const data = {
  icon: <span>EUR</span>,
  title: 'Current account',
  accountNumber: 'RO12 UNCR 1234',
  amount: '1,200',
  decimals: '.00',
  currency: 'RON',
}
const account = { accountName: 'Current account', accountNumber: 'RO12 UNCR 1234', subAccount: '01' }
describe('banking composition frozen preservation', () => {
  it.each(['legacy', 'evolution'] as const)('retains %s PI/SME stack/action/footer and privacy strings', (variant) => {
    for (const productStyle of ['pi', 'sme'] as const)
      for (const stackRole of ['single', 'first', 'middle', 'last'] as const)
        for (const hidden of [false, true]) {
          const props = {
            ...data,
            variant,
            productStyle,
            stackRole,
            amount: hidden ? '••••' : data.amount,
            thirdLine: 'Third line',
            leadingVisual: 'card' as const,
            footer: <span>Footer</span>,
            actions: Array.from({ length: 5 }, (_, i) => ({
              id: String(i),
              icon: <span>+</span>,
              label: `Action\n${i}`,
            })),
          }
          const { container, rerender, unmount } = render(<FrozenProduct {...props} />)
          // Only the approved original Figma deltas; the frozen fixture stays intact.
          if (variant === 'evolution') {
            const title = screen.getByText(props.title)
            title.classList.replace('text-[16px]', 'text-[18px]')
            title.classList.replace('leading-[18px]', 'leading-[20px]')
          } else {
            const thirdLine = document.createElement('p')
            thirdLine.className = 'uc-type-n5 text-[var(--uc-text)]'
            thirdLine.textContent = props.thirdLine
            screen.getByText(props.accountNumber).parentElement!.appendChild(thirdLine)
          }
          const before = normalized(container.innerHTML)
          rerender(<ProductCard {...props} />)
          expect(normalized(container.innerHTML)).toBe(before)
          unmount()
        }
  })
  it.each([0, 1, 2, 3])('retains list count=%s, open/collapsed and optional total', (count) => {
    for (const variant of ['legacy', 'evolution'] as const)
      for (const isOpen of [false, true]) {
        const children = Array.from({ length: count }, (_, i) => <div key={i}>Product {i}</div>)
        const props = {
          children,
          variant,
          isOpen,
          showTotal: true,
          totalData: { integer: '2,400', decimals: '.00', currency: 'RON' },
        }
        const { container, rerender, unmount } = render(<FrozenList {...props} />)
        const before = normalized(container.innerHTML)
        rerender(<ProductsList {...props} />)
        expect(normalized(container.innerHTML)).toBe(before)
        unmount()
        expect(
          resolveProductsList({ productCount: count, isOpen, variant, showTotal: true, hasTotalData: true }).showTotal,
        ).toBe(count >= 2)
      }
  })
  it.each(['legacy', 'evolution'] as const)('retains total %s and caller labels/data', (variant) => {
    for (const productStyle of ['pi', 'sme'] as const) {
      const props = {
        variant,
        productStyle,
        integer: '••••',
        decimals: '',
        currency: 'EUR',
        label: 'Total disponibil',
        className: 'test',
      }
      const { container, rerender, unmount } = render(<FrozenTotal {...props} />)
      const before = normalized(container.innerHTML)
      rerender(<TotalRow {...props} />)
      expect(normalized(container.innerHTML)).toBe(before)
      unmount()
    }
  })
  it('retains the original stacked shadow SVG', () => {
    const { container, rerender } = render(<FrozenShadow />)
    const before = normalized(container.innerHTML)
    rerender(<Shadow />)
    expect(normalized(container.innerHTML)).toBe(before)
  })
  it.each([0, 1, 2])('retains accordion count=%s and controller state', (count) => {
    const children = (
      <ProductsList isOpen={false}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i}>Product {i}</div>
        ))}
      </ProductsList>
    )
    const { container, rerender } = render(
      <FrozenAccordion title="Accounts" defaultOpen={false}>
        {children}
      </FrozenAccordion>,
    )
    const before = normalized(container.innerHTML)
    rerender(
      <Accordion title="Accounts" defaultOpen={false}>
        {children}
      </Accordion>,
    )
    expect(normalized(container.innerHTML)).toBe(before)
    if (count !== 1) {
      fireEvent.click(screen.getByRole('button'))
      expect(container.querySelector('[aria-hidden="false"]')).toBeTruthy()
    } else expect(screen.queryByRole('button')).toBeNull()
  })
  it.each(['current_account', 'saving_account', 'term_deposit', 'loan', 'mortgage'] as const)(
    'retains balance labels/progress/product %s',
    (productType) => {
      for (const progress of [undefined, -1, 0, 0.5, 2])
        for (const active of [false, true]) {
          const props = {
            account,
            availableInteger: '••••',
            availableDecimals: '',
            currency: 'RON',
            currentBalance: '••••',
            productType,
            progress,
            active,
            onCopy: vi.fn(),
            showSubAccount: true,
          }
          const { container, rerender, unmount } = render(<FrozenBalance {...props} />)
          const before = normalized(container.innerHTML)
          rerender(<Balance {...props} />)
          expect(normalized(container.innerHTML)).toBe(before)
          unmount()
        }
    },
  )
  it('keeps card action and account-copy clicks from invoking the container owner', () => {
    const onClick = vi.fn(),
      action = vi.fn(),
      onCopy = vi.fn()
    const { rerender } = render(
      <ProductCard
        {...data}
        variant="evolution"
        onClick={onClick}
        actions={[{ id: 'a', icon: <span>+</span>, label: '  Copy\n account ', onClick: action }]}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copy account' }))
    expect(action).toHaveBeenCalledTimes(1)
    expect(onClick).not.toHaveBeenCalled()
    rerender(
      <Balance
        account={account}
        availableInteger="10"
        availableDecimals=".00"
        currency="RON"
        currentBalance="20"
        onClick={onClick}
        onCopy={onCopy}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copy account number' }))
    expect(onCopy).toHaveBeenCalledTimes(1)
    expect(onClick).not.toHaveBeenCalled()
    fireEvent.keyDown(screen.getByRole('button', { name: 'Copy account number' }), { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })
  it.each(Object.keys(CARD_VARIANTS) as CardVariant[])('preserves original art %s at all sizes', (variant) => {
    for (const size of ['figma', 'medium', 'large'] as const) {
      const props = { variant, size, ariaLabel: 'Card', className: 'test', style: { opacity: 0.8 } }
      const { container, rerender, unmount } = render(<FrozenCard {...props} />)
      const before = normalized(container.innerHTML)
      rerender(<Card {...props} />)
      expect(normalized(container.innerHTML)).toBe(before)
      unmount()
    }
  })
})
