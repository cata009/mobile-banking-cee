import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureNativeWebDependencies, run, writeBridgeManifest } from './bridge-files.mjs'

// Tests mount the real isolated React 19 bundle, including on a clean CI checkout.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
await ensureNativeWebDependencies(root)
const native = path.join(root, 'native-spike')
const output = path.join(native, 'dist-host')
await run(
  process.execPath,
  [path.join(native, 'node_modules/vite/bin/vite.js'), 'build', '--config', 'vite.bridge.config.mjs'],
  {
    cwd: native,
    env: { ...process.env, NODE_ENV: 'production', NATIVE_DEMO_OUT_DIR: output },
  },
)
const manifest = writeBridgeManifest(output)
console.log(`Native Web test bundle ready: ${manifest.buildId}`)
