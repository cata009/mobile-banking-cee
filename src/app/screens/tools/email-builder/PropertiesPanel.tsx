import { useState } from 'react'
import TextField from '@/app/components/TextField'
import type { EmailBlock, EmailDocument, EmailSection, EmailStyle } from '@/features/marketing-email/model'
import { BLOCK_LABELS } from '@/features/marketing-email/catalog'
import { Action, NumberField, TextArea } from './fields'
import { IconPicker } from './IconPicker'

export function PropertiesPanel({
  doc,
  block,
  section,
  updateDocument,
  updateBlock,
  updateSection,
  saveBlock,
  saveSection,
  open,
  close,
}: {
  doc: EmailDocument
  block?: EmailBlock
  section?: EmailSection
  updateDocument: (edit: (draft: EmailDocument) => void) => void
  updateBlock: (edit: (draft: EmailBlock) => void) => void
  updateSection: (edit: (draft: EmailSection) => void) => void
  saveBlock: () => void
  saveSection: () => void
  open: boolean
  close: () => void
}) {
  const field = (
    label: string,
    key:
      | 'title'
      | 'label'
      | 'url'
      | 'imageUrl'
      | 'darkImageUrl'
      | 'alt'
      | 'secondaryImageUrl'
      | 'secondaryAlt'
      | 'phone'
      | 'email',
  ) =>
    block ? (
      <TextField
        key={key}
        label={label}
        value={block.content[key]}
        onChange={(v) =>
          updateBlock((b) => {
            b.content[key] = v
          })
        }
        forceFloatLabel
      />
    ) : null
  return (
    <aside className={`email-properties email-panel ${open ? 'is-open' : ''}`} aria-label="Email properties">
      <div className="email-inspector-heading">
        <h2>Inspector</h2>
        <button type="button" className="email-inspector-close email-text-button" onClick={close}>
          Close inspector
        </button>
      </div>
      {block ? (
        <div className="email-stack">
          <h3>{BLOCK_LABELS[block.kind]}</h3>
          {block.kind === 'icon' && <IconPicker key={block.id} block={block} update={updateBlock} />}
          {['heading', 'offer', 'list', 'benefits'].includes(block.kind) && field('Heading', 'title')}
          {['header', 'text', 'offer', 'contact', 'footer'].includes(block.kind) && (
            <TextArea
              label="Body copy"
              value={block.content.text}
              onChange={(v) =>
                updateBlock((b) => {
                  b.content.text = v
                })
              }
            />
          )}
          {['list', 'benefits'].includes(block.kind) && (
            <TextArea
              label="List items (one per line)"
              value={block.content.items.join('\n')}
              onChange={(v) =>
                updateBlock((b) => {
                  b.content.items = v.split('\n')
                })
              }
            />
          )}
          {['cta', 'offer'].includes(block.kind) && (
            <>
              {field('Button label', 'label')}
              {field('Button destination', 'url')}
            </>
          )}
          {['header', 'hero'].includes(block.kind) && (
            <>
              {field('Public image URL', 'imageUrl')}
              {field('Dark image URL (optional)', 'darkImageUrl')}
              {field('Image description', 'alt')}
              <div className="email-pair">
                <NumberField
                  label="Image width"
                  value={block.content.width}
                  onChange={(n) =>
                    updateBlock((b) => {
                      b.content.width = n
                    })
                  }
                />
                <NumberField
                  label="Image height"
                  value={block.content.height}
                  onChange={(n) =>
                    updateBlock((b) => {
                      b.content.height = n
                    })
                  }
                />
              </div>
              {block.kind === 'header' && (
                <>
                  {field('Partner logo URL (optional)', 'secondaryImageUrl')}
                  {field('Partner logo description', 'secondaryAlt')}
                  <div className="email-pair">
                    <NumberField
                      label="Partner width"
                      value={block.content.secondaryWidth}
                      onChange={(n) =>
                        updateBlock((b) => {
                          b.content.secondaryWidth = n
                        })
                      }
                    />
                    <NumberField
                      label="Partner height"
                      value={block.content.secondaryHeight}
                      onChange={(n) =>
                        updateBlock((b) => {
                          b.content.secondaryHeight = n
                        })
                      }
                    />
                  </div>
                </>
              )}
              <p className="email-help">
                Use an existing public HTTPS image. A text brand name is used when no logo is provided.
              </p>
            </>
          )}
          {block.kind === 'contact' && (
            <>
              {field('International phone', 'phone')}
              {field('Contact email', 'email')}
            </>
          )}
          {block.kind === 'spacer' && (
            <NumberField
              label="Space (px, up to 200)"
              max={200}
              value={block.content.height}
              onChange={(n) =>
                updateBlock((b) => {
                  b.content.height = n
                })
              }
            />
          )}
          <details>
            <summary>Light & dark colors</summary>
            <div className="email-stack">
              {(['background', 'text', 'accent', 'buttonText'] as const).map((key) => (
                <ColorFields
                  key={key}
                  label={
                    { background: 'Background', text: 'Text', accent: 'Accent / button', buttonText: 'Button text' }[
                      key
                    ]
                  }
                  pair={block.style[key]}
                  onChange={(mode, color) =>
                    updateBlock((b) => {
                      b.style[key][mode] = color
                    })
                  }
                />
              ))}
            </div>
          </details>
          {block.origin && (
            <p className="email-help">Library copy · v{block.origin.version}. Changes stay independent.</p>
          )}
          <Action onClick={saveBlock}>Save block to library</Action>
        </div>
      ) : section ? (
        <div className="email-stack">
          <h3>Section · {section.columns.length} columns</h3>
          <NumberField
            label="Section padding"
            value={section.padding}
            min={0}
            max={64}
            onChange={(n) =>
              updateSection((s) => {
                s.padding = n
              })
            }
          />
          <ColorFields
            label="Section background"
            pair={section.background}
            onChange={(mode, color) =>
              updateSection((s) => {
                s.background[mode] = color
              })
            }
          />
          <Action onClick={saveSection}>Save section to library</Action>
        </div>
      ) : (
        <p className="email-help">Select a block to edit its content and appearance.</p>
      )}
      <details open className="email-document-settings">
        <summary>Document settings</summary>
        <div className="email-stack">
          {(['name', 'subject', 'preheader'] as const).map((key) => (
            <TextField
              key={key}
              label={{ name: 'Document name', subject: 'Subject', preheader: 'Preheader' }[key]}
              value={doc[key]}
              maxLength={500}
              forceFloatLabel
              onChange={(v) =>
                updateDocument((d) => {
                  d[key] = v
                })
              }
            />
          ))}
          {(['country', 'language', 'brand', 'senderAddress', 'unsubscribeUrl', 'trackingNote'] as const).map((key) => (
            <TextField
              key={key}
              label={
                {
                  country: 'Country',
                  language: 'Language code (e.g. en)',
                  brand: 'Brand',
                  senderAddress: 'Sender postal address',
                  unsubscribeUrl: 'Unsubscribe URL or variable',
                  trackingNote: 'Tracking note',
                }[key]
              }
              value={doc.config[key]}
              forceFloatLabel
              onChange={(v) =>
                updateDocument((d) => {
                  d.config[key] = v
                })
              }
            />
          ))}
          <TextArea
            label="Approved legal copy"
            value={doc.config.legalText}
            onChange={(v) =>
              updateDocument((d) => {
                d.config.legalText = v
              })
            }
          />
          <VariablesField
            key={doc.config.variables.join(',')}
            value={doc.config.variables}
            commit={(values) =>
              updateDocument((d) => {
                d.config.variables = values
              })
            }
          />
          <p className="email-help">
            Supported syntax: {'{{name}}'}. Variables remain literal in exported files. Configure and test substitution
            in your marketing platform.
          </p>
        </div>
      </details>
    </aside>
  )
}
function ColorFields({
  label,
  pair,
  onChange,
}: {
  label: string
  pair: EmailStyle['text']
  onChange: (mode: 'light' | 'dark', color: string) => void
}) {
  return (
    <fieldset className="email-colors">
      <legend>{label}</legend>
      {(['light', 'dark'] as const).map((mode) => (
        <label key={mode}>
          {mode}
          <input
            type="color"
            aria-label={`${label} ${mode}`}
            value={pair[mode]}
            onChange={(e) => onChange(mode, e.target.value)}
          />
        </label>
      ))}
    </fieldset>
  )
}
function VariablesField({ value, commit }: { value: string[]; commit: (values: string[]) => void }) {
  const [draft, setDraft] = useState(value.join(', '))
  return (
    <TextField
      label="Declared variables (comma separated)"
      value={draft}
      forceFloatLabel
      onChange={setDraft}
      onBlur={() => {
        const values = draft
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        setDraft(values.join(', '))
        commit(values)
      }}
      helperText="Applied when you leave this field."
    />
  )
}
