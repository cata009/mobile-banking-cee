import { createHash, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createReadStream } from 'node:fs'
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
export const defaultRoot = path.resolve(scriptDirectory, '../..')
export const defaultArchiveDestination =
  'C:/Users/mihai/.codex/archives/mobile-banking-cee/pi-reference-20261015'
const defaultExpandedProtection = '.codex-temp/pi-wide-migration/luna-14/expanded-protected-before.json'
const defaultSourceReference = '.codex-temp/native-baseline-investments/source-reference-before.json'
const defaultSourcePreservation = '.codex-temp/native-baseline-investments/source-preservation.json'
const l15RouterBefore = '.codex-temp/pi-wide-migration/luna-15/reference-before/AppScreenRouter.tsx'
const l15RouterSha256 = 'ba1dd762e5e462c05de974b6f91984de94203d37dac4952ccc87e599cc43aca0'
const rootFiles = [
  'index.html',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  '.nvmrc',
  'package/mobile-pi-coapping-chat-package/package.json',
]
const sourceDirectories = [
  'src',
  'public',
  'screenshots',
  'package/mobile-pi-coapping-chat-package/src',
]
const excludedDirectoryNames = new Set([
  '.codex-temp',
  '.git',
  '.vite',
  '.vite-cache',
  'android-spike',
  'coverage',
  'dist',
  'figma plugins',
  'ios',
  'native-spike',
  'node_modules',
])
const excludedFileExtensions = new Set([
  '.aab',
  '.apk',
  '.ipa',
  '.jks',
  '.key',
  '.keystore',
  '.mobileprovision',
  '.p12',
  '.pem',
  '.pfx',
])

function toPosix(value) {
  return value.replaceAll('\\', '/')
}

function assertSafeRelativePath(value) {
  const normalized = toPosix(value)
  if (
    !normalized ||
    normalized.startsWith('/') ||
    normalized.includes(':') ||
    normalized.split('/').some((part) => part === '..' || part === '.' || part === '')
  ) {
    throw new Error('Archive contains an unsafe relative path: ' + value)
  }
  return normalized
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate)
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))
}

function sensitivePathReason(relativePath) {
  const normalized = toPosix(relativePath)
  const segments = normalized.split('/')
  const basename = segments.at(-1) ?? ''
  if (segments.some((segment) => excludedDirectoryNames.has(segment.toLowerCase()))) return 'private-or-generated-directory'
  if (normalized.startsWith('public/native-demo/')) return 'Native web UI bundle'
  if (normalized.startsWith('public/downloads/')) return 'packaged or published download artifact'
  if (normalized === 'public/.well-known/assetlinks.json') return 'Android association metadata'
  if (basename === '.env' || basename.startsWith('.env.')) return 'environment file'
  if (/^(?:secrets?|credentials?)(?:[._-].*)?$/i.test(basename)) return 'secret or credential file'
  if (excludedFileExtensions.has(path.posix.extname(basename).toLowerCase())) return 'key or packaged binary file'
  if (/^(?:id_rsa|id_ed25519)(?:\.pub)?$/i.test(basename)) return 'private key file'
  return null
}

export function shouldExcludeArchivePath(relativePath) {
  return sensitivePathReason(relativePath) !== null
}

async function pathExists(filePath) {
  try {
    await lstat(filePath)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

async function sha256File(filePath) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(filePath)) hash.update(chunk)
  return hash.digest('hex')
}

function sourceReferencePath(root, relativePath) {
  return path.join(root, ...assertSafeRelativePath(relativePath).split('/'))
}

async function walkIncludedFiles(root, relativeDirectory, excluded) {
  const directoryPath = sourceReferencePath(root, relativeDirectory)
  const entries = await readdir(directoryPath, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const relativePath = assertSafeRelativePath(relativeDirectory + '/' + entry.name)
    const exclusion = sensitivePathReason(relativePath)
    if (exclusion) {
      excluded[exclusion] = (excluded[exclusion] ?? 0) + 1
      continue
    }
    const absolutePath = sourceReferencePath(root, relativePath)
    if (entry.isSymbolicLink()) {
      excluded.symlink = (excluded.symlink ?? 0) + 1
      continue
    }
    if (entry.isDirectory()) files.push(...(await walkIncludedFiles(root, relativePath, excluded)))
    else if (entry.isFile()) files.push(relativePath)
  }
  return files
}

async function collectArchiveFiles(root) {
  const excluded = {}
  const files = []
  for (const relativePath of rootFiles) {
    const absolutePath = sourceReferencePath(root, relativePath)
    if (await pathExists(absolutePath)) {
      const exclusion = sensitivePathReason(relativePath)
      if (exclusion) excluded[exclusion] = (excluded[exclusion] ?? 0) + 1
      else files.push(relativePath)
    }
  }
  for (const relativeDirectory of sourceDirectories) {
    const absolutePath = sourceReferencePath(root, relativeDirectory)
    if (!(await pathExists(absolutePath))) {
      throw new Error('Required Source archive directory is missing: ' + relativeDirectory)
    }
    files.push(...(await walkIncludedFiles(root, relativeDirectory, excluded)))
  }
  for (const required of [
    'index.html',
    'package.json',
    'package-lock.json',
    'src/main.tsx',
    'package/mobile-pi-coapping-chat-package/package.json',
    'package/mobile-pi-coapping-chat-package/src/index.ts',
  ]) {
    if (!files.includes(required)) throw new Error('Required Source archive input is missing: ' + required)
  }
  return { files: [...new Set(files)].sort(), excluded }
}

async function chooseOverrides(root, suppliedOverrides) {
  if (suppliedOverrides !== undefined) return suppliedOverrides
  const beforePath = sourceReferencePath(root, l15RouterBefore)
  if (!(await pathExists(beforePath))) return []
  const actual = await sha256File(beforePath)
  if (actual !== l15RouterSha256) {
    throw new Error('Luna 15 frozen AppScreenRouter before-file hash mismatch')
  }
  return [
    {
      archivePath: 'src/app/AppScreenRouter.tsx',
      sourcePath: beforePath,
      expectedSha256: l15RouterSha256,
      sourceLabel: 'Luna 15 immutable pre-edit Source router',
    },
  ]
}

async function verifyProtectedInputs(root, overrides, options) {
  const overrideMap = new Map(overrides.map((item) => [assertSafeRelativePath(item.archivePath), item]))
  const protectionRoot = options.protectionRoot ?? root
  const excludedNativeRoot = options.excludedNativeRoot ?? root
  const baselinePath = options.sourceReferenceManifestPath === null
    ? null
    : options.sourceReferenceManifestPath ?? path.join(protectionRoot, ...defaultSourceReference.split('/'))
  const preservationPath = options.sourcePreservationPath === null
    ? null
    : options.sourcePreservationPath ?? path.join(protectionRoot, ...defaultSourcePreservation.split('/'))
  const expandedPath = options.expandedProtectionPath === null
    ? null
    : options.expandedProtectionPath ?? path.join(protectionRoot, ...defaultExpandedProtection.split('/'))
  const result = {
    legacyReferenceCount: 0,
    legacyReferenceManifestSha256: null,
    changedAllowedRootBridgePaths: [],
    expandedUiAssetCount: 0,
    nativeExcludedCount: 0,
    expandedSnapshotSha256: null,
    checked: false,
  }
  if (baselinePath && preservationPath && await pathExists(baselinePath) && await pathExists(preservationPath)) {
    const references = JSON.parse(await readFile(baselinePath, 'utf8'))
    const preservation = JSON.parse(await readFile(preservationPath, 'utf8'))
    const allowed = [...new Set(preservation.changed)].sort()
    const changed = []
    const missing = []
    for (const reference of references) {
      const relative = assertSafeRelativePath(reference.path)
      const override = overrideMap.get(relative)
      const target = override?.sourcePath ?? sourceReferencePath(root, relative)
      if (!(await pathExists(target))) {
        missing.push(relative)
        continue
      }
      if ((await sha256File(target)) !== reference.sha256) changed.push(relative)
    }
    const unexpected = changed.filter((relative) => !allowed.includes(relative))
    const expectedButUnchanged = allowed.filter((relative) => !changed.includes(relative))
    if (missing.length || unexpected.length || expectedButUnchanged.length || preservation.originalScreenOrAssetChanged !== false) {
      throw new Error(
        'Source preservation check failed: missing=' + missing.length + ', unexpected=' + unexpected.length + ', allowedButUnchanged=' + expectedButUnchanged.length,
      )
    }
    result.legacyReferenceCount = references.length
    result.legacyReferenceManifestSha256 = await sha256File(baselinePath)
    result.changedAllowedRootBridgePaths = changed
    result.checked = true
  }
  if (expandedPath && await pathExists(expandedPath)) {
    const expanded = JSON.parse(await readFile(expandedPath, 'utf8'))
    const verifyEntries = async (entries, useOverrides, sourceRoot = root) => {
      for (const entry of entries ?? []) {
        const relative = assertSafeRelativePath(entry.path)
        const override = useOverrides ? overrideMap.get(relative) : null
        const target = override?.sourcePath ?? sourceReferencePath(sourceRoot, relative)
        if (!(await pathExists(target))) throw new Error('Protected snapshot file is missing: ' + relative)
        if ((await sha256File(target)) !== String(entry.sha256).toLowerCase()) {
          throw new Error('Protected snapshot hash mismatch: ' + relative)
        }
      }
    }
    await verifyEntries(expanded.currentSourceUiAssets?.files, true)
    await verifyEntries(expanded.excludedNative?.files, false, excludedNativeRoot)
    if (options.verifyRootBridgeSnapshot !== false) {
      for (const entry of expanded.legacySourceBaseline?.rootBridgePathsCurrent ?? []) {
        const relative = assertSafeRelativePath(entry.path)
        const target = sourceReferencePath(root, relative)
        if (!(await pathExists(target)) || (await sha256File(target)) !== String(entry.currentSha256).toLowerCase()) {
          throw new Error('Root bridge snapshot hash mismatch: ' + relative)
        }
      }
    }
    result.expandedUiAssetCount = expanded.currentSourceUiAssets?.files?.length ?? 0
    result.nativeExcludedCount = expanded.excludedNative?.files?.length ?? 0
    result.expandedSnapshotSha256 = await sha256File(expandedPath)
    result.checked = true
  }
  return result
}

function makeReferenceViteConfig() {
  return [
    "import path from 'node:path'",
    "import { fileURLToPath } from 'node:url'",
    "import { defineConfig } from 'vite'",
    "import react from '@vitejs/plugin-react'",
    "import tailwindcss from '@tailwindcss/vite'",
    'const root = path.dirname(fileURLToPath(import.meta.url))',
    "const envDir = process.env.PI_REFERENCE_ENV_DIR ? path.resolve(process.env.PI_REFERENCE_ENV_DIR) : root",
    'function figmaAssetResolver() {',
    '  return {',
    "    name: 'pi-reference-figma-asset-resolver',",
    '    resolveId(id) {',
    "      if (!id.startsWith('figma:asset/')) return undefined",
    "      return path.resolve(root, 'src/assets', id.slice('figma:asset/'.length))",
    '    },',
    '  }',
    '}',
    'export default defineConfig({',
    '  root,',
    '  envDir,',
    "  base: '/',",
    "  publicDir: path.join(root, 'public'),",
    "  cacheDir: path.join(root, '.vite-cache'),",
    '  plugins: [figmaAssetResolver(), react(), tailwindcss()],',
    "  resolve: { alias: [{ find: '@', replacement: path.join(root, 'src') }] },",
    "  optimizeDeps: { entries: ['index.html'] },",
    "  server: { host: '127.0.0.1', port: 5173 },",
    "  build: { outDir: 'reference-build', emptyOutDir: true, copyPublicDir: true },",
    '})',
    '',
  ].join('\n')
}

function makeReferenceReadme() {
  return [
    '# Archived PI Source reference',
    '',
    'This private archive contains the captured Source application and a Source-only Vite build. The Native working UI, Native public bundle, APK downloads, local evidence, and secrets are excluded.',
    '',
    '## Run the archived Source reference after cutover',
    '',
    'The captured production build is served by Root at http://localhost:4008/?renderer=reference. It uses the existing Source local-access configuration; no env file or credential value is copied into this archive.',
    '',
    '~~~powershell',
    '$env:PI_REFERENCE_ENV_DIR = "C:/Users/mihai/Desktop/Mobile Banking - CEE"',
    'npm ci',
    'npm run dev -- --config vite.config.reference.mjs --host 127.0.0.1 --port 5173',
    '~~~',
    '',
    'For local use or rebuilds, Vite reads the existing Source env files from PI_REFERENCE_ENV_DIR. It never copies or prints their values. The config does not load the Native bridge plugin or inject the native-demo-module meta tag.',
    '',
    '## Rebuild the archived Source snapshot',
    '',
    '~~~powershell',
    'npm ci',
    '$env:PI_REFERENCE_ENV_DIR = "C:/Users/mihai/Desktop/Mobile Banking - CEE"',
    'npm exec vite -- build --config vite.config.reference.mjs',
    '~~~',
    '',
    'The packaged reference-build is the production-mode integrity build. Verify copied file bytes against archive-manifest.json before relying on the snapshot.',
    '',
  ].join('\n')
}

async function collectStageFiles(root) {
  const files = []
  const walk = async (directory, relativeDirectory = '') => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = assertSafeRelativePath(relativeDirectory ? relativeDirectory + '/' + entry.name : entry.name)
      if (sensitivePathReason(relative)) continue
      const absolute = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) throw new Error('Archive staging cannot contain symlinks: ' + relative)
      if (entry.isDirectory()) await walk(absolute, relative)
      else if (entry.isFile()) files.push(relative)
    }
  }
  await walk(root)
  return files.sort()
}

async function collectAllFiles(root) {
  const files = []
  const walk = async (directory, relativeDirectory = '') => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = relativeDirectory ? relativeDirectory + '/' + entry.name : entry.name
      const absolute = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) {
        files.push({ path: toPosix(relative), symlink: true })
      } else if (entry.isDirectory()) {
        await walk(absolute, relative)
      } else if (entry.isFile()) {
        files.push({ path: toPosix(relative), symlink: false })
      }
    }
  }
  await walk(root)
  return files
}

async function digestEntries(root, paths) {
  const entries = []
  for (const relativePath of paths) {
    const fullPath = path.join(root, ...relativePath.split('/'))
    entries.push({ path: relativePath, sha256: await sha256File(fullPath), bytes: (await stat(fullPath)).size })
  }
  return entries
}

export async function verifyPiReferenceArchive(archiveDirectory) {
  const root = path.resolve(archiveDirectory)
  const manifestPath = path.join(root, 'archive-manifest.json')
  let manifest
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  } catch (error) {
    return {
      valid: false,
      hashMismatches: [],
      missingFiles: ['archive-manifest.json'],
      unexpectedFiles: [],
      forbiddenPaths: [],
      error: String(error),
    }
  }
  const recorded = new Map((manifest.files ?? []).map((file) => [file.path, file]))
  const allEntries = await collectAllFiles(root)
  const archiveEntries = allEntries.filter((entry) => entry.path !== 'archive-manifest.json')
  const actualPaths = new Set(archiveEntries.filter((entry) => !entry.symlink).map((entry) => entry.path))
  const missingFiles = [...recorded.keys()].filter((relative) => !actualPaths.has(relative)).sort()
  const unexpectedFiles = [...actualPaths].filter((relative) => !recorded.has(relative)).sort()
  const hashMismatches = []
  for (const [relative] of recorded) {
    if (!actualPaths.has(relative)) continue
    const fullPath = path.join(root, ...relative.split('/'))
    if ((await sha256File(fullPath)) !== recorded.get(relative).sha256) hashMismatches.push(relative)
  }
  const forbiddenPaths = archiveEntries
    .filter((entry) => entry.symlink || sensitivePathReason(entry.path) !== null)
    .map((entry) => entry.path)
  const nativeMeta = []
  for (const relative of ['index.html', 'reference-build/index.html']) {
    const fullPath = path.join(root, ...relative.split('/'))
    if (await pathExists(fullPath)) {
      const html = await readFile(fullPath, 'utf8')
      if (/name=["']native-demo-module["']/i.test(html)) nativeMeta.push(relative)
    }
  }
  const requiredMissing = [
    'index.html',
    'package.json',
    'package-lock.json',
    'src/main.tsx',
    'vite.config.reference.mjs',
    'README.reference.md',
  ].filter((relative) => !actualPaths.has(relative))
  const valid =
    manifest.schemaVersion === 1 &&
    manifest.referenceMode?.nativeBridgeEnabled === false &&
    missingFiles.length === 0 &&
    unexpectedFiles.length === 0 &&
    hashMismatches.length === 0 &&
    forbiddenPaths.length === 0 &&
    nativeMeta.length === 0 &&
    requiredMissing.length === 0 &&
    (!manifest.sourceBuild?.built || actualPaths.has('reference-build/index.html'))
  return {
    valid,
    hashMismatches,
    missingFiles: [...missingFiles, ...requiredMissing].sort(),
    unexpectedFiles,
    forbiddenPaths,
    nativeMeta,
    fileCount: actualPaths.size,
  }
}

async function copySourceTree(root, destination, files, overrides) {
  const overrideMap = new Map(overrides.map((override) => [assertSafeRelativePath(override.archivePath), override]))
  const copied = []
  for (const relativePath of files) {
    const override = overrideMap.get(relativePath)
    const sourcePath = override?.sourcePath ?? sourceReferencePath(root, relativePath)
    const targetPath = path.join(destination, ...relativePath.split('/'))
    await mkdir(path.dirname(targetPath), { recursive: true })
    const sourceHash = await sha256File(sourcePath)
    if (override && sourceHash !== override.expectedSha256) {
      throw new Error('Frozen before-file hash mismatch for ' + relativePath)
    }
    await copyFile(sourcePath, targetPath)
    const copiedHash = await sha256File(targetPath)
    if (copiedHash !== sourceHash) throw new Error('Source copy hash mismatch for ' + relativePath)
    copied.push({ path: relativePath, sha256: copiedHash, bytes: (await stat(targetPath)).size })
  }
  return copied
}

async function buildReferenceSite(stageRoot, logLevel = 'info', envDir = stageRoot) {
  await build({
    configFile: path.join(stageRoot, 'vite.config.reference.mjs'),
    root: stageRoot,
    envDir,
    logLevel,
  })
  const sourceIndex = await readFile(path.join(stageRoot, 'index.html'), 'utf8')
  const builtIndex = await readFile(path.join(stageRoot, 'reference-build', 'index.html'), 'utf8')
  if (/name=["']native-demo-module["']/i.test(sourceIndex) || /name=["']native-demo-module["']/i.test(builtIndex)) {
    throw new Error('Source-only archive build unexpectedly contains the Native demo meta tag')
  }
}

async function createArchiveManifest(archiveRoot, metadata) {
  const paths = await collectStageFiles(archiveRoot)
  const files = await digestEntries(archiveRoot, paths)
  const manifest = { schemaVersion: 1, ...metadata, files }
  await writeFile(path.join(archiveRoot, 'archive-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  return manifest
}

async function transferStageToDestination(stageRoot, destination, manifest) {
  const parent = path.dirname(destination)
  await mkdir(parent, { recursive: true })
  if (await pathExists(destination)) throw new Error('Archive destination already exists; refusing to overwrite it')
  const transferParent = await mkdtemp(path.join(parent, '.' + path.basename(destination) + '.tmp-'))
  const transferRoot = path.join(transferParent, 'archive')
  try {
    await mkdir(transferRoot)
    for (const entry of manifest.files) {
      const sourcePath = path.join(stageRoot, ...entry.path.split('/'))
      const targetPath = path.join(transferRoot, ...entry.path.split('/'))
      await mkdir(path.dirname(targetPath), { recursive: true })
      await copyFile(sourcePath, targetPath)
      if ((await sha256File(targetPath)) !== entry.sha256) {
        throw new Error('External archive copy hash mismatch: ' + entry.path)
      }
    }
    await writeFile(path.join(transferRoot, 'archive-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
    const verification = await verifyPiReferenceArchive(transferRoot)
    if (!verification.valid) throw new Error('Archive verification failed: ' + JSON.stringify(verification))
    if (await pathExists(destination)) throw new Error('Archive destination appeared during copy; refusing to overwrite it')
    await rename(transferRoot, destination)
    return await verifyPiReferenceArchive(destination)
  } finally {
    await rm(transferParent, { recursive: true, force: true })
  }
}

function referenceModeMetadata() {
  return {
    query: '?renderer=reference',
    nativeBridgeEnabled: false,
    nativeMetaInjected: false,
    viteConfig: 'vite.config.reference.mjs',
    localPasswordEnvironmentVariable: 'VITE_LOCAL_ACCESS_PASSWORD',
    envDirectoryEnvironmentVariable: 'PI_REFERENCE_ENV_DIR',
    staticReferenceUrl: 'http://localhost:4008/?renderer=reference',
    devReferenceUrl: 'http://127.0.0.1:5173/?renderer=reference',
  }
}

function localAccessConfiguration(envDir, required = true) {
  const values = loadEnv('production', envDir, 'VITE_')
  const configured = Boolean(values.VITE_LOCAL_ACCESS_PASSWORD || process.env.VITE_LOCAL_ACCESS_PASSWORD)
  if (required && !configured) {
    throw new Error('Existing Source local-access configuration is unavailable in the supplied Vite envDir; no secret value was logged.')
  }
  return configured
}

async function readBaseCommit(root) {
  try {
    return execFileSync('git', ['--work-tree', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  } catch {
    return null
  }
}

export async function createPiReferenceArchive(options = {}) {
  const root = path.resolve(options.root ?? defaultRoot)
  const destination = path.resolve(options.destination ?? defaultArchiveDestination)
  if (!(await pathExists(root))) throw new Error('Source checkout does not exist: ' + root)
  if (isInside(root, destination)) throw new Error('Archive destination must be outside the checkout')
  if (await pathExists(destination)) throw new Error('Archive destination already exists; refusing to overwrite it')

  const overrides = await chooseOverrides(root, options.sourceOverrides)
  const overrideMap = new Map(overrides.map((item) => [assertSafeRelativePath(item.archivePath), item]))
  const protectedInputs = await verifyProtectedInputs(root, overrides, options)
  const { files: sourceFiles, excluded } = await collectArchiveFiles(root)
  for (const override of overrides) {
    if (!sourceFiles.includes(assertSafeRelativePath(override.archivePath))) {
      throw new Error('Archive override target is not a selected Source file: ' + override.archivePath)
    }
  }

  const stagingParent = path.join(root, '.codex-temp', 'pi-wide-migration', 'luna-14')
  await mkdir(stagingParent, { recursive: true })
  const staging = await mkdtemp(path.join(stagingParent, 'archive-stage-'))
  try {
    const sourceCopy = await copySourceTree(root, staging, sourceFiles, overrides)
    await writeFile(path.join(staging, 'vite.config.reference.mjs'), makeReferenceViteConfig())
    await writeFile(path.join(staging, 'README.reference.md'), makeReferenceReadme())
    const sourceBuildRequested = options.buildSource !== false
    const envDir = path.resolve(options.envDir ?? root)
    const localAccessConfigured = sourceBuildRequested
      ? localAccessConfiguration(envDir, options.requireLocalAccess !== false)
      : null
    if (sourceBuildRequested) await buildReferenceSite(staging, options.logLevel ?? 'info', envDir)
    else if (/name=["']native-demo-module["']/i.test(await readFile(path.join(staging, 'index.html'), 'utf8'))) {
      throw new Error('Source archive index unexpectedly contains the Native demo meta tag')
    }

    const baseCommit = options.baseCommit ?? await readBaseCommit(root)
    const sourceReferencePathValue = options.sourceReferenceManifestPath === null
      ? null
      : options.sourceReferenceManifestPath ?? path.join(root, ...defaultSourceReference.split('/'))
    const manifest = await createArchiveManifest(staging, {
      capturedAt: new Date().toISOString(),
      baseCommit,
      sourceReference: {
        legacyReferenceCount: protectedInputs.legacyReferenceCount,
        manifestSha256: protectedInputs.legacyReferenceManifestSha256 ??
          (sourceReferencePathValue && await pathExists(sourceReferencePathValue) ? await sha256File(sourceReferencePathValue) : null),
        changedRootBridgePaths: protectedInputs.changedAllowedRootBridgePaths,
      },
      sourceOverrides: overrides.map((override) => ({
        archivePath: assertSafeRelativePath(override.archivePath),
        sourceLabel: override.sourceLabel ?? 'immutable pre-edit Source snapshot',
        sha256: override.expectedSha256,
      })),
      excludedRules: {
        noNativeSpike: true,
        noPublicNativeDemo: true,
        noPublicDownloadsOrApks: true,
        noPrivateEvidenceOrGitOrNodeModules: true,
        noEnvironmentOrKeyFiles: true,
        excludedCounts: excluded,
      },
      referenceMode: referenceModeMetadata(),
      protectedInputs,
      sourceBuild: {
        built: sourceBuildRequested,
        mode: 'Source-only Vite build; nativeBridgePlugin is not loaded',
        outputDirectory: sourceBuildRequested ? 'reference-build' : null,
        normalDistModified: false,
        envDirSource: sourceBuildRequested ? 'existing Source checkout Vite envDir; env files are not copied' : null,
        localAccessConfigured,
        devRunCommand: 'Set PI_REFERENCE_ENV_DIR to the existing Source checkout, then npm run dev -- --config vite.config.reference.mjs --host 127.0.0.1 --port 5173',
        rebuildCommand: 'Set PI_REFERENCE_ENV_DIR to the existing Source checkout, then npm ci && npm exec vite -- build --config vite.config.reference.mjs',
        referenceUrl: 'http://localhost:4008/?renderer=reference',
        accessGate: 'Uses the existing Source Vite local-access config; env files and values are not copied or printed.',
      },
      capture: {
        sourceFileCount: sourceCopy.length,
        sourceSnapshotSha256: createHash('sha256').update(JSON.stringify(sourceCopy)).digest('hex'),
      },
    })
    const verification = await transferStageToDestination(staging, destination, manifest)
    if (!verification.valid) throw new Error('Final archive verification failed: ' + JSON.stringify(verification))
    return { destination, manifest, verification }
  } finally {
    await rm(staging, { recursive: true, force: true })
  }
}

export async function finalizePiReferenceArchive(options = {}) {
  const archiveDirectory = path.resolve(options.archiveDirectory)
  const workspaceRoot = path.resolve(options.workspaceRoot ?? defaultRoot)
  if (!(await pathExists(archiveDirectory))) throw new Error('Captured Source archive does not exist: ' + archiveDirectory)
  if (isInside(workspaceRoot, archiveDirectory)) throw new Error('Archive directory must remain outside the checkout')
  for (const relative of ['archive-manifest.json', 'vite.config.reference.mjs', 'README.reference.md', 'reference-build']) {
    if (await pathExists(path.join(archiveDirectory, relative))) {
      throw new Error('Archive finalization refuses to overwrite existing output: ' + relative)
    }
  }

  const overrides = await chooseOverrides(workspaceRoot, options.sourceOverrides)
  const beforeOverride = overrides.find((item) => item.archivePath === 'src/app/AppScreenRouter.tsx')
  if (beforeOverride) {
    const archivedRouter = path.join(archiveDirectory, 'src', 'app', 'AppScreenRouter.tsx')
    if (!(await pathExists(archivedRouter)) || (await sha256File(archivedRouter)) !== beforeOverride.expectedSha256) {
      throw new Error('Captured archive does not contain the immutable Luna 15 router bytes')
    }
  }
  const protectedInputs = options.protectedInputs === false
    ? {
        checked: false,
        legacyReferenceCount: 0,
        legacyReferenceManifestSha256: null,
        changedAllowedRootBridgePaths: [],
        expandedUiAssetCount: 0,
        nativeExcludedCount: 0,
        expandedSnapshotSha256: null,
      }
    : await verifyProtectedInputs(archiveDirectory, overrides, {
        ...options,
        protectionRoot: workspaceRoot,
        excludedNativeRoot: workspaceRoot,
      verifyRootBridgeSnapshot: false,
      })
  const existingEntries = await collectAllFiles(archiveDirectory)
  const forbiddenBefore = existingEntries
    .filter((entry) => entry.symlink || sensitivePathReason(entry.path) !== null)
    .map((entry) => entry.path)
  if (forbiddenBefore.length) throw new Error('Captured archive contains excluded paths: ' + forbiddenBefore.join(', '))

  const stagingParent = path.join(workspaceRoot, '.codex-temp', 'pi-wide-migration', 'luna-14')
  await mkdir(stagingParent, { recursive: true })
  const staging = await mkdtemp(path.join(stagingParent, 'archive-build-stage-'))
  try {
    const frozenPaths = await collectStageFiles(archiveDirectory)
    for (const relative of frozenPaths) {
      const source = path.join(archiveDirectory, ...relative.split('/'))
      const target = path.join(staging, ...relative.split('/'))
      await mkdir(path.dirname(target), { recursive: true })
      const beforeHash = await sha256File(source)
      await copyFile(source, target)
      if ((await sha256File(target)) !== beforeHash) throw new Error('Frozen archive staging copy hash mismatch: ' + relative)
    }
    await writeFile(path.join(staging, 'vite.config.reference.mjs'), makeReferenceViteConfig())
    await writeFile(path.join(staging, 'README.reference.md'), makeReferenceReadme())
    const sourceBuildRequested = options.buildSource !== false
    const envDir = path.resolve(options.envDir ?? workspaceRoot)
    const localAccessConfigured = sourceBuildRequested
      ? localAccessConfiguration(envDir, options.requireLocalAccess !== false)
      : null
    if (sourceBuildRequested) await buildReferenceSite(staging, options.logLevel ?? 'info', envDir)
    else if (/name=["']native-demo-module["']/i.test(await readFile(path.join(staging, 'index.html'), 'utf8'))) {
      throw new Error('Captured Source index unexpectedly contains the Native demo meta tag')
    }
    const stageOverride = path.join(staging, 'src', 'app', 'AppScreenRouter.tsx')
    if (beforeOverride && (await sha256File(stageOverride)) !== beforeOverride.expectedSha256) {
      throw new Error('Luna 15 frozen router bytes changed while finalizing the archive')
    }
    const stagePaths = await collectStageFiles(staging)
    const additions = stagePaths.filter(
      (relative) =>
        relative === 'vite.config.reference.mjs' ||
        relative === 'README.reference.md' ||
        relative.startsWith('reference-build/'),
    )
    for (const relative of additions) {
      const source = path.join(staging, ...relative.split('/'))
      const destination = path.join(archiveDirectory, ...relative.split('/'))
      if (await pathExists(destination)) throw new Error('Archive addition already exists: ' + relative)
      await mkdir(path.dirname(destination), { recursive: true })
      await copyFile(source, destination)
      if ((await sha256File(source)) !== (await sha256File(destination))) {
        throw new Error('Archive finalization copy hash mismatch: ' + relative)
      }
    }

    const finalPaths = await collectStageFiles(archiveDirectory)
    const files = await digestEntries(archiveDirectory, finalPaths)
    const sourceReferencePathValue = options.sourceReferenceManifestPath === null
      ? null
      : options.sourceReferenceManifestPath ?? path.join(workspaceRoot, ...defaultSourceReference.split('/'))
    const manifest = {
      schemaVersion: 1,
      capturedAt: new Date().toISOString(),
      baseCommit: await readBaseCommit(workspaceRoot),
      sourceReference: {
        legacyReferenceCount: protectedInputs.legacyReferenceCount,
        manifestSha256: protectedInputs.legacyReferenceManifestSha256 ??
          (sourceReferencePathValue && await pathExists(sourceReferencePathValue) ? await sha256File(sourceReferencePathValue) : null),
        changedRootBridgePaths: protectedInputs.changedAllowedRootBridgePaths,
      },
      sourceOverrides: overrides.map((override) => ({
        archivePath: assertSafeRelativePath(override.archivePath),
        sourceLabel: override.sourceLabel ?? 'immutable pre-edit Source snapshot',
        sha256: override.expectedSha256,
      })),
      excludedRules: {
        noNativeSpike: true,
        noPublicNativeDemo: true,
        noPublicDownloadsOrApks: true,
        noPrivateEvidenceOrGitOrNodeModules: true,
        noEnvironmentOrKeyFiles: true,
      },
      referenceMode: referenceModeMetadata(),
      protectedInputs,
      sourceBuild: {
        built: sourceBuildRequested,
        mode: 'Source-only Vite build; nativeBridgePlugin is not loaded',
        outputDirectory: sourceBuildRequested ? 'reference-build' : null,
        normalDistModified: false,
        envDirSource: sourceBuildRequested ? 'existing Source checkout Vite envDir; env files are not copied' : null,
        localAccessConfigured,
        devRunCommand: 'Set PI_REFERENCE_ENV_DIR to the existing Source checkout, then npm run dev -- --config vite.config.reference.mjs --host 127.0.0.1 --port 5173',
        rebuildCommand: 'Set PI_REFERENCE_ENV_DIR to the existing Source checkout, then npm ci && npm exec vite -- build --config vite.config.reference.mjs',
        referenceUrl: 'http://localhost:4008/?renderer=reference',
        accessGate: 'Uses the existing Source Vite local-access config; env files and values are not copied or printed.',
      },
      files,
    }
    await writeFile(path.join(archiveDirectory, 'archive-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
    const verification = await verifyPiReferenceArchive(archiveDirectory)
    if (!verification.valid) throw new Error('Final archive verification failed: ' + JSON.stringify(verification))
    return { destination: archiveDirectory, manifest, verification }
  } finally {
    await rm(staging, { recursive: true, force: true })
  }
}

export async function rebuildPiReferenceArchive(options = {}) {
  const archiveDirectory = path.resolve(options.archiveDirectory)
  const workspaceRoot = path.resolve(options.workspaceRoot ?? defaultRoot)
  const envDir = path.resolve(options.envDir ?? workspaceRoot)
  if (!(await pathExists(archiveDirectory))) throw new Error('Captured Source archive does not exist: ' + archiveDirectory)
  if (isInside(workspaceRoot, archiveDirectory)) throw new Error('Archive directory must remain outside the checkout')
  const beforeVerification = await verifyPiReferenceArchive(archiveDirectory)
  if (!beforeVerification.valid) {
    throw new Error('Existing archive failed integrity verification before rebuild: ' + JSON.stringify(beforeVerification))
  }
  const oldManifestPath = path.join(archiveDirectory, 'archive-manifest.json')
  const oldManifestBytes = await readFile(oldManifestPath)
  const oldManifestSha256 = await sha256File(oldManifestPath)
  const oldManifest = JSON.parse(oldManifestBytes.toString('utf8'))
  const oldEntries = new Map((oldManifest.files ?? []).map((entry) => [entry.path, entry]))
  const immutableEntries = [...oldEntries.values()].filter(
    (entry) =>
      !entry.path.startsWith('reference-build/') &&
      entry.path !== 'vite.config.reference.mjs' &&
      entry.path !== 'README.reference.md',
  )
  for (const entry of immutableEntries) {
    const fullPath = path.join(archiveDirectory, ...entry.path.split('/'))
    if ((await sha256File(fullPath)) !== entry.sha256) {
      throw new Error('Captured Source file changed before rebuild: ' + entry.path)
    }
  }
  const localAccessConfigured = localAccessConfiguration(envDir, options.requireLocalAccess !== false)
  const overrides = await chooseOverrides(workspaceRoot, options.sourceOverrides)
  const beforeOverride = overrides.find((item) => item.archivePath === 'src/app/AppScreenRouter.tsx')
  if (beforeOverride) {
    const archivedRouter = path.join(archiveDirectory, 'src', 'app', 'AppScreenRouter.tsx')
    if (!(await pathExists(archivedRouter)) || (await sha256File(archivedRouter)) !== beforeOverride.expectedSha256) {
      throw new Error('Captured archive no longer has the immutable Luna 15 AppScreenRouter bytes')
    }
  }
  const protectedInputs = options.protectedInputs === false
    ? oldManifest.protectedInputs
    : await verifyProtectedInputs(archiveDirectory, overrides, {
        ...options,
        protectionRoot: workspaceRoot,
        excludedNativeRoot: workspaceRoot,
        verifyRootBridgeSnapshot: false,
      })
  if (protectedInputs) {
    protectedInputs.rootBridgeSnapshotSkippedForPreCutoverArchive = true
  }

  const stagingParent = path.join(workspaceRoot, '.codex-temp', 'pi-wide-migration', 'luna-14')
  await mkdir(stagingParent, { recursive: true })
  const staging = await mkdtemp(path.join(stagingParent, 'archive-rebuild-stage-'))
  const oldGenerated = new Map()
  const newBuildFilesAdded = []
  const oldIndexPath = path.join(archiveDirectory, 'reference-build', 'index.html')
  const oldIndexBytes = await pathExists(oldIndexPath) ? await readFile(oldIndexPath) : null
  let indexUpdated = false
  let manifestReplaced = false
  let indexTemporary = null
  let manifestTemporary = null
  try {
    for (const entry of oldManifest.files) {
      if (entry.path.startsWith('reference-build/')) continue
      const source = path.join(archiveDirectory, ...entry.path.split('/'))
      const target = path.join(staging, ...entry.path.split('/'))
      await mkdir(path.dirname(target), { recursive: true })
      await copyFile(source, target)
      if ((await sha256File(target)) !== entry.sha256) {
        throw new Error('Rebuild staging copy hash mismatch: ' + entry.path)
      }
    }
    await writeFile(path.join(staging, 'vite.config.reference.mjs'), makeReferenceViteConfig())
    await writeFile(path.join(staging, 'README.reference.md'), makeReferenceReadme())
    if (typeof options.buildRunner === 'function') {
      await options.buildRunner({ stageRoot: staging, envDir })
    } else {
      await buildReferenceSite(staging, options.logLevel ?? 'info', envDir)
    }
    const builtIndex = path.join(staging, 'reference-build', 'index.html')
    if (!(await pathExists(builtIndex))) throw new Error('Source-only rebuild did not emit reference-build/index.html')
    if (/name=["']native-demo-module["']/i.test(await readFile(builtIndex, 'utf8'))) {
      throw new Error('Source-only rebuild emitted the Native demo meta tag')
    }
    for (const entry of immutableEntries) {
      const fullPath = path.join(staging, ...entry.path.split('/'))
      if ((await sha256File(fullPath)) !== entry.sha256) {
        throw new Error('Source bytes changed during the archive rebuild: ' + entry.path)
      }
    }

    for (const relative of ['vite.config.reference.mjs', 'README.reference.md']) {
      const source = path.join(staging, relative)
      const target = path.join(archiveDirectory, relative)
      oldGenerated.set(relative, await pathExists(target) ? await readFile(target) : null)
    }
    const stagePaths = await collectStageFiles(staging)
    const newBuildPaths = stagePaths.filter((relative) => relative.startsWith('reference-build/'))
    const newBuildEntries = await digestEntries(staging, newBuildPaths)
    const newIndexEntry = newBuildEntries.find((entry) => entry.path === 'reference-build/index.html')
    if (!newIndexEntry) throw new Error('Source-only rebuild manifest is missing reference-build/index.html')
    const oldBuildPaths = new Set([...oldEntries.keys()].filter((relative) => relative.startsWith('reference-build/')))

    for (const relative of ['vite.config.reference.mjs', 'README.reference.md']) {
      await copyFile(path.join(staging, relative), path.join(archiveDirectory, relative))
    }
    for (const entry of newBuildEntries) {
      if (entry.path === 'reference-build/index.html') continue
      const source = path.join(staging, ...entry.path.split('/'))
      const destination = path.join(archiveDirectory, ...entry.path.split('/'))
      if (await pathExists(destination)) {
        if ((await sha256File(destination)) !== entry.sha256) {
          throw new Error('Vite emitted a changed non-index asset at an existing path: ' + entry.path)
        }
        continue
      }
      await mkdir(path.dirname(destination), { recursive: true })
      await copyFile(source, destination)
      if ((await sha256File(destination)) !== entry.sha256) {
        await rm(destination, { force: true })
        throw new Error('Reference asset copy hash mismatch: ' + entry.path)
      }
      newBuildFilesAdded.push(destination)
    }

    const newIndexSource = path.join(staging, 'reference-build', 'index.html')
    const newIndexTarget = path.join(archiveDirectory, 'reference-build', 'index.html')
    await mkdir(path.dirname(newIndexTarget), { recursive: true })
    indexTemporary = newIndexTarget + '.next-' + randomUUID()
    await copyFile(newIndexSource, indexTemporary)
    await rename(indexTemporary, newIndexTarget)
    indexTemporary = null
    indexUpdated = true

    const finalPaths = (await collectStageFiles(archiveDirectory)).filter((relative) => relative !== 'archive-manifest.json')
    const finalFiles = await digestEntries(archiveDirectory, finalPaths)
    const sourceReferencePathValue = options.sourceReferenceManifestPath === null
      ? null
      : options.sourceReferenceManifestPath ?? path.join(workspaceRoot, ...defaultSourceReference.split('/'))
    const retainedPreviousBuildFileCount = [...oldBuildPaths].filter((relative) => !newBuildPaths.includes(relative)).length
    const manifest = {
      ...oldManifest,
      capturedAt: new Date().toISOString(),
      sourceReference: {
        ...oldManifest.sourceReference,
        legacyReferenceManifestSha256: protectedInputs?.legacyReferenceManifestSha256 ??
          (sourceReferencePathValue && await pathExists(sourceReferencePathValue) ? await sha256File(sourceReferencePathValue) : oldManifest.sourceReference?.legacyReferenceManifestSha256 ?? null),
        legacyReferenceCount: protectedInputs?.legacyReferenceCount ?? oldManifest.sourceReference?.legacyReferenceCount ?? 0,
        changedRootBridgePaths: protectedInputs?.changedAllowedRootBridgePaths ?? oldManifest.sourceReference?.changedRootBridgePaths ?? [],
      },
      protectedInputs,
      sourceBuild: {
        ...oldManifest.sourceBuild,
        built: true,
        mode: 'Source-only Vite rebuild using the existing Source envDir; nativeBridgePlugin is not loaded',
        outputDirectory: 'reference-build',
        normalDistModified: false,
        envDirSource: 'existing Source checkout Vite envDir; env files are not copied',
        localAccessConfigured,
        envDirEnvironmentVariable: 'PI_REFERENCE_ENV_DIR',
        referenceUrl: 'http://localhost:4008/?renderer=reference',
        accessGate: 'Uses the existing Source Vite local-access config; env files and values are not copied or printed.',
        activeBuildFileCount: newBuildEntries.length,
        retainedPreviousBuildFileCount,
        previousArchiveManifestSha256: oldManifestSha256,
      },
      rebuild: {
        envDirSource: 'existing Source checkout Vite envDir; env files are not copied',
        localAccessConfigured,
        secretValueLogged: false,
        sourceFilesChanged: false,
      },
      files: finalFiles,
    }
    manifestTemporary = oldManifestPath + '.next-' + randomUUID()
    await writeFile(manifestTemporary, JSON.stringify(manifest, null, 2) + '\n')
    await rename(manifestTemporary, oldManifestPath)
    manifestTemporary = null
    manifestReplaced = true
    const verification = await verifyPiReferenceArchive(archiveDirectory)
    if (!verification.valid) throw new Error('Rebuilt archive verification failed: ' + JSON.stringify(verification))
    return { destination: archiveDirectory, manifest, verification }
  } catch (error) {
    if (indexUpdated) {
      if (oldIndexBytes) await writeFile(oldIndexPath, oldIndexBytes)
      else await rm(oldIndexPath, { force: true })
    }
    for (const [relative, bytes] of oldGenerated) {
      const target = path.join(archiveDirectory, relative)
      if (bytes) await writeFile(target, bytes)
      else await rm(target, { force: true })
    }
    for (const file of newBuildFilesAdded) await rm(file, { force: true })
    if (manifestReplaced) await writeFile(oldManifestPath, oldManifestBytes)
    if (indexTemporary) await rm(indexTemporary, { force: true })
    if (manifestTemporary) await rm(manifestTemporary, { force: true })
    throw error
  } finally {
    await rm(staging, { recursive: true, force: true })
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const args = process.argv.slice(2)
  const rebuildIndex = args.indexOf('--rebuild-existing')
  const finalizeIndex = args.indexOf('--finalize-existing')
  const destinationIndex = args.indexOf('--destination')
  const envDirIndex = args.indexOf('--env-dir')
  const noBuild = args.includes('--no-build')
  const destination = destinationIndex >= 0 ? args[destinationIndex + 1] : undefined
  const envDir = envDirIndex >= 0 ? args[envDirIndex + 1] : undefined
  if (rebuildIndex >= 0) {
    const archiveDirectory = args[rebuildIndex + 1]
    if (!archiveDirectory) throw new Error('--rebuild-existing requires an archive directory')
    const result = await rebuildPiReferenceArchive({
      archiveDirectory,
      envDir,
      buildSource: !noBuild,
      requireLocalAccess: true,
    })
    console.log(JSON.stringify({
      archive: result.destination,
      archiveFileCount: result.verification.fileCount,
      archiveManifestSha256: await sha256File(path.join(result.destination, 'archive-manifest.json')),
      referenceBuild: result.manifest.sourceBuild,
      verification: result.verification,
    }, null, 2))
  } else if (finalizeIndex >= 0) {
    const archiveDirectory = args[finalizeIndex + 1]
    if (!archiveDirectory) throw new Error('--finalize-existing requires an archive directory')
    const result = await finalizePiReferenceArchive({ archiveDirectory, envDir, buildSource: !noBuild, requireLocalAccess: true })
    console.log(JSON.stringify({
      archive: result.destination,
      archiveFileCount: result.verification.fileCount,
      archiveManifestSha256: await sha256File(path.join(result.destination, 'archive-manifest.json')),
      referenceBuild: result.manifest.sourceBuild,
      verification: result.verification,
    }, null, 2))
  } else {
    if (destinationIndex >= 0 && !destination) throw new Error('--destination requires a directory path')
    const result = await createPiReferenceArchive({ destination, envDir, buildSource: !noBuild, requireLocalAccess: true })
    console.log(JSON.stringify({
      archive: result.destination,
      archiveFileCount: result.verification.fileCount,
      archiveManifestSha256: await sha256File(path.join(result.destination, 'archive-manifest.json')),
      referenceBuild: result.manifest.sourceBuild,
      verification: result.verification,
    }, null, 2))
  }
}
