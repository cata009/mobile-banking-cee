// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentType } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Menu from '@/app/components/products/ProductMenuCard'
import Offer from '@/app/components/products/ProductOfferCard'
import Shop from '@/app/components/shopsmart/ShopsmartOfferCard'
import Accordion from '@/app/components/ProductAccordion'
import Animated from '@/app/components/ProductAccordionAnimated'
import BeforeMenu from '../fixtures/baseline-marketing-before/ProductMenuCard'
import BeforeOffer from '../fixtures/baseline-marketing-before/ProductOfferCard'
import BeforeShop from '../fixtures/baseline-marketing-before/ShopsmartOfferCard'
import BeforeAccordion from '../fixtures/baseline-marketing-before/ProductAccordion'
import BeforeAnimated from '../fixtures/baseline-marketing-before/ProductAccordionAnimated'
import { MoreCardBase } from '@/app/screens/more/cards/MoreCardBase'
import { ContactsCard } from '@/app/screens/more/cards/ContactsCard'
import { DocumentsCard } from '@/app/screens/more/cards/DocumentsCard'
import { SettingsCard } from '@/app/screens/more/cards/SettingsCard'
import { GdprConsentCard } from '@/app/screens/more/cards/GdprConsentCard'
import { ThirdPartyConsentCard } from '@/app/screens/more/cards/ThirdPartyConsentCard'
import { DigitalActivitiesCard } from '@/app/screens/more/cards/DigitalActivitiesCard'
import { MyRequestsCard } from '@/app/screens/more/cards/MyRequestsCard'
import { TutorialCard } from '@/app/screens/more/cards/TutorialCard'
import { MoreCardBase as BeforeBase } from '../fixtures/baseline-marketing-before/MoreCardBase'
import { ContactsCard as BeforeContacts } from '../fixtures/baseline-marketing-before/ContactsCard'
import { DocumentsCard as BeforeDocuments } from '../fixtures/baseline-marketing-before/DocumentsCard'
import { SettingsCard as BeforeSettings } from '../fixtures/baseline-marketing-before/SettingsCard'
import { GdprConsentCard as BeforeGdpr } from '../fixtures/baseline-marketing-before/GdprConsentCard'
import { ThirdPartyConsentCard as BeforeThird } from '../fixtures/baseline-marketing-before/ThirdPartyConsentCard'
import { DigitalActivitiesCard as BeforeDigital } from '../fixtures/baseline-marketing-before/DigitalActivitiesCard'
import { MyRequestsCard as BeforeRequests } from '../fixtures/baseline-marketing-before/MyRequestsCard'
import { TutorialCard as BeforeTutorial } from '../fixtures/baseline-marketing-before/TutorialCard'
import type { ProductsCard } from '@/app/config/productsMenuConfig'

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({ children, className }: { children: React.ReactNode; className: string }) => (
      <div className={className}>{children}</div>
    ),
  },
}))
afterEach(cleanup)
const dom = (container: HTMLElement) => container.innerHTML.replace(/\s+/g, ' ')
describe('marketing frozen Source preservation', () => {
  for (const id of [
    'account',
    'cards',
    'mortgages-loans',
    'insurance',
    'investments-savings',
    'market-hedging',
    'shopsmart',
    'partner-offers',
    'additional-services',
  ] as const) {
    it.each(['standard', 'compact'] as const)(`preserves menu image ${id} %s`, (variant) => {
      const onClick = vi.fn(),
        card: ProductsCard = {
          id,
          title: 'Your\nproducts',
          background: 'var(--uc-product-blue)',
          illustration: 'arrow',
          imageSrc: '/source.png',
        }
      const props = { card, onClick, variant, badgeCount: 100 }
      const { container, rerender } = render(<BeforeMenu {...props} />)
      const before = dom(container)
      rerender(<Menu {...props} />)
      expect(dom(container)).toBe(before)
      fireEvent.click(screen.getByRole('button', { name: 'Your products' }))
      expect(onClick).toHaveBeenCalledExactlyOnceWith(card)
    })
  }
  it.each(['flowers', 'bag', 'pillow', 'umbrella', 'branch', 'arrow'] as const)(
    'preserves original fallback illustration %s',
    (illustration) => {
      const card: ProductsCard = { id: 'additional-services', title: 'Services', background: 'black', illustration }
      const { container, rerender } = render(<BeforeMenu card={card} />)
      const before = dom(container)
      rerender(<Menu card={card} />)
      expect(dom(container)).toBe(before)
    },
  )
  it.each(['standard', 'compact'] as const)('preserves offer %s captions and callback payload', (variant) => {
    const onClick = vi.fn(),
      offer = { id: 'offer', title: 'Title\nline', description: 'Description', caption: 'Caption' }
    const props = { offer, onClick, variant, colorFamily: 'yellow' as const, lightVersion: true }
    const { container, rerender } = render(<BeforeOffer {...props} />)
    let before = dom(container)
    if (variant === 'standard') {
      // Approved correction to the original Figma Bottom banner; retain the frozen fixture.
      before = before
        .replace('w-[100px] object-cover', 'w-[96px] object-cover')
        .replace('items-center pl-[20px] pr-[116px]', 'items-start pl-[16px] pr-[100px] pt-[16px] pb-[16px]')
        .replace('font-size: 22px; line-height: normal;', 'font-size: 24px; line-height: 26px;')
        .replace('uc-type-p1" style="color: var(--uc-static-black);"', 'uc-type-p1" style="color: var(--uc-static-black); font-size: 18px; line-height: 20px;"')
    } else {
      // Approved compact source 9365:16188 bounds/lineboxes; no fixture rewrite.
      before = before
        .replace('w-[100px] object-cover', 'w-[96px] object-cover')
        .replace('items-center pl-[20px] pr-[116px]', 'items-start pl-[16px] pr-[100px] pt-[16px] pb-[12px]')
        .replace('font-size: 20px; line-height: normal;', 'font-size: 20px; line-height: 22px;')
        .replace('uc-type-n4" style="color: var(--uc-static-black);"', 'uc-type-n4" style="color: var(--uc-static-black); font-size: 16px; line-height: 18px;"')
        .replace('whitespace-nowrap" style="color: var(--uc-static-black);"', 'whitespace-nowrap" style="color: var(--uc-static-black); font-size: 14px; line-height: 15px;"')
    }
    rerender(<Offer {...props} />)
    expect(dom(container)).toBe(before)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledExactlyOnceWith(offer)
  })
  for (const variant of ['default', 'partner'] as const) {
    it.each([false, true])(`preserves ShopSmart ${variant} interactive=%s`, (interactive) => {
      const onClick = interactive ? vi.fn() : undefined,
        props = {
          merchant: 'Merchant',
          title: 'Offer',
          statusText: 'Ends soon',
          imageSrc: '/source.png',
          imageHeight: 143 as const,
          imageOverlay: true,
          pillLabel: 'Activated',
          pillTone: 'white' as const,
          tagLabel: 'GIFT',
          distance: '3 km',
          trailingIcon: 'partners' as const,
          variant,
          onClick,
        }
      const { container, rerender } = render(<BeforeShop {...props} />)
      const before = dom(container)
      rerender(<Shop {...props} />)
      expect(dom(container)).toBe(before)
      expect(container.firstElementChild?.tagName).toBe(interactive ? 'BUTTON' : 'ARTICLE')
      if (onClick) {
        fireEvent.click(screen.getByRole('button'))
        expect(onClick).toHaveBeenCalledOnce()
      }
    })
  }
  const morePairs: Array<
    [
      string,
      ComponentType<{ onClick: () => void; title?: string; image: string; badgeCount?: number }>,
      ComponentType<{ onClick: () => void; title?: string; image: string; badgeCount?: number }>,
    ]
  > = [
    ['base', BeforeBase, MoreCardBase],
    ['contacts', BeforeContacts, ContactsCard],
    ['documents', BeforeDocuments, DocumentsCard],
    ['settings', BeforeSettings, SettingsCard],
    ['gdpr', BeforeGdpr, GdprConsentCard],
    ['third', BeforeThird, ThirdPartyConsentCard],
    ['digital', BeforeDigital, DigitalActivitiesCard],
    ['requests', BeforeRequests, MyRequestsCard],
    ['tutorial', BeforeTutorial, TutorialCard],
  ] as Array<
    [
      string,
      ComponentType<{ onClick: () => void; title?: string; image: string; badgeCount?: number }>,
      ComponentType<{ onClick: () => void; title?: string; image: string; badgeCount?: number }>,
    ]
  >
  for (const [name, Before, After] of morePairs)
    it.each([0, 1, 99, 100])(`preserves More ${name} badge=%s`, (badgeCount) => {
      const onClick = vi.fn(),
        props = { onClick, title: 'Menu\nlong title', image: '/source.png', badgeCount }
      const { container, rerender } = render(<Before {...props} />)
      const before = dom(container)
      rerender(<After {...props} />)
      expect(dom(container)).toBe(before)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledOnce()
    })
  it.each([0, 1, 2, 3, 4])('preserves static/animated prelogin %s products', (count) => {
    const products = Array.from({ length: count }, (_, index) => ({
      id: String(index),
      title: 'Product ' + index,
      description: 'Description ' + index,
    }))
    const { container, rerender } = render(<BeforeAccordion products={products} />)
    const before = dom(container)
    rerender(<Accordion products={products} />)
    expect(dom(container)).toBe(before)
    rerender(<BeforeAnimated products={products} welcomeText="Welcome" findOutMoreText="DETAILS" />)
    const beforeAnimated = dom(container)
    rerender(<Animated products={products} welcomeText="Welcome" findOutMoreText="DETAILS" />)
    expect(dom(container)).toBe(beforeAnimated)
  })
  it('preserves original index callbacks and controlled ordering on keyboard activation', () => {
    const products = [
        { id: 'a', title: 'A', description: 'A description' },
        { id: 'b', title: 'B', description: 'B description' },
        { id: 'c', title: 'C', description: 'C description' },
      ],
      callback = vi.fn()
    const { container } = render(
      <Accordion products={products} productOrder={[99, 2, -1, 0]} onProductClick={callback} />,
    )
    const collapsed = screen.getByRole('button', { name: 'A' })
    fireEvent.keyDown(collapsed, { key: 'Enter' })
    fireEvent.keyDown(collapsed, { key: ' ' })
    fireEvent.keyDown(collapsed, { key: 'Enter', repeat: true })
    expect(callback.mock.calls).toEqual([[0], [0]])
    expect(container.querySelector('h2')).toHaveTextContent('C')
  })
})
