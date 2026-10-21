import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureNativeWebDependencies, run, writeBridgeManifest } from './native-spike/web/bridge-files.mjs'
import { copyDeploymentPublic, optimizeOutput } from './build-assets/optimize-output.mjs'
import { mkdir, writeFile } from 'node:fs/promises'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
await ensureNativeWebDependencies(root)
await run(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: root })
const publicFiles = await copyDeploymentPublic(path.join(root, 'public'), path.join(root, 'dist'))
const output = path.join(root, 'dist/native-demo')
await run(
  process.execPath,
  [path.join(root, 'native-spike/node_modules/vite/bin/vite.js'), 'build', '--config', 'vite.bridge.config.mjs'],
  {
    cwd: path.join(root, 'native-spike'),
    env: { ...process.env, NODE_ENV: 'production', NATIVE_DEMO_OUT_DIR: output },
  },
)
const optimization = await optimizeOutput(path.join(root, 'dist'), {
  cacheDirectory: path.join(root, '.codex-temp/lossless-asset-cache'),
  protectedPaths: publicFiles,
})
const manifest = writeBridgeManifest(output)
await mkdir(path.join(root, '.codex-temp'), { recursive: true })
await writeFile(path.join(root, '.codex-temp/asset-optimization-report.json'), JSON.stringify(optimization, null, 2) + '\n')
console.log(`Lossless assets: ${optimization.beforeBytes} -> ${optimization.afterBytes} bytes; ${optimization.duplicateFilesRemoved} duplicate copies removed`)
console.log(`Shared Native Web bundle: ${manifest.files.length} files, build ${manifest.buildId}`)
