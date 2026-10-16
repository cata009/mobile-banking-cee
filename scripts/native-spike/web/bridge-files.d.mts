import type { Plugin } from 'vite'
export function nativeBridgePlugin(root: string): Plugin
export function bridgeAssetPath(root: string, requestPath: string): string | null
export function writeBridgeManifest(directory: string): {
  version: number
  buildId: string
  entry: string
  css: string[]
  files: { file: string; sha256: string }[]
}
export function ensureNativeWebDependencies(root: string): Promise<void>
export function run(command: string, args: string[], options?: object): Promise<void>
