/// <reference lib="webworker" />
import { compileEmail } from './compiler'
import type { EmailDocument } from './model'

self.onmessage = async (event: MessageEvent<{ requestId: number; document: EmailDocument }>) => {
  const { requestId, document } = event.data
  try {
    self.postMessage({ requestId, result: await compileEmail(document) })
  } catch (error) {
    self.postMessage({ requestId, error: error instanceof Error ? error.message : 'Compilation failed.' })
  }
}
