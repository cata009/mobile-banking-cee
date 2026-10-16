export interface ReferenceSourceOverride {
  archivePath: string
  sourcePath: string
  expectedSha256: string
  sourceLabel?: string
}

export interface ArchiveFileRecord {
  path: string
  sha256: string
  bytes: number
}

export interface PiReferenceArchiveManifest {
  schemaVersion: 1
  capturedAt: string
  baseCommit: string | null
  sourceReference: {
    legacyReferenceCount: number
    manifestSha256: string | null
    changedRootBridgePaths: string[]
  }
  sourceOverrides: Array<{ archivePath: string; sourceLabel: string; sha256: string }>
  excludedRules: Record<string, unknown>
  referenceMode: {
    query: '?renderer=reference'
    nativeBridgeEnabled: false
    nativeMetaInjected: false
    viteConfig: 'vite.config.reference.mjs'
    localPasswordEnvironmentVariable: 'VITE_LOCAL_ACCESS_PASSWORD'
    envDirectoryEnvironmentVariable: 'PI_REFERENCE_ENV_DIR'
    staticReferenceUrl: string
    devReferenceUrl: string
  }
  protectedInputs: Record<string, unknown>
  sourceBuild: {
    built: boolean
    mode: string
    outputDirectory: string | null
    normalDistModified: false
    envDirSource: string | null
    localAccessConfigured: boolean | null
    devRunCommand: string
    rebuildCommand: string
    referenceUrl: string
    accessGate: string
  }
  files: ArchiveFileRecord[]
}

export interface ArchiveVerification {
  valid: boolean
  hashMismatches: string[]
  missingFiles: string[]
  unexpectedFiles: string[]
  forbiddenPaths: string[]
  nativeMeta?: string[]
  fileCount?: number
}

export interface ArchiveOptions {
  root?: string
  destination?: string
  archiveDirectory?: string
  workspaceRoot?: string
  envDir?: string
  buildSource?: boolean
  requireLocalAccess?: boolean
  buildRunner?: (args: { stageRoot: string; envDir: string }) => Promise<void>
  logLevel?: string
  sourceOverrides?: ReferenceSourceOverride[]
  sourceReferenceManifestPath?: string | null
  sourcePreservationPath?: string | null
  expandedProtectionPath?: string | null
  protectedInputs?: boolean
}

export const defaultRoot: string
export const defaultArchiveDestination: string
export function shouldExcludeArchivePath(relativePath: string): boolean
export function createPiReferenceArchive(options?: ArchiveOptions): Promise<{
  destination: string
  manifest: PiReferenceArchiveManifest
  verification: ArchiveVerification
}>
export function finalizePiReferenceArchive(options: ArchiveOptions): Promise<{
  destination: string
  manifest: PiReferenceArchiveManifest
  verification: ArchiveVerification
}>
export function rebuildPiReferenceArchive(options: ArchiveOptions): Promise<{
  destination: string
  manifest: PiReferenceArchiveManifest
  verification: ArchiveVerification
}>
export function verifyPiReferenceArchive(archiveDirectory: string): Promise<ArchiveVerification>
