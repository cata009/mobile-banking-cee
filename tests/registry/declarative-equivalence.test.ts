import { createHash } from 'node:crypto'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { COMPONENT_REGISTRY } from '@/app/registry/componentRegistry'
import { SCREEN_REGISTRY } from '@/app/registry/screenRegistry'
import { TEMPLATE_REGISTRY } from '@/app/registry/templateRegistry'
import { AppIcon, ICON_INVENTORY, ICON_REGISTRY } from '@/app/components/icons/AppIcon'
import baseline from './fixtures/declarative-baseline.json'
const hash = (value: string) => createHash('sha256').update(value).digest('hex')
describe('approved declarative output', () => {
  it.each([
    ['COMPONENT_REGISTRY', COMPONENT_REGISTRY],
    ['SCREEN_REGISTRY', SCREEN_REGISTRY],
    ['TEMPLATE_REGISTRY', TEMPLATE_REGISTRY],
  ] as const)('preserves resolved %s entries and ordering', (name, registry) => {
    expect(Object.keys(registry)).toHaveLength(baseline[name].count)
    const serialized = JSON.stringify(registry, (key, value: unknown) =>
      key === 'imageSrc' && typeof value === 'string' ? value.slice(value.lastIndexOf('/screenshots/')) : value,
    )
    expect(hash(serialized)).toBe(baseline[name].hash)
  })
  it('preserves every icon name, glyph, viewBox and default dimensions', () => {
    const output = Object.fromEntries(
      Object.keys(ICON_REGISTRY).map((rawName) => {
        const name = rawName as keyof typeof ICON_REGISTRY
        return [name, hash(renderToStaticMarkup(createElement(AppIcon, { name })))]
      }),
    )
    expect(output).toEqual(baseline.icons)
    expect(hash(JSON.stringify(ICON_INVENTORY))).toBe(baseline.inventory)
  })
})
