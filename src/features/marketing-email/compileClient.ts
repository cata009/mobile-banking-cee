import { compileEmail, type CompiledEmail } from './compiler'
import type { EmailDocument } from './model'

/** One worker per mounted editor; terminate also rejects pending requests. */
export function createCompilerClient() {
  let worker: Worker | undefined
  let nextId = 0
  const pending = new Map<number, { resolve(value: CompiledEmail): void; reject(error: Error): void }>()
  const fail = (message: string) => {
    for (const p of pending.values()) p.reject(new Error(message))
    pending.clear()
    worker?.terminate()
    worker = undefined
  }
  return {
    async compile(document: EmailDocument): Promise<CompiledEmail> {
      // Test/older hosts can compile on demand in the same thread; never requires a backend.
      if (typeof Worker === 'undefined') {
        return compileEmail(document)
      }
      if (!worker) {
        worker = new Worker(new URL('./compiler.worker.ts', import.meta.url), { type: 'module' })
        worker.onmessage = (event: MessageEvent<{ requestId: number; result?: CompiledEmail; error?: string }>) => {
          const p = pending.get(event.data.requestId)
          pending.delete(event.data.requestId)
          if (event.data.result) p?.resolve(event.data.result)
          else p?.reject(new Error(event.data.error ?? 'Compilation failed.'))
        }
        worker.onerror = () => fail('The compiler could not start. Retry the preview.')
      }
      const requestId = ++nextId
      return new Promise((resolve, reject) => {
        pending.set(requestId, { resolve, reject })
        worker!.postMessage({ requestId, document })
      })
    },
    dispose() {
      fail('The editor was closed.')
    },
  }
}
