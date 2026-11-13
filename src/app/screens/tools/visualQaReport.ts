import { buildFlowDocx } from '@/app/screens/flow-library/handoff/docx'
import type { FlowDocument } from '@/app/screens/flow-library/handoff/documentModel'

export interface VisualQaReport {
  context: string
  screenshotName: string
  observations: string[]
  notes: string
  description?: string
  expectedBehavior?: string
  actualBehavior?: string
  referencePng: string
  actualPng: string
  alignedActualPng?: string
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

export function buildVisualQaDocument(report: VisualQaReport): FlowDocument {
  return {
    title: 'Visual QA — comparison report',
    subtitle: 'Observations require review against the approved design.',
    blocks: [
      { kind: 'heading', level: 1, text: 'Test context' },
      { kind: 'paragraph', text: report.context },
      { kind: 'paragraph', text: `Screenshot: ${report.screenshotName}` },
      { kind: 'heading', level: 1, text: 'Description' },
      { kind: 'paragraph', text: report.description || report.notes || 'Not provided.' },
      { kind: 'heading', level: 1, text: 'Expected behavior' },
      { kind: 'paragraph', text: report.expectedBehavior || 'Not provided.' },
      { kind: 'heading', level: 1, text: 'Actual behavior' },
      { kind: 'paragraph', text: report.actualBehavior || 'Not provided.' },
      { kind: 'heading', level: 1, text: 'Observations' },
      ...(report.observations.length ? [{ kind: 'bullets' as const, items: report.observations }] : [{ kind: 'paragraph' as const, text: 'No marked observations.' }]),
      { kind: 'heading', level: 1, text: 'Evidence' },
      { kind: 'heading', level: 2, text: 'Demo reference with markers' },
      { kind: 'image', base64: report.referencePng, alt: 'Demo reference with markers' },
      ...(report.alignedActualPng ? [
        { kind: 'heading' as const, level: 2 as const, text: 'App screenshot with alignment' },
        { kind: 'image' as const, base64: report.alignedActualPng, alt: 'App screenshot with alignment and markers' },
      ] : []),
      { kind: 'heading', level: 2, text: report.alignedActualPng ? 'Original app screenshot' : 'App screenshot' },
      { kind: 'image', base64: report.actualPng, alt: report.alignedActualPng ? 'Original app screenshot' : 'App screenshot' },
      { kind: 'paragraph', text: 'Confirm each observation against the approved design before filing a defect.' },
    ],
  }
}

export function buildVisualQaWord(report: VisualQaReport): Blob {
  return buildFlowDocx(buildVisualQaDocument(report))
}

export function buildVisualQaHtml(report: VisualQaReport, autoPrint = false): string {
  const observations = report.observations.map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>No marked observations.</li>'
  const image = (title: string, base64: string) => `<section class="evidence"><h2>${title}</h2><img alt="${title}" src="data:image/png;base64,${base64}"></section>`
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Visual QA report</title><style>body{font:15px system-ui;color:#202428;max-width:1050px;margin:40px auto;padding:0 24px}h1{font-size:28px}h2{font-size:18px}p{white-space:pre-wrap;overflow-wrap:anywhere}.context{color:#555}.evidence{display:inline-block;vertical-align:top;width:47%;margin-right:2%;break-inside:avoid}.evidence img{width:100%;max-width:300px;border:1px solid #ddd;border-radius:8px}@media print{body{margin:0}.evidence{width:47%}.hint{display:none}}</style></head><body><h1>Visual QA — comparison report</h1><p class="context">${escapeHtml(report.context)}</p><p>Screenshot: ${escapeHtml(report.screenshotName)}</p><h2>Description</h2><p>${escapeHtml(report.description || report.notes || 'Not provided.')}</p><h2>Expected behavior</h2><p>${escapeHtml(report.expectedBehavior || 'Not provided.')}</p><h2>Actual behavior</h2><p>${escapeHtml(report.actualBehavior || 'Not provided.')}</p><h2>Observations</h2><ul style="list-style:none;padding-left:0">${observations}</ul>${image('Demo reference with markers', report.referencePng)}${report.alignedActualPng ? image('App screenshot with alignment', report.alignedActualPng) : ''}${image(report.alignedActualPng ? 'Original app screenshot' : 'App screenshot', report.actualPng)}<p>Confirm each observation against the approved design before filing a defect.</p>${autoPrint ? '<p class="hint">Choose “Save as PDF” in the print dialog.</p><script>window.addEventListener("load",()=>setTimeout(()=>window.print(),400));</script>' : ''}</body></html>`
}
