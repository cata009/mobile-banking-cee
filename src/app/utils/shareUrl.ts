import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate'

const STATE_PARAM = 's'

/** Compact a link without requiring a server-side link store. */
export function compactShareUrl(input: string): string {
  const url = new URL(input)
  if (!url.search || url.searchParams.has(STATE_PARAM)) return url.toString()
  const bytes = deflateSync(strToU8(url.search.slice(1)), { level: 9 })
  const encoded = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  url.search = ''
  url.searchParams.set(STATE_PARAM, encoded)
  return url.toString()
}

/** Restore before app and access-gate initialization, retaining any outer token. */
export function expandShareUrl(input: string): string {
  const url = new URL(input)
  const encoded = url.searchParams.get(STATE_PARAM)
  if (!encoded || encoded.length > 4096 || !/^[A-Za-z0-9_-]+$/.test(encoded)) return input
  try {
    const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'))
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    const decoded = strFromU8(inflateSync(bytes))
    if (decoded.length > 8192) return input
    const restored = new URLSearchParams(decoded)
    url.searchParams.delete(STATE_PARAM)
    url.searchParams.forEach((value, key) => restored.set(key, value))
    url.search = restored.toString()
    return url.toString()
  } catch {
    return input
  }
}
