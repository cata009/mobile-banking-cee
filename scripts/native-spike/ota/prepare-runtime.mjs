import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { refreshNativeManifestMarker } from './runtime-metadata.mjs'

const checkout = fileURLToPath(new URL('../../../', import.meta.url))
const project = path.join(checkout, 'native-spike')
const markerPath = path.join(project, 'ota-native-compatibility.json')
const manifest = await fs.readFile(path.join(project, 'android/app/src/main/AndroidManifest.xml'), 'utf8')
const marker = JSON.parse(await fs.readFile(markerPath, 'utf8'))
const prepared = refreshNativeManifestMarker(marker, manifest)
await fs.writeFile(markerPath, JSON.stringify(prepared, null, 2) + '\n', 'utf8')
console.log(`Native manifest digest prepared: ${prepared.manifestSha256}`)
console.log(
  'Permissions, channel and signing trust are unchanged. Regenerate the official SDK fingerprint before building.',
)
