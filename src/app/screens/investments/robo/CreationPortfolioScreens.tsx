import { type RoboAdvisorCreationStep as CreationStep } from '@/features/investments/robo/legacyFlowState'
import { type InvestmentBasketFund, type InvestmentBasketFundHolding } from '@/app/config/investmentBasketFundsConfig'
import PrimaryButton from '@/app/components/PrimaryButton'
import { cn } from '@/app/components/ui/utils'
import { type RoboPortfolio, type RoboStrategy } from '@/features/investments/robo/types'
import { ROBO_INVESTOR_PROFILE_LABELS } from '@/features/investments/robo/presentationData'
import {
  getCarouselSelectedIndex,
  getCarouselScrollLeft,
  StrategyCard,
  BasketPortfolioCard,
  PortfolioDetails,
} from '@/app/screens/investments/robo/PortfolioScreens'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'
import type * as React from 'react'
import type { RoboEvent } from '@/features/investments/robo/flowState'
import type { DragCarouselHandlers } from '@/hooks/useDragCarousel'

export function CreationStrategyScreen({
  strategies,
  goBackByStep,
  requestExit,
  dispatchFlow,
  selectedStrategy,
  strategyCarouselRef,
  strategyDragHandlers,
  setSelectedStrategyId,
  isStrategyDragging,
}: {
  strategies: RoboStrategy[]
  goBackByStep: () => void
  requestExit: () => void
  dispatchFlow: React.Dispatch<RoboEvent>
  selectedStrategy: RoboStrategy
  strategyCarouselRef: React.RefObject<HTMLDivElement>
  strategyDragHandlers: DragCarouselHandlers
  setSelectedStrategyId: (value: RoboStrategy['id']) => void
  isStrategyDragging: boolean
}) {
  return (
    <RoboScreen
      title="Choose a strategy"
      description={`We found ${strategies.length === 1 ? 'one strategy' : `${strategies.length} strategies`} that fit your Moderate profile, goal and time horizon. Explore the possible outcomes before you choose.`}
      onBack={goBackByStep}
      onClose={requestExit}
      dataScreen="strategy"
      footer={
        <PrimaryButton
          labelSize="18"
          onClick={() => {
            dispatchFlow({ type: 'open-portfolio', from: 'strategy' })
          }}
        >
          Continue with {selectedStrategy.name}
        </PrimaryButton>
      }
    >
      <div
        ref={strategyCarouselRef}
        data-testid="robo-strategy-carousel"
        {...strategyDragHandlers}
        onScroll={(event) => {
          const index = Math.max(0, Math.min(strategies.length - 1, Math.round(event.currentTarget.scrollLeft / 315)))
          setSelectedStrategyId(strategies[index]!.id)
        }}
        className={cn(
          '-mr-[24px] flex touch-pan-y snap-x snap-mandatory gap-[16px] overflow-x-auto pb-[8px] pr-[24px] scrollbar-hide',
          isStrategyDragging ? 'cursor-grabbing select-none snap-none' : 'cursor-grab',
        )}
      >
        {strategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            selected={selectedStrategy.id === strategy.id}
            onSelect={() => setSelectedStrategyId(strategy.id)}
            onProjection={() => {
              dispatchFlow({ type: 'open-projection', strategyId: strategy.id })
            }}
            dragHandlers={strategyDragHandlers}
          />
        ))}
      </div>
      {strategies.length > 1 ? (
        <div className="mt-[14px] flex justify-center gap-[6px]">
          {strategies.map((strategy) => (
            <span
              key={strategy.id}
              className={cn(
                'h-[6px] rounded-full',
                strategy.id === selectedStrategy.id
                  ? 'w-[30px] bg-[var(--uc-action)]'
                  : 'w-[6px] bg-[var(--uc-text-subtle)]',
              )}
            />
          ))}
        </div>
      ) : null}
    </RoboScreen>
  )
}

export function CreationPortfolioScreen({
  goBackByStep,
  requestExit,
  selectedBasketHoldingOverlay,
  selectedBasketPortfolio,
  setSelectedPortfolio,
  setStep,
  portfolioCarouselRef,
  portfolioDragHandlers,
  basketPortfolios,
  isPortfolioDragging,
  setBasketDetailsToOpen,
  openBasketHolding,
}: {
  goBackByStep: () => void
  requestExit: () => void
  selectedBasketHoldingOverlay: React.JSX.Element | undefined
  selectedBasketPortfolio: RoboPortfolio | null
  setSelectedPortfolio: (value: RoboPortfolio | null) => void
  setStep: (value: CreationStep) => void
  portfolioCarouselRef: React.RefObject<HTMLDivElement>
  portfolioDragHandlers: DragCarouselHandlers
  basketPortfolios: RoboPortfolio[]
  isPortfolioDragging: boolean
  setBasketDetailsToOpen: React.Dispatch<React.SetStateAction<InvestmentBasketFund | null>>
  openBasketHolding: (basket: InvestmentBasketFund, holding: InvestmentBasketFundHolding, currentValue?: number) => void
}) {
  return (
    <RoboScreen
      title="Available portfolios"
      description={`Based on your ${ROBO_INVESTOR_PROFILE_LABELS.moderate} investor profile, these baskets are a suitable match. Choose one to review their contents.`}
      onBack={goBackByStep}
      onClose={requestExit}
      dataScreen="portfolio"
      overlay={selectedBasketHoldingOverlay}
      footer={
        <PrimaryButton
          labelSize="18"
          onClick={() => {
            if (!selectedBasketPortfolio) return
            setSelectedPortfolio(selectedBasketPortfolio)
            setStep('review')
          }}
        >
          Continue
        </PrimaryButton>
      }
    >
      <div
        ref={portfolioCarouselRef}
        role="radiogroup"
        aria-label="Recommended basket funds"
        data-testid="robo-basket-portfolio-carousel"
        {...portfolioDragHandlers}
        onScroll={(event) => {
          const index = getCarouselSelectedIndex(event.currentTarget, basketPortfolios.length)
          const nearest = basketPortfolios[index]
          if (nearest && nearest.id !== selectedBasketPortfolio?.id) setSelectedPortfolio(nearest)
        }}
        className={cn(
          '-mr-[24px] flex touch-pan-y snap-x snap-mandatory gap-[16px] overflow-x-auto pb-[8px] pr-[24px] scrollbar-hide',
          isPortfolioDragging ? 'cursor-grabbing select-none snap-none' : 'cursor-grab',
        )}
      >
        {basketPortfolios.map((candidate) => (
          <BasketPortfolioCard
            key={candidate.id}
            portfolio={candidate}
            selected={candidate.id === selectedBasketPortfolio?.id}
            onSelect={() => {
              setSelectedPortfolio(candidate)
              const carousel = portfolioCarouselRef.current
              if (!carousel) return
              const index = basketPortfolios.findIndex((basket) => basket.id === candidate.id)
              const left = getCarouselScrollLeft(carousel, index, basketPortfolios.length)
              if (typeof carousel.scrollTo === 'function') carousel.scrollTo({ left, behavior: 'smooth' })
              else carousel.scrollLeft = left
            }}
            onDetails={() => {
              if (candidate.basketFund) setBasketDetailsToOpen(candidate.basketFund)
            }}
            dragHandlers={portfolioDragHandlers}
          />
        ))}
      </div>
      {basketPortfolios.length > 1 ? (
        <div className="mt-[14px] flex justify-center gap-[6px]" aria-label="Basket fund selection position">
          {basketPortfolios.map((candidate) => (
            <span
              key={candidate.id}
              className={cn(
                'h-[6px] rounded-full transition-all',
                candidate.id === selectedBasketPortfolio?.id
                  ? 'w-[30px] bg-[var(--uc-action)]'
                  : 'w-[6px] bg-[var(--uc-text-subtle)]',
              )}
            />
          ))}
        </div>
      ) : null}
      {selectedBasketPortfolio ? (
        <div className="mt-[24px]">
          <PortfolioDetails
            key={selectedBasketPortfolio.id}
            portfolio={selectedBasketPortfolio}
            onHoldingClick={(holding) => openBasketHolding(selectedBasketPortfolio.basketFund!, holding, 0)}
          />
        </div>
      ) : null}
    </RoboScreen>
  )
}
