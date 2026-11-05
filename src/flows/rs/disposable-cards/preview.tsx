import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { AppIcon } from '@/app/components/icons'
import FaceIdAnimation from '@/app/components/FaceIdAnimation'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import PageHeader from '@/app/components/PageHeader'
import NavigationCardArt from '@/app/components/cards/NavigationCardArt'
import Card from '@/app/components/cards/Card'
import { useDragCarousel } from '@/hooks/useDragCarousel'
import disposableCardIcon from './assets/disposable-card-expiry-proposal.svg?raw'
import CopyToast, { type CopyToastState } from '@/app/components/accounts/CopyToast'
import {
  DeleteActionReveal,
  MoreActionsButton,
  deleteRevealContentClass,
} from '@/app/components/messages/DeleteActionReveal'
import { resolveCardNavigationRow } from '@/app/components/contracts/cardNavigationRow'
import PrimaryButton from '@/app/components/PrimaryButton'
import {
  activeDisposableCards,
  closeDisposableCard,
  createDisposableCard,
  recordDisposableCardPayment,
  type DisposableCard,
} from './model'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import CardDetailScreen from '@/app/screens/cards/CardDetailScreen'
import CardSensitiveDetailsScreen from '@/app/screens/cards/CardSensitiveDetailsScreen'
import { useFlowNav } from '@/app/screens/flow-library/components/prototypeNav'
import type { RsDisposableCardsScreenKind } from '@/app/screens/flow-library/flows/types'
import { DemoProvider } from '@/app/state/demoStore'
import { useProducts } from '@/hooks/useProducts'
import type { CreditCard, DebitCard, Product } from '@/data/products'
import type { AccountTransaction } from '@/data/accountDetails'

const CARDS_SCREEN: RsDisposableCardsScreenKind = 'rs-disposable-cards-screen'
const DETAILS_SHEET: RsDisposableCardsScreenKind = 'rs-disposable-cards-details-sheet'
const FACE_ID_NORMAL: RsDisposableCardsScreenKind = 'rs-disposable-cards-face-id-normal'
const FACE_ID_DISPOSABLE: RsDisposableCardsScreenKind = 'rs-disposable-cards-face-id-disposable'
const NORMAL_DETAILS: RsDisposableCardsScreenKind = 'rs-disposable-cards-normal-details'
const DISPOSABLE_DETAILS: RsDisposableCardsScreenKind = 'rs-disposable-cards-disposable-details'
const JOURNEY_STATES: Partial<Record<RsDisposableCardsScreenKind, string>> = {
  'rs-disposable-cards-card-options': 'card-options',
  'rs-disposable-cards-list': 'list',
  'rs-disposable-cards-help': 'help',
  'rs-disposable-cards-close-confirmation': 'close-confirmation',
}
const holdJourneyVerification = () => {}

type CardProduct = DebitCard | CreditCard

function isCardProduct(product: Product): product is CardProduct {
  return product.type === 'debit_card' || product.type === 'credit_card'
}

function demoPayment(card: DisposableCard, now: Date, currency: CardProduct['currency']): AccountTransaction {
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return {
    id: `disposable-payment-${card.id}`,
    day: String(now.getDate()).padStart(2, '0'),
    month: now.toLocaleString('en-GB', { month: 'short' }).toUpperCase(),
    monthKey,
    monthTitle: now.toLocaleString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase(),
    label: 'Disposable card payment',
    details: `Disposable card •••• ${card.pan.slice(-4)}`,
    currency,
    amount: -100,
    type: 'debit',
    category: 'Shopping',
    pfmCategory: 'Shopping',
    pfmSubcategory: 'Online shopping',
    status: 'Booked',
    source: 'card',
  }
}

function DisposableCardIcon({ testId, muted = false }: { testId: string; muted?: boolean }) {
  const mask = `url("data:image/svg+xml,${encodeURIComponent(disposableCardIcon)}")`
  return (
    <span
      aria-hidden="true"
      data-testid={testId}
      data-icon-source="disposable-card-expiry"
      className="block h-[27px] w-[28px] shrink-0"
      style={{
        backgroundColor: muted ? 'var(--uc-text-muted)' : 'var(--uc-icon)',
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}

function CardDetailsChoiceSheet({
  card,
  disposableCards,
  initialPage,
  onClose,
  onView,
  onCreate,
}: {
  card: CardProduct
  disposableCards: DisposableCard[]
  initialPage: number
  onClose: () => void
  onView: (id: string | null, page: number) => void
  onCreate: (page: number) => void
}) {
  const [pageIndex, setPageIndex] = useState(initialPage)
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const dragStart = useRef(0)
  const scrollTimer = useRef<number | null>(null)
  const programmaticTimer = useRef<number | null>(null)
  const programmaticScroll = useRef(false)
  const activeCards = activeDisposableCards(disposableCards, new Date())
  const choices = ['standard', ...activeCards.map((item) => item.id), ...(activeCards.length < 3 ? ['create'] : [])]
  const pages = Array.from({ length: Math.ceil(choices.length / 2) }, (_, index) =>
    choices.slice(index * 2, index * 2 + 2),
  )
  const activePage = Math.max(0, Math.min(pageIndex, pages.length - 1))
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return
    carousel.scrollLeft = Math.min(initialPage, pages.length - 1) * carousel.clientWidth
  }, [initialPage, pages.length])
  const goToPage = (index: number) => {
    const next = Math.max(0, Math.min(pages.length - 1, index))
    const carousel = carouselRef.current
    setPageIndex(next)
    if (!carousel || typeof carousel.scrollTo !== 'function') return
    const left = next * carousel.clientWidth
    if (Math.abs(carousel.scrollLeft - left) < 1) return
    programmaticScroll.current = true
    if (programmaticTimer.current !== null) window.clearTimeout(programmaticTimer.current)
    carousel.scrollTo({ left, behavior: 'auto' })
    programmaticTimer.current = window.setTimeout(() => {
      programmaticScroll.current = false
    }, 160)
  }
  const settleDrag = () => {
    const carousel = carouselRef.current
    if (!carousel || !carousel.clientWidth) return
    const startPage = Math.round(dragStart.current / carousel.clientWidth)
    const movement = carousel.scrollLeft - dragStart.current
    goToPage(Math.abs(movement) >= 32 ? startPage + Math.sign(movement) : startPage)
  }
  const { dragHandlers, isDragging, isPressActiveRef } = useDragCarousel({
    carouselRef,
    enabled: pages.length > 1,
    onSettle: settleDrag,
  })
  useEffect(
    () => () => {
      if (scrollTimer.current !== null) window.clearTimeout(scrollTimer.current)
      if (programmaticTimer.current !== null) window.clearTimeout(programmaticTimer.current)
    },
    [],
  )
  const selectChoice = (index: number) => {
    const next = Math.max(0, Math.min(choices.length - 1, index))
    goToPage(Math.floor(next / 2))
    carouselRef.current?.querySelectorAll<HTMLElement>('[data-card-choice]')[next]?.focus()
  }
  const lastFour = card.cardNumber.replace(/\D/g, '').slice(-4)
  const parentLabel = card.type === 'credit_card' ? 'Your credit card' : 'Your debit card'
  const cardTileClass =
    'flex w-[152px] shrink-0 flex-col items-start rounded-[10px] border-2 border-transparent p-[6px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-action)]'

  return (
    <BottomSheet
      title="Choose a card"
      subtitle="Tap a card to view its details. Disposable cards have their own number and can be used once."
      headerClassName="mb-[16px]"
      onClose={onClose}
    >
      {/* The group supports dragging; its card buttons also support arrow-key navigation. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={carouselRef}
        role="group"
        aria-label="Available cards"
        className={`flex overflow-x-auto pb-[12px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        style={{ touchAction: 'pan-y', overscrollBehaviorX: 'contain' }}
        onScroll={() => {
          if (isPressActiveRef.current || programmaticScroll.current) return
          if (scrollTimer.current !== null) window.clearTimeout(scrollTimer.current)
          scrollTimer.current = window.setTimeout(() => {
            const carousel = carouselRef.current
            if (carousel && carousel.clientWidth && !isPressActiveRef.current && !programmaticScroll.current) {
              goToPage(Math.round(carousel.scrollLeft / carousel.clientWidth))
            }
          }, 120)
        }}
        {...dragHandlers}
        onPointerDown={(event) => {
          dragStart.current = event.currentTarget.scrollLeft
          dragHandlers.onPointerDown(event)
        }}
        onMouseDown={(event) => {
          dragStart.current = event.currentTarget.scrollLeft
          dragHandlers.onMouseDown(event)
        }}
      >
        {pages.map((page, groupIndex) => (
          <div key={groupIndex} data-carousel-page className="flex w-full shrink-0 gap-[16px]">
            {page.map((id, localIndex) => {
              const index = groupIndex * 2 + localIndex
              if (id === 'create') {
                return (
                  <button
                    key={id}
                    type="button"
                    aria-label="Create disposable card"
                    data-card-choice
                    data-testid="empty-disposable-card"
                    onClick={() => onCreate(groupIndex)}
                    onKeyDown={(event) => {
                      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
                      event.preventDefault()
                      const next = Math.max(
                        0,
                        Math.min(choices.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)),
                      )
                      selectChoice(next)
                    }}
                    className={cardTileClass}
                  >
                    <span className="flex h-[85px] w-[136px] flex-col items-center justify-center gap-[4px] rounded-[8px] border border-dashed border-[var(--uc-border)] bg-[var(--uc-surface)]">
                      <DisposableCardIcon testId="empty-disposable-carousel-icon" muted />
                      <span className="uc-type-n5-strong text-[var(--uc-text)]">Add new</span>
                    </span>
                    <span className="uc-type-n5-strong mt-[8px] block text-[var(--uc-text)]">Disposable card</span>
                    <span className="uc-type-n5 block text-[var(--uc-text-muted)]">Single use</span>
                  </button>
                )
              }
              const disposable = activeCards.find((item) => item.id === id)
              const ending = disposable ? disposable.pan.slice(-4) : lastFour
              const label = disposable
                ? `View disposable card ending ${ending}`
                : `View ${parentLabel.toLowerCase()} ending ${ending}`
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={label}
                  data-card-choice
                  onClick={() => onView(disposable?.id ?? null, groupIndex)}
                  onKeyDown={(event) => {
                    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
                    event.preventDefault()
                    const next = Math.max(
                      0,
                      Math.min(choices.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)),
                    )
                    selectChoice(next)
                  }}
                  className={cardTileClass}
                >
                  <Card
                    size="large"
                    style={{ width: 136, height: 85 }}
                    variant={resolveCardNavigationRow(disposable?.parent ?? card).artVariant}
                  />
                  <span className="uc-type-n5-strong mt-[8px] block text-[var(--uc-text)]">
                    {disposable ? 'Disposable card' : parentLabel}
                  </span>
                  <span className="uc-type-n5 block text-[var(--uc-text-muted)]">•••• {ending}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
      {pages.length > 1 ? (
        <div
          data-testid="card-carousel-pagination"
          className="mb-[24px] mt-[8px] flex items-center justify-center gap-[8px]"
          aria-label={`Page ${activePage + 1} of ${pages.length}`}
        >
          {pages.map((_, index) => (
            <span
              key={index}
              aria-hidden="true"
              className={`h-[6px] rounded-full ${index === activePage ? 'w-[24px] bg-[var(--uc-action)]' : 'w-[6px] bg-[var(--uc-text-muted)]'}`}
            />
          ))}
        </div>
      ) : null}
      {activeCards.length >= 3 ? (
        <p className="uc-type-n5 mb-[8px] text-center text-[var(--uc-text-muted)]">
          Maximum of 3 active disposable cards
        </p>
      ) : null}
    </BottomSheet>
  )
}

function DisposableCardsScreen({
  cards,
  initialSelectedId,
  initialSheet,
  onBack,
  onBackFromCarousel,
  onGenerate,
  onCloseCard,
  onCardVerified,
}: {
  cards: DisposableCard[]
  initialSelectedId?: string | null
  initialSheet?: 'help' | 'close' | null
  onBack: () => void
  onBackFromCarousel?: () => void
  onGenerate: () => void
  onCloseCard: (id: string) => void
  onCardVerified: (id: string) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [sheet, setSheet] = useState<'help' | 'close' | null>(initialSheet ?? null)
  const [openActionsId, setOpenActionsId] = useState<string | null>(null)
  const [pendingCloseId, setPendingCloseId] = useState<string | null>(
    initialSheet === 'close' ? (initialSelectedId ?? null) : null,
  )
  const [now, setNow] = useState(() => new Date())
  const [copyToast, setCopyToast] = useState<CopyToastState | null>(null)
  const completeCardVerification = useCallback(() => {
    setSelectedId(pendingId)
    if (pendingId) onCardVerified(pendingId)
    setPendingId(null)
  }, [pendingId, onCardVerified])
  useEffect(() => {
    if (!copyToast) return
    const timer = window.setTimeout(
      () => {
        if (copyToast.visible) setCopyToast({ ...copyToast, visible: false })
        else setCopyToast(null)
      },
      copyToast.visible ? 1400 : 300,
    )
    return () => window.clearTimeout(timer)
  }, [copyToast])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  const active = activeDisposableCards(cards, now)
  const selected = active.find((card) => card.id === selectedId)
  const closingCard = active.find((card) => card.id === pendingCloseId)
  const date = (value: string) =>
    new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))

  if (pendingId) {
    return (
      <div className="relative h-full w-full bg-[var(--uc-surface)]" role="status" aria-label="Face ID verification">
        <FaceIdAnimation onComplete={completeCardVerification} />
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <PageHeader
          title="Disposable card details"
          includeSafeArea
          showHelp={!selected}
          subtitle={
            selected ? (
              <p className="uc-type-n5 mt-[8px] text-[var(--uc-text)]">
                This card can be used once. The transaction will appear under your main card.
              </p>
            ) : undefined
          }
          onBack={() => {
            if (!selected) onBack()
            else if (onBackFromCarousel) onBackFromCarousel()
            else setSelectedId(null)
          }}
          onHelpClick={() => setSheet('help')}
        />
        {selected ? (
          <div className="flex flex-col gap-[26px] px-[24px] pt-[24px]">
            {[
              ['Card number', selected.pan],
              ['Card CVV2/CVC2', selected.securityCode],
              ['Card holder', selected.parent.holder],
              ['Expires on', date(selected.expiresAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-[16px]">
                <div>
                  <div className="uc-type-n5">{label}</div>
                  <div className="uc-type-n5-strong">{value}</div>
                </div>
                {label === 'Card number' ? (
                  <button
                    type="button"
                    aria-label="Copy card number"
                    className="grid size-[44px] place-items-center focus-visible:outline-2 focus-visible:outline-[var(--uc-action)]"
                    onClick={() => {
                      void navigator.clipboard
                        ?.writeText(selected.pan)
                        .then(() => setCopyToast({ message: 'Card number successfully copied', visible: true }))
                        .catch(() => setCopyToast(null))
                    }}
                  >
                    <AppIcon name="copy-documents" size={24} color="var(--uc-icon)" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-[16px] px-[24px] pt-[24px] pb-[24px]">
            <p className="uc-type-n5">
              Each card can be used once and expires after 30 days. You can have up to 3 active cards.
            </p>
            {active.length === 0 ? (
              <div className="flex flex-col items-center gap-[8px] px-[16px] py-[24px] text-center">
                <span
                  aria-hidden="true"
                  className="grid size-[56px] place-items-center rounded-full bg-[var(--uc-app-bg)]"
                >
                  <DisposableCardIcon testId="empty-disposable-list-icon" />
                </span>
                <p className="uc-type-n5-strong">No disposable cards yet</p>
                <p className="uc-type-n5 text-[var(--uc-text-muted)]">Create a card for one payment.</p>
              </div>
            ) : null}
            {active.map((card) => {
              const actionsOpen = openActionsId === card.id
              const ending = card.pan.slice(-4)
              const contentId = `disposable-card-content-${card.id}`
              return (
                <DeleteActionReveal
                  key={card.id}
                  data-disposable-card-row={card.id}
                  actionsOpen={actionsOpen}
                  deleteLabel={`Delete disposable card ending ${ending}`}
                  contentId={contentId}
                  onDelete={() => {
                    setOpenActionsId(null)
                    setPendingCloseId(card.id)
                    setSheet('close')
                  }}
                >
                  <div
                    id={contentId}
                    className={deleteRevealContentClass(
                      actionsOpen,
                      'grid grid-cols-[1fr_32px] items-center gap-[8px]',
                    )}
                  >
                    <button
                      type="button"
                      aria-label={`View disposable card ending ${ending}`}
                      className="grid h-full min-w-0 grid-cols-[64px_1fr] items-center gap-[16px] text-left focus-visible:outline-2 focus-visible:outline-[var(--uc-action)]"
                      onClick={() => {
                        setOpenActionsId(null)
                        setCopyToast(null)
                        setPendingId(card.id)
                      }}
                    >
                      <span aria-hidden="true">
                        <NavigationCardArt variant={resolveCardNavigationRow(card.parent).artVariant} />
                      </span>
                      <span className="min-w-0">
                        <span className="uc-type-n4-strong block">Disposable card •••• {ending}</span>
                        <span className="uc-type-n5 block text-[var(--uc-text-muted)]">
                          Expires on {date(card.expiresAt)}
                        </span>
                      </span>
                    </button>
                    <MoreActionsButton
                      label={`Card actions ending ${ending}`}
                      actionsOpen={actionsOpen}
                      contentId={contentId}
                      onToggle={() => setOpenActionsId((current) => (current === card.id ? null : card.id))}
                    />
                  </div>
                </DeleteActionReveal>
              )
            })}
          </div>
        )}
      </div>
      <footer
        data-disposable-card-footer
        className="flex shrink-0 flex-col gap-[12px] bg-[var(--uc-surface)] px-[24px] pb-[var(--uc-phone-bottom-reserve,34px)] pt-[8px]"
      >
        {selected ? (
          <PrimaryButton
            variant="secondary"
            onClick={() => {
              setCopyToast(null)
              setPendingCloseId(selected.id)
              setSheet('close')
            }}
          >
            Close disposable card
          </PrimaryButton>
        ) : (
          <>
            {active.length >= 3 ? (
              <p className="uc-type-n5 text-center">You have reached the maximum of 3 active cards.</p>
            ) : null}
            <PrimaryButton disabled={active.length >= 3} onClick={onGenerate}>
              Generate new card
            </PrimaryButton>
          </>
        )}
      </footer>
      <CopyToast toast={copyToast} bottomOffset={selected ? 100 : 18} />
      {sheet === 'help' ? (
        <BottomSheet
          title="About disposable cards"
          subtitle="A fresh card number for one payment, whenever you need it."
          onClose={() => setSheet(null)}
          footer={
            <div className="pt-[24px] pb-[8px]">
              <PrimaryButton onClick={() => setSheet(null)}>Got it</PrimaryButton>
            </div>
          }
        >
          <div className="flex flex-col gap-[24px]">
            <div className="flex items-start gap-[16px]">
              <span
                aria-hidden="true"
                className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--uc-app-bg)]"
              >
                <DisposableCardIcon testId="disposable-help-card-icon" />
              </span>
              <div className="min-w-0">
                <h2 className="uc-type-n4-strong">One payment, one card</h2>
                <p className="uc-type-n5 mt-[4px]">
                  Each card has its own number. After one successful payment, it disappears. Create a new one whenever
                  you need it.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-[16px]">
              <span
                aria-hidden="true"
                className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--uc-app-bg)]"
              >
                <AppIcon name="calendar-days" size={24} color="var(--uc-icon)" />
              </span>
              <div className="min-w-0">
                <h2 className="uc-type-n4-strong">Valid for up to 30 days</h2>
                <p className="uc-type-n5 mt-[4px]">
                  An unused card expires after 30 days. You can have up to 3 active cards and close any of them early.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-[16px]">
              <span
                aria-hidden="true"
                className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--uc-app-bg)]"
              >
                <AppIcon name="info-circle" size={24} color="var(--uc-icon)" />
              </span>
              <div className="min-w-0">
                <h2 className="uc-type-n4-strong">Keep track with your main card</h2>
                <p className="uc-type-n5 mt-[4px]">
                  Payments appear under your main card. Transaction limits apply to all disposable cards.
                </p>
              </div>
            </div>
          </div>
        </BottomSheet>
      ) : null}
      {sheet === 'close' && closingCard ? (
        <BottomSheet
          title="Close disposable card?"
          onClose={() => {
            setPendingCloseId(null)
            setSheet(null)
          }}
          footer={
            <div className="flex flex-col gap-[8px] pt-[24px]">
              <PrimaryButton
                onClick={() => {
                  onCloseCard(closingCard.id)
                  setSelectedId(null)
                  setPendingCloseId(null)
                  setSheet(null)
                }}
              >
                Confirm closure
              </PrimaryButton>
              <PrimaryButton
                variant="secondary"
                onClick={() => {
                  setPendingCloseId(null)
                  setSheet(null)
                }}
              >
                Cancel
              </PrimaryButton>
            </div>
          }
        >
          <div className="flex flex-col gap-[20px]">
            <p className="uc-type-n5">
              Card ending {closingCard.pan.slice(-4)} will be permanently closed and its number can no longer be used
              for payments.
            </p>
            <div className="flex items-start gap-[12px] rounded-[8px] bg-[var(--uc-app-bg)] p-[16px]">
              <span aria-hidden="true" className="shrink-0">
                <AppIcon name="info-circle" size={20} color="var(--uc-icon)" />
              </span>
              <div>
                <p className="uc-type-n5-strong">Need another card later?</p>
                <p className="uc-type-n5 mt-[4px]">
                  Your main card is not affected. You can create a new disposable card whenever you need one.
                </p>
              </div>
            </div>
          </div>
        </BottomSheet>
      ) : null}
    </div>
  )
}

function SerbiaCardsPrototype({
  screen,
  parameters,
}: {
  screen: RsDisposableCardsScreenKind
  parameters?: Readonly<Record<string, string>>
}) {
  const nav = useFlowNav()
  const { categories } = useProducts()
  // Journey steps render independently; only their explicit fixtures receive sample session data.
  const requestedState = parameters?.journeyState
  const matchesRequestedScreen =
    (requestedState === 'standard-verification' && screen === FACE_ID_NORMAL) ||
    (requestedState === 'creation-verification' && screen === FACE_ID_DISPOSABLE) ||
    (requestedState === 'list-verification' && screen === FACE_ID_DISPOSABLE) ||
    (requestedState === 'disposable-details' && screen === DISPOSABLE_DETAILS) ||
    (requestedState === 'payment-completed' && (screen === CARDS_SCREEN || screen === DETAILS_SHEET))
  const journeyState = JOURNEY_STATES[screen]
    ? (requestedState ?? JOURNEY_STATES[screen])
    : !nav.active || matchesRequestedScreen
      ? requestedState
      : undefined
  const [journeyFixture] = useState(() => {
    if (
      !journeyState ||
      !['list', 'help', 'disposable-details', 'close-confirmation', 'payment-completed', 'list-verification'].includes(
        journeyState,
      )
    )
      return null
    const parent = categories.flatMap((category) => category.products).find(isCardProduct)
    if (!parent) return null
    const now = new Date()
    const card = createDisposableCard([], now, {
      id: parent.id,
      type: parent.type,
      holder: parent.cardHolderName ?? 'PETER JAGODIĆ',
    })
    return card ? { card, parent, now } : null
  })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [localScreen, setLocalScreen] = useState<RsDisposableCardsScreenKind | null>(null)
  const [disposableCards, setDisposableCards] = useState<DisposableCard[]>(() => {
    if (!journeyFixture) return []
    const cards = [journeyFixture.card]
    return journeyState === 'payment-completed'
      ? recordDisposableCardPayment(cards, journeyFixture.card.id, 'successful', journeyFixture.now)
      : cards
  })
  const [additionalTransactions, setAdditionalTransactions] = useState<Record<string, AccountTransaction[]>>(() =>
    journeyState === 'payment-completed' && journeyFixture
      ? {
          [journeyFixture.parent.id]: [
            demoPayment(journeyFixture.card, journeyFixture.now, journeyFixture.parent.currency),
          ],
        }
      : {},
  )
  const [showOptions, setShowOptions] = useState(journeyState === 'card-options')
  const [fromOptions, setFromOptions] = useState(false)
  const [verifiedDisposableId, setVerifiedDisposableId] = useState<string | null>(
    journeyState === 'disposable-details' ||
      journeyState === 'close-confirmation' ||
      journeyState === 'list-verification'
      ? (journeyFixture?.card.id ?? null)
      : null,
  )
  const [detailOrigin, setDetailOrigin] = useState<'carousel' | 'list'>('list')
  const [carouselPage, setCarouselPage] = useState(0)
  const [pendingGeneration, setPendingGeneration] = useState<{
    parent: DisposableCard['parent']
    origin: 'carousel' | 'list'
  } | null>(null)
  const [lastViewedDisposableId, setLastViewedDisposableId] = useState<string | null>(null)
  const paymentSignal = parameters?.disposablePayment ?? 'none'
  const previousPaymentSignal = useRef(paymentSignal)

  useEffect(() => {
    setLocalScreen(null)
    setPendingGeneration(null)
  }, [screen])

  useEffect(() => {
    if (paymentSignal === 'successful' && previousPaymentSignal.current !== 'successful' && lastViewedDisposableId) {
      const now = new Date()
      const card = activeDisposableCards(disposableCards, now).find((item) => item.id === lastViewedDisposableId)
      const parent = categories.flatMap((category) => category.products).find((item) => item.id === card?.parent.id)
      if (card && parent && isCardProduct(parent)) {
        setDisposableCards((current) => recordDisposableCardPayment(current, card.id, 'successful', now))
        setAdditionalTransactions((current) => ({
          ...current,
          [parent.id]: [demoPayment(card, now, parent.currency), ...(current[parent.id] ?? [])],
        }))
        setSelectedCardId(parent.id)
      }
      setVerifiedDisposableId(null)
      setLastViewedDisposableId(null)
      setShowOptions(false)
      setFromOptions(false)
    }
    previousPaymentSignal.current = paymentSignal
  }, [paymentSignal, lastViewedDisposableId, disposableCards, categories])

  const resolvedScreen = JOURNEY_STATES[screen]
    ? screen === 'rs-disposable-cards-card-options'
      ? CARDS_SCREEN
      : DISPOSABLE_DETAILS
    : screen
  const displayScreen = nav.active ? resolvedScreen : (localScreen ?? resolvedScreen)
  const cards = useMemo(() => categories.flatMap((category) => category.products).filter(isCardProduct), [categories])
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0]

  const rememberCard = useCallback((card: Product) => setSelectedCardId(card.id), [])
  const openDetailsChoice = useCallback(
    (card: Product) => {
      setSelectedCardId(card.id)
      setCarouselPage(0)
      if (nav.active) nav.primary()
      else setLocalScreen(DETAILS_SHEET)
    },
    [nav],
  )
  const goBack = () => {
    if (nav.active) {
      nav.back()
      return
    }
    setLocalScreen(displayScreen === DETAILS_SHEET ? CARDS_SCREEN : DETAILS_SHEET)
  }
  const returnToCards = () => {
    setVerifiedDisposableId(null)
    setShowOptions(false)
    setFromOptions(false)
    if (nav.active) nav.go(CARDS_SCREEN)
    else setLocalScreen(CARDS_SCREEN)
  }
  const chooseCardDetails = (id: string | null, page: number) => {
    setCarouselPage(page)
    setDetailOrigin('carousel')
    setVerifiedDisposableId(id)
    setFromOptions(false)
    if (nav.active) {
      if (id) nav.secondary()
      else nav.primary()
    } else setLocalScreen(id ? FACE_ID_DISPOSABLE : FACE_ID_NORMAL)
  }
  const requestGeneration = (page?: number) => {
    if (!selectedCard || activeDisposableCards(disposableCards, new Date()).length >= 3) return
    if (page !== undefined) setCarouselPage(page)
    setPendingGeneration({
      parent: { id: selectedCard.id, type: selectedCard.type, holder: selectedCard.cardHolderName ?? 'PETER JAGODIĆ' },
      origin: displayScreen === DETAILS_SHEET ? 'carousel' : 'list',
    })
  }

  if (!nav.active && (journeyState === 'creation-verification' || journeyState === 'list-verification')) {
    return (
      <div className="relative h-full w-full bg-[var(--uc-surface)]" role="status" aria-label="Face ID verification">
        <FaceIdAnimation onComplete={holdJourneyVerification} />
      </div>
    )
  }

  if (pendingGeneration) {
    const completeGeneration = () => {
      const card = createDisposableCard(disposableCards, new Date(), pendingGeneration.parent)
      setPendingGeneration(null)
      if (!card) return
      setDisposableCards((current) => [...current, card])
      setVerifiedDisposableId(card.id)
      setDetailOrigin(pendingGeneration.origin)
      setLastViewedDisposableId(card.id)
      if (nav.active) nav.go(DISPOSABLE_DETAILS)
      else setLocalScreen(DISPOSABLE_DETAILS)
    }
    return (
      <div className="relative h-full w-full bg-[var(--uc-surface)]" role="status" aria-label="Face ID verification">
        <FaceIdAnimation onComplete={completeGeneration} />
      </div>
    )
  }

  if (showOptions && selectedCard) {
    return (
      <NativeScreenPreview
        route={{
          screen: 'card-options',
          params: {
            productId: selectedCard.id,
            cardId: selectedCard.id,
            disposableCardsEntry: 'true',
            disposableCardsIcon: `data:image/svg+xml;utf8,${encodeURIComponent(disposableCardIcon)}`,
          },
        }}
        snapshot={{ bankingPresentation: { productCategories: categories, productId: selectedCard.id } }}
        onBack={returnToCards}
        onNavigate={(route, action) => {
          if (action !== 'push' || route.params?.openDisposableCards !== 'true') return false
          setShowOptions(false)
          setFromOptions(true)
          setVerifiedDisposableId(null)
          if (nav.active) nav.go(DISPOSABLE_DETAILS)
          else setLocalScreen(DISPOSABLE_DETAILS)
          return true
        }}
      />
    )
  }

  if (displayScreen === FACE_ID_NORMAL || displayScreen === FACE_ID_DISPOSABLE) {
    const completeFaceId = () => {
      if (!nav.active && journeyState === 'standard-verification') return
      if (nav.active && journeyState === 'creation-verification' && selectedCard) {
        const card = createDisposableCard(disposableCards, new Date(), {
          id: selectedCard.id,
          type: selectedCard.type,
          holder: selectedCard.cardHolderName ?? 'PETER JAGODIĆ',
        })
        if (card) {
          setDisposableCards((current) => [...current, card])
          setVerifiedDisposableId(card.id)
          setDetailOrigin('carousel')
          setLastViewedDisposableId(card.id)
          nav.go(DISPOSABLE_DETAILS)
        }
        return
      }
      if (displayScreen === FACE_ID_DISPOSABLE && verifiedDisposableId) setLastViewedDisposableId(verifiedDisposableId)
      if (nav.active) {
        nav.primary()
        return
      }
      setLocalScreen(displayScreen === FACE_ID_NORMAL ? NORMAL_DETAILS : DISPOSABLE_DETAILS)
    }

    return (
      <div className="relative h-full w-full">
        <CardDetailScreen selectedCardId={selectedCardId} onBack={goBack} onActiveCardChange={rememberCard} />
        <div
          role="status"
          aria-label="Face ID verification"
          data-testid="disposable-card-face-id"
          className="absolute inset-0 z-[9999]"
        >
          <FaceIdAnimation onComplete={completeFaceId} />
        </div>
      </div>
    )
  }

  if (displayScreen === NORMAL_DETAILS && selectedCard) {
    return <CardSensitiveDetailsScreen card={selectedCard} onBack={returnToCards} showHelp={false} />
  }

  if (displayScreen === DISPOSABLE_DETAILS && selectedCard) {
    return (
      <DisposableCardsScreen
        cards={disposableCards}
        initialSelectedId={verifiedDisposableId}
        initialSheet={journeyState === 'help' ? 'help' : journeyState === 'close-confirmation' ? 'close' : null}
        onBackFromCarousel={detailOrigin === 'carousel' ? returnToCards : undefined}
        onBack={() => {
          if (fromOptions) setShowOptions(true)
          else returnToCards()
        }}
        onGenerate={() => requestGeneration()}
        onCardVerified={(id) => {
          setDetailOrigin('list')
          setLastViewedDisposableId(id)
        }}
        onCloseCard={(id) => setDisposableCards((current) => closeDisposableCard(current, id))}
      />
    )
  }

  return (
    <div className="relative h-full w-full">
      <CardDetailScreen
        selectedCardId={selectedCardId}
        additionalTransactions={additionalTransactions}
        onBack={goBack}
        onActiveCardChange={rememberCard}
        onCardOptionsClick={(card) => {
          setSelectedCardId(card.id)
          setShowOptions(true)
        }}
        onShowCardDetailsRequest={displayScreen === CARDS_SCREEN ? openDetailsChoice : undefined}
      />
      {displayScreen === DETAILS_SHEET ? (
        selectedCard ? (
          <CardDetailsChoiceSheet
            card={selectedCard}
            disposableCards={disposableCards}
            initialPage={carouselPage}
            onClose={returnToCards}
            onView={chooseCardDetails}
            onCreate={requestGeneration}
          />
        ) : null
      ) : null}
    </div>
  )
}

function SerbiaBaselineCardsPreview({
  screen,
  parameters,
}: {
  screen: RsDisposableCardsScreenKind
  parameters?: Readonly<Record<string, string>>
}) {
  return (
    <DemoProvider
      initialState={{
        country: 'RS',
        product: 'PI',
        release: 'release-current',
        bankingScenario: 'retail-multi-account-card',
      }}
    >
      <LanguageProvider initialLanguage="en">
        <SerbiaCardsPrototype screen={screen} parameters={parameters} />
      </LanguageProvider>
    </DemoProvider>
  )
}

function SerbiaPreviewBoundary({
  screen,
  parameters,
}: {
  screen: RsDisposableCardsScreenKind
  parameters?: Readonly<Record<string, string>>
}) {
  const nav = useFlowNav()
  return (
    <SerbiaBaselineCardsPreview
      key={
        !nav.active && (parameters?.journeyState || JOURNEY_STATES[screen])
          ? `${screen}:${parameters?.journeyState ?? ''}`
          : 'interactive'
      }
      screen={screen}
      parameters={parameters}
    />
  )
}

export function renderRsDisposableCardsPreview(
  screen: RsDisposableCardsScreenKind,
  parameters?: Readonly<Record<string, string>>,
) {
  return <SerbiaPreviewBoundary screen={screen} parameters={parameters} />
}
