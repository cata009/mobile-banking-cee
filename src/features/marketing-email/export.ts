import { strToU8, zipSync } from 'fflate'
import { documentKey, serializeDocument, type EmailDocument } from './model'
import type { CompiledEmail } from './compiler'
import { validateDocument } from './validation'

export function assertCurrentExport(doc: EmailDocument, result: CompiledEmail): void {
  if (result.sourceKey !== documentKey(doc) || result.revision !== doc.revision)
    throw new Error('Compilation belongs to an older revision. Wait for the current preview.')
  if ([...validateDocument(doc), ...result.report.issues].some((i) => i.severity === 'error'))
    throw new Error('Final export is blocked. Resolve the errors in the review.')
}
export function createEmailPackage(doc: EmailDocument, result: CompiledEmail): Uint8Array {
  assertCurrentExport(doc, result)
  return zipSync(
    {
      'email.html': strToU8(result.html),
      'email.txt': strToU8(result.text),
      'document.json': strToU8(serializeDocument(doc)),
      'report.json': strToU8(JSON.stringify(result.report, null, 2)),
    },
    { level: 6 },
  )
}
