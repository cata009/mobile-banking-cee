import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import * as runtime from './runtime-metadata.mjs'
const assertNativeRuntime = runtime.assertNativeRuntime
const baseline = {
  currentHash: 'native-current',
  savedHash: 'native-current',
  publicKey: 'PUBLIC',
  marker: { permissions: ['INTERNET'], channel: 'preview' },
  manifest:
    '<uses-permission android:name="android.permission.INTERNET" /><meta-data android:name="com.hotupdater.CHANNEL" android:value="preview" /><meta-data android:name="com.hotupdater.FINGERPRINT_HASH" android:value="native-current" /><meta-data android:name="com.hotupdater.PUBLIC_KEY" android:value="PUBLIC" />',
}
baseline.marker.manifestSha256 = runtime.nativeManifestDigest(baseline.manifest)
test('matching binary compatibility inputs and signing key are accepted', () =>
  assert.doesNotThrow(() => assertNativeRuntime(baseline)))
test('a changed native runtime cannot keep advertising its previous fingerprint', () =>
  assert.throws(() => assertNativeRuntime({ ...baseline, currentHash: 'native-changed' }), /fingerprint is stale/))
test('adding an Android permission cannot bypass compatibility marker review', () =>
  assert.throws(
    () =>
      assertNativeRuntime({
        ...baseline,
        manifest: baseline.manifest + '<uses-permission android:name="android.permission.CAMERA" />',
      }),
    /permission marker is stale/,
  ))
test('changing channel or pinned signing key fails closed', () => {
  assert.throws(() => assertNativeRuntime({ ...baseline, marker: { ...baseline.marker, channel: 'other' } }), /channel/)
  assert.throws(() => assertNativeRuntime({ ...baseline, publicKey: 'OTHER' }), /trust anchor/)
})

const authoredManifest = `<manifest package="com.example.demo">
  <uses-permission android:name="android.permission.INTERNET" />
  <application android:theme="@style/AppTheme">
    <provider android:name="FileProvider" android:exported="false" />
    <activity android:name="MainActivity" android:launchMode="singleTask" />
    <meta-data android:name="authored.native.setting" android:value="keep" />
    <meta-data android:name="com.hotupdater.CHANNEL" android:value="preview" />
    <meta-data android:name="com.hotupdater.FINGERPRINT_HASH" android:value="native-current" />
    <meta-data android:name="com.hotupdater.PUBLIC_KEY" android:value="PUBLIC" />
  </application>
</manifest>`
const authoredBaseline = {
  ...baseline,
  manifest: authoredManifest,
  marker: { ...baseline.marker, manifestSha256: runtime.nativeManifestDigest(authoredManifest) },
}

for (const [label, before, after] of [
  ['theme', '@style/AppTheme', '@style/NewTheme'],
  ['provider visibility', 'android:exported="false"', 'android:exported="true"'],
  ['activity behavior', 'android:launchMode="singleTask"', 'android:launchMode="standard"'],
  ['authored metadata', 'android:value="keep"', 'android:value="changed"'],
]) {
  test(`changing ${label} invalidates the manifest compatibility marker`, () => {
    assert.throws(
      () => assertNativeRuntime({ ...authoredBaseline, manifest: authoredManifest.replace(before, after) }),
      /manifest compatibility marker is stale/,
    )
  })
}

test('only SDK-generated metadata is omitted from the normalized digest', () => {
  assert.equal(typeof runtime.nativeManifestDigest, 'function')
  const regenerated = authoredManifest
    .replace('android:value="preview"', 'android:value="other-channel"')
    .replace('android:value="native-current"', 'android:value="native-new"')
    .replace('android:value="PUBLIC"', "android:value='PUBLIC-NEW'")
  assert.equal(runtime.nativeManifestDigest(regenerated), runtime.nativeManifestDigest(authoredManifest))
  assert.equal(
    runtime.nativeManifestDigest(authoredManifest.replaceAll('\n', '\r\n')),
    runtime.nativeManifestDigest(authoredManifest),
  )
  const paired = authoredManifest.replace(
    '<meta-data android:name="com.hotupdater.FINGERPRINT_HASH" android:value="native-current" />',
    "<meta-data android:value='native-new' android:name='com.hotupdater.FINGERPRINT_HASH'></meta-data>",
  )
  assert.equal(runtime.nativeManifestDigest(paired), runtime.nativeManifestDigest(authoredManifest))
})

test('regenerating the SDK fingerprint does not require a manifest marker refresh', () => {
  assert.doesNotThrow(() =>
    assertNativeRuntime({
      ...authoredBaseline,
      currentHash: 'native-new',
      savedHash: 'native-new',
      manifest: authoredManifest.replace('android:value="native-current"', 'android:value="native-new"'),
    }),
  )
})

test('missing manifest digest fails closed before building', () => {
  assert.throws(
    () => assertNativeRuntime({ ...baseline, marker: { permissions: ['INTERNET'], channel: 'preview' } }),
    /manifest compatibility marker is stale/,
  )
})

test('preparation updates only the digest and preserves reviewed trust and permissions', () => {
  assert.equal(typeof runtime.refreshNativeManifestMarker, 'function')
  const marker = { ...authoredBaseline.marker, applicationId: 'com.example.demo', reviewedKey: 'PINNED' }
  const original = JSON.parse(JSON.stringify(marker))
  const changed = authoredManifest.replace('@style/AppTheme', '@style/NewTheme')
  const next = runtime.refreshNativeManifestMarker(marker, changed)
  assert.deepEqual(marker, original)
  assert.deepEqual(next, { ...original, manifestSha256: runtime.nativeManifestDigest(changed) })
  assert.notEqual(next.manifestSha256, original.manifestSha256)
})

test('digest preserves authored comments and similarly named metadata', () => {
  const input = `<manifest><!-- <meta-data android:name="com.hotupdater.CHANNEL" android:value="authored comment" /> --><meta-data android:name="com.hotupdater.CHANNEL.extra" android:value="keep" /><meta-data android:name="com.hotupdater.CHANNEL" android:value="preview" /></manifest>`
  const expected = `<manifest><!-- <meta-data android:name="com.hotupdater.CHANNEL" android:value="authored comment" /> --><meta-data android:name="com.hotupdater.CHANNEL.extra" android:value="keep" /></manifest>`
  assert.equal(runtime.normalizeNativeManifest(input), expected)
  assert.equal(runtime.nativeManifestDigest(input), createHash('sha256').update(expected).digest('hex'))
})
