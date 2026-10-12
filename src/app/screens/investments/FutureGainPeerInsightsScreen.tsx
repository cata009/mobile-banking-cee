import { useEffect, useRef, useState } from 'react'
import PageHeader from '@/app/components/PageHeader'
import PrimaryButton from '@/app/components/PrimaryButton'
import ToggleButton from '@/app/components/ToggleButton'
import { AppIcon, type IconName } from '@/app/components/icons'
import FutureGainPeerProductSimulatorScreen from '@/app/screens/investments/FutureGainPeerProductSimulatorScreen'
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader'
import {
  FUTURE_GAIN_PEER_GOALS,
  FUTURE_GAIN_PEER_PROFILE,
  type FutureGainPeerGoal,
  type FutureGainPeerGoalId,
  type FutureGainPeerProduct,
} from '@/features/investments/future-gain/peerInsights'
import ageIcon from '@/assets/investments/future-gain-peer-insights/age.svg'
import bannerCloseIcon from '@/assets/investments/future-gain-peer-insights/banner-close.svg'
import externalLinkIcon from '@/assets/investments/future-gain-peer-insights/external-link.svg'
import goalCarIcon from '@/assets/investments/future-gain-peer-insights/goal-car.svg'
import goalHomeIcon from '@/assets/investments/future-gain-peer-insights/goal-home.svg'
import goalPersonalGoalsIcon from '@/assets/investments/future-gain-peer-insights/goal-personal-goals.svg'
import goalSavingIcon from '@/assets/investments/future-gain-peer-insights/goal-saving.svg'
import housingLoanIcon from '@/assets/investments/future-gain-peer-insights/housing-loan.svg'
import insightsInfoIcon from '@/assets/investments/future-gain-peer-insights/insights-info.svg'
import monthlyIncomeIcon from '@/assets/investments/future-gain-peer-insights/monthly-income.svg'
import realEstateAbroadIcon from '@/assets/investments/future-gain-peer-insights/real-estate-abroad.svg'

interface FutureGainPeerInsightsScreenProps {
  onBack: () => void
}

const GOAL_ICON: Record<FutureGainPeerGoal['icon'], string> = {
  home: goalHomeIcon,
  car: goalCarIcon,
  'personal-goals': goalPersonalGoalsIcon,
  saving: goalSavingIcon,
}

const GOAL_SELECTED_COLOR: Record<FutureGainPeerGoalId, string> = {
  'home-living': 'var(--uc-future-goal-home)',
  'buy-a-car': 'var(--uc-future-goal-buy-a-car)',
  'personal-goals': 'var(--uc-future-goal-personal)',
  saving: 'var(--uc-future-goal-saving)',
}

const PRODUCT_IMAGE_ICON: Partial<Record<FutureGainPeerProduct['icon'], string>> = {
  'housing-loan': housingLoanIcon,
  'real-estate-abroad': realEstateAbroadIcon,
  'car-loan': goalCarIcon,
}

const PRODUCT_GLYPH_ICON: Partial<Record<FutureGainPeerProduct['icon'], IconName>> = {
  'energy-efficiency': 'shield-check',
  'credit-card': 'credit-card',
  'cash-loan': 'circle-dollar-sign',
  'personal-loan': 'user-round',
  'term-deposit': 'piggy-bank',
  'investment-fund': 'chart-donut',
}

function HomeIndicator() {
  return (
    <div aria-hidden="true" className="flex h-[34px] shrink-0 items-end justify-center bg-[var(--uc-surface)] pb-[8px]">
      <span className="h-[5px] w-[134px] rounded-full bg-[var(--uc-text)]" />
    </div>
  )
}

function ConsentPage({
  accepted,
  onAcceptedChange,
  onContinue,
  onBack,
}: {
  accepted: boolean
  onAcceptedChange: (accepted: boolean) => void
  onContinue: () => void
  onBack: () => void
}) {
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--uc-surface)]">
      <main className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handleScroll}>
        <PageHeader
          title="GDPR notice"
          onBack={onBack}
          collapsedTitleProgress={headerProgress}
          includeSafeArea
          hideCollapsedTitleWhenHidden
        />
        <div className="px-[24px] pb-[20px] pt-[16px]">
          <p className="uc-type-p1 text-[18px] leading-[20px] text-[var(--uc-text)]">
            <strong>
              To display and use this functionality, the processing of your personal data is required. Based on a review
              of our records, we have determined that you currently do not have an active consent granted to UniCredit
              Bank for the processing of personal data for the purpose of the promotion/sale of products and services
              (direct marketing), particularly those determined through the processing and analysis of information
              related to your needs, habits, and spending patterns.
            </strong>
          </p>
          <p className="mt-[16px] uc-type-p1 text-[18px] leading-[20px] text-[var(--uc-text)]">
            Before accessing this functionality, you must confirm that you have read and understood the mBanking App
            Privacy Policy, that has been presented to you and provide your consent to the Bank.
          </p>
          <p className="mt-[8px] uc-type-p1 text-[18px] leading-[20px] text-[var(--uc-text)]">
            The processing of data for the above-mentioned purposes is carried out to enable the Bank to tailor its
            offers to your preferences and needs and to inform you in a timely manner about services and benefits that
            may be relevant to you.
          </p>
          <p className="mt-[8px] uc-type-p1 text-[18px] leading-[20px] text-[var(--uc-text)]">
            You may withdraw your consent at any time through the mobile application or in person at any Bank branch.
          </p>

          <a
            className="mt-[20px] inline-flex min-h-[32px] items-center gap-[4px] uc-type-label text-[var(--uc-action)]"
            href="https://www.unicreditbank.rs/en/o-nama/politika_privatnosti_mbanking.html"
            rel="noreferrer"
            target="_blank"
          >
            mBank PRIVACY Policy
            <img src={externalLinkIcon} alt="" width="32" height="32" draggable={false} />
          </a>
        </div>
      </main>

      <footer className="shrink-0 bg-[var(--uc-surface)]">
        <div className="flex min-h-[80px] items-center justify-between gap-[16px] px-[24px]">
          <span className="uc-type-n4-strong max-w-[259px] text-[var(--uc-text)]">
            I AGREE WITH THE TERMS AND CONDITIONS
          </span>
          <ToggleButton
            ariaLabel="I agree with the terms and conditions"
            checked={accepted}
            onToggle={onAcceptedChange}
            className="shrink-0"
          />
        </div>
        <div className="px-[24px] pb-[8px]">
          <PrimaryButton disabled={!accepted} onClick={onContinue} labelSize="18">
            Next
          </PrimaryButton>
        </div>
        <HomeIndicator />
      </footer>
    </div>
  )
}

function PeerProfileCard() {
  return (
    <section
      aria-label="Insights from clients similar to you"
      className="rounded-[8px] bg-[var(--uc-surface-muted)] px-[12px] pb-[14px] pt-[12px]"
    >
      <div className="flex items-center gap-[8px]">
        <h2 className="uc-type-n5-strong text-[var(--uc-text)]">Insights from clients similar to you</h2>
        <img src={insightsInfoIcon} alt="" width="20" height="20" draggable={false} />
      </div>
      <div className="mt-[8px] grid grid-cols-2">
        <div className="flex flex-col items-center gap-[4px] border-r border-[var(--uc-border-muted)] px-[8px]">
          <img src={ageIcon} alt="" width="24" height="24" draggable={false} />
          <span className="uc-type-p2 text-[var(--uc-text-muted)]">Age</span>
          <strong className="uc-type-p2-strong text-[var(--uc-text)]">{FUTURE_GAIN_PEER_PROFILE.age}</strong>
        </div>
        <div className="flex flex-col items-center gap-[4px] px-[8px]">
          <img src={monthlyIncomeIcon} alt="" width="24" height="24" draggable={false} />
          <span className="uc-type-p2 text-[var(--uc-text-muted)]">Monthly income</span>
          <strong className="uc-type-p2-strong text-[var(--uc-text)]">{FUTURE_GAIN_PEER_PROFILE.monthlyIncome}</strong>
        </div>
      </div>
    </section>
  )
}

function GoalCarousel({
  activeGoal,
  onGoalChange,
}: {
  activeGoal: FutureGainPeerGoalId
  onGoalChange: (goalId: FutureGainPeerGoalId) => void
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [trailingGutter, setTrailingGutter] = useState(17)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateTrailingGutter = () => {
      const centeredInset = Math.ceil((container.clientWidth - 96) / 2)
      setTrailingGutter(Math.max(17, centeredInset))
    }

    updateTrailingGutter()
    const resizeObserver = new ResizeObserver(updateTrailingGutter)
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      ref={scrollContainerRef}
      className="snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-px-[17px] scrollbar-hide"
    >
      <div role="tablist" aria-label="What are you looking to achieve?" className="flex w-max">
        <span aria-hidden="true" data-goal-carousel-gutter="leading" className="w-[17px] shrink-0" />
        {FUTURE_GAIN_PEER_GOALS.map((goal, index) => {
          const selected = goal.id === activeGoal

          return (
            <button
              key={goal.id}
              id={`future-gain-goal-tab-${goal.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="future-gain-goal-products"
              onClick={(event) => {
                onGoalChange(goal.id)
                event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
              }}
              className={`flex h-[96px] w-[96px] shrink-0 snap-start flex-col items-start justify-between rounded-[8px] px-[12px] pb-[16px] pt-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${
                index > 0 ? 'ml-[8px] ' : ''
              }${selected ? 'text-[var(--uc-static-white)]' : 'bg-[var(--uc-surface-muted)] text-[var(--uc-text)]'}`}
              style={selected ? { backgroundColor: GOAL_SELECTED_COLOR[goal.id] } : undefined}
            >
              <span className="grid size-[32px] shrink-0 place-items-center">
                <img
                  src={GOAL_ICON[goal.icon]}
                  alt=""
                  width="32"
                  height="32"
                  className={`scale-[0.75] ${selected ? 'brightness-0 invert' : 'brightness-0'}`}
                  draggable={false}
                />
              </span>
              <span className="uc-type-n5-strong leading-[14px]">{goal.title}</span>
            </button>
          )
        })}
        <span
          aria-hidden="true"
          data-goal-carousel-gutter="trailing"
          className="w-[17px] shrink-0"
          style={{ width: `${trailingGutter}px` }}
        />
      </div>
    </div>
  )
}

function ProductInsightRow({
  product,
  goal,
  onSelect,
}: {
  product: FutureGainPeerProduct
  goal: FutureGainPeerGoal
  onSelect: (product: FutureGainPeerProduct) => void
}) {
  const imageIcon = PRODUCT_IMAGE_ICON[product.icon]
  const glyphIcon = PRODUCT_GLYPH_ICON[product.icon]
  return (
    <article className="flex min-h-[74px] items-center gap-[8px] rounded-[8px] bg-[var(--uc-surface-muted)] px-[12px] py-[10px]">
      <button
        type="button"
        aria-label={`Open ${product.title} simulator`}
        onClick={() => onSelect(product)}
        className="flex min-h-[54px] min-w-0 flex-1 items-center gap-[8px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
      >
        <span
          data-product-icon
          aria-hidden="true"
          className="grid size-[32px] shrink-0 place-items-center rounded-full text-[var(--uc-static-white)]"
          style={{ backgroundColor: GOAL_SELECTED_COLOR[goal.id] }}
        >
          {imageIcon ? (
            <img
              src={imageIcon}
              alt=""
              width={imageIcon === goalCarIcon ? 32 : 16}
              height={imageIcon === goalCarIcon ? 32 : 16}
              className={imageIcon === goalCarIcon ? 'scale-[0.5] brightness-0 invert' : 'brightness-0 invert'}
              draggable={false}
            />
          ) : glyphIcon ? (
            <AppIcon name={glyphIcon} size={16} color="var(--uc-static-white)" />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block uc-type-n5-strong text-[var(--uc-text)]">{product.title}</span>
          <span className="mt-[4px] block uc-type-p2 text-[var(--uc-text-muted)]">
            {product.usage === 'more-than-65' ? (
              <>
                More then <strong>65%</strong> of clients like you chose this product
              </>
            ) : product.usage === 'less-than-50' ? (
              <>
                Less then <strong>50%</strong> of clients like you chose this product
              </>
            ) : goal.id === 'saving' ? (
              'Explore savings options'
            ) : (
              'Explore financing options'
            )}
          </span>
        </span>
        <AppIcon name="chevron-link" size={32} color="var(--uc-text)" />
      </button>
    </article>
  )
}

function PeerInsightsPage({
  activeGoalId,
  onGoalChange,
  onBack,
}: {
  activeGoalId: FutureGainPeerGoalId
  onGoalChange: (goalId: FutureGainPeerGoalId) => void
  onBack: () => void
}) {
  const [bannerVisible, setBannerVisible] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<FutureGainPeerProduct | null>(null)
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64)
  const activeGoal = FUTURE_GAIN_PEER_GOALS.find((goal) => goal.id === activeGoalId) ?? FUTURE_GAIN_PEER_GOALS[0]!

  if (selectedProduct) {
    return <FutureGainPeerProductSimulatorScreen product={selectedProduct} onBack={() => setSelectedProduct(null)} />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--uc-surface)]">
      <main className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handleScroll}>
        <PageHeader
          title="Achieve your life goals"
          onBack={onBack}
          collapsedTitleProgress={headerProgress}
          includeSafeArea
          hideCollapsedTitleWhenHidden
        />
        <div className="px-[24px] pb-[12px] pt-[4px]">
          <p className="uc-type-p2 text-[var(--uc-text)]">
            Explore opportunities and make informed decisions based of clients with similar profiles.
          </p>
          <div className="mt-[16px]">
            <PeerProfileCard />
          </div>
          <h2 className="mt-[18px] uc-type-n5-strong text-[var(--uc-text)]">What are you looking to achieve?</h2>
        </div>

        <GoalCarousel activeGoal={activeGoalId} onGoalChange={onGoalChange} />

        <section
          id="future-gain-goal-products"
          role="tabpanel"
          aria-labelledby={`future-gain-goal-tab-${activeGoal.id}`}
          className="px-[24px] pb-[12px] pt-[16px]"
        >
          <h2 className="uc-type-n5-strong text-[var(--uc-text)]">{activeGoal.sectionTitle}</h2>
          <div className="mt-[12px] flex flex-col gap-[12px]">
            {activeGoal.products.map((product) => (
              <ProductInsightRow key={product.id} product={product} goal={activeGoal} onSelect={setSelectedProduct} />
            ))}
          </div>
        </section>

        {bannerVisible ? (
          <aside
            role="status"
            aria-label="Pre-approved products"
            className="mx-[14px] mt-[6px] flex items-center justify-between gap-[12px] rounded-[8px] bg-[var(--uc-action)] p-[16px] text-[var(--uc-static-white)] shadow-[0_4px_2px_rgb(var(--uc-shadow-rgb)_/_0.25)]"
          >
            <p className="flex-1 uc-type-h2 text-[var(--uc-static-white)]">Explore your pre-approved products in UCB</p>
            <button
              type="button"
              aria-label="Dismiss pre-approved products message"
              onClick={() => setBannerVisible(false)}
              className="grid size-[24px] shrink-0 place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <img src={bannerCloseIcon} alt="" width="24" height="24" draggable={false} />
            </button>
          </aside>
        ) : null}

        <div className="px-[24px] pb-[24px] pt-[30px] text-center text-[var(--uc-text-muted)]">
          <p className="uc-type-p2 leading-[16px]">
            The information displayed in this section is provided for informational purposes only. The data shown
            reflects the percentage of users within your peer group who use specific product categories offered by
            UniCredit Bank and UniCredit Invest, and does not constitute a personal recommendation, investment advice,
            or a suggested investment strategy within the meaning of the Capital Market Law.
          </p>
          <p className="mt-[4px] uc-type-p2 leading-[16px]">
            The information presented is based on statistical data and does not take into account your individual
            investment objectives, financial situation, knowledge, or experience. Investing in financial instruments
            involves the risk of loss of capital. Past performance is neither an indicator nor a guarantee of future
            results.
          </p>
        </div>
      </main>
      <HomeIndicator />
    </div>
  )
}

export default function FutureGainPeerInsightsScreen({ onBack }: FutureGainPeerInsightsScreenProps) {
  const [page, setPage] = useState<'consent' | 'insights'>('consent')
  const [accepted, setAccepted] = useState(false)
  const [activeGoal, setActiveGoal] = useState<FutureGainPeerGoalId>('home-living')

  if (page === 'consent') {
    return (
      <div
        className="relative flex h-full w-full flex-col overflow-hidden text-[var(--uc-text)]"
        data-future-gain-peer-insights-screen="consent"
      >
        <ConsentPage
          accepted={accepted}
          onAcceptedChange={setAccepted}
          onContinue={() => setPage('insights')}
          onBack={onBack}
        />
      </div>
    )
  }

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden text-[var(--uc-text)]"
      data-future-gain-peer-insights-screen="insights"
    >
      <PeerInsightsPage activeGoalId={activeGoal} onGoalChange={setActiveGoal} onBack={() => setPage('consent')} />
    </div>
  )
}
