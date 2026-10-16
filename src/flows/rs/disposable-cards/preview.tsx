import { useCallback, useEffect, useMemo, useState } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { AppIcon, type IconName } from '@/app/components/icons'
import FaceIdAnimation from '@/app/components/FaceIdAnimation'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import CardDetailScreen from '@/app/screens/cards/CardDetailScreen'
import CardSensitiveDetailsScreen from '@/app/screens/cards/CardSensitiveDetailsScreen'
import { useFlowNav } from '@/app/screens/flow-library/components/prototypeNav'
import type { RsDisposableCardsScreenKind } from '@/app/screens/flow-library/flows/types'
import { DemoProvider } from '@/app/state/demoStore'
import { useProducts } from '@/hooks/useProducts'
import type { CreditCard, DebitCard, Product } from '@/data/products'

const CARDS_SCREEN: RsDisposableCardsScreenKind = 'rs-disposable-cards-screen'
const DETAILS_SHEET: RsDisposableCardsScreenKind = 'rs-disposable-cards-details-sheet'
const FACE_ID_NORMAL: RsDisposableCardsScreenKind = 'rs-disposable-cards-face-id-normal'
const FACE_ID_DISPOSABLE: RsDisposableCardsScreenKind = 'rs-disposable-cards-face-id-disposable'
const NORMAL_DETAILS: RsDisposableCardsScreenKind = 'rs-disposable-cards-normal-details'
const DISPOSABLE_DETAILS: RsDisposableCardsScreenKind = 'rs-disposable-cards-disposable-details'

type CardProduct = DebitCard | CreditCard

function isCardProduct(product: Product): product is CardProduct {
  return product.type === 'debit_card' || product.type === 'credit_card'
}

function DetailChoiceAction({
  title,
  accessibleName,
  description,
  icon,
  onSelect,
}: {
  title: string
  accessibleName: string
  description: string
  icon: IconName
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-label={accessibleName}
      onClick={onSelect}
      className="grid h-[80px] w-full grid-cols-[32px_1fr_32px] items-center gap-[16px] text-left transition"
    >
      <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center">
        <AppIcon name={icon} size={24} color="var(--uc-icon)" />
      </span>
      <span className="min-w-0">
        <span className="uc-type-h2 block text-[var(--uc-text)]">{title}</span>
        <span className="uc-type-n5 mt-[2px] block text-[var(--uc-text)]">{description}</span>
      </span>
      <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center">
        <AppIcon name="chevron-link" color="var(--uc-icon)" />
      </span>
    </button>
  )
}

function CardDetailsChoiceSheet({
  onClose,
  onNormalDetails,
  onDisposableDetails,
}: {
  onClose: () => void
  onNormalDetails: () => void
  onDisposableDetails: () => void
}) {
  return (
    <BottomSheet title="Choose a card" onClose={onClose}>
      <div className="flex flex-col">
        <DetailChoiceAction
          title="Selected card"
          accessibleName="View selected card details"
          description="View the full card number, security code and expiry date."
          icon="credit-card"
          onSelect={onNormalDetails}
        />
        <DetailChoiceAction
          title="Disposable card"
          accessibleName="View disposable card details"
          description="View the disposable card number, security code and expiry date."
          icon="wallet-cards"
          onSelect={onDisposableDetails}
        />
      </div>
    </BottomSheet>
  )
}

function makeDisposableCard(card: CardProduct): CardProduct {
  return {
    ...card,
    id: `${card.id}-disposable-preview`,
    name: 'Disposable Card',
    cardNumber: '5392 1076 4411 0042',
    accountNumber: '5392 1076 4411 0042',
    expiryDate: '12/28',
    securityCode: '482',
  }
}

function SerbiaCardsPrototype({ screen }: { screen: RsDisposableCardsScreenKind }) {
  const nav = useFlowNav()
  const { categories } = useProducts()
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [localScreen, setLocalScreen] = useState<RsDisposableCardsScreenKind | null>(null)

  useEffect(() => {
    setLocalScreen(null)
  }, [screen])

  const displayScreen = nav.active ? screen : (localScreen ?? screen)
  const cards = useMemo(() => categories.flatMap((category) => category.products).filter(isCardProduct), [categories])
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0]
  const disposableCard = useMemo(() => (selectedCard ? makeDisposableCard(selectedCard) : undefined), [selectedCard])

  const rememberCard = useCallback((card: Product) => setSelectedCardId(card.id), [])
  const openDetailsChoice = useCallback(
    (card: Product) => {
      setSelectedCardId(card.id)
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
    if (nav.active) nav.go(CARDS_SCREEN)
    else setLocalScreen(CARDS_SCREEN)
  }
  const chooseNormalDetails = () => {
    if (nav.active) nav.primary()
    else setLocalScreen(NORMAL_DETAILS)
  }
  const chooseDisposableDetails = () => {
    if (nav.active) nav.secondary()
    else setLocalScreen(DISPOSABLE_DETAILS)
  }

  if (displayScreen === FACE_ID_NORMAL || displayScreen === FACE_ID_DISPOSABLE) {
    const completeFaceId = () => {
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
    return <CardSensitiveDetailsScreen card={selectedCard} onBack={returnToCards} />
  }

  if (displayScreen === DISPOSABLE_DETAILS && disposableCard) {
    return <CardSensitiveDetailsScreen card={disposableCard} title="Disposable card details" onBack={returnToCards} />
  }

  return (
    <div className="relative h-full w-full">
      <CardDetailScreen
        selectedCardId={selectedCardId}
        onBack={goBack}
        onActiveCardChange={rememberCard}
        onShowCardDetailsRequest={displayScreen === CARDS_SCREEN ? openDetailsChoice : undefined}
      />
      {displayScreen === DETAILS_SHEET ? (
        <CardDetailsChoiceSheet
          onClose={returnToCards}
          onNormalDetails={chooseNormalDetails}
          onDisposableDetails={chooseDisposableDetails}
        />
      ) : null}
    </div>
  )
}

function SerbiaBaselineCardsPreview({ screen }: { screen: RsDisposableCardsScreenKind }) {
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
        <SerbiaCardsPrototype screen={screen} />
      </LanguageProvider>
    </DemoProvider>
  )
}

export function renderRsDisposableCardsPreview(screen: RsDisposableCardsScreenKind) {
  return <SerbiaBaselineCardsPreview screen={screen} />
}
