import { createHash } from 'node:crypto'
import { afterEach, expect, it } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { archiveRetiredPiTests, type RetiredPiTestAllowlist } from '../../scripts/native-spike/archive-retired-pi-tests.mjs'

const temporaryRoots: string[] = []

function sha256(value: string | Buffer) {
  return createHash('sha256').update(value).digest('hex')
}

function writeFixture(root: string, relativePath: string, contents: string) {
  const target = join(root, relativePath)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents)
  return target
}

function createArchiveFixture() {
  const archiveDirectory = mkdtempSync(join(tmpdir(), 'retired-pi-test-archive-'))
  temporaryRoots.push(archiveDirectory)
  const archivedFiles: Record<string, string> = {
    'index.html': '<html><body>Source reference</body></html>\n',
    'package.json': '{"name":"pi-reference"}\n',
    'package-lock.json': '{"lockfileVersion":3,"packages":{}}\n',
    'src/main.tsx': 'export const sourceMain = true\n',
    'src/app/screens/home.tsx': 'export const archivedHome = "preserved"\n',
    'vite.config.reference.mjs': 'export default {}\n',
    'README.reference.md': 'Source reference archive\n',
    'reference-build/index.html': '<html><body>Built Source reference</body></html>\n',
  }
  const files = Object.entries(archivedFiles).map(([path, contents]) => {
    writeFixture(archiveDirectory, path, contents)
    return { path, sha256: sha256(contents), bytes: Buffer.byteLength(contents) }
  })
  const manifest = {
    schemaVersion: 1,
    capturedAt: '2026-10-15T00:00:00.000Z',
    referenceMode: { nativeBridgeEnabled: false },
    sourceBuild: { built: true, outputDirectory: 'reference-build' },
    files,
  }
  const manifestPath = writeFixture(archiveDirectory, 'archive-manifest.json', JSON.stringify(manifest, null, 2) + '\n')
  return { archiveDirectory, manifestPath, manifest, archivedFiles }
}

function createSourceFixture() {
  const sourceRoot = mkdtempSync(join(tmpdir(), 'retired-pi-test-source-'))
  temporaryRoots.push(sourceRoot)
  writeFixture(sourceRoot, 'tests/screens/legacyHome.test.tsx', 'describe("legacy Source home", () => {})\n')
  writeFixture(sourceRoot, 'tests/features/nativeHomeProof.test.ts', 'it("covers Native home", () => {})\n')
  writeFixture(sourceRoot, 'tests/fixtures/legacyHome.tsx', 'export const legacyHomeFixture = true\n')
  writeFixture(sourceRoot, 'tests/setup/legacyHome.ts', 'globalThis.legacyHomeSetup = true\n')
  writeFixture(sourceRoot, 'tests/app/unlistedIntegration.test.tsx', 'must not be copied\n')
  writeFixture(sourceRoot, 'vitest.config.ts', 'export default { test: { setupFiles: [] } }\n')
  writeFixture(sourceRoot, 'tests/fixtures/.env.local', 'LOCAL_PASSWORD=never-copy\n')
  return sourceRoot
}

function createAllowlist(): RetiredPiTestAllowlist {
  return {
    schemaVersion: 1,
    sourceTests: [
      {
        path: 'tests/screens/legacyHome.test.tsx',
        nativeProofs: ['tests/features/nativeHomeProof.test.ts'],
      },
    ],
    supportFiles: [
      { path: 'tests/fixtures/legacyHome.tsx', requiredBy: ['tests/screens/legacyHome.test.tsx'] },
      { path: 'tests/setup/legacyHome.ts', requiredBy: ['tests/screens/legacyHome.test.tsx'] },
      { path: 'vitest.config.ts', requiredBy: ['tests/screens/legacyHome.test.tsx'] },
    ],
  }
}

function onlySourceTest(allowlist: RetiredPiTestAllowlist) {
  const sourceTest = allowlist.sourceTests[0]
  if (sourceTest === undefined) throw new Error('Test fixture is missing its retired Source test')
  return sourceTest
}

function firstSupportFile(allowlist: RetiredPiTestAllowlist) {
  const supportFile = allowlist.supportFiles[0]
  if (supportFile === undefined) throw new Error('Test fixture is missing its first support file')
  return supportFile
}

function manifestSha256(manifestPath: string) {
  return sha256(readFileSync(manifestPath))
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true })
})

it('appends only the explicit retired Source tests and support files and preserves the archived Source snapshot', async () => {
  const archive = createArchiveFixture()
  const sourceRoot = createSourceFixture()
  const initialManifestSha256 = manifestSha256(archive.manifestPath)

  const result = await archiveRetiredPiTests({
    archiveDirectory: archive.archiveDirectory,
    sourceRoot,
    expectedManifestSha256: initialManifestSha256,
    allowlist: createAllowlist(),
  })

  expect(result.verification.valid).toBe(true)
  const expectedBuildSnapshot = sha256(JSON.stringify(archive.manifest.files
    .filter((file) => file.path.startsWith('reference-build/'))
    .map(({ path, sha256, bytes }) => ({ path, sha256, bytes }))))
  expect(result.sourceBuildSnapshotSha256).toBe(expectedBuildSnapshot)
  expect(result.addedArchivePaths).toEqual([
    'reference-tests/tests/fixtures/legacyHome.tsx',
    'reference-tests/tests/screens/legacyHome.test.tsx',
    'reference-tests/tests/setup/legacyHome.ts',
    'reference-tests/vitest.config.ts',
  ])
  expect(readFileSync(join(archive.archiveDirectory, 'reference-tests/tests/screens/legacyHome.test.tsx'), 'utf8'))
    .toBe('describe("legacy Source home", () => {})\n')
  expect(readFileSync(join(sourceRoot, 'tests/screens/legacyHome.test.tsx'), 'utf8'))
    .toBe('describe("legacy Source home", () => {})\n')
  expect(existsSync(join(sourceRoot, 'tests/app/unlistedIntegration.test.tsx'))).toBe(true)
  expect(existsSync(join(archive.archiveDirectory, 'reference-tests/tests/app/unlistedIntegration.test.tsx'))).toBe(false)
  expect(existsSync(join(archive.archiveDirectory, 'reference-tests/tests/features/nativeHomeProof.test.ts'))).toBe(false)

  const updatedManifest = JSON.parse(readFileSync(archive.manifestPath, 'utf8'))
  expect(updatedManifest.files).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'reference-tests/tests/screens/legacyHome.test.tsx', sha256: sha256('describe("legacy Source home", () => {})\n') }),
    expect.objectContaining({ path: 'reference-tests/tests/fixtures/legacyHome.tsx' }),
    expect.objectContaining({ path: 'reference-tests/tests/setup/legacyHome.ts' }),
    expect.objectContaining({ path: 'reference-tests/vitest.config.ts' }),
  ]))
  expect(updatedManifest.files.filter((file: { path: string }) => !file.path.startsWith('reference-tests/')))
    .toEqual(archive.manifest.files)
  expect(updatedManifest.sourceBuild).toEqual(archive.manifest.sourceBuild)
  expect(updatedManifest.referenceTests.batches[0].previousManifestSha256).toBe(initialManifestSha256)
  expect(updatedManifest.referenceTests.batches[0].sourceBuildSnapshotSha256).toBe(expectedBuildSnapshot)
  expect(updatedManifest.referenceTests.batches[0].sourceTests).toEqual([
    expect.objectContaining({
      sourcePath: 'tests/screens/legacyHome.test.tsx',
      archivePath: 'reference-tests/tests/screens/legacyHome.test.tsx',
      nativeProofs: [expect.objectContaining({ sourcePath: 'tests/features/nativeHomeProof.test.ts' })],
    }),
  ])
  expect(sha256(readFileSync(join(archive.archiveDirectory, 'reference-build/index.html'))))
    .toBe(sha256('<html><body>Built Source reference</body></html>\n'))
  for (const [relativePath, contents] of Object.entries(archive.archivedFiles)) {
    expect(readFileSync(join(archive.archiveDirectory, relativePath), 'utf8')).toBe(contents)
  }
})

it('rejects wildcards and paths outside the bounded Source test allowlist without changing the archive', async () => {
  const archive = createArchiveFixture()
  const sourceRoot = createSourceFixture()
  const beforeManifestSha256 = manifestSha256(archive.manifestPath)
  const allowlist = createAllowlist()
  onlySourceTest(allowlist).path = 'tests/**/*.test.tsx'

  await expect(archiveRetiredPiTests({
    archiveDirectory: archive.archiveDirectory,
    sourceRoot,
    expectedManifestSha256: beforeManifestSha256,
    allowlist,
  })).rejects.toThrow()

  expect(manifestSha256(archive.manifestPath)).toBe(beforeManifestSha256)
  expect(existsSync(join(archive.archiveDirectory, 'reference-tests'))).toBe(false)
})

it('rejects secret and Native implementation paths from the supplied file list', async () => {
  const archive = createArchiveFixture()
  const sourceRoot = createSourceFixture()
  const beforeManifestSha256 = manifestSha256(archive.manifestPath)

  const secretAllowlist = createAllowlist()
  firstSupportFile(secretAllowlist).path = 'tests/fixtures/.env.local'
  await expect(archiveRetiredPiTests({
    archiveDirectory: archive.archiveDirectory,
    sourceRoot,
    expectedManifestSha256: beforeManifestSha256,
    allowlist: secretAllowlist,
  })).rejects.toThrow()

  const nativePathAllowlist = createAllowlist()
  firstSupportFile(nativePathAllowlist).path = 'native-spike/__tests__/legacyHome.test.tsx'
  await expect(archiveRetiredPiTests({
    archiveDirectory: archive.archiveDirectory,
    sourceRoot,
    expectedManifestSha256: beforeManifestSha256,
    allowlist: nativePathAllowlist,
  })).rejects.toThrow()

  expect(manifestSha256(archive.manifestPath)).toBe(beforeManifestSha256)
  expect(existsSync(join(archive.archiveDirectory, 'reference-tests'))).toBe(false)
})

it('records Native tests under native-spike/__tests__ as proof without copying them', async () => {
  const archive = createArchiveFixture()
  const sourceRoot = createSourceFixture()
  const nativeProofPath = 'native-spike/__tests__/credit-limit-offer-native.test.tsx'
  writeFixture(sourceRoot, nativeProofPath, 'it("covers the Native credit limit offer", () => {})\n')
  const beforeManifestSha256 = manifestSha256(archive.manifestPath)
  const allowlist = createAllowlist()
  onlySourceTest(allowlist).nativeProofs = [nativeProofPath]

  const result = await archiveRetiredPiTests({
    archiveDirectory: archive.archiveDirectory,
    sourceRoot,
    expectedManifestSha256: beforeManifestSha256,
    allowlist,
  })

  expect(result.verification.valid).toBe(true)
  expect(result.addedArchivePaths).not.toContain('reference-tests/' + nativeProofPath)
  expect(existsSync(join(archive.archiveDirectory, 'reference-tests', nativeProofPath))).toBe(false)
  const updatedManifest = JSON.parse(readFileSync(archive.manifestPath, 'utf8'))
  expect(updatedManifest.referenceTests.batches[0].sourceTests[0].nativeProofs).toEqual([
    expect.objectContaining({ sourcePath: nativeProofPath, sha256: sha256('it("covers the Native credit limit offer", () => {})\n') }),
  ])
})

it('requires a Native proof mapping for every retired Source test', async () => {
  const archive = createArchiveFixture()
  const sourceRoot = createSourceFixture()
  const beforeManifestSha256 = manifestSha256(archive.manifestPath)
  const allowlist = createAllowlist()
  onlySourceTest(allowlist).nativeProofs = []

  await expect(archiveRetiredPiTests({
    archiveDirectory: archive.archiveDirectory,
    sourceRoot,
    expectedManifestSha256: beforeManifestSha256,
    allowlist,
  })).rejects.toThrow()

  expect(manifestSha256(archive.manifestPath)).toBe(beforeManifestSha256)
  expect(existsSync(join(archive.archiveDirectory, 'reference-tests'))).toBe(false)
})

it('rejects a stale archive manifest hash before appending any files', async () => {
  const archive = createArchiveFixture()
  const sourceRoot = createSourceFixture()
  const beforeManifestSha256 = manifestSha256(archive.manifestPath)

  await expect(archiveRetiredPiTests({
    archiveDirectory: archive.archiveDirectory,
    sourceRoot,
    expectedManifestSha256: '0'.repeat(64),
    allowlist: createAllowlist(),
  })).rejects.toThrow(/manifest hash/i)

  expect(manifestSha256(archive.manifestPath)).toBe(beforeManifestSha256)
  expect(existsSync(join(archive.archiveDirectory, 'reference-tests'))).toBe(false)
})
