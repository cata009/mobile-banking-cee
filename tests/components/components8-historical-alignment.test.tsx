// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import ProductCard from '@/app/components/ProductCard'
import ProductOfferCard from '@/app/components/products/ProductOfferCard'
import HelperCard from '@/app/components/cards/HelperCard'

afterEach(cleanup)
const product = { icon: <svg aria-hidden="true" />, title: 'Current account', accountNumber: '1234567890123456', amount: '10.000', decimals: ',00', currency: 'RON' }
describe('approved page-8 historical metric corrections in legacy adapters', () => {
  it('uses evolution 18/20 type and the canonical 32px currency slot', () => {
    const { container } = render(<ProductCard {...product} variant="evolution" />)
    expect(screen.getByText(product.title)).toHaveClass('text-[18px]', 'leading-[20px]')
    expect(container.querySelector('[data-product-card-leading-visual="currency"]')).toHaveClass('size-[32px]')
  })
  it('preserves legacy third-line content and click callback', () => {
    const onClick = vi.fn()
    render(<ProductCard {...product} thirdLine="STANDARD OFFER" onClick={onClick} />)
    expect(screen.getByText('STANDARD OFFER')).toHaveClass('uc-type-n5')
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
  it('uses compact x16/w211/photo96 and original text lineboxes', () => {
    const offer = { id: 'compact', title: 'Title', description: 'Description', caption: 'Caption' }
    const { container } = render(<ProductOfferCard offer={offer} variant="compact" />)
    expect(container.querySelector('img')).toHaveClass('w-[96px]')
    expect(screen.getByText('Title')).toHaveStyle({ fontSize: '20px', lineHeight: '22px' })
    expect(screen.getByText('Description')).toHaveStyle({ fontSize: '16px', lineHeight: '18px' })
    expect(screen.getByText('Caption')).toHaveStyle({ fontSize: '14px', lineHeight: '15px' })
    expect(container.querySelector('[class~="pl-[16px]"]')).toHaveClass('pr-[100px]', 'pt-[16px]')
  })
  it('uses helper gap0 while retaining its action callback', () => {
    const onActionClick = vi.fn()
    render(<HelperCard title="Details" description="Existing helper text" actionLabel="SEE DETAILS" onActionClick={onActionClick} />)
    expect(screen.getByText('Details').parentElement).toHaveClass('gap-[0px]')
    fireEvent.click(screen.getByRole('button', { name: 'SEE DETAILS' }))
    expect(onActionClick).toHaveBeenCalledOnce()
  })
})
