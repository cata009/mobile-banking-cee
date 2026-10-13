import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { assertApprovedRuntime, publicKeyDigest } from '../src/release.js'
import { required } from '../src/env.js'
import { verifyDeploymentProvider, assertLocalSourceIdentity } from '../src/deployment-provider.js'

const event = JSON.parse(await readFile(required(process.env, 'GITHUB_EVENT_PATH'), 'utf8'))
const { sha, deploymentId } = await verifyDeploymentProvider(event, process.env)
assertLocalSourceIdentity(sha)
const native = path.resolve(process.cwd(), '../native-spike')
const saved = JSON.parse(await readFile(path.join(native, 'fingerprint.json'), 'utf8'))
const marker = JSON.parse(await readFile(path.join(native, 'ota-native-compatibility.json'), 'utf8'))
assertApprovedRuntime(
  saved.android?.hash ?? '',
  required(process.env, 'NATIVE_OTA_BASE_FINGERPRINT'),
  marker.channel,
  required(process.env, 'NATIVE_OTA_APK_CERT_SHA256'),
)
const attestation = {
  sourceSha: sha,
  deploymentId,
  nativeFingerprint: saved.android.hash,
  channel: marker.channel,
  publicKeySha256: publicKeyDigest(await readFile(path.join(native, 'keys/ota-public-key.pem'), 'utf8')),
  packageName: marker.applicationId,
}
if (process.env.NATIVE_OTA_ATTESTATION_PATH)
  await writeFile(process.env.NATIVE_OTA_ATTESTATION_PATH, JSON.stringify(attestation, null, 2))
console.log(`Verified exact deployment SHA ${sha} and approved native runtime ${saved.android.hash}.`)
