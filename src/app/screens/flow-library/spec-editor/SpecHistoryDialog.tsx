import { useEffect, useMemo, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { History, Loader2, Search } from 'lucide-react'
import PrimaryButton from '@/app/components/PrimaryButton'
import TextField from '@/app/components/TextField'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { documentText, renderSpecHtml } from '@/features/flow-spec/document'
import type { SpecAsset, SpecDocument, SpecRevision } from '@/features/flow-spec/types'
import './specHistory.css'

const timestamp = (value: string) =>
  new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
interface Props {
  open: boolean
  onOpenChange(open: boolean): void
  history: readonly SpecRevision[]
  currentRevision: number
  assets: readonly SpecAsset[]
  readRevision(revision: number): Promise<SpecDocument>
  onRestore(revision: number): Promise<void>
  onCloseAutoFocus(event: Event): void
  canRestore?: boolean
}

/** Immutable version previews have their own request lifecycle, separate from saving the working draft. */
export default function SpecHistoryDialog({
  open,
  onOpenChange,
  history,
  currentRevision,
  assets,
  readRevision,
  onRestore,
  onCloseAutoFocus,
  canRestore = true,
}: Props) {
  const [selected, setSelected] = useState<number | null>(currentRevision || history[0]?.revision || null)
  const [preview, setPreview] = useState<{ revision: number; document: SpecDocument } | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const [confirm, setConfirm] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const restorePending = useRef(false)
  const cache = useRef(new Map<number, SpecDocument>())
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open && !wasOpen.current) {
      setSelected(currentRevision || history[0]?.revision || null)
      setQuery('')
      setConfirm(false)
      setError(null)
    }
    wasOpen.current = open
  }, [open, currentRevision, history])
  useEffect(() => {
    if (!open || selected === null) return
    let active = true
    setError(null)
    const cached = cache.current.get(selected)
    if (cached) {
      setPreview({ revision: selected, document: cached })
      setLoading(false)
      return
    }
    setLoading(true)
    void readRevision(selected)
      .then((document) => {
        cache.current.set(selected, document)
        if (active) setPreview({ revision: selected, document })
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'This version could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [open, selected, readRevision, retry])
  const visibleHistory = useMemo(() => {
    const search = query.trim().toLowerCase()
    return history.filter((entry) =>
      `version ${entry.revision} v${entry.revision} ${entry.author} ${entry.message} ${timestamp(entry.at)}`
        .toLowerCase()
        .includes(search),
    )
  }, [history, query])
  const metadata = history.find((entry) => entry.revision === selected)
  const ready = !loading && preview?.revision === selected ? preview : null
  const html = useMemo(() => (ready ? renderSpecHtml(ready.document, assets) : ''), [ready, assets])
  const words = ready ? documentText(ready.document).trim().split(/\s+/).filter(Boolean).length : 0
  const restore = async () => {
    if (!canRestore || !ready || restorePending.current || selected === currentRevision) return
    restorePending.current = true
    setRestoring(true)
    setError(null)
    try {
      await onRestore(ready.revision)
      onOpenChange(false)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'The version could not be restored. Your current document is unchanged.',
      )
    } finally {
      restorePending.current = false
      setRestoring(false)
    }
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!restorePending.current) onOpenChange(next)
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="spec-dialog-overlay" />
        <Dialog.Content
          className="spec-dialog spec-history-dialog"
          onCloseAutoFocus={onCloseAutoFocus}
          onEscapeKeyDown={(event) => {
            if (restorePending.current) event.preventDefault()
          }}
        >
          <header className="spec-history-header">
            <div>
              <Dialog.Title className="uc-type-h2">Specification history</Dialog.Title>
              <Dialog.Description className="spec-muted">
                Every saved version stays available. Preview a version before restoring it.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="spec-text-action" disabled={restoring}>
                Close history
              </button>
            </Dialog.Close>
          </header>
          {!history.length ? (
            <div className="spec-history-empty">
              <History size={28} aria-hidden="true" />
              <h3>No saved versions yet</h3>
              <p>Open the editor to keep the original specification as your first version.</p>
            </div>
          ) : (
            <div className="spec-history-layout">
              <aside className="spec-history-sidebar" aria-label="Saved versions">
                <TextField
                  label="Search version history"
                  placeholder="Version, person or note"
                  value={query}
                  onChange={setQuery}
                  disabled={restoring}
                />
                <p className="spec-history-count" role="status">
                  {visibleHistory.length} of {history.length} versions
                </p>
                <ol className="spec-revisions">
                  {visibleHistory.map((entry) => (
                    <li key={entry.revision}>
                      <button
                        type="button"
                        className="spec-revision"
                        aria-pressed={selected === entry.revision}
                        disabled={restoring}
                        onClick={() => {
                          setSelected(entry.revision)
                          setConfirm(false)
                        }}
                      >
                        <span className="spec-revision-heading">
                          <strong>Version {entry.revision}</strong>
                          {entry.revision === currentRevision && <span className="spec-current-version">Current</span>}
                        </span>
                        <time dateTime={entry.at}>{timestamp(entry.at)}</time>
                        <span className="spec-revision-author">{entry.author}</span>
                        <span className="spec-revision-note">{entry.message}</span>
                      </button>
                    </li>
                  ))}
                </ol>
                {!visibleHistory.length && (
                  <div className="spec-history-no-results">
                    <Search size={20} aria-hidden="true" />
                    <p>No matching versions.</p>
                    <button type="button" className="spec-text-action" onClick={() => setQuery('')}>
                      Clear search
                    </button>
                  </div>
                )}
              </aside>
              <section className="spec-history-detail" aria-label="Version preview">
                <div className="spec-history-preview-heading">
                  <div>
                    <h3>
                      Version {selected}
                      {selected === currentRevision && <span className="spec-current-version">Current</span>}
                    </h3>
                    {metadata && (
                      <p>
                        {metadata.author} · {timestamp(metadata.at)}
                      </p>
                    )}
                  </div>
                  {ready && <span>{words.toLocaleString('en-GB')} words</span>}
                </div>
                {loading ? (
                  <div className="spec-history-empty" role="status">
                    <Loader2 className="spec-status-spinner" size={22} aria-hidden="true" />
                    <p>Loading version {selected}…</p>
                  </div>
                ) : ready ? (
                  <ScrollableRegion
                    className="spec-prose spec-history-preview"
                    aria-label={`Version ${selected} document`}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                ) : (
                  <div className="spec-history-empty">
                    <p>This preview is unavailable.</p>
                  </div>
                )}
                {error && (
                  <div className="spec-notice" role="alert">
                    <p>{error}</p>
                    {!ready && (
                      <button type="button" className="spec-command" onClick={() => setRetry((value) => value + 1)}>
                        Retry preview
                      </button>
                    )}
                  </div>
                )}
                <footer className="spec-history-footer">
                  {selected === currentRevision ? (
                    <p>You are viewing the current saved version.</p>
                  ) : confirm ? (
                    <>
                      <div>
                        <strong>Restore version {selected}?</strong>
                        <p>
                          Your current version will remain in history. This creates a new version for everyone in the
                          workspace.
                        </p>
                      </div>
                      <div className="spec-actions">
                        <button
                          type="button"
                          className="spec-text-action"
                          disabled={restoring || !canRestore}
                          onClick={() => setConfirm(false)}
                        >
                          Cancel restore
                        </button>
                        <PrimaryButton
                          className="spec-history-restore !w-auto"
                          disabled={restoring}
                          onClick={() => void restore()}
                        >
                          {restoring ? 'Restoring…' : 'Confirm restore'}
                        </PrimaryButton>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>Restoring keeps the full history.</p>
                      <PrimaryButton
                        className="spec-history-restore !w-auto"
                        disabled={!ready || !canRestore}
                        onClick={() => setConfirm(true)}
                      >
                        Restore this version
                      </PrimaryButton>
                    </>
                  )}
                </footer>
              </section>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
