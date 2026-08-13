import { describe, expect, it } from 'vitest'
import { COMPONENT_REGISTRY } from '@/app/registry/componentRegistry'
import { FEATURE_META } from '@/app/registry/demoConfig'
import { FEATURE_MANIFESTS } from '@/app/registry/featureManifestRegistry'
import { FEATURE_UI_MAP } from '@/app/registry/featureUI'
import { RELEASES } from '@/app/registry/projectModel'
import { PROJECT_PACKS } from '@/app/registry/projectPackRegistry'
import { RELEASE_BUNDLES, RELEASE_ORDER } from '@/app/registry/releaseRegistry'
import { SCREEN_REGISTRY } from '@/app/registry/screenRegistry'
import { DEFAULT_DEMO_STATE } from '@/app/state/demoStore'
import { getFeatureFlags } from '@/app/state/featureHelpers'

describe('core registry contracts', () => {
  it('maps every feature metadata entry to UI', () => {
    expect(Object.keys(FEATURE_UI_MAP).sort()).toEqual(Object.keys(FEATURE_META).sort())
  })

  it('places the CZ assistant in its portable app location', () => {
    expect(FEATURE_UI_MAP.fx_czCoAppingSmartAssistant).toMatchObject({
      id: 'fx_czCoAppingSmartAssistant',
      locations: ['app.assistant'],
    })
  })

  it('places the isolated CZ Robo preview inside Investments', () => {
    expect(FEATURE_UI_MAP.fx_czRoboAdvisor).toMatchObject({
      id: 'fx_czRoboAdvisor',
      locations: ['investments.robo'],
    })

    expect(FEATURE_META.fx_czRoboAdvisor).toMatchObject({
      label: 'CZ - Robo',
      countries: ['CZ'],
      releases: ['release-future-cz-robo', 'release-future-app-2027'],
      affectedScreens: ['pi.investments.portfolio'],
    })
  })

  it('registers App 2027 as a global PI future release while retaining CZ Robo', () => {
    expect(RELEASE_ORDER).toContain('release-future-app-2027')
    expect(RELEASE_ORDER.indexOf('release-future-app-2027')).toBe(
      RELEASE_ORDER.indexOf('release-future-cz-robo') + 1,
    )

    expect(RELEASE_BUNDLES['release-future-app-2027']).toMatchObject({
      label: 'App 2027',
      baseline: 'baseline-current',
      releaseCode: 'FUTURE',
      features: ['fx_czRoboAdvisor', 'fx_app2027Homepage'],
      introducedFeatures: ['fx_app2027Homepage'],
      promotionTargetBaseline: null,
      status: 'release-preview',
    })
    expect(RELEASES['release-future-app-2027']).toMatchObject({
      label: 'App 2027',
      status: 'active',
    })

    expect(FEATURE_META.fx_app2027Homepage).toMatchObject({
      label: 'App 2027 Homepage',
      scope: 'global',
      releases: ['release-future-app-2027'],
      products: ['PI'],
      designSystems: ['current'],
      introducedIn: 'release-future-app-2027',
      affectedScreens: ['pi.home.overview'],
    })
    expect(FEATURE_META.fx_czRoboAdvisor.releases).toEqual([
      'release-future-cz-robo',
      'release-future-app-2027',
    ])
    expect(FEATURE_MANIFESTS.fx_app2027Homepage).toMatchObject({
      id: 'fx_app2027Homepage',
      source: 'runtime',
      introducedIn: 'release-future-app-2027',
      products: ['PI'],
      countries: ['RO', 'CZ', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI'],
      designSystems: ['current'],
      affectedScreens: ['pi.home.overview'],
    })
    expect(FEATURE_UI_MAP.fx_app2027Homepage).toMatchObject({
      id: 'fx_app2027Homepage',
      locations: ['home.app2027'],
    })

    expect(
      getFeatureFlags({
        ...DEFAULT_DEMO_STATE,
        release: 'release-future-app-2027',
      }).app2027Homepage,
    ).toBe(true)
  })

  it('registers Evo 2027 as a CZ-only App 2027-compatible future release', () => {
    expect(RELEASE_ORDER.indexOf('release-future-evo-2027')).toBe(
      RELEASE_ORDER.indexOf('release-future-app-2027') + 1,
    )
    expect(RELEASE_BUNDLES['release-future-evo-2027']).toMatchObject({
      label: 'Evo 2027',
      baseline: 'baseline-current',
      releaseCode: 'FUTURE',
      features: ['fx_czRoboAdvisor', 'fx_evo2027Homepage'],
      introducedFeatures: ['fx_evo2027Homepage'],
      promotionTargetBaseline: null,
      status: 'release-preview',
    })
    expect(RELEASES['release-future-evo-2027']).toMatchObject({
      label: 'Evo 2027',
      status: 'active',
    })

    expect(FEATURE_META.fx_evo2027Homepage).toMatchObject({
      label: 'Evo 2027 Homepage',
      scope: 'countries',
      countries: ['CZ'],
      releases: ['release-future-evo-2027'],
      products: ['PI'],
      designSystems: ['current'],
      introducedIn: 'release-future-evo-2027',
      affectedScreens: ['pi.home.overview'],
    })
    expect(FEATURE_MANIFESTS.fx_evo2027Homepage).toMatchObject({
      id: 'fx_evo2027Homepage',
      source: 'runtime',
      introducedIn: 'release-future-evo-2027',
      products: ['PI'],
      countries: ['CZ'],
      designSystems: ['current'],
      affectedScreens: ['pi.home.overview'],
    })
    expect(FEATURE_UI_MAP.fx_evo2027Homepage).toMatchObject({
      id: 'fx_evo2027Homepage',
      locations: ['home.app2027'],
    })
    expect(
      getFeatureFlags({
        ...DEFAULT_DEMO_STATE,
        country: 'CZ',
        release: 'release-future-evo-2027',
      }).evo2027Homepage,
    ).toBe(true)

    expect(PROJECT_PACKS.find((pack) => pack.product === 'PI' && pack.country === 'CZ')?.releases).toContain(
      'release-future-evo-2027',
    )
    expect(PROJECT_PACKS.find((pack) => pack.product === 'PI' && pack.country === 'RO')?.releases).not.toContain(
      'release-future-evo-2027',
    )
  })

  it('references only registered screens from components', () => {
    const invalidReferences = Object.values(COMPONENT_REGISTRY).flatMap((component) =>
      component.usedByScreens
        .filter((screenId) => !Object.prototype.hasOwnProperty.call(SCREEN_REGISTRY, screenId))
        .map((screenId) => `${component.id}:${screenId}`),
    )

    expect(invalidReferences).toEqual([])
  })
})
