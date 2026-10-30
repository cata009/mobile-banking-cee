import { describe, expect, it } from 'vitest'
import {
  resolveProductMenuCard,
  resolveProductOfferCard,
  resolveShopsmartOfferCard,
} from '@/app/components/contracts/marketingCard'
import { resolveMoreCard } from '@/app/components/contracts/moreCard'
import {
  accordionEntries,
  promoteAccordionIndex,
  PRELOGIN_ACCORDION_CONTRACT,
} from '@/app/components/contracts/preloginAccordion'

describe('baseline marketing contracts', () => {
  it.each(['standard', 'compact'] as const)('preserves menu %s dimensions and per-card image placement', (variant) => {
    const state = resolveProductMenuCard({ id: 'account', variant, badgeCount: 100 })
    expect(state).toMatchObject({
      height: variant === 'compact' ? 72 : 120,
      padding: variant === 'compact' ? 12 : 16,
      badgeText: '99+',
      radius: 8,
      image: { bottom: -2, right: 0, height: variant === 'compact' ? 60 : 92, width: variant === 'compact' ? 48 : 72 },
    })
  })
  it('keeps More legacy base and concrete card defaults distinct', () => {
    expect(resolveMoreCard({ variant: 'base', badgeCount: 100 })).toMatchObject({
      height: 120,
      hoverOpacity: 0.9,
      titleFontSize: 18,
      badgeText: '99',
    })
    expect(resolveMoreCard({ variant: 'documents', badgeCount: 100 })).toMatchObject({
      hoverOpacity: 0.8,
      titleFontSize: 18,
      badgeText: '99',
    })
    expect(resolveMoreCard({ variant: 'contacts', badgeCount: 100 }).badgeText).toBeNull()
    expect(resolveMoreCard({ variant: 'gdpr-consent' }).image.repeatTile).toEqual({
      width: 61.60000091791153,
      height: 62.90000093728304,
    })
    expect(resolveMoreCard({ variant: 'third-party-consent' }).image.transform).toBe('rotate(-156deg) scaleY(-1)')
  })
  it('keeps the fine ShopSmart border and decorative states', () => {
    expect(resolveShopsmartOfferCard({ interactive: false })).toMatchObject({
      rootTag: 'article',
      imageHeight: 130,
      radius: 8,
      borderWidth: 1,
      borderColor: '#666666',
      titleFontSize: 18,
      titleLineHeight: 23,
      pillWidth: 120,
      pillTop: 112,
    })
    expect(
      resolveShopsmartOfferCard({ interactive: true, variant: 'partner', imageHeight: 143, trailingIcon: 'partners' }),
    ).toMatchObject({
      rootTag: 'button',
      imageHeight: 143,
      titleFontSize: 20,
      titleLineHeight: 24,
      icon: 'shopsmart-store',
      tagColor: '#DD1860',
    })
    expect(resolveProductOfferCard({ variant: 'compact', caption: 'Short note' })).toMatchObject({
      width: 327,
      height: 157,
      titleFontSize: 20,
      descriptionFontSize: 16,
      showCaption: true,
    })
  })
  it('preserves prelogin entry filtering and historical promotion without changing controllers', () => {
    const products = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    expect(accordionEntries(products, [99, 2, -1, 0])).toEqual([
      { index: 2, product: products[2] },
      { index: 0, product: products[0] },
    ])
    expect(promoteAccordionIndex([0, 1, 2], 2)).toEqual([2, 0, 1])
    const original = [0, 1, 2]
    expect(promoteAccordionIndex(original, 0)).toBe(original)
    expect(PRELOGIN_ACCORDION_CONTRACT).toMatchObject({
      separatorWidth: 327,
      collapsedPadding: 24,
      gap: 24,
      animationDuration: 0.35,
      easing: [0.4, 0, 0.2, 1],
    })
  })
})
