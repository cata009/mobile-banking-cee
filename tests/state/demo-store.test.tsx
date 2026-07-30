// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it } from 'vitest'
import { DemoProvider, useDemo } from '@/app/state/demoStore'
import { isFeatureActive } from '@/app/state/featureResolver'
import type { DemoState } from '@/app/state/demoTypes'

const sparseFlags: DemoState['flagsByContext'] = {
  'PI:RO:current:baseline-current:release-current:retail-single-account': {
    fx_transactionsFilters: true,
  },
}

function wrapper({ children }: PropsWithChildren) {
  return <DemoProvider>{children}</DemoProvider>
}

describe('demo state feature flags', () => {
  it('accepts sparse overrides for a context', () => {
    expect(sparseFlags).toEqual({
      'PI:RO:current:baseline-current:release-current:retail-single-account': {
        fx_transactionsFilters: true,
      },
    })
  })

  it('isolates manual flags and resets to the active country context', () => {
    const { result } = renderHook(() => useDemo(), { wrapper })

    act(() => result.current.setFlag('fx_transactionsFilters', true))
    expect(isFeatureActive(result.current, 'fx_transactionsFilters')).toBe(true)

    act(() => result.current.setCountry('HU'))
    expect(isFeatureActive(result.current, 'fx_transactionsFilters')).toBe(false)

    act(() => result.current.setFlag('fx_unplannedBanner', true))
    act(() => result.current.resetFlags())
    expect(isFeatureActive(result.current, 'fx_unplannedBanner')).toBe(false)

    act(() => result.current.setCountry('RO'))
    expect(isFeatureActive(result.current, 'fx_transactionsFilters')).toBe(true)
  })

  it('applies release bundles before manual overrides and disables all features in inactive scenarios', () => {
    const { result } = renderHook(() => useDemo(), { wrapper })

    act(() => result.current.setRelease('release-v1'))
    act(() => result.current.setFlag('fx_newPaymentsHub', false))
    expect(isFeatureActive(result.current, 'fx_newPaymentsHub')).toBe(true)

    act(() => result.current.setFlag('fx_transactionsFilters', true))
    expect(isFeatureActive(result.current, 'fx_transactionsFilters')).toBe(true)

    act(() => result.current.setScenario('inactive'))
    expect(isFeatureActive(result.current, 'fx_newPaymentsHub')).toBe(false)
    expect(isFeatureActive(result.current, 'fx_transactionsFilters')).toBe(false)
  })

  it('isolates CZ Robo from baseline and the CZ Chatbot future preview', () => {
    const { result } = renderHook(() => useDemo(), {
      wrapper: ({ children }) => (
        <DemoProvider initialState={{ product: 'PI', country: 'CZ', scenario: 'active' }}>
          {children}
        </DemoProvider>
      ),
    })

    expect(isFeatureActive(result.current, 'fx_czRoboAdvisor')).toBe(false)

    act(() => result.current.setRelease('release-future-cz-robo'))
    expect(isFeatureActive(result.current, 'fx_czRoboAdvisor')).toBe(true)
    expect(isFeatureActive(result.current, 'fx_czCoAppingSmartAssistant')).toBe(false)

    act(() => result.current.setCountry('RO'))
    expect(isFeatureActive(result.current, 'fx_czRoboAdvisor')).toBe(false)
  })
})
