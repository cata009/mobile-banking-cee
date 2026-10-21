import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseAst } from 'rollup/parseAst'

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.svg'])
const assetExtensions = new Set([...imageExtensions, '.webp', '.avif', '.gif', '.ttf', '.woff', '.woff2'])
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const normalize = value => value.replaceAll('\\', '/')

async function inventory(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true })
  const result = []
  for (const entry of entries) {
    if (entry.isSymbolicLink()) throw new Error('Build output must not contain symlinks')
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...await inventory(root, full))
    else result.push(normalize(path.relative(root, full)))
  }
  return result.sort()
}

/** Public downloads are operator-owned Android binaries, never web deployment input. */
export async function copyDeploymentPublic(source, output) {
  const copied = []
  async function copy(directory, relative = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (!relative && entry.name === 'downloads') continue
      if (entry.isSymbolicLink()) throw new Error('Public deployment input must not contain symlinks')
      const child = path.join(relative, entry.name)
      if (entry.isDirectory()) await copy(path.join(directory, entry.name), child)
      else {
        const bytes = await readFile(path.join(source, child))
        copied.push(normalize(child))
        const destination = path.join(output, child)
        await mkdir(path.dirname(destination), { recursive: true })
        try {
          const existing = await readFile(destination)
          if (!existing.equals(bytes)) throw new Error(`Public file conflicts with emitted asset: ${child}`)
        } catch (error) {
          if (error.code !== 'ENOENT') throw error
          await writeFile(destination, bytes)
        }
      }
    }
  }
  await copy(source)
  return copied
}

function isModuleAssetUrl(parent, node) {
  const base = parent?.arguments?.[1]
  return parent?.type === 'NewExpression' && parent.callee?.name === 'URL' && parent.arguments?.[0] === node &&
    base?.type === 'MemberExpression' && base.property?.name === 'url' && base.object?.type === 'MetaProperty' &&
    base.object.meta?.name === 'import' && base.object.property?.name === 'meta'
}

function replacementUrl(value, file, aliases) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) return value
  const suffixIndex = value.search(/[?#]/)
  const pathname = suffixIndex < 0 ? value : value.slice(0, suffixIndex)
  const suffix = suffixIndex < 0 ? '' : value.slice(suffixIndex)
  const absolute = pathname.startsWith('/')
  const resolved = absolute ? pathname.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(file), pathname))
  const target = aliases.get(resolved)
  if (!target || target === resolved) return value
  let rewritten = absolute ? `/${target}` : path.posix.relative(path.posix.dirname(file), target)
  if (!absolute && pathname.startsWith('./') && !rewritten.startsWith('.')) rewritten = `./${rewritten}`
  return rewritten + suffix
}

async function assertReferencesExist(root, files, aliases) {
  const existing = new Set(files)
  // Identity mappings let the same URL parser validate every emitted local asset.
  const identity = new Map([...aliases.values()].map(file => [file, file]))
  for (const file of files.filter(file => /\.(?:m?js|css|html)$/.test(file))) {
    const source = await readFile(path.join(root, file), 'utf8')
    const urls = []
    if (/\.m?js$/.test(file)) {
      function visit(node, parent) {
        if (!node || typeof node !== 'object') return
        if (node.type === 'Literal' && typeof node.value === 'string') {
          if (node.value.startsWith('/assets/') || node.value.startsWith('/native-demo/assets/') ||
              isModuleAssetUrl(parent, node)) urls.push(node.value)
        }
        for (const value of Object.values(node)) {
          if (Array.isArray(value)) value.forEach(child => visit(child, node))
          else if (value && typeof value === 'object') visit(value, node)
        }
      }
      visit(parseAst(source))
    } else {
      const pattern = file.endsWith('.css') ? /url\(\s*["']?([^)"']+)/g : /\b(?:src|href)=["']([^"']+)/g
      urls.push(...[...source.matchAll(pattern)].map(match => match[1]))
    }
    for (const url of urls) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) continue
      const pathname = url.split(/[?#]/)[0]
      if (!assetExtensions.has(path.posix.extname(pathname))) continue
      const resolved = pathname.startsWith('/') ? pathname.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(file), pathname))
      if ((resolved.startsWith('assets/') || resolved.startsWith('native-demo/assets/') || identity.has(resolved)) && !existing.has(resolved)) {
        throw new Error(`Missing optimized asset referenced by ${file}: ${url}`)
      }
    }
  }
}

/** Only whole URL literals are changed; embedded source/ZIP text is never searched/replaced. */
export function rewriteAssetReferences(source, file, aliases) {
  const extension = path.posix.extname(file)
  if (extension === '.js' || extension === '.mjs') {
    const edits = []
    function visit(node, parent) {
      if (!node || typeof node !== 'object') return
      if (node.type === 'Literal' && typeof node.value === 'string') {
        const isModuleUrl = isModuleAssetUrl(parent, node)
        const next = node.value.startsWith('/') || isModuleUrl ? replacementUrl(node.value, file, aliases) : node.value
        if (next !== node.value) edits.push({ start: node.start, end: node.end, text: JSON.stringify(next) })
      }
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(child => visit(child, node))
        else if (value && typeof value === 'object') visit(value, node)
      }
    }
    visit(parseAst(source))
    for (const edit of edits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end)
    return source
  }
  if (extension === '.css') return source.replace(/url\(\s*(["']?)([^)"']+)\1\s*\)/g, (match, quote, url) => {
    const next = replacementUrl(url, file, aliases)
    return next === url ? match : `url(${quote}${next}${quote})`
  })
  if (extension === '.html') return source.replace(/\b(src|href)=(['"])(.*?)\2/g, (match, attribute, quote, url) => {
    const next = replacementUrl(url, file, aliases)
    return next === url ? match : `${attribute}=${quote}${next}${quote}`
  })
  return source
}

export async function optimizeOutput(root, options = {}) {
  root = path.resolve(root)
  const imageOptimizer = options.imageOptimizer ?? (await import('./lossless-images.mjs')).optimizeLosslessImage
  const cacheVersion = options.cacheDirectory ? hash(await readFile(new URL('./lossless-images.mjs', import.meta.url))) : ''
  const protectedPaths = new Set(options.protectedPaths ?? [])
  function validateResult(result) {
    if (typeof result.changed !== 'boolean' || !['.png', '.jpg', '.jpeg', '.svg', '.webp', '.avif', '.gif', '.ttf', '.woff', '.woff2'].includes(result.extension) || !Buffer.isBuffer(result.bytes)) {
      throw new Error('Invalid lossless optimizer result')
    }
    return result
  }
  async function optimizeCached(bytes, extension) {
    if (!options.cacheDirectory) return validateResult(await imageOptimizer(bytes, extension))
    await mkdir(options.cacheDirectory, { recursive: true })
    const key = hash(Buffer.concat([Buffer.from(cacheVersion + extension), bytes]))
    const metadataFile = path.join(options.cacheDirectory, key + '.json')
    const binaryFile = path.join(options.cacheDirectory, key + '.bin')
    try {
      const metadata = JSON.parse(await readFile(metadataFile, 'utf8'))
      const cachedBytes = metadata.changed ? await readFile(binaryFile) : bytes
      if (metadata.sha256 === hash(cachedBytes)) return validateResult({ ...metadata, bytes: cachedBytes })
    } catch (error) {
      if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error
    }
    const result = validateResult(await imageOptimizer(bytes, extension))
    if (result.changed) await writeFile(binaryFile, result.bytes)
    await writeFile(metadataFile, JSON.stringify({ extension: result.extension, changed: result.changed, proof: result.proof, sha256: hash(result.bytes) }))
    return result
  }
  const files = await inventory(root)
  const groups = new Map()
  let beforeBytes = 0
  for (const file of files) {
    const bytes = await readFile(path.join(root, file))
    beforeBytes += bytes.length
    if (!assetExtensions.has(path.extname(file))) continue
    if (protectedPaths.has(file)) continue
    // Only emitted assets: public source packages and original exports stay intact.
    if (!file.startsWith('assets/') && !file.startsWith('native-demo/assets/')) continue
    const key = `${path.extname(file)}:${hash(bytes)}`
    const group = groups.get(key) ?? { bytes, paths: [] }
    group.paths.push(file)
    groups.set(key, group)
  }
  const aliases = new Map()
  const remove = new Set()
  const proofs = []
  let duplicateFilesRemoved = 0
  for (const group of groups.values()) {
    // Keep the independent Native artifact self-contained; Source can use its shared assets.
    const canonical = group.paths.find(file => file.startsWith('native-demo/assets/')) ?? group.paths[0]
    const extension = path.extname(canonical)
    let optimized = { bytes: group.bytes, extension, changed: false }
    if (imageExtensions.has(extension)) optimized = await optimizeCached(group.bytes, extension)
    const destination = optimized.changed
      ? `${path.posix.dirname(canonical)}/lossless-${hash(optimized.bytes).slice(0, 24)}${optimized.extension}`
      : canonical
    if (optimized.changed) {
      const target = path.resolve(root, destination)
      if (!target.startsWith(root + path.sep)) throw new Error('Asset write escaped build output')
      await writeFile(target, optimized.bytes)
      proofs.push({ source: canonical, destination, ...optimized.proof })
    }
    for (const file of group.paths) {
      aliases.set(file, destination)
      if (file !== destination) remove.add(file)
    }
    duplicateFilesRemoved += group.paths.length - 1
  }
  for (const file of files.filter(file => /\.(?:m?js|css|html)$/.test(file))) {
    if (protectedPaths.has(file)) continue
    const full = path.join(root, file)
    const source = await readFile(full, 'utf8')
    const rewritten = rewriteAssetReferences(source, file, aliases)
    if (rewritten !== source) await writeFile(full, rewritten)
  }
  for (const file of remove) {
    const full = path.resolve(root, file)
    if (!full.startsWith(root + path.sep)) throw new Error('Asset cleanup escaped build output')
    await unlink(full)
  }
  let afterBytes = 0
  const finalFiles = await inventory(root)
  await assertReferencesExist(root, finalFiles, aliases)
  for (const file of finalFiles) afterBytes += (await readFile(path.join(root, file))).length
  return { beforeBytes, afterBytes, savedBytes: beforeBytes - afterBytes, duplicateFilesRemoved, optimizedImages: proofs.length, proofs }
}
