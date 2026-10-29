/** Portable editor JSON; never imports a UI runtime or a flow composition. */
export interface SpecAccess {
  actorId: string | null
  author: string
  canEdit: boolean
  canRestore: boolean
}
export interface SpecMark {
  type: string
  attrs?: Record<string, unknown>
}
export interface SpecNode {
  type: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: SpecMark[]
  content?: SpecNode[]
}
export interface SpecDocument extends SpecNode {
  type: 'doc'
  content: SpecNode[]
}
export interface SpecAsset {
  id: string
  name: string
  mime: 'image/png' | 'image/jpeg'
  dataUrl: string
  width: number
  height: number
}
export interface SpecRevision {
  revision: number
  at: string
  author: string
  message: string
}
export interface SpecState {
  revision: number
  document: SpecDocument | null
  history: SpecRevision[]
  assets: SpecAsset[]
}
export interface AnalysisSeed {
  generalInformation: readonly { label: string; value: string }[]
  versionContext: string
  versionHistory: readonly { version: string; date: string; detail: string }[]
  openIssues: readonly { reference: string; status: string; title: string; detail: string }[]
  requirements: readonly AnalysisSection[]
  currentStatus: readonly AnalysisSection[]
  proposedSolution: readonly AnalysisSection[]
  nonFunctionalRequirements: readonly AnalysisSection[]
}
interface AnalysisSection {
  title: string
  description?: string
  items: readonly string[]
}
