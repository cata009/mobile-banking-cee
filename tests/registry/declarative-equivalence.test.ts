import { createHash } from 'node:crypto'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { COMPONENT_REGISTRY } from '@/app/registry/componentRegistry'
import { SCREEN_REGISTRY } from '@/app/registry/screenRegistry'
import { AppIcon, ICON_INVENTORY, ICON_REGISTRY } from '@/app/components/icons/AppIcon'
import baseline from './fixtures/declarative-baseline.json'
import inventoryDelta from './fixtures/icon-inventory-delta.json'
import figmaAdditions from './fixtures/figma-catalog-components.json'
import { FIGMA_COMPONENTS } from '@/app/registry/domains/foundation/figmaComponents'
const hash = (value: string) => createHash('sha256').update(value).digest('hex')
describe('approved declarative output', () => {
  it.each([
    ['COMPONENT_REGISTRY', COMPONENT_REGISTRY],
    ['SCREEN_REGISTRY', SCREEN_REGISTRY],
  ] as const)('preserves resolved %s entries and ordering', (name, registry) => {
    const preserved =
      name === 'COMPONENT_REGISTRY'
        ? Object.fromEntries(
            Object.entries(registry).filter(([id]) => !Object.prototype.hasOwnProperty.call(FIGMA_COMPONENTS, id)),
          )
        : registry
    expect(Object.keys(preserved)).toHaveLength(baseline[name].count)
    const serialized = JSON.stringify(preserved, (key, value: unknown) =>
      key === 'imageSrc' && typeof value === 'string' ? value.slice(value.lastIndexOf('/screenshots/')) : value,
    )
    expect(hash(serialized)).toBe(baseline[name].hash)
    if (name === 'COMPONENT_REGISTRY') {
      expect(Object.keys(registry)).toEqual([...Object.keys(preserved), ...Object.keys(FIGMA_COMPONENTS)])
      expect(Object.keys(FIGMA_COMPONENTS)).toHaveLength(figmaAdditions.count)
      expect(hash(JSON.stringify(FIGMA_COMPONENTS))).toBe(figmaAdditions.hash)
      for (const [id, entry] of Object.entries(FIGMA_COMPONENTS))
        expect(COMPONENT_REGISTRY[id as keyof typeof FIGMA_COMPONENTS]).toEqual(entry)
    }
  })
  it('preserves every icon name, glyph, viewBox and default dimensions', () => {
    const output = Object.fromEntries(
      Object.keys(ICON_REGISTRY).map((rawName) => {
        const name = rawName as keyof typeof ICON_REGISTRY
        return [name, hash(renderToStaticMarkup(createElement(AppIcon, { name })))]
      }),
    )
    // The approved installment icon was registered after the extraction baseline.
    expect(output['card-installment-plan']).toBe('381df5f719a3d0c40f9b106c330ee0a48f2aaaad010660df6bc9765dd8cf97fd')
    const preserved = Object.fromEntries(Object.entries(output).filter(([name]) => name !== 'card-installment-plan'))
    expect(preserved).toEqual(baseline.icons)
    expect(ICON_INVENTORY.filter((icon) => icon.name === 'card-installment-plan')).toHaveLength(1)
    const inventory = JSON.parse(
      JSON.stringify(ICON_INVENTORY.filter((icon) => icon.name !== 'card-installment-plan')),
    ) as typeof ICON_INVENTORY
    expect(inventoryDelta.changes).toHaveLength(1)
    for (const change of inventoryDelta.changes) {
      const index = inventory.findIndex((icon) => icon.name === change.name)
      expect(inventory[index]).toEqual(change.after)
      inventory[index] = change.before as (typeof ICON_INVENTORY)[number]
    }
    expect(hash(JSON.stringify(inventory))).toBe(baseline.inventory)
  })
})
