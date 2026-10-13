import type { CSSProperties, ReactNode } from 'react'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { useDemo } from '@/app/state/demoStore'
import flexiaBase from '@/assets/mobile-first/it/products/imgCardFlexiaTypologyHpSkinNoSkinSideFrontSkeletonNo.svg'
import patternMask from '@/assets/mobile-first/it/products/imgArrows.svg'
import pattern from '@/assets/mobile-first/it/products/imgArrows1.svg'
import flexiaArrow from '@/assets/mobile-first/it/products/imgArrow.svg'
import myOneArrow from '@/assets/mobile-first/it/products/imgArrow1.svg'
import myOneBase from '@/assets/mobile-first/it/products/imgSkin.svg'
import creditLogo from '@/assets/mobile-first/it/products/imgUniCreditLogo.svg'
import debitLogo from '@/assets/mobile-first/it/products/imgUniCreditLogo1.svg'
import mastercard from '@/assets/mobile-first/it/products/imgGroup2.svg'
import whiteEye from '@/assets/mobile-first/it/products/imgNavigationAndActionShowT2.svg'
import blackEye from '@/assets/mobile-first/it/products/card-eye.svg'
import { mobileFirstAssets as assets } from './assets'
import type { ItalyCard } from './cardsContent'
import { MOBILE_FIRST_TAB_CONTENT, type MobileFirstProductCategory } from './productTabContent'
import './mobile-first-products.css'

type OpenProduct = (title: string, content: ReactNode) => void

export interface MobileFirstCategoryPanelProps {
  category: string
  onOpen: OpenProduct
  onOpenCard?: (cardId: string, view: 'hub' | 'detail' | 'pin') => void
  onOpenLoans?: (loanId?: string, view?: 'detail' | 'list' | 'simulations') => void
  loansPanel?: ReactNode
  insurancePanel?: ReactNode
  homepageCards?: readonly ItalyCard[]
}

const CARD_NAMES = ['UniCredit Flexia Classic', 'UniCredit My One'] as const
const CREDIT_NAMES = ['Mutuo Casa Milano', 'Prestito Auto'] as const
const POLICY_NAMES = ['UniCredit My Care Famiglia', 'UniCredit My Care Salute'] as const

function ProductAmount({
  value,
  hidden,
  maskWithAsterisks = false,
}: {
  value: string | number
  hidden: boolean
  maskWithAsterisks?: boolean
}) {
  const [integer, decimals = '00'] =
    typeof value === 'number'
      ? value
          .toFixed(2)
          .replace('.', ',')
          .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
          .split(',')
      : [value, '00']
  return (
    <span className="mf-product-amount">
      <strong>{hidden ? (maskWithAsterisks ? '**.***' : '••••') : integer}</strong>
      {(!hidden || maskWithAsterisks) && <span>,{hidden ? '**' : decimals} €</span>}
    </span>
  )
}

function ProductChevron() {
  return (
    <span className="mf-product-chevron" aria-hidden="true">
      <img src={assets.accountChevron} alt="" width={12} height={22} />
    </span>
  )
}

function CategoryAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="mf-text-link mf-product-all" type="button" onClick={onClick}>
      {label}
      <img src={assets.forwardTeal} alt="" width={16} height={16} />
    </button>
  )
}

function PaymentCard({
  name,
  debit,
  hidden,
  onOpen,
  onOpenCard,
  card,
}: {
  name: string
  debit: boolean
  hidden: boolean
  onOpen: OpenProduct
  onOpenCard?: MobileFirstCategoryPanelProps['onOpenCard']
  card?: ItalyCard
}) {
  const cardId = card?.id ?? (debit ? 'my-one' : 'flexia')
  const holder = card?.holder ?? 'Andrea Rossini'
  const label = card?.nickname ?? holder
  const number = hidden ? '•••• ••••' : `**** ${card?.lastFour ?? '5678'}`
  const spending = card?.spending ?? '6.534'
  return (
    <article className={`mf-product-payment-card${debit ? ' mf-product-payment-card-debit' : ''}`} aria-label={name}>
      <div className="mf-product-art" aria-hidden="true">
        <img className="mf-product-art-base" src={debit ? myOneBase : flexiaBase} alt="" />
        <div className="mf-product-art-pattern" style={{ maskImage: `url("${patternMask}")` } as CSSProperties}>
          <img src={pattern} alt="" />
        </div>
        <img className="mf-product-art-arrow" src={debit ? myOneArrow : flexiaArrow} alt="" />
        <div className="mf-product-art-shade" />
      </div>
      <button
        className="mf-product-card-open"
        type="button"
        aria-label={`Apri carta ${name}`}
        onClick={() =>
          onOpenCard
            ? onOpenCard(cardId, 'detail')
            : onOpen(
                name,
                <div>
                  <p>{holder}</p>
                  <p>{number}</p>
                  <ProductAmount value={spending} hidden={hidden} maskWithAsterisks />
                  <p>Spese del mese</p>
                </div>,
              )
        }
      >
        <span className="mf-product-card-holder">
          <strong>{label}</strong>
          <strong>{number}</strong>
        </span>
        <span className="mf-product-card-spend">
          <ProductAmount value={spending} hidden={hidden} maskWithAsterisks />
          <span>Spese del mese</span>
        </span>
        <span className="mf-product-card-brand" aria-hidden="true">
          <img src={debit ? debitLogo : creditLogo} alt="" />
          <span className="mf-product-mastercard">
            <img src={mastercard} alt="" />
          </span>
          <span>{debit ? 'Debit' : 'Credit'}</span>
        </span>
        <strong className="mf-product-card-title">{name}</strong>
      </button>
      <button
        className="mf-product-pin"
        type="button"
        aria-label={`PIN ${name}`}
        onClick={() =>
          onOpenCard
            ? onOpenCard(cardId, 'pin')
            : onOpen(
                `PIN · ${name}`,
                <div>
                  <p>{holder}</p>
                  <p>{number}</p>
                  <p className="mf-product-pin-value">••••</p>
                </div>,
              )
        }
      >
        PIN
        <span>
          <img src={debit ? blackEye : whiteEye} alt="" />
        </span>
      </button>
    </article>
  )
}

function CreditCard({
  name,
  hidden,
  onOpen,
  onOpenLoans,
}: {
  name: string
  hidden: boolean
  onOpen: OpenProduct
  onOpenLoans?: MobileFirstCategoryPanelProps['onOpenLoans']
}) {
  const details = (
    <div>
      <p>Andrea Rossini - Unicredit</p>
      <ProductAmount value="27.579" hidden={hidden} />
      <p>Capitale residuo al 31/01/2026</p>
    </div>
  )
  return (
    <button
      className="mf-product-credit-card"
      type="button"
      aria-label={`Apri ${name}`}
      onClick={() =>
        onOpenLoans
          ? onOpenLoans(name === 'Mutuo Casa Milano' ? 'mortgage-milano' : 'loan-auto', 'detail')
          : onOpen(name, details)
      }
    >
      <span className="mf-product-summary-heading">
        <span>
          <strong>{name}</strong>
          <b>Andrea Rossini - Unicredit</b>
        </span>
        <ProductChevron />
      </span>
      <span className="mf-product-credit-balance">
        <ProductAmount value="27.579" hidden={hidden} />
        <span>Capitale residuo al 31/01/2026</span>
      </span>
    </button>
  )
}

function PolicyCard({
  name,
  status,
  hidden,
  onOpen,
}: {
  name: string
  status: boolean
  hidden: boolean
  onOpen: OpenProduct
}) {
  const number = hidden ? 'Numero polizza ••••' : 'Numero polizza 10'
  return (
    <button
      className="mf-product-policy-card"
      type="button"
      aria-label={`Apri polizza ${name}`}
      onClick={() =>
        onOpen(
          name,
          <div>
            <p>{number}</p>
            <p>Attiva dal 23/05/2024</p>
            {status && <p>Status</p>}
          </div>,
        )
      }
    >
      <span className="mf-product-summary-heading">
        <span>
          <strong>{name}</strong>
          <b>{number}</b>
          <span>Attiva dal 23/05/2024</span>
        </span>
        <ProductChevron />
      </span>
      {status && <span className="mf-product-policy-status">Status</span>}
    </button>
  )
}

function ProductCommercialSection({ category, onOpen }: { category: MobileFirstProductCategory; onOpen: OpenProduct }) {
  const content = MOBILE_FIRST_TAB_CONTENT[category]
  return (
    <section className="mf-product-commercial" aria-label={content.heading}>
      <h2>{content.heading}</h2>
      <ScrollableRegion className="mf-product-commercial-rail" aria-label={content.heading} key={category}>
        {content.products.map((product) => (
          <button
            className="mf-product-commercial-card"
            key={product.title}
            type="button"
            aria-label={product.title}
            onClick={() => onOpen(product.title, product.description)}
          >
            <span className="mf-product-commercial-photo">
              <img src={product.image} alt="" style={product.crop as CSSProperties} />
            </span>
            <span className="mf-product-commercial-copy">
              <strong>{product.title}</strong>
              <span>{product.description}</span>
            </span>
          </button>
        ))}
      </ScrollableRegion>
      <CategoryAction
        label="SCOPRI TUTTI I NOSTRI PRODOTTI"
        onClick={() =>
          onOpen(
            'I nostri prodotti',
            <div className="mf-product-sheet-list">
              {content.products.map((product) => (
                <button type="button" key={product.title} onClick={() => onOpen(product.title, product.description)}>
                  {product.title}
                  <img src={assets.forwardTeal} alt="" width={16} height={16} />
                </button>
              ))}
            </div>,
          )
        }
      />
    </section>
  )
}

export default function MobileFirstCategoryPanel({
  category,
  onOpen,
  onOpenCard,
  onOpenLoans,
  loansPanel,
  insurancePanel,
  homepageCards,
}: MobileFirstCategoryPanelProps) {
  const { amountsHidden } = useDemo()
  if (category !== 'Carte' && category !== 'Mutui e Prestiti' && category !== 'Polizze assicurative') return null
  if (category === 'Mutui e Prestiti' && loansPanel !== undefined) return <>{loansPanel}</>
  if (category === 'Polizze assicurative' && insurancePanel !== undefined) return <>{insurancePanel}</>
  const names = category === 'Carte' ? CARD_NAMES : category === 'Mutui e Prestiti' ? CREDIT_NAMES : POLICY_NAMES
  return (
    <div className="mf-product-panel">
      <div className="mf-product-owned">
        <div className="mf-product-owned-list">
          {category === 'Carte'
            ? homepageCards === undefined
              ? CARD_NAMES.map((name, index) => (
                  <PaymentCard
                    key={name}
                    name={name}
                    debit={index === 1}
                    hidden={amountsHidden}
                    onOpen={onOpen}
                    onOpenCard={onOpenCard}
                  />
                ))
              : homepageCards.map((card) => (
                  <PaymentCard
                    key={card.id}
                    name={card.name}
                    debit={card.kind === 'debit'}
                    card={card}
                    hidden={amountsHidden}
                    onOpen={onOpen}
                    onOpenCard={onOpenCard}
                  />
                ))
            : category === 'Mutui e Prestiti'
              ? CREDIT_NAMES.map((name) => (
                  <CreditCard key={name} name={name} hidden={amountsHidden} onOpen={onOpen} onOpenLoans={onOpenLoans} />
                ))
              : POLICY_NAMES.map((name, index) => (
                  <PolicyCard key={name} name={name} status={index === 0} hidden={amountsHidden} onOpen={onOpen} />
                ))}
        </div>
        <CategoryAction
          label={MOBILE_FIRST_TAB_CONTENT[category].allLabel}
          onClick={() => {
            if (category === 'Carte' && onOpenCard) {
              onOpenCard(homepageCards?.[0]?.id ?? 'flexia', 'hub')
              return
            }
            if (category === 'Mutui e Prestiti' && onOpenLoans) {
              onOpenLoans(undefined, 'list')
              return
            }
            onOpen(
              MOBILE_FIRST_TAB_CONTENT[category].allLabel,
              <div className="mf-product-sheet-list">
                {names.map((name) => (
                  <button
                    type="button"
                    key={name}
                    onClick={() =>
                      onOpen(
                        name,
                        category === 'Carte' ? (
                          <div>
                            <p>{amountsHidden ? '•••• ••••' : '**** 5678'}</p>
                            <ProductAmount value="6.534" hidden={amountsHidden} />
                            <p>Spese del mese</p>
                          </div>
                        ) : category === 'Mutui e Prestiti' ? (
                          <div>
                            <ProductAmount value="27.579" hidden={amountsHidden} />
                            <p>Capitale residuo al 31/01/2026</p>
                          </div>
                        ) : (
                          <div>
                            <p>{amountsHidden ? 'Numero polizza ••••' : 'Numero polizza 10'}</p>
                            <p>Attiva dal 23/05/2024</p>
                          </div>
                        ),
                      )
                    }
                  >
                    {name}
                    <img src={assets.forwardTeal} alt="" width={16} height={16} />
                  </button>
                ))}
              </div>,
            )
          }}
        />
      </div>
      <ProductCommercialSection category={category} onOpen={onOpen} />
    </div>
  )
}
