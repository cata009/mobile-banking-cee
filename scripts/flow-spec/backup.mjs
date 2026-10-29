import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createBlobSpecStore } from './blob-store.mjs'
import { createSpecStore } from './store.mjs'
import { validateSpecArchive } from './archive.mjs'

const args = process.argv.slice(2)
const value = (key) => {
  const index = args.indexOf(key)
  return index < 0 ? undefined : args[index + 1]
}
const operation = args[0]
const namespace = value('--namespace')
const localRoot = value('--local-root')
if (!['export', 'import'].includes(operation) || (!namespace && !localRoot))
  throw new Error(
    'Usage: backup.mjs export --namespace NAME --output FILE | export --local-root DIR --output FILE | import --namespace EMPTY_NAME --input FILE',
  )
if (operation === 'import' && localRoot) throw new Error('Import targets an explicitly named empty cloud namespace.')
const store = localRoot ? createSpecStore(resolve(localRoot)) : createBlobSpecStore({ namespace })
if (operation === 'export') {
  const output = value('--output')
  if (!output) throw new Error('Choose --output FILE. Existing backup files are never overwritten.')
  let archive
  if (store.archive) archive = await store.archive()
  else {
    const state = await store.read()
    const history = []
    for (const metadata of state.history)
      history.push({ ...metadata, document: await store.revision(metadata.revision) })
    archive = {
      format: 'flow-spec-archive-v1',
      flowId: 'ba-card-fraud',
      exportedAt: new Date().toISOString(),
      history,
      assets: state.assets,
    }
  }
  await validateSpecArchive(archive, { allowEmpty: true })
  await writeFile(resolve(output), JSON.stringify(archive), { encoding: 'utf8', flag: 'wx', mode: 0o600 })
  console.log(`Backup complete: ${archive.history.length} revisions, ${archive.assets.length} original images.`)
} else {
  const input = value('--input')
  if (!input) throw new Error('Choose --input FILE.')
  const archive = JSON.parse(await readFile(resolve(input), 'utf8'))
  const state = await store.importArchive(archive)
  console.log(`Import complete in ${namespace}: ${state.revision} revisions, ${state.assets.length} original images.`)
}
