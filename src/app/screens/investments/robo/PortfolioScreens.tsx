import {
  type InvestmentBasketFund,
  formatInvestmentBasketPerformance,
  type InvestmentBasketFundHolding,
} from '@/app/config/investmentBasketFundsConfig'
import { useMemo } from 'react'
import SectionHeadingDivider from '@/app/components/SectionHeadingDivider'
import BrandLogo from '@/app/components/brand-logo/BrandLogo'
import InvestmentProductCard from '@/app/components/investments/InvestmentProductCard'
import LinkButton from '@/app/components/ui/LinkButton'
import { cn } from '@/app/components/ui/utils'
import { formatInvestmentAmountParts } from '@/app/utils/investmentAmountFormatting'
import type { CountryId } from '@/app/state/demoTypes'
import { roundMoney } from '@/data/exchangeRates'
import {
  INVESTMENT_PERIODS,
  type InvestmentSortId,
  type InvestmentCatalogSecurity,
} from '@/app/config/investmentsPortfolioConfig'
import amundiLogo from '@/assets/investments/funds/fund-amundi-logo.png'
import { type DragCarouselHandlers } from '@/hooks/useDragCarousel'
import {
  type RoboGoalPosition,
  type RoboPortfolio,
  type RoboPortfolioProduct,
  type RoboStrategy,
} from '@/features/investments/robo/types'
import {
  getRoboBasketPositionId,
  findRoboBasketSecurity,
  buildRoboBasketPosition,
} from '@/features/investments/robo/goalPositions'

export function AllocationBars({ allocation }: { allocation: RoboStrategy['allocation'] }) {
  return (
    <div className="space-y-[14px]">
      {allocation.map((item) => (
        <div key={item.label}>
          <div className="mb-[6px] flex justify-between">
            <span className="uc-type-n4 text-[var(--uc-text)]">{item.label}</span>
            <span className="uc-type-n5-strong text-[var(--uc-text)]">{item.percent}%</span>
          </div>
          <div className="h-[10px] overflow-hidden rounded-full border border-[var(--uc-text-subtle)] bg-[var(--uc-surface-muted)]">
            <div className="h-full rounded-full bg-[var(--uc-action)]" style={{ width: `${item.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StrategyCard({
  strategy,
  selected,
  onSelect,
  onProjection,
  dragHandlers,
}: {
  strategy: RoboStrategy
  selected: boolean
  onSelect: () => void
  onProjection: () => void
  dragHandlers: DragCarouselHandlers
}) {
  return (
    <article
      {...dragHandlers}
      className={cn(
        'w-[299px] shrink-0 snap-start rounded-[8px] border bg-[var(--uc-surface)] p-[15px]',
        selected ? 'border-[2px] border-[var(--uc-action)]' : 'border-[var(--uc-text)]',
      )}
    >
      <button
        {...dragHandlers}
        type="button"
        onClick={onSelect}
        className="w-full text-left"
        aria-label={`Choose ${strategy.name}`}
      >
        <h2 className={cn('uc-type-h2', selected ? 'text-[var(--uc-action)]' : 'text-[var(--uc-text)]')}>
          {strategy.name}
        </h2>
        <p className="uc-type-n5 mt-[7px] min-h-[51px] leading-[17px] text-[var(--uc-text)]">{strategy.description}</p>
        <div className="mt-[18px]">
          <AllocationBars allocation={strategy.allocation} />
        </div>
      </button>
      <button
        {...dragHandlers}
        type="button"
        aria-label={`See projection for ${strategy.name}`}
        onClick={onProjection}
        className="mt-[22px] w-full py-[8px] text-center uc-type-n4-strong uppercase text-[var(--uc-action)]"
      >
        See projection
      </button>
    </article>
  )
}

export function getCarouselGeometry(carousel: HTMLElement) {
  const firstCard = carousel.firstElementChild as HTMLElement | null
  const secondCard = firstCard?.nextElementSibling as HTMLElement | null
  const cardWidth = firstCard?.offsetWidth || 299
  const measuredStep = firstCard && secondCard ? secondCard.offsetLeft - firstCard.offsetLeft : 0
  const step = measuredStep > 0 ? measuredStep : cardWidth + 16
  const centerInset = Math.max(0, (carousel.clientWidth - cardWidth) / 2)
  return { step, centerInset }
}

export function getCarouselSelectedIndex(carousel: HTMLElement, itemCount: number) {
  if (itemCount <= 1) return 0
  const { step, centerInset } = getCarouselGeometry(carousel)
  return Math.max(0, Math.min(itemCount - 1, Math.round((carousel.scrollLeft + centerInset) / step)))
}

export function getCarouselScrollLeft(carousel: HTMLElement, index: number, itemCount: number) {
  const { step, centerInset } = getCarouselGeometry(carousel)
  const safeIndex = Math.max(0, Math.min(Math.max(0, itemCount - 1), index))
  const maxScrollLeft = Math.max(0, carousel.scrollWidth - carousel.clientWidth)
  return Math.max(0, Math.min(maxScrollLeft, safeIndex * step - centerInset))
}

export function BasketPortfolioCard({
  portfolio,
  selected,
  onSelect,
  onDetails,
  dragHandlers,
}: {
  portfolio: RoboPortfolio
  selected: boolean
  onSelect: () => void
  onDetails: () => void
  dragHandlers: DragCarouselHandlers
}) {
  const basket = portfolio.basketFund!
  const performancePercent = basket.performancePercent

  return (
    <article
      {...dragHandlers}
      className={cn(
        'w-[299px] shrink-0 snap-center rounded-[8px] border bg-[var(--uc-surface)] p-[15px]',
        selected ? 'border-[2px] border-[var(--uc-action)]' : 'border-[var(--uc-text-muted)]',
      )}
    >
      <button
        {...dragHandlers}
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={`Choose ${basket.title}${performancePercent !== undefined ? `, 1-year performance ${formatInvestmentBasketPerformance(performancePercent)}` : ''}`}
        onClick={onSelect}
        className="w-full text-left"
      >
        <div className="flex items-center gap-[10px]">
          <BrandLogo logoId={basket.logoId} size={32} />
          <h2
            className={cn(
              'min-w-0 flex-1 uc-type-h2 line-clamp-2 min-h-[48px] whitespace-pre-line',
              selected ? 'text-[var(--uc-action)]' : 'text-[var(--uc-text)]',
            )}
          >
            {basket.roboCarouselTitle ?? basket.title}
          </h2>
        </div>
        {performancePercent !== undefined ? (
          <div className="mt-[8px]">
            <span className="block text-[26px] font-bold leading-[30px] tabular-nums text-[var(--uc-text)]">
              {formatInvestmentBasketPerformance(performancePercent)}
            </span>
            <span className="mt-[2px] block text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
              Performance · 1 year
            </span>
          </div>
        ) : null}
        <p className="uc-type-n5 mt-[6px] line-clamp-2 min-h-[34px] leading-[17px] text-[var(--uc-text)]">
          {basket.description}
        </p>
      </button>
      <LinkButton aria-label={`Details for ${basket.title}`} onClick={onDetails} className="mx-auto mt-0 min-h-[32px]">
        Details
      </LinkButton>
    </article>
  )
}

export function PortfolioProductLogo({ product }: { product: RoboPortfolioProduct }) {
  if (product.logo === 'amundi') {
    return (
      <img
        src={amundiLogo}
        alt="Amundi Asset Management"
        className="size-[32px] shrink-0 object-cover"
        draggable={false}
      />
    )
  }
  if (product.logo === 'unicredit') {
    return <BrandLogo logoId="unicredit" label={product.name} size={32} />
  }
  if (product.logo === 'apple') {
    return (
      <span
        role="img"
        aria-label="Apple"
        className="grid size-[32px] shrink-0 place-items-center text-[var(--uc-static-black)]"
      >
        <svg aria-hidden="true" className="size-[25px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.15 6.9c-.95 0-2.42-1.08-3.96-1.04-2.04.03-3.91 1.18-4.96 3.01-2.12 3.68-.55 9.1 1.52 12.09 1.01 1.45 2.21 3.09 3.79 3.04 1.52-.07 2.09-.99 3.94-.99 1.83 0 2.35.99 3.96.95 1.64-.03 2.68-1.48 3.68-2.95 1.16-1.69 1.64-3.33 1.66-3.42-.04-.01-3.18-1.22-3.22-4.86-.03-3.04 2.48-4.49 2.6-4.56-1.43-2.09-3.62-2.32-4.39-2.38-2-.15-3.68 1.09-4.61 1.09Zm3.38-3.07c.84-1.01 1.4-2.43 1.25-3.83-1.21.05-2.66.8-3.53 1.82-.78.9-1.45 2.34-1.27 3.71 1.34.11 2.72-.68 3.55-1.7Z" />
        </svg>
      </span>
    )
  }
  if (product.logo === 'tesla') {
    return (
      <span
        role="img"
        aria-label="Tesla"
        className="grid size-[32px] shrink-0 place-items-center text-[var(--uc-brand-tesla)]"
      >
        <svg aria-hidden="true" className="h-[25px] w-[27px]" viewBox="0 0 32 32" fill="currentColor">
          <path d="M16 29 13.8 12.2c-2.1 0-4.2.4-6.1 1.2 1.8-2.6 4.7-4.3 8.3-4.3s6.5 1.7 8.3 4.3c-1.9-.8-4-1.2-6.1-1.2L16 29ZM5.2 10.3C8.3 6.9 12 5.4 16 5.4s7.7 1.5 10.8 4.9c.5-.8.9-1.7 1.2-2.6C24.6 4.8 20.5 3 16 3S7.4 4.8 4 7.7c.3.9.7 1.8 1.2 2.6Z" />
        </svg>
      </span>
    )
  }
  return (
    <span role="img" aria-label="Microsoft" className="grid size-[32px] shrink-0 grid-cols-2 gap-[1px] p-[4px]">
      <span className="bg-[var(--uc-brand-microsoft-red)]" />
      <span className="bg-[var(--uc-brand-microsoft-green)]" />
      <span className="bg-[var(--uc-brand-microsoft-blue)]" />
      <span className="bg-[var(--uc-brand-microsoft-yellow)]" />
    </span>
  )
}

export function PortfolioDetails({
  portfolio,
  onHoldingClick,
}: {
  portfolio: RoboPortfolio
  onHoldingClick: (holding: InvestmentBasketFundHolding) => void
}) {
  const basket = portfolio.basketFund
  if (!basket) return null
  const hasDistribution = basket.holdings?.some((holding) => holding.percent !== undefined) ?? false

  return (
    <section className="pb-[8px]" aria-label="Basket contents" data-robo-basket-details={basket.id}>
      <SectionHeadingDivider
        title={hasDistribution ? 'PRODUCTS DISTRIBUTION' : 'BASKET CONTENTS'}
        variant="medium-title"
        className="-mx-[24px]"
      />
      {basket.holdings?.length ? (
        <div className="mt-[6px]">
          {basket.holdings.map((holding, index) => (
            <button
              key={holding.productId ?? `${basket.id}-${index}`}
              type="button"
              aria-label={`Open product details for ${holding.title}`}
              data-basket-holding={holding.productId ?? holding.title}
              onClick={() => onHoldingClick(holding)}
              className="flex min-h-[58px] w-full items-center gap-[10px] py-[8px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--uc-action)]"
            >
              <BrandLogo logoId={basket.logoId} size={32} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{holding.title}</p>
                {holding.productId ? (
                  <p className="mt-[2px] text-[13px] leading-[16px] text-[var(--uc-text-muted)]">{holding.productId}</p>
                ) : null}
              </div>
              {holding.percent !== undefined ? (
                <span className="text-[15px] font-bold text-[var(--uc-text)]">{holding.percent}%</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-[10px] text-[16px] leading-[21px] text-[var(--uc-text)]">
          {basket.contentsSummary ?? basket.description}
        </p>
      )}
    </section>
  )
}

export function BasketAllocation({
  basket,
  currentValue,
  country,
  amountsHidden,
  securityCatalog,
  selectedSortId,
  goalPositions,
  onOpenSecurity,
}: {
  basket: InvestmentBasketFund
  currentValue: number
  country: CountryId
  amountsHidden: boolean
  securityCatalog: readonly InvestmentCatalogSecurity[]
  selectedSortId: InvestmentSortId
  goalPositions?: readonly RoboGoalPosition[]
  onOpenSecurity?: (selection: {
    securityId: string
    productId?: string
    localValue: number
    performancePercent: number
    hideBuyAction?: boolean
    securityOverride?: InvestmentCatalogSecurity
  }) => void
}) {
  const holdings = useMemo(() => basket.holdings ?? [], [basket.holdings])
  const sortedHoldings = useMemo(() => {
    const positions = holdings.map((holding, index) => {
      const percent = holding.percent ?? 100 / Math.max(holdings.length, 1)
      const id = getRoboBasketPositionId(basket, holding, index)
      const savedPosition = goalPositions?.find((position) => position.id === id || position.holdingIndex === index)
      return {
        holding,
        index,
        percent,
        savedPosition,
        localValue: savedPosition?.localValue ?? (goalPositions ? 0 : roundMoney((currentValue * percent) / 100)),
      }
    })
    const sortByValue = selectedSortId.endsWith('value')
    const descending = selectedSortId.startsWith('max')

    return positions.sort((left, right) => {
      const difference = sortByValue ? left.localValue - right.localValue : left.percent - right.percent
      return (descending ? -difference : difference) || left.index - right.index
    })
  }, [basket, currentValue, goalPositions, holdings, selectedSortId])

  return (
    <section aria-label="Basket positions">
      {sortedHoldings.length ? (
        <div>
          {sortedHoldings.map(({ holding, index, localValue, savedPosition }) => {
            const security = findRoboBasketSecurity(holding, securityCatalog)
            if (!security) {
              return (
                <div
                  key={holding.productId ?? `${basket.id}-${index}`}
                  className="flex min-h-[80px] items-center gap-[12px] px-[16px] py-[16px]"
                >
                  <BrandLogo logoId={basket.logoId} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">
                      {holding.title}
                    </p>
                    <p className="mt-[4px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                      Position data unavailable
                    </p>
                  </div>
                </div>
              )
            }

            const position = buildRoboBasketPosition(security, localValue, country, {
              title: holding.title,
              productId: holding.productId,
            })
            if (savedPosition) position.quantity = savedPosition.quantity

            return (
              <InvestmentProductCard
                key={holding.productId ?? `${basket.id}-${security.id}-${index}`}
                security={position}
                valueParts={formatInvestmentAmountParts(position.value, country, position.currency, amountsHidden)}
                performanceParts={formatInvestmentAmountParts(
                  position.performanceAmount,
                  country,
                  position.localCurrency,
                  amountsHidden,
                  true,
                )}
                valueLabel="Value"
                performanceLabel="Performance"
                czRoboAmountStyle
                amountsHidden={amountsHidden}
                currentPriceParts={formatInvestmentAmountParts(
                  position.marketPrice,
                  country,
                  position.instrumentCurrency,
                  amountsHidden,
                )}
                portfolioValueParts={formatInvestmentAmountParts(
                  localValue,
                  country,
                  position.localCurrency,
                  amountsHidden,
                )}
                onClick={() =>
                  onOpenSecurity?.({
                    securityId: security.id,
                    productId: holding.productId,
                    localValue,
                    performancePercent: position.performancePercent,
                    hideBuyAction: true,
                    securityOverride: position,
                  })
                }
              />
            )
          })}
        </div>
      ) : (
        <p className="px-[16px] py-[16px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
          {basket.contentsSummary ?? basket.description}
        </p>
      )}
    </section>
  )
}

export const GOAL_DETAIL_PERIODS = INVESTMENT_PERIODS.filter((period) => period.id !== '6m').map((period) =>
  period.id === 'max' ? { ...period, label: 'MAX' } : period,
)

export function getGoalProductType(groupLabel: string): string {
  if (groupLabel === 'Stocks') return 'Stock'
  if (groupLabel === 'Funds') return 'Fund'
  if (groupLabel === 'Bonds') return 'Bond'
  return groupLabel
}
