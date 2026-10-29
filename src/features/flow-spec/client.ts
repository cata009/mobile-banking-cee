import type { SpecAsset, SpecDocument, SpecState } from './types'

export class SpecClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}
/** The write succeeded; attachment readiness must never turn its acknowledgement into a stale retry. */
export class SpecCommittedAssetsError extends Error {
  constructor(
    readonly acknowledged: Omit<SpecState, 'assets'>,
    readonly recoverAssets: () => Promise<SpecAsset[]>,
  ) {
    super('Your changes are saved. Some images could not be loaded; retry loading them before exporting.')
    this.name = 'SpecCommittedAssetsError'
  }
}
export interface SpecRepository {
  read(): Promise<SpecState>
  save(document: SpecDocument, expectedRevision: number, author: string, message?: string): Promise<SpecState>
  restore(revision: number, expectedRevision: number, author: string): Promise<SpecState>
  revision(revision: number): Promise<SpecDocument>
  upload(name: string, dataUrl: string): Promise<SpecAsset>
}

type RemoteAsset = Omit<SpecAsset, 'dataUrl'> & { url: string }
type WireState = Omit<SpecState, 'assets'> & {
  assets: (SpecAsset | RemoteAsset)[]
  storage?: { directUploads?: boolean }
}

function imageDataUrl(bytes: Uint8Array, mime: string) {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768))
  return `data:${mime};base64,${btoa(binary)}`
}

export function createSpecRepository(actorId?: string | null): SpecRepository {
  const endpoint = '/api/flow-spec?flow=ba-card-fraud'
  const images = new Map<string, Promise<SpecAsset>>()
  let directUploads = false
  async function request<T>(url: string, body?: object): Promise<T> {
    let response: Response
    try {
      response = await fetch(url, {
        method: body ? 'POST' : 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        ...(body
          ? {
              headers: {
                'Content-Type': 'application/json',
                ...(actorId !== undefined ? { 'X-Spec-Actor': actorId ?? 'shared' } : {}),
              },
              body: JSON.stringify(body),
            }
          : {}),
      })
    } catch {
      throw new SpecClientError('Specification service is unavailable. Your recovery draft is kept in this browser.', 0)
    }
    let data: T & { error?: string }
    try {
      data = await response.json()
    } catch {
      throw new SpecClientError('Specification storage is unavailable on this host.', response.status)
    }
    if (!response.ok) throw new SpecClientError(data.error || 'The specification request failed.', response.status)
    return data
  }
  async function hydrateAsset(asset: SpecAsset | RemoteAsset): Promise<SpecAsset> {
    if ('dataUrl' in asset) return asset
    const cached = images.get(asset.id)
    if (cached) return cached
    const job = (async () => {
      if (!/^img-[a-f0-9]{32}$/.test(asset.id) || asset.url !== `${endpoint}&asset=${asset.id}`)
        throw new SpecClientError('The image attachment reference is invalid.', 400)
      const response = await fetch(asset.url, { credentials: 'same-origin', cache: 'no-store' })
      if (!response.ok)
        throw new SpecClientError(
          'An image attachment could not be loaded. Retry before editing or exporting.',
          response.status,
        )
      const bytes = new Uint8Array(await response.arrayBuffer())
      return { ...asset, dataUrl: imageDataUrl(bytes, asset.mime) }
    })()
    images.set(asset.id, job)
    try {
      return await job
    } catch (error) {
      images.delete(asset.id)
      throw error
    }
  }
  async function hydrate(state: WireState): Promise<SpecState> {
    directUploads = Boolean(state.storage?.directUploads)
    const assets: SpecAsset[] = new Array(state.assets.length)
    let index = 0
    await Promise.all(
      Array.from({ length: Math.min(4, state.assets.length) }, async () => {
        while (index < state.assets.length) {
          const current = index++
          const asset = state.assets[current]
          if (!asset) throw new SpecClientError('The image attachment inventory is invalid.', 400)
          assets[current] = await hydrateAsset(asset)
        }
      }),
    )
    return { revision: state.revision, document: state.document, history: state.history, assets }
  }
  async function commit(body: object): Promise<SpecState> {
    const state = await request<WireState>(endpoint, body)
    try {
      return await hydrate(state)
    } catch {
      throw new SpecCommittedAssetsError(
        { revision: state.revision, document: state.document, history: state.history },
        async () => (await hydrate(state)).assets,
      )
    }
  }
  return {
    read: async () => hydrate(await request<WireState>(endpoint)),
    save: (document, expectedRevision, author, message) =>
      commit({ operation: 'save', document, expectedRevision, author, message }),
    restore: (revision, expectedRevision, author) =>
      commit({ operation: 'restore', revision, expectedRevision, author }),
    revision: async (revision) =>
      (await request<{ document: SpecDocument }>(`${endpoint}&revision=${revision}`)).document,
    upload: async (name, dataUrl) => {
      if (!directUploads)
        return (await request<{ asset: SpecAsset }>(endpoint, { operation: 'asset', name, dataUrl })).asset
      const match = /^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl)
      if (!match?.[1] || !match[2]) throw new SpecClientError('Choose a PNG or JPEG image.', 400)
      const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0))
      if (bytes.length > 5 * 1024 * 1024) throw new SpecClientError('Each image must be 5 MB or smaller.', 413)
      const grant = await request<{ pathname: string; presignedUrl: string }>(endpoint, {
        operation: 'upload-grant',
        mime: match[1],
        size: bytes.length,
      })
      const response = await fetch(grant.presignedUrl, {
        method: 'PUT',
        credentials: 'omit',
        headers: { 'Content-Type': match[1] },
        body: new Blob([bytes], { type: match[1] }),
      })
      if (!response.ok)
        throw new SpecClientError('The image upload failed. Retry before leaving the editor.', response.status)
      const { asset } = await request<{ asset: RemoteAsset }>(endpoint, {
        operation: 'asset-complete',
        pathname: grant.pathname,
        name,
      })
      const hydrated = { ...asset, dataUrl }
      images.set(asset.id, Promise.resolve(hydrated))
      return hydrated
    },
  }
}
