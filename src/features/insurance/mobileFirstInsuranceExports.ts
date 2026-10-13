import { strToU8, zipSync } from 'fflate'
import { createAccountPdf } from '../accounts-payments/mobileFirstAccountExports'
import type { InsurancePolicy, InsuranceDocument } from './mobileFirstInsurance'
import { insurancePremiumCents } from './mobileFirstInsurance'

function xml(value: string) {
  return value
    .split('')
    .filter(
      (character) => character.charCodeAt(0) >= 32 || character === '\t' || character === '\n' || character === '\r',
    )
    .join('')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
export function createInsuranceExport(
  policy: InsurancePolicy,
  documents: readonly InsuranceDocument[],
  format: 'pdf' | 'xlsx',
  hidden = false,
): Uint8Array {
  if (documents.some((d) => d.policyId !== policy.id))
    throw new Error('Il documento non appartiene alla polizza selezionata.')
  if (format === 'pdf')
    return createAccountPdf([], {
      title: documents.length === 1 ? documents[0]!.title : 'Documenti della polizza',
      lines: [
        `Polizza: ${policy.name}`,
        `Numero polizza: ${policy.number}`,
        `Compagnia: ${policy.company}`,
        `Decorrenza: ${policy.start} - Scadenza: ${policy.expiry}`,
        `Premio ${policy.frequency.toLocaleLowerCase('it')}: ${hidden ? '**,**' : (insurancePremiumCents(policy) / 100).toFixed(2)} EUR`,
        '',
        ...documents.flatMap((d) => [
          d.title,
          `Data: ${d.date}`,
          `Categoria: ${d.category}`,
          `Riferimento: ${d.reference}`,
          '',
        ]),
      ],
    })
  const rows = [
    ['Data', 'Documento', 'Categoria', 'Riferimento', 'Polizza'],
    ...documents.map((d) => [d.date, d.title, d.category, d.reference, policy.number]),
  ]
  const cells = rows
    .map(
      (row, index) =>
        `<row r="${index + 1}">${row.map((v, col) => `<c r="${'ABCDE'[col]}${index + 1}" t="inlineStr"><is><t>${xml(v)}</t></is></c>`).join('')}</row>`,
    )
    .join('')
  const files = {
    '[Content_Types].xml':
      '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels':
      '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml':
      '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Documenti" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels':
      '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="5" width="32" customWidth="1"/></cols><sheetData>${cells}</sheetData></worksheet>`,
  }
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, body]) => [name, strToU8(body)])))
}
