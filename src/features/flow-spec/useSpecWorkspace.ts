import { useCallback, useEffect, useRef, useState } from 'react'
import { dehydrateDocument } from './document'
import { validateSpecDocument } from './schema.mjs'
import { SpecClientError, SpecCommittedAssetsError, type SpecRepository } from './client'
import { missingSpecImages } from './attachments'
import type { SpecAccess, SpecAsset, SpecDocument, SpecState } from './types'

const RECOVERY_KEY = 'mb:flow-spec:ba-card-fraud:recovery'
const documentVisibility = () => globalThis.document.visibilityState
interface Recovery {
  document: SpecDocument
  baseRevision: number
  at: string
}
type SaveStatus = 'loading' | 'saved' | 'dirty' | 'saving' | 'error' | 'conflict'
function readRecovery(key: string): Recovery | null {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!value || !Number.isInteger(value.baseRevision)) return null
    validateSpecDocument(value.document)
    return value
  } catch {
    return null
  }
}

/** Port of all-in-one's autosave/flush pattern, with revision CAS and recovery. */
export function useSpecWorkspace({
  enabled,
  seed,
  repository,
  access,
}: {
  enabled: boolean
  seed: SpecDocument
  repository: SpecRepository
  access?: SpecAccess
}) {
  const accessRef = useRef(access)
  accessRef.current = access
  const recoveryKey = access ? `${RECOVERY_KEY}:${encodeURIComponent(access.actorId ?? 'shared')}` : RECOVERY_KEY
  const [document, setDocument] = useState(seed)
  const [state, setState] = useState<SpecState>({ revision: 0, document: null, history: [], assets: [] })
  const [status, setStatus] = useState<SaveStatus>(enabled ? 'loading' : 'saved')
  const [error, setError] = useState<string | null>(null)
  const [recovery, setRecovery] = useState<Recovery | null>(null)
  const [author, setAuthor] = useState('Workspace editor')
  const [assetPending, setAssetPending] = useState(0)
  const [imageError, setImageError] = useState<string | null>(null)
  const [imagesLoading, setImagesLoading] = useState(false)
  const imageRecovery = useRef<(() => Promise<SpecAsset[]>) | null>(null)
  const imageLoadPromise = useRef<Promise<void> | null>(null)
  const assetTasks = useRef(new Set<Promise<void>>())
  const seedRef = useRef(seed)
  const docRef = useRef(document),
    stateRef = useRef(state),
    authorRef = useRef(author)
  const baseline = useRef(JSON.stringify(seed)),
    loaded = useRef(false),
    blocked = useRef(false)
  const saving = useRef<Promise<void> | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadPromise = useRef<Promise<boolean> | null>(null)
  const restoring = useRef<Promise<void> | null>(null)
  const refreshing = useRef<Promise<void> | null>(null)
  const editingActive = useRef(false)
  const setEditingActive = useCallback((active: boolean) => {
    editingActive.current = active
  }, [])
  const mounted = useRef(true)
  const loadGeneration = useRef(0)
  authorRef.current = access?.author ?? author
  const assertMutationAccess = useCallback((restore = false) => {
    const current = accessRef.current
    if (!current) return
    if (!mounted.current) throw new SpecClientError('Your personal session changed. Your recovery draft is kept.', 409)
    if (restore ? !current.canRestore : !current.canEdit)
      throw new SpecClientError(
        restore
          ? 'Only an Admin can restore a specification version.'
          : 'Your account no longer has permission to save. Your recovery draft is kept.',
        403,
      )
  }, [])

  const clearTimer = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
  }, [])
  const keepRecovery = useCallback(
    (next: SpecDocument) => {
      const value: Recovery = { document: next, baseRevision: stateRef.current.revision, at: new Date().toISOString() }
      try {
        localStorage.setItem(recoveryKey, JSON.stringify(value))
      } catch {
        if (mounted.current)
          setError(
            'Browser recovery storage is unavailable. Keep this tab open until the server confirms the save, or download a backup.',
          )
      }
    },
    [recoveryKey],
  )
  const acceptState = useCallback((next: SpecState, replaceDocument: boolean) => {
    if (!replaceDocument)
      next = {
        ...next,
        assets: [...new Map([...next.assets, ...stateRef.current.assets].map((asset) => [asset.id, asset])).values()],
      }
    stateRef.current = next
    if (mounted.current) setState(next)
    if (replaceDocument) {
      const nextDoc = next.document ?? seedRef.current
      docRef.current = nextDoc
      baseline.current = JSON.stringify(nextDoc)
      if (mounted.current) setDocument(nextDoc)
    }
  }, [])

  const resolveCommit = useCallback(async (request: Promise<SpecState>): Promise<SpecState> => {
    try {
      const next = await request
      imageRecovery.current = null
      if (mounted.current) setImageError(null)
      return next
    } catch (cause) {
      if (!(cause instanceof SpecCommittedAssetsError)) throw cause
      imageRecovery.current = cause.recoverAssets
      if (mounted.current) setImageError(cause.message)
      return { ...cause.acknowledged, assets: stateRef.current.assets }
    }
  }, [])

  const retryImages = useCallback(async () => {
    if (imageLoadPromise.current) return imageLoadPromise.current
    const recoverAssets = imageRecovery.current
    if (!recoverAssets) return
    const job = (async () => {
      if (mounted.current) setImagesLoading(true)
      try {
        const assets = await recoverAssets()
        const merged = [...new Map([...stateRef.current.assets, ...assets].map((asset) => [asset.id, asset])).values()]
        stateRef.current = { ...stateRef.current, assets: merged }
        if (mounted.current) setState(stateRef.current)
        if (imageRecovery.current === recoverAssets) {
          imageRecovery.current = null
          if (mounted.current) setImageError(null)
        }
      } finally {
        if (mounted.current) setImagesLoading(false)
      }
    })()
    imageLoadPromise.current = job
    try {
      await job
    } finally {
      if (imageLoadPromise.current === job) imageLoadPromise.current = null
    }
  }, [])

  const reload = useCallback(() => {
    const generation = ++loadGeneration.current
    clearTimer()
    if (mounted.current) {
      setStatus('loading')
      setError(null)
    }
    const job = (async () => {
      try {
        if (saving.current) await saving.current.catch(() => {})
        if (restoring.current) await restoring.current.catch(() => {})
        const snapshot = JSON.stringify(docRef.current)
        if (snapshot !== baseline.current) keepRecovery(docRef.current)
        const next = await repository.read()
        if (generation !== loadGeneration.current || !mounted.current) return false
        if (next.document) validateSpecDocument(next.document)
        if (JSON.stringify(docRef.current) !== snapshot) {
          keepRecovery(docRef.current)
          blocked.current = next.revision !== stateRef.current.revision
          setStatus(blocked.current ? 'conflict' : 'dirty')
          setError(
            'You made more edits while the latest version was loading. Your draft has been kept; review the latest version before continuing.',
          )
          return false
        }
        acceptState(next, true)
        loaded.current = true
        blocked.current = false
        imageRecovery.current = null
        if (mounted.current) {
          setImageError(null)
          setRecovery(readRecovery(recoveryKey))
          setStatus('saved')
        }
        return true
      } catch (cause) {
        if (generation !== loadGeneration.current || !mounted.current) return false
        if (mounted.current) {
          setError(cause instanceof Error ? cause.message : 'Could not load the specification.')
          setStatus('error')
          setRecovery(readRecovery(recoveryKey))
        }
        return false
      }
    })()
    loadPromise.current = job
    return job
  }, [acceptState, clearTimer, keepRecovery, repository, recoveryKey])

  const flush = useCallback(async (): Promise<{ document: SpecDocument; assets: SpecAsset[] }> => {
    clearTimer()
    if (loadPromise.current) await loadPromise.current
    while (assetTasks.current.size) await Promise.all([...assetTasks.current])
    if (restoring.current) await restoring.current
    if (!loaded.current)
      if (JSON.stringify(docRef.current) === baseline.current)
        return { document: docRef.current, assets: stateRef.current.assets }
      else throw new Error('The specification service is unavailable. Download your recovery draft before leaving.')
    if (blocked.current) throw new Error('Resolve the version conflict before saving or exporting.')
    if (saving.current) await saving.current
    const perform = async () => {
      while (JSON.stringify(docRef.current) !== baseline.current) {
        const snapshot = docRef.current
        const serialized = JSON.stringify(snapshot)
        if (mounted.current) {
          setStatus('saving')
          setError(null)
        }
        try {
          assertMutationAccess()
          validateSpecDocument(snapshot)
          const next = await resolveCommit(repository.save(snapshot, stateRef.current.revision, authorRef.current))
          acceptState(next, false)
          baseline.current = serialized
          if (JSON.stringify(docRef.current) === serialized) {
            try {
              localStorage.removeItem(recoveryKey)
            } catch {
              /* server save succeeded */
            }
            if (mounted.current) setRecovery(null)
          } else keepRecovery(docRef.current)
        } catch (cause) {
          keepRecovery(docRef.current)
          blocked.current = cause instanceof SpecClientError && cause.status === 409
          if (mounted.current) {
            setError(cause instanceof Error ? cause.message : 'Save failed. Your local draft is preserved.')
            setStatus(blocked.current ? 'conflict' : 'error')
          }
          throw cause
        }
      }
      if (mounted.current) setStatus('saved')
    }
    const job = perform()
    saving.current = job
    try {
      await job
    } finally {
      if (saving.current === job) saving.current = null
    }
    return { document: docRef.current, assets: stateRef.current.assets }
  }, [acceptState, clearTimer, keepRecovery, repository, resolveCommit, recoveryKey, assertMutationAccess])

  const prepareExport = useCallback(async () => {
    await flush()
    if (missingSpecImages(docRef.current, stateRef.current.assets)) await retryImages()
    const snapshot = await flush()
    if (missingSpecImages(snapshot.document, snapshot.assets))
      throw new Error('An image is unavailable. Retry loading images before exporting the complete specification.')
    return snapshot
  }, [flush, retryImages])

  const update = useCallback(
    (next: SpecDocument) => {
      const clean = dehydrateDocument(next)
      docRef.current = clean
      if (mounted.current) setDocument(clean)
      keepRecovery(clean)
      if (mounted.current && !blocked.current) setStatus('dirty')
      clearTimer()
      if (mounted.current && loaded.current && !blocked.current)
        timer.current = setTimeout(() => {
          void flush().catch(() => {})
        }, 1500)
    },
    [clearTimer, flush, keepRecovery],
  )

  const restore = useCallback(
    async (revision: number) => {
      assertMutationAccess(true)
      await flush()
      assertMutationAccess(true)
      clearTimer()
      const snapshot = JSON.stringify(docRef.current)
      const job = (async () => {
        try {
          setStatus('saving')
          const next = await resolveCommit(repository.restore(revision, stateRef.current.revision, authorRef.current))
          if (JSON.stringify(docRef.current) !== snapshot) {
            acceptState(next, false)
            keepRecovery(docRef.current)
            throw new SpecClientError(
              'The version was restored, but your newer local edits were preserved. Download your recovery draft and review the latest version before continuing.',
              409,
            )
          }
          acceptState(
            {
              ...next,
              assets: [
                ...new Map([...next.assets, ...stateRef.current.assets].map((asset) => [asset.id, asset])).values(),
              ],
            },
            true,
          )
          setStatus('saved')
          setError(null)
        } catch (cause) {
          blocked.current = cause instanceof SpecClientError && cause.status === 409
          setStatus(blocked.current ? 'conflict' : 'error')
          setError(cause instanceof Error ? cause.message : 'Restore failed.')
          throw cause
        }
      })()
      restoring.current = job
      try {
        await job
      } finally {
        if (restoring.current === job) restoring.current = null
      }
    },
    [acceptState, clearTimer, flush, keepRecovery, repository, resolveCommit, assertMutationAccess],
  )

  const upload = useCallback(
    async (name: string, dataUrl: string) => {
      assertMutationAccess()
      const asset = await repository.upload(name, dataUrl)
      const assets = [...stateRef.current.assets.filter((a) => a.id !== asset.id), asset]
      stateRef.current = { ...stateRef.current, assets }
      if (mounted.current) setState(stateRef.current)
      return asset
    },
    [repository, assertMutationAccess],
  )

  const trackAssetTask = useCallback(async (task: () => Promise<void>) => {
    const job = Promise.resolve().then(task)
    assetTasks.current.add(job)
    if (mounted.current) setAssetPending(assetTasks.current.size)
    try {
      await job
    } finally {
      assetTasks.current.delete(job)
      if (mounted.current) setAssetPending(assetTasks.current.size)
    }
  }, [])
  const preservePendingImage = useCallback(
    (asset: SpecAsset) => {
      update({
        type: 'doc',
        content: [
          ...docRef.current.content,
          { type: 'image', attrs: { assetId: asset.id, alt: asset.name, width: Math.min(640, asset.width) } },
          { type: 'paragraph' },
        ],
      })
    },
    [update],
  )

  const recover = useCallback(() => {
    if (!recovery) return
    if (recovery.baseRevision !== stateRef.current.revision) {
      setError(
        'This recovery draft is based on an older revision. Download it and merge the changes into the latest document.',
      )
      return
    }
    update(recovery.document)
    setRecovery(null)
  }, [recovery, update])

  const beginEditing = useCallback(async () => {
    assertMutationAccess()
    if (loadPromise.current) await loadPromise.current
    assertMutationAccess()
    if (!loaded.current)
      throw new Error(
        'Reconnect to specification storage before editing. The source document is available for reading.',
      )
    if (stateRef.current.revision > 0) return
    try {
      const next = await resolveCommit(
        repository.save(seedRef.current, 0, 'Source baseline', 'Initial canonical BA specification'),
      )
      acceptState(next, true)
    } catch (cause) {
      if (cause instanceof SpecClientError && cause.status === 409) await reload()
      else throw cause
    }
  }, [acceptState, reload, repository, resolveCommit, assertMutationAccess])

  useEffect(() => {
    mounted.current = true
    if (enabled) loadPromise.current = reload()
    return () => {
      clearTimer()
      // A personal identity may have changed by unmount: never send its old draft
      // using a replacement user's cookie. Recovery already retains unsent work.
      if (!accessRef.current && enabled && loaded.current && !blocked.current) void flush().catch(() => {})
      mounted.current = false
    }
  }, [enabled, reload, clearTimer, flush])

  useEffect(() => {
    if (!enabled) return
    const clean = () =>
      loaded.current &&
      !editingActive.current &&
      !blocked.current &&
      !saving.current &&
      !restoring.current &&
      !assetTasks.current.size &&
      JSON.stringify(docRef.current) === baseline.current
    const refresh = () => {
      if (!clean() || refreshing.current) return
      const revision = stateRef.current.revision
      const snapshot = baseline.current
      const generation = loadGeneration.current
      const job = (async () => {
        try {
          const next = await repository.read()
          if (
            !mounted.current ||
            !clean() ||
            loadGeneration.current !== generation ||
            stateRef.current.revision !== revision ||
            baseline.current !== snapshot
          )
            return
          if (next.revision < revision) return
          if (next.document) validateSpecDocument(next.document)
          if (
            next.revision > revision ||
            next.assets.some((asset) => !stateRef.current.assets.some((existing) => existing.id === asset.id))
          )
            acceptState(next, true)
        } catch {
          /* Keep the current document and recovery intact on background connection failures. */
        }
      })()
      refreshing.current = job
      void job.finally(() => {
        if (refreshing.current === job) refreshing.current = null
      })
    }
    const visible = () => {
      if (documentVisibility() === 'visible') refresh()
    }
    const interval = window.setInterval(visible, 30_000)
    window.addEventListener('focus', refresh)
    globalThis.document.addEventListener('visibilitychange', visible)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      globalThis.document.removeEventListener('visibilitychange', visible)
    }
  }, [enabled, acceptState, repository])

  useEffect(() => {
    if (!enabled) return
    const guard = (event: BeforeUnloadEvent) => {
      if (
        JSON.stringify(docRef.current) !== baseline.current ||
        saving.current ||
        restoring.current ||
        assetTasks.current.size
      ) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [enabled])

  return {
    access,
    document,
    assets: state.assets,
    history: state.history,
    revision: state.revision,
    status,
    error,
    imageError,
    imagesLoading,
    retryImages,
    recovery,
    author: access?.author ?? author,
    setAuthor,
    assetPending,
    trackAssetTask,
    preservePendingImage,
    update,
    flush,
    prepareExport,
    restore,
    reload,
    recover,
    upload,
    beginEditing,
    setEditingActive,
    readRevision: repository.revision,
  }
}
export type SpecWorkspace = ReturnType<typeof useSpecWorkspace>
