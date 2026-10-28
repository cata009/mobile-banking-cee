import { createPlatformServer } from './node.js'
import { openRuntime } from './runtime.js'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createFlowRegistry, type FlowRegistration } from './flow-access.js'

if (process.env.VERCEL || process.env.NODE_ENV === 'production') throw new Error('This command starts the loopback development server only')
const port = Number(process.env.PLATFORM_PORT ?? 8787)
if (!Number.isSafeInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid PLATFORM_PORT')
// Register the user's real editor codec here after its local source is available.
// With no registrations, account management works but Specs writes are closed.
const catalogFile = process.env.PLATFORM_FLOW_CATALOG ?? fileURLToPath(new URL('../../.codex-temp/flow-catalog/catalog.json', import.meta.url))
let flows: FlowRegistration[]
try { flows = JSON.parse(await readFile(catalogFile, 'utf8')) as FlowRegistration[]; createFlowRegistry(flows) }
catch { throw new Error('Generate the source catalog first: run npm run dev:platform from the repository root') }
const runtime = await openRuntime([], true, flows)
const server = createPlatformServer(runtime.app.handle, runtime.origin)
server.listen(port, '127.0.0.1', () => {
  console.log(`Platform API: http://127.0.0.1:${port}/api/platform (editor integration pending)`)
})
let closing = false
async function shutdown() {
  if (closing) return
  closing = true
  server.close(async () => { await runtime.close() })
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
