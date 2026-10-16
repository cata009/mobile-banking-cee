// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NativePlatformRouter from '@/app/navigation/nativePlatformRouter'
import type { AppCoordinators } from '@/app/coordinators/useAppCoordinators'

vi.mock('@/app/screens/design-system/DesignSystemPage', () => ({
  default: () => <div data-testid="design-system-route">Design System</div>,
}))
vi.mock('@/app/screens/tools/ToolsScreen', () => ({
  default: () => <div data-testid="tools-route">Tools</div>,
}))
vi.mock('@/app/screens/flow-library/FlowLibraryScreen', () => ({
  default: (props: {
    initialFlowId: string
    initialView: string
    selectedFlowId: string
    onFlowChange: (id: string) => void
    onViewChange: (view: string) => void
  }) => (
    <section data-testid="flow-library-route" data-flow={props.initialFlowId} data-view={props.initialView} data-selected={props.selectedFlowId}>
      <button onClick={() => props.onFlowChange('ro-round-up')}>Select flow</button>
      <button onClick={() => props.onViewChange('detail')}>Open detail</button>
    </section>
  ),
}))

function coordinators(currentScreen: string, flowId?: string): AppCoordinators {
  return {
    context: {
      currentScreen,
      parsedDeepLink: flowId ? { flowId } : null,
    },
    flowLibrary: {
      view: { flowLibraryEntryView: 'detail', selectedFlowPreviewId: 'ro-round-up' },
      actions: { selectFlow: vi.fn(), changeView: vi.fn() },
    },
  } as unknown as AppCoordinators
}

describe('NativePlatformRouter', () => {
  it.each([
    ['design-system', 'design-system-route'],
    ['tools', 'tools-route'],
  ])('keeps the %s platform control available', (route, testId) => {
    render(<NativePlatformRouter coordinators={coordinators(route)} />)
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  it('keeps Flow Library routing and forwards its current selection/actions', () => {
    const ctx = coordinators('flow-library', 'investments-bulk-approval')
    render(<NativePlatformRouter coordinators={ctx} />)
    const route = screen.getByTestId('flow-library-route')
    expect(route).toHaveAttribute('data-flow', 'investments-bulk-approval')
    expect(route).toHaveAttribute('data-view', 'detail')
    expect(route).toHaveAttribute('data-selected', 'ro-round-up')
    fireEvent.click(screen.getByText('Select flow'))
    fireEvent.click(screen.getByText('Open detail'))
    expect(ctx.flowLibrary.actions.selectFlow).toHaveBeenCalledWith('ro-round-up')
    expect(ctx.flowLibrary.actions.changeView).toHaveBeenCalledWith('detail')
  })

  it('does not claim customer routes as platform routes', () => {
    const { container } = render(<NativePlatformRouter coordinators={coordinators('homepage')} />)
    expect(container).toBeEmptyDOMElement()
  })
})


