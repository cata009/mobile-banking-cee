import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSpecRepository } from '@/features/flow-spec/client'

const id = 'img-' + 'a'.repeat(32)
const endpoint = '/api/flow-spec?flow=ba-card-fraud'
const asset = { id, name: 'image.png', mime: 'image/png', width: 1, height: 1, url: `${endpoint}&asset=${id}` }
const remote = {
  revision: 1,
  document: { type: 'doc', content: [] },
  history: [],
  assets: [asset],
  storage: { driver: 'blob', directUploads: true },
}
afterEach(() => vi.unstubAllGlobals())

describe('shared specification transport', () => {
  it.each(['save', 'restore'] as const)(
    'preserves the committed %s acknowledgement when a newly registered image fails to load',
    async (operation) => {
      let unavailable = true
      let posts = 0
      vi.stubGlobal('fetch', async (url: string, options?: RequestInit) => {
        if (url.includes('&asset='))
          return unavailable ? new Response('', { status: 503 }) : new Response(new Uint8Array([1, 2, 3]))
        if (options?.method === 'POST') {
          posts++
          return Response.json({ ...remote, revision: 2 })
        }
        return Response.json({ ...remote, assets: [] })
      })
      const repo = createSpecRepository()
      await repo.read()
      let caught: unknown
      try {
        if (operation === 'save') await repo.save({ type: 'doc', content: [] }, 1, 'BA')
        else await repo.restore(1, 1, 'BA')
      } catch (error) {
        caught = error
      }
      expect(caught).toMatchObject({
        acknowledged: { revision: 2, document: remote.document },
        recoverAssets: expect.any(Function),
      })
      unavailable = false
      const images = await (caught as { recoverAssets(): Promise<{ dataUrl: string }[]> }).recoverAssets()
      expect(images[0]?.dataUrl).toBe('data:image/png;base64,AQID')
      expect(posts).toBe(1)
    },
  )
  it('hydrates private images once without sending bytes in document saves', async () => {
    const fetcher = vi.fn(async (url: string) =>
      url.includes('&asset=') ? new Response(new Uint8Array([1, 2, 3])) : Response.json(remote),
    )
    vi.stubGlobal('fetch', fetcher)
    const repo = createSpecRepository()
    const first = await repo.read()
    expect(first.assets[0]?.dataUrl).toBe('data:image/png;base64,AQID')
    await repo.save(first.document!, 1, 'BA')
    expect(fetcher.mock.calls.filter(([url]) => url.includes('&asset='))).toHaveLength(1)
    expect(JSON.stringify(fetcher.mock.calls)).not.toContain('data:image')
  })
  it('uploads original bytes directly with a scoped grant then registers the private attachment', async () => {
    const calls: { url: string; options?: RequestInit }[] = []
    vi.stubGlobal('fetch', async (url: string, options?: RequestInit) => {
      calls.push({ url, options })
      if (url === 'https://upload.example/signed') return new Response('{}')
      if (options?.method === 'POST') {
        const body = JSON.parse(String(options.body))
        if (body.operation === 'upload-grant')
          return Response.json({ pathname: 'images/upload.png', presignedUrl: 'https://upload.example/signed' })
        if (body.operation === 'asset-complete') return Response.json({ asset })
      }
      return Response.json({ ...remote, assets: [] })
    })
    const repo = createSpecRepository()
    await repo.read()
    const uploaded = await repo.upload('image.png', 'data:image/png;base64,AQID')
    expect(uploaded.dataUrl).toBe('data:image/png;base64,AQID')
    const direct = calls.find((call) => call.url === 'https://upload.example/signed')!
    expect(direct.options).toMatchObject({ method: 'PUT', credentials: 'omit' })
    expect(direct.options?.body).toBeInstanceOf(Blob)
    const apiBodies = calls.filter((call) => call.url === endpoint).map((call) => String(call.options?.body ?? ''))
    expect(apiBodies.some((body) => body.includes('upload-grant'))).toBe(true)
    expect(apiBodies.some((body) => body.includes('asset-complete'))).toBe(true)
    expect(apiBodies.join('')).not.toContain('AQID')
  })
  it('reports a private image fetch failure instead of omitting it and retries on the next read', async () => {
    let fail = true
    vi.stubGlobal('fetch', async (url: string) =>
      url.includes('&asset=')
        ? fail
          ? new Response('', { status: 503 })
          : new Response(new Uint8Array([1]))
        : Response.json(remote),
    )
    const repo = createSpecRepository()
    await expect(repo.read()).rejects.toThrow(/image/i)
    fail = false
    expect((await repo.read()).assets[0]?.dataUrl).toContain('base64,AQ==')
  })
})
