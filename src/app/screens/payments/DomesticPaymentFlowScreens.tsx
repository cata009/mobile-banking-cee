import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import { serializeNativeTransactionVisual } from '@/app/components/demo/serializeNativeTransactionVisual'
import type { NativeDemoEvents, NativeDemoRoute } from '@/features/demo-native/contracts'
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents'
import type { NativeTransactionLeadingVisual } from '@/features/demo-native/bankingPresentation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CardTransactionMerchantEnrichment } from '@/features/cards/transactions/contracts'
export type { CardTransactionMerchantEnrichment } from '@/features/cards/transactions/contracts'
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import AccountActionBar, { type AccountActionBarItem } from '@/app/components/accounts/AccountActionBar'
import CardNavigationRow from '@/app/components/cards/CardNavigationRow'
import { AppIcon } from '@/app/components/icons'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useProducts } from '@/hooks/useProducts'
import PageHeader from '@/app/components/PageHeader'
import PfmCategoryIcon from '@/app/components/pfm/PfmCategoryIcon'
import TransactionAvatar from '@/app/components/transactions/TransactionAvatar'
import PfmCategoryChangeSheet from '@/app/components/pfm/PfmCategoryChangeSheet'
import SectionHeadingDivider from '@/app/components/SectionHeadingDivider'
import type { AccountTransaction } from '@/data/accountDetails'
import { useDemo } from '@/app/state/demoStore'
import { getPfmCategorySelection, type PfmCategorySelection } from '@/data/pfmCategories'
import type { CreditCard, DebitCard, Product } from '@/data/products'
import { createTransactionDetailData, type DomesticPaymentDraft } from '@/data/paymentFlow'
import type { CountryId } from '@/app/state/demoTypes'

function SectionTitle({
  children,
  darkNoDivider = false,
  className = '',
}: {
  children: string
  darkNoDivider?: boolean
  className?: string
}) {
  const wrapperClassName = `pt-[30px] ${className}`

  if (darkNoDivider) {
    return (
      <div className={wrapperClassName} data-ds-label="SectionHeadingDivider">
        <h2 className="uc-type-n5-strong line-clamp-2 uppercase text-[#262626]">{children}</h2>
      </div>
    )
  }

  return <SectionHeadingDivider title={children} className={wrapperClassName} />
}

function DetailRow({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-start gap-[12px] py-[17px]">
      <div className="min-w-0 flex-1">
        <p className="uc-type-n5 text-[var(--uc-text-muted)]">{label}</p>
        <p className="uc-type-n4-strong mt-[3px] whitespace-pre-line break-words leading-[20px] text-[var(--uc-text)]">
          {value}
        </p>
      </div>
      {copy && (
        <button type="button" className="mt-[8px] grid size-[32px] place-items-center" aria-label={`Copy ${label}`}>
          <AppIcon name="copy-documents" color="var(--uc-text)" />
        </button>
      )}
    </div>
  )
}

function EvoTransactionFactRow({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div data-transaction-detail-fact-row className="flex items-start justify-between gap-[14px] py-[13px]">
      <span className="min-w-0 flex-1 text-[13px] text-[var(--uc-text-muted)]">{label}</span>
      <span className="flex min-w-0 flex-1 items-start justify-end gap-[8px]">
        <span className="min-w-0 break-words text-right text-[13px] font-medium text-[var(--uc-text)]">{value}</span>
        {copy ? (
          <button type="button" className="grid size-[32px] shrink-0 place-items-center" aria-label={`Copy ${label}`}>
            <AppIcon name="copy-documents" color="var(--uc-text)" />
          </button>
        ) : null}
      </span>
    </div>
  )
}

function getMccDisplayName(value?: string) {
  const mcc = value?.trim()
  if (!mcc) return undefined

  const localizedName = mcc.match(/^\d{4}\s*[·•–—-]\s*(.+)$/)?.[1]?.trim()
  if (localizedName) return localizedName

  // A numeric MCC without a description is not customer-facing display text.
  return /^\d{4}$/.test(mcc) ? undefined : mcc
}

function MerchantLocationDetail({
  location,
}: {
  location: NonNullable<CardTransactionMerchantEnrichment['location']>
}) {
  return (
    <section
      className="mb-[8px] w-full overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] text-left"
      aria-label={`${location.label}: ${location.address}`}
    >
      <div
        className="relative h-[118px] overflow-hidden bg-[#e7ebe5]"
        data-testid="merchant-location-static-map"
        role="img"
        aria-label={`Map showing ${location.address}`}
      >
        <svg className="h-full w-full" viewBox="0 0 340 118" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="340" height="118" fill="#E8ECE6" />
          <path d="M-12 104C38 81 70 72 114 77C160 82 189 102 229 94C269 86 292 60 356 54V132H-12Z" fill="#DDE7D8" />
          <path d="M257 -8C250 20 257 42 276 61C291 76 298 97 306 126" fill="none" stroke="#ACD3E6" strokeWidth="12" />
          <path d="M257 -8C250 20 257 42 276 61C291 76 298 97 306 126" fill="none" stroke="#D4EEF8" strokeWidth="5" />
          <path
            d="M-18 26C40 29 67 46 105 57C156 72 204 67 249 37C282 15 314 12 358 19"
            fill="none"
            stroke="#FFFDF8"
            strokeWidth="20"
          />
          <path
            d="M-18 26C40 29 67 46 105 57C156 72 204 67 249 37C282 15 314 12 358 19"
            fill="none"
            stroke="#D4D4CE"
            strokeWidth="2"
          />
          <path d="M11 129C32 92 64 80 102 64C151 44 182 19 208 -12" fill="none" stroke="#FFFDF8" strokeWidth="15" />
          <path d="M11 129C32 92 64 80 102 64C151 44 182 19 208 -12" fill="none" stroke="#D4D4CE" strokeWidth="2" />
          <path d="M66 -6C78 29 91 49 125 75C149 93 178 104 221 122" fill="none" stroke="#FFFDF8" strokeWidth="10" />
          <path d="M66 -6C78 29 91 49 125 75C149 93 178 104 221 122" fill="none" stroke="#D4D4CE" strokeWidth="1.5" />
          <g fill="#D4D1C7">
            <rect x="22" y="41" width="25" height="13" rx="2" transform="rotate(12 22 41)" />
            <rect x="47" y="62" width="23" height="12" rx="2" transform="rotate(12 47 62)" />
            <rect x="108" y="24" width="25" height="14" rx="2" transform="rotate(-18 108 24)" />
            <rect x="138" y="39" width="20" height="12" rx="2" transform="rotate(-18 138 39)" />
            <rect x="175" y="73" width="23" height="13" rx="2" transform="rotate(8 175 73)" />
            <rect x="206" y="76" width="27" height="15" rx="2" transform="rotate(8 206 76)" />
            <rect x="287" y="35" width="23" height="13" rx="2" transform="rotate(16 287 35)" />
            <rect x="313" y="47" width="20" height="12" rx="2" transform="rotate(16 313 47)" />
          </g>
        </svg>
      </div>
      <div className="flex items-center gap-[10px] px-[12px] py-[11px]">
        <span data-testid="merchant-location-pin" data-icon-color="standard">
          <AppIcon name="contact-location" size={20} color="var(--uc-text)" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">{location.label}</p>
          <p className="mt-[2px] truncate uc-type-n5 text-[var(--uc-text)]">{location.address}</p>
        </div>
      </div>
    </section>
  )
}

function isPhysicalCard(product?: Product | null): product is DebitCard | CreditCard {
  return product?.type === 'debit_card' || product?.type === 'credit_card'
}

function usePaymentPreviewFlow(initialFlow: NativePaymentFlow | null) {
  const key = JSON.stringify(initialFlow)
  const [flow, setFlow] = useState(initialFlow)
  const previousKey = useRef(key)
  const latestFlow = useRef(initialFlow)
  latestFlow.current = initialFlow

  useEffect(() => {
    if (previousKey.current === key) return
    previousKey.current = key
    setFlow(latestFlow.current)
  }, [key])

  return [flow, setFlow] as const
}

function PaymentFlowPreview({
  route,
  initialFlow,
  onBack,
  onFlowChange,
}: {
  route: NativeDemoRoute
  initialFlow: NativePaymentFlow | null
  onBack: () => void
  onFlowChange: NonNullable<NativeDemoEvents['onPaymentFlowChange']>
}) {
  const [flow, setFlow] = usePaymentPreviewFlow(initialFlow)
  return (
    <NativeScreenPreview
      route={route}
      snapshot={{ paymentFlow: flow }}
      events={{
        onPaymentFlowChange: (nextFlow) => {
          setFlow(nextFlow)
          onFlowChange(nextFlow)
        },
      }}
      onBack={onBack}
      onNavigate={(_route, action) => action === 'push'}
    />
  )
}

export function TransactionDetailScreen(props: {
  country: CountryId
  product?: Product | null
  transaction: AccountTransaction
  onBack: () => void
  onRedoPayment: () => void
  onCategoryChange?: (transaction: AccountTransaction, selection: PfmCategorySelection) => void
  /** Optional ETHOCA-style enrichment; omitted in the current baseline runtime. */
  merchantEnrichment?: CardTransactionMerchantEnrichment
  /** Plain Native visual supplied by fixed-data flow previews. */
  nativeMerchantVisual?: NativeTransactionLeadingVisual
  /** Optional market-specific representation for the linked physical card. */
  cardUsedContent?: ReactNode
}) {
  const { product: demoProduct, country: demoCountry, designSystem } = useDemo()
  const { categories } = useProducts()
  const useNativeTransactionDetail =
    demoProduct === 'PI' &&
    designSystem === 'current' &&
    demoCountry !== 'IT' &&
    props.country !== 'IT'
  // Keep non-PI, non-current design-system, and Italy details on the Source renderer.
  if (!useNativeTransactionDetail) return <LegacySourceTransactionDetailBody {...props} />

  const { country, product, transaction, merchantEnrichment, nativeMerchantVisual } = props
  const productId = product?.id ?? ''
  const source = transaction.source === 'card' ? 'card' : 'account'
  const transactionPresentation = {
    product: product ?? null,
    ...(merchantEnrichment
      ? {
          merchantEnrichment: {
            cleanMerchantName: merchantEnrichment.cleanMerchantName,
            leadingVisual:
              nativeMerchantVisual ??
              serializeNativeTransactionVisual(merchantEnrichment.merchantLogo, transaction),
            ...(merchantEnrichment.location ? { location: merchantEnrichment.location } : {}),
            ...(merchantEnrichment.mcc ? { mcc: merchantEnrichment.mcc } : {}),
          },
        }
      : {}),
  }

  return (
    <NativeScreenPreview
      route={{ screen: 'transaction', params: { productId, transactionId: transaction.id, source } }}
      snapshot={{
        country,
        bankingPresentation: { productCategories: categories },
        transactionSelection: { productId, source, transaction },
        transactionPresentation,
      }}
      events={
        props.onCategoryChange
          ? {
              onTransactionCategoryChange: (selectedTransaction, selection) =>
                props.onCategoryChange?.(selectedTransaction, selection),
            }
          : undefined
      }
      onBack={props.onBack}
      onNavigate={(route, action) => {
        if (action === 'push' && route.screen === 'payment-create') {
          props.onRedoPayment()
          return true
        }
        return false
      }}
    />
  )
}

function LegacySourceTransactionDetailBody({
  country,
  product,
  transaction,
  onBack,
  onRedoPayment,
  onCategoryChange,
  merchantEnrichment,
  cardUsedContent,
}: {
  country: CountryId
  product?: Product | null
  transaction: AccountTransaction
  onBack: () => void
  onRedoPayment: () => void
  onCategoryChange?: (transaction: AccountTransaction, selection: PfmCategorySelection) => void
  /** Optional ETHOCA-style enrichment; omitted in the current baseline runtime. */
  merchantEnrichment?: CardTransactionMerchantEnrichment
  /** Optional market-specific representation for the linked physical card. */
  cardUsedContent?: ReactNode
}) {
  const { t } = useLanguage()
  const { release } = useDemo()
  const { categories } = useProducts()
  const isEvo2027 = release === 'release-future-evo-2027'
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(48)
  const [areDetailsExpanded, setAreDetailsExpanded] = useState(false)
  const [categorySheetOpen, setCategorySheetOpen] = useState(false)

  const detail = useMemo(
    () => createTransactionDetailData(transaction, country, product),
    [country, product, transaction],
  )
  const merchantCategoryName = getMccDisplayName(merchantEnrichment?.mcc)
  const currencyLabel = detail.amount.split(' ').slice(-1)[0]
  const isPending = transaction.status === 'Pending'
  const cardUsed = isPhysicalCard(product)
    ? product
    : product?.type === 'current_account' && transaction.source === 'card'
      ? (categories
          .flatMap((category) => category.products)
          .find(
            (candidate): candidate is DebitCard =>
              candidate.type === 'debit_card' && candidate.linkedAccountId === product.id,
          ) ?? null)
      : null
  const isCardTransaction = cardUsed !== null
  const renderDetailRow = (label: string, value: string, copy = false) =>
    isEvo2027 ? (
      <EvoTransactionFactRow label={label} value={value} copy={copy} />
    ) : (
      <DetailRow label={label} value={value} copy={copy} />
    )
  const transactionActionItems: AccountActionBarItem[] = isPending
    ? []
    : [
        {
          id: 'change-category',
          iconName: 'grid-2x2',
          label: t('runtime.transactionDetail.actions.changeCategory', 'Change\ncategory'),
          onClick: onCategoryChange ? () => setCategorySheetOpen(true) : undefined,
        },
        isCardTransaction
          ? { id: 'standing-order-slot', iconName: 'standing-order', label: 'Create\nStanding order', hidden: true }
          : {
              id: 'standing-order',
              iconName: 'standing-order',
              label: t('runtime.transactionDetail.actions.createStandingOrder', 'Create\nStanding order'),
            },
        isCardTransaction
          ? { id: 'request-chargeback', iconName: 'request-chargeback', label: 'Request\nchargeback' }
          : {
              id: 'redo-payment',
              iconName: 'redo-payment',
              label: t('runtime.transactionDetail.actions.redoPayment', 'Redo\npayment'),
              onClick: onRedoPayment,
            },
        {
          id: 'send-payment',
          iconName: 'send-payment',
          label: t('runtime.transactionDetail.actions.sendPayment', 'Send\npayment'),
        },
      ]

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handlePageScroll}>
        <PageHeader
          title={merchantEnrichment?.cleanMerchantName ?? detail.title}
          onBack={onBack}
          variant="gray"
          largeTitleAlign="center"
          collapsedTitleProgress={headerProgress}
          includeSafeArea
          showHelp={false}
          /* The name is not the first thing here any more — the mark is, and the
             name sits under it. The bar still takes the name over on scroll. */
          renderLargeTitle={false}
        />

        <div className="bg-[var(--uc-app-bg)] pb-[8px]">
          <section className="px-[24px] pt-[8px] text-center" style={{ opacity: 1 - headerProgress }}>
            {/* The block leads with who the transaction was with — the merchant
                mark when there is one, otherwise the account pair or the
                counterparty resolved from the row itself — and names them
                underneath it. */}
            <div className="mx-auto flex w-fit items-center justify-center">
              {merchantEnrichment?.merchantLogo ?? <TransactionAvatar transaction={transaction} size={64} />}
            </div>
            <h1
              data-transaction-detail-title
              className="mt-[12px] font-['UniCredit',sans-serif] text-[28px] font-bold leading-[32px] tracking-[-0.02em] text-[var(--uc-text)]"
            >
              {merchantEnrichment?.cleanMerchantName ?? detail.title}
            </h1>
            <p className="uc-type-n5-strong mt-[8px] text-[var(--uc-text-muted)]">{detail.bookingDate}</p>
            <p className="mt-[8px] font-['UniCredit',sans-serif] text-[22px] font-bold leading-normal text-[var(--uc-text)]">
              {detail.amount}
            </p>
            {isPending ? (
              <p
                className="mt-[18px] inline-flex items-center gap-[7px] uc-type-n5-strong uppercase text-[var(--uc-text-muted)]"
                data-pending-status
              >
                <span className="size-[8px] rounded-full bg-[var(--uc-orange-status)]" aria-hidden="true" />
                Pending
              </p>
            ) : (
              <>
                <p className="mt-[18px] font-['UniCredit',sans-serif] text-[13px] font-bold leading-normal text-[var(--uc-text-muted)]">
                  {detail.pfmCategoryLabel.toUpperCase()}
                </p>
                <div
                  className="mt-[8px] inline-flex items-center justify-center gap-[8px] rounded-full border px-[16px] py-[4px]"
                  style={{
                    borderColor: `var(${detail.pfmCategoryColorVar})`,
                    color: `var(${detail.pfmCategoryColorVar})`,
                  }}
                  data-testid="transaction-pfm-summary"
                  data-transaction-pfm-category={detail.pfmCategory}
                  data-transaction-pfm-subcategory={detail.pfmSubcategoryLabel}
                >
                  <PfmCategoryIcon category={detail.pfmCategory} size={20} />
                  <span className="text-[12px] font-bold leading-normal">
                    {detail.pfmSubcategoryLabel.toUpperCase()}
                  </span>
                </div>
              </>
            )}
          </section>

          {!isPending ? (
            <section className="mt-[31px]">
              <AccountActionBar items={transactionActionItems} />
            </section>
          ) : null}
        </div>

        {!isPending ? (
          <section className="px-[22px] pt-[23px]">
            <h2 className="font-['UniCredit',sans-serif] text-[22px] font-bold leading-normal text-[var(--uc-text)]">
              {t('runtime.transactionDetail.spendingInsight', 'Spending Insight')}
            </h2>
            <SectionTitle>{t('runtime.payments.domesticFlow.overviewFor2026', 'OVERVIEW FOR 2026')}</SectionTitle>
            <div className="pt-[28px]">
              <p className="font-['UniCredit',sans-serif] text-[13px] font-bold leading-normal text-[var(--uc-text-muted)]">
                {detail.categoryGroup}
              </p>
              <p className="uc-type-h2 text-[var(--uc-text)]">26,341.33 {currencyLabel}</p>
              <div className="mt-[10px] h-[16px] w-full rounded-full bg-[var(--uc-action)]" />
              <div className="mt-[18px] h-[16px] w-[166px] rounded-full bg-[var(--uc-action)]" />
              <p className="mt-[9px] font-['UniCredit',sans-serif] text-[13px] font-bold leading-normal text-[var(--uc-text-muted)]">
                {detail.categoryTag}
              </p>
              <p className="uc-type-h2 text-[var(--uc-text)]">10,334.22 {currencyLabel}</p>
            </div>
            <SectionTitle>{`${t('runtime.transactionDetail.breakdownFor', 'BREAKDOWN FOR')} ${detail.categoryTag}`}</SectionTitle>
            <div className="mt-[34px]">
              <div className="flex h-[120px] items-end justify-between px-[18px]">
                {[118, 74, 47, 86, 69, 51, 82].map((height, index) => (
                  <div key={index} className="w-[16px] rounded-t-full bg-[var(--uc-action)]" style={{ height }} />
                ))}
              </div>
              <div className="h-px w-full bg-[var(--uc-border)]" />
              <div className="flex justify-between px-[18px] pt-[14px]">
                {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'].map((label) => (
                  <span key={label} className="text-[11px] font-bold text-[var(--uc-text-muted)]">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="px-[24px] pt-[30px]">
          <h2 className="font-['UniCredit',sans-serif] text-[22px] font-bold leading-normal text-[var(--uc-text)]">
            {t('runtime.transactionDetail.title', 'Transaction details')}
          </h2>
          <div className="pt-[20px]">
            {isCardTransaction ? (
              <>
                {merchantEnrichment?.location ? (
                  <MerchantLocationDetail location={merchantEnrichment.location} />
                ) : null}
                <div
                  data-evo2027-transaction-details={isEvo2027 ? 'true' : undefined}
                  className={isEvo2027 ? 'rounded-[18px] bg-[var(--uc-surface)] px-[16px]' : undefined}
                >
                  <div className={isEvo2027 ? 'divide-y divide-[var(--uc-border-muted)]' : undefined}>
                    {renderDetailRow(
                      t('runtime.cardTransactionDetail.description', 'Transaction description'),
                      merchantEnrichment?.cleanMerchantName ?? transaction.label,
                    )}
                    {renderDetailRow(t('runtime.transactionDetail.amount', 'Amount'), detail.amount)}
                    {renderDetailRow(
                      t('runtime.cardTransactionDetail.postingDate', 'Posting date'),
                      detail.bookingDate,
                    )}
                    <AnimatePresence initial={false}>
                      {areDetailsExpanded ? (
                        <motion.div
                          key="card-transaction-date"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          {renderDetailRow(
                            t('runtime.cardTransactionDetail.transactionDate', 'Transaction date'),
                            detail.bookingDate,
                          )}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                    {merchantCategoryName
                      ? renderDetailRow('Merchant Category Code (MCC)', merchantCategoryName)
                      : null}
                  </div>
                </div>
              </>
            ) : (
              <div
                data-evo2027-transaction-details={isEvo2027 ? 'true' : undefined}
                className={isEvo2027 ? 'rounded-[18px] bg-[var(--uc-surface)] px-[16px]' : undefined}
              >
                <div className={isEvo2027 ? 'divide-y divide-[var(--uc-border-muted)]' : undefined}>
                  {renderDetailRow(
                    t('runtime.accounts.detailsInfo.accountNumber', 'Account number'),
                    detail.accountNumber,
                    true,
                  )}
                  {renderDetailRow(
                    t('runtime.accounts.detailsInfo.accountTitle', 'Account title'),
                    detail.accountTitle,
                  )}
                  {renderDetailRow(t('runtime.transactionDetail.accountOwner', 'Account owner'), detail.accountOwner)}
                  <AnimatePresence initial={false}>
                    {areDetailsExpanded ? (
                      <motion.div
                        key="extra-transaction-details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        {renderDetailRow(
                          t('runtime.transactionDetail.bookingDate', 'Booking date'),
                          detail.bookingDate,
                        )}
                        {renderDetailRow(
                          t('runtime.transactionDetail.beneficiaryName', 'Beneficiary Name'),
                          detail.beneficiaryName,
                        )}
                        {renderDetailRow(
                          t('runtime.transactionDetail.beneficiaryBankName', 'Beneficiary Bank Name'),
                          detail.beneficiaryBankName,
                        )}
                        {renderDetailRow(
                          t('runtime.transactionDetail.beneficiaryAccountNumber', 'Beneficiary account number'),
                          detail.beneficiaryAccountNumber,
                          true,
                        )}
                        {renderDetailRow(t('runtime.transactionDetail.amount', 'Amount'), detail.amount)}
                        {renderDetailRow(
                          t('runtime.payments.domesticFlow.paymentDetails', 'Payment details'),
                          detail.paymentDetails,
                        )}
                        {renderDetailRow(
                          t('runtime.transactionDetail.referenceNumber', 'Reference number'),
                          detail.referenceNumber,
                        )}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setAreDetailsExpanded((current) => !current)}
            aria-expanded={areDetailsExpanded}
            className="mx-auto mt-[18px] block pb-[18px] text-center font-['UniCredit',sans-serif] text-[14px] font-bold leading-normal text-[var(--uc-action)]"
          >
            {areDetailsExpanded
              ? t('runtime.actions.showLess', 'Show less')
              : t('runtime.actions.showMore', 'Show more')}
          </button>
          {cardUsed ? (
            <section className="pt-[14px]" data-card-used>
              <SectionHeadingDivider title={t('runtime.cardTransactionDetail.cardUsed', 'Card used')} />
              {cardUsedContent ?? <CardNavigationRow card={cardUsed} />}
            </section>
          ) : null}
        </section>
      </div>
      {categorySheetOpen ? (
        <PfmCategoryChangeSheet
          currentSelection={getPfmCategorySelection(transaction.pfmCategory, transaction.pfmSubcategory)}
          onClose={() => setCategorySheetOpen(false)}
          onConfirm={(selection) => {
            onCategoryChange?.(transaction, selection)
            setCategorySheetOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}

export function DomesticPaymentCreateScreen({
  draft,
  initialStep = 'recipient',
  paymentFlow,
  onDraftChange,
  onPaymentFlowChange,
  onBack,
  onNext,
}: {
  draft: DomesticPaymentDraft
  initialStep?: 'recipient' | 'amount'
  paymentFlow?: NativePaymentFlow | null
  onDraftChange?: (draft: DomesticPaymentDraft) => void
  onPaymentFlowChange?: NativeDemoEvents['onPaymentFlowChange']
  onBack: () => void
  onNext: (draft: DomesticPaymentDraft) => void
}) {
  const initialFlow = paymentFlow ?? { draft, step: 'create' as const, initialStep }
  return (
    <PaymentFlowPreview
      route={{ screen: 'payment-create' }}
      initialFlow={initialFlow}
      onBack={onBack}
      onFlowChange={(nextFlow) => {
        if (!nextFlow) {
          onBack()
          return
        }
        if (nextFlow.step === 'review') {
          onNext(nextFlow.draft)
          return
        }
        if (nextFlow.step === 'create') {
          if (onDraftChange) onDraftChange(nextFlow.draft)
          else onPaymentFlowChange?.(nextFlow)
          return
        }
        onPaymentFlowChange?.(nextFlow)
      }}
    />
  )
}

export function PaymentReviewScreen({
  draft,
  paymentFlow,
  onPaymentFlowChange,
  onDraftChange,
  onBack,
  onSign,
}: {
  draft: DomesticPaymentDraft
  paymentFlow?: NativePaymentFlow | null
  onPaymentFlowChange?: NativeDemoEvents['onPaymentFlowChange']
  onDraftChange?: (draft: DomesticPaymentDraft) => void
  onBack: () => void
  onSign: () => void
}) {
  const initialFlow = paymentFlow ?? { draft, step: 'review' as const }
  return (
    <PaymentFlowPreview
      route={{ screen: 'payment-create' }}
      initialFlow={initialFlow}
      onBack={onBack}
      onFlowChange={(nextFlow) => {
        if (!nextFlow) {
          onBack()
          return
        }
        if (nextFlow.step === 'review') {
          if (onDraftChange) onDraftChange(nextFlow.draft)
          else onPaymentFlowChange?.(nextFlow)
          return
        }
        if (nextFlow.step === 'create') {
          onDraftChange?.(nextFlow.draft)
          onBack()
          return
        }
        if (nextFlow.step === 'sign') {
          onDraftChange?.(nextFlow.draft)
          onSign()
          return
        }
        onPaymentFlowChange?.(nextFlow)
      }}
    />
  )
}

export function PaymentSignScreen({
  paymentFlow,
  onPaymentFlowChange,
  onBack,
  onSign,
}: {
  paymentFlow?: NativePaymentFlow | null
  onPaymentFlowChange?: NativeDemoEvents['onPaymentFlowChange']
  onBack: () => void
  onSign: () => void
}) {
  return (
    <PaymentFlowPreview
      route={{ screen: 'payment-create' }}
      initialFlow={paymentFlow ?? null}
      onBack={onBack}
      onFlowChange={(nextFlow) => {
        if (!nextFlow || nextFlow.step === 'review') {
          onBack()
          return
        }
        if (nextFlow.step === 'success') {
          if (onPaymentFlowChange) onPaymentFlowChange(nextFlow)
          else onSign()
          return
        }
        onPaymentFlowChange?.(nextFlow)
      }}
    />
  )
}

export function PaymentSuccessScreen({
  paymentFlow,
  onPaymentFlowChange,
  onDone,
}: {
  paymentFlow?: NativePaymentFlow | null
  onPaymentFlowChange?: NativeDemoEvents['onPaymentFlowChange']
  onDone: () => void
}) {
  return (
    <PaymentFlowPreview
      route={{ screen: 'payment-create' }}
      initialFlow={paymentFlow ?? null}
      onBack={onDone}
      onFlowChange={(nextFlow) => {
        if (!nextFlow) {
          onDone()
          return
        }
        onPaymentFlowChange?.(nextFlow)
      }}
    />
  )
}
