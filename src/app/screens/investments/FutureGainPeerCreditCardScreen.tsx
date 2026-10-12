import { useState } from 'react'
import { AppIcon } from '@/app/components/icons'
import { BottomSheet } from '@/app/components/BottomSheet'
import PageHeader from '@/app/components/PageHeader'
import PrimaryButton from '@/app/components/PrimaryButton'
import type { FutureGainPeerProduct } from '@/features/investments/future-gain/peerInsights'
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader'
import flexiaMastercardArt from '@/assets/investments/future-gain-peer-insights/flexia-mastercard.png'
import mastercardPlatinumArt from '@/assets/investments/future-gain-peer-insights/mastercard-platinum.png'

type CardType = 'flexia' | 'platinum'

const CREDIT_CARD_DISCLOSURES = [
  {
    title: 'Credit card features',
    content:
      'Flexia Mastercard can be used for everyday purchases, online payments and installment purchases. The available features depend on the selected card and the Bank’s current terms.',
  },
  {
    title: 'Terms & conditions & collateral',
    content:
      'Eligibility, fees, interest and other terms are confirmed by UniCredit Bank in the offer and final card agreement.',
  },
  {
    title: 'Representative example for purchases in installments',
    content:
      'The representative example for installment purchases depends on the purchase amount, selected installment plan, fees and the terms applicable when the transaction is made.',
  },
  {
    title: 'Representative example for revolving credit usage',
    content:
      'The cost of revolving credit depends on the amount used, repayment and the interest rate in the final agreement.',
  },
]

const BENEFITS = [
  {
    title: 'Looking for a simple way to pay in installments?',
    description: 'Split purchases into interest-free installments, just like paying by cheque.',
  },
  {
    title: 'Want to shop online with more flexibility?',
    description: 'Make secure online purchases and pay in installments.',
  },
  {
    title: 'Need a card for everyday spending?',
    description: 'Use Flexia Mastercard for daily purchases wherever cards are accepted.',
  },
  {
    title: 'Need quick access to cash?',
    description: 'Get immediate funds through a solution that is more flexible and convenient than a cash loan.',
  },
]

function HomeIndicator() {
  return (
    <div aria-hidden="true" className="flex h-[34px] shrink-0 items-end justify-center bg-[var(--uc-surface)] pb-[8px]">
      <span className="h-[5px] w-[134px] rounded-full bg-[var(--uc-text)]" />
    </div>
  )
}

export default function FutureGainPeerCreditCardScreen({
  product,
  onBack,
}: {
  product: FutureGainPeerProduct
  onBack: () => void
}) {
  const [selectedCard, setSelectedCard] = useState<CardType>('flexia')
  const [activeSheet, setActiveSheet] = useState<{ title: string; content: string } | null>(null)
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64)
  const selectedCardTitle = selectedCard === 'flexia' ? 'Flexia Mastercard' : 'Mastercard Platinum'

  const cards: readonly {
    id: CardType
    label: string
    accessibleLabel: string
    artwork: string
    imageLabel: string
  }[] = [
    {
      id: 'flexia',
      label: 'Flexia Mastercard® kreditna kartica',
      accessibleLabel: 'Flexia Mastercard credit card',
      artwork: flexiaMastercardArt,
      imageLabel: 'Flexia Mastercard card art',
    },
    {
      id: 'platinum',
      label: 'Mastercard® Platinum',
      accessibleLabel: 'Mastercard Platinum',
      artwork: mastercardPlatinumArt,
      imageLabel: 'Mastercard Platinum card art',
    },
  ]

  return (
    <div
      role="region"
      aria-label={`${product.title} simulator`}
      data-future-gain-peer-simulator="credit-card"
      className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]"
    >
      <div className="shrink-0">
        <PageHeader
          title="Credit Card"
          onBack={onBack}
          onHelpClick={() =>
            setActiveSheet({
              title: 'About credit cards',
              content: 'Choose a card type to review its features and ask UniCredit Bank for an offer.',
            })
          }
          includeSafeArea
          compact
          renderLargeTitle={false}
          collapsedTitleProgress={headerProgress}
          hideCollapsedTitleWhenHidden
        />
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto pb-[16px] scrollbar-hide" onScroll={handleScroll}>
        <h1 className="uc-type-h1 px-[24px] pt-[8px] text-[var(--uc-text)]">Credit Card</h1>
        <p className="px-[24px] pt-[16px] uc-type-p2 text-[var(--uc-text)]">Choose your type of Credit Card.</p>

        <div
          className="mt-[24px] grid grid-cols-2 gap-[16px] px-[24px]"
          role="group"
          aria-label="Choose your type of Credit Card"
        >
          {cards.map((card) => {
            const selected = selectedCard === card.id
            return (
              <button
                key={card.id}
                type="button"
                aria-label={card.accessibleLabel}
                aria-pressed={selected}
                onClick={() => setSelectedCard(card.id)}
                className={`flex min-w-0 flex-col items-start gap-[8px] rounded-[4px] bg-[var(--uc-surface)] p-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] ${
                  selected ? 'border-2 border-[var(--uc-action-strong)]' : 'border border-[var(--uc-border-muted)]'
                }`}
              >
                <img src={card.artwork} alt={card.imageLabel} width="81" height="51" draggable={false} />
                <span className="uc-type-n5-strong leading-[18px] text-[var(--uc-action-strong)]">{card.label}</span>
                <span className="uc-type-p2 leading-[16px] text-[var(--uc-text)]">Lorem ipsum dolor sit amet</span>
              </button>
            )
          })}
        </div>

        <section className="px-[24px] pt-[24px]" aria-labelledby="credit-card-benefit-title">
          <h2 id="credit-card-benefit-title" className="uc-type-h2 text-[var(--uc-text)]">
            Why should {selectedCardTitle} be your first choice?
          </h2>
          <ul className="mt-[16px] list-disc space-y-[16px] pl-[24px]">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="pl-[2px]">
                <p className="uc-type-n5-strong text-[var(--uc-text)]">{benefit.title}</p>
                <p className="uc-type-p2 text-[var(--uc-text-muted)]">
                  {benefit.description.replace('Flexia Mastercard', selectedCardTitle)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-[24px] border-t border-[var(--uc-border-muted)]">
          {CREDIT_CARD_DISCLOSURES.map((disclosure, index) => (
            <section
              key={disclosure.title}
              className={`border-b border-[var(--uc-border-muted)] ${index > 1 ? 'bg-[var(--uc-surface-muted)]' : ''}`}
            >
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => setActiveSheet(disclosure)}
                className="flex min-h-[75px] w-full items-center justify-between gap-[12px] px-[24px] py-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)]"
              >
                <span className="uc-type-n5-strong text-[var(--uc-text)]">{disclosure.title}</span>
                <AppIcon name="chevron-link" size={32} color="var(--uc-text)" />
              </button>
            </section>
          ))}
        </div>

        <p className="px-[24px] py-[16px] text-center uc-type-p2 text-[var(--uc-text-muted)]">
          Lorem ipsum dolor sit amet - disclaimer
        </p>
      </main>

      <footer className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[8px] pt-[8px]">
        <PrimaryButton
          onClick={() =>
            setActiveSheet({
              title: 'Call us for offer',
              content: 'A UniCredit Bank advisor can help you choose a credit card. No call is started in this demo.',
            })
          }
        >
          Call us for offer
        </PrimaryButton>
        <HomeIndicator />
      </footer>

      {activeSheet ? (
        <BottomSheet
          title={activeSheet.title}
          onClose={() => setActiveSheet(null)}
          closeLabel={`Close ${activeSheet.title.toLowerCase()}`}
          animated
          className="p-[24px]"
          footer={(requestClose) => (
            <button
              type="button"
              onClick={requestClose}
              className="mt-[24px] h-[48px] w-full rounded-[4px] bg-[var(--uc-action-strong)] uc-type-l2 text-[var(--uc-static-white)]"
            >
              OK
            </button>
          )}
        >
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">{activeSheet.content}</p>
        </BottomSheet>
      ) : null}
    </div>
  )
}
