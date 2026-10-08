import {
  ActionGrid,
  ActiveNavPreview,
  ActivitySection,
  CoachSection,
  ConceptHero,
  KidsConceptBottomNav,
  KidsMarketHeader,
  PocketSection,
} from '@/app/screens/kids/sk/ConceptShell'
import { SkBulbankContent } from '@/app/screens/kids/sk/SkBulbankScreens'
import type { KidsBottomNavId, KidsMarketHomeConcept } from '@/data/kidsMarketHomeConcepts'
interface SkKidsCompositionProps {
  concept: KidsMarketHomeConcept
  activeTab: KidsBottomNavId
  isBalanceVisible: boolean
  progress: number
  isSkDocumentMode: boolean
  activePanelTitle: string
  setActiveTab: (tab: KidsBottomNavId) => void
  setIsBalanceVisible: (update: (current: boolean) => boolean) => void
}
export function SkKidsComposition({
  concept,
  activeTab,
  isBalanceVisible,
  progress,
  isSkDocumentMode,
  activePanelTitle,
  setActiveTab,
  setIsBalanceVisible,
}: SkKidsCompositionProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-app-bg)]" />
      <div className="flex-1 overflow-y-auto pb-[104px] pt-[2px]">
        <KidsMarketHeader
          activeTab={activeTab}
          concept={concept}
          isBalanceVisible={isBalanceVisible}
          onToggleBalance={() => setIsBalanceVisible((current) => !current)}
        />

        <main className="space-y-[16px] px-[16px]">
          {!isSkDocumentMode || activeTab === 'home' ? (
            <ConceptHero concept={concept} isBalanceVisible={isBalanceVisible} primaryPocketProgress={progress} />
          ) : null}

          {isSkDocumentMode ? (
            <SkBulbankContent activeTab={activeTab} concept={concept} />
          ) : (
            <>
              {activeTab !== 'home' ? (
                <ActiveNavPreview activeTab={activeTab} concept={concept} panelTitle={activePanelTitle} />
              ) : null}

              <ActionGrid actions={concept.actions} />

              <PocketSection concept={concept} />

              <CoachSection concept={concept} />

              <ActivitySection concept={concept} />
            </>
          )}
        </main>
      </div>

      <KidsConceptBottomNav
        activeTab={activeTab}
        items={concept.nav}
        style={concept.style}
        onTabChange={setActiveTab}
      />
    </div>
  )
}
