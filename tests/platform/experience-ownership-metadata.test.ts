import { existsSync } from 'node:fs'
import { expect, it, vi } from 'vitest'
import { EXPERIENCE_MANIFESTS, validateExperienceManifests } from '@/experiences/registry'
vi.mock('react', () => {
  throw new Error('Experience metadata imported React')
})
const entries = import.meta.glob('/src/experiences/**/index.ts', { eager: true })
it('keeps every market metadata entry independent of the UI runtime and refers to the same manifest', () => {
  expect(EXPERIENCE_MANIFESTS).toHaveLength(15)
  expect(Object.keys(entries)).toHaveLength(15)
  for (const entry of Object.values(entries)) expect(EXPERIENCE_MANIFESTS).toContain(Object.values(entry as object)[0])
})
it('rejects future releases in another product or market and blocks entry/source mismatches', () => {
  const ro = EXPERIENCE_MANIFESTS.find((manifest) => manifest.id === 'pi.ro.baseline')!
  expect(() => validateExperienceManifests([{ ...ro, releases: ['release-future-evo-2027'] }])).toThrow(
    /market\/product/i,
  )
  expect(() => validateExperienceManifests([{ ...ro, entryScreen: 'kids.sk.home-concept' }])).toThrow(/entry screen/i)
  expect(() => validateExperienceManifests([{ ...ro, sourceModules: [] }])).toThrow(/source/i)
})

it('references existing implementation sources for each catalogued market', () => {
  for (const manifest of EXPERIENCE_MANIFESTS)
    for (const path of manifest.sourceModules) expect(existsSync(path), manifest.id + ':' + path).toBe(true)
})
