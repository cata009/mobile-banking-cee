import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { EmailBlock, EmailColumn, EmailDocument } from '@/features/marketing-email/model'
import { BLOCK_LABELS } from '@/features/marketing-email/catalog'
import { IconArtwork } from './IconArtwork'

export type Selection = { type: 'block' | 'section'; id: string } | null
export function blockSummary(block: EmailBlock): string {
  return (
    block.content.title || block.content.text || block.content.label || block.content.alt || BLOCK_LABELS[block.kind]
  )
}

export function Canvas({
  doc,
  selection,
  targetColumn,
  select,
  setTargetColumn,
  move,
  duplicate,
  remove,
  moveSection,
  removeSection,
}: {
  doc: EmailDocument
  selection: Selection
  targetColumn: string
  select: (selection: Selection) => void
  setTargetColumn: (id: string) => void
  move: (id: string, columnId: string, index: number) => void
  duplicate: (id: string) => void
  remove: (id: string) => void
  moveSection: (id: string, delta: number) => void
  removeSection: (id: string) => void
}) {
  return (
    <div className="email-canvas" aria-label="Design email">
      <p className="email-help">Drag to reorder. Use Space and arrow keys on a handle, or use the move controls.</p>
      {doc.sections.map((section, i) => (
        <section
          key={section.id}
          className={`email-section ${selection?.id === section.id ? 'is-selected' : ''}`}
          aria-label={`Section ${i + 1}`}
        >
          <div className="email-section-toolbar">
            <button
              type="button"
              className="email-text-button"
              onClick={() => select({ type: 'section', id: section.id })}
            >
              Section {i + 1} · {section.columns.length} {section.columns.length === 1 ? 'column' : 'columns'}
            </button>
            <div className="email-row-actions">
              <button
                type="button"
                aria-label={`Move section ${i + 1} up`}
                disabled={i === 0}
                onClick={() => moveSection(section.id, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move section ${i + 1} down`}
                disabled={i === doc.sections.length - 1}
                onClick={() => moveSection(section.id, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                aria-label={`Delete section ${i + 1}`}
                disabled={doc.sections.length === 1}
                onClick={() => removeSection(section.id)}
              >
                Delete
              </button>
            </div>
          </div>
          <div className={`email-columns cols-${section.columns.length}`}>
            {section.columns.map((column, ci) => (
              <Column
                key={column.id}
                column={column}
                label={`S${i + 1} · Column ${ci + 1}`}
                active={targetColumn === column.id}
                activate={() => setTargetColumn(column.id)}
              >
                <SortableContext items={column.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  {column.blocks.map((block, bi) => (
                    <Block
                      key={block.id}
                      block={block}
                      selected={selection?.id === block.id}
                      select={() => {
                        select({ type: 'block', id: block.id })
                        setTargetColumn(column.id)
                      }}
                      up={() => move(block.id, column.id, bi - 1)}
                      down={() => move(block.id, column.id, bi + 1)}
                      first={bi === 0}
                      last={bi === column.blocks.length - 1}
                      duplicate={() => duplicate(block.id)}
                      remove={() => remove(block.id)}
                    />
                  ))}
                </SortableContext>
              </Column>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
function Column({
  column,
  label,
  active,
  activate,
  children,
}: {
  column: EmailColumn
  label: string
  active: boolean
  activate: () => void
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id, blockCount: column.blocks.length },
  })
  return (
    <div ref={setNodeRef} className={`email-column ${isOver ? 'is-over' : ''}`} data-email-column={column.id}>
      <button type="button" className="email-column-target" aria-pressed={active} onClick={activate}>
        {label}
        {active ? ' · Insert here' : ' · Choose for insertion'}
      </button>
      {children}
      {!column.blocks.length && (
        <p className="email-empty">Drop a block here, or choose this column and add from the library.</p>
      )}
    </div>
  )
}
function Block({
  block,
  selected,
  select,
  up,
  down,
  first,
  last,
  duplicate,
  remove,
}: {
  block: EmailBlock
  selected: boolean
  select: () => void
  up: () => void
  down: () => void
  first: boolean
  last: boolean
  duplicate: () => void
  remove: () => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { type: 'block', blockId: block.id },
  })
  const summary = blockSummary(block)
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined,
        transition,
        opacity: isDragging ? 0.45 : 1,
      }}
      className={`email-block ${selected ? 'is-selected' : ''}`}
      data-email-block={block.id}
    >
      <div className="email-block-top">
        <span className="email-help">{BLOCK_LABELS[block.kind]}</span>
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="email-drag-handle"
          aria-label={`Drag to move ${BLOCK_LABELS[block.kind]}`}
        >
          ⠿
        </button>
      </div>
      <button
        id={`select-${block.id}`}
        type="button"
        aria-label={`Select ${summary}`}
        aria-pressed={selected}
        className={`email-block-content kind-${block.kind}`}
        onClick={select}
      >
        {block.kind === 'icon' && block.icon ? (
          <IconArtwork variantId={block.icon.variantId} size={block.icon.size} />
        ) : block.kind === 'divider' ? (
          <hr />
        ) : block.kind === 'spacer' ? (
          <span>↕ {block.content.height} px</span>
        ) : (
          <span>{summary}</span>
        )}
        {block.kind === 'offer' && <small>{block.content.text}</small>}
        {['list', 'benefits'].includes(block.kind) && <small>{block.content.items.join(' · ')}</small>}
      </button>
      <div className="email-row-actions">
        <button type="button" aria-label="Move up" disabled={first} onClick={up}>
          ↑
        </button>
        <button type="button" aria-label="Move down" disabled={last} onClick={down}>
          ↓
        </button>
        <button type="button" onClick={duplicate}>
          Duplicate
        </button>
        <button type="button" onClick={remove}>
          Delete
        </button>
      </div>
    </div>
  )
}
