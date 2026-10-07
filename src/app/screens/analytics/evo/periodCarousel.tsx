import { useCallback, useEffect, useRef, type UIEvent } from 'react'
import CashFlowBars, { CashFlowDot } from '@/app/components/analytics/CashFlowBars'
import { CAROUSEL_CARD_SHADOW } from '@/app/components/accounts/AccountBalanceCard'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting'
import type { CountryId } from '@/app/state/demoTypes'
import { type SpendingAnalyticsSummary } from '@/data/spendingAnalytics'
import { maskFormattedAmount } from '@/app/utils/amountPrivacy'
import NetCashflowBlock from '@/app/components/analytics/NetCashflowBlock'
import { useDragCarousel } from '@/hooks/useDragCarousel'
import { type SpendingPeriodSelection } from '@/app/screens/analytics/evoSpendingPeriods'
import { splitAmount, railPeriodLabel } from '@/app/screens/analytics/evo/common'

export function SpendingMonthCard({
  summary,
  country,
  amountsHidden,
  periodLabel,
  onOpenIncome,
  onOpenExpenses,
  dragHandlers,
}: {
  summary: SpendingAnalyticsSummary
  country: CountryId
  amountsHidden: boolean
  periodLabel: string
  onOpenIncome: () => void
  onOpenExpenses: () => void
  dragHandlers?: ReturnType<typeof useDragCarousel>['dragHandlers']
}) {
  void country
  const format = (value: number) => maskFormattedAmount(formatEvo2027Number(Math.abs(value)), amountsHidden)
  const spent = splitAmount(format(summary.spendingTotal))
  const earned = splitAmount(format(summary.incomeTotal))
  /*
   * "You kept 9% of what came in" claimed the money was saved; on the 30th it may
   * simply not have left the account yet. The line states the difference instead,
   * which is what the figure above it actually is.
   */
  const netWord = `${format(summary.netTotal)} ${summary.currency}`

  return (
    <section
      {...dragHandlers}
      data-evo-analytics-summary-hero
      data-evo-analytics-period-card={summary.periodKey}
      // Narrower than the rail so the neighbouring months peek in at both edges — that peek is
      // the swipe affordance. Plain surface: colour belongs to the data, not the chrome.
      className="flex w-[calc(100%-44px)] shrink-0 flex-col gap-[12px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)] p-[16px] text-[var(--uc-text)]"
      style={{ boxShadow: CAROUSEL_CARD_SHADOW }}
    >
      <div>
        <p className="text-[18px] font-bold uppercase leading-[22px] tracking-[0.05em] text-[var(--uc-action)]">
          {periodLabel}
        </p>
        {/* The answer first: what the period left behind. The two bars take the
            rule's place under it, and the figures that produced them sit beneath
            the bar each one fills — money in under the green, money out under the
            black. */}
        <NetCashflowBlock
          className="mt-[8px]"
          netTotal={summary.netTotal}
          incomeTotal={summary.incomeTotal}
          formattedAbsoluteNet={netWord}
          formattedSignedNet={`${summary.netTotal >= 0 ? '+' : '−'}${format(summary.netTotal)} ${summary.currency}`}
          dataAttribute="data-evo-analytics-summary-net"
          labelDataAttribute="data-evo-analytics-summary-net-label"
        />
      </div>

      {/* The bars are a separate reading from the sentence above them; at the
          card's own 12px rhythm they read as one crowded block. */}
      <div className="mt-[8px]">
        <CashFlowBars
          incomeTotal={summary.incomeTotal}
          spendingTotal={summary.spendingTotal}
          barDataAttribute="data-evo-analytics-flow-bar"
          barsDataAttribute="data-evo-analytics-flow-bars"
        />

        <div className="mt-[12px] flex items-start justify-between gap-[12px]">
          <button
            type="button"
            data-evo-analytics-open-income
            onClick={onOpenIncome}
            className="min-w-0 rounded-[8px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-surface)]"
          >
            <span className="flex items-center gap-[6px] text-[16px] font-bold leading-[20px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
              <CashFlowDot flow="in" />
              Money in
            </span>
            <span className="mt-[2px] flex items-baseline gap-[2px] whitespace-nowrap">
              <span className="text-[20px] font-bold leading-[24px] tracking-[-0.02em]">{earned.integer}</span>
              <span className="text-[14px] font-bold leading-[18px]">
                {earned.separator}
                {earned.decimals} {summary.currency}
              </span>
            </span>
          </button>

          <button
            type="button"
            data-evo-analytics-open-expenses
            onClick={onOpenExpenses}
            className="min-w-0 rounded-[8px] text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-surface)]"
          >
            <span className="flex items-center justify-end gap-[6px] text-[16px] font-bold leading-[20px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
              <CashFlowDot flow="out" />
              Money out
            </span>
            <span className="mt-[2px] flex items-baseline justify-end gap-[2px] whitespace-nowrap">
              <span className="text-[20px] font-bold leading-[24px] tracking-[-0.02em]">{spent.integer}</span>
              <span className="text-[14px] font-bold leading-[18px]">
                {spent.separator}
                {spent.decimals} {summary.currency}
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

export function SpendingPeriodCarousel({
  rail,
  summaries,
  country,
  amountsHidden,
  onSelect,
  onOpenIncome,
  onOpenExpenses,
}: {
  rail: { items: SpendingPeriodSelection[]; activeIndex: number }
  summaries: readonly SpendingAnalyticsSummary[]
  country: CountryId
  amountsHidden: boolean
  onSelect: (selection: SpendingPeriodSelection) => void
  onOpenIncome: () => void
  onOpenExpenses: () => void
}) {
  const { t } = useLanguage()
  const railRef = useRef<HTMLDivElement>(null)
  const snapTimeoutRef = useRef<number | null>(null)
  const { activeIndex, items } = rail
  // Where the rail itself last landed, and which rail that was. Together they
  // let the sync effect below tell a selection made elsewhere — a dot, the
  // period sheet — from the customer's own swipe, which must never be yanked
  // back to where it started.
  // -1 and undefined, never the current values: the first run of the effect
  // below has to position the rail, or the overview opens on the oldest month
  // while the state says the newest.
  const railIndexRef = useRef(-1)
  const railKeyRef = useRef<string | undefined>(undefined)

  /**
   * The scroll distance from one card to the next.
   *
   * Measured off a card, never off the rail's first element child: the cards
   * sit inside `display: contents` wrappers that carry `inert`, and an element
   * that generates no box reports `offsetWidth` 0. The step was coming out as
   * the bare 12px gap, so a swipe moved a twelfth of a card and every settle
   * rounded to a month nobody had asked for.
   */
  const measureRail = useCallback(() => {
    const node = railRef.current
    if (!node) return null
    const cards = node.querySelectorAll<HTMLElement>('[data-evo-analytics-period-card]')
    const first = cards[0]
    if (!first) return null

    // The distance between two cards' layout positions, never their painted
    // width: the device frame is a scaled element, so getBoundingClientRect
    // reports the card in screen pixels while scrollLeft is in layout pixels.
    // Mixing the two is what parked the rail halfway between two months.
    const second = cards[1]
    const gap = Number.parseFloat(getComputedStyle(node).gap || '0')
    const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth + gap
    const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth)
    return step > 0 ? { node, step, maxScroll } : null
  }, [])

  /**
   * Where a card parks.
   *
   * Every card but the last one sits flush with the content column's left edge,
   * the peek of its neighbour to the right. The last one has no neighbour, so it
   * parks against the right edge instead — level with the section below it,
   * rather than leaving a card's worth of empty rail beside it.
   */

  const offsetForIndex = useCallback(
    (index: number, step: number, maxScroll: number) => Math.min(index * step, maxScroll),
    [],
  )

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const measured = measureRail()
      if (!measured) return
      const { node, step, maxScroll } = measured
      const clamped = Math.max(0, Math.min(index, items.length - 1))
      const left = offsetForIndex(clamped, step, maxScroll)

      railIndexRef.current = clamped
      if (Math.abs(node.scrollLeft - left) > 1) {
        if (typeof node.scrollTo === 'function') node.scrollTo({ left, behavior })
        else node.scrollLeft = left
      }

      const next = items[clamped]
      if (next && next.id !== items[activeIndex]?.id) onSelect(next)
    },
    [activeIndex, items, measureRail, offsetForIndex, onSelect],
  )

  const settle = useCallback(() => {
    const measured = measureRail()
    if (!measured) return
    scrollToIndex(Math.round(measured.node.scrollLeft / measured.step))
  }, [measureRail, scrollToIndex])

  const clearSnapTimeout = () => {
    if (snapTimeoutRef.current === null) return
    window.clearTimeout(snapTimeoutRef.current)
    snapTimeoutRef.current = null
  }

  const { dragHandlers, isDragging, isPressActiveRef } = useDragCarousel({
    carouselRef: railRef,
    enabled: items.length > 1,
    onSettle: settle,
  })

  // Jump, never animate, when the selection changes from outside the rail —
  // a dot, or the period sheet. A swipe already put the rail where it belongs;
  // re-applying scrollLeft on the render it triggers is what made the gesture
  // stutter halfway through.
  useEffect(() => {
    const key = items[0]?.id
    const railChanged = key !== railKeyRef.current
    railKeyRef.current = key
    if (!railChanged && railIndexRef.current === activeIndex) return

    railIndexRef.current = activeIndex
    const measured = measureRail()
    if (!measured) return
    measured.node.scrollLeft = offsetForIndex(activeIndex, measured.step, measured.maxScroll)
  }, [activeIndex, items, measureRail, offsetForIndex])

  /*
   * A card is one rail-width wide, so the scroll position that centres it is
   * only correct for the width it was measured at. The device frame animates
   * in and the panel resizes with the window, and the rail kept the old pixel
   * offset — which is why Spending opened on half of one month and half of
   * another instead of on a card.
   */
  useEffect(() => {
    const node = railRef.current
    if (!node || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => {
      if (isPressActiveRef.current || railIndexRef.current < 0) return
      const measured = measureRail()
      if (!measured) return
      measured.node.scrollLeft = offsetForIndex(railIndexRef.current, measured.step, measured.maxScroll)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [isPressActiveRef, measureRail, offsetForIndex])

  useEffect(() => () => clearSnapTimeout(), [])

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    if (isPressActiveRef.current) return
    void event
    clearSnapTimeout()
    snapTimeoutRef.current = window.setTimeout(settle, 120)
  }

  return (
    <section
      data-evo-analytics-period-carousel
      className="mt-[16px]"
      /* The granularity and the selection used to be stamped on the control row
         above the rail. The rail is now the only period control the overview
         has, so it carries them. */
      data-evo-expense-interval={items[activeIndex]?.kind}
      data-evo-analytics-period-key={items[activeIndex]?.id}
    >
      <div
        ref={railRef}
        role="toolbar"
        aria-label="Spending periods"
        aria-roledescription="carousel"
        tabIndex={0}
        onScroll={onScroll}
        {...dragHandlers}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            scrollToIndex(activeIndex + 1)
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            scrollToIndex(activeIndex - 1)
          }
        }}
        /* Bleeds to the device edges so the neighbouring cards peek in at both
           sides; that peek is the swipe affordance. */
        /* The trailing padding is the peek width: without it the last card cannot
           scroll far enough to sit flush and always lands 28px out. */
        className={`-mx-[16px] flex items-stretch gap-[12px] overflow-x-auto overflow-y-visible overscroll-x-contain px-[16px] pb-[6px] scrollbar-hide select-none touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {items.map((item, index) => {
          const summary = summaries[index]
          if (!summary) return null
          const isActive = index === activeIndex

          return (
            <div
              key={item.id}
              className="contents"
              /* Off-screen cards leave the tab order and the accessibility tree.
                 Without this a keyboard user walked ten buttons for five periods,
                 eight of them for months they could not see. */
              {...(isActive ? {} : { inert: '' })}
              aria-hidden={isActive ? undefined : true}
            >
              <SpendingMonthCard
                summary={summary}
                country={country}
                amountsHidden={amountsHidden}
                periodLabel={railPeriodLabel(item, t)}
                onOpenIncome={onOpenIncome}
                onOpenExpenses={onOpenExpenses}
                dragHandlers={dragHandlers}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
