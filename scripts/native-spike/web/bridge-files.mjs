import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

export function bridgeAssetPath(root, requestPath) {
  let relative
  try {
    relative = decodeURIComponent(requestPath.split('?')[0]).replace(/^\/native-demo\//, '')
  } catch {
    return null
  }
  if (relative === requestPath || !relative || relative.includes('\\') || relative.includes('\0')) return null
  const target = path.resolve(root, relative)
  if (!target.startsWith(path.resolve(root) + path.sep)) return null
  // A lexical path can still escape through a directory junction in development output.
  if (existsSync(root) && existsSync(target)) {
    const realRoot = realpathSync(root),
      realTarget = realpathSync(target)
    if (!realTarget.startsWith(realRoot + path.sep)) return null
  }
  return target
}

function files(root, folder = root) {
  return readdirSync(folder, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(folder, entry.name)
      if (entry.isSymbolicLink()) throw new Error('Native Web artifacts cannot be symlinks')
      return entry.isDirectory() ? files(root, full) : [path.relative(root, full).replaceAll('\\', '/')]
    })
    .filter((file) => file !== 'manifest.json')
}

export function writeBridgeManifest(directory) {
  if (!existsSync(path.join(directory, 'current-host.js'))) throw new Error('Native Web entry missing')
  const inventory = files(directory)
    .sort()
    .map((file) => ({
      file,
      sha256: createHash('sha256')
        .update(readFileSync(path.join(directory, file)))
        .digest('hex'),
    }))
  const buildId = createHash('sha256').update(JSON.stringify(inventory)).digest('hex')
  const manifest = {
    version: 1,
    buildId,
    entry: 'current-host.js',
    css: inventory.filter((item) => item.file.endsWith('.css') && !item.file.includes('/')).map((item) => item.file),
    files: inventory,
  }
  writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  return manifest
}

export async function ensureNativeWebDependencies(root) {
  const native = path.join(root, 'native-spike')
  if (existsSync(path.join(native, 'node_modules/vite/bin/vite.js'))) return
  await run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci', '--include=dev', '--no-audit', '--no-fund'], {
    cwd: native,
    shell: process.platform === 'win32',
  })
}

export function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', windowsHide: true, ...options })
    child.on('error', reject)
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`Build command failed (${code})`))))
  })
}

export function nativeBridgePlugin(root) {
  const output = path.join(root, 'native-spike/dist-host')
  let watching
  let timer
  const stopWatching = () => {
    clearTimeout(timer)
    watching?.kill()
    watching = undefined
  }
  return {
    name: 'shared-native-demo-artifact',
    closeBundle: stopWatching,
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { name: 'native-demo-module', content: '/native-demo/current-host.js' },
          injectTo: 'head',
        },
      ]
    },
    async configureServer(server) {
      // SSR-only audit servers do not serve the demo and must not mutate its live artifacts.
      if (server.config.server.middlewareMode) return
      await ensureNativeWebDependencies(root)
      mkdirSync(output, { recursive: true })
      // A separate production-mode watch build keeps React19 out of the shell's React18 graph.
      watching = spawn(
        process.execPath,
        [
          path.join(root, 'native-spike/node_modules/vite/bin/vite.js'),
          'build',
          '--watch',
          '--config',
          'vite.bridge.config.mjs',
        ],
        {
          cwd: path.join(root, 'native-spike'),
          env: { ...process.env, NODE_ENV: 'production', NATIVE_DEMO_OUT_DIR: output },
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      )
      const activeWatch = watching
      const outputChanged = (chunk) => {
        if (watching !== activeWatch) return
        const text = chunk.toString()
        if (!text.includes('built in')) return
        clearTimeout(timer)
        timer = setTimeout(() => {
          if (watching !== activeWatch) return
          try {
            writeBridgeManifest(output)
            server.ws.send({ type: 'full-reload' })
          } catch (error) {
            server.config.logger.error(String(error))
          }
        }, 100)
      }
      watching.stdout.on('data', outputChanged)
      watching.stderr.on('data', (chunk) => server.config.logger.warn(chunk.toString()))
      watching.on('error', (error) => server.config.logger.error(String(error)))
      server.httpServer?.once('close', stopWatching)
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith('/native-demo/')) {
          next()
          return
        }
        const file = bridgeAssetPath(output, request.url)
        if (!file || !existsSync(file) || !statSync(file).isFile()) {
          response.statusCode = 404
          response.end('Native demo artifact not ready')
          return
        }
        if (file.endsWith('manifest.json')) {
          try {
            writeBridgeManifest(output)
          } catch {
            /* Build may be committing its next output. */
          }
        }
        const mime = {
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.svg': 'image/svg+xml',
          '.png': 'image/png',
          '.ttf': 'font/ttf',
          '.jpg': 'image/jpeg',
          '.webp': 'image/webp',
        }
        response.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream')
        response.setHeader('Cache-Control', 'no-store')
        response.end(readFileSync(file))
      })
    },
  }
}
