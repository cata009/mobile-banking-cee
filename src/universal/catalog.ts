import { EXPERIENCE_MANIFESTS, validateExperienceManifests } from '@/experiences/registry'
import { PROJECT_PACKS } from '@/app/registry/projectPackRegistry'
import { SCREEN_REGISTRY } from '@/app/registry/screenRegistry'
import { ROUTE_POLICY, isRouteEligibleForProductContext } from '@/app/navigation/routePolicy'
import type { ExperienceManifest } from '@/experiences/contracts'

/** Inventory facts only. Web implementation never implies accepted native coverage. */
export function buildUniversalCatalog(manifests: readonly ExperienceManifest[] = EXPERIENCE_MANIFESTS) {
  validateExperienceManifests(manifests)
  const experiences = manifests.map((manifest) => ({
    ...manifest,
    releases: [...manifest.releases],
    sourceModules: [...manifest.sourceModules],
  }))
  const contexts = experiences.flatMap((manifest) =>
    manifest.releases.map((release) => {
      const context = {
        product: manifest.product,
        country: manifest.country,
        designSystem: manifest.designSystem,
        release,
      }
      return {
        key: [manifest.product, manifest.country, manifest.designSystem, manifest.baseBaseline, release].join(':'),
        experienceId: manifest.id,
        label: manifest.label,
        owner: manifest.owner,
        ...context,
        baseline: manifest.baseBaseline,
        entryScreen: manifest.entryScreen,
        sourceModules: [...manifest.sourceModules],
        migrationStatus: 'legacy-web' as const,
        nativeAccepted: false as const,
        screenCandidates: Object.values(SCREEN_REGISTRY)
          .filter(
            (screen) =>
              !screen.id.startsWith('platform.') &&
              screen.products.includes(context.product) &&
              screen.countries.includes(context.country) &&
              screen.designSystems.includes(context.designSystem) &&
              (!screen.releases || screen.releases.includes(release)) &&
              !['missing', 'blocked', 'legacy', 'planned'].includes(screen.status) &&
              isRouteEligibleForProductContext(screen.runtimeScreen, context),
          )
          .map((screen) => ({
            id: screen.id,
            runtimeScreen: screen.runtimeScreen,
            source: screen.componentPath,
            webStatus: screen.status,
          })),
      }
    }),
  )
  const registeredRoutes = new Set(Object.values(SCREEN_REGISTRY).map((screen) => screen.runtimeScreen))
  return {
    schemaVersion: 1 as const,
    experiences,
    contexts,
    preparedPacks: PROJECT_PACKS.filter((pack) => pack.integrationReadiness === 'prepared'),
    uncataloguedRoutes: Object.keys(ROUTE_POLICY).filter(
      (route) => !registeredRoutes.has(route as keyof typeof ROUTE_POLICY),
    ),
    // Source-module references and route registries do not enumerate component-local views.
    inventoryComplete: false as const,
    inventoryGaps: [
      'intra-screen-states',
      'legacy-context-associations',
      'baseline-and-scenario-variants',
      'native-verification',
    ] as const,
  }
}

export type UniversalCatalog = ReturnType<typeof buildUniversalCatalog>
export type UniversalCatalogContext = UniversalCatalog['contexts'][number]
