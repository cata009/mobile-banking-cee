import { describe, expect, it } from 'vitest'
import {
  duoPreviewViewport,
  isDuoPreview,
  resolveDuoContent,
  resolveDuoOverlayInsets,
} from '@/features/demo-native/duoPreview'

describe('Duo baseline adaptation geometry', () => {
  it('keeps modal shading outside the simulated system region in both open orientations and on the cover', () => {
    expect(resolveDuoOverlayInsets({ width: 951, height: 669, rightInset: 84, referenceWidth: 375 })).toEqual({
      top: 0,
      right: 84,
    })
    expect(resolveDuoOverlayInsets({ width: 669, height: 951, rightInset: 0, referenceWidth: 375 })).toEqual({
      top: 54,
      right: 0,
    })
    expect(resolveDuoOverlayInsets({ width: 466, height: 678, rightInset: 84, referenceWidth: 375 })).toEqual({
      top: 0,
      right: 84,
    })
  })
  it('centres the existing baseline inside the asymmetric safe region, not the glass', () => {
    expect(resolveDuoContent({ width: 951, height: 669, rightInset: 84, referenceWidth: 375 })).toEqual({
      width: 375,
      height: 669,
      left: 246,
      top: 0,
    })
  })
  it('fits the cover without scaling typography or crossing the report strip', () => {
    const box = resolveDuoContent({ width: 466, height: 678, rightInset: 84, referenceWidth: 375 })
    expect(box).toEqual({ width: 375, height: 678, left: 3.5, top: 0 })
    expect(box.left + box.width).toBeLessThanOrEqual(382)
  })
  it('shrinks to available space and keeps legacy device identifiers', () => {
    expect(resolveDuoContent({ width: 320, height: 600, rightInset: 84, referenceWidth: 375 }).width).toBe(236)
    expect(isDuoPreview('apple-foldable-open')).toBe(true)
    expect(isDuoPreview('iphone-16')).toBe(false)
    expect(isDuoPreview('galaxy-fold8-open')).toBe(false)
  })
  it('uses two reference columns for wide content and comfortable bounded forms', () => {
    const viewport = { width: 951, height: 669, rightInset: 84, referenceWidth: 375 }
    expect(resolveDuoContent(viewport, 'home')).toEqual({ width: 560, height: 669, left: 153.5, top: 0 })
    expect(resolveDuoContent(viewport, 'card').width).toBe(560)
    expect(resolveDuoContent(viewport, 'payments').width).toBe(560)
    expect(resolveDuoContent(viewport, 'products').width).toBe(560)
    expect(resolveDuoContent(viewport, 'profile').width).toBe(560)
    expect(resolveDuoContent(viewport, 'payment-create').width).toBe(560)
    expect(resolveDuoContent(viewport, 'transactions').width).toBe(560)
    expect(resolveDuoContent(viewport, 'documents').width).toBe(560)
    expect(resolveDuoContent(viewport).width).toBe(375)
    expect(resolveDuoContent({ ...viewport, width: 466 }, 'home').width).toBe(375)
  })
  it('moves the inner portrait system area to the top and keeps readable content at560', () => {
    const portrait = duoPreviewViewport('apple-foldable-open', { width: 669, height: 951 })!
    expect(portrait.rightInset).toBe(0)
    expect(resolveDuoContent(portrait, 'home')).toEqual({ width: 560, height: 951, left: 54.5, top: 0 })
    expect(duoPreviewViewport('apple-foldable-open', { width: 951, height: 669 })?.rightInset).toBe(84)
    expect(duoPreviewViewport('iphone-16', { width: 393, height: 852 })).toBeUndefined()
  })
})
