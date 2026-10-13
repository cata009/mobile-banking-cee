import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import {
  baselinePath,
  collectReferenceSelection,
  defaultRoot,
  referenceAreas,
  referenceHash,
  validateManifest,
} from './check-reference.mjs'

/** Capture is an explicit operator action, never a release-time repair or visual approval. */
export async function recordReference({
  root = defaultRoot,
  reviewedCapture = false,
  recordedBy,
  reason,
  baseCommit,
} = {}) {
  if (reviewedCapture !== true) throw new Error('An explicit reviewed reference capture is required')
  if (!recordedBy?.trim() || !reason?.trim() || !/^[a-f0-9]{40}$/.test(baseCommit ?? ''))
    throw new Error('recordedBy, reason and exact baseCommit provenance are required')
  const references = []
  for (const selection of await collectReferenceSelection(root)) {
    const hashMode = ['ui', 'css', 'asset-map'].includes(selection.kind) ? 'lf-text' : 'bytes'
    references.push({ ...selection, hashMode, ...(await referenceHash(root, selection)) })
  }
  return validateManifest({
    schemaVersion: 1,
    policy: 'italy-source-ui-v1',
    recordedAt: new Date().toISOString(),
    recordedBy,
    reason,
    baseCommit,
    visualAccepted: false,
    areas: [...referenceAreas],
    references,
  })
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const { values } = parseArgs({
      options: {
        root: { type: 'string' },
        'reviewed-capture': { type: 'boolean' },
        owner: { type: 'string' },
        reason: { type: 'string' },
        'base-commit': { type: 'string' },
      },
    })
    const root = path.resolve(values.root ?? defaultRoot)
    const manifest = await recordReference({
      root,
      reviewedCapture: values['reviewed-capture'],
      recordedBy: values.owner,
      reason: values.reason,
      baseCommit: values['base-commit'],
    })
    const target = path.join(root, baselinePath)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, JSON.stringify(manifest, null, 2) + '\n')
    console.log(
      `Recorded ${manifest.references.length} exact reference paths; visualAccepted=false. Review ${target} before integration.`,
    )
  } catch (error) {
    console.error(`Reference capture refused: ${error.message}`)
    process.exitCode = 2
  }
}
