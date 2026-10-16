import type { AppCoordinators } from '@/app/coordinators/useAppCoordinators'
import DesignSystemPage from '@/app/screens/design-system/DesignSystemPage'
import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'
import ToolsScreen from '@/app/screens/tools/ToolsScreen'

/** Platform surfaces remain Web-owned while customer PI screens move to Native. */
export default function NativePlatformRouter({ coordinators }: { coordinators: AppCoordinators }) {
  const { currentScreen, parsedDeepLink } = coordinators.context

  if (currentScreen === 'design-system') return <DesignSystemPage />
  if (currentScreen === 'tools') return <ToolsScreen />
  if (currentScreen !== 'flow-library') return null

  const { selectedFlowPreviewId, flowLibraryEntryView } = coordinators.flowLibrary.view
  const { selectFlow, changeView } = coordinators.flowLibrary.actions
  return (
    <FlowLibraryScreen
      initialFlowId={parsedDeepLink?.flowId ?? 'investments-bulk-approval'}
      initialView={flowLibraryEntryView}
      selectedFlowId={selectedFlowPreviewId}
      onFlowChange={selectFlow}
      onViewChange={changeView}
    />
  )
}
