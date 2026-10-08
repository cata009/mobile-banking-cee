import { expect, it } from 'vitest'
import { SCREEN_REGISTRY } from '@/app/registry/screenRegistry'
import { getProjectPack } from '@/app/registry/projectPackRegistry'
import { ROUTE_POLICY } from '@/app/navigation/routePolicy'

it('catalogues the implemented Romanian Kids homepage instead of treating it as a placeholder', () => {
  const screen = Object.values(SCREEN_REGISTRY).find(screen => screen.id === 'kids.ro.home-concept')
  expect(screen).toMatchObject({ runtimeScreen:'homepage', products:['KIDS_PI'], countries:['RO'], designSystems:['current'], status:'mock-driven' })
  expect(getProjectPack('KIDS_PI','RO').demoEntries).toContain('kids.ro.home-concept')
  expect(ROUTE_POLICY.homepage.registryIds).toContain('kids.ro.home-concept')
})
