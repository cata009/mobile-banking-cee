import { type ReactNode } from 'react'
import Card from '@/app/components/cards/Card'
import NavigationRow from '@/app/components/NavigationRow'
import PageHeader from '@/app/components/PageHeader'
import PrimaryButton from '@/app/components/PrimaryButton'
import SectionHeadingDivider from '@/app/components/SectionHeadingDivider'
import TextField from '@/app/components/TextField'
import { AppIcon, type IconName } from '@/app/components/icons'
import { PreviewSafeTop } from '@/app/screens/flow-library/components/MiniPhone'
import { FLOW_DEMO } from '@/app/screens/flow-library/flows/demoData'
import type { CardPinScreenKind } from '@/app/screens/flow-library/flows/types'
import { noop, Screen, Overlay, BottomCta, QuickAction, SignStep, SuccessStep } from '@/flows/shared/previewPrimitives'
function PinBoxes({ digits, visible }: { digits: readonly string[]; visible: boolean }) {
  return (
    <div className="flex justify-center gap-[14px]">
      {digits.map((digit, index) => (
        <div
          key={`${digit}-${index}`}
          className="grid size-[48px] place-items-center rounded-[6px] border border-[var(--uc-border)] uc-type-n3 text-[var(--uc-text)]"
        >
          {visible ? digit : '•'}
        </div>
      ))}
    </div>
  )
}

function cardVariant(cardKind: 'credit' | 'debit') {
  return cardKind === 'credit' ? 'mc-credit-partner-standard' : 'mc-debit-standard'
}

function SmallCardArt({ cardKind }: { cardKind: 'credit' | 'debit' }) {
  return <Card size="large" variant={cardVariant(cardKind)} style={{ width: 52, height: 33, borderRadius: 4 }} />
}

function demoCard(cardKind: 'credit' | 'debit') {
  return cardKind === 'credit' ? FLOW_DEMO.creditCard : FLOW_DEMO.debitCard
}
function CardsPreview({ cardKind }: { cardKind: 'credit' | 'debit' }) {
  const card = demoCard(cardKind)
  const { cardTransactions } = FLOW_DEMO
  const actions: Array<{ icon: IconName; label: string }> = [
    { icon: 'account-details', label: 'Card\nDetails' },
    { icon: 'account-options', label: 'Options' },
    { icon: 'block-card', label: 'Block\nCard' },
    { icon: 'view-pin', label: 'View\nPIN' },
  ]
  return (
    <Screen>
      <PageHeader title="Cards" onBack={noop} includeSafeArea variant="gray" />
      <div className="bg-[var(--uc-app-bg)] pb-[16px]">
        <div className="px-[24px]">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">{FLOW_DEMO.cardholder}</p>
          <p className="mt-[3px] uc-type-n2-strong text-[var(--uc-text)]">{card.pan}</p>
        </div>
        <div className="mt-[16px] flex gap-[24px] overflow-hidden pl-[24px]">
          <div className="shrink-0 overflow-hidden rounded-[6px] shadow-[0_11px_11px_rgb(var(--uc-shadow-rgb)_/_0.20)]">
            <Card
              ariaLabel={`${cardKind} card`}
              size="large"
              variant={cardVariant(cardKind)}
              style={{ width: 219, height: 138, borderRadius: 6 }}
            />
          </div>
          <div className="mt-[12px] shrink-0 overflow-hidden rounded-[6px] opacity-60 shadow-[0_9px_9px_rgb(var(--uc-shadow-rgb)_/_0.16)]">
            <Card
              size="large"
              variant={cardVariant(cardKind === 'credit' ? 'debit' : 'credit')}
              style={{ width: 181, height: 114, borderRadius: 6 }}
            />
          </div>
        </div>
        <div className="px-[24px] pt-[22px]">
          <p className="uc-type-n5-strong text-[var(--uc-text-muted)]">Free To Spend</p>
          <p className="mt-[4px] uc-type-n1 text-[var(--uc-text)]">
            {card.freeToSpend} <span className="uc-type-n3">{card.currency}</span>
          </p>
          <p className="mx-auto mt-[16px] w-fit uc-type-n5-strong uppercase tracking-[0.06em] text-[var(--uc-action)]">
            Show Card Details
          </p>
        </div>
        <div className="mt-[4px] flex items-start justify-between px-[16px]">
          {actions.map((action) => (
            <QuickAction key={action.label} icon={action.icon} label={action.label} />
          ))}
        </div>
      </div>
      <div className="flex-1 bg-[var(--uc-surface)] px-[16px] pt-[16px]">
        <SectionHeadingDivider title={cardTransactions.period} />
        {cardTransactions.rows.map((row) => (
          <div
            key={row.title}
            className="flex min-h-[56px] items-center justify-between border-b border-[var(--uc-border)]"
          >
            <div className="w-[42px] text-center uc-type-n5-strong text-[var(--uc-text)]">
              {row.day}
              <span className="block uc-type-p2 text-[var(--uc-text-muted)]">{row.month}</span>
            </div>
            <div className="flex-1 px-[12px] uc-type-n5 text-[var(--uc-text)]">{row.title}</div>
            <div className="uc-type-n5-strong text-[var(--uc-text)]">{row.amount}</div>
          </div>
        ))}
      </div>
    </Screen>
  )
}

interface CardOptionRow {
  id: string
  icon: IconName
  title: string
  description: string
}

const CARD_PROGRAM_ROWS: readonly CardOptionRow[] = [
  { id: 'apple-pay', icon: 'card-options-apple-pay', title: 'APPLE PAY', description: 'Active' },
  {
    id: 'mastercard',
    icon: 'card-options-mastercard',
    title: 'MASTERCARD PRICELESS',
    description: 'Discover all the advantages of the program',
  },
  {
    id: 'registrations',
    icon: 'card-options-registrations',
    title: 'CARD REGISTRATIONS',
    description: 'Subscriptions and saved card',
  },
]

const CARD_SETTINGS_COMMON: readonly CardOptionRow[] = [
  { id: 'view-pin', icon: 'view-pin', title: 'VIEW PIN', description: 'View or change your card’s PIN' },
  { id: 'card-limits', icon: 'card-options-limits', title: 'CARD LIMITS', description: 'Manage your card limits' },
  {
    id: 'push',
    icon: 'account-option-push-notifications',
    title: 'PUSH NOTIFICATIONS',
    description: 'Manage app notifications',
  },
]

const CARD_SETTINGS_CREDIT: readonly CardOptionRow[] = [
  {
    id: 'statement',
    icon: 'account-option-statement',
    title: 'CREDIT CARD STATEMENT',
    description: 'View your statement',
  },
  { id: 'change-name', icon: 'card-options-change-name', title: 'CHANGE CARD NAME', description: 'Name your card' },
]

const CARD_SETTINGS_DEBIT: readonly CardOptionRow[] = [
  {
    id: 'delivery',
    icon: 'card-options-delivery-address',
    title: 'CARD DELIVERY ADDRESS',
    description: 'Select the address to deliver the card',
  },
  {
    id: 'reissue',
    icon: 'card-options-reissue',
    title: 'REISSUE CARD',
    description: 'Request the reissue of this card',
  },
]

function CardOptionsPreview({ cardKind, overlay }: { cardKind: 'credit' | 'debit'; overlay?: 'faceid' | 'popup' }) {
  const settings = [...CARD_SETTINGS_COMMON, ...(cardKind === 'credit' ? CARD_SETTINGS_CREDIT : CARD_SETTINGS_DEBIT)]
  return (
    <Screen tone="app">
      <PageHeader title="Card options" onBack={noop} includeSafeArea showHelp={false} variant="gray" />
      <div className="px-[8px]">
        {CARD_PROGRAM_ROWS.map((row) => (
          <NavigationRow
            key={row.id}
            title={row.title}
            description={row.description}
            leadingIconName={row.icon}
            trailingAccessory="chevron"
            rowHeight={80}
          />
        ))}
        <SectionHeadingDivider title="General settings" className="mt-[8px] px-[16px]" />
        {settings.map((row) => (
          <NavigationRow
            key={row.id}
            title={row.title}
            description={row.description}
            leadingIconName={row.icon}
            trailingAccessory="chevron"
            rowHeight={80}
          />
        ))}
      </div>
      {overlay === 'faceid' ? (
        <Overlay>
          <div className="w-[150px] rounded-[12px] bg-[var(--uc-surface)] p-[16px] text-center shadow-[0_16px_32px_rgb(var(--uc-shadow-rgb)_/_0.20)]">
            <div className="mx-auto grid size-[62px] place-items-center rounded-full border border-[var(--uc-border)]">
              <AppIcon name="prime-check" size={40} color="var(--uc-text)" />
            </div>
            <p className="mt-[12px] uc-type-n4-strong text-[var(--uc-text)]">Face ID</p>
          </div>
        </Overlay>
      ) : null}
      {overlay === 'popup' ? (
        <Overlay>
          <div className="mx-[24px] rounded-[12px] bg-[var(--uc-surface)] px-[20px] pb-[16px] pt-[18px] text-center shadow-[0_16px_32px_rgb(var(--uc-shadow-rgb)_/_0.20)]">
            <p className="uc-type-h2 text-[var(--uc-text)]">Set up your card PIN</p>
            <p className="mt-[8px] uc-type-n5 text-[var(--uc-text-muted)]">
              Currently you don't have a PIN set for this card, you need to create a new one.
            </p>
            <p className="mt-[16px] border-t border-[var(--uc-border)] pt-[10px] uc-type-n4-strong text-[var(--uc-action)]">
              Continue
            </p>
          </div>
        </Overlay>
      ) : null}
    </Screen>
  )
}

function PinRevealPreview({ cardKind, visible }: { cardKind: 'credit' | 'debit'; visible: boolean }) {
  const card = demoCard(cardKind)
  return (
    <Screen>
      <PreviewSafeTop />
      <div className="flex items-center justify-between px-[24px] pt-[8px]">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">Your PIN number</h1>
        <AppIcon name="close-x" size={32} color="var(--uc-text)" />
      </div>
      <div className="flex-1 px-[24px] pt-[16px]">
        <p className="max-w-[318px] uc-type-n5 text-[var(--uc-text)]">
          Your PIN is personal, never show it to anyone. Be careful if someone is watching you and tap the button to see
          the numbers.
        </p>
        <div className="mt-[28px] flex items-center gap-[12px]">
          <SmallCardArt cardKind={cardKind} />
          <div>
            <p className="uc-type-n5-strong text-[var(--uc-text)]">{card.label}</p>
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">{card.pan}</p>
          </div>
        </div>
        <div className="mt-[36px]">
          <PinBoxes digits={card.pin} visible={visible} />
        </div>
        <p className="mx-auto mt-[28px] w-fit uc-type-n5-strong uppercase text-[var(--uc-action)]">Change your PIN</p>
      </div>
      {visible ? (
        <p className="pb-[8px] text-center uc-type-p2 text-[var(--uc-text-muted)]">
          This page will close automatically in 7 seconds
        </p>
      ) : null}
      <BottomCta>
        <PrimaryButton onClick={noop}>{visible ? 'I have memorized it' : 'Show PIN'}</PrimaryButton>
      </BottomCta>
    </Screen>
  )
}

function SetPinPreview({ cardKind, filled }: { cardKind: 'credit' | 'debit'; filled: boolean }) {
  const card = demoCard(cardKind)
  const value = filled ? FLOW_DEMO.newPin : ''
  return (
    <Screen>
      <PageHeader title="Set your PIN" onBack={noop} includeSafeArea showHelp={false} />
      <div className="flex-1 px-[24px]">
        <p className="max-w-[322px] uc-type-n5 text-[var(--uc-text)]">
          Make sure you set a safe PIN for your card. Avoid using a previous PIN, and avoid consecutive numbers (1234)
          or identical numbers (2222).
        </p>
        <div className="mt-[28px] flex items-center gap-[12px]">
          <SmallCardArt cardKind={cardKind} />
          <div>
            <p className="uc-type-n5-strong text-[var(--uc-text)]">{card.label}</p>
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">{card.pan}</p>
          </div>
        </div>
        <div className="mt-[28px] flex flex-col gap-[24px]">
          <TextField
            label="Choose card PIN"
            value={value}
            onChange={noop}
            helperText="Numerical, maximum 4 characters"
            visualState={filled ? 'filled' : 'on-focus'}
          />
          <TextField
            label="Confirm card PIN"
            value={value}
            onChange={noop}
            helperText="Numerical, maximum 4 characters"
            visualState={filled ? 'filled' : 'empty'}
          />
        </div>
      </div>
      <BottomCta>
        <PrimaryButton onClick={noop} disabled={!filled}>
          Continue
        </PrimaryButton>
      </BottomCta>
    </Screen>
  )
}

export function renderCardPinPreview(kind: CardPinScreenKind): ReactNode {
  switch (kind) {
    case 'cards-credit':
      return <CardsPreview cardKind="credit" />
    case 'cards-debit':
      return <CardsPreview cardKind="debit" />
    case 'card-options-credit':
      return <CardOptionsPreview cardKind="credit" />
    case 'card-options-debit':
      return <CardOptionsPreview cardKind="debit" />
    case 'pin-faceid-credit':
      return <CardOptionsPreview cardKind="credit" overlay="faceid" />
    case 'pin-faceid-debit':
      return <CardOptionsPreview cardKind="debit" overlay="faceid" />
    case 'pin-reveal-credit-hidden':
      return <PinRevealPreview cardKind="credit" visible={false} />
    case 'pin-reveal-credit-visible':
      return <PinRevealPreview cardKind="credit" visible />
    case 'pin-reveal-debit-hidden':
      return <PinRevealPreview cardKind="debit" visible={false} />
    case 'pin-reveal-debit-visible':
      return <PinRevealPreview cardKind="debit" visible />
    case 'set-pin-credit-empty':
      return <SetPinPreview cardKind="credit" filled={false} />
    case 'set-pin-credit-filled':
      return <SetPinPreview cardKind="credit" filled />
    case 'set-pin-debit-empty':
      return <SetPinPreview cardKind="debit" filled={false} />
    case 'set-pin-debit-filled':
      return <SetPinPreview cardKind="debit" filled />
    case 'pin-sign':
      return <SignStep />
    case 'pin-success':
      return (
        <SuccessStep
          title="Your new PIN was successfully saved"
          body="Remember the PIN you set — you'll use it for future transactions with your card."
        />
      )
    case 'pin-not-eligible-credit':
      return <CardOptionsPreview cardKind="credit" overlay="popup" />
    case 'pin-not-eligible-debit':
      return <CardOptionsPreview cardKind="debit" overlay="popup" />
    default:
      return null
  }
}
