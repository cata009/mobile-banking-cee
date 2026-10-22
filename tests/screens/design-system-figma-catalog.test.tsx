// @vitest-environment jsdom
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { COMPONENT_REGISTRY } from '@/app/registry/componentRegistry'
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'

vi.mock('@/app/components/demo/NativeScreenPreview', () => ({
  NativeScreenPreview: ({ snapshot }: { snapshot: { componentPreview?: { componentId: string } } }) => (
    <div data-testid="native-component" data-implementation={snapshot.componentPreview?.componentId} />
  ),
}))

function renderCatalog() {
  return render(
    <DemoProvider initialState={{ country: 'RO' }}>
      <LanguageProvider initialLanguage="en">
        <FigmaLibraryInventory />
      </LanguageProvider>
    </DemoProvider>,
  )
}
import FigmaLibraryInventory from '@/app/screens/design-system/FigmaLibraryInventory'
import {
  FIGMA_LIBRARY_EXAMPLES,
  FIGMA_IMPLEMENTATION_GROUPS,
  FIGMA_LIBRARY_FAMILY_COUNT,
  FIGMA_LIBRARY_PAGES,
  FIGMA_LIBRARY_VARIANT_COUNT,
  getFigmaFamilyExamples,
  getFigmaFamilyForHash,
  getFigmaFamilyHref,
  getFigmaNodeUrl,
  getFigmaVariantScopeExclusion,
  getFigmaFamilyScopeExclusion,
  matchesFigmaFamily,
} from '@/app/screens/design-system/figmaLibraryCatalog'
import { getInventoryTabForHash } from '@/app/screens/design-system/inventoryNav'
import { getFigmaLibraryReference } from '@/app/screens/design-system/figmaLibraryReferences'

import { inventorySectionLinks } from '@/app/screens/design-system/inventoryNav'

const source = JSON.parse(readFileSync(resolve('docs/tasks/design-system-figma-source-2026-10-20.json'), 'utf8')) as {
  pages: Array<{
    nodeId: string
    name: string
    families: Array<{ nodeId: string; variants: Array<{ nodeId: string }> }>
  }>
}

it('honors original-photo scope while preserving available variants of the same family', () => {
  expect(getFigmaFamilyScopeExclusion('1287:6540')).toBeUndefined()
  expect(getFigmaFamilyExamples('1287:6540')).toEqual(['marketing.source-campaign'])
  expect(getFigmaFamilyExamples('constructor')).toEqual([])
  expect(getFigmaVariantScopeExclusion('804:5298')).toMatch(/illustration/i)
  expect(getFigmaFamilyScopeExclusion('804:4923')).toBeUndefined()
  window.history.replaceState(null, '', '#figma/1287%3A6540')
  renderCatalog()
  expect(screen.getAllByTestId('native-component')).toHaveLength(1)
  expect(screen.getByText(/Excluded by scope:/)).toBeInTheDocument()
  expect(getNativeDesignSystemPreview('marketing.source-campaign')?.variants).toContain('1287:6543')
  expect(getNativeDesignSystemPreview('marketing.source-campaign')?.variants).not.toContain('1287:6541')
})

it('lists every current canonical Figma page in source order instead of the legacy seven groups', () => {
  expect(inventorySectionLinks.components.map(([, label]) => label)).toEqual(source.pages.map((page) => page.name))
})

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '#figma-library')
})

it('keeps every captured family and authored variant without inflating implementation claims', () => {
  const expected = source.pages.flatMap((page) => page.families)
  const actual = FIGMA_LIBRARY_PAGES.flatMap((page) => page.families)
  expect(actual.map((family) => family.nodeId)).toEqual(expected.map((family) => family.nodeId))
  expect(FIGMA_LIBRARY_FAMILY_COUNT).toBe(expected.length)
  expect(FIGMA_LIBRARY_VARIANT_COUNT).toBe(expected.flatMap((family) => family.variants).length)
  expect(new Set(actual.flatMap((family) => family.variants).map((variant) => variant.nodeId)).size).toBe(
    FIGMA_LIBRARY_VARIANT_COUNT,
  )
})

it('includes the seven approved RO/CZ additions on their exact canonical pages', () => {
  const expected = {
    '10320:35': '10135:7175',
    '10320:62098': '10135:7175',
    '10333:38': '10135:7175',
    '10320:379': '0:1817',
    '10320:62270': '0:1817',
    '10321:911': '0:3162',
    '10320:63365': '10141:33712',
  }
  for (const [id, pageId] of Object.entries(expected))
    expect(getFigmaFamilyForHash(getFigmaFamilyHref(id))?.page.nodeId).toBe(pageId)
})

it('maps existing or real native sources and keeps Dropdown independent from TextField', () => {
  for (const ids of Object.values(FIGMA_LIBRARY_EXAMPLES))
    for (const id of ids) {
      const native = getNativeDesignSystemPreview(id)
      expect(Object.prototype.hasOwnProperty.call(COMPONENT_REGISTRY, id) || Boolean(native)).toBe(true)
      if (native) expect(readFileSync(resolve(native.sourcePath), 'utf8')).toContain('export')
    }
  expect(getFigmaFamilyExamples('715:9631')).toEqual(['ui.dropdown-field'])
  expect(getFigmaFamilyExamples('10183:68496')).toContain('ui.text-field')
  expect(
    FIGMA_LIBRARY_PAGES.flatMap((page) => page.families).find((family) => family.nodeId === '715:9631')?.variants,
  ).toHaveLength(18)
})

it('resolves every original canonical SVG import through the same source alias as the native web bridge', () => {
  const renderer = readFileSync(resolve('native-spike/src/universal/BaselineCanonicalIcon.tsx'), 'utf8')
  const imports = [...renderer.matchAll(/from ['"](@\/[^'"]+\.svg)['"]/g)].map((match) => match[1]!)
  expect(imports.length).toBeGreaterThan(100)
  for (const asset of imports) expect(existsSync(resolve('src', asset.slice(2))), asset).toBe(true)
})

it('supports source deep links, malformed input and legacy specimen hashes', () => {
  expect(getFigmaFamilyForHash('#figma/715%3A6238')?.family.name).toBe('Button')
  expect(getFigmaFamilyForHash('#figma/%invalid')).toBeUndefined()
  expect(getFigmaFamilyForHash('#figma/unknown')).toBeUndefined()
  expect(getFigmaFamilyForHash('#component/ui.text-field')).toBeUndefined()
  expect(getInventoryTabForHash('#headers')).toBe('components')
  expect(getInventoryTabForHash('#figma/715%3A6238')).toBe('components')
  expect(getFigmaNodeUrl('715:6238')).toContain('node-id=715-6238')
})

it('searches variant properties and source identity using all query terms', () => {
  const page = FIGMA_LIBRARY_PAGES.find((item) => item.nodeId === '0:2626')!
  const family = page.families[0]!
  expect(matchesFigmaFamily(page, family, 'dropdown empty')).toBe(true)
  expect(matchesFigmaFamily(page, family, family.key)).toBe(true)
  expect(matchesFigmaFamily(page, family, family.variants[0]!.nodeId)).toBe(true)
  expect(matchesFigmaFamily(page, family, family.variants[0]!.key)).toBe(true)
  expect(matchesFigmaFamily(page, family, 'dropdown nonexistent')).toBe(false)
})

it('filters the complete library by approved component name and page', () => {
  window.history.replaceState(null, '', '#figma-library')
  const { container } = renderCatalog()
  expect(container.querySelectorAll('[data-ds-component]')).toHaveLength(FIGMA_IMPLEMENTATION_GROUPS.length)
  const ids = Array.from(container.querySelectorAll('[data-ds-component]'), (node) =>
    node.getAttribute('data-ds-component'),
  )
  expect(new Set(ids).size).toBe(ids.length)
  expect(container.querySelector('img[src^="/design-system/figma/"]')).not.toBeInTheDocument()
  expect(container.querySelectorAll('[data-figma-page]')).toHaveLength(source.pages.length)
  fireEvent.change(screen.getByRole('textbox', { name: 'Search components' }), {
    target: { value: 'Notification counter' },
  })
  expect(container.querySelectorAll('[data-figma-family]')).toHaveLength(1)
  expect(screen.getByRole('heading', { name: 'Notification counter' })).toBeInTheDocument()
  fireEvent.change(screen.getByRole('textbox', { name: 'Search components' }), { target: { value: '' } })
  fireEvent.change(screen.getByRole('combobox', { name: 'Figma page' }), { target: { value: '10183:68287' } })
  expect(container.querySelectorAll('[data-figma-family]')).toHaveLength(2)
  expect(screen.getByRole('heading', { name: 'Text field' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Code Field' })).toBeInTheDocument()
})

it('recovers from an empty result and distinguishes reference-only designs', () => {
  renderCatalog()
  fireEvent.change(screen.getByRole('textbox', { name: 'Search components' }), {
    target: { value: 'there-is-no-such-component' },
  })
  expect(screen.getByRole('heading', { name: 'No components found' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
  expect(screen.queryByRole('heading', { name: 'No components found' })).not.toBeInTheDocument()
  fireEvent.change(screen.getByRole('combobox', { name: 'Filter implementation coverage' }), {
    target: { value: 'references' },
  })
  expect(screen.getAllByText(/design and platform references/).length).toBeGreaterThan(0)
})

it('opens Dropdown with its real selection component and all authored source references', () => {
  window.history.replaceState(null, '', '#figma/715%3A9631')
  renderCatalog()
  expect(screen.getByRole('heading', { name: 'Dropdown field', level: 1 })).toBeInTheDocument()
  expect(screen.getByTestId('native-component')).toHaveAttribute('data-implementation', 'ui.dropdown-field')
  expect(screen.getAllByTestId('native-component')).toHaveLength(1)
  expect(screen.getByRole('button', { name: 'Inspector OFF' })).toBeInTheDocument()
  expect(
    within(screen.getByRole('list', { name: 'Dropdown field source variants' })).getAllByRole('listitem'),
  ).toHaveLength(18)
  expect(screen.getByRole('heading', { name: 'Accessibility' })).toBeInTheDocument()
  act(() => {
    window.history.replaceState(null, '', '#figma-10135-7175')
    window.dispatchEvent(new Event('hashchange'))
  })
  expect(screen.getByRole('heading', { name: 'Notification counter' })).toBeInTheDocument()
})

it('consolidates aliases without losing original source identities or multiplying previews', () => {
  const logos = FIGMA_IMPLEMENTATION_GROUPS.filter((group) => group.id === 'brand.unicredit-logo')
  expect(logos).toHaveLength(1)
  expect(logos[0]?.sources.map((source) => source.nodeId)).toEqual(['10141:40145', '147:6091', '0:6233'])
  expect(FIGMA_IMPLEMENTATION_GROUPS.filter((group) => group.id === 'ui.wallet-button')).toHaveLength(1)
  expect(getFigmaFamilyExamples('1517:12627')).toEqual(['payments.other-shortcut'])
  expect(getFigmaFamilyExamples('1272:8695')).toEqual(['images.card-art'])
  expect(getNativeDesignSystemPreview('images.card-art')?.variants).toHaveLength(29)
  expect(getNativeDesignSystemPreview('images.payment-art')?.variants).toHaveLength(13)
})

it('keeps OS controls, foundations and full compositions as references instead of duplicating app components', () => {
  const references = FIGMA_LIBRARY_PAGES.flatMap((page) => page.families).filter((family) =>
    getFigmaLibraryReference(family.nodeId),
  )
  expect(references).toHaveLength(28)
  expect(references.every((family) => !getFigmaFamilyExamples(family.nodeId).length)).toBe(true)
  expect(getFigmaLibraryReference('10178:68')?.kind).toBe('foundation')
  expect(getFigmaLibraryReference('1208:7612')?.kind).toBe('composition')
  expect(getFigmaLibraryReference('10135:8054')?.kind).toBe('platform')
  expect(getFigmaLibraryReference('constructor')).toBeUndefined()
})
