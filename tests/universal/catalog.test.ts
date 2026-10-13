import { expect, it, vi } from 'vitest'
import { EXPERIENCE_MANIFESTS } from '@/experiences/registry'
import { PROJECT_PACKS } from '@/app/registry/projectPackRegistry'
import { buildUniversalCatalog } from '@/universal/catalog'

vi.mock('react', () => {
  throw new Error('Universal catalog imported UI runtime')
})

it('derives every manifest/release context without claiming native migration', () => {
  const catalog = buildUniversalCatalog()
  expect(catalog.experiences.map((row) => row.id)).toEqual(EXPERIENCE_MANIFESTS.map((row) => row.id))
  expect(catalog.contexts).toHaveLength(EXPERIENCE_MANIFESTS.reduce((sum, row) => sum + row.releases.length, 0))
  expect(new Set(catalog.contexts.map((row) => row.key)).size).toBe(catalog.contexts.length)
  expect(catalog.contexts.every((row) => row.migrationStatus === 'legacy-web' && !row.nativeAccepted)).toBe(true)
  expect(catalog.inventoryComplete).toBe(false)
  expect(catalog.inventoryGaps).toContain('intra-screen-states')
})

it('keeps Italy, Romania and Czech Evo axes and source ownership intact', () => {
  const { contexts } = buildUniversalCatalog()
  expect(contexts.find((row) => row.experienceId === 'pi.it.mobile-first')).toMatchObject({
    product: 'PI',
    country: 'IT',
    designSystem: 'mobile-first',
    release: 'release-current',
    entryScreen: 'pi.home.overview',
  })
  expect(contexts.find((row) => row.experienceId === 'pi.ro.baseline')).toMatchObject({
    product: 'PI',
    country: 'RO',
    designSystem: 'current',
  })
  const evo = contexts.find((row) => row.experienceId === 'pi.cz.evo-2027')!
  expect(evo).toMatchObject({
    country: 'CZ',
    designSystem: 'current',
    release: 'release-future-evo-2027',
    owner: 'pi-cz-future',
  })
  expect(contexts.some((row) => row.country === 'RO' && row.release === 'release-future-evo-2027')).toBe(false)
})

it('preserves BA_BL, Kids and prepared products rather than manufacturing compatible demos', () => {
  const catalog = buildUniversalCatalog()
  expect(catalog.contexts.some((row) => row.country === 'BA')).toBe(true)
  expect(catalog.contexts.some((row) => row.country === 'BA_BL')).toBe(true)
  expect(new Set(catalog.contexts.filter((row) => row.product === 'KIDS_PI').map((row) => row.country))).toEqual(
    new Set(['SK', 'HU', 'RO']),
  )
  expect(catalog.contexts.some((row) => row.product === 'SME' || row.designSystem === 'next')).toBe(false)
  expect(catalog.preparedPacks.map((row) => row.id)).toEqual(
    PROJECT_PACKS.filter((row) => row.integrationReadiness === 'prepared').map((row) => row.id),
  )
})

it('lists uncatalogued routes and includes only eligible app-screen candidates per context', () => {
  const catalog = buildUniversalCatalog()
  const italy = catalog.contexts.find((row) => row.country === 'IT')!
  expect(italy.screenCandidates.map((row) => row.id)).toEqual(['pi.home.overview'])
  expect(italy.sourceModules.some((path) => path.endsWith('MobileFirstSearch.tsx'))).toBe(true)
  expect(catalog.uncataloguedRoutes.length).toBeGreaterThan(0)
  expect(catalog.contexts.flatMap((row) => row.screenCandidates).some((row) => row.id.startsWith('platform.'))).toBe(
    false,
  )
})

it('rejects duplicate experience input instead of hiding ambiguous context rows', () => {
  const first = EXPERIENCE_MANIFESTS[0]!
  expect(() => buildUniversalCatalog([first, first])).toThrow(/duplicate/i)
})
