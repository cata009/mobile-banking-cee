import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures'
import type { NativeRoboResumeState } from './contracts'

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function parse(value: unknown): NativeRoboResumeState | null {
  const saved = record(value)
  if (saved.view === 'goals') return { view: 'goals' }
  if (
    saved.view === 'detail' &&
    typeof saved.goalId === 'string' &&
    INITIAL_CZ_ROBO_GOALS.some((goal) => goal.id === saved.goalId)
  )
    return { view: 'detail', goalId: saved.goalId }
  return null
}

/** Source's existing URL/history protocol, independent of any retired screen module. */
export function resolveNativeRoboResume(historyState: unknown, search: string): NativeRoboResumeState | null {
  const saved = parse(record(historyState).czRoboResume)
  if (saved) return saved
  const params = new URLSearchParams(search)
  return parse({ view: params.get('robo_view'), goalId: params.get('robo_goal') })
}

export function nativeRoboResumeLocation(
  resume: NativeRoboResumeState | null,
  href: string,
  historyState: unknown,
): { state: Record<string, unknown>; url: string } {
  const state = { ...record(historyState) }
  if (resume) state.czRoboResume = resume
  else delete state.czRoboResume
  const url = new URL(href)
  url.searchParams.delete('robo_view')
  url.searchParams.delete('robo_goal')
  if (resume) {
    url.searchParams.set('robo_view', resume.view)
    if (resume.view === 'detail') url.searchParams.set('robo_goal', resume.goalId)
  }
  return { state, url: `${url.pathname}${url.search}${url.hash}` }
}
