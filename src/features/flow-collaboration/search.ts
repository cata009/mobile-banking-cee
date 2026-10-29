import type { FlowDefinition, FlowPreviewId } from '@/app/screens/flow-library/flows/types'

export interface SearchEntry {
  id: string
  label: string
  text: string
  section: 'spec' | 'journey'
  targetId?: string
  scenarioId?: string
  stepId?: string
}
export interface FlowSearchResult {
  flowId: FlowPreviewId
  matches: SearchEntry[]
}

export function resolveSelectedPassage(
  entries: readonly SearchEntry[],
  quote: string,
  idPrefix?: string,
  targetId?: string,
) {
  const matches = entries.filter(
    (entry) =>
      entry.text.includes(quote) &&
      (!idPrefix || entry.id.startsWith(idPrefix)) &&
      (!targetId || entry.targetId === targetId),
  )
  return matches.length === 1 ? matches[0]! : null
}

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Read-only source catalog, deliberately separate from an editor's document format. */
export function buildFlowSearchEntries(flow: FlowDefinition): SearchEntry[] {
  const entries: SearchEntry[] = []
  const add = (id: string, label: string, text: string | undefined, targetId = 'spec-section-flow-spec') => {
    if (text?.trim()) entries.push({ id, label, text, section: 'spec', targetId })
  }
  const strings = (value: unknown, id: string, label: string, targetId: string) => {
    if (typeof value === 'string') add(id, label, value, targetId)
    else if (Array.isArray(value)) value.forEach((item, n) => strings(item, `${id}.${n}`, label, targetId))
    else if (value && typeof value === 'object')
      Object.entries(value).forEach(([key, item]) => strings(item, `${id}.${key}`, label, targetId))
  }
  add('purpose', 'Purpose', flow.overview.purpose)
  add('scope', 'Scope', flow.overview.scopeNote)
  flow.overview.rules?.forEach((rule) =>
    add(`rule:${rule.id}`, `${rule.group} · ${rule.id}`, rule.statement, `rule-${rule.id}`),
  )
  for (const key of [
    'entryPoints',
    'preconditions',
    'businessRules',
    'signing',
    'successDestinations',
    'analyticsEvents',
    'openQuestions',
    'notes',
  ] as const)
    strings(flow.overview[key], `overview.${key}`, key, 'spec-section-flow-spec')
  const analysis = flow.overview.businessAnalysis
  if (analysis)
    for (const [key, section] of Object.entries(analysis)) {
      const target =
        (
          {
            generalInformation: 'general',
            versionContext: 'general',
            versionHistory: 'general',
            openIssues: 'open-issues',
            requirements: 'requirements',
            currentStatus: 'current-status',
            proposedSolution: 'proposed-solution',
            nonFunctionalRequirements: 'non-functional',
          } as Record<string, string>
        )[key] ?? 'general'
      strings(section, `analysis.${key}`, key, `ba-section-${target}`)
    }
  for (const [screen, spec] of Object.entries(flow.screenSpecs)) {
    const start = entries.length
    strings(spec, `screen.${screen}`, spec?.title ?? screen, 'spec-section-screen-spec')
    const scenario = flow.scenarios.find((s) => s.steps.some((step) => step.screen === screen))
    const step = scenario?.steps.find((candidate) => candidate.screen === screen)
    for (const entry of entries.slice(start)) {
      entry.scenarioId = scenario?.id
      entry.stepId = step?.id
    }
  }
  for (const scenario of flow.scenarios)
    for (const step of scenario.steps) {
      entries.push({
        id: `step:${scenario.id}:${step.id}`,
        label: `${scenario.label} · ${step.title}`,
        text: `${step.title}. ${step.description}`,
        section: 'journey',
        scenarioId: scenario.id,
        stepId: step.id,
      })
    }
  return entries
}

export function searchFlows(flows: readonly FlowDefinition[], query: string): FlowSearchResult[] {
  const normalized = normalizeSearch(query)
  return flows.flatMap((flow) => {
    const matches = normalized
      ? buildFlowSearchEntries(flow).filter((entry) =>
          normalizeSearch(`${entry.label} ${entry.text}`).includes(normalized),
        )
      : []
    const metadata = normalizeSearch(
      [flow.title, flow.label, flow.summary, flow.domain, ...flow.countryScope].join(' '),
    )
    return !normalized || metadata.includes(normalized) || matches.length ? [{ flowId: flow.id, matches }] : []
  })
}
