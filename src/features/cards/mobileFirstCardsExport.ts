import { strToU8, zipSync } from 'fflate'
type ExportRow = {
  name: string
  category: string
  date: string
  amount: number
  status?: 'settled' | 'pending' | 'authorization'
}
const movementStatus = (status: ExportRow['status']) =>
  status === 'pending' ? 'Da contabilizzare' : status === 'authorization' ? 'Pre Autorizzazione' : 'Contabilizzato'
const xml = (value: string) =>
  value.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!)
export function createCardMovementsExport(
  rows: readonly ExportRow[],
  format: 'xlsx' | 'pdf',
  hidden = false,
  title = 'Movimenti carta - PI Italia',
) {
  if (format === 'xlsx') {
    const text = (col: string, row: number, value: string) =>
      `<c r="${col}${row}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`
    const header =
      '<row r="1">' +
      ['Data', 'Movimento', 'Categoria', 'Importo EUR', 'Stato'].map((s, i) => text('ABCDE'[i]!, 1, s)).join('') +
      '</row>'
    const body = rows
      .map(
        (r, i) =>
          `<row r="${i + 2}">${text('A', i + 2, r.date)}${text('B', i + 2, r.name)}${text('C', i + 2, r.category)}${hidden ? text('D', i + 2, '****') : `<c r="D${i + 2}"><v>${r.amount}</v></c>`}${text('E', i + 2, movementStatus(r.status))}</row>`,
      )
      .join('')
    const files: Record<string, string> = {
      '[Content_Types].xml':
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
      '_rels/.rels':
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml':
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Movimenti" sheetId="1" r:id="rId1"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels':
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
      'xl/worksheets/sheet1.xml': `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="14" customWidth="1"/><col min="2" max="3" width="30" customWidth="1"/><col min="4" max="4" width="18" customWidth="1"/></cols><sheetData>${header}${body}</sheetData></worksheet>`,
    }
    return {
      bytes: zipSync(Object.fromEntries(Object.entries(files).map(([name, content]) => [name, strToU8(content)]))),
      mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'xlsx',
    }
  }
  const safe = (value: string) =>
    value
      .normalize('NFKD')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/[\\()]/g, (c) => `\\${c}`)
  const chunks: Array<readonly ExportRow[]> = []
  for (let i = 0; i < Math.max(rows.length, 1); i += 35) chunks.push(rows.slice(i, i + 35))
  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  const pageIds: number[] = []
  for (const chunk of chunks) {
    const pageId = objects.length + 1,
      contentId = pageId + 1
    pageIds.push(pageId)
    const lines = [
      title,
      'Data | Movimento | Categoria | Importo EUR | Stato',
      ...chunk.map(
        (r) =>
          `${r.date} | ${r.name} | ${r.category} | ${hidden ? '****' : r.amount.toFixed(2)} | ${movementStatus(r.status)}`,
      ),
    ]
    const stream = `BT /F1 10 Tf 40 790 Td 20 TL ${lines.map((line, i) => `${i ? 'T* ' : ''}(${safe(line)}) Tj`).join('\n')} ET`
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    )
  }
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${object}\nendobj\n`
  })
  const start = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((n) => `${n.toString().padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`
  return { bytes: strToU8(pdf), mime: 'application/pdf', extension: 'pdf' }
}
export function downloadCardMovements(
  rows: readonly ExportRow[],
  format: 'xlsx' | 'pdf',
  hidden = false,
  title = 'Movimenti carta - PI Italia',
) {
  const result = createCardMovementsExport(rows, format, hidden, title)
  const url = URL.createObjectURL(new Blob([new Uint8Array(result.bytes)], { type: result.mime }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `movimenti-carta.${result.extension}`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
