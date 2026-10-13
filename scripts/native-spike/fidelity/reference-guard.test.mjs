import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { checkReference, referenceAreas, requiredUiEntries } from './check-reference.mjs'
import { recordReference } from './record-reference.mjs'

async function cleanupFixture(parent, root) {
  const resolved = await realpath(root)
  if (path.dirname(resolved) !== parent || !path.basename(resolved).startsWith('cee-reference-'))
    throw new Error('Fixture cleanup target escaped its allocated temporary directory')
  await rm(resolved, { recursive: true, force: true })
}

async function fixture(run) {
  const parent = await realpath(tmpdir())
  const root = await mkdtemp(path.join(parent, 'cee-reference-'))
  const put = async (relative, content = 'reference\n') => {
    const target = path.join(root, relative)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, content)
  }
  try {
    for (const entry of requiredUiEntries) await put(entry.path)
    await put('src/styles/index.css')
    await put('src/styles/fonts.css')
    await put('src/assets/mobile-first/it/profile/icon.svg', '<svg/>\n')
    await put('native-spike/assets/fonts/UniCredit-regular.ttf', Buffer.from([0, 1, 2, 3]))
    await put('native-spike/assets/fonts/UniCredit-bold.ttf', Buffer.from([0, 1, 2, 4]))
    await put('src/app/components/BottomSheet.tsx')
    await put('src/app/components/ui/ScrollableRegion.tsx')
    await put('src/app/components/ui/keyboardActivation.ts')
    const capture = () =>
      recordReference({
        root,
        reviewedCapture: true,
        recordedBy: 'fixture-reviewer',
        reason: 'Reviewed reference selection; no visual acceptance',
        baseCommit: 'a'.repeat(40),
      })
    await run({ root, put, capture })
  } finally {
    await cleanupFixture(parent, root)
  }
}

test('reviewed capture hashes all nine reference areas without granting visual acceptance', async () =>
  fixture(async ({ root, capture }) => {
    const manifest = await capture()
    assert.deepEqual(manifest.areas, referenceAreas)
    assert.equal(manifest.visualAccepted, false)
    assert.equal((await checkReference({ root, manifest })).ok, true)
    assert.match(manifest.references[0].sha256, /^[a-f0-9]{64}$/)
  }))

test('capture requires an explicit reviewed request and provenance', async () =>
  fixture(async ({ root }) => {
    await assert.rejects(() => recordReference({ root }), /explicit.*reviewed/i)
    await assert.rejects(() => recordReference({ root, reviewedCapture: true }), /recordedBy|reason|baseCommit/)
  }))

test('UI and shared CSS changes identify stale native reference areas', async () =>
  fixture(async ({ root, put, capture }) => {
    const manifest = await capture()
    await put(requiredUiEntries.find((entry) => entry.area === 'profile').path, 'changed profile\n')
    await put('src/styles/index.css', 'changed global CSS\n')
    const result = await checkReference({ root, manifest })
    assert.equal(result.ok, false)
    assert.equal(result.stale.length, 2)
    assert.deepEqual(result.stale.find((entry) => entry.path === 'src/styles/index.css').areas, referenceAreas)
    assert.deepEqual(result.stale.find((entry) => entry.path.includes('MobileFirstProfile')).areas, ['profile'])
  }))

test('original asset/font bytes are checked without conversion', async () =>
  fixture(async ({ root, put, capture }) => {
    const manifest = await capture()
    await put('src/assets/mobile-first/it/profile/icon.svg', '<svg>changed</svg>\n')
    await put('native-spike/assets/fonts/UniCredit-bold.ttf', Buffer.from([0, 1, 2, 9]))
    const result = await checkReference({ root, manifest })
    assert.equal(result.ok, false)
    assert.equal(result.stale.length, 2)
  }))

test('shared business model updates do not become visual reference blockers', async () =>
  fixture(async ({ root, put, capture }) => {
    const manifest = await capture()
    await put('src/features/profile/mobileFirstProfile.ts', 'updated business policy\n')
    assert.equal((await checkReference({ root, manifest })).ok, true)
  }))

test('text line-ending checkout changes preserve content identity', async () =>
  fixture(async ({ root, put, capture }) => {
    const manifest = await capture()
    await put(requiredUiEntries[0].path, 'reference\r\n')
    assert.equal((await checkReference({ root, manifest })).ok, true)
  }))

test('missing references and added UI/assets fail closed', async () =>
  fixture(async ({ root, put, capture }) => {
    const manifest = await capture()
    await rm(path.join(root, requiredUiEntries[0].path))
    await put('src/experiences/pi/it/mobile-first/MobileFirstProfileAdded.tsx')
    await put('src/assets/mobile-first/it/profile/added.svg')
    const result = await checkReference({ root, manifest })
    assert.equal(result.ok, false)
    assert.equal(result.missing.length, 1)
    assert.equal(result.added.length, 2)
  }))

test('malformed, incomplete and unsafe manifests reject before checking content', async () =>
  fixture(async ({ root, capture }) => {
    const valid = await capture()
    for (const malformed of [
      null,
      {},
      { ...valid, schemaVersion: 99 },
      { ...valid, recordedBy: 4 },
      { ...valid, visualAccepted: true },
      { ...valid, areas: ['profile'] },
      { ...valid, references: [] },
      { ...valid, references: [valid.references[0], valid.references[0]] },
      { ...valid, references: [{ ...valid.references[0], path: '../outside.tsx' }] },
      { ...valid, references: [{ ...valid.references[0], sha256: 'bogus' }] },
    ])
      await assert.rejects(() => checkReference({ root, manifest: malformed }), /manifest|reference/i)
  }))

test('manual CLI capture and read-only checker expose distinct success/drift/malformed exit states', async () =>
  fixture(async ({ root, put }) => {
    const record = fileURLToPath(new URL('./record-reference.mjs', import.meta.url))
    const check = fileURLToPath(new URL('./check-reference.mjs', import.meta.url))
    const execute = (script, args) =>
      execFileSync(process.execPath, [script, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    assert.match(
      execute(record, [
        '--root',
        root,
        '--reviewed-capture',
        '--owner',
        'fixture',
        '--reason',
        'Manual reviewed selection',
        '--base-commit',
        'a'.repeat(40),
      ]),
      /visualAccepted=false/,
    )
    assert.equal(JSON.parse(execute(check, ['--root', root])).ok, true)
    await put(requiredUiEntries[0].path, 'changed UI\n')
    assert.throws(
      () => execute(check, ['--root', root]),
      (error) => error.status === 1 && JSON.parse(error.stdout).stale.length === 1,
    )
    await put('native-spike/fidelity/reference-baseline.json', '{}')
    assert.throws(
      () => execute(check, ['--root', root]),
      (error) => error.status === 2 && /failed closed/.test(error.stderr),
    )
  }))

test('capture returns new data and never rewrites the source it records', async () =>
  fixture(async ({ root, capture }) => {
    const target = path.join(root, requiredUiEntries[0].path)
    const before = await readFile(target)
    const first = await capture()
    first.references[0].sha256 = 'b'.repeat(64)
    const second = await capture()
    assert.notEqual(second.references[0].sha256, first.references[0].sha256)
    assert.deepEqual(await readFile(target), before)
  }))

test('domain-specific search UI retains its mapped area while header Search belongs to Home', async () =>
  fixture(async ({ put, capture }) => {
    const investmentSearch = 'src/experiences/pi/it/mobile-first/MobileFirstInvestmentSecuritiesSearch.tsx'
    const headerSearch = 'src/experiences/pi/it/mobile-first/MobileFirstSearch.tsx'
    await put(investmentSearch)
    await put(headerSearch)
    const manifest = await capture()
    assert.deepEqual(manifest.references.find((entry) => entry.path === investmentSearch).areas, ['investments'])
    assert.deepEqual(manifest.references.find((entry) => entry.path === headerSearch).areas, ['home'])
  }))
