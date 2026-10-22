import { describe, expect, it } from 'vitest'
import { resolveHeaderTitleAccessibility } from '@/app/components/contracts/headerTitleAccessibility'
import { resolvePageHeader } from '@/app/components/contracts/pageHeader'

describe('Headers & Titles accessibility contract', () => {
  it.each([0, 0.5, 0.999, 1])('has one accessible title during the cross-fade at %s', progress => {
    for (const compact of [false, true]) {
      const header = resolvePageHeader({ compact, collapsedTitleProgress: progress })
      const titles = resolveHeaderTitleAccessibility({
        largeTitleRendered: header.shouldRenderLargeTitle,
        largeTitleOpacity: header.largeTitleOpacity,
        collapsedTitleOpacity: header.titleProgress,
      })
      expect(Number(!titles.largeTitleHidden) + Number(!titles.collapsedTitleHidden)).toBe(1)
      expect(titles.largeTitleHidden).toBe(progress >= (compact ? 0.999 : 1))
    }
  })

  it('leaves a visible standalone toolbar title available', () => {
    expect(resolveHeaderTitleAccessibility({
      largeTitleRendered: false, largeTitleOpacity: 1, collapsedTitleOpacity: 1,
    })).toEqual({ largeTitleHidden: true, collapsedTitleHidden: false })
  })

  it('does not expose an invisible toolbar over an external host title', () => {
    expect(resolveHeaderTitleAccessibility({
      largeTitleRendered: false, largeTitleOpacity: 1, collapsedTitleOpacity: 0,
      hideCollapsedTitleWhenHidden: true,
    })).toEqual({ largeTitleHidden: true, collapsedTitleHidden: true })
  })

  it('preserves the standalone toolbar heading unless the host explicitly hides it', () => {
    expect(resolveHeaderTitleAccessibility({
      largeTitleRendered: false, largeTitleOpacity: 1, collapsedTitleOpacity: 0,
    })).toEqual({ largeTitleHidden: true, collapsedTitleHidden: false })
  })
})
