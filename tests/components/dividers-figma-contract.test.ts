import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { DIVIDER_RULE_327, DIVIDER_RULE_343, DIVIDER_RULE_LIGHT } from '@/app/components/contracts/dividerArtwork'
import { SECTION_HEADING_DIVIDER_SOURCE as legacySource } from '@/app/components/SectionHeadingDivider'
import { SECTION_HEADING_DIVIDER_SOURCE, resolveSectionDivider } from '@/app/components/contracts/sectionDivider'
import { resolveTransactionDivider } from '@/app/components/contracts/transactionDivider'
import { dividerFigmaCases } from '../fixtures/dividersFigma'

describe('documented Divider source and semantics', () => {
  it('bundles the original SVG bytes for both adapters, including the 0.25px stroke', () => {
    for (const [file, xml] of [
      ['rule-327.svg', DIVIDER_RULE_327],
      ['rule-343.svg', DIVIDER_RULE_343],
      ['rule-light.svg', DIVIDER_RULE_LIGHT],
    ]) {
      expect(xml).toBe(readFileSync(`src/assets/design-system/dividers/${file}`, 'utf8'))
      expect(xml).toContain('stroke-width="0.25"')
      expect(xml).toContain('stroke="#909090"')
    }
  })
  it.each(dividerFigmaCases)('$variant uses its measured source line box, gap, insets and width', (sample) => {
    const state = resolveSectionDivider({ variant: sample.variant })
    expect(state.lineHeight).toBe(sample.lineHeight)
    expect(state.fontSize).toBe(sample.fontSize)
    expect(state.width).toBe(sample.width)
    expect(state.paddingHorizontal).toBe(sample.inset)
    expect(state.rowGap).toBe(sample.rowGap)
    expect(state.hasLine).toBe(sample.ruleY !== null)
  })
  it('keeps the legacy metadata export connected to the platform-free contract', () => {
    expect(legacySource).toBe(SECTION_HEADING_DIVIDER_SOURCE)
    expect(Object.values(legacySource.sourceNodeIds)).toHaveLength(14)
    expect(legacySource.sourceNodeIds.actionDateCheckbox).toBe('8747:15065')
    expect(legacySource.dimensions).toEqual({ defaultWidth: 375, lightRestyleWidth: 343, lineHeight: 1 })
  })

  it('distinguishes section headings from dates and action labels', () => {
    for (const variant of [
      'section',
      'medium-title',
      'with-counter',
      'large-title',
      'light-title',
      'name-action',
    ] as const)
      expect(resolveSectionDivider({ variant }).titleRole).toBe('header')
    for (const variant of ['light-date', 'action-date', 'action-date-checkbox'] as const)
      expect(resolveSectionDivider({ variant }).titleRole).toBeUndefined()
    expect(resolveTransactionDivider().titleRole).toBe('header')
    expect(resolveTransactionDivider({ dateSeparator: true }).titleRole).toBeUndefined()
  })
  it('uses measured UniCredit line boxes for the existing month/date composition', () => {
    expect(resolveTransactionDivider()).toMatchObject({ fontSize: 16, lineHeight: 18, totalLineHeight: 15 })
    expect(resolveTransactionDivider({ dateSeparator: true })).toMatchObject({ fontSize: 14, lineHeight: 15 })
  })
})
