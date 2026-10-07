import { useEffect, useRef } from 'react'
import { useDragCarousel } from '@/hooks/useDragCarousel'
import type { RoboPortfolio, RoboStrategy } from '@/features/investments/robo/types'
import type { RoboAdvisorCreationStep as CreationStep } from '@/features/investments/robo/legacyFlowState'
import { getCarouselSelectedIndex, getCarouselScrollLeft } from './PortfolioScreens'

export function useRoboCarousels(
  strategies: readonly RoboStrategy[],
  basketPortfolios: readonly RoboPortfolio[],
  selectedBasketPortfolio: RoboPortfolio | null,
  step: CreationStep,
  selectedStrategyId: RoboStrategy['id'],
  setSelectedStrategyId: (id: RoboStrategy['id']) => void,
  setSelectedPortfolio: (portfolio: RoboPortfolio) => void,
) {
  const strategyCarouselRef = useRef<HTMLDivElement>(null)
  const portfolioCarouselRef = useRef<HTMLDivElement>(null)
  const snapStrategyCarousel = () => {
    const carousel = strategyCarouselRef.current
    if (!carousel || strategies.length <= 1) return
    const index = Math.max(0, Math.min(strategies.length - 1, Math.round(carousel.scrollLeft / 315)))
    const left = index * 315
    if (typeof carousel.scrollTo === 'function') carousel.scrollTo({ left, behavior: 'smooth' })
    else carousel.scrollLeft = left
    setSelectedStrategyId(strategies[index]!.id)
  }
  const { isDragging: isStrategyDragging, dragHandlers: strategyDragHandlers } = useDragCarousel({
    carouselRef: strategyCarouselRef,
    enabled: strategies.length > 1,
    onSettle: snapStrategyCarousel,
  })
  const snapPortfolioCarousel = () => {
    const carousel = portfolioCarouselRef.current
    if (!carousel || basketPortfolios.length <= 1) return
    const index = getCarouselSelectedIndex(carousel, basketPortfolios.length)
    const left = getCarouselScrollLeft(carousel, index, basketPortfolios.length)
    if (typeof carousel.scrollTo === 'function') carousel.scrollTo({ left, behavior: 'smooth' })
    else carousel.scrollLeft = left
    setSelectedPortfolio(basketPortfolios[index]!)
  }
  const { isDragging: isPortfolioDragging, dragHandlers: portfolioDragHandlers } = useDragCarousel({
    carouselRef: portfolioCarouselRef,
    enabled: basketPortfolios.length > 1,
    onSettle: snapPortfolioCarousel,
  })

  const carouselPositionRef = useRef({ basketPortfolios, selectedId: selectedBasketPortfolio?.id })
  carouselPositionRef.current = { basketPortfolios, selectedId: selectedBasketPortfolio?.id }
  useEffect(() => {
    if (step !== 'portfolio') return
    const { basketPortfolios, selectedId } = carouselPositionRef.current
    const carousel = portfolioCarouselRef.current
    if (!carousel) return
    const selectedIndex = basketPortfolios.findIndex((candidate) => candidate.id === selectedId)
    carousel.scrollLeft = getCarouselScrollLeft(carousel, Math.max(0, selectedIndex), basketPortfolios.length)
  }, [step, selectedStrategyId])

  return {
    strategyCarouselRef,
    portfolioCarouselRef,
    strategyDragHandlers,
    portfolioDragHandlers,
    isStrategyDragging,
    isPortfolioDragging,
  }
}
