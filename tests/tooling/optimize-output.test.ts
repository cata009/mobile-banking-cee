import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { copyDeploymentPublic, optimizeOutput, rewriteAssetReferences } from '../../scripts/build-assets/optimize-output.mjs'

const temporary: string[] = []
async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'banking-output-'))
  temporary.push(root)
  await mkdir(path.join(root, 'assets'), { recursive: true })
  await mkdir(path.join(root, 'native-demo/assets'), { recursive: true })
  return root
}
afterEach(async () => { await Promise.all(temporary.splice(0).map(root => rm(root, { recursive: true, force: true }))) })

describe('deployment asset optimization', () => {
  it('rewrites executable asset URLs without modifying source export strings or unrelated literals', () => {
    const aliases = new Map([['assets/photo.png', 'native-demo/assets/shared.webp']])
    const original = 'import photo from "/assets/photo.png"'
    const source = `const image="/assets/photo.png";const original=${JSON.stringify(original)};const other="photo.png"`
    const rewritten = rewriteAssetReferences(source, 'assets/app.js', aliases)
    expect(rewritten).toContain('const image="/native-demo/assets/shared.webp"')
    expect(rewritten).toContain(`const original=${JSON.stringify(original)}`)
    expect(rewritten).toContain('const other="photo.png"')
    expect(rewriteAssetReferences('new URL("photo.png","https://external.example/")', 'assets/app.js', aliases))
      .toBe('new URL("photo.png","https://external.example/")')
    expect(rewriteAssetReferences('new URL("assets/photo.png",import.meta.url)', 'current-host.js', aliases))
      .toBe('new URL("native-demo/assets/shared.webp",import.meta.url)')
  })

  it('retains native self-contained paths and deduplicates only identical emitted assets', async () => {
    const root = await fixture()
    await writeFile(path.join(root, 'assets/mark.svg'), '<svg/>')
    await writeFile(path.join(root, 'native-demo/assets/mark.svg'), '<svg/>')
    await writeFile(path.join(root, 'assets/different.svg'), '<svg><path/></svg>')
    await writeFile(path.join(root, 'assets/app.js'), 'export const image="/assets/mark.svg"')
    await writeFile(path.join(root, 'native-demo/current-host.js'), 'export const image=new URL("assets/mark.svg",import.meta.url).href')
    const result = await optimizeOutput(root, { imageOptimizer: async (bytes: Buffer, extension: string) => ({ bytes, extension, changed: false }) })
    expect(result.duplicateFilesRemoved).toBe(1)
    expect(await readFile(path.join(root, 'assets/app.js'), 'utf8')).toContain('/native-demo/assets/mark.svg')
    expect(await readFile(path.join(root, 'native-demo/current-host.js'), 'utf8')).toContain('assets/mark.svg')
    expect(await readFile(path.join(root, 'assets/different.svg'), 'utf8')).toContain('<path/>')
    await expect(readFile(path.join(root, 'assets/mark.svg'))).rejects.toThrow()
  })

  it('rewrites CSS and HTML asset locations, preserving query and fragment suffixes', () => {
    const aliases = new Map([['assets/photo.png', 'assets/reduced.webp']])
    expect(rewriteAssetReferences('a{background:url("photo.png#frame")}', 'assets/app.css', aliases)).toContain('reduced.webp#frame')
    expect(rewriteAssetReferences('<img src="/assets/photo.png?size=2">', 'index.html', aliases)).toContain('/assets/reduced.webp?size=2')
  })

  it('copies approved public files but excludes local downloads without removing originals', async () => {
    const root = await fixture()
    const source = path.join(root, 'public')
    const output = path.join(root, 'output')
    await mkdir(path.join(source, 'downloads'), { recursive: true })
    await mkdir(path.join(source, 'audio'), { recursive: true })
    await writeFile(path.join(source, 'downloads/demo.apk'), 'original-apk')
    await writeFile(path.join(source, 'audio/prime.mp3'), 'original-audio')
    await copyDeploymentPublic(source, output)
    expect(await readFile(path.join(output, 'audio/prime.mp3'), 'utf8')).toBe('original-audio')
    expect(await readFile(path.join(source, 'downloads/demo.apk'), 'utf8')).toBe('original-apk')
    await expect(readFile(path.join(output, 'downloads/demo.apk'))).rejects.toThrow()
  })

  it('fails the build when an executable resource URL would be missing', async () => {
    const root = await fixture()
    await writeFile(path.join(root, 'assets/app.js'), 'export const image="/assets/missing.png"')
    await expect(optimizeOutput(root, { imageOptimizer: async (bytes: Buffer, extension: string) => ({ bytes, extension, changed: false }) }))
      .rejects.toThrow('Missing optimized asset')
  })

  it('rewrites native-relative converted assets and produces a stable second pass', async () => {
    const root = await fixture()
    await writeFile(path.join(root, 'native-demo/assets/photo.png'), 'uncompressed-fixture')
    await writeFile(path.join(root, 'native-demo/current-host.js'), 'export const image=new URL("assets/photo.png",import.meta.url).href')
    const imageOptimizer = async (_bytes: Buffer, _extension: string) => ({ bytes: Buffer.from('small'), extension: '.webp', changed: true, proof: { equalPixels: true } })
    const first = await optimizeOutput(root, { imageOptimizer })
    expect(first.optimizedImages).toBe(1)
    expect(await readFile(path.join(root, 'native-demo/current-host.js'), 'utf8')).toMatch(/new URL\("assets\/lossless-[a-f\d]+\.webp",import.meta.url\)/)
    const second = await optimizeOutput(root, { imageOptimizer })
    expect(second.savedBytes).toBe(0)
    expect(second.optimizedImages).toBe(0)
  })

  it('keeps public artwork routes and original source-export payloads byte-identical', async () => {
    const root = await fixture()
    await mkdir(path.join(root, 'assets/investments'), { recursive: true })
    await writeFile(path.join(root, 'assets/investments/sign.svg'), '<svg/>')
    await writeFile(path.join(root, 'native-demo/assets/mark.svg'), '<svg/>')
    const original = 'export const rawSource="/assets/investments/sign.svg"'
    await writeFile(path.join(root, 'assets/source-export.js'), original)
    await optimizeOutput(root, {
      protectedPaths: ['assets/investments/sign.svg', 'assets/source-export.js'],
      imageOptimizer: async (bytes: Buffer, extension: string) => ({ bytes, extension, changed: false }),
    })
    expect(await readFile(path.join(root, 'assets/investments/sign.svg'), 'utf8')).toBe('<svg/>')
    expect(await readFile(path.join(root, 'assets/source-export.js'), 'utf8')).toBe(original)
  })

  it('rejects unsafe optimizer extensions before writing outside an emitted asset folder', async () => {
    const root = await fixture()
    await writeFile(path.join(root, 'assets/photo.png'), 'fixture')
    await expect(optimizeOutput(root, {
      imageOptimizer: async () => ({ bytes: Buffer.from('x'), extension: '/../escape', changed: true }),
    })).rejects.toThrow('Invalid lossless optimizer result')
    expect(await readFile(path.join(root, 'assets/photo.png'), 'utf8')).toBe('fixture')
  })
})
