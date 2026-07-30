import { describe, expect, it } from 'vitest'
import { COMPONENT_REGISTRY } from '@/app/registry/componentRegistry'
import { FEATURE_META } from '@/app/registry/demoConfig'
import { FEATURE_UI_MAP } from '@/app/registry/featureUI'
import { SCREEN_REGISTRY } from '@/app/registry/screenRegistry'

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
      releases: ['release-future-cz-robo'],
      affectedScreens: ['pi.investments.portfolio'],
    })
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
