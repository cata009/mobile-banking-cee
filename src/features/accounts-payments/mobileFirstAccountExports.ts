import { strToU8, zipSync } from 'fflate'
import type { AccountMovement } from './mobileFirstAccounts'
const movementStatus = (movement: AccountMovement) =>
  movement.status === 'authorization' ? 'Pre Autorizzazione' : movement.pending ? 'Da contabilizzare' : 'Contabilizzato'

const xml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Inline strings prevent merchant names beginning with '=' becoming Excel formulas. */
export function createAccountExcel(movements: readonly AccountMovement[]): Uint8Array {
  const rows = [
    ['Data', 'Movimento', 'Categoria', 'Importo (EUR)', 'Stato'],
    ...movements.map((m) => [m.date, m.name, m.category, m.amount, movementStatus(m)]),
  ]
  const sheet = rows
    .map(
      (row, i) =>
        `<row r="${i + 1}">${row.map((value, j) => `<c r="${'ABCDE'[j]}${i + 1}"${typeof value === 'number' ? '' : ' t="inlineStr"'}>${typeof value === 'number' ? `<v>${value}</v>` : `<is><t xml:space="preserve">${xml(String(value))}</t></is>`}</c>`).join('')}</row>`,
    )
    .join('')
  const files = {
    '[Content_Types].xml':
      '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels':
      '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml':
      '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Movimenti" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels':
      '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="16" customWidth="1"/><col min="2" max="3" width="32" customWidth="1"/><col min="4" max="4" width="18" customWidth="1"/></cols><sheetData>${sheet}</sheetData></worksheet>`,
  }
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, body]) => [name, strToU8(body)])))
}

/** Small multi-page PDF export: ASCII content keeps byte offsets exact with the built-in Helvetica font. */
export function createAccountPdf(
  movements: readonly AccountMovement[],
  document?: { title: string; lines: readonly string[] },
): Uint8Array {
  const pdfText = (value: string) =>
    value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7e]/g, ' ')
      .replace(/([\\()])/g, '\\$1')
  const pageCount = Math.max(1, Math.ceil((document?.lines.length ?? movements.length) / 45))
  const objects = ['', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
  const pageIds: number[] = []
  for (let page = 0; page < pageCount; page++) {
    const pageId = objects.length + 1
    const streamId = pageId + 1
    pageIds.push(pageId)
    const lines = document
      ? document.lines
          .slice(page * 45, (page + 1) * 45)
          .map((line, i) => `BT /F1 10 Tf 40 ${730 - i * 14} Td (${pdfText(line)}) Tj ET`)
      : movements
          .slice(page * 45, (page + 1) * 45)
          .map(
            (m, i) =>
              `BT /F1 10 Tf 40 ${730 - i * 14} Td (${pdfText(`${m.date}   ${m.name.slice(0, 28)}   ${m.category.slice(0, 22)}   ${m.amount.toFixed(2)} EUR   ${movementStatus(m)}`)}) Tj ET`,
          )
    const stream = `BT /F1 20 Tf 40 792 Td (${pdfText(document?.title ?? 'Movimenti del conto')}) Tj ET\nBT /F1 10 Tf 40 768 Td (${document ? 'FACSIMILE' : 'Data - Movimento - Categoria - Importo EUR'}) Tj ET\n${lines.join('\n')}\nBT /F1 10 Tf 40 30 Td (Pagina ${page + 1} / ${pageCount}) Tj ET\n`
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamId} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
    )
  }
  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[1] = `<< /Type /Pages /Count ${pageCount} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`
  let output = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(output.length)
    output += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xref = output.length
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return strToU8(output)
}
