import { lazy, Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Menu from '@radix-ui/react-dropdown-menu'
import { ChevronRight, FileText, History, MoreHorizontal, Pencil, Settings2, Download } from 'lucide-react'
import PrimaryButton from '@/app/components/PrimaryButton'
import TextField from '@/app/components/TextField'
import type { SpecWorkspace } from '@/features/flow-spec/useSpecWorkspace'
import { documentText, renderSpecHtml, specOutline } from '@/features/flow-spec/document'
import type { SpecAsset, SpecDocument } from '@/features/flow-spec/types'
import SpecHistoryDialog from './SpecHistoryDialog'
import SpecWorkspaceNotices from './SpecWorkspaceNotices'
import SpecSaveStatus, { saveStatusLabel } from './SpecSaveStatus'
import './specEditor.css'

const RichTextEditor = lazy(() => import('./SpecRichTextEditor'))
const timestamp = (value: string) =>
  new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
function backup(document: SpecDocument, assets: SpecAsset[]) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify({ schemaVersion: 1, flowId: 'ba-card-fraud', document, assets }, null, 2)], {
      type: 'application/json',
    }),
  )
  const link = window.document.createElement('a')
  link.href = url
  link.download = 'card-guard-specification-recovery.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function SpecWorkspacePanel({
  workspace: w,
  onCapture,
}: {
  workspace: SpecWorkspace
  onCapture(): Promise<SpecAsset>
}) {
  const [editing, setEditing] = useState(false)
  const canEdit = w.access?.canEdit ?? true
  const setEditingActive = w.setEditingActive
  useLayoutEffect(() => {
    setEditingActive(editing)
    return () => setEditingActive(false)
  }, [editing, setEditingActive])
  const editReturnTarget = useRef<HTMLSpanElement>(null)
  const composerTarget = useRef<HTMLDivElement>(null)
  const historyReturnTarget = useRef<HTMLElement | null>(null)
  const settingsReturnTarget = useRef<HTMLElement | null>(null)
  const returnFocus = (target: HTMLElement | null) => {
    if (target?.isConnected && !target.closest('[aria-hidden="true"]')) target.focus()
    else
      (
        composerTarget.current?.querySelector<HTMLButtonElement>('button[aria-label="More document actions"]') ??
        editReturnTarget.current?.querySelector('button')
      )?.focus()
  }
  const [session, setSession] = useState(0)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [operation, setOperation] = useState(false)
  const [actionError, setActionError] = useState('')
  const outline = useMemo(() => specOutline(w.document), [w.document])
  const html = useMemo(() => (editing ? '' : renderSpecHtml(w.document, w.assets)), [editing, w.document, w.assets])
  const words = documentText(w.document).trim().split(/\s+/).filter(Boolean).length
  const act = async (action: () => Promise<unknown>) => {
    setOperation(true)
    setActionError('')
    try {
      await action()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'The action could not be completed.')
    } finally {
      setOperation(false)
    }
  }
  const closeEditor = () => {
    if (!operation && !w.assetPending)
      void act(async () => {
        await w.flush()
        setEditing(false)
      })
  }
  const openHistory = () => {
    historyReturnTarget.current = globalThis.document.activeElement as HTMLElement | null
    setHistoryOpen(true)
  }
  const saveStatus = saveStatusLabel(w)
  const moreMenu = () => (
    <Menu.Root>
      <Menu.Trigger className="spec-page-icon" aria-label="More document actions" title="More actions">
        <MoreHorizontal size={20} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content className="spec-tool-menu" sideOffset={6} align="end">
          <Menu.Item className="spec-menu-item" disabled={!canEdit} onSelect={openHistory}>
            <History />
            Version history
          </Menu.Item>
          <Menu.Item
            className="spec-menu-item"
            onSelect={() => {
              settingsReturnTarget.current = globalThis.document.activeElement as HTMLElement | null
              setSettingsOpen(true)
            }}
          >
            <Settings2 />
            Editor settings
          </Menu.Item>
          <Menu.Separator className="spec-menu-separator" />
          <Menu.Item className="spec-menu-item" onSelect={() => backup(w.document, w.assets)}>
            <Download />
            Download recovery draft
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
  const notices = (
    <SpecWorkspaceNotices
      workspace={w}
      busy={operation}
      actionError={actionError}
      onSave={() => {
        void act(() => w.flush())
      }}
      onReload={() => {
        void act(async () => {
          if (await w.reload()) {
            setEditing(false)
            setSession((value) => value + 1)
          }
        })
      }}
      onRecover={() => {
        w.recover()
        setEditing(true)
        setSession((value) => value + 1)
      }}
      onRetryImages={() => {
        void act(() => w.retryImages())
      }}
      onDownload={backup}
    />
  )

  return (
    <div className="spec-workspace" data-testid="card-guard-spec-workspace">
      <div className="spec-page-topbar">
        <div className="spec-page-breadcrumb">
          <FileText size={16} aria-hidden="true" />
          <span>Card guard</span>
          <ChevronRight size={13} aria-hidden="true" />
          <span>Specification</span>
        </div>
        <div className="spec-page-actions">
          <SpecSaveStatus workspace={w} />
          <button
            type="button"
            className="spec-page-icon"
            aria-label="Version history"
            title="Version history"
            onClick={openHistory}
            disabled={!canEdit}
          >
            <History size={18} />
          </button>
          <span ref={editReturnTarget} className="spec-edit-return-target">
            <PrimaryButton
              labelSize="14"
              className="spec-primary-action !h-[32px] !w-auto !rounded-[4px] px-[14px]"
              disabled={!canEdit || operation || w.status === 'loading'}
              onClick={() => {
                void act(async () => {
                  await w.beginEditing()
                  setEditing(true)
                  setSession((value) => value + 1)
                })
              }}
            >
              <span className="spec-edit-label">
                <Pencil size={14} aria-hidden="true" />
                <span>Edit specification</span>
              </span>
            </PrimaryButton>
          </span>
          {moreMenu()}
        </div>
      </div>
      <header className="spec-page-header">
        <h2>Business analysis specification</h2>
        <div className="spec-page-byline">
          <span className="spec-author-avatar" aria-hidden="true">
            {(w.history[0]?.author ?? 'Workspace').slice(0, 1)}
          </span>
          <span>{w.history[0]?.author ?? 'Source document'}</span>
          {w.history[0] && (
            <>
              <span className="spec-byline-separator" />
              <span>Updated {timestamp(w.history[0].at)}</span>
            </>
          )}
          <span className="spec-page-version">{w.revision ? `Version ${w.revision}` : 'Source document'}</span>
        </div>
      </header>
      {!editing && notices}
      <div className="spec-document-layout spec-read-layout">
        <nav aria-label="Business analysis contents" className="spec-outline">
          <span className="spec-outline-title">Contents</span>
          {outline.map((entry, index) => (
            <button
              type="button"
              key={entry.index}
              className={entry.level > 2 ? 'spec-outline-child' : ''}
              onClick={(event) =>
                event.currentTarget
                  .closest('.spec-document-layout')
                  ?.querySelector(`[data-spec-heading="${index}"]`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              {entry.title}
            </button>
          ))}
        </nav>
        <article className="spec-document-main">
          <div
            className="spec-prose spec-read-document"
            ref={(element) => {
              element
                ?.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4')
                .forEach((heading, index) => heading.setAttribute('data-spec-heading', String(index)))
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
      <div className="spec-document-footer">
        <span>{words.toLocaleString('en-GB')} words</span>
        <span>{w.revision ? `Version ${w.revision}` : 'Source document'}</span>
      </div>
      <Dialog.Root
        open={editing}
        onOpenChange={(open) => {
          if (!open) closeEditor()
        }}
      >
        <Dialog.Portal>
          <Dialog.Content
            className="spec-composer"
            ref={composerTarget}
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              editReturnTarget.current?.querySelector('button')?.focus()
            }}
            data-testid="spec-confluence-composer"
            onKeyDownCapture={(event) => {
              if (event.defaultPrevented || !(event.ctrlKey || event.metaKey) || event.altKey) return
              if (event.key.toLowerCase() === 's') {
                event.preventDefault()
                event.stopPropagation()
                if (!operation) void act(() => w.flush())
              } else if (event.key === 'Enter') {
                event.preventDefault()
                event.stopPropagation()
                closeEditor()
              }
            }}
            onEscapeKeyDown={(event) => {
              event.preventDefault()
              if (globalThis.document.querySelector('.spec-insert-menu')) return
              closeEditor()
            }}
          >
            <Dialog.Title className="sr-only">Edit business analysis specification</Dialog.Title>
            <Dialog.Description className="sr-only">
              Edit the Card guard specification. Changes are saved automatically. Update or close to return to the
              document.
            </Dialog.Description>
            <header className="spec-composer-topbar">
              <div className="spec-composer-breadcrumb">
                <FileText size={19} aria-hidden="true" />
                <span>Card guard</span>
                <ChevronRight size={13} aria-hidden="true" />
                <span>Business analysis</span>
              </div>
              <div className="spec-composer-actions">
                <SpecSaveStatus workspace={w} />
                <button
                  type="button"
                  className="spec-page-icon"
                  aria-label="Version history"
                  title="Version history"
                  onClick={openHistory}
                  disabled={!canEdit}
                >
                  <History size={18} />
                </button>
                <button
                  type="button"
                  className="spec-text-action"
                  aria-label="Close editor"
                  disabled={operation || w.assetPending > 0}
                  onClick={closeEditor}
                >
                  Close
                </button>
                <PrimaryButton
                  labelSize="14"
                  className="spec-primary-action !h-[32px] !w-auto !rounded-[4px] px-[16px]"
                  disabled={!canEdit || operation || w.assetPending > 0 || w.status === 'conflict'}
                  onClick={closeEditor}
                >
                  Update
                </PrimaryButton>
                {moreMenu()}
              </div>
            </header>
            <div className="spec-composer-notices">{notices}</div>
            <Suspense
              fallback={
                <div className="spec-editor-loading" role="status">
                  Loading editor…
                </div>
              }
            >
              <RichTextEditor
                key={session}
                document={w.document}
                assets={w.assets}
                onChange={w.update}
                onUpload={w.upload}
                onCapture={onCapture}
                onAssetTask={w.trackAssetTask}
                onPendingImage={w.preservePendingImage}
              />
            </Suspense>
            <footer className="spec-composer-footer">
              <span>{saveStatus}</span>
              <span>
                {words.toLocaleString('en-GB')} words<span className="spec-footer-divider">·</span>Ctrl / ⌘ + S to save
                <span className="spec-footer-divider">·</span>Press / to insert
              </span>
            </footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="spec-dialog-overlay" />
          <Dialog.Content
            className="spec-dialog"
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              returnFocus(settingsReturnTarget.current)
            }}
          >
            <Dialog.Title className="uc-type-h2">Editor settings</Dialog.Title>
            <Dialog.Description className="spec-muted">
              {w.access ? 'Version history uses your verified personal account.' : 'Choose the name used for your entries in version history.'}
            </Dialog.Description>
            <TextField label="Name shown in version history" value={w.author} onChange={w.setAuthor} maxLength={80} disabled={Boolean(w.access)} />
            <div className="spec-actions">
              <Dialog.Close asChild>
                <button type="button" className="spec-command">
                  Done
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <SpecHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={w.history}
        currentRevision={w.revision}
        assets={w.assets}
        readRevision={w.readRevision}
        onRestore={async (revision) => {
          await w.restore(revision)
          setEditing(false)
          setSession((value) => value + 1)
        }}
        canRestore={w.access?.canRestore ?? true}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          returnFocus(historyReturnTarget.current)
        }}
      />
    </div>
  )
}
