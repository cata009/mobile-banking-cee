import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createPiReferenceArchive,
  finalizePiReferenceArchive,
  rebuildPiReferenceArchive,
  verifyPiReferenceArchive,
} from '../../scripts/native-spike/archive-pi-reference.mjs'

const temporaryDirectories: string[] = []

async function temporaryDirectory(prefix: string) {
  const directory = await mkdtemp(path.join(os.tmpdir(), prefix))
  temporaryDirectories.push(directory)
  return directory
}

async function put(root: string, relativePath: string, content: string | Buffer) {
  const file = path.join(root, ...relativePath.split('/'))
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, content)
}

async function putExternalSourceDependencies(root: string, includeFigmaPlugin = true) {
  await put(root, 'screenshots/account.png', 'Source screenshot asset')
  if (includeFigmaPlugin) {
    await put(root, 'screenshots/FIgma plugins/plugin-export.js', 'private Figma plugin export')
  }
  await put(root, 'package/mobile-pi-coapping-chat-package/package.json', '{}')
  await put(root, 'package/mobile-pi-coapping-chat-package/src/index.ts', 'export const SourceChat = true')
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('PI reference archive', () => {
  it('copies the Source runtime and records hashes while excluding Native UI, secrets, and private artifacts', async () => {
    const temp = await temporaryDirectory('pi-reference-archive-')
    const root = path.join(temp, 'checkout')
    const destination = path.join(temp, 'archive')
    await mkdir(root, { recursive: true })
    await put(root, 'package.json', JSON.stringify({ type: 'module', scripts: { dev: 'vite' } }))
    await put(root, 'package-lock.json', JSON.stringify({ lockfileVersion: 3, packages: {} }))
    await put(root, 'index.html', '<html><div id="root"></div></html>')
    await put(root, 'tsconfig.json', JSON.stringify({ compilerOptions: { strict: true } }))
    await put(root, 'src/main.tsx', 'export const sourceEntry = true')
    await put(root, 'src/app/AppScreenRouter.tsx', 'export const sourceRouter = true')
    await put(root, 'src/app/components/demo/NativeDemoSurface.tsx', 'export const sourceBridgeFallback = true')
    await put(root, 'src/assets/source.svg', '<svg/>')
    await put(root, 'public/favicon.svg', '<svg/>')
    await put(root, 'public/native-demo/current-host.js', 'window.nativeDemo = true')
    await put(root, 'public/downloads/demo.apk', Buffer.from([1, 2, 3]))
    await put(root, 'public/.well-known/assetlinks.json', '[]')
    await putExternalSourceDependencies(root)
    await put(root, 'native-spike/src/experiences/pi/current/NativeCurrentApp.tsx', 'export const nativeUi = true')
    await put(root, '.codex-temp/private-evidence.json', '{}')
    await put(root, '.env', 'PRIVATE_TOKEN=secret')
    await put(root, 'src/private/client.key', 'secret')
    await put(root, 'node_modules/react/index.js', 'module.exports = {}')
    await put(root, '.git/config', '[core]')

    const result = await createPiReferenceArchive({ root, destination, buildSource: false })
    const paths = result.manifest.files.map((file: { path: string }) => file.path)

    expect(paths).toEqual(expect.arrayContaining([
      'package.json',
      'package-lock.json',
      'index.html',
      'src/main.tsx',
      'src/app/AppScreenRouter.tsx',
      'src/app/components/demo/NativeDemoSurface.tsx',
      'src/assets/source.svg',
      'public/favicon.svg',
      'screenshots/account.png',
      'package/mobile-pi-coapping-chat-package/package.json',
      'package/mobile-pi-coapping-chat-package/src/index.ts',
      'vite.config.reference.mjs',
      'README.reference.md',
    ]))
    expect(paths.some((file: string) => /(^|\/)(native-spike|native-demo|downloads|node_modules|\.git|\.codex-temp|figma plugins)(\/|$)/i.test(file))).toBe(false)
    expect(paths.some((file: string) => /(^|\/)\.env(?:\.|$)|\.(?:key|pem|p12|pfx|keystore|jks)$/i.test(file))).toBe(false)
    expect(result.manifest.referenceMode.query).toBe('?renderer=reference')
    expect(result.manifest.referenceMode.nativeBridgeEnabled).toBe(false)
    expect(result.manifest.referenceMode.viteConfig).toBe('vite.config.reference.mjs')
    expect(result.manifest.referenceMode.localPasswordEnvironmentVariable).toBe('VITE_LOCAL_ACCESS_PASSWORD')
    await expect(readFile(path.join(destination, 'index.html'), 'utf8')).resolves.not.toMatch(/native-demo-module/i)
    expect(result.verification.valid).toBe(true)
    expect((await verifyPiReferenceArchive(destination)).valid).toBe(true)
  })

  it('uses an exact archived router-before override and rejects an incorrect before hash', async () => {
    const temp = await temporaryDirectory('pi-reference-router-')
    const root = path.join(temp, 'checkout')
    const destination = path.join(temp, 'archive')
    const before = path.join(temp, 'router-before.tsx')
    await mkdir(root, { recursive: true })
    await mkdir(path.join(root, 'public'), { recursive: true })
    await put(root, 'package.json', '{}')
    await put(root, 'package-lock.json', '{}')
    await put(root, 'index.html', '<html><div id="root"></div></html>')
    await put(root, 'src/main.tsx', 'export const sourceEntry = true')
    await putExternalSourceDependencies(root)
    await put(root, 'src/app/AppScreenRouter.tsx', 'new router contents')
    await writeFile(before, 'frozen router contents')
    const beforeHash = createHash('sha256').update('frozen router contents').digest('hex')

    await expect(createPiReferenceArchive({
      root,
      destination,
      buildSource: false,
      sourceOverrides: [{ archivePath: 'src/app/AppScreenRouter.tsx', sourcePath: before, expectedSha256: beforeHash }],
    })).resolves.toMatchObject({ verification: { valid: true } })
    await expect(readFile(path.join(destination, 'src/app/AppScreenRouter.tsx'), 'utf8')).resolves.toBe('frozen router contents')
    await expect(createPiReferenceArchive({
      root,
      destination: path.join(temp, 'bad-archive'),
      buildSource: false,
      sourceOverrides: [{ archivePath: 'src/app/AppScreenRouter.tsx', sourcePath: before, expectedSha256: '0'.repeat(64) }],
    })).rejects.toThrow(/before.*hash/i)
  })

  it('rejects an archive destination inside the checkout and never overwrites an existing archive', async () => {
    const temp = await temporaryDirectory('pi-reference-destination-')
    const root = path.join(temp, 'checkout')
    await mkdir(root, { recursive: true })
    await mkdir(path.join(root, 'public'), { recursive: true })
    await put(root, 'package.json', '{}')
    await put(root, 'package-lock.json', '{}')
    await put(root, 'index.html', '<html><div id="root"></div></html>')
    await put(root, 'src/main.tsx', 'export const sourceEntry = true')
    await putExternalSourceDependencies(root)

    await expect(createPiReferenceArchive({
      root,
      destination: path.join(root, 'archive'),
      buildSource: false,
    })).rejects.toThrow(/outside.*checkout/i)
    const destination = path.join(temp, 'archive')
    await createPiReferenceArchive({ root, destination, buildSource: false })
    await expect(createPiReferenceArchive({ root, destination, buildSource: false })).rejects.toThrow(/already exists/i)
  })

  it('detects a changed file after the archive hash manifest is written', async () => {
    const temp = await temporaryDirectory('pi-reference-integrity-')
    const root = path.join(temp, 'checkout')
    const destination = path.join(temp, 'archive')
    await mkdir(root, { recursive: true })
    await mkdir(path.join(root, 'public'), { recursive: true })
    await put(root, 'package.json', '{}')
    await put(root, 'package-lock.json', '{}')
    await put(root, 'index.html', '<html><div id="root"></div></html>')
    await put(root, 'src/main.tsx', 'export const sourceEntry = true')
    await putExternalSourceDependencies(root)

    await createPiReferenceArchive({ root, destination, buildSource: false })
    await writeFile(path.join(destination, 'src/main.tsx'), 'tampered')

    const verification = await verifyPiReferenceArchive(destination)
    expect(verification.valid).toBe(false)
    expect(verification.hashMismatches).toContain('src/main.tsx')
  })

  it('finalizes an already-captured external Source copy without replacing its source bytes', async () => {
    const temp = await temporaryDirectory('pi-reference-finalize-')
    const workspace = path.join(temp, 'workspace')
    const archive = path.join(temp, 'archive')
    await mkdir(workspace, { recursive: true })
    await put(archive, 'package.json', '{}')
    await put(archive, 'package-lock.json', '{}')
    await put(archive, 'index.html', '<html><div id="root"></div></html>')
    await put(archive, 'src/main.tsx', 'frozen source entry')
    await putExternalSourceDependencies(archive, false)
    const beforeHash = createHash('sha256').update('frozen source entry').digest('hex')

    const result = await finalizePiReferenceArchive({
      archiveDirectory: archive,
      workspaceRoot: workspace,
      buildSource: false,
      protectedInputs: false,
    })

    expect(result.verification.valid).toBe(true)
    expect(await readFile(path.join(archive, 'src/main.tsx'), 'utf8')).toBe('frozen source entry')
    expect((await verifyPiReferenceArchive(archive)).valid).toBe(true)
    expect(result.manifest.files.find((file: { path: string }) => file.path === 'src/main.tsx')?.sha256).toBe(beforeHash)
  })

  it('rebuilds only archive assets and the manifest while retaining copied Source bytes', async () => {
    const temp = await temporaryDirectory('pi-reference-rebuild-')
    const root = path.join(temp, 'checkout')
    const destination = path.join(temp, 'archive')
    const envDir = path.join(temp, 'original-source-env')
    await mkdir(root, { recursive: true })
    await mkdir(envDir, { recursive: true })
    await mkdir(path.join(root, 'public'), { recursive: true })
    await put(root, 'package.json', '{}')
    await put(root, 'package-lock.json', '{}')
    await put(root, 'index.html', '<html><div id="root"></div></html>')
    await put(root, 'src/main.tsx', 'frozen Source bytes')
    await putExternalSourceDependencies(root, false)
    await createPiReferenceArchive({ root, destination, buildSource: false })

    const oldManifestHash = createHash('sha256').update(await readFile(path.join(destination, 'archive-manifest.json'))).digest('hex')
    const oldSourceHash = createHash('sha256').update(await readFile(path.join(destination, 'src/main.tsx'))).digest('hex')
    let receivedEnvDir = ''
    const result = await rebuildPiReferenceArchive({
      archiveDirectory: destination,
      workspaceRoot: root,
      envDir,
      buildSource: true,
      requireLocalAccess: false,
      protectedInputs: false,
      buildRunner: async ({ stageRoot, envDir: suppliedEnvDir }: { stageRoot: string; envDir: string }) => {
        receivedEnvDir = suppliedEnvDir
        const buildDir = path.join(stageRoot, 'reference-build')
        await mkdir(path.join(buildDir, 'assets'), { recursive: true })
        await writeFile(path.join(buildDir, 'index.html'), '<html><script type="module" src="/reference-build/assets/app.js"></script></html>')
        await writeFile(path.join(buildDir, 'assets', 'app.js'), 'Source-only rebuilt bundle')
      },
    })

    expect(receivedEnvDir).toBe(envDir)
    expect(createHash('sha256').update(await readFile(path.join(destination, 'src/main.tsx'))).digest('hex')).toBe(oldSourceHash)
    expect(await readFile(path.join(destination, 'reference-build/assets/app.js'), 'utf8')).toBe('Source-only rebuilt bundle')
    expect(createHash('sha256').update(await readFile(path.join(destination, 'archive-manifest.json'))).digest('hex')).not.toBe(oldManifestHash)
    expect(result.verification.valid).toBe(true)
    expect((await verifyPiReferenceArchive(destination)).valid).toBe(true)
  })
})
