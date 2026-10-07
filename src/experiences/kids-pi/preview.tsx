import { useEffect, useMemo, useState } from 'react'
import {
  getKidsHomeConcept,
  getPocketProgress,
  isKidsHomeCountry,
  type KidsBottomNavId,
} from '@/data/kidsMarketHomeConcepts'
import type { CountryId } from '@/app/state/demoTypes'
import RoTeensApp from './ro/baseline/composition'
import { HuCeeLightRestyleApp } from './hu/baseline/composition'
import { SkKidsComposition } from './sk/baseline/composition'
interface KidsMarketHomeAppProps {
  country: CountryId
}

export default function KidsMarketHomeApp({ country }: KidsMarketHomeAppProps) {
  const resolvedCountry = isKidsHomeCountry(country) ? country : 'SK'
  const concept = getKidsHomeConcept(resolvedCountry)
  const [activeTab, setActiveTab] = useState<KidsBottomNavId>('home')
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const primaryPocket = concept.pockets[0]
  const progress = primaryPocket ? getPocketProgress(primaryPocket) : 0
  const isSkDocumentMode = concept.style === 'sk-bulbank-kids'

  useEffect(() => {
    if (!concept.nav.some((item) => item.id === activeTab)) {
      setActiveTab('home')
    }
  }, [activeTab, concept.nav])

  const activePanelTitle = useMemo(() => {
    const active = concept.nav.find((item) => item.id === activeTab)
    return active?.label ?? 'Home'
  }, [activeTab, concept.nav])

  if (concept.style === 'hu-smart-fintech') {
    return <HuCeeLightRestyleApp concept={concept} />
  }

  if (concept.style === 'ro-teen-fintech') {
    return <RoTeensApp />
  }

  return (
    <SkKidsComposition
      concept={concept}
      activeTab={activeTab}
      isBalanceVisible={isBalanceVisible}
      progress={progress}
      isSkDocumentMode={isSkDocumentMode}
      activePanelTitle={activePanelTitle}
      setActiveTab={setActiveTab}
      setIsBalanceVisible={setIsBalanceVisible}
    />
  )
}
