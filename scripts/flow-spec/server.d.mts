import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
export function createSpecHandler(options?: {
  localRoot?: string
  env?: Record<string, string | undefined>
  authorize?: (request: IncomingMessage, operation: string) => Promise<{ author: string; actorId?: string }>
}): (req: IncomingMessage, res: ServerResponse) => Promise<void>
export function flowSpecPlugin(root: string): Plugin
