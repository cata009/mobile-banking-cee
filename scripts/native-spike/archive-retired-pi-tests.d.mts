export type RetiredPiTestAllowlist = {
  schemaVersion: 1
  sourceTests: Array<{
    path: string
    nativeProofs: string[]
  }>
  supportFiles: Array<{
    path: string
    requiredBy: string[]
  }>
}

export type PiReferenceArchiveVerification = {
  valid: boolean
  hashMismatches: string[]
  missingFiles: string[]
  unexpectedFiles: string[]
  forbiddenPaths: string[]
  nativeMeta: string[]
  fileCount: number
  error?: string
}

export function archiveRetiredPiTests(options: {
  archiveDirectory: string
  sourceRoot?: string
  expectedManifestSha256: string
  allowlist: RetiredPiTestAllowlist
}): Promise<{
  archiveDirectory: string
  addedArchivePaths: string[]
  archiveManifestSha256: string
  sourceBuildIndexSha256: string | null
  sourceBuildSnapshotSha256: string
  previousArchiveFilesPreserved: number
  verification: PiReferenceArchiveVerification
}>

export function main(argv?: string[]): Promise<number>
