import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { FLOW_DEFINITIONS, FLOW_ORDER } from '../src/app/screens/flow-library/flows'
import { buildFlowSearchEntries } from '../src/features/flow-collaboration/search'

const catalog = FLOW_ORDER.map((id) => {
  const flow = FLOW_DEFINITIONS[id]
  return { flowId: id, title: flow.title, sourceSnapshot: createHash('sha256').update(JSON.stringify(flow)).digest('hex'), anchors: buildFlowSearchEntries(flow).map(({ id: anchorId, label, text }) => ({ id: anchorId, label, text })) }
})
const directory = path.resolve('.codex-temp/flow-catalog')
await mkdir(directory, { recursive: true })
await writeFile(path.join(directory, 'catalog.json'), JSON.stringify(catalog))
process.stdout.write(`Read-only flow catalog generated: ${catalog.length} flows, ${catalog.reduce((count, flow) => count + flow.anchors.length, 0)} anchors\n`)
