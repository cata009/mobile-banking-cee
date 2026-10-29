import { Mark, Node, mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'

// Adapted from all-in-one's SpecPanelNode, SpecExpandNode, SpecStatusLozengeNode
// and ImageWithAttachmentRef. The host supplies asset upload/persistence callbacks.
const AttachmentImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      assetId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-asset-id'),
        renderHTML: (attrs) => ({ 'data-asset-id': attrs.assetId }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'img[data-asset-id]' }]
  },
})

const Panel = Node.create({
  name: 'specPanel',
  group: 'block',
  content: '(paragraph|heading|bulletList|orderedList|table|image)+',
  defining: true,
  isolating: true,
  addAttributes() {
    return { tone: { default: 'info', parseHTML: (element) => element.getAttribute('data-tone') ?? 'info' } }
  },
  parseHTML() {
    return [{ tag: 'aside[data-tone]' }]
  },
  renderHTML({ node, HTMLAttributes }) {
    return ['aside', mergeAttributes(HTMLAttributes, { 'data-tone': node.attrs.tone }), 0]
  },
})
const Expand = Node.create({
  name: 'specExpand',
  group: 'block',
  content: '(paragraph|heading|bulletList|orderedList|table|image)+',
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      title: { default: 'Details', parseHTML: (element) => element.querySelector('summary')?.textContent ?? 'Details' },
    }
  },
  parseHTML() {
    return [{ tag: 'details', contentElement: 'div' }]
  },
  renderHTML({ node }) {
    return ['details', { open: 'true' }, ['summary', { contenteditable: 'false' }, node.attrs.title], ['div', 0]]
  },
})
const Status = Node.create({
  name: 'specStatus',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return { label: { default: 'In review' }, tone: { default: 'info' } }
  },
  parseHTML() {
    return [
      {
        tag: 'span[data-spec-status]',
        getAttrs: (element) => ({ label: element.textContent, tone: element.getAttribute('data-tone') ?? 'info' }),
      },
    ]
  },
  renderHTML({ node }) {
    return ['span', { 'data-spec-status': '', 'data-tone': node.attrs.tone }, node.attrs.label]
  },
})

export function specEditorExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      link: { openOnClick: false, autolink: false, defaultProtocol: 'https' },
    }),
    TableKit.configure({ table: { resizable: true } }),
    AttachmentImage.configure({
      allowBase64: true,
      resize: {
        enabled: true,
        directions: ['bottom-right'],
        minWidth: 80,
        minHeight: 40,
        alwaysPreserveAspectRatio: true,
      },
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Highlight,
    Mark.create({
      name: 'specTextColor',
      addAttributes() {
        return { color: { default: '#172b4d' } }
      },
      parseHTML() {
        return [
          {
            tag: 'span[data-spec-text-color]',
            getAttrs: (element) => ({ color: element.getAttribute('data-spec-text-color') }),
          },
        ]
      },
      renderHTML({ mark }) {
        const color = /^#[0-9a-f]{6}$/i.test(String(mark.attrs.color)) ? String(mark.attrs.color) : '#172b4d'
        return ['span', { 'data-spec-text-color': color, style: `color:${color}` }, 0]
      },
    }),
    Panel,
    Expand,
    Status,
  ]
}
