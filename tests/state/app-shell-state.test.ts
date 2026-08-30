import { describe, expect, it } from 'vitest'
import { appShellReducer, createAppShellState } from '@/app/state/appShellState'

describe('application shell state', () => {
  it('starts Co-Apping from the active origin and closes the panel', () => {
    const openPanel = appShellReducer(createAppShellState(), { type: 'open-panel' })
    expect(appShellReducer(openPanel, { type: 'start-coapping', origin: 'prelogin-active' })).toMatchObject({
      showPanel: false,
      coAppingOriginScreen: 'prelogin-active',
    })
  })

  it('owns the edge/FAB animation lifecycle', () => {
    const running = appShellReducer(createAppShellState(), { type: 'continue-coapping' })
    expect(running).toMatchObject({ showEdgeAnimation: true, showFABSlideIn: true })
    expect(appShellReducer(running, { type: 'animation-complete' })).toMatchObject({
      showEdgeAnimation: false,
      showFABSlideIn: false,
    })
  })

  it('opens and dismisses the termination prompt', () => {
    const open = appShellReducer(createAppShellState(), { type: 'open-termination' })
    expect(open.showTerminatePopup).toBe(true)
    expect(appShellReducer(open, { type: 'close-termination' }).showTerminatePopup).toBe(false)
  })
})
