import { describe, expect, it } from 'vitest'
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures'
import { resolveNativeRoboResume, nativeRoboResumeLocation } from '@/features/demo-native/roboResume'

describe('canonical Robo browser resume protocol', () => {
  it('prefers a validated history goal over URL and rejects unknown or malformed goals', () => {
    const goalId = INITIAL_CZ_ROBO_GOALS[0]!.id
    expect(resolveNativeRoboResume({ czRoboResume: { view: 'detail', goalId } }, '?robo_view=goals')).toEqual({
      view: 'detail',
      goalId,
    })
    expect(
      resolveNativeRoboResume({ czRoboResume: { view: 'detail', goalId: 'unknown' } }, '?robo_view=goals'),
    ).toEqual({ view: 'goals' })
    expect(resolveNativeRoboResume(null, '?robo_view=detail&robo_goal=unknown')).toBeNull()
    expect(resolveNativeRoboResume([], '?robo_view=detail')).toBeNull()
  })
  it('updates only the Robo protocol and retains navigation state and all other URL axes', () => {
    const next = nativeRoboResumeLocation(
      { view: 'goals' },
      'http://localhost:4004/?country=CZ&screen=investments&robo_view=detail&robo_goal=stale#section',
      { position: 5, czRoboResume: { view: 'detail', goalId: 'stale' } },
    )
    expect(next.state).toEqual({ position: 5, czRoboResume: { view: 'goals' } })
    expect(next.url).toBe('/?country=CZ&screen=investments&robo_view=goals#section')
    const cleared = nativeRoboResumeLocation(null, `http://localhost:4004${next.url}`, next.state)
    expect(cleared.state).toEqual({ position: 5 })
    expect(cleared.url).toBe('/?country=CZ&screen=investments#section')
  })
})
