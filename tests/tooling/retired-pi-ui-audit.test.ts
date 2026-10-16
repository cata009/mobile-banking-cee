import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterEach, expect, it } from 'vitest'

const repositoryRoot = process.cwd()
const auditScript = resolve(repositoryRoot, 'scripts/native-spike/audit-retired-pi-ui.mjs')
const temporaryRoots: string[] = []

function writeFixture(root: string, relativePath: string, contents: string) {
  const target = join(root, relativePath)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents)
  return target
}

function createFixture(nativeRuntimeImportsLegacy = false, sourcePlatformImportsLegacy = false) {
  const root = mkdtempSync(join(tmpdir(), 'retired-pi-ui-audit-'))
  temporaryRoots.push(root)
  const archivedRouter = 'export const archivedSourceRouter = true\n'
  writeFixture(root, 'archive/AppScreenRouter.tsx', archivedRouter)
  const oldModules = [
    '@/app/screens/legacyUnique',
    '@/app/screens/sharedHome',
    '@/app/screens/typeOnly',
    '@/app/screens/rawSource',
    '@/app/screens/metadataOnly',
    '@/app/screens/sourceModuleMetadata',
    '@/app/screens/cards/CreditLimitOfferFlow',
    '@/app/screens/directoryRoot',
  ]
  const sourceManifest = {
    schemaVersion: 1,
    routerArchive: {
      copyVerified: true,
      copy: 'archive/AppScreenRouter.tsx',
      sha256: createHash('sha256').update(archivedRouter).digest('hex').toUpperCase(),
    },
    oldScreenRouteBranches: [
      { disposition: 'Old Source customer route modules', routes: ['homepage'], specifierModules: oldModules },
      { disposition: 'Excluded product KIDS_PI; keep.', routes: ['Kids-market-home'], specifierModules: ['@/app/screens/excludedOnly'] },
      { disposition: 'Platform controls; keep in normal platform routing.', routes: ['design-system', 'flow-library'], specifierModules: ['@/app/screens/platformOnly', '@/app/screens/flow-library/FlowLibraryScreen'] },
    ],
    retainedSharedAndExcluded: [
      { path: 'src/app/screens/sharedHome.tsx', reason: 'Shared Native consumer.' },
      { path: 'src/app/screens/excludedOnly.tsx', reason: 'KIDS excluded route.' },
      { path: 'src/app/screens/platformOnly.tsx', reason: 'Platform preview consumer.' },
    ],
    testConsumers: {
      DirectAppScreenPathTests: ['tests/screens/legacyUnique.test.tsx', 'tests/screens/credit-limit-offer-flow.test.tsx'],
      NativeRouteAndBridgeTests: ['tests/features/native-route.test.ts'],
    },
    flowSourceZip: { generatedSourceInput: ['src/app/screens/rawSource.tsx?raw'], packageBuilder: ['src/app/screens/flow-library/handoff/zip.ts'], tests: [] },
  }
  const manifestPath = writeFixture(root, '.codex-temp/l15-manifest.json', JSON.stringify(sourceManifest))

  writeFixture(root, 'src/app/AppScreenRouter.tsx', oldModules
    .map((specifier, index) => `import Screen${index} from '${specifier}'`)
    .join('\n'))
  writeFixture(root, 'src/main.tsx', "import App from '@/app/App'; export default App")
  writeFixture(root, 'src/app/App.tsx', "import AppShell from '@/app/AppShell'; export default AppShell")
  writeFixture(root, 'src/app/AppShell.tsx', "import AppScreenRouter from '@/app/AppScreenRouter'; export default AppScreenRouter")
  writeFixture(root, 'src/app/AppScreenRouter.tsx', "import NativePlatformRouter from '@/app/navigation/nativePlatformRouter'; import LegacyExcludedRouter from '@/app/navigation/legacyExcludedRouter'; export { NativePlatformRouter, LegacyExcludedRouter }")
  writeFixture(root, 'src/app/navigation/nativePlatformRouter.tsx', "import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'; export default FlowLibraryScreen")
  writeFixture(root, 'src/app/screens/flow-library/FlowLibraryScreen.tsx', "import FlowPreviews from './components/flowPreviews'; export default FlowPreviews")
  writeFixture(root, 'src/app/screens/flow-library/components/flowPreviews.tsx', "import Preview from '@/flows/shared/preview'; export default Preview")
  writeFixture(root, 'src/flows/shared/preview.tsx', sourcePlatformImportsLegacy
    ? "import Legacy from '@/app/screens/legacyUnique'; export default Legacy"
    : 'export default 1')
  writeFixture(root, 'src/app/AppScreenRouter.tsx', "import NativePlatformRouter from '@/app/navigation/nativePlatformRouter'; import LegacyExcludedRouter from '@/app/navigation/legacyExcludedRouter'; export { NativePlatformRouter, LegacyExcludedRouter }")
  writeFixture(root, 'src/app/components/demo/NativeDemoSurface.tsx', 'export const NativeDemoSurface = 1')
  writeFixture(root, 'native-spike/src/app/GlobalNativeApp.tsx', nativeRuntimeImportsLegacy
    ? "import Legacy from '@/app/screens/legacyUnique'; export { Legacy }"
    : "import Shared from '@/app/screens/sharedHome'; import type { LegacyContract } from '@/app/screens/typeOnly'; export { Shared }" )
  writeFixture(root, 'native-spike/src/app/CurrentApplication.tsx', 'export const CurrentApplication = 1')
  writeFixture(root, 'src/app/screens/legacyUnique.tsx', 'export default function LegacyUnique() { return <section data-screen="legacy-unique" /> }')
  writeFixture(root, 'src/app/screens/sharedHome.tsx', 'export const SharedHome = 1')
  writeFixture(root, 'src/app/screens/typeOnly.tsx', 'export interface LegacyContract { value: string }')
  writeFixture(root, 'src/app/screens/rawSource.tsx', 'export const RawSource = 1')
  writeFixture(root, 'src/app/screens/metadataOnly.tsx', 'export const MetadataOnly = 1')
  writeFixture(root, 'src/app/screens/sourceModuleMetadata.tsx', 'export const SourceModuleMetadata = 1')
  writeFixture(root, 'src/app/screens/directoryRoot/index.tsx', 'export default function DirectoryRoot() { return <section data-screen="directory-root" /> }')
  writeFixture(root, 'src/app/screens/cards/CreditLimitOfferFlow.tsx', 'export default function CreditLimitOfferFlow() { return <section data-screen="credit-limit" /> }')
  writeFixture(root, 'native-spike/src/experiences/pi/current/baseline/CreditLimitOfferFlow.tsx', 'export const NativeCreditLimitOfferFlow = 1')
  writeFixture(root, 'native-spike/__tests__/credit-limit-offer-native.test.tsx', 'export const nativeCreditLimitProof = true')
  writeFixture(root, 'src/app/screens/excludedOnly.tsx', 'export const ExcludedOnly = 1')
  writeFixture(root, 'src/app/screens/platformOnly.tsx', 'export const PlatformOnly = 1')
  writeFixture(root, 'src/app/registry/domains/home/screens.ts', "export const HOME = { 'pi.home.overview': { id: 'pi.home.overview', componentPath: 'src/app/screens/metadataOnly.tsx', products: ['PI'], countries: ['RO'] } }")
  writeFixture(root, 'src/experiences/pi/ro/baseline/manifest.ts', "export const PI_RO_BASELINE = { id: 'pi.ro.baseline', product: 'PI', country: 'RO', sourceModules: ['src/app/screens/sourceModuleMetadata.tsx'] } as const satisfies ExperienceManifest")
  writeFixture(root, 'src/app/screens/flow-library/components/screenSources.ts', "import raw from '@/app/screens/rawSource.tsx?raw'; export default raw")
  writeFixture(root, 'src/app/screens/design-system/Preview.tsx', "import PlatformOnly from '@/app/screens/platformOnly'; export { PlatformOnly }")
  writeFixture(root, 'src/app/navigation/legacyExcludedRouter.tsx', "import ExcludedOnly from '@/app/screens/excludedOnly'; export { ExcludedOnly }")
  writeFixture(root, 'tests/screens/legacyUnique.test.tsx', "import { LegacyUnique } from '@/app/screens/legacyUnique'; void LegacyUnique")
  writeFixture(root, 'tests/screens/credit-limit-offer-flow.test.tsx', "import { CreditLimitOfferFlow } from '@/app/screens/cards/CreditLimitOfferFlow'; void CreditLimitOfferFlow")
  return { root, manifestPath }
}

function runAudit(root: string, manifestPath: string, check = false, adapterCandidateManifestPath?: string, adapterApprovalManifestPath?: string) {
  const outputDirectory = mkdtempSync(join(tmpdir(), 'retired-pi-ui-output-'))
  temporaryRoots.push(outputDirectory)
  const outputPath = join(outputDirectory, 'manifest.json')
  const args = [auditScript, '--root', root, '--source-manifest', manifestPath, '--output', outputPath]
  if (adapterCandidateManifestPath) args.push('--adapter-candidates', adapterCandidateManifestPath)
  if (adapterApprovalManifestPath) args.push('--adapter-approvals', adapterApprovalManifestPath)
  if (check) args.push('--check')
  const result = spawnSync(process.execPath, args, { cwd: repositoryRoot, encoding: 'utf8' })
  if (result.error) throw result.error
  return { ...result, manifest: existsSync(outputPath) ? JSON.parse(readFileSync(outputPath, 'utf8')) : null }
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true })
})

it('emits a real PI retirement manifest with consumer categories kept separate', () => {
  const manifestPath = resolve(repositoryRoot, '.codex-temp/pi-wide-migration/luna-15/legacy-pi-consumer-manifest.json')
  const result = runAudit(repositoryRoot, manifestPath)

  expect(result.status).toBe(0)
  expect(result.manifest.sourceArchive).toMatchObject({ verified: true, sha256Expected: 'BA1DD762E5E462C05DE974B6F91984DE94203D37DAC4952CCC87E599CC43ACA0' })
  expect(result.manifest).toHaveProperty('retireableUniquePaths')
  expect(result.manifest).toHaveProperty('retainedSharedPaths')
  expect(result.manifest).toHaveProperty('blockedPaths')
  expect(result.manifest.flowRawReferences).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/flows/shared/investments-bulk-approval/investmentsBulkApprovalPreviews.tsx' }),
    expect.objectContaining({ path: 'src/features/investments/bulk-approval/model.ts' }),
  ]))
  expect(result.manifest.sourceTests.classification).toBe('archive-only')
  expect(result.manifest.nativeEquivalentProof.tests).toEqual(expect.arrayContaining([
    'tests/features/pi-wide-native-closure.test.ts',
    'tests/features/native-baseline-completeness.test.ts',
  ]))
  expect(typeof result.manifest.normalProductionGraphGuard.passed).toBe('boolean')
  expect(result.manifest.normalProductionGraphGuard.roots).toEqual(expect.arrayContaining(['src/main.tsx', 'src/app/App.tsx']))
  expect(result.manifest.normalProductionGraphGuard.passed).toBe(
    result.manifest.normalProductionGraphGuard.reachableRetiredPiUi.length === 0 &&
      result.manifest.normalProductionGraphGuard.reachablePendingNativePreviewAdapters.length === 0 &&
      result.manifest.normalProductionGraphGuard.reachablePendingScopedNativeBridges.length === 0,
  )
  expect(result.manifest).toHaveProperty('platformPreviewChains')
  expect(result.manifest).toHaveProperty('nativePreviewAdapterCandidates')
  expect(result.manifest.nativePreviewAdapterCandidates.rootApprovalManifest).toMatchObject({
    path: 'scripts/native-spike/pi-native-compat-adapters.json',
    reviewedBy: '/root integration',
  })
  const adapters = result.manifest.nativePreviewAdapterCandidates.candidates
  expect(adapters.filter((item: { classification: string }) => item.classification === 'root-approved-native-owned-adapter')).toHaveLength(6)
  const candidatePaths = adapters.map((item: { path: string }) => item.path)
  expect(candidatePaths).toEqual(expect.arrayContaining([
    'src/app/screens/accounts/AccountDetailScreen.tsx',
    'src/app/screens/cards/CardDetailScreen.tsx',
    'src/app/screens/settings/SettingsScreen.tsx',
    'src/app/screens/home/HomeScreen.tsx',
    'src/app/screens/products/ProductsScreen.tsx',
    'src/app/screens/products/ProductDetailScreen.tsx',
    'src/app/screens/investments/InvestmentsPortfolioScreen.tsx',
    'src/app/screens/investments/InvestmentsHistoryScreen.tsx',
    'src/app/screens/investments/OrdersToApproveScreen.tsx',
    'src/app/screens/investments/SmartInvestmentScreen.tsx',
    'src/app/screens/investments/FutureGainPeerInsightsScreen.tsx',
  ]))
  expect(result.manifest.rawExportReferences).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/flows/shared/investments-bulk-approval/investmentsBulkApprovalPreviews.tsx' }),
  ]))
})

it('keeps unique modules retireable only when type, metadata, raw, platform and excluded consumers do not block them', () => {
  const fixture = createFixture()
  const result = runAudit(fixture.root, fixture.manifestPath)
  const paths = (entries: Array<{ path: string }>) => entries.map(entry => entry.path)

  expect(result.status).toBe(0)
  expect(paths(result.manifest.retireableUniquePaths)).toContain('src/app/screens/cards/CreditLimitOfferFlow.tsx')
  expect(result.manifest.retiredPiScreenRoots).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/app/screens/directoryRoot/index.tsx' }),
  ]))
  expect(paths(result.manifest.retainedSharedPaths)).toContain('src/app/screens/sharedHome.tsx')
  const blockedPaths = paths(result.manifest.blockedPaths)
  expect(blockedPaths).toContain('src/app/screens/legacyUnique.tsx')
  for (const supportPath of [
    'src/app/screens/typeOnly.tsx',
    'src/app/screens/rawSource.tsx',
    'src/app/screens/metadataOnly.tsx',
    'src/app/screens/sourceModuleMetadata.tsx',
  ]) expect(blockedPaths).not.toContain(supportPath)
  expect(result.manifest.sourceUiClassification.pureSupportCandidates.map((entry: { path: string }) => entry.path)).toEqual(expect.arrayContaining([
    'src/app/screens/typeOnly.tsx',
    'src/app/screens/rawSource.tsx',
    'src/app/screens/metadataOnly.tsx',
    'src/app/screens/sourceModuleMetadata.tsx',
  ]))
  expect(result.manifest.nativeTypeConsumers).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/app/screens/typeOnly.tsx', consumer: 'native-spike/src/app/GlobalNativeApp.tsx' }),
  ]))
  expect(result.manifest.experienceSourceModuleMetadataReferences).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/app/screens/sourceModuleMetadata.tsx', experienceId: 'pi.ro.baseline' }),
  ]))
  expect(result.manifest.screenRegistryMetadataReferences).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/app/screens/metadataOnly.tsx', screenId: 'pi.home.overview' }),
  ]))
  expect(result.manifest.rawExportReferences).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/app/screens/rawSource.tsx', kind: 'raw-source' }),
  ]))
  expect(result.manifest.platformPreviewConsumers).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/app/screens/platformOnly.tsx' }),
  ]))
  expect(result.manifest.excludedContextConsumers).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/app/screens/excludedOnly.tsx' }),
  ]))
  expect(result.manifest.sourceTests.paths).toContain('tests/screens/legacyUnique.test.tsx')
  expect(result.manifest.sourceTests.blocksRetirement).toBe(false)
})

it('fails the normal-production guard if a Native runtime entry imports a retired PI screen', () => {
  const fixture = createFixture(true)
  const result = runAudit(fixture.root, fixture.manifestPath, true)

  expect(result.status).toBe(1)
  expect(result.manifest.normalProductionGraphGuard.passed).toBe(false)
  expect(result.manifest.normalProductionGraphGuard.reachableRetiredPiUi).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/app/screens/legacyUnique.tsx', chain: expect.any(Array) }),
  ]))
})

it('reports a live Source platform preview chain into retired PI UI', () => {
  const fixture = createFixture(false, true)
  const result = runAudit(fixture.root, fixture.manifestPath, true)

  expect(result.status).toBe(1)
  expect(result.manifest.normalProductionGraphGuard.passed).toBe(false)
  expect(result.manifest.platformPreviewChains).toEqual(expect.arrayContaining([
    expect.objectContaining({
      platformRoot: 'src/app/screens/flow-library/FlowLibraryScreen.tsx',
      target: 'src/app/screens/legacyUnique.tsx',
      chain: expect.arrayContaining(['src/flows/shared/preview.tsx']),
    }),
  ]))
})

it('keeps evidence-derived NativeScreenPreview wrappers pending until Root approves the adapter manifest', () => {
  const fixture = createFixture(false, true)
  writeFixture(fixture.root, 'src/app/screens/legacyUnique.tsx', "import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'; export default function LegacyUnique() { return <NativeScreenPreview route={{ screen: 'home' }} /> }")
  writeFixture(fixture.root, 'tests/screens/adapter.test.tsx', "import LegacyUnique from '@/app/screens/legacyUnique'; void LegacyUnique")
  writeFixture(fixture.root, 'src/app/components/demo/NativeScreenPreview.tsx', 'export const NativeScreenPreview = 1')
  const adapterCandidateManifestPath = writeFixture(fixture.root, '.codex-temp/luna-4-adapter-candidates.json', JSON.stringify({
    status: 'evidence-derived-candidates-pending-root-review',
    rootApproval: { status: 'pending', reviewer: 'Root' },
    candidates: [{
      path: 'src/app/screens/legacyUnique.tsx',
      nativeRoute: 'home',
      contractTest: 'tests/screens/adapter.test.tsx',
      evidence: 'Fixture contract evidence.',
    }],
  }))
  const result = runAudit(fixture.root, fixture.manifestPath, true, adapterCandidateManifestPath)

  expect(result.status).toBe(1)
  expect(result.manifest.nativePreviewAdapterCandidates.candidateManifestStatus).toBe('evidence-derived-candidates-pending-root-review')
  expect(result.manifest.nativePreviewAdapterCandidates.candidates).toEqual([
    expect.objectContaining({
      path: 'src/app/screens/legacyUnique.tsx',
      classification: 'candidate-pending-root-approval',
      blocksRetirement: true,
      evidence: expect.objectContaining({ verified: true }),
    }),
  ])
  expect(result.manifest.normalProductionGraphGuard.reachablePendingNativePreviewAdapters).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/app/screens/legacyUnique.tsx', classification: 'candidate-pending-root-approval' }),
  ]))
})

it('classifies only exact-hash Root-approved adapters with a runtime NativeScreenPreview edge and all required tests', () => {
  const fixture = createFixture()
  const sourcePath = 'src/app/screens/legacyUnique.tsx'
  const sourceText = "import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'; export default function LegacyUnique() { return <NativeScreenPreview route={{ screen: 'home' }} /> }"
  writeFixture(fixture.root, sourcePath, sourceText)
  writeFixture(fixture.root, 'src/app/components/demo/NativeScreenPreview.tsx', 'export const NativeScreenPreview = 1')
  writeFixture(fixture.root, 'tests/screens/adapter.test.tsx', "import LegacyUnique from '@/app/screens/legacyUnique'; void LegacyUnique")
  writeFixture(fixture.root, 'native-spike/__tests__/adapter-native.test.tsx', 'export const nativeAdapterProof = true')
  const adapterCandidateManifestPath = writeFixture(fixture.root, '.codex-temp/luna-4-adapter-candidates.json', JSON.stringify({
    status: 'evidence-derived-candidates-pending-root-review',
    candidates: [{ path: sourcePath, nativeRoute: 'home', contractTest: 'tests/screens/adapter.test.tsx' }],
  }))
  const sourceHash = createHash('sha256').update(sourceText).digest('hex').toUpperCase()
  const approvalManifest = {
    reviewedBy: 'Root fixture',
    baseCommit: 'fixture',
    approvedAdapters: [{
      path: sourcePath,
      reviewedSha256: sourceHash,
      requiredTests: ['tests/screens/adapter.test.tsx', 'native-spike/__tests__/adapter-native.test.tsx'],
      nativeOnly: true,
      excludedProductBranches: [],
    }],
  }
  const adapterApprovalManifestPath = writeFixture(fixture.root, 'scripts/native-spike/pi-native-compat-adapters.json', JSON.stringify(approvalManifest))
  const approved = runAudit(fixture.root, fixture.manifestPath, false, adapterCandidateManifestPath, adapterApprovalManifestPath)
  const approvedCandidate = approved.manifest.nativePreviewAdapterCandidates.candidates[0]

  expect(approved.status).toBe(0)
  expect(approvedCandidate).toMatchObject({
    classification: 'root-approved-native-owned-adapter',
    blocksRetirement: false,
    evidence: { hashMatchesApproval: true, importsNativeScreenPreview: true, requiredTestsExist: true },
  })
  expect(approved.manifest.retainedSharedPaths).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: sourcePath, reason: expect.stringContaining('Root-approved') }),
  ]))
  expect(approved.manifest.normalProductionGraphGuard.reachableRetiredPiUi).not.toEqual(expect.arrayContaining([
    expect.objectContaining({ path: sourcePath }),
  ]))

  const reviewedAdapter = approvalManifest.approvedAdapters[0]
  if (!reviewedAdapter) throw new Error('Expected the fixture to declare one reviewed adapter.')
  reviewedAdapter.reviewedSha256 = '0'.repeat(64)
  writeFixture(fixture.root, 'scripts/native-spike/pi-native-compat-adapters.json', JSON.stringify(approvalManifest))
  const stale = runAudit(fixture.root, fixture.manifestPath, false, adapterCandidateManifestPath, adapterApprovalManifestPath)
  expect(stale.manifest.nativePreviewAdapterCandidates.candidates[0]).toMatchObject({
    classification: 'root-approved-stale-hash-blocked',
    blocksRetirement: true,
    evidence: { hashMatchesApproval: false },
  })
  expect(stale.manifest.retainedSharedPaths).not.toEqual(expect.arrayContaining([
    expect.objectContaining({ path: sourcePath }),
  ]))
})

it('classifies a reviewed pure support model without masking its in-scope UI importer', () => {
  const fixture = createFixture(false, true)
  const supportPath = 'src/app/screens/appointmentModel.ts'
  const supportText = 'export function appointmentSummary(value: number) { return String(value) }'
  writeFixture(fixture.root, supportPath, supportText)
  writeFixture(fixture.root, 'src/app/screens/legacyUnique.tsx', "import { appointmentSummary } from './appointmentModel'; export default function LegacyUnique() { return <section>{appointmentSummary(1)}</section> }")
  writeFixture(fixture.root, 'tests/screens/appointment-model.test.ts', 'export const supportProof = true')
  const pendingReview = runAudit(fixture.root, fixture.manifestPath, false)
  expect(pendingReview.manifest.sourceUiClassification.pureSupportCandidates).toEqual(expect.arrayContaining([
    expect.objectContaining({
      path: supportPath,
      rootReviewStatus: 'pure-support-pending-root-review',
      uiEvidence: expect.objectContaining({ isUiRuntime: false }),
    }),
  ]))
  expect(pendingReview.manifest.normalProductionGraphGuard.reachableRetiredPiUi).not.toEqual(expect.arrayContaining([
    expect.objectContaining({ path: supportPath }),
  ]))
  const approvalManifest = {
    reviewedBy: 'Root fixture',
    baseCommit: 'fixture',
    approvedAdapters: [],
    retainedSupport: [{
      path: supportPath,
      reviewedSha256: createHash('sha256').update(supportText).digest('hex').toUpperCase(),
      exactRuntimeConsumers: ['src/app/screens/legacyUnique.tsx'],
      requiredTests: ['tests/screens/appointment-model.test.ts'],
      reason: 'Pure model shared with Native runtime.',
    }],
    excludedConsumers: [],
  }
  const approvalPath = writeFixture(fixture.root, 'scripts/native-spike/pi-native-compat-adapters.json', JSON.stringify(approvalManifest))
  const result = runAudit(fixture.root, fixture.manifestPath, true, undefined, approvalPath)

  expect(result.status).toBe(1)
  expect(result.manifest.sourceUiClassification.retainedSupportRecords).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: supportPath, classification: 'root-approved-retained-support' }),
  ]))
  expect(result.manifest.sourceUiClassification.pureSupportCandidates).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: supportPath, rootReviewStatus: 'root-approved-retained-support' }),
  ]))
  expect(result.manifest.normalProductionGraphGuard.reachableRetiredPiUi).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/app/screens/legacyUnique.tsx' }),
  ]))
  expect(result.manifest.normalProductionGraphGuard.reachableRetiredPiUi).not.toEqual(expect.arrayContaining([
    expect.objectContaining({ path: supportPath }),
  ]))

  const supportRecord = approvalManifest.retainedSupport[0]
  if (!supportRecord) throw new Error('Expected the fixture to declare one retained support record.')
  supportRecord.exactRuntimeConsumers = [
    'src/app/screens/legacyUnique.tsx',
    'src/flows/shared/preview.tsx',
  ]
  writeFixture(fixture.root, 'scripts/native-spike/pi-native-compat-adapters.json', JSON.stringify(approvalManifest))
  const staleConsumers = runAudit(fixture.root, fixture.manifestPath, true, undefined, approvalPath)
  expect(staleConsumers.status).toBe(1)
  expect(staleConsumers.manifest.sourceUiClassification.retainedSupportRecords).toEqual(expect.arrayContaining([
    expect.objectContaining({
      path: supportPath,
      classification: 'retained-support-evidence-invalid',
      evidence: expect.objectContaining({ consumersMatch: false }),
    }),
  ]))
  expect(staleConsumers.manifest.normalProductionGraphGuard.reachableRetiredPiUi).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'src/app/screens/legacyUnique.tsx' }),
  ]))
})

it('accepts an exact excluded-owner chain but rejects it when an in-scope PI consumer is added', () => {
  const fixture = createFixture()
  const sourcePath = 'src/app/screens/legacyUnique.tsx'
  const sourceText = 'export default function LegacyUnique() { return <section data-excluded-ui="true" /> }'
  const chain = [
    'src/main.tsx',
    'src/app/App.tsx',
    'src/app/AppShell.tsx',
    'src/app/AppScreenRouter.tsx',
    'src/app/navigation/legacyExcludedRouter.tsx',
    'src/app/screens/kids/KidsMarketHomeApp.tsx',
    'src/experiences/kids-pi/preview.tsx',
    'src/experiences/kids-pi/hu/baseline/composition.tsx',
    sourcePath,
  ]
  const alternateChain = [
    ...chain.slice(0, -1),
    'src/app/screens/kids/KidsAltConsumer.tsx',
    sourcePath,
  ]
  writeFixture(fixture.root, sourcePath, sourceText)
  writeFixture(fixture.root, 'src/app/screens/kids/KidsMarketHomeApp.tsx', "import Preview from '@/experiences/kids-pi/preview'; export default Preview")
  writeFixture(fixture.root, 'src/experiences/kids-pi/preview.tsx', "import Composition from './hu/baseline/composition'; export default Composition")
  writeFixture(fixture.root, 'src/experiences/kids-pi/hu/baseline/composition.tsx', "import Screen from '@/app/screens/legacyUnique'; import Alternate from '@/app/screens/kids/KidsAltConsumer'; export { Screen, Alternate }")
  writeFixture(fixture.root, 'src/app/screens/kids/KidsAltConsumer.tsx', "import Screen from '@/app/screens/legacyUnique'; export default Screen")
  writeFixture(fixture.root, 'src/app/navigation/legacyExcludedRouter.tsx', "import KidsHome from '@/app/screens/kids/KidsMarketHomeApp'; export { KidsHome }")
  writeFixture(fixture.root, 'tests/screens/excluded-owner.test.tsx', 'export const excludedOwnerProof = true')
  const approvalManifest = {
    reviewedBy: 'Root fixture',
    baseCommit: 'fixture',
    approvedAdapters: [],
    retainedSupport: [],
    excludedConsumers: [{
      path: sourcePath,
      reviewedSha256: createHash('sha256').update(sourceText).digest('hex').toUpperCase(),
      excludedOwners: ['KIDS HU'],
      experienceIds: ['kids-pi.hu.baseline'],
      exactRuntimeChains: [chain, alternateChain],
      requiredTests: ['tests/screens/excluded-owner.test.tsx'],
      reason: 'Preserve UI for the excluded Kids experience only.',
    }],
  }
  const approvalPath = writeFixture(fixture.root, 'scripts/native-spike/pi-native-compat-adapters.json', JSON.stringify(approvalManifest))
  const preserved = runAudit(fixture.root, fixture.manifestPath, true, undefined, approvalPath)

  expect(preserved.status).toBe(0)
  expect(preserved.manifest.sourceUiClassification.excludedOwnerCandidates).toEqual(expect.arrayContaining([
    expect.objectContaining({
      path: sourcePath,
      rootReviewStatus: 'root-approved-excluded-consumer',
      ownerChainIsExclusive: true,
      exactRuntimeChains: expect.arrayContaining([chain, alternateChain]),
    }),
  ]))
  expect(preserved.manifest.normalProductionGraphGuard.reachableRetiredPiUi).not.toEqual(expect.arrayContaining([
    expect.objectContaining({ path: sourcePath }),
  ]))

  writeFixture(fixture.root, 'src/flows/shared/preview.tsx', "import Screen from '@/app/screens/legacyUnique'; export default Screen")
  const mixed = runAudit(fixture.root, fixture.manifestPath, true, undefined, approvalPath)
  expect(mixed.status).toBe(1)
  expect(mixed.manifest.sourceUiClassification.excludedConsumerRecords).toEqual(expect.arrayContaining([
    expect.objectContaining({
      path: sourcePath,
      classification: 'excluded-consumer-evidence-invalid',
      evidence: expect.objectContaining({ noInScopeRuntimeConsumers: false, verified: false }),
    }),
  ]))
  expect(mixed.manifest.normalProductionGraphGuard.reachableRetiredPiUi).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: sourcePath }),
  ]))
})

it('projects only reviewed excluded branch edges while retaining the full graph and blocking a direct PI import', () => {
  const fixture = createFixture()
  const sourcePath = 'src/app/screens/legacyUnique.tsx'
  const source = "import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'; import SmeProductsScreen from './SmeProductsScreen'; export default function ProductsScreen() { const product = useDemo().product; if (product === 'SME') return <SmeProductsScreen />; return <NativeScreenPreview route={{ screen: 'products' }} /> }"
  writeFixture(fixture.root, sourcePath, source)
  writeFixture(fixture.root, 'src/app/screens/SmeProductsScreen.tsx', 'export default function SmeProductsScreen() { return <section>SME only</section> }')
  writeFixture(fixture.root, 'src/app/components/demo/NativeScreenPreview.tsx', 'export const NativeScreenPreview = 1')
  writeFixture(fixture.root, 'src/app/AppScreenRouter.tsx', "import Screen from '@/app/screens/legacyUnique'; export default Screen")
  const proofPath = 'tests/screens/scoped-products.test.tsx'
  writeFixture(fixture.root, proofPath, "import Screen from '@/app/screens/legacyUnique'; export const native = 'products'; export const excluded = 'SmeProductsScreen'")
  const pending = runAudit(fixture.root, fixture.manifestPath)
  expect(pending.status, pending.stderr).toBe(0)
  const candidate = pending.manifest.scopedNativeBridgeCandidates.candidates.find((item: { path: string }) => item.path === sourcePath)
  expect(candidate).toBeDefined()
  const edge = { from: sourcePath, to: 'src/app/screens/SmeProductsScreen.tsx', specifier: './SmeProductsScreen' }
  const approval = {
    path: sourcePath, reviewedSha256: candidate.currentSha256, nativeOnly: true,
    includedScope: { product: 'PI', releases: 'all' },
    nativePreviewRoutes: candidate.branchEvidence.nativePreviewRoutes,
    conditionalSourceBranches: candidate.branchEvidence.conditionalSourceBranches,
    excludedSourceBranches: candidate.sourceBranches.map((branch: object) => ({ ...branch, owner: 'SME', excludedRuntimeEdges: [edge] })),
    exactRuntimeConsumers: candidate.actualRuntimeConsumerContexts,
    nativeContextTests: [proofPath], excludedContextTests: [{ owner: 'SME', path: proofPath }], requiredTests: [proofPath],
  }
  const approvalsPath = writeFixture(fixture.root, 'scripts/native-spike/pi-native-compat-adapters.json', JSON.stringify({ scopedNativeBridges: [approval] }))
  const projected = runAudit(fixture.root, fixture.manifestPath, true, undefined, approvalsPath)
  expect(projected.status, projected.stderr).toBe(0)
  expect(projected.manifest.normalProductionGraphGuard.scopeProjection.excludedRuntimeEdges).toEqual([expect.objectContaining(edge)])
  expect(projected.manifest.dependencyGraph.edgesWithinClosure).toEqual(expect.arrayContaining([expect.objectContaining(edge)]))

  writeFixture(fixture.root, 'src/app/AppScreenRouter.tsx', "import Screen from '@/app/screens/legacyUnique'; import Sme from '@/app/screens/SmeProductsScreen'; export { Screen, Sme }")
  const leaked = runAudit(fixture.root, fixture.manifestPath, true, undefined, approvalsPath)
  expect(leaked.status).toBe(1)
  expect(leaked.manifest.normalProductionGraphGuard.reachableRetiredPiUi).toEqual(expect.arrayContaining([expect.objectContaining({ path: edge.to })]))
})

