import type { Editor } from '@tiptap/react'
import type { ReactNode } from 'react'
import * as Menu from '@radix-ui/react-dropdown-menu'
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code2,
  List,
  ListOrdered,
  Link2,
  Table2,
  Image,
  Plus,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Highlighter,
  Minus,
  MoreHorizontal,
  Camera,
} from 'lucide-react'

/** Direct host adaptation of all-in-one's editorToolbar and toolbarPrimitives. */
export function EditorTool({
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
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className="spec-icon-tool"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
function ToolMenu({
  label,
  icon,
  editor,
  children,
}: {
  label: string
  icon: ReactNode
  editor: Editor
  children: ReactNode
}) {
  return (
    <Menu.Root>
      <Menu.Trigger className="spec-icon-tool spec-tool-dropdown" aria-label={label} title={label}>
        {icon}
        <ChevronDown size={10} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          className="spec-tool-menu"
          align="start"
          sideOffset={5}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            editor.commands.focus()
          }}
        >
          {children}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
const Item = ({ children, onSelect }: { children: ReactNode; onSelect(): void }) => (
  <Menu.Item className="spec-menu-item" onSelect={onSelect}>
    {children}
  </Menu.Item>
)
const Separator = () => <span className="spec-toolbar-divider" aria-hidden="true" />

export default function SpecEditorToolbar({
  editor,
  busy,
  onLink,
  onImage,
  onCapture,
  onInsert,
}: {
  editor: Editor
  busy: boolean
  onLink(): void
  onImage(): void
  onCapture(): void
  onInsert(anchor: DOMRect): void
}) {
  return (
    <div
      role="toolbar"
      aria-label="Document formatting"
      className="spec-format-bar"
      data-testid="spec-rich-text-editor-toolbar"
    >
      <div className="spec-format-tools">
        <label className="spec-paragraph-control">
          <span className="sr-only">Paragraph style</span>
          <select
            aria-label="Paragraph style"
            value={editor.isActive('heading') ? String(editor.getAttributes('heading').level) : 'paragraph'}
            onChange={(event) => {
              const value = event.target.value
              if (value === 'paragraph') editor.chain().focus().setParagraph().run()
              else
                editor
                  .chain()
                  .focus()
                  .setHeading({ level: Number(value) as 1 | 2 | 3 | 4 })
                  .run()
            }}
          >
            <option value="paragraph">Paragraph</option>
            {[1, 2, 3, 4].map((level) => (
              <option key={level} value={level}>
                Heading {level}
              </option>
            ))}
          </select>
          <ChevronDown size={12} aria-hidden="true" />
        </label>
        <Separator />
        <EditorTool
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </EditorTool>
        <EditorTool
          label="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline />
        </EditorTool>
        <EditorTool
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </EditorTool>
        <ToolMenu label="More formatting" icon={<MoreHorizontal />} editor={editor}>
          <Item onSelect={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough />
            Strikethrough
          </Item>
          <Item onSelect={() => editor.chain().focus().toggleCode().run()}>
            <Code2 />
            Inline code
          </Item>
          <Item onSelect={() => editor.chain().focus().toggleHighlight().run()}>
            <Highlighter />
            Highlight
          </Item>
          <Item onSelect={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote />
            Quote
          </Item>
          <Item onSelect={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus />
            Divider
          </Item>
        </ToolMenu>
        <Separator />
        <ToolMenu label="Text color" icon={<span className="spec-color-letter">A</span>} editor={editor}>
          <Menu.Label className="spec-menu-label">Text color</Menu.Label>
          <div className="spec-color-swatches">
            {[
              ['Default', null],
              ['Gray', '#6b778c'],
              ['Red', '#de350b'],
              ['Orange', '#ff8b00'],
              ['Green', '#00875a'],
              ['Teal', '#008da6'],
              ['Blue', '#0052cc'],
              ['Purple', '#6554c0'],
            ].map(([label, color]) => (
              <Menu.Item
                key={label}
                aria-label={String(label)}
                className="spec-color-swatch"
                style={{ backgroundColor: color ?? 'var(--uc-text)' }}
                onSelect={() => {
                  if (color) editor.chain().focus().setMark('specTextColor', { color }).run()
                  else editor.chain().focus().unsetMark('specTextColor').run()
                }}
              />
            ))}
          </div>
        </ToolMenu>
        <Separator />
        <EditorTool
          label="Bullets"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List />
        </EditorTool>
        <EditorTool
          label="Numbering"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </EditorTool>
        <ToolMenu label="Text alignment" icon={<AlignLeft />} editor={editor}>
          {[
            ['left', AlignLeft],
            ['center', AlignCenter],
            ['right', AlignRight],
          ].map(([align, Icon]) => {
            const AlignmentIcon = Icon as typeof AlignLeft
            return (
              <Item key={String(align)} onSelect={() => editor.chain().focus().setTextAlign(String(align)).run()}>
                <AlignmentIcon />
                Align {String(align)}
              </Item>
            )
          })}
        </ToolMenu>
        <Separator />
        <EditorTool label="Link" active={editor.isActive('link')} onClick={onLink}>
          <Link2 />
        </EditorTool>
        <EditorTool
          label="Insert table"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <Table2 />
        </EditorTool>
        <EditorTool label="Upload image" disabled={busy} onClick={onImage}>
          <Image />
        </EditorTool>
        <button
          type="button"
          className="spec-insert-trigger"
          aria-label="Insert"
          title="Insert content"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => onInsert(event.currentTarget.getBoundingClientRect())}
        >
          <Plus size={17} />
          <span>Insert</span>
          <ChevronDown size={11} />
        </button>
        <ToolMenu label="More insert options" icon={<MoreHorizontal />} editor={editor}>
          <Item onSelect={onCapture}>
            <Camera />
            Insert current screen
          </Item>
        </ToolMenu>
        <span className="spec-toolbar-spacer" />
        <EditorTool label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 />
        </EditorTool>
        <EditorTool label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 />
        </EditorTool>
      </div>
    </div>
  )
}
