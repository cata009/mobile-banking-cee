import { describe, expect, it } from 'vitest'
import {
  seedAnalysisDocument,
  renderSpecHtml,
  renderSpecWiki,
  documentText,
  dehydrateDocument,
} from '@/features/flow-spec/document'
import { validateSpecDocument } from '@/features/flow-spec/schema.mjs'

describe('flow specification document', () => {
  it('preserves Confluence text color and refuses CSS payloads', () => {
    const colored = {
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Decision', marks: [{ type: 'specTextColor', attrs: { color: '#0052cc' } }] },
          ],
        },
      ],
    }
    expect(() => validateSpecDocument(colored)).not.toThrow()
    expect(renderSpecHtml(colored, [])).toContain('color:#0052cc')
    expect(renderSpecWiki(colored)).toContain('{color:#0052cc}Decision{color}')
    colored.content[0]!.content[0]!.marks[0]!.attrs.color = 'url(javascript:bad)'
    expect(() => validateSpecDocument(colored)).toThrow()
  })
  it('seeds every canonical BA section without changing its input', () => {
    const analysis = {
      generalInformation: [{ label: 'Owner', value: 'BA' }],
      versionContext: 'v1',
      versionHistory: [],
      openIssues: [],
      requirements: [{ title: 'Report', items: ['Keep the case'] }],
      currentStatus: [],
      proposedSolution: [],
      nonFunctionalRequirements: [],
    }
    const before = JSON.stringify(analysis)
    const doc = seedAnalysisDocument(analysis)
    expect(documentText(doc)).toContain('Keep the case')
    expect(doc.content.filter((n) => n.type === 'heading')).toHaveLength(7)
    expect(JSON.stringify(analysis)).toBe(before)
    expect(() => validateSpecDocument(doc)).not.toThrow()
  })

  it('keeps rich formatting and escapes text rather than trusting pasted HTML', () => {
    const doc = {
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '<script>bad</script>', marks: [{ type: 'bold' }] },
            { type: 'text', text: 'docs', marks: [{ type: 'link', attrs: { href: 'https://example.com/?a=1&b=2' } }] },
          ],
        },
      ],
    }
    expect(renderSpecHtml(doc, [])).toContain('<strong>&lt;script&gt;bad&lt;/script&gt;</strong>')
    expect(renderSpecHtml(doc, [])).toContain('href="https://example.com/?a=1&amp;b=2"')
  })

  it('refuses unsafe links, unsupported nodes and unbacked image references', () => {
    expect(() =>
      validateSpecDocument({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'x', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }],
          },
        ],
      }),
    ).toThrow()
    expect(() => validateSpecDocument({ type: 'doc', content: [{ type: 'script' }] })).toThrow()
    expect(() =>
      renderSpecHtml({ type: 'doc', content: [{ type: 'image', attrs: { assetId: 'missing' } }] }, []),
    ).toThrow(/image/i)
  })

  it('persists stable image references without embedding preview bytes in revisions', () => {
    const doc = dehydrateDocument({
      type: 'doc',
      content: [{ type: 'image', attrs: { assetId: 'img-123', src: 'data:image/png;base64,AAAA', alt: 'Alert' } }],
    })
    expect(JSON.stringify(doc)).not.toContain('base64')
    expect(doc.content[0]?.attrs?.assetId).toBe('img-123')
  })

  it('preserves supported alignment in read/export HTML and accepts actual editor block nesting', () => {
    expect(
      renderSpecHtml(
        {
          type: 'doc',
          content: [
            { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'Centered' }] },
          ],
        },
        [],
      ),
    ).toContain('text-align:center')
    expect(() =>
      validateSpecDocument({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'specStatus', attrs: { label: 'In review', tone: 'info' } }],
          },
        ],
      }),
    ).not.toThrow()
    expect(() =>
      validateSpecDocument({
        type: 'doc',
        content: [
          {
            type: 'table',
            content: [
              {
                type: 'tableRow',
                content: [
                  {
                    type: 'tableHeader',
                    content: [{ type: 'image', attrs: { assetId: 'img-11111111111111111111111111111111' } }],
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).not.toThrow()
  })
})
