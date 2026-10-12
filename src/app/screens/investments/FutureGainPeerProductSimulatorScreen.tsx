import { useMemo, useState } from 'react'
import { AppIcon } from '@/app/components/icons'
import { BottomSheet } from '@/app/components/BottomSheet'
import FutureGainPeerCreditCardScreen from '@/app/screens/investments/FutureGainPeerCreditCardScreen'
import PageHeader from '@/app/components/PageHeader'
import PrimaryButton from '@/app/components/PrimaryButton'
import SectionHeadingDivider from '@/app/components/SectionHeadingDivider'
import { MY_BANKER_RETAIL_CATALOGUE, type MyBankerCurrency } from '@/data/myBankerCore'
import {
  calculateFutureGainPeerSimulation,
  getFutureGainPeerSimulatorPreset,
  type FutureGainPeerProduct,
  type FutureGainPeerSimulatorKind,
} from '@/features/investments/future-gain/peerInsights'
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader'

const CURRENCIES: readonly MyBankerCurrency[] = ['EUR', 'RSD']

function formatAmount(value: number) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function formatMoney(value: number, currency: MyBankerCurrency) {
  const whole = Math.floor(value)
  const decimal = Math.round((value - whole) * 100)
  return `${formatAmount(whole)}.${decimal.toString().padStart(2, '0')} ${currency}`
}

function getAmountRange(kind: FutureGainPeerSimulatorKind, currency: MyBankerCurrency) {
  const model = MY_BANKER_RETAIL_CATALOGUE.find((product) => product.key === kind) ?? MY_BANKER_RETAIL_CATALOGUE[0]!
  return model.amountRanges.find((range) => range.currency === currency) ?? model.amountRanges[0]
}

function getTermRange(kind: FutureGainPeerSimulatorKind) {
  return MY_BANKER_RETAIL_CATALOGUE.find((product) => product.key === kind)?.termMonths ?? null
}

function getQuickAmounts(kind: FutureGainPeerSimulatorKind, currency: MyBankerCurrency) {
  const range = getAmountRange(kind, currency)
  if (!range) return []
  if (kind === 'mortgage' && currency === 'EUR') return [70_000, 100_000, 200_000, 500_000]

  return [
    ...new Set([
      Math.max(range.min, Math.round((range.suggested * 0.5) / range.step) * range.step),
      range.suggested,
      Math.min(range.max, Math.round((range.suggested * 1.5) / range.step) * range.step),
      range.max,
    ]),
  ]
}

function getTermQuickAmounts(kind: FutureGainPeerSimulatorKind) {
  const range = getTermRange(kind)
  if (!range) return []
  if (kind === 'mortgage') return [60, 120, 240, 360]
  if (kind === 'cash-loan') return [12, 24, 48, 84]
  return [...new Set([range.min, range.suggested, Math.min(range.max, 36), range.max])].sort(
    (left, right) => left - right,
  )
}

function getSimulatorDescription(product: FutureGainPeerProduct) {
  if (product.simulator === 'mortgage') {
    return (
      <>
        <strong>Your home, your future.</strong> Discover mortgage options tailored to your needs and calculate an
        indicative monthly installment. Take the next step toward your new home.
      </>
    )
  }
  if (product.simulator === 'credit-card') {
    return 'Adjust the amount you plan to use and review the indicative monthly interest estimate for your credit card.'
  }
  if (product.simulator === 'term-deposit') {
    return 'Choose an amount, currency and term to review an indicative return and maturity value for your deposit.'
  }
  if (product.simulator === 'investment-fund') {
    return 'Adjust your investment amount and time horizon to review an indicative illustration of potential returns.'
  }
  return 'Choose an amount and repayment period to review an indicative monthly installment for this financing option.'
}

function getAmountLabel(kind: FutureGainPeerSimulatorKind) {
  if (kind === 'term-deposit') return 'Deposit amount'
  if (kind === 'investment-fund') return 'Investment amount'
  if (kind === 'credit-card') return 'Amount used'
  return 'Loan amount'
}

function getCalculationHeading(kind: FutureGainPeerSimulatorKind) {
  if (kind === 'term-deposit') return 'DEPOSIT CALCULATION'
  if (kind === 'investment-fund') return 'INVESTMENT CALCULATION'
  if (kind === 'credit-card') return 'CREDIT CARD CALCULATION'
  return 'LOAN CALCULATION'
}

function getDisclosures(productTitle: string) {
  return [
    {
      title: 'Terms & conditions & collateral',
      content: `The final conditions, eligibility and any collateral requirements for ${productTitle.toLowerCase()} are defined by the Bank and confirmed in the offer. This illustration is indicative and is not a binding offer.`,
    },
    {
      title: 'Representative example',
      content:
        'The estimate uses the amount, currency, duration and indicative rate shown in this simulator. Fees, insurance and other costs may change the final amount.',
    },
    {
      title: 'Early payment',
      content:
        'Early repayment conditions and any applicable costs are provided in the final agreement and the Bank’s current terms.',
    },
    {
      title: 'Client’s rights to withdraw from a concluded agreement',
      content:
        'Your rights, deadlines and the process for withdrawal are described in the agreement and the applicable terms and conditions.',
    },
  ]
}

function HomeIndicator() {
  return (
    <div aria-hidden="true" className="flex h-[34px] shrink-0 items-end justify-center bg-[var(--uc-surface)] pb-[8px]">
      <span className="h-[5px] w-[134px] rounded-full bg-[var(--uc-text)]" />
    </div>
  )
}

function FutureGainPeerCalculatorSimulatorScreen({
  product,
  onBack,
}: {
  product: FutureGainPeerProduct
  onBack: () => void
}) {
  const kind = product.simulator
  const preset = getFutureGainPeerSimulatorPreset(kind)
  const model = MY_BANKER_RETAIL_CATALOGUE.find((item) => item.key === kind) ?? MY_BANKER_RETAIL_CATALOGUE[0]!
  const [currency, setCurrency] = useState<MyBankerCurrency>('EUR')
  const termRange = getTermRange(kind)
  const [amountValue, setAmountValue] = useState(formatAmount(preset.amount))
  const [termMonths, setTermMonths] = useState(preset.termMonths)
  const [rateMode, setRateMode] = useState<'combined' | 'variable'>('combined')
  const [activeDisclosure, setActiveDisclosure] = useState<{ title: string; content: string } | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestReady, setRequestReady] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64)

  const amount = Number(amountValue.replace(/\./g, '').replace(/[^\d]/g, '')) || 0
  const quickAmounts = getQuickAmounts(kind, currency)
  const termOptions = getTermQuickAmounts(kind)
  const calculation = useMemo(
    () => calculateFutureGainPeerSimulation({ kind, amount, currency, termMonths, rateMode }),
    [amount, currency, kind, rateMode, termMonths],
  )
  const isFinancing = model.simulation === 'installment' || model.simulation === 'revolving'
  const disclosures = getDisclosures(product.title)

  const changeCurrency = (nextCurrency: MyBankerCurrency) => {
    if (nextCurrency === currency) return
    const nextRange = getAmountRange(kind, nextCurrency)!
    setCurrency(nextCurrency)
    setAmountValue(formatAmount(Math.min(nextRange.max, Math.max(nextRange.min, nextRange.suggested))))
  }

  return (
    <div
      role="region"
      aria-label={`${product.title} simulator`}
      data-future-gain-peer-simulator={kind}
      className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]"
    >
      <div className="shrink-0">
        <PageHeader
          title={product.title}
          onBack={onBack}
          onHelpClick={() => setHelpOpen(true)}
          includeSafeArea
          compact
          renderLargeTitle={false}
          collapsedTitleProgress={headerProgress}
          hideCollapsedTitleWhenHidden
        />
      </div>
      <main className="min-h-0 flex-1 overflow-y-auto pb-[24px] scrollbar-hide" onScroll={handleScroll}>
        <h1 className="uc-type-h1 px-[24px] pt-[8px] text-[var(--uc-text)]">{product.title}</h1>
        <p className="px-[24px] pt-[16px] uc-type-p2 text-[var(--uc-text)]">{getSimulatorDescription(product)}</p>

        <section className="mt-[20px]" aria-label={getCalculationHeading(kind)}>
          <SectionHeadingDivider title={getCalculationHeading(kind)} className="px-[24px]" />

          {kind === 'mortgage' ? (
            <div
              className="grid grid-cols-2 gap-[16px] px-[24px] pt-[16px]"
              role="group"
              aria-label="Mortgage rate type"
            >
              <button
                type="button"
                aria-pressed={rateMode === 'combined'}
                onClick={() => setRateMode('combined')}
                className={`min-h-[50px] rounded-[4px] border-2 px-[12px] uc-type-n5-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] ${
                  rateMode === 'combined'
                    ? 'border-[var(--uc-action-strong)] text-[var(--uc-action-strong)]'
                    : 'border-[var(--uc-border-muted)] text-[var(--uc-text)]'
                }`}
              >
                Combined rate
              </button>
              <button
                type="button"
                aria-pressed={rateMode === 'variable'}
                onClick={() => setRateMode('variable')}
                className={`min-h-[50px] rounded-[4px] border px-[12px] uc-type-n5-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] ${
                  rateMode === 'variable'
                    ? 'border-2 border-[var(--uc-action-strong)] text-[var(--uc-action-strong)]'
                    : 'border-[var(--uc-border-muted)] text-[var(--uc-text)]'
                }`}
              >
                Variable rate
              </button>
            </div>
          ) : null}

          <div className="mt-[16px] flex items-end gap-[16px] px-[24px]">
            <label className="min-w-0 flex-1 border-b border-[var(--uc-border-muted)] pb-[6px]">
              <span className="block uc-type-p2 text-[var(--uc-text-muted)]">{getAmountLabel(kind)}</span>
              <input
                aria-label={getAmountLabel(kind)}
                type="text"
                inputMode="numeric"
                value={amountValue}
                onChange={(event) => setAmountValue(event.target.value)}
                onBlur={() => {
                  if (amount > 0) setAmountValue(formatAmount(amount))
                }}
                className="mt-[2px] w-full bg-transparent uc-type-n4 text-[var(--uc-text)] outline-none"
              />
            </label>
            <label className="w-[74px] shrink-0 border-b border-[var(--uc-border-muted)] pb-[6px]">
              <span className="block uc-type-p2 text-[var(--uc-text-muted)]">Currency</span>
              <select
                aria-label="Currency"
                value={currency}
                onChange={(event) => changeCurrency(event.target.value as MyBankerCurrency)}
                className="mt-[2px] w-full bg-transparent uc-type-n4 text-[var(--uc-text)] outline-none"
              >
                {CURRENCIES.filter((option) => model.amountRanges.some((range) => range.currency === option)).map(
                  (option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          <div
            className="mt-[16px] flex gap-[8px] overflow-x-auto px-[24px] scrollbar-hide"
            aria-label="Suggested amounts"
          >
            {quickAmounts.map((quickAmount) => {
              const selected = amount === quickAmount
              return (
                <button
                  key={quickAmount}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setAmountValue(formatAmount(quickAmount))}
                  className={`shrink-0 rounded-[4px] px-[12px] py-[8px] text-[14px] font-bold leading-[17px] ${
                    selected
                      ? 'bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]'
                      : 'bg-[var(--uc-surface-muted)] text-[var(--uc-text)]'
                  }`}
                >
                  {formatAmount(quickAmount)}
                </button>
              )
            })}
          </div>

          {termRange ? (
            <div className="mt-[24px] px-[24px]">
              <div className="flex items-center justify-between gap-[8px]">
                <span className="uc-type-n5-strong uppercase text-[var(--uc-text)]">
                  {isFinancing ? 'Tenor' : 'Term'}
                </span>
                <label className="flex h-[40px] w-[96px] items-center justify-center border border-[var(--uc-border-muted)] bg-[var(--uc-surface)]">
                  <span className="sr-only">{isFinancing ? 'Loan term in months' : 'Term in months'}</span>
                  <input
                    aria-label={isFinancing ? 'Loan term in months' : 'Term in months'}
                    type="number"
                    min={termRange.min}
                    max={termRange.max}
                    step={termRange.step}
                    value={termMonths}
                    onChange={(event) => setTermMonths(Number(event.target.value) || termRange.min)}
                    className="w-full bg-transparent text-center uc-type-n3-strong text-[var(--uc-text)] outline-none"
                  />
                </label>
              </div>
              <input
                aria-label={isFinancing ? 'Tenor' : 'Term'}
                type="range"
                min={termRange.min}
                max={termRange.max}
                step={termRange.step}
                value={termMonths}
                onChange={(event) => setTermMonths(Number(event.target.value))}
                className="mt-[12px] h-[20px] w-full cursor-pointer accent-[var(--uc-action-strong)]"
              />
              <div className="mt-[8px] flex items-center justify-between uc-type-p2 text-[var(--uc-text-muted)]">
                <span>{termRange.min} months</span>
                <span>{termRange.max} months</span>
              </div>
              <div className="mt-[8px] flex gap-[8px]">
                {termOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={termMonths === option}
                    onClick={() => setTermMonths(option)}
                    className={`flex-1 rounded-[4px] px-[8px] py-[7px] text-[14px] font-bold leading-[17px] ${
                      termMonths === option
                        ? 'bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]'
                        : 'bg-[var(--uc-surface-muted)] text-[var(--uc-text)]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <section
            className="mt-[24px] border-t border-[var(--uc-border-muted)] px-[24px] py-[16px]"
            aria-label="Calculation results"
          >
            <h2 className="uc-type-n4-strong uppercase text-[var(--uc-text)]">Calculation results</h2>
            {calculation ? (
              <>
                {calculation.monthlyPayment !== null ? (
                  <>
                    <div className="mt-[16px]">
                      <p className="uc-type-p2 text-[var(--uc-text-muted)]">Monthly installment</p>
                      <p data-testid="monthly-installment" className="uc-type-n3-strong text-[var(--uc-text)]">
                        {formatMoney(calculation.monthlyPayment, currency)}
                      </p>
                      {calculation.monthlyPaymentAfterFixedPeriod !== null ? (
                        <>
                          <p className="mt-[2px] uc-type-p2 text-[var(--uc-text-muted)]">
                            Fixed for the first 60 months
                          </p>
                          <p className="mt-[8px] uc-type-p2 text-[var(--uc-text-muted)]">After 60 months</p>
                          <p className="uc-type-n4-strong text-[var(--uc-text)]">
                            {formatMoney(calculation.monthlyPaymentAfterFixedPeriod, currency)}
                          </p>
                        </>
                      ) : null}
                    </div>
                    <div className="mt-[16px]">
                      <p className="uc-type-p2 text-[var(--uc-text-muted)]">Total principal + interest</p>
                      <p className="uc-type-n4-strong text-[var(--uc-text)]">
                        {formatMoney(calculation.totalAmount ?? 0, currency)}
                      </p>
                    </div>
                  </>
                ) : calculation.monthlyInterest !== null ? (
                  <div className="mt-[16px]">
                    <p className="uc-type-p2 text-[var(--uc-text-muted)]">Estimated monthly interest</p>
                    <p data-testid="monthly-installment" className="uc-type-n3-strong text-[var(--uc-text)]">
                      {formatMoney(calculation.monthlyInterest, currency)}
                    </p>
                    <p className="mt-[4px] uc-type-p2 text-[var(--uc-text-muted)]">
                      At {calculation.ratePercent.toFixed(2)}% p.a.
                    </p>
                  </div>
                ) : (
                  <div className="mt-[16px]">
                    <p className="uc-type-p2 text-[var(--uc-text-muted)]">Estimated return</p>
                    <p data-testid="monthly-installment" className="uc-type-n3-strong text-[var(--uc-text)]">
                      +{formatMoney(calculation.estimatedReturn ?? 0, currency)}
                    </p>
                    <p className="mt-[4px] uc-type-p2 text-[var(--uc-text-muted)]">
                      Total at maturity: {formatMoney(calculation.totalAmount ?? 0, currency)}
                    </p>
                    <p className="mt-[4px] uc-type-p2 text-[var(--uc-text-muted)]">
                      At {calculation.ratePercent.toFixed(2)}% p.a.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-[12px] uc-type-p2 text-[var(--uc-text-muted)]">
                The selected amount and term are outside this demo’s rate range.
              </p>
            )}
            <p className="mt-[12px] uc-type-p2 text-[var(--uc-text-muted)]">
              Indicative demo estimate. The final offer may differ.
            </p>
          </section>
        </section>

        <div className="border-t border-[var(--uc-border-muted)]">
          {disclosures.map((disclosure) => {
            return (
              <section key={disclosure.title} className="border-b border-[var(--uc-border-muted)]">
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setActiveDisclosure(disclosure)}
                  className="flex min-h-[72px] w-full items-center justify-between gap-[12px] px-[24px] py-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)]"
                >
                  <span className="uc-type-n5-strong text-[var(--uc-text)]">{disclosure.title}</span>
                  <AppIcon name="chevron-link" size={32} color="var(--uc-text)" />
                </button>
              </section>
            )
          })}
        </div>
      </main>

      <footer className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[8px] pt-[8px]">
        <PrimaryButton
          onClick={() => {
            setRequestOpen(true)
            setRequestReady(false)
          }}
        >
          Request offer
        </PrimaryButton>
        <HomeIndicator />
      </footer>

      {activeDisclosure ? (
        <BottomSheet
          title={activeDisclosure.title}
          onClose={() => setActiveDisclosure(null)}
          closeLabel={`Close ${activeDisclosure.title.toLowerCase()}`}
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
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">{activeDisclosure.content}</p>
        </BottomSheet>
      ) : null}

      {requestOpen ? (
        <BottomSheet
          title="Request offer"
          onClose={() => setRequestOpen(false)}
          closeLabel="Close request offer"
          animated
          className="p-[24px]"
          footer={(requestClose) => (
            <button
              type="button"
              onClick={() => (requestReady ? requestClose() : setRequestReady(true))}
              className="mt-[24px] h-[48px] w-full rounded-[4px] bg-[var(--uc-action-strong)] uc-type-l2 text-[var(--uc-static-white)]"
            >
              {requestReady ? 'Done' : 'Continue'}
            </button>
          )}
        >
          {requestReady ? (
            <p className="uc-type-p2 text-[var(--uc-text)]">
              Your offer request is ready in this demo. No request has been sent.
            </p>
          ) : (
            <>
              <p className="uc-type-p2 text-[var(--uc-text)]">
                Your calculation is ready. To continue, contact a UniCredit Bank advisor. No request is sent from this
                demo.
              </p>
              <p className="mt-[12px] uc-type-p2 text-[var(--uc-text-muted)]">
                Estimated amount: {formatMoney(amount, currency)} ·{' '}
                {termMonths ? `${termMonths} months` : 'revolving credit'}
              </p>
            </>
          )}
        </BottomSheet>
      ) : null}

      {helpOpen ? (
        <BottomSheet
          title="About this estimate"
          onClose={() => setHelpOpen(false)}
          closeLabel="Close simulator information"
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
          <p className="mt-[16px] uc-type-p2 text-[var(--uc-text)]">
            This calculator uses illustrative demo rates and the amount and term you selected. It does not check
            eligibility, include every fee or create a binding offer.
          </p>
        </BottomSheet>
      ) : null}
    </div>
  )
}

export default function FutureGainPeerProductSimulatorScreen({
  product,
  onBack,
}: {
  product: FutureGainPeerProduct
  onBack: () => void
}) {
  if (product.simulator === 'credit-card') {
    return <FutureGainPeerCreditCardScreen product={product} onBack={onBack} />
  }

  return <FutureGainPeerCalculatorSimulatorScreen product={product} onBack={onBack} />
}
