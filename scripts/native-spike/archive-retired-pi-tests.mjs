import { constants as fsConstants, createReadStream } from 'node:fs'
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  readdir,
  rename,
  rmdir,
  rm,
  writeFile,
} from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { tmpdir } from 'node:os'
import { shouldExcludeArchivePath, verifyPiReferenceArchive } from './archive-pi-reference.mjs'

function normalizeRelativePath(value, label, options = {}) {
  if (typeof value !== 'string' || value.length === 0 || value !== value.trim()) {
    throw new Error(label + ' must be a non-empty exact relative path')
  }
  const normalized = value.replaceAll('\\', '/')
  const segments = normalized.split('/')
  if (
    normalized.startsWith('/') ||
    normalized.includes(':') ||
    /[*?[\]{}]/.test(normalized) ||
    segments.some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    throw new Error(label + ' must not contain a glob, absolute path, or traversal segment: ' + value)
  }
  const proofSubpath =
    options.allowNativeTestProof && normalized.startsWith('native-spike/__tests__/')
      ? normalized.slice('native-spike/'.length)
      : normalized
  if (shouldExcludeArchivePath(proofSubpath)) {
    throw new Error(label + ' is a forbidden private, generated, Native, or secret path: ' + normalized)
  }
  return normalized
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate)
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))
}

function isTestPath(relativePath) {
  return relativePath.startsWith('tests/') && /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(relativePath)
}

function isNativeProofTestPath(relativePath) {
  return relativePath.startsWith('native-spike/__tests__/') && /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(relativePath)
}

function isAllowedRootConfig(relativePath) {
  if (relativePath.includes('/')) return false
  const extension = String.raw`(?:cjs|cts|js|json|mjs|mts|ts)`
  return (
    new RegExp(String.raw`^(?:vitest|vite|jest|playwright)\.config\.${extension}$`).test(relativePath) ||
    new RegExp(String.raw`^tsconfig(?:\.[A-Za-z0-9_-]+)?\.json$`).test(relativePath)
  )
}

function assertSourceTestPath(relativePath, label) {
  if (!isTestPath(relativePath))
    throw new Error(label + ' must name one exact tests/**/*.test.* or tests/**/*.spec.* file')
}

function assertSupportPath(relativePath) {
  if (relativePath.startsWith('tests/')) return
  if (!isAllowedRootConfig(relativePath)) {
    throw new Error('Support files must be under tests/ or use an approved root test config name: ' + relativePath)
  }
}

function validateAllowlist(allowlist) {
  if (!allowlist || typeof allowlist !== 'object' || allowlist.schemaVersion !== 1) {
    throw new Error('Allowlist must be a schemaVersion 1 object')
  }
  if (!Array.isArray(allowlist.sourceTests) || allowlist.sourceTests.length === 0) {
    throw new Error('Allowlist must explicitly list at least one retired Source test')
  }
  if (!Array.isArray(allowlist.supportFiles)) throw new Error('Allowlist supportFiles must be an array')

  const sourceTests = []
  const sourceTestPaths = new Set()
  const proofPaths = new Set()
  for (const [index, entry] of allowlist.sourceTests.entries()) {
    const sourcePath = normalizeRelativePath(entry?.path, 'sourceTests[' + index + '].path')
    assertSourceTestPath(sourcePath, 'sourceTests[' + index + '].path')
    if (sourceTestPaths.has(sourcePath)) throw new Error('Duplicate retired Source test path: ' + sourcePath)
    sourceTestPaths.add(sourcePath)
    if (!Array.isArray(entry.nativeProofs) || entry.nativeProofs.length === 0) {
      throw new Error('Every retired Source test requires at least one explicit Native proof path: ' + sourcePath)
    }
    const nativeProofs = entry.nativeProofs.map((proofPath, proofIndex) => {
      const normalizedProof = normalizeRelativePath(proofPath, sourcePath + '.nativeProofs[' + proofIndex + ']', {
        allowNativeTestProof: true,
      })
      if (!isTestPath(normalizedProof) && !isNativeProofTestPath(normalizedProof)) {
        throw new Error(
          'Native proof path must identify an exact tests/ or native-spike/__tests__/ test file: ' + normalizedProof,
        )
      }
      if (normalizedProof === sourcePath)
        throw new Error('A retired Source test cannot prove its own retirement: ' + sourcePath)
      proofPaths.add(normalizedProof)
      return normalizedProof
    })
    if (new Set(nativeProofs).size !== nativeProofs.length)
      throw new Error('Duplicate Native proof path for ' + sourcePath)
    sourceTests.push({ sourcePath, nativeProofs })
  }

  const supportFiles = []
  const supportPaths = new Set()
  for (const [index, entry] of allowlist.supportFiles.entries()) {
    const sourcePath = normalizeRelativePath(entry?.path, 'supportFiles[' + index + '].path')
    assertSupportPath(sourcePath)
    if (supportPaths.has(sourcePath)) throw new Error('Duplicate support file path: ' + sourcePath)
    if (proofPaths.has(sourcePath))
      throw new Error(
        'Native proof tests are recorded as evidence and cannot be copied as Source support: ' + sourcePath,
      )
    supportPaths.add(sourcePath)
    if (!Array.isArray(entry.requiredBy) || entry.requiredBy.length === 0) {
      throw new Error('Every support file must name the retired Source tests that require it: ' + sourcePath)
    }
    const requiredBy = entry.requiredBy.map((testPath) => normalizeRelativePath(testPath, sourcePath + '.requiredBy'))
    if (requiredBy.some((testPath) => !sourceTestPaths.has(testPath))) {
      throw new Error(
        'Support file requiredBy must refer only to explicitly listed retired Source tests: ' + sourcePath,
      )
    }
    if (new Set(requiredBy).size !== requiredBy.length) throw new Error('Duplicate requiredBy entry for ' + sourcePath)
    supportFiles.push({ sourcePath, requiredBy })
  }
  for (const sourcePath of proofPaths) {
    if (sourceTestPaths.has(sourcePath))
      throw new Error('A Native proof test cannot also be archived as a retired Source test: ' + sourcePath)
    if (supportPaths.has(sourcePath))
      throw new Error('A Native proof test cannot also be copied as Source support: ' + sourcePath)
  }

  const copiedPaths = [
    ...sourceTests.map((entry) => entry.sourcePath),
    ...supportFiles.map((entry) => entry.sourcePath),
  ]
  if (new Set(copiedPaths).size !== copiedPaths.length)
    throw new Error('Allowlist contains duplicate copied source paths')
  return { sourceTests, supportFiles }
}

function rejectSecretContent(relativePath, contents) {
  const text = contents.toString('utf8')
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
    /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
    /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/,
    /\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password|secret)\b\s*[:=]\s*['"`][^'"`\r\n]{16,}['"`]/i,
  ]
  if (secretPatterns.some((pattern) => pattern.test(text))) {
    throw new Error('File content matches a secret pattern and was not archived: ' + relativePath)
  }
}

async function sha256File(filePath) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(filePath)) hash.update(chunk)
  return hash.digest('hex')
}

function buildSnapshotSha256(fileRecords) {
  const buildRecords = fileRecords
    .filter((entry) => entry.path.startsWith('reference-build/'))
    .map(({ path: relativePath, sha256, bytes }) => ({ path: relativePath, sha256, bytes }))
    .sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0))
  return createHash('sha256').update(JSON.stringify(buildRecords)).digest('hex')
}

async function readSourceFile(sourceRoot, relativePath) {
  const sourcePath = path.resolve(sourceRoot, ...relativePath.split('/'))
  if (!isInside(sourceRoot, sourcePath) || sourcePath === sourceRoot) {
    throw new Error('Source file resolves outside the checkout: ' + relativePath)
  }
  const info = await lstat(sourcePath)
  if (!info.isFile() || info.isSymbolicLink()) throw new Error('Source input must be a regular file: ' + relativePath)
  const resolvedSourcePath = await realpath(sourcePath)
  if (!isInside(sourceRoot, resolvedSourcePath) || resolvedSourcePath === sourceRoot) {
    throw new Error('Source file resolves outside the checkout: ' + relativePath)
  }
  const contents = await readFile(resolvedSourcePath)
  rejectSecretContent(relativePath, contents)
  return { contents, sha256: createHash('sha256').update(contents).digest('hex'), bytes: contents.length }
}

async function makeCopyPlan(sourceRoot, validatedAllowlist) {
  const sourceTests = []
  const supportFiles = []
  const copyPlans = []
  const sourceCache = new Map()
  const getFile = async (sourcePath) => {
    if (!sourceCache.has(sourcePath)) sourceCache.set(sourcePath, await readSourceFile(sourceRoot, sourcePath))
    return sourceCache.get(sourcePath)
  }

  for (const entry of validatedAllowlist.sourceTests) {
    const sourceFile = await getFile(entry.sourcePath)
    const nativeProofs = []
    for (const proofPath of entry.nativeProofs) {
      const proofFile = await getFile(proofPath)
      nativeProofs.push({ sourcePath: proofPath, sha256: proofFile.sha256, bytes: proofFile.bytes })
    }
    const archivePath = 'reference-tests/' + entry.sourcePath
    sourceTests.push({
      sourcePath: entry.sourcePath,
      archivePath,
      sha256: sourceFile.sha256,
      bytes: sourceFile.bytes,
      nativeProofs,
    })
    copyPlans.push({ sourcePath: entry.sourcePath, archivePath, ...sourceFile })
  }
  for (const entry of validatedAllowlist.supportFiles) {
    const sourceFile = await getFile(entry.sourcePath)
    const archivePath = 'reference-tests/' + entry.sourcePath
    supportFiles.push({
      sourcePath: entry.sourcePath,
      archivePath,
      sha256: sourceFile.sha256,
      bytes: sourceFile.bytes,
      requiredBy: entry.requiredBy,
    })
    copyPlans.push({ sourcePath: entry.sourcePath, archivePath, ...sourceFile })
  }
  return { sourceTests, supportFiles, copyPlans }
}

async function createArchiveDirectories(archiveRoot, relativeDirectory, createdDirectories) {
  let current = archiveRoot
  for (const segment of relativeDirectory.split('/').filter(Boolean)) {
    current = path.join(current, segment)
    try {
      const info = await lstat(current)
      if (!info.isDirectory() || info.isSymbolicLink())
        throw new Error('Archive destination contains a non-directory path: ' + segment)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      await mkdir(current)
      createdDirectories.push(current)
    }
  }
}

async function removeCreatedPaths(createdFiles, createdDirectories) {
  for (const target of createdFiles.reverse()) await rm(target, { force: true })
  for (const directory of createdDirectories.reverse()) {
    try {
      const entries = await readdir(directory)
      if (entries.length === 0) await rmdir(directory)
    } catch (error) {
      if (error.code !== 'ENOENT' && error.code !== 'ENOTEMPTY') throw error
    }
  }
}

export async function archiveRetiredPiTests(options = {}) {
  const archiveRoot = await realpath(path.resolve(options.archiveDirectory ?? ''))
  const sourceRoot = await realpath(path.resolve(options.sourceRoot ?? process.cwd()))
  if (archiveRoot === sourceRoot || isInside(sourceRoot, archiveRoot) || isInside(archiveRoot, sourceRoot)) {
    throw new Error('Archive and Source checkout must be separate, non-overlapping directories')
  }

  const manifestPath = path.join(archiveRoot, 'archive-manifest.json')
  const initialManifestBytes = await readFile(manifestPath)
  const initialManifestSha256 = createHash('sha256').update(initialManifestBytes).digest('hex')
  const expectedManifestSha256 = options.expectedManifestSha256
  if (typeof expectedManifestSha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(expectedManifestSha256)) {
    throw new Error('expectedManifestSha256 must be the current 64-character archive manifest hash')
  }
  if (initialManifestSha256.toLowerCase() !== expectedManifestSha256.toLowerCase()) {
    throw new Error(
      'Archive manifest hash mismatch; expected ' + expectedManifestSha256 + ', found ' + initialManifestSha256,
    )
  }

  const initialVerification = await verifyPiReferenceArchive(archiveRoot)
  if (!initialVerification.valid)
    throw new Error('Existing PI reference archive is not valid: ' + JSON.stringify(initialVerification))
  const manifest = JSON.parse(initialManifestBytes.toString('utf8'))
  const validatedAllowlist = validateAllowlist(options.allowlist)
  const { sourceTests, supportFiles, copyPlans } = await makeCopyPlan(sourceRoot, validatedAllowlist)
  const archivePaths = copyPlans.map((plan) => plan.archivePath)
  if (new Set(archivePaths).size !== archivePaths.length)
    throw new Error('Allowlist maps multiple files to the same archive path')

  const existingManifestPaths = new Set((manifest.files ?? []).map((entry) => entry.path))
  for (const archivePath of archivePaths) {
    if (existingManifestPaths.has(archivePath))
      throw new Error('Archive already contains an allowlisted destination: ' + archivePath)
    try {
      await lstat(path.join(archiveRoot, ...archivePath.split('/')))
      throw new Error('Archive destination already exists: ' + archivePath)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }

  const referenceTests = manifest.referenceTests ?? { schemaVersion: 1, batches: [] }
  if (referenceTests.schemaVersion !== 1 || !Array.isArray(referenceTests.batches)) {
    throw new Error('Archive referenceTests metadata has an unsupported schema')
  }
  const batchPayload = JSON.stringify({ sourceTests, supportFiles })
  const batchId = createHash('sha256').update(batchPayload).digest('hex')
  if (referenceTests.batches.some((batch) => batch.batchId === batchId)) {
    throw new Error('This exact Source test allowlist has already been archived')
  }

  const sourceBuildIndex = (manifest.files ?? []).find((entry) => entry.path === 'reference-build/index.html')
  const sourceBuildSnapshotSha256 = buildSnapshotSha256(manifest.files ?? [])
  const previousSourceBuild = JSON.stringify(manifest.sourceBuild ?? null)
  const existingFileRecords = manifest.files ?? []
  const appendedAt = new Date().toISOString()
  const batch = {
    batchId,
    appendedAt,
    previousManifestSha256: initialManifestSha256,
    sourceTests,
    supportFiles,
    nativeProofPolicy:
      'Each copied Source UI test must identify existing Native-equivalent test proof paths; proof files are hash-recorded and not copied.',
    sourceBuildIndexSha256: sourceBuildIndex?.sha256 ?? null,
    sourceBuildSnapshotSha256,
  }

  const stagingRoot = await mkdtemp(path.join(tmpdir(), 'retired-pi-test-stage-'))
  const createdFiles = []
  const createdDirectories = []
  let manifestCommitted = false
  let temporaryManifestPath = null
  try {
    for (const plan of copyPlans) {
      const stagedPath = path.join(stagingRoot, ...plan.archivePath.split('/'))
      await mkdir(path.dirname(stagedPath), { recursive: true })
      await writeFile(stagedPath, plan.contents, { flag: 'wx' })
      if ((await sha256File(stagedPath)) !== plan.sha256)
        throw new Error('Staged file hash changed while preparing archive: ' + plan.sourcePath)
    }

    for (const plan of copyPlans) {
      const targetPath = path.join(archiveRoot, ...plan.archivePath.split('/'))
      await createArchiveDirectories(archiveRoot, path.posix.dirname(plan.archivePath), createdDirectories)
      const stagedPath = path.join(stagingRoot, ...plan.archivePath.split('/'))
      await copyFile(stagedPath, targetPath, fsConstants.COPYFILE_EXCL)
      createdFiles.push(targetPath)
      if ((await sha256File(targetPath)) !== plan.sha256)
        throw new Error('Copied file hash mismatch: ' + plan.archivePath)
    }

    const fileRecords = copyPlans.map((plan) => ({ path: plan.archivePath, sha256: plan.sha256, bytes: plan.bytes }))
    const updatedManifest = {
      ...manifest,
      files: [...existingFileRecords, ...fileRecords],
      referenceTests: { ...referenceTests, schemaVersion: 1, batches: [...referenceTests.batches, batch] },
    }
    temporaryManifestPath = manifestPath + '.next-' + randomUUID()
    await writeFile(temporaryManifestPath, JSON.stringify(updatedManifest, null, 2) + '\n', { flag: 'wx' })
    await rename(temporaryManifestPath, manifestPath)
    temporaryManifestPath = null
    manifestCommitted = true

    if (JSON.stringify(updatedManifest.sourceBuild ?? null) !== previousSourceBuild) {
      throw new Error('Source build metadata changed while archiving Source tests')
    }
    const oldBuildIndex = existingFileRecords.find((entry) => entry.path === 'reference-build/index.html')
    const newBuildIndex = updatedManifest.files.find((entry) => entry.path === 'reference-build/index.html')
    if ((oldBuildIndex?.sha256 ?? null) !== (newBuildIndex?.sha256 ?? null)) {
      throw new Error('Archived Source UI build index hash changed')
    }
    const updatedBuildSnapshotSha256 = buildSnapshotSha256(updatedManifest.files)
    if (updatedBuildSnapshotSha256 !== sourceBuildSnapshotSha256) {
      throw new Error('Archived Source UI build snapshot hash changed')
    }
    const verification = await verifyPiReferenceArchive(archiveRoot)
    if (!verification.valid)
      throw new Error('Updated PI reference archive failed verification: ' + JSON.stringify(verification))
    const finalManifestSha256 = await sha256File(manifestPath)
    return {
      archiveDirectory: archiveRoot,
      addedArchivePaths: archivePaths.slice().sort(),
      archiveManifestSha256: finalManifestSha256,
      sourceBuildIndexSha256: sourceBuildIndex?.sha256 ?? null,
      sourceBuildSnapshotSha256: updatedBuildSnapshotSha256,
      previousArchiveFilesPreserved: existingFileRecords.length,
      verification,
    }
  } catch (error) {
    if (manifestCommitted) {
      const rollbackPath = manifestPath + '.rollback-' + randomUUID()
      await writeFile(rollbackPath, initialManifestBytes, { flag: 'wx' })
      await rename(rollbackPath, manifestPath)
    }
    await removeCreatedPaths(createdFiles, createdDirectories)
    throw error
  } finally {
    if (temporaryManifestPath) await rm(temporaryManifestPath, { force: true })
    await rm(stagingRoot, { recursive: true, force: true })
  }
}

function parseArgs(argv) {
  const options = {}
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--archive') options.archiveDirectory = argv[++index]
    else if (argument === '--root') options.sourceRoot = argv[++index]
    else if (argument === '--expected-manifest-sha256') options.expectedManifestSha256 = argv[++index]
    else if (argument === '--allowlist') options.allowlistPath = argv[++index]
    else if (argument === '--help' || argument === '-h') options.help = true
    else throw new Error('Unknown argument: ' + argument)
  }
  return options
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv)
  if (options.help) {
    process.stdout.write(
      'Usage: node scripts/native-spike/archive-retired-pi-tests.mjs --archive PATH --root PATH --expected-manifest-sha256 HASH --allowlist JSON' +
        String.fromCharCode(10),
    )
    return 0
  }
  if (!options.archiveDirectory || !options.expectedManifestSha256 || !options.allowlistPath) {
    throw new Error('--archive, --expected-manifest-sha256, and --allowlist are required')
  }
  options.sourceRoot ??= process.cwd()
  options.allowlist = JSON.parse(await readFile(path.resolve(options.allowlistPath), 'utf8'))
  const result = await archiveRetiredPiTests(options)
  process.stdout.write(JSON.stringify(result, null, 2) + String.fromCharCode(10))
  return 0
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    process.exitCode = await main()
  } catch (error) {
    process.stderr.write(
      (error instanceof Error ? (error.stack ?? error.message) : String(error)) + String.fromCharCode(10),
    )
    process.exitCode = 1
  }
}
