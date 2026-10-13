import { createHash } from 'node:crypto'

const sdkMetadata = new Set(['com.hotupdater.CHANNEL', 'com.hotupdater.FINGERPRINT_HASH', 'com.hotupdater.PUBLIC_KEY'])
const metadataTags =
  /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<meta-data\b(?:[^>"']|"[^"]*"|'[^']*')*(?:\/>|>\s*<\/meta-data\s*>)/g

/** Preserve authored XML; exclude only SDK-injected tags to avoid a fingerprint feedback loop. */
export function normalizeNativeManifest(manifest) {
  return manifest
    .replace(/\r\n?/g, '\n')
    .replace(metadataTags, (tag) => {
      if (!tag.startsWith('<meta-data')) return tag
      const name = tag.match(/\sandroid:name\s*=\s*(["'])(.*?)\1/)?.[2]
      return sdkMetadata.has(name) ? '' : tag
    })
    .trim()
}

export function nativeManifestDigest(manifest) {
  return createHash('sha256').update(normalizeNativeManifest(manifest)).digest('hex')
}

/** Explicit preparation never approves permissions, channels or signing trust. */
export function refreshNativeManifestMarker(marker, manifest) {
  return { ...marker, manifestSha256: nativeManifestDigest(manifest) }
}

export function assertNativeRuntime({ currentHash, savedHash, manifest, marker, publicKey }) {
  const metadata = (name) =>
    manifest.match(
      new RegExp(`<meta-data[^>]*android:name="${name.replaceAll('.', '\\.')}"[^>]*android:value="([^"]+)"`),
    )?.[1]
  const permissions = [...manifest.matchAll(/<uses-permission\s+([^>]+)\/>/g)].map((match) => {
    const name = match[1]
      .match(/android:name="([^"]+)"/)?.[1]
      ?.split('.')
      .at(-1)
    const maximum = match[1].match(/android:maxSdkVersion="([^"]+)"/)?.[1]
    return `${name}${maximum ? ':maxSdk' + maximum : ''}`
  })
  if (JSON.stringify(permissions.sort()) !== JSON.stringify([...marker.permissions].sort()))
    throw new Error(
      'Native permission marker is stale; update compatibility marker and regenerate fingerprint before rebuilding.',
    )
  if (metadata('com.hotupdater.CHANNEL') !== marker.channel)
    throw new Error('Native channel and compatibility marker differ.')
  if (savedHash !== currentHash || metadata('com.hotupdater.FINGERPRINT_HASH') !== currentHash)
    throw new Error('Native fingerprint is stale. Run hot-updater fingerprint create, then rebuild the base APK.')
  if (metadata('com.hotupdater.PUBLIC_KEY')?.replaceAll('\\n', '\n').trim() !== publicKey.trim())
    throw new Error('Native OTA signing trust anchor differs from the checked-in public key.')
  if (marker.manifestSha256 !== nativeManifestDigest(manifest))
    throw new Error(
      'Native manifest compatibility marker is stale. Run prepare-runtime.mjs after reviewing native manifest changes, then regenerate the official SDK fingerprint.',
    )
}
