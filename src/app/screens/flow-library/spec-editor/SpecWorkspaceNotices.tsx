import type { SpecWorkspace } from '@/features/flow-spec/useSpecWorkspace'
import type { SpecAsset, SpecDocument } from '@/features/flow-spec/types'
import { documentText } from '@/features/flow-spec/document'

interface Props {
  workspace: SpecWorkspace
  busy: boolean
  actionError: string
  onSave(): void
  onReload(): void
  onRecover(): void
  onRetryImages(): void
  onDownload(document: SpecDocument, assets: SpecAsset[]): void
}
export default function SpecWorkspaceNotices({
  workspace: w,
  busy,
  actionError,
  onSave,
  onReload,
  onRecover,
  onRetryImages,
  onDownload,
}: Props) {
  const error = w.error || (!w.imageError ? actionError : '')
  return (
    <>
      {error && (
        <div className="spec-notice" role="alert">
          <strong>{w.status === 'conflict' ? 'A newer version is available' : 'Your draft is still here'}</strong>
          <p>{error}</p>
          <div className="spec-actions">
            {w.status !== 'conflict' && (
              <button type="button" className="spec-command" disabled={busy} onClick={onSave}>
                Retry save
              </button>
            )}
            <button type="button" className="spec-command" disabled={busy} onClick={onReload}>
              Load latest (keep recovery)
            </button>
            <button type="button" className="spec-text-action" onClick={() => onDownload(w.document, w.assets)}>
              Download recovery draft
            </button>
          </div>
        </div>
      )}
      {w.imageError && (
        <div className="spec-notice spec-attachment-notice" role="status">
          <strong>Your changes are saved</strong>
          <p>{actionError || w.imageError}</p>
          <button type="button" className="spec-command" disabled={busy || w.imagesLoading} onClick={onRetryImages}>
            {w.imagesLoading ? 'Loading images…' : 'Retry loading images'}
          </button>
        </div>
      )}
      {w.recovery && (
        <div className="spec-notice">
          <strong>Recover a previous draft</strong>
          <p>
            A draft from {new Date(w.recovery.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}{' '}
            is available in this browser.
          </p>
          <details>
            <summary>Review recovery text</summary>
            <pre className="spec-recovery-text">{documentText(w.recovery.document)}</pre>
          </details>
          <div className="spec-actions">
            <button
              type="button"
              className="spec-command"
              disabled={busy || w.recovery.baseRevision !== w.revision}
              onClick={onRecover}
            >
              Use recovery draft
            </button>
            <button
              type="button"
              className="spec-text-action"
              onClick={() => {
                if (w.recovery) onDownload(w.recovery.document, w.assets)
              }}
            >
              Download recovery draft
            </button>
          </div>
          {w.recovery.baseRevision !== w.revision && (
            <p className="spec-muted">
              This draft started from an older version. Download it and merge the changes into the latest document.
            </p>
          )}
        </div>
      )}
    </>
  )
}
