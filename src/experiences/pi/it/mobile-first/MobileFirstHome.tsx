import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  getAccountPreferences,
  subscribeAccountMovementChanges,
  selectHomeAccounts,
  getAccountLedgerRecord,
  type MobileFirstAccountRecord,
} from '@/features/accounts-payments/mobileFirstAccounts'
import { ACCOUNT_DIRECTORY, ACCOUNT_IMPORTED_DIRECTORY } from './accountContent'
import { BottomSheet } from '@/app/components/BottomSheet'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { useDragCarousel } from '@/hooks/useDragCarousel'
import { useDemo } from '@/app/state/demoStore'
import { BrandToggle, LogosBuddyHorizontal, SamsungPayLogo, mobileFirstAssets as assets } from './assets'
import { MOBILE_FIRST_ACCOUNTS, MOBILE_FIRST_COMMERCIAL_PRODUCTS, MOBILE_FIRST_PRODUCT_CATEGORIES } from './content'
import './mobile-first.css'
import MobileFirstSearch from './MobileFirstSearch'
import MobileFirstAccount from './MobileFirstAccount'
import MobileFirstCategoryPanel from './MobileFirstCategoryPanel'
import MobileFirstInvestments, { type MobileFirstInvestmentsHandle } from './MobileFirstInvestments'
import MobileFirstCards from './MobileFirstCards'
import { selectHomepageCards, getCardLedgerRecord } from '@/features/cards/mobileFirstCards'
import { ITALY_CARDS, type ItalyCardsSnapshot } from './cardsContent'
import MobileFirstLoans, { MobileFirstLoansPanel, type LoansInitialView } from './MobileFirstLoans'
import MobileFirstOperations from './MobileFirstOperations'
import MobileFirstPfm from './MobileFirstPfm'
import MobileFirstProfile from './MobileFirstProfile'
import MobileFirstProfileLogin from './MobileFirstProfileLogin'
import type { ProfileHubNavigation } from './MobileFirstProfileHub'
import type { ProfileArea } from './profileContent'
import { createItalySearchIndex } from './searchContent'
import type { SearchEntry } from '@/features/search/mobileFirstSearch'
import type { InvestmentDestination } from './investmentsNavigation'
import { profileSettingsStore } from '@/features/profile/mobileFirstProfileSettings'
import {
  getItalyFinancialSnapshot,
  subscribeItalyFinancialChanges,
  fromCents,
} from '@/features/finance/italyFinancials'
import { selectPfmSummary, getPfmWealthSummary } from '@/features/analytics/mobileFirstPfm'
import { getPfmBudgetSnapshot, subscribePfmBudgetChanges } from '@/features/analytics/mobileFirstPfmState'
import { getItalyPfmFinancialInput } from './pfmFinancialContent'
import MobileFirstInsurance, { MobileFirstInsurancePanel, type InsuranceInitialView } from './MobileFirstInsurance'

function Icon({ src, size = 24 }: { src: string; size?: number }) {
  return <img src={src} alt="" width={size} height={size} className="mf-icon" />
}
function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
function boundedCategoryLeft(rail: HTMLElement, chip: HTMLElement) {
  const max = Math.max(0, rail.scrollWidth - rail.clientWidth)
  const centered = chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2
  return Math.min(Math.max(centered, 0), max)
}

function Amount({ value, hidden, small = false }: { value: number; hidden: boolean; small?: boolean }) {
  const [integer, decimals] = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(value)
    .split(',')
  return (
    <span className={`mf-amount${small ? ' mf-amount-small' : ''}`}>
      <strong>{hidden ? (small ? '*.***.***' : '**.***') : integer}</strong>
      <span>{hidden ? ',** €' : `,${decimals} €`}</span>
    </span>
  )
}

function CarouselControls({
  index,
  count,
  onChange,
  label,
}: {
  index: number
  count: number
  onChange: (index: number) => void
  label: string
}) {
  return (
    <div className="mf-carousel-controls">
      <div className="mf-arrows">
        <button
          type="button"
          disabled={index === 0}
          aria-label={`${label} precedente`}
          onClick={() => onChange(index - 1)}
        >
          <Icon src={index === 0 ? assets.backDisabled : assets.back} size={16} />
        </button>
        <button
          type="button"
          disabled={index === count - 1}
          aria-label={`${label} successivo`}
          onClick={() => onChange(index + 1)}
        >
          <Icon src={assets.forth} size={16} />
        </button>
      </div>
      <div className="mf-progress" aria-label={`${index + 1} di ${count}`}>
        {Array.from({ length: count }, (_, step) => (
          <button
            key={step}
            type="button"
            aria-label={`${label} ${step + 1}`}
            aria-current={step === index ? 'true' : undefined}
            onClick={() => onChange(step)}
          />
        ))}
      </div>
    </div>
  )
}

function CommercialCarousel({ onOpen }: { onOpen: (title: string, content: ReactNode) => void }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const goTo = (nextIndex: number) => {
    const rail = railRef.current
    if (!rail) return
    const range = Math.max(0, rail.scrollWidth - rail.clientWidth)
    setIndex(nextIndex)
    rail.scrollTo?.({ left: nextIndex * range, behavior: 'smooth' })
  }
  const drag = useDragCarousel({
    carouselRef: railRef,
    onSettle: () => {
      const rail = railRef.current
      if (!rail) return
      const range = rail.scrollWidth - rail.clientWidth
      goTo(range > 0 ? Math.max(0, Math.min(1, Math.round(rail.scrollLeft / range))) : 0)
    },
  })
  return (
    <section className="mf-section" aria-labelledby="mf-commercial-title">
      <h2 id="mf-commercial-title">I nostri prodotti</h2>
      <ScrollableRegion
        ref={railRef}
        className="mf-commercial-rail"
        {...drag.dragHandlers}
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse') drag.dragHandlers.onPointerDown(event)
        }}
        data-dragging={drag.isDragging || undefined}
        aria-label="I nostri prodotti"
        onScroll={(event) => {
          const rail = event.currentTarget
          const range = rail.scrollWidth - rail.clientWidth
          setIndex(range > 0 ? Math.min(1, Math.round(rail.scrollLeft / range)) : 0)
        }}
      >
        {MOBILE_FIRST_COMMERCIAL_PRODUCTS.map((product, i) => (
          <button
            className="mf-commercial-card"
            type="button"
            key={product.title}
            onClick={() => onOpen(product.title, product.description)}
          >
            <span className={`mf-commercial-image mf-commercial-image-${i}`}>
              <img src={assets.products[i]} alt="" className="mf-product-photo" />
              <img src={assets.appLogo} alt="UniCredit" width={32} height={32} className="mf-product-logo" />
            </span>
            <strong>{product.title}</strong>
            <span>{product.description}</span>
          </button>
        ))}
      </ScrollableRegion>
      <CarouselControls index={index} count={2} onChange={goTo} label="Prodotti" />
    </section>
  )
}

export default function MobileFirstHome({
  onPhoneChromeChange,
}: { onPhoneChromeChange?: (variant: 'light' | 'dark') => void } = {}) {
  useEffect(() => () => onPhoneChromeChange?.('light'), [onPhoneChromeChange])
  const { amountsHidden, toggleAmountsHidden, productCounts } = useDemo()
  const financial = useSyncExternalStore(
    subscribeItalyFinancialChanges,
    getItalyFinancialSnapshot,
    getItalyFinancialSnapshot,
  )
  const budget = useSyncExternalStore(subscribePfmBudgetChanges, getPfmBudgetSnapshot, getPfmBudgetSnapshot)
  const pfmInput = getItalyPfmFinancialInput(financial, productCounts)
  const financialSummary = selectPfmSummary(financial, pfmInput)
  const wealthSummary = getPfmWealthSummary(pfmInput, { year: financial.asOf.slice(0, 4) })
  const financialDate = financial.asOf.split('-').reverse().join('/')
  const profileSettings = useSyncExternalStore(
    profileSettingsStore.subscribe,
    profileSettingsStore.getSnapshot,
    profileSettingsStore.getSnapshot,
  )
  const accountPreferences = useSyncExternalStore(
    subscribeAccountMovementChanges,
    getAccountPreferences,
    getAccountPreferences,
  )
  const searchAccounts = [
    ...new Map(
      [
        ...ACCOUNT_DIRECTORY.slice(0, productCounts.accounts),
        ...ACCOUNT_IMPORTED_DIRECTORY,
        ...accountPreferences.imported,
      ].map((account) => [account.number, account] as const),
    ).values(),
  ].map((account) =>
    getAccountLedgerRecord({ ...account, name: accountPreferences.names[account.number] ?? account.name }, financial),
  )
  const homeAccounts = selectHomeAccounts(
    ACCOUNT_DIRECTORY.slice(0, productCounts.accounts).map((account) => getAccountLedgerRecord(account, financial)),
    accountPreferences,
  )
  const [category, setCategory] = useState<string>('Conti')
  const [offerCategory, setOfferCategory] = useState('Casa')
  const [widget, setWidget] = useState(0)
  const widgetRailRef = useRef<HTMLDivElement | null>(null)
  const categoryRailRef = useRef<HTMLDivElement | null>(null)
  const categoryDrag = useDragCarousel({ carouselRef: categoryRailRef })
  const categoryResize = useRef<ResizeObserver | null>(null)
  const widgetResize = useRef<ResizeObserver | null>(null)
  const widgetGeometry = useRef({ width: 0, index: 0 })
  const widgetScroll = useRef<{ left: number; width: number }>()
  const categoryScroll = useRef<{ left: number; label: string | null }>()
  const previousCategory = useRef(category)
  const mountWidgetRail = useCallback((rail: HTMLDivElement | null) => {
    widgetResize.current?.disconnect()
    if (widgetRailRef.current)
      widgetScroll.current = { left: widgetRailRef.current.scrollLeft, width: widgetRailRef.current.clientWidth }
    widgetRailRef.current = rail
    if (!rail) return
    widgetGeometry.current.width = rail.clientWidth
    const saved = widgetScroll.current
    rail.scrollLeft =
      saved?.width === rail.clientWidth
        ? saved.left
        : (widgetGeometry.current.index * Math.max(0, rail.scrollWidth - rail.clientWidth)) / 2
    if (typeof ResizeObserver !== 'undefined') {
      widgetResize.current = new ResizeObserver(() => {
        if (widgetGeometry.current.width === rail.clientWidth) return
        widgetGeometry.current.width = rail.clientWidth
        rail.scrollLeft = (widgetGeometry.current.index * Math.max(0, rail.scrollWidth - rail.clientWidth)) / 2
      })
      widgetResize.current.observe(rail)
    }
  }, [])
  const mountCategoryRail = useCallback((rail: HTMLDivElement | null) => {
    categoryResize.current?.disconnect()
    const previous = categoryRailRef.current
    if (previous)
      categoryScroll.current = {
        left: previous.scrollLeft,
        label: previous.querySelector('[aria-selected="true"]')?.textContent ?? null,
      }
    categoryRailRef.current = rail
    const selected = rail?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!rail || !selected) return
    const saved = categoryScroll.current
    rail.scrollLeft = saved?.label === selected.textContent ? saved.left : boundedCategoryLeft(rail, selected)
    if (typeof ResizeObserver !== 'undefined') {
      let width = rail.clientWidth
      categoryResize.current = new ResizeObserver(() => {
        if (rail.clientWidth === width) return
        width = rail.clientWidth
        const active = rail.querySelector<HTMLElement>('[aria-selected="true"]')
        if (!active) return
        rail.scrollLeft = boundedCategoryLeft(rail, active)
      })
      categoryResize.current.observe(rail)
    }
  }, [])
  const goToWidget = (index: number) => {
    const rail = widgetRailRef.current
    widgetGeometry.current.index = index
    if (rail) widgetGeometry.current.width = rail.clientWidth
    setWidget(index)
    if (rail)
      rail.scrollTo?.({
        left: (index * Math.max(0, rail.scrollWidth - rail.clientWidth)) / 2,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      })
  }
  const widgetDrag = useDragCarousel({
    carouselRef: widgetRailRef,
    onSettle: () => {
      const rail = widgetRailRef.current
      if (!rail) return
      const range = rail.scrollWidth - rail.clientWidth
      goToWidget(range > 0 ? Math.max(0, Math.min(2, Math.round((rail.scrollLeft * 2) / range))) : 0)
    },
  })
  useLayoutEffect(() => {
    if (previousCategory.current === category) return
    previousCategory.current = category
    const rail = categoryRailRef.current
    const selected = rail?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (rail && selected) {
      const left = boundedCategoryLeft(rail, selected)
      rail.scrollTo?.({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    }
  }, [category])
  const [wallet, setWallet] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchReturnRef = useRef(false)
  const [selectedAccount, setSelectedAccount] = useState<MobileFirstAccountRecord | null>(null)
  const [accountEntry, setAccountEntry] = useState(0)
  const [mainTab, setMainTab] = useState<'home' | 'investments'>('home')
  const [investmentEntry, setInvestmentEntry] = useState<InvestmentDestination>()
  const [investmentGeneration, setInvestmentGeneration] = useState(0)
  const [operationsOpen, setOperationsOpen] = useState(false)
  const [pfmTab, setPfmTab] = useState<'Bilancio familiare' | 'Budget' | 'Patrimonio' | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loggedOut, setLoggedOut] = useState(false)
  const [profileEntry, setProfileEntry] = useState<ProfileHubNavigation | undefined>()
  const [cardEntry, setCardEntry] = useState<{
    cardId: string
    view: 'hub' | 'detail' | 'pin'
    movementId?: string
  } | null>(null)
  const [cardsSnapshot, setCardsSnapshot] = useState<ItalyCardsSnapshot>()
  const [loanEntry, setLoanEntry] = useState<{ loanId?: string; view?: LoansInitialView } | null>(null)
  const [insuranceEntry, setInsuranceEntry] = useState<{ policyId?: string; view?: InsuranceInitialView } | null>(null)
  const [accountInitialView, setAccountInitialView] = useState<'detail' | 'accounts'>('detail')
  const [accountMovementId, setAccountMovementId] = useState<string>()
  const investmentsRef = useRef<MobileFirstInvestmentsHandle>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sheet, setSheet] = useState<{ title: string; content: ReactNode } | null>(null)
  const openSheet = (title: string, content: ReactNode) => setSheet({ title, content })
  const selectMainTab = (tab: 'home' | 'investments') => {
    setMainTab(tab)
    scrollRef.current?.scrollTo?.({ top: 0, behavior: 'auto' })
  }
  const openInvestments = (destination?: InvestmentDestination) => {
    setInvestmentEntry(destination)
    setInvestmentGeneration((generation) => generation + 1)
    selectMainTab('investments')
  }
  const openAccount = (index: number, view: 'detail' | 'accounts' = 'detail') => {
    setSheet(null)
    setInsuranceEntry(null)
    setSelectedAccount(homeAccounts[index] ?? MOBILE_FIRST_ACCOUNTS[0])
    setAccountEntry((entry) => entry + 1)
    setAccountInitialView(view)
    setAccountMovementId(undefined)
    setCardEntry(null)
    setLoanEntry(null)
  }
  const openCard = (cardId: string, view: 'hub' | 'detail' | 'pin') => {
    setSheet(null)
    setInsuranceEntry(null)
    setCardEntry({ cardId, view })
  }
  const openLoan = (loanId?: string, view?: LoansInitialView) => {
    setSheet(null)
    setInsuranceEntry(null)
    setLoanEntry({ loanId, view })
  }
  const openInsurance = (policyId?: string, view?: InsuranceInitialView) => {
    setSheet(null)
    setInsuranceEntry({ policyId, view })
  }
  const operations = [
    { name: 'Bonifico', icon: assets.transfer },
    { name: 'Gestione conto', icon: assets.settings },
    { name: 'Pagamenti frequenti', icon: assets.frequent },
    { name: 'Condividi IBAN', icon: assets.share },
  ]
  const openOperation = (name: string) =>
    openSheet(
      name,
      <div className="mf-account-choices">
        <p>Seleziona un conto</p>
        {homeAccounts.map((account, index) => (
          <button type="button" key={account.number} onClick={() => openAccount(index)}>
            {account.name}
            <Icon src={assets.forth} size={16} />
          </button>
        ))}
      </div>,
    )
  const showOperations = () => {
    setSheet(null)
    setOperationsOpen(true)
  }
  const closeResult = (close: () => void) => {
    close()
    onPhoneChromeChange?.('light')
    if (searchReturnRef.current) {
      searchReturnRef.current = false
      setSearchOpen(true)
    }
  }
  const openProfile = (entry?: ProfileHubNavigation) => {
    setProfileEntry(entry)
    setProfileOpen(true)
  }
  const selectSearchResult = (entry: SearchEntry) => {
    setSearchOpen(false)
    setSheet(null)
    setSelectedAccount(null)
    setCardEntry(null)
    setLoanEntry(null)
    setInsuranceEntry(null)
    setPfmTab(null)
    setProfileOpen(false)
    searchReturnRef.current = true
    const target = entry.target
    if (target.kind === 'account') {
      const account = searchAccounts.find((record) => record.number === target.accountNumber)
      if (account) {
        setSelectedAccount({ ...account, name: accountPreferences.names[account.number] ?? account.name })
        setAccountMovementId(target.movementId)
        setAccountEntry((generation) => generation + 1)
        setAccountInitialView('detail')
      } else setSearchOpen(true)
    } else if (target.kind === 'card') {
      setCardEntry({ cardId: target.cardId, view: 'detail', movementId: target.movementId })
    } else if (target.kind === 'loan') openLoan(target.loanId, 'detail')
    else if (target.kind === 'insurance') openInsurance(target.policyId, 'detail')
    else if (target.kind === 'pfm') setPfmTab(target.tab)
    else if (target.kind === 'profile') openProfile({ area: target.area as ProfileArea, id: target.id })
    else {
      searchReturnRef.current = false
      if (target.kind === 'payment') openOperation(target.label)
      else if (target.kind === 'category') {
        setCategory(target.category)
        selectMainTab('home')
      } else {
        openInvestments(target.destination)
      }
    }
  }
  const logoutClient = () => {
    searchReturnRef.current = false
    setSearchOpen(false)
    setSearchQuery('')
    setSelectedAccount(null)
    setCardEntry(null)
    setLoanEntry(null)
    setInsuranceEntry(null)
    setPfmTab(null)
    setSheet(null)
    setOperationsOpen(false)
    setProfileOpen(false)
    setLoggedOut(true)
  }
  const navigateFromProfile = (target: string, id?: string) => {
    searchReturnRef.current = false
    setProfileOpen(false)
    setSelectedAccount(null)
    setCardEntry(null)
    setLoanEntry(null)
    setPfmTab(null)
    setInsuranceEntry(null)
    onPhoneChromeChange?.('light')
    if (target === 'cards') {
      if (id) openCard(id, 'detail')
      else {
        setCategory('Carte')
        selectMainTab('home')
      }
    } else if (target === 'loans') {
      if (id) openLoan(id, 'detail')
      else {
        setCategory('Mutui e Prestiti')
        selectMainTab('home')
      }
    } else if (target === 'accounts') {
      setCategory('Conti')
      selectMainTab('home')
    } else if (target === 'investments') openInvestments()
    else selectMainTab('home')
  }
  const overlays = (
    <>
      {operationsOpen && (
        <MobileFirstOperations
          onClose={() => setOperationsOpen(false)}
          onSelect={(label) => {
            setOperationsOpen(false)
            openOperation(label)
          }}
        />
      )}
      {sheet && (
        <BottomSheet title={sheet.title} onClose={() => setSheet(null)} closeLabel="Chiudi" className="mf-sheet">
          {sheet.content}
        </BottomSheet>
      )}
    </>
  )

  if (loggedOut && !profileOpen)
    return (
      <MobileFirstProfileLogin
        onPhoneChromeChange={onPhoneChromeChange}
        onLogin={() => {
          setLoggedOut(false)
          setProfileOpen(false)
          selectMainTab('home')
          onPhoneChromeChange?.('light')
        }}
        onForgotCode={() => openProfile({ area: 'settings', id: 'forgot-mobile-code' })}
        onToken={() => openProfile({ area: 'token' })}
        onSupport={() => openProfile({ area: 'support' })}
      />
    )

  if (searchOpen)
    return (
      <MobileFirstSearch
        initialQuery={searchQuery}
        onQueryChange={setSearchQuery}
        entries={createItalySearchIndex({
          accounts: searchAccounts,
          cards: cardsSnapshot?.cards ?? ITALY_CARDS,
          cardMovements: cardsSnapshot?.movements,
          productCounts,
        })}
        onSelect={selectSearchResult}
        onClose={() => {
          setSearchOpen(false)
          searchReturnRef.current = false
          window.requestAnimationFrame(() => searchButtonRef.current?.focus())
        }}
      />
    )

  const withProfile = (content: ReactNode) => (
    <>
      <div hidden={profileOpen} style={{ height: '100%' }}>
        {content}
      </div>
      {profileOpen && (
        <MobileFirstProfile
          initialNavigation={profileEntry}
          onLogout={logoutClient}
          onClose={() => {
            if (selectedAccount || cardEntry || loanEntry || insuranceEntry || pfmTab) {
              setProfileOpen(false)
              onPhoneChromeChange?.('light')
            } else closeResult(() => setProfileOpen(false))
          }}
          onPhoneChromeChange={onPhoneChromeChange}
          onNavigate={navigateFromProfile}
        />
      )}
    </>
  )

  if (loggedOut && profileOpen) return withProfile(null)

  if (pfmTab)
    return withProfile(
      <MobileFirstPfm
        initialTab={pfmTab}
        onClose={() => closeResult(() => setPfmTab(null))}
        onPhoneChromeChange={onPhoneChromeChange}
        onNavigate={navigateFromProfile}
        onLogout={logoutClient}
        onProfile={() => openProfile()}
        externalOverlayOpen={profileOpen}
      />,
    )

  if (selectedAccount !== null) {
    const account = selectedAccount
    return withProfile(
      <div className="mf-home">
        <MobileFirstAccount
          key={accountEntry}
          account={{
            ...account,
            balance:
              'detailBalance' in account && typeof account.detailBalance === 'number'
                ? account.detailBalance
                : account.balance,
          }}
          onClose={() => closeResult(() => setSelectedAccount(null))}
          onOperations={showOperations}
          externalOverlayOpen={profileOpen || operationsOpen || Boolean(sheet)}
          initialView={accountInitialView}
          initialMovementId={accountMovementId}
          onProfile={() => openProfile()}
        />
        {overlays}
      </div>,
    )
  }

  if (cardEntry)
    return withProfile(
      <div className="mf-home">
        <MobileFirstCards
          initialCardId={cardEntry.cardId}
          initialView={cardEntry.view}
          initialMovementId={cardEntry.movementId}
          initialSnapshot={cardsSnapshot}
          onSnapshot={setCardsSnapshot}
          onClose={() => closeResult(() => setCardEntry(null))}
          onOperations={showOperations}
          externalOverlayOpen={profileOpen || operationsOpen || Boolean(sheet)}
          onProfile={() => openProfile()}
        />
        {overlays}
      </div>,
    )
  if (loanEntry)
    return withProfile(
      <MobileFirstLoans
        initialLoanId={loanEntry.loanId}
        initialView={loanEntry.view}
        onClose={() => closeResult(() => setLoanEntry(null))}
        onProfile={() => openProfile()}
        externalOverlayOpen={profileOpen}
      />,
    )
  if (insuranceEntry)
    return withProfile(
      <MobileFirstInsurance
        initialPolicyId={insuranceEntry.policyId}
        initialView={insuranceEntry.view}
        onClose={() => closeResult(() => setInsuranceEntry(null))}
        onProfile={() => openProfile()}
        externalOverlayOpen={profileOpen}
        onContact={() => openProfile({ area: 'support' })}
      />,
    )

  return withProfile(
    <div className="mf-home" data-mobile-first-home="true" lang="it">
      <ScrollableRegion
        ref={scrollRef}
        className="mf-scroll scrollbar-hide"
        aria-label="Homepage Mobile First"
        data-mobile-first-scroll="true"
      >
        <header className="mf-header">
          <BrandToggle
            preferredProfile={profileSettings.preferredProfile}
            onClick={() =>
              openSheet('UniCredit e buddy', 'I tuoi prodotti UniCredit e le offerte buddy, in un’unica app.')
            }
          />
          <div className="mf-header-actions">
            <button type="button" aria-label="Cerca" ref={searchButtonRef} onClick={() => setSearchOpen(true)}>
              <Icon src={assets.help} />
            </button>
            <button type="button" aria-label="Bilancio" onClick={() => setPfmTab('Bilancio familiare')}>
              <Icon src={assets.analytics} />
            </button>
            <button
              type="button"
              aria-label={amountsHidden ? 'Mostra importi' : 'Nascondi importi'}
              aria-pressed={amountsHidden}
              onClick={toggleAmountsHidden}
            >
              <Icon src={amountsHidden ? assets.hide : assets.show} />
            </button>
            <button type="button" className="mf-avatar" aria-label="Profilo" onClick={() => openProfile()}>
              <img src={assets.avatar} alt="" width={32} height={32} />
              <img src={assets.notification} alt="" width={8} height={8} className="mf-notification" />
            </button>
          </div>
        </header>
        <div className="mf-main-tabs" role="tablist" aria-label="Navigazione principale">
          <button type="button" role="tab" aria-selected={mainTab === 'home'} onClick={() => selectMainTab('home')}>
            Home
            {mainTab === 'home' && <img src={assets.selected} alt="" width={4} height={4} />}
          </button>
          <button type="button" role="tab" aria-selected={mainTab === 'investments'} onClick={() => openInvestments()}>
            Investimenti
            {mainTab === 'investments' && <img src={assets.selected} alt="" width={4} height={4} />}
          </button>
        </div>
        {mainTab === 'home' ? (
          <>
            <section className="mf-widget-section" aria-label="Riepilogo">
              <ScrollableRegion
                ref={mountWidgetRail}
                className="mf-widget-rail scrollbar-hide"
                {...widgetDrag.dragHandlers}
                onPointerDown={(event) => {
                  if (event.pointerType === 'mouse') widgetDrag.dragHandlers.onPointerDown(event)
                }}
                data-dragging={widgetDrag.isDragging || undefined}
                aria-label="Riepiloghi"
                onScroll={(event) => {
                  const rail = event.currentTarget
                  if (rail.clientWidth !== widgetGeometry.current.width) return
                  const range = rail.scrollWidth - rail.clientWidth
                  const slide = rail.querySelector<HTMLElement>('.mf-widget')
                  const index =
                    range > 0
                      ? Math.round((rail.scrollLeft * 2) / range)
                      : rail.clientWidth === 0 && slide?.offsetWidth
                        ? Math.round(rail.scrollLeft / (slide.offsetWidth + 12))
                        : widgetGeometry.current.index
                  widgetGeometry.current.index = Math.max(0, Math.min(2, index))
                  setWidget(widgetGeometry.current.index)
                }}
              >
                {[0, 1, 2].map((slide) => (
                  <article
                    key={slide}
                    className="mf-widget"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Riepilogo ${slide + 1}`}
                  >
                    <div>
                      <h3>
                        {slide === 0
                          ? 'Quanto hai speso questo mese?'
                          : slide === 1
                            ? 'Ecco il valore del tuo patrimonio netto:'
                            : 'Il tuo budget di spesa mensile'}
                      </h3>
                      <Amount
                        value={fromCents(
                          slide === 0
                            ? financialSummary.spendCents
                            : slide === 1
                              ? wealthSummary.netWorthCents
                              : budget.targetCents,
                        )}
                        hidden={amountsHidden}
                        small
                      />
                    </div>
                    <button
                      type="button"
                      tabIndex={0}
                      className="mf-text-link mf-link-dark"
                      onClick={() =>
                        setPfmTab(slide === 0 ? 'Bilancio familiare' : slide === 1 ? 'Patrimonio' : 'Budget')
                      }
                    >
                      {slide === 0 ? 'VAI AL BILANCIO' : slide === 1 ? 'VAI AL PATRIMONIO' : 'VAI AL BUDGET'}
                      <Icon src={assets.forwardSmall} size={16} />
                    </button>
                  </article>
                ))}
              </ScrollableRegion>
              <CarouselControls index={widget} count={3} label="Riepilogo" onChange={goToWidget} />
            </section>
            <section className="mf-section mf-your-products" aria-labelledby="mf-your-products-title">
              <h2 id="mf-your-products-title">I tuoi prodotti</h2>
              <div
                ref={mountCategoryRail}
                {...categoryDrag.dragHandlers}
                className={`mf-category-tabs${categoryDrag.isDragging ? ' mf-category-dragging' : ''}`}
                role="tablist"
                tabIndex={-1}
                aria-label="Categorie prodotti"
                onKeyDown={(event) => {
                  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
                  event.preventDefault()
                  const current = MOBILE_FIRST_PRODUCT_CATEGORIES.indexOf(
                    category as (typeof MOBILE_FIRST_PRODUCT_CATEGORIES)[number],
                  )
                  const next =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? 3
                        : (current + (event.key === 'ArrowRight' ? 1 : -1) + 4) % 4
                  setCategory(MOBILE_FIRST_PRODUCT_CATEGORIES[next]!)
                  const tabs = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                  tabs[next]?.focus({ preventScroll: true })
                }}
              >
                {MOBILE_FIRST_PRODUCT_CATEGORIES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    role="tab"
                    aria-selected={category === name}
                    tabIndex={category === name ? 0 : -1}
                    onClick={() => setCategory(name)}
                  >
                    <span>{name}</span>
                    <img src={assets.selected} alt="" width={4} height={4} />
                  </button>
                ))}
              </div>
              <div role="tabpanel" aria-label={category} className="mf-account-list">
                {category === 'Conti' ? (
                  homeAccounts.map((account, index) => (
                    <article className="mf-account-card" key={account.number}>
                      <button
                        className="mf-account-content"
                        type="button"
                        aria-label={`Apri conto ${account.name}`}
                        onClick={() => openAccount(index)}
                      >
                        <span className="mf-account-heading">
                          <span>
                            <strong>{account.name}</strong>
                            <span>{`${account.number} - UniCredit`}</span>
                          </span>
                          <span className="mf-account-chevron" aria-hidden="true">
                            <img src={assets.accountChevron} alt="" width={12} height={22} />
                          </span>
                        </span>
                        <div>
                          <Amount value={account.balance} hidden={amountsHidden} />
                          <p>Saldo disponibile al {financialDate}</p>
                        </div>
                      </button>
                      <div className="mf-quick-actions">
                        {operations.map((operation) => (
                          <button type="button" key={operation.name} onClick={() => openOperation(operation.name)}>
                            <span className="mf-quick-circle">
                              <Icon src={operation.icon} />
                            </span>
                            <span>{operation.name}</span>
                          </button>
                        ))}
                      </div>
                    </article>
                  ))
                ) : (
                  <MobileFirstCategoryPanel
                    category={category}
                    onOpen={openSheet}
                    onOpenCard={openCard}
                    onOpenLoans={openLoan}
                    loansPanel={<MobileFirstLoansPanel onOpen={openLoan} />}
                    insurancePanel={<MobileFirstInsurancePanel onOpen={openInsurance} />}
                    homepageCards={selectHomepageCards(
                      (cardsSnapshot?.cards ?? ITALY_CARDS).map((card) => getCardLedgerRecord(card, financial)),
                      {
                        debit: productCounts.debitCards,
                        credit: productCounts.creditCards,
                      },
                    )}
                  />
                )}
              </div>
              {category === 'Conti' && (
                <button
                  className="mf-text-link mf-all-accounts"
                  type="button"
                  onClick={() => openAccount(0, 'accounts')}
                >
                  TUTTI I CONTI
                  <Icon src={assets.forwardTeal} size={16} />
                </button>
              )}
            </section>
            {category === 'Conti' && <CommercialCarousel onOpen={openSheet} />}
            <section className="mf-section" aria-labelledby="mf-offers-title">
              <h2 id="mf-offers-title">Offerte per te</h2>
              <div className="mf-category-tabs" role="tablist" aria-label="Categorie offerte">
                {['Casa', 'Partner'].map((name) => (
                  <button
                    type="button"
                    key={name}
                    role="tab"
                    aria-selected={offerCategory === name}
                    onClick={() => setOfferCategory(name)}
                  >
                    {name}
                    {name === offerCategory && <img src={assets.selected} alt="" width={4} height={4} />}
                  </button>
                ))}
              </div>
              <button
                className="mf-offer-card"
                type="button"
                onClick={() =>
                  openSheet(
                    'Servizi immobiliari',
                    'Scopri i numerosi servizi offerti per te dai nostri partner a prezzi dedicati.',
                  )
                }
              >
                <span className="mf-offer-copy">
                  <strong>{offerCategory === 'Casa' ? 'Servizi immobiliari' : 'Offerte dei nostri partner'}</strong>
                  <span>Scopri i numerosi servizi offerti per te dai nostri partner a prezzi dedicati.</span>
                  <LogosBuddyHorizontal className="relative h-[26px] w-[57px]" />
                </span>
                <img src={assets.partner} alt="" className="mf-offer-image" />
              </button>
            </section>
            <section className="mf-section" aria-labelledby="mf-highlights-title">
              <h2 id="mf-highlights-title">In evidenza</h2>
              <button
                className="mf-wallet"
                type="button"
                onClick={() =>
                  openSheet(
                    wallet === 0 ? 'Google Pay' : 'Samsung Pay',
                    'Fai acquisti nei negozi, nella app e sul web, in tutta sicurezza.',
                  )
                }
              >
                {wallet === 0 ? (
                  <img src={assets.googlePay} alt="Google Pay" width={52} height={24} />
                ) : (
                  <SamsungPayLogo />
                )}
                <span>
                  <strong>Attiva {wallet === 0 ? 'Google Pay' : 'Samsung Pay'}.</strong> Fai acquisti nei negozi, nella
                  app e sul web, in tutta sicurezza.
                </span>
              </button>
              <CarouselControls index={wallet} count={2} label="In evidenza" onChange={setWallet} />
            </section>
          </>
        ) : (
          <MobileFirstInvestments
            key={investmentGeneration}
            initialDestination={investmentEntry}
            ref={investmentsRef}
            onOpen={openSheet}
            onBookAppointment={() => openProfile({ area: 'appointments' })}
            onOpenCategory={(nextCategory) => {
              setCategory(nextCategory)
              selectMainTab('home')
            }}
          />
        )}
      </ScrollableRegion>
      <div
        className={`mf-floating-action${mainTab === 'investments' ? ' mf-floating-investi' : ''}`}
        data-mobile-first-floating="true"
      >
        <button
          type="button"
          onClick={mainTab === 'home' ? showOperations : () => investmentsRef.current?.openInvestMenu()}
        >
          {mainTab === 'home' ? 'Operazioni' : 'Investi'}
        </button>
      </div>
      {overlays}
    </div>,
  )
}
