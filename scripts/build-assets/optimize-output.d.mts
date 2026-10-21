export type ImageResult = { bytes: Buffer; extension: string; changed: boolean; proof?: Record<string, unknown> }
export function copyDeploymentPublic(source: string, output: string): Promise<string[]>
export function rewriteAssetReferences(source: string, file: string, aliases: Map<string, string>): string
export function optimizeOutput(root: string, options?: { protectedPaths?: string[]; cacheDirectory?: string; imageOptimizer?: (bytes: Buffer, extension: string) => Promise<ImageResult> }): Promise<{
  beforeBytes: number; afterBytes: number; savedBytes: number; duplicateFilesRemoved: number; optimizedImages: number; proofs: Record<string, unknown>[]
}>
