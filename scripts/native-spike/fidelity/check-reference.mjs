import { createHash } from 'node:crypto'
import { readFile, readdir, realpath, lstat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

export const referenceAreas = [
  'home',
  'accounts',
  'cards',
  'operations',
  'loans',
  'insurance',
  'pfm',
  'investments',
  'profile',
]
export const defaultRoot = fileURLToPath(new URL('../../../', import.meta.url))
export const baselinePath = 'native-spike/fidelity/reference-baseline.json'
const uiRoot = 'src/experiences/pi/it/mobile-first'
export const requiredUiEntries = referenceAreas.map((area, index) => ({
  area,
  path: `${uiRoot}/${['MobileFirstHome', 'MobileFirstAccount', 'MobileFirstCards', 'MobileFirstOperations', 'MobileFirstLoans', 'MobileFirstInsurance', 'MobileFirstPfm', 'MobileFirstInvestments', 'MobileFirstProfile'][index]}.tsx`,
}))
const shared = [
  ['src/app/components/BottomSheet.tsx', 'ui'],
  ['src/app/components/contracts/bottomSheet.ts', 'ui'],
  ['src/app/components/contracts/bottomSheetWeb.ts', 'ui'],
  ['src/app/components/ui/ScrollableRegion.tsx', 'ui'],
  ['src/app/components/ui/keyboardActivation.ts', 'ui'],
  ['native-spike/assets/fonts/UniCredit-regular.ttf', 'font'],
  ['native-spike/assets/fonts/UniCredit-bold.ttf', 'font'],
]
const kinds = new Set(['ui', 'css', 'asset-map', 'asset', 'font'])
const modeFor = (kind) => (['ui', 'css', 'asset-map'].includes(kind) ? 'lf-text' : 'bytes')
const relativePath = (value) =>
  typeof value === 'string' &&
  value.length > 0 &&
  !value.includes('\\') &&
  !value.includes(':') &&
  !value.startsWith('/') &&
  value.split('/').every((segment) => segment && segment !== '.' && segment !== '..')
export async function referenceFile(root, relative) {
  if (!relativePath(relative)) throw new Error('Invalid reference path in manifest')
  const canonicalRoot = await realpath(root)
  const target = path.join(canonicalRoot, ...relative.split('/'))
  const canonicalTarget = await realpath(target)
  const relativeTarget = path.relative(canonicalRoot, canonicalTarget)
  if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget) || !(await lstat(target)).isFile())
    throw new Error(`Reference escapes checkout or is not a file: ${relative}`)
  return target
}
async function walk(root, relative) {
  const result = []
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    if (entry.isSymbolicLink())
      throw new Error(`Reference selection contains a symbolic link: ${relative}/${entry.name}`)
    const item = `${relative}/${entry.name}`
    if (entry.isDirectory()) result.push(...(await walk(root, item)))
    else if (entry.isFile()) result.push(item)
  }
  return result
}
function areasFor(name) {
  const lower = name.toLowerCase()
  for (const [match, area] of [
    ['account', 'accounts'],
    ['card', 'cards'],
    ['operation', 'operations'],
    ['loan', 'loans'],
    ['insurance', 'insurance'],
    ['pfm', 'pfm'],
    ['investment', 'investments'],
    ['profile', 'profile'],
  ])
    if (lower.includes(match)) return [area]
  if (['home', 'search', 'category', 'products'].some((match) => lower.includes(match))) return ['home']
  return [...referenceAreas]
}
export async function collectReferenceSelection(root, requireEntries = true) {
  const entries = []
  for (const relative of await walk(root, uiRoot)) {
    const file = path.basename(relative)
    const kind = file.endsWith('.css')
      ? 'css'
      : file.endsWith('.tsx')
        ? 'ui'
        : /Assets\.ts$/i.test(file)
          ? 'asset-map'
          : null
    if (kind) entries.push({ path: relative, kind, areas: areasFor(file) })
  }
  for (const relative of await walk(root, 'src/assets/mobile-first/it')) {
    const assetPath = relative.slice('src/assets/mobile-first/it/'.length)
    const folder = assetPath.split('/')[0]
    entries.push({
      path: relative,
      kind: 'asset',
      areas: assetPath.includes('/') ? areasFor(folder) : [...referenceAreas],
    })
  }
  for (const relative of await walk(root, 'src/styles'))
    if (relative.endsWith('.css')) entries.push({ path: relative, kind: 'css', areas: [...referenceAreas] })
  for (const [relative, kind] of shared) entries.push({ path: relative, kind, areas: [...referenceAreas] })
  if (requireEntries)
    for (const entry of requiredUiEntries)
      if (!entries.some((item) => item.path === entry.path))
        throw new Error(`Required Source UI reference missing: ${entry.path}`)
  return entries.sort((a, b) => a.path.localeCompare(b.path, 'en'))
}
export async function referenceHash(root, reference) {
  const file = await referenceFile(root, reference.path)
  const bytes = await readFile(file)
  const content =
    modeFor(reference.kind) === 'lf-text' ? Buffer.from(bytes.toString('utf8').replace(/\r\n?/g, '\n')) : bytes
  return { sha256: createHash('sha256').update(content).digest('hex'), contentBytes: content.length }
}
export function validateManifest(manifest) {
  if (
    !manifest ||
    manifest.schemaVersion !== 1 ||
    manifest.policy !== 'italy-source-ui-v1' ||
    manifest.visualAccepted !== false ||
    JSON.stringify(manifest.areas) !== JSON.stringify(referenceAreas) ||
    typeof manifest.recordedBy !== 'string' ||
    !manifest.recordedBy.trim() ||
    typeof manifest.reason !== 'string' ||
    !manifest.reason.trim() ||
    typeof manifest.baseCommit !== 'string' ||
    !/^[a-f0-9]{40}$/.test(manifest.baseCommit) ||
    typeof manifest.recordedAt !== 'string' ||
    !Number.isFinite(Date.parse(manifest.recordedAt)) ||
    !Array.isArray(manifest.references) ||
    !manifest.references.length
  )
    throw new Error('Invalid or incomplete reference manifest')
  const paths = new Set()
  const covered = new Set()
  for (const reference of manifest.references) {
    if (
      !reference ||
      !relativePath(reference.path) ||
      paths.has(reference.path) ||
      !kinds.has(reference.kind) ||
      reference.hashMode !== modeFor(reference.kind) ||
      !/^[a-f0-9]{64}$/.test(reference.sha256 ?? '') ||
      !Number.isSafeInteger(reference.contentBytes) ||
      reference.contentBytes < 0 ||
      !Array.isArray(reference.areas) ||
      !reference.areas.length ||
      new Set(reference.areas).size !== reference.areas.length ||
      reference.areas.some((area) => !referenceAreas.includes(area))
    )
      throw new Error('Invalid, duplicate or unsafe reference in manifest')
    paths.add(reference.path)
    reference.areas.forEach((area) => covered.add(area))
  }
  if (covered.size !== referenceAreas.length || requiredUiEntries.some((entry) => !paths.has(entry.path)))
    throw new Error('Reference manifest omits a mapped Source area')
  return manifest
}
export async function checkReference({ root = defaultRoot, manifest }) {
  validateManifest(manifest)
  const stale = [],
    missing = [],
    added = [],
    selectionMismatch = []
  for (const reference of manifest.references) {
    try {
      const current = await referenceHash(root, reference)
      if (current.sha256 !== reference.sha256 || current.contentBytes !== reference.contentBytes)
        stale.push({
          path: reference.path,
          areas: reference.areas,
          expectedSha256: reference.sha256,
          actualSha256: current.sha256,
        })
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      missing.push({ path: reference.path, areas: reference.areas })
    }
  }
  const currentSelection = await collectReferenceSelection(root, false)
  const saved = new Map(manifest.references.map((item) => [item.path, item]))
  const current = new Map(currentSelection.map((item) => [item.path, item]))
  for (const item of currentSelection) {
    const recorded = saved.get(item.path)
    if (!recorded) added.push(item)
    else if (recorded.kind !== item.kind || JSON.stringify(recorded.areas) !== JSON.stringify(item.areas))
      selectionMismatch.push(item.path)
  }
  for (const item of manifest.references)
    if (!current.has(item.path) && !missing.some((entry) => entry.path === item.path)) selectionMismatch.push(item.path)
  return {
    ok: !stale.length && !missing.length && !added.length && !selectionMismatch.length,
    visualAccepted: false,
    checked: manifest.references.length,
    stale,
    missing,
    added,
    selectionMismatch,
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const { values } = parseArgs({ options: { root: { type: 'string' }, manifest: { type: 'string' } } })
    const root = path.resolve(values.root ?? defaultRoot)
    const manifest = JSON.parse(await readFile(await referenceFile(root, values.manifest ?? baselinePath), 'utf8'))
    const result = await checkReference({ root, manifest })
    console.log(JSON.stringify(result, null, 2))
    process.exitCode = result.ok ? 0 : 1
  } catch (error) {
    console.error(`Reference guard failed closed: ${error.message}`)
    process.exitCode = 2
  }
}
