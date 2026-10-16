import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureNativeWebDependencies, run, writeBridgeManifest } from './native-spike/web/bridge-files.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
await ensureNativeWebDependencies(root)
await run(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: root })
const output = path.join(root, 'dist/native-demo')
await run(
  process.execPath,
  [path.join(root, 'native-spike/node_modules/vite/bin/vite.js'), 'build', '--config', 'vite.bridge.config.mjs'],
  {
    cwd: path.join(root, 'native-spike'),
    env: { ...process.env, NODE_ENV: 'production', NATIVE_DEMO_OUT_DIR: output },
  },
)
const manifest = writeBridgeManifest(output)
console.log(`Shared Native Web bundle: ${manifest.files.length} files, build ${manifest.buildId}`)
