import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  FileText,
  Search,
  X,
  Type,
  List,
  ListOrdered,
  Table2,
  Info,
  AlertTriangle,
  ChevronDown,
  Image as ImageIcon,
  Tag,
} from 'lucide-react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import * as Dialog from '@radix-ui/react-dialog'
import PrimaryButton from '@/app/components/PrimaryButton'
import TextField from '@/app/components/TextField'
import { hydrateDocument } from '@/features/flow-spec/document'
import { safeSpecLink } from '@/features/flow-spec/schema.mjs'
import type { SpecAsset, SpecDocument } from '@/features/flow-spec/types'
import { specEditorExtensions } from './extensions'
import SpecEditorToolbar from './SpecEditorToolbar'

interface Props {
  document: SpecDocument
  assets: SpecAsset[]
  onChange(document: SpecDocument): void
  onUpload(name: string, dataUrl: string): Promise<SpecAsset>
  onCapture(): Promise<SpecAsset>
  onAssetTask(task: () => Promise<void>): Promise<void>
  onPendingImage(asset: SpecAsset): void
}
export function fileDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('The image could not be read.'))
    reader.readAsDataURL(file)
  })
}

export function insertAttachment(editor: Editor, asset: SpecAsset): boolean {
  // Insert after the selection, then leave the cursor in a paragraph. A node
  // selection on an earlier image must never turn Upload into Replace.
  return editor
    .chain()
    .focus()
    .insertContentAt(editor.state.selection.to, [
      {
        type: 'image',
        attrs: {
          src: asset.dataUrl,
          assetId: asset.id,
          alt: asset.name,
          width: Math.min(asset.width, 640),
          height: null,
        },
      },
      { type: 'paragraph' },
    ])
    .run()
}

function Command({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick(): void
  children?: ReactNode
}) {
  return (
    <button
      type="button"
      className="spec-command"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children ?? label}
    </button>
  )
}

export default function SpecRichTextEditor({
  document,
  assets,
  onChange,
  onUpload,
  onCapture,
  onAssetTask,
  onPendingImage,
}: Props) {
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [slash, setSlash] = useState(false)
  const [insertPosition, setInsertPosition] = useState({ left: 24, top: 160 })
  const insertMenu = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [dialog, setDialog] = useState<'link' | 'expand' | 'status' | null>(null)
  const [value, setValue] = useState('')
  useEffect(() => {
    if (!slash) return
    insertMenu.current?.querySelector('input')?.focus()
    const dismiss = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('.spec-insert-trigger')) return
      if (event.target instanceof Node && !insertMenu.current?.contains(event.target)) setSlash(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setSlash(false)
        editorRef.current?.commands.focus()
      }
    }
    globalThis.document.addEventListener('mousedown', dismiss)
    globalThis.document.addEventListener('keydown', escape)
    return () => {
      globalThis.document.removeEventListener('mousedown', dismiss)
      globalThis.document.removeEventListener('keydown', escape)
    }
  }, [slash])
  const fileInput = useRef<HTMLInputElement>(null)
  const callbacks = useRef({ onChange, onUpload })
  callbacks.current = { onChange, onUpload }
  const editorRef = useRef<Editor | null>(null)
  const extensions = useMemo(specEditorExtensions, [])

  const insertFiles = async (files: File[]) => {
    if (!files.length || busy) return
    setBusy(true)
    setNotice('')
    try {
      await onAssetTask(async () => {
        for (const file of files) {
          if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 5 * 1024 * 1024)
            throw new Error('Choose PNG or JPEG images, up to 5 MB each.')
          const asset = await callbacks.current.onUpload(file.name, await fileDataUrl(file))
          insertAsset(asset)
        }
      })
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Image upload failed.')
    } finally {
      setBusy(false)
    }
  }
  const fileHandler = useRef(insertFiles)
  fileHandler.current = insertFiles
  const editor = useEditor({
    extensions,
    content: hydrateDocument(document, assets),
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: current }) => callbacks.current.onChange(current.getJSON() as SpecDocument),
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-label': 'Business analysis document',
        'aria-multiline': 'true',
        spellcheck: 'true',
        class: 'spec-prose spec-canvas',
      },
      handleKeyDown: (_view, event) => {
        if (
          event.key === '/' &&
          !event.ctrlKey &&
          !event.metaKey &&
          _view.state.selection.$from.parent.textContent.length === 0
        ) {
          event.preventDefault()
          setQuery('')
          const coordinates = _view.coordsAtPos(_view.state.selection.from)
          setInsertPosition({ left: coordinates.left, top: coordinates.bottom + 6 })
          setSlash(true)
          return true
        }
        if (event.key === 'Escape') setSlash(false)
        return false
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? [])
        if (files.length) {
          void fileHandler.current(files)
          return true
        }
        if (event.clipboardData?.getData('text/html').includes('<img'))
          setNotice(
            'External images were omitted. Upload PNG/JPEG files or insert a screen to keep images in the document.',
          )
        return false
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? [])
        if (!files.length) return false
        event.preventDefault()
        void fileHandler.current(files)
        return true
      },
    },
  })
  editorRef.current = editor
  function insertAsset(asset: SpecAsset) {
    const current = editorRef.current
    if (!current || current.isDestroyed) {
      onPendingImage(asset)
      return
    }
    if (!insertAttachment(current, asset)) throw new Error('Select a paragraph before inserting an image.')
  }
  if (!editor) return <p role="status">Loading editor…</p>
  const openDialog = (kind: 'link' | 'expand' | 'status') => {
    setValue(
      kind === 'link'
        ? String(editor.getAttributes('link').href ?? '')
        : kind === 'expand'
          ? String(editor.getAttributes('specExpand').title ?? 'Details')
          : String(editor.getAttributes('specStatus').label ?? 'In review'),
    )
    setNotice('')
    setDialog(kind)
  }
  const insertBlock = (type: string, attrs?: Record<string, unknown>) =>
    editor
      .chain()
      .focus()
      .insertContent({ type, ...(attrs ? { attrs } : {}), content: [{ type: 'paragraph' }] })
      .run()
  const commands = [
    { label: 'Heading', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'Bullet list', action: () => editor.chain().focus().toggleBulletList().run() },
    { label: 'Numbered list', action: () => editor.chain().focus().toggleOrderedList().run() },
    {
      label: 'Table',
      action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    { label: 'Info panel', action: () => insertBlock('specPanel', { tone: 'info' }) },
    { label: 'Warning panel', action: () => insertBlock('specPanel', { tone: 'warning' }) },
    { label: 'Expand', action: () => openDialog('expand') },
    { label: 'Status', action: () => openDialog('status') },
    { label: 'Image', action: () => fileInput.current?.click() },
  ]
  const capture = async () => {
    setBusy(true)
    setNotice('')
    try {
      await onAssetTask(async () => {
        insertAsset(await onCapture())
      })
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not capture the screen.')
    } finally {
      setBusy(false)
    }
  }
  const applyDialog = () => {
    if (dialog === 'link') {
      if (value && !safeSpecLink(value)) {
        setNotice('Use a full https://, http:// or mailto: address.')
        return
      }
      if (value && editor.state.selection.empty && !editor.isActive('link'))
        editor
          .chain()
          .focus()
          .insertContent({ type: 'text', text: value, marks: [{ type: 'link', attrs: { href: value } }] })
          .run()
      else if (value) editor.chain().focus().extendMarkRange('link').setLink({ href: value }).run()
      else editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else if (dialog === 'expand') {
      const attrs = { title: value.trim().slice(0, 120) || 'Details' }
      if (editor.isActive('specExpand')) editor.chain().focus().updateAttributes('specExpand', attrs).run()
      else insertBlock('specExpand', attrs)
    } else {
      const attrs = { label: value.trim().slice(0, 80) || 'In review', tone: 'info' }
      if (editor.isActive('specStatus')) editor.chain().focus().updateAttributes('specStatus', attrs).run()
      else editor.chain().focus().insertContent({ type: 'specStatus', attrs }).run()
    }
    setDialog(null)
  }
  return (
    <div className="spec-editor">
      <header className="spec-writing-context">
        <div className="spec-writing-meta">
          <FileText size={14} aria-hidden="true" />
          <span>Card guard</span>
          <span className="spec-draft-label">Draft</span>
        </div>
        <h1>Business analysis specification</h1>
      </header>
      <SpecEditorToolbar
        editor={editor}
        busy={busy}
        onLink={() => openDialog('link')}
        onImage={() => fileInput.current?.click()}
        onCapture={() => {
          void capture()
        }}
        onInsert={(anchor) => {
          setInsertPosition({ left: anchor.left, top: anchor.bottom + 6 })
          setQuery('')
          setSlash((value) => !value)
        }}
      />
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        className="sr-only"
        aria-label="Choose images"
        onChange={(event) => {
          void insertFiles(Array.from(event.target.files ?? []))
          event.target.value = ''
        }}
      />
      {editor.isActive('table') && (
        <div role="toolbar" aria-label="Table editing" className="spec-toolbar spec-context-toolbar">
          <Command label="Add row" onClick={() => editor.chain().focus().addRowAfter().run()} />
          <Command label="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()} />
          <Command label="Remove row" onClick={() => editor.chain().focus().deleteRow().run()} />
          <Command label="Remove column" onClick={() => editor.chain().focus().deleteColumn().run()} />
          <Command
            label="Merge cells"
            disabled={!editor.can().mergeCells()}
            onClick={() => editor.chain().focus().mergeCells().run()}
          />
          <Command
            label="Split cell"
            disabled={!editor.can().splitCell()}
            onClick={() => editor.chain().focus().splitCell().run()}
          />
          <Command label="Remove table" onClick={() => editor.chain().focus().deleteTable().run()} />
        </div>
      )}
      {editor.isActive('image') && (
        <div className="spec-toolbar spec-context-toolbar" role="toolbar" aria-label="Image editing">
          <label>
            Caption{' '}
            <input
              aria-label="Image caption"
              value={String(editor.getAttributes('image').alt ?? '')}
              onChange={(e) => editor.chain().updateAttributes('image', { alt: e.target.value }).run()}
            />
          </label>
          {[240, 480, 640].map((width) => (
            <Command
              key={width}
              label={`Image width ${width}`}
              onClick={() => editor.chain().focus().updateAttributes('image', { width }).run()}
            >
              {width}px
            </Command>
          ))}
        </div>
      )}
      {slash && (
        <div
          ref={insertMenu}
          className="spec-insert-menu"
          role="dialog"
          tabIndex={-1}
          aria-label="Insert block"
          style={{
            left: Math.min(insertPosition.left, Math.max(12, window.innerWidth - 300)),
            top: Math.min(insertPosition.top, Math.max(90, window.innerHeight - 390)),
          }}
        >
          <div className="spec-insert-search">
            <Search size={16} aria-hidden="true" />
            <input
              aria-label="Find a block"
              placeholder="Search insert…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              type="button"
              aria-label="Close insert menu"
              onClick={() => {
                setSlash(false)
                editor.commands.focus()
              }}
            >
              <X size={14} />
            </button>
          </div>
          <span className="spec-menu-label">Insert content</span>
          {commands
            .filter((command) => command.label.toLowerCase().includes(query.toLowerCase()))
            .map((command) => (
              <button
                type="button"
                className="spec-insert-item"
                key={command.label}
                aria-label={command.label}
                onClick={() => {
                  command.action()
                  setSlash(false)
                }}
              >
                {(() => {
                  const Icon = (
                    {
                      Heading: Type,
                      'Bullet list': List,
                      'Numbered list': ListOrdered,
                      Table: Table2,
                      'Info panel': Info,
                      'Warning panel': AlertTriangle,
                      Expand: ChevronDown,
                      Status: Tag,
                      Image: ImageIcon,
                    } as const
                  )[command.label as 'Heading']
                  return <Icon size={18} aria-hidden="true" />
                })()}
                <span>{command.label}</span>
              </button>
            ))}
        </div>
      )}
      {notice && (
        <p role="alert" className="spec-notice">
          {notice}
        </p>
      )}
      {busy && (
        <p role="status" className="spec-notice">
          Adding image…
        </p>
      )}
      <EditorContent editor={editor} className="spec-edit-scroll" />

      <Dialog.Root
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null)
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="spec-dialog-overlay" />
          <Dialog.Content
            className="spec-dialog"
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              editor.commands.focus()
            }}
          >
            <Dialog.Title className="uc-type-h2">
              {dialog === 'link' ? 'Edit link' : dialog === 'expand' ? 'Expandable section' : 'Status label'}
            </Dialog.Title>
            <Dialog.Description className="spec-muted">
              {dialog === 'link'
                ? 'Add a web address to the selected text. Clear the address to remove the link.'
                : 'Choose the label shown in the document.'}
            </Dialog.Description>
            <TextField
              label={dialog === 'link' ? 'Address' : 'Label'}
              value={value}
              onChange={setValue}
              maxLength={dialog === 'link' ? 2000 : 120}
            />
            {notice && <p role="alert">{notice}</p>}
            <div className="spec-actions">
              <Dialog.Close asChild>
                <button className="spec-command" type="button">
                  Cancel
                </button>
              </Dialog.Close>
              <PrimaryButton className="!w-auto px-[24px]" onClick={applyDialog}>
                Apply
              </PrimaryButton>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
