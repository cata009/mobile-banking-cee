export type CoAppingOriginScreen = 'prelogin-inactive' | 'prelogin-active'

export type AppShellState = {
  showTerminatePopup: boolean
  showPanel: boolean
  coAppingOriginScreen: CoAppingOriginScreen
  showEdgeAnimation: boolean
  showFABSlideIn: boolean
}

export type AppShellAction =
  | { type: 'open-panel' }
  | { type: 'close-panel' }
  | { type: 'start-coapping'; origin: CoAppingOriginScreen }
  | { type: 'continue-coapping' }
  | { type: 'animation-complete' }
  | { type: 'open-termination' }
  | { type: 'close-termination' }

export function createAppShellState(): AppShellState {
  return {
    showTerminatePopup: false,
    showPanel: false,
    coAppingOriginScreen: 'prelogin-inactive',
    showEdgeAnimation: false,
    showFABSlideIn: false,
  }
}

export function appShellReducer(state: AppShellState, action: AppShellAction): AppShellState {
  switch (action.type) {
    case 'open-panel':
      return { ...state, showPanel: true }
    case 'close-panel':
      return { ...state, showPanel: false }
    case 'start-coapping':
      return { ...state, showPanel: false, coAppingOriginScreen: action.origin }
    case 'continue-coapping':
      return { ...state, showEdgeAnimation: true, showFABSlideIn: true }
    case 'animation-complete':
      return { ...state, showEdgeAnimation: false, showFABSlideIn: false }
    case 'open-termination':
      return { ...state, showTerminatePopup: true }
    case 'close-termination':
      return { ...state, showTerminatePopup: false }
  }
}
