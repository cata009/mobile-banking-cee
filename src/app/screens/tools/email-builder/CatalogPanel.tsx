import { useDraggable } from '@dnd-kit/core'
import { useState } from 'react'
import { AppIcon } from '@/app/components/icons'
import TextField from '@/app/components/TextField'
import { BLOCK_KINDS, type BlockKind } from '@/features/marketing-email/model'
import { BLOCK_LABELS, TEMPLATES, type TemplateId } from '@/features/marketing-email/catalog'
import type { LibraryEntry } from '@/features/marketing-email/storage'
import { Action } from './fields'
import { BLOCK_ICONS } from './blockIcons'

export type LibraryTab = 'blocks' | 'layouts' | 'templates' | 'saved'

export function LibraryPanel({
  addBlock,
  addSection,
  applyTemplate,
  library,
  libraryName,
  setLibraryName,
  saveTemplate,
  insertEntry,
  deleteEntry,
  importLibrary,
  exportLibrary,
  libraryError,
  recoverLibrary,
  activeTab,
  setActiveTab,
}: {
  addBlock: (kind: BlockKind) => void
  addSection: (columns: 1 | 2) => void
  applyTemplate: (id: TemplateId) => void
  library: LibraryEntry[]
  libraryName: string
  setLibraryName: (name: string) => void
  saveTemplate: () => void
  insertEntry: (entry: LibraryEntry) => void
  deleteEntry: (id: string) => void
  importLibrary: (file: File) => void
  exportLibrary: () => void
  libraryError?: string
  recoverLibrary: () => void
  activeTab: LibraryTab
  setActiveTab: (tab: LibraryTab) => void
}) {
  const [search, setSearch] = useState('')
  return (
    <aside className="email-catalog email-panel" aria-label="Content library">
      <h2>Library</h2>
      <div className="email-library-tabs" aria-label="Library categories">
        {(['blocks', 'layouts', 'templates', 'saved'] as const).map((tab) => (
          <button type="button" key={tab} aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)}>
            {{ blocks: 'Blocks', layouts: 'Layouts', templates: 'Templates', saved: 'Saved' }[tab]}
          </button>
        ))}
      </div>
      {activeTab === 'blocks' && (
        <>
          <TextField label="Search blocks" value={search} onChange={setSearch} forceFloatLabel />
          <p className="email-help">Click to insert. Drag to place.</p>
          <div className="email-catalog-blocks">
            {BLOCK_KINDS.filter((kind) => BLOCK_LABELS[kind].toLowerCase().includes(search.toLowerCase())).map(
              (kind) => (
                <LibraryBlock key={kind} kind={kind} add={() => addBlock(kind)} />
              ),
            )}
          </div>
        </>
      )}
      {activeTab === 'layouts' && (
        <>
          <h3>Section layouts</h3>
          <p className="email-help">Add a section, then fill each column with blocks.</p>
          <div className="email-stack">
            {[1, 2].map((count) => (
              <button
                type="button"
                className="email-layout-option"
                key={count}
                onClick={() => addSection(count as 1 | 2)}
              >
                <span className="email-layout-diagram" aria-hidden="true">
                  {Array.from({ length: count }, (_, i) => (
                    <span key={i} />
                  ))}
                </span>
                {count === 1 ? 'One column' : 'Two columns'}
              </button>
            ))}
          </div>
        </>
      )}
      {activeTab === 'templates' && (
        <>
          <h3>Starter templates</h3>
          <p className="email-help">Start a new design. Undo restores your previous draft.</p>
          <div className="email-stack">
            {TEMPLATES.map((t, i) => (
              <button type="button" className="email-template-option" key={t.id} onClick={() => applyTemplate(t.id)}>
                <span className={`email-template-diagram template-${t.id}`} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span>
                  <small>0{i + 1} / STARTER</small>
                  <strong>{t.label}</strong>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      {activeTab === 'saved' && (
        <>
          <h3>Your library</h3>
          <p className="email-help">Reusable blocks, sections and templates. Saved on this device.</p>
          {libraryError && (
            <div className="email-error">
              <p>{libraryError}</p>
              <Action onClick={recoverLibrary}>Replace unreadable library</Action>
            </div>
          )}
          <div className="email-stack">
            <TextField
              label="Library name (optional)"
              value={libraryName}
              onChange={setLibraryName}
              maxLength={200}
              forceFloatLabel
            />
            <Action onClick={saveTemplate}>Save as template</Action>
            <Action onClick={exportLibrary}>Export library JSON</Action>
            <label className="email-file-label">
              Import library JSON
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) importLibrary(file)
                  e.target.value = ''
                }}
              />
            </label>
          </div>
          <ul className="email-library">
            {library.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="email-text-button"
                  aria-label={`Insert ${entry.name}`}
                  onClick={() => insertEntry(entry)}
                >
                  {entry.name}
                  <small>
                    {entry.payload.type} · v{entry.version}
                  </small>
                </button>
                <button
                  type="button"
                  className="email-text-button"
                  aria-label={`Remove from library ${entry.name}`}
                  onClick={() => deleteEntry(entry.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          {!library.length && (
            <p className="email-empty">Your reusable blocks, sections and templates will appear here.</p>
          )}
        </>
      )}
    </aside>
  )
}
function LibraryBlock({ kind, add }: { kind: BlockKind; add: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: `catalog-${kind}`,
    data: { type: 'catalog', kind },
  })
  return (
    <div ref={setNodeRef} className="email-catalog-block" style={{ opacity: isDragging ? 0.4 : 1 }}>
      <button type="button" aria-label={`Add ${BLOCK_LABELS[kind]}`} onClick={add}>
        <AppIcon name={BLOCK_ICONS[kind]} size={22} />
        <span>{BLOCK_LABELS[kind]}</span>
      </button>
      <button
        type="button"
        className="email-drag-handle"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Drag from library ${BLOCK_LABELS[kind]}`}
      >
        ⠿
      </button>
    </div>
  )
}
