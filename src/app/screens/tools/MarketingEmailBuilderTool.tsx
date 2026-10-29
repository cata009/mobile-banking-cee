import { useEffect, useMemo, useRef, useState } from 'react'
import { AppIcon } from '@/app/components/icons'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import {
  BLOCK_LABELS,
  createBlock,
  createDocument,
  createSection,
  type TemplateId,
} from '@/features/marketing-email/catalog'
import {
  documentKey,
  parseDocument,
  serializeDocument,
  MAX_JSON_BYTES,
  type BlockKind,
  type EmailDocument,
} from '@/features/marketing-email/model'
import {
  commitHistory,
  createHistory,
  duplicateBlock,
  editDocument,
  locateBlock,
  moveBlock,
  redoHistory,
  undoHistory,
} from '@/features/marketing-email/transforms'
import { createCompilerClient } from '@/features/marketing-email/compileClient'
import { previewHtml, type CompiledEmail } from '@/features/marketing-email/compiler'
import { validateDocument } from '@/features/marketing-email/validation'
import { assertCurrentExport, createEmailPackage } from '@/features/marketing-email/export'
import {
  DRAFT_KEY,
  LIBRARY_KEY,
  createLibraryEntry,
  insertLibraryEntry,
  parseLibrary,
  readDraft,
  readLibrary,
  saveDraft,
  saveLibrary,
  serializeLibrary,
  type LibraryEntry,
  type LibraryPayload,
  type LocalStore,
} from '@/features/marketing-email/storage'
import { LibraryPanel, type LibraryTab } from './email-builder/CatalogPanel'
import { Canvas, type Selection } from './email-builder/Canvas'
import { PropertiesPanel } from './email-builder/PropertiesPanel'
import { Action } from './email-builder/fields'
import './email-builder/editor.css'
import { emailCollisions } from './email-builder/dragDrop'

function getStore(): LocalStore {
  try {
    return window.localStorage
  } catch {
    return {
      getItem: () => {
        throw new Error('Browser storage access is blocked')
      },
      setItem: () => {
        throw new Error('Browser storage access is blocked')
      },
    }
  }
}
function download(filename: string, data: string | Uint8Array, type: string) {
  const blob = new Blob([typeof data === 'string' ? data : new Uint8Array(data)], { type })
  const url = URL.createObjectURL(blob),
    anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function readFile(file: File): Promise<string> {
  if (file.size > MAX_JSON_BYTES) return Promise.reject(new Error('File too large (maximum 1 MB).'))
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('The file could not be read.'))
    reader.readAsText(file)
  })
}

export default function MarketingEmailBuilderTool() {
  const [store] = useState(getStore)
  const [initial] = useState(() => ({ draft: readDraft(store), library: readLibrary(store) }))
  const [history, setHistory] = useState(() => createHistory(initial.draft.value ?? createDocument('offer')))
  const doc = history.present
  const [selection, setSelection] = useState<Selection>(null)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [columnId, setColumnId] = useState(doc.sections[0]!.columns[0]!.id)
  const targetColumn = doc.sections.flatMap((s) => s.columns).some((c) => c.id === columnId)
    ? columnId
    : doc.sections[0]!.columns[0]!.id
  const [library, setLibrary] = useState(initial.library.value ?? [])
  const [libraryError, setLibraryError] = useState(initial.library.error)
  const [libraryName, setLibraryName] = useState('')
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('blocks')
  const [recoveryError, setRecoveryError] = useState(initial.draft.error)
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)
  const [saveStatus, setSaveStatus] = useState(
    initial.draft.value ? 'Local draft restored.' : 'Changes are saved on this device.',
  )
  const [view, setView] = useState<'compose' | 'preview'>('compose')
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const [mobile, setMobilee] = useState(false)
  const [images, setImages] = useState(true)
  const [showReport, setShowReport] = useState(false)
  const [compiled, setCompiled] = useState<CompiledEmail | null>(null)
  const [compileError, setCompileError] = useState<{ key: string; message: string } | null>(null)
  const [retry, setRetry] = useState(0)
  const [dragLabel, setDragLabel] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const focusAfterEdit = useRef<string | null>(null)
  const compiler = useMemo(createCompilerClient, [])
  const latest = useRef({ doc, recoveryError })
  latest.current = { doc, recoveryError }
  const key = documentKey(doc)
  const current = compiled?.sourceKey === key ? compiled : null
  const issues = useMemo(() => validateDocument(doc), [doc])
  const allIssues = current ? current.report.issues : issues
  const errors = allIssues.filter((i) => i.severity === 'error')
  const warnings = allIssues.filter((i) => i.severity === 'warning')
  const selected = selection?.type === 'block' ? locateBlock(doc, selection.id) : undefined
  const selectedSection =
    selection?.type === 'section' ? doc.sections.find((s) => s.id === selection.id) : selected?.section
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const renderedPreview = useMemo(
    () => (current ? previewHtml(doc, current, mode, images) : ''),
    [doc, current, mode, images],
  )

  useEffect(() => () => compiler.dispose(), [compiler])
  useEffect(() => {
    let live = true
    const timer = window.setTimeout(() => {
      void compiler.compile(doc).then(
        (result) => {
          if (live) {
            setCompiled(result)
            setCompileError(null)
          }
        },
        (error) => {
          if (live) setCompileError({ key, message: error instanceof Error ? error.message : 'Compilation failed.' })
        },
      )
    }, 250)
    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [compiler, doc, key, retry])
  useEffect(() => {
    if (recoveryError) return
    const timer = window.setTimeout(() => {
      const result = saveDraft(store, doc)
      setSaveStatus(result.error ?? `Saved locally · revision ${doc.revision}.`)
      if (result.error) setMessage({ text: result.error, error: true })
    }, 500)
    return () => clearTimeout(timer)
  }, [doc, store, recoveryError])
  useEffect(() => {
    const flush = () => {
      if (!latest.current.recoveryError) saveDraft(store, latest.current.doc)
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [store])
  useEffect(() => {
    if (focusAfterEdit.current) {
      document.getElementById(`select-${focusAfterEdit.current}`)?.focus()
      focusAfterEdit.current = null
    }
  }, [doc])
  useEffect(() => {
    if (!inspectorOpen || !window.matchMedia?.('(max-width: 1000px)').matches) return
    const firstField = [
      ...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        '.email-properties input, .email-properties textarea',
      ),
    ].find((field) => field.getClientRects().length > 0)
    firstField?.focus()
  }, [inspectorOpen, selection?.id])

  function fail(error: unknown) {
    setMessage({ text: error instanceof Error ? error.message : 'The action could not be completed.', error: true })
  }
  function apply(transform: (value: EmailDocument) => EmailDocument) {
    try {
      const next = transform(doc)
      setHistory((h) => commitHistory(h, next))
      setMessage(null)
    } catch (error) {
      fail(error)
    }
  }
  function update(edit: (value: EmailDocument) => void) {
    apply((value) => editDocument(value, edit))
  }
  function addBlock(kind: BlockKind, target = targetColumn, index?: number) {
    const block = createBlock(kind)
    update((d) => {
      const c = d.sections.flatMap((s) => s.columns).find((c) => c.id === target)
      if (!c) throw new Error('Choose an insertion column.')
      c.blocks.splice(index ?? c.blocks.length, 0, block)
    })
    setSelection({ type: 'block', id: block.id })
    setInspectorOpen(true)
    setColumnId(target)
    setAnnouncement(`${BLOCK_LABELS[kind]} added.`)
  }
  function move(id: string, target: string, index: number) {
    apply((d) => moveBlock(d, id, target, index))
    setAnnouncement('Block moved.')
    setColumnId(target)
    focusAfterEdit.current = id
  }
  function dragEnd(event: DragEndEvent) {
    setDragLabel(null)
    if (!event.over) return
    const over = event.over.data.current
    const loc = over?.type === 'block' ? locateBlock(doc, String(event.over.id)) : undefined
    const target = loc?.column.id ?? (over?.type === 'column' ? String(event.over.id) : undefined)
    if (!target) return
    const index = loc?.index ?? doc.sections.flatMap((s) => s.columns).find((c) => c.id === target)!.blocks.length
    if (event.active.data.current?.type === 'catalog')
      addBlock(event.active.data.current.kind as BlockKind, target, index)
    else move(String(event.active.id), target, index)
  }
  function persistLibrary(next: LibraryEntry[]) {
    if (libraryError) {
      fail(new Error('The saved library cannot be read. Export the original data before replacing it.'))
      return
    }
    const result = saveLibrary(store, next)
    if (result.error) fail(new Error(result.error))
    else {
      setLibrary(next)
      setLibraryTab('saved')
      setMessage({ text: 'Library saved. Insertions are independent copies.' })
    }
  }
  function saveEntry(payload: LibraryPayload) {
    try {
      const name =
        libraryName.trim() ||
        (payload.type === 'block'
          ? `${BLOCK_LABELS[payload.block.kind]} saved`
          : payload.type === 'section'
            ? 'Saved section'
            : doc.name)
      persistLibrary([...library, createLibraryEntry(name, payload)])
    } catch (error) {
      fail(error)
    }
  }
  function save() {
    if (recoveryError) {
      fail(
        new Error(
          'Autosave is paused to preserve the original data. Export JSON or explicitly replace the saved draft.',
        ),
      )
      return
    }
    const result = saveDraft(store, doc)
    if (result.error) fail(new Error(result.error))
    else setSaveStatus(`Saved locally · revision ${doc.revision}.`)
  }
  function finalExport(kind: 'zip' | 'html' | 'text') {
    try {
      if (!current) throw new Error('Preparing the current revision.')
      assertCurrentExport(doc, current)
      if (kind === 'zip') download('marketing-email.zip', createEmailPackage(doc, current), 'application/zip')
      else
        download(
          `email.${kind === 'text' ? 'txt' : 'html'}`,
          kind === 'text' ? current.text : current.html,
          kind === 'text' ? 'text/plain;charset=utf-8' : 'text/html;charset=utf-8',
        )
      setMessage({
        text: 'Download prepared. Check rendering and variables in your marketing platform before sending.',
      })
    } catch (error) {
      fail(error)
    }
  }
  async function importDocument(file: File) {
    try {
      const imported = parseDocument(await readFile(file))
      setHistory((h) => commitHistory(h, { ...imported, revision: h.present.revision + 1 }))
      setSelection(null)
      setMessage({ text: 'Document imported. Use Undo to return to the previous draft.' })
    } catch (error) {
      fail(error)
    }
  }
  async function importLibrary(file: File) {
    try {
      persistLibrary(parseLibrary(await readFile(file)))
    } catch (error) {
      fail(error)
    }
  }
  function applyTemplate(id: TemplateId) {
    apply((d) => ({ ...createDocument(id), revision: d.revision + 1 }))
    setSelection(null)
  }
  function backupOriginal(key: string, name: string) {
    try {
      download(name, store.getItem(key) ?? '', 'application/json')
    } catch (error) {
      fail(error)
    }
  }

  return (
    <div className="email-builder" data-email-builder>
      <div className="email-document-bar">
        <div className="email-document-title">
          <span className="email-document-mark">
            <AppIcon name="book-open" size={24} />
          </span>
          <div>
            <p className="email-eyebrow">EMAIL STUDIO</p>
            <h2>{doc.name}</h2>
          </div>
        </div>
        <div className="email-document-state">
          <span className={`email-state-dot ${errors.length ? 'has-issues' : ''}`} />
          {errors.length ? `${errors.length} issues to resolve` : 'Ready for export'}
          <span className="email-version">Draft · v1</span>
        </div>
      </div>
      <div className="email-toolbar" aria-label="Editor actions">
        <div className="email-history-controls">
          <Action icon="back-heavy" disabled={!history.past.length} onClick={() => setHistory(undoHistory)}>
            Undo
          </Action>
          <Action icon="arrow-right" disabled={!history.future.length} onClick={() => setHistory(redoHistory)}>
            Redo
          </Action>
        </div>
        <div className="email-view-switch" aria-label="Workspace view">
          <button type="button" aria-pressed={view === 'compose'} onClick={() => setView('compose')}>
            Design
          </button>
          <button type="button" aria-pressed={view === 'preview'} onClick={() => setView('preview')}>
            Preview
          </button>
        </div>
        <span className="email-toolbar-spacer" />
        <Action icon="clipboard-check" onClick={() => setShowReport((v) => !v)}>
          Review
        </Action>
        <Action
          onClick={() => {
            setSelection(null)
            setInspectorOpen(true)
          }}
        >
          Settings
        </Action>
        <details className="email-file-menu">
          <summary>File</summary>
          <div className="email-file-menu-content">
            <Action onClick={save}>Save draft</Action>
            <Action onClick={() => download('document.json', serializeDocument(doc), 'application/json')}>
              Export editable JSON
            </Action>
            <label className="email-file-label">
              Import document JSON
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void importDocument(file)
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        </details>
        <Action icon="arrow-right" disabled={!current || errors.length > 0} onClick={() => finalExport('zip')} primary>
          Export ZIP
        </Action>
      </div>
      <div className="email-status-line">
        <p role="status">{saveStatus}</p>
        <p>
          {current
            ? `${(current.report.htmlBytes / 1024).toFixed(1)} KB HTML · ${current.report.resources.length} assets`
            : compileError?.key === key
              ? 'Compilation failed'
              : 'Preparing preview…'}{' '}
          · {errors.length} errors · {warnings.length} warnings
        </p>
      </div>
      {(message?.error || recoveryError) && (
        <div role="alert" className="email-error">
          {message?.error ? message.text : recoveryError}
        </div>
      )}
      {message && !message.error && (
        <p role="status" className="email-notice">
          {message.text}
        </p>
      )}
      {recoveryError && (
        <div className="email-recovery">
          <p>Autosave is paused. Your original data is preserved.</p>
          <Action onClick={() => backupOriginal(DRAFT_KEY, 'draft-original.json')}>Download original data</Action>
          <Action
            onClick={() => {
              const result = saveDraft(store, doc)
              if (result.error) fail(new Error(result.error))
              else {
                setRecoveryError(undefined)
                setMessage(null)
              }
            }}
          >
            Replace unreadable draft
          </Action>
        </div>
      )}
      {compileError?.key === key && (
        <div className="email-error">
          <p>{compileError.message}</p>
          <Action onClick={() => setRetry((v) => v + 1)}>Retry compilation</Action>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={emailCollisions}
        onDragStart={(event) =>
          setDragLabel(
            event.active.data.current?.type === 'catalog'
              ? BLOCK_LABELS[event.active.data.current.kind as BlockKind]
              : BLOCK_LABELS[locateBlock(doc, String(event.active.id))!.block.kind],
          )
        }
        onDragCancel={() => setDragLabel(null)}
        onDragEnd={dragEnd}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              'Press Space to pick up a block, use arrow keys to move it, Space to drop, and Escape to cancel.',
          },
        }}
      >
        <div className="email-workspace">
          <LibraryPanel
            activeTab={libraryTab}
            setActiveTab={setLibraryTab}
            addBlock={addBlock}
            addSection={(columns) => {
              const section = createSection(columns)
              update((d) => {
                d.sections.push(section)
              })
              setSelection({ type: 'section', id: section.id })
              setInspectorOpen(true)
              setColumnId(section.columns[0]!.id)
            }}
            applyTemplate={applyTemplate}
            library={library}
            libraryName={libraryName}
            setLibraryName={setLibraryName}
            saveTemplate={() => saveEntry({ type: 'template', document: doc })}
            insertEntry={(entry) => apply((d) => insertLibraryEntry(d, entry, targetColumn))}
            deleteEntry={(id) => persistLibrary(library.filter((e) => e.id !== id))}
            importLibrary={(file) => {
              void importLibrary(file)
            }}
            exportLibrary={() => {
              if (libraryError) backupOriginal(LIBRARY_KEY, 'library-original.json')
              else download('email-library.json', serializeLibrary(library), 'application/json')
            }}
            libraryError={libraryError}
            recoverLibrary={() => {
              const result = saveLibrary(store, [])
              if (result.error) fail(new Error(result.error))
              else {
                setLibrary([])
                setLibraryError(undefined)
              }
            }}
          />
          <main className="email-composition email-panel" aria-label="Editor email">
            <div className="email-center-heading">
              <h2>{view === 'compose' ? 'Design canvas' : 'Email preview'}</h2>
              <span>600 px email · revision {doc.revision}</span>
            </div>
            {view === 'compose' ? (
              <Canvas
                doc={doc}
                selection={selection}
                targetColumn={targetColumn}
                select={(value) => {
                  setSelection(value)
                  setInspectorOpen(value !== null)
                }}
                setTargetColumn={setColumnId}
                move={move}
                duplicate={(id) => apply((d) => duplicateBlock(d, id))}
                remove={(id) => {
                  const loc = locateBlock(doc, id)
                  const nextId = loc?.column.blocks[loc.index + 1]?.id ?? loc?.column.blocks[loc.index - 1]?.id
                  update((d) => {
                    const found = locateBlock(d, id)
                    found?.column.blocks.splice(found.index, 1)
                  })
                  setSelection(nextId ? { type: 'block', id: nextId } : null)
                  focusAfterEdit.current = nextId ?? null
                }}
                moveSection={(id, delta) =>
                  update((d) => {
                    const i = d.sections.findIndex((s) => s.id === id)
                    const s = d.sections.splice(i, 1)[0]!
                    d.sections.splice(i + delta, 0, s)
                  })
                }
                removeSection={(id) => {
                  update((d) => {
                    d.sections = d.sections.filter((s) => s.id !== id)
                  })
                  setSelection(null)
                }}
              />
            ) : (
              <>
                <div className="email-preview-controls">
                  <button type="button" aria-pressed={!mobile} onClick={() => setMobilee(false)}>
                    Desktop
                  </button>
                  <button type="button" aria-pressed={mobile} onClick={() => setMobilee(true)}>
                    Mobile
                  </button>
                  <button type="button" aria-pressed={mode === 'light'} onClick={() => setMode('light')}>
                    Light
                  </button>
                  <button type="button" aria-pressed={mode === 'dark'} onClick={() => setMode('dark')}>
                    Dark
                  </button>
                  <button type="button" aria-pressed={!images} onClick={() => setImages((v) => !v)}>
                    {images ? 'Images off' : 'Images on'}
                  </button>
                </div>
                <p className="email-help">
                  Designed appearance. Email clients may differ. Links are disabled in this preview.
                </p>
                {current ? (
                  <iframe
                    title="Compiled email"
                    sandbox=""
                    referrerPolicy="no-referrer"
                    srcDoc={renderedPreview}
                    className="email-preview-frame"
                    style={{ width: mobile ? 375 : 600 }}
                  />
                ) : (
                  <p role="status">Preparing the current revision.</p>
                )}
                <div className="email-toolbar">
                  <Action disabled={!current || errors.length > 0} onClick={() => finalExport('html')}>
                    Export HTML
                  </Action>
                  <Action disabled={!current || errors.length > 0} onClick={() => finalExport('text')}>
                    Export plain text
                  </Action>
                </div>
              </>
            )}
            {showReport && (
              <section className="email-report" aria-label="Validation report">
                <h3>Preflight review</h3>
                <p>
                  {errors.length} errors block export · {warnings.length} warnings
                </p>
                <ul>
                  {allIssues.map((issue, i) => (
                    <li key={`${issue.code}-${i}`} className={issue.severity === 'error' ? 'email-error' : ''}>
                      <strong>{issue.severity === 'error' ? 'Error' : 'Warning'}: </strong>
                      {issue.message}
                      {issue.blockId && (
                        <button
                          type="button"
                          className="email-text-button"
                          onClick={() => {
                            setView('compose')
                            setSelection({ type: 'block', id: issue.blockId! })
                            document.getElementById(`select-${issue.blockId}`)?.scrollIntoView?.({ block: 'center' })
                          }}
                        >
                          Select block
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <Action
                  disabled={!current}
                  onClick={() => {
                    if (current) download('report.json', JSON.stringify(current.report, null, 2), 'application/json')
                  }}
                >
                  Download report
                </Action>
              </section>
            )}
          </main>
          <PropertiesPanel
            open={inspectorOpen}
            close={() => {
              setInspectorOpen(false)
              if (selection?.type === 'block') document.getElementById(`select-${selection.id}`)?.focus()
            }}
            doc={doc}
            block={selected?.block}
            section={selectedSection}
            updateDocument={update}
            updateBlock={(edit) => {
              if (selected) update((d) => edit(locateBlock(d, selected.block.id)!.block))
            }}
            updateSection={(edit) => {
              if (selectedSection) update((d) => edit(d.sections.find((s) => s.id === selectedSection.id)!))
            }}
            saveBlock={() => {
              if (selected) saveEntry({ type: 'block', block: selected.block })
            }}
            saveSection={() => {
              if (selectedSection) saveEntry({ type: 'section', section: selectedSection })
            }}
          />
        </div>
        <DragOverlay>{dragLabel && <div className="email-drag-overlay">{dragLabel}</div>}</DragOverlay>
      </DndContext>
      <p className="email-help">Draft templates. Stored on this device. No campaigns are sent from this editor.</p>
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>
    </div>
  )
}
