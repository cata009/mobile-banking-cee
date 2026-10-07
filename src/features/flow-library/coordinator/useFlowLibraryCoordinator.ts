import { useEffect, useState } from 'react'
import type { FlowPreviewId } from '@/app/registry/flowPreviewRegistry'
import type { CoordinatorInput } from '@/app/coordinators/contracts'
export function useFlowLibraryCoordinator({
  parsedDeepLink,
  navigation,
}: Pick<CoordinatorInput, 'navigation' | 'parsedDeepLink'>) {
  const { currentRoute, replaceCurrentRoute } = navigation
  const [selectedFlowPreviewId, setSelectedFlowPreviewId] = useState<FlowPreviewId>(
    parsedDeepLink?.flowId ?? 'ro-round-up',
  )
  const [flowLibraryEntryView, setFlowLibraryEntryView] = useState<'index' | 'detail'>(
    parsedDeepLink?.flowId ? 'detail' : 'index',
  )

  useEffect(() => {
    if (currentRoute.screen !== 'flow-library') return
    if (currentRoute.flowId !== undefined) setSelectedFlowPreviewId(currentRoute.flowId)
    if (currentRoute.view !== undefined) setFlowLibraryEntryView(currentRoute.view)
  }, [currentRoute])
  useEffect(() => {
    const handleFlowPreviewSelect = (event: Event) => {
      const flowId = (event as CustomEvent<FlowPreviewId>).detail
      if (flowId) {
        setSelectedFlowPreviewId(flowId)
        setFlowLibraryEntryView('detail')
        replaceCurrentRoute({ screen: 'flow-library', flowId, view: 'detail' })
      }
    }
    const handleFlowLibraryOpenIndex = () => {
      setFlowLibraryEntryView('index')
      replaceCurrentRoute((current) =>
        current.screen === 'flow-library'
          ? { screen: 'flow-library', flowId: current.flowId ?? selectedFlowPreviewId, view: 'index' }
          : current,
      )
    }

    window.addEventListener('flow-preview-select', handleFlowPreviewSelect)
    window.addEventListener('flow-library-open-index', handleFlowLibraryOpenIndex)
    return () => {
      window.removeEventListener('flow-preview-select', handleFlowPreviewSelect)
      window.removeEventListener('flow-library-open-index', handleFlowLibraryOpenIndex)
    }
  }, [replaceCurrentRoute, selectedFlowPreviewId])

  const selectFlow = (flowId: FlowPreviewId) => {
    setSelectedFlowPreviewId(flowId)
    setFlowLibraryEntryView('detail')
    replaceCurrentRoute({ screen: 'flow-library', flowId, view: 'detail' })
  }
  const changeView = (view: 'index' | 'detail') => {
    setFlowLibraryEntryView(view)
    replaceCurrentRoute((current) =>
      current.screen === 'flow-library'
        ? { screen: 'flow-library', flowId: current.flowId ?? selectedFlowPreviewId, view }
        : current,
    )
  }
  return {
    view: {
      selectedFlowPreviewId:
        currentRoute.screen === 'flow-library' && currentRoute.flowId !== undefined
          ? currentRoute.flowId
          : selectedFlowPreviewId,
      flowLibraryEntryView:
        currentRoute.screen === 'flow-library' && currentRoute.view !== undefined
          ? currentRoute.view
          : flowLibraryEntryView,
    },
    actions: { selectFlow, changeView },
  }
}
