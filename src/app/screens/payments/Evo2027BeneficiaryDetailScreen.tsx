import PageHeader from '@/app/components/PageHeader'
import PrimaryButton from '@/app/components/PrimaryButton'
import BeneficiaryEditIcon from '@/app/components/payments/BeneficiaryEditIcon'
import BeneficiaryAvatar from '@/app/components/payments/BeneficiaryAvatar'
import FavoriteStarIcon from '@/app/components/payments/FavoriteStarIcon'
import { BANK_BADGES } from '@/app/config/bankLogos'
import { useCountry } from '@/app/state/demoStore'
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting'
import { getRecipientCountry } from '@/data/paymentRecipientRules'
import { getBeneficiaryPaymentHistory, type FrequentBeneficiary } from '@/data/paymentsHub'
import type { AccountTransaction } from '@/data/accountDetails'
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader'

function formatPaymentDate(payment: AccountTransaction) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${payment.monthKey}-${payment.day}T12:00:00`),
  )
}

function FactRow({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Edit beneficiary account: ${value}`}
        className="flex w-full items-start justify-between gap-[14px] py-[13px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]"
      >
        <span className="shrink-0 text-[13px] text-[var(--uc-text-muted)]">{label}</span>
        <span className="flex min-w-0 items-center justify-end gap-[5px] break-all text-right text-[13px] font-bold text-[var(--uc-action)]">
          <BeneficiaryEditIcon />
          <span>{value}</span>
        </span>
      </button>
    )
  }

  return (
    <div className="flex items-start justify-between gap-[14px] py-[13px]">
      <span className="shrink-0 text-[13px] text-[var(--uc-text-muted)]">{label}</span>
      <span className="min-w-0 break-all text-right text-[13px] font-medium text-[var(--uc-text)]">{value}</span>
    </div>
  )
}

export default function Evo2027BeneficiaryDetailScreen({
  person,
  onBack,
  onSendMoney,
  onTransactionClick,
  onEditBeneficiary,
  isFavorite,
  onFavoriteToggle,
  sendMoneyDisabled = false,
}: {
  person: FrequentBeneficiary
  onBack: () => void
  onSendMoney: () => void
  onTransactionClick: (payment: AccountTransaction) => void
  onEditBeneficiary: () => void
  isFavorite: boolean
  onFavoriteToggle: () => void
  sendMoneyDisabled?: boolean
}) {
  const country = useCountry()
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(48)
  const transactions = getBeneficiaryPaymentHistory(person, country)
  const totalSent = transactions
    .filter((transaction) => transaction.type === 'debit')
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0)
  const totalReceived = transactions
    .filter((transaction) => transaction.type === 'credit')
    .reduce((total, transaction) => total + transaction.amount, 0)
  const countryName = getRecipientCountry(country === 'BA_BL' ? 'BA' : country)?.name ?? country

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col bg-[var(--uc-app-bg)] text-[var(--uc-text)]"
      data-evo-beneficiary-detail
    >
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handlePageScroll}>
        <PageHeader
          title={person.name}
          onBack={onBack}
          includeSafeArea
          showHelp={false}
          variant="gray"
          renderLargeTitle={false}
          collapsedTitleProgress={headerProgress}
          rightActionIcon={<FavoriteStarIcon filled={isFavorite} />}
          rightActionLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          rightActionPressed={isFavorite}
          onRightActionClick={onFavoriteToggle}
        />
        <div className="px-[20px] pb-[34px]">
          <header className="flex flex-col items-center pt-[18px] text-center">
            <BeneficiaryAvatar name={person.name} bank={person.bank} size={76} />
            <h1 className="mt-[18px] font-['UniCredit',sans-serif] text-[29px] font-bold leading-[34px]">
              {person.name}
            </h1>
            <p className="mt-[5px] text-[14px] text-[var(--uc-text-muted)]">{BANK_BADGES[person.bank].name}</p>
          </header>

          <section
            className="mt-[12px] rounded-[18px] bg-[var(--uc-surface)] px-[16px]"
            aria-label="Beneficiary account details"
          >
            <FactRow
              label="Account"
              value={country === 'CZ'
                ? `${person.paymentAccountPrefix ? `${person.paymentAccountPrefix}-` : ''}${person.paymentAccountNumber}/${person.paymentBankCode}`
                : person.accountNumber}
              onClick={onEditBeneficiary}
            />
            <div className="border-t border-[var(--uc-border-muted)]">
              <FactRow label="Bank" value={BANK_BADGES[person.bank].name} />
            </div>
            <div className="border-t border-[var(--uc-border-muted)]">
              <FactRow label="Country / region" value={countryName} />
            </div>
            <div className="border-t border-[var(--uc-border-muted)]">
              <FactRow label="Currency" value={person.currency} />
            </div>
          </section>

          <section className="mt-[28px]" aria-label="Beneficiary transactions">
            <div className="mb-[12px]">
              <h2 className="font-['UniCredit',sans-serif] text-[22px] font-bold">Transactions</h2>
            </div>
            <div className="divide-y divide-[var(--uc-border-muted)] overflow-hidden rounded-[16px] bg-[var(--uc-surface)]">
              <div className="flex items-center justify-between gap-[10px] px-[14px] py-[15px]">
                <span className="text-[14px] text-[var(--uc-text-muted)]">Total sent</span>
                <span className="text-[14px] font-semibold">
                  {formatEvo2027Number(totalSent)} {person.currency}
                </span>
              </div>
              <div className="flex items-center justify-between gap-[10px] px-[14px] py-[15px]">
                <span className="text-[14px] text-[var(--uc-text-muted)]">Total received</span>
                <span className="text-[14px] font-semibold text-[var(--uc-green-olive)]">
                  {formatEvo2027Number(totalReceived)} {person.currency}
                </span>
              </div>
              {transactions.map((payment) => (
                <button
                  key={payment.id}
                  type="button"
                  onClick={() => onTransactionClick(payment)}
                  aria-label={`${payment.type === 'credit' ? 'View receipt from' : 'View payment to'} ${person.name} on ${formatPaymentDate(payment)}`}
                  className="flex min-h-[84px] w-full items-center gap-[12px] px-[14px] py-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]"
                >
                  <BeneficiaryAvatar name={person.name} bank={person.bank} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{person.name}</p>
                    <p className="mt-[2px] truncate text-[12px] text-[var(--uc-text)]">
                      {payment.details ?? `Payment to ${person.name}`}
                    </p>
                    <p className="mt-[2px] text-[12px] text-[var(--uc-text-muted)]">
                      {formatPaymentDate(payment)}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[14px] font-semibold ${payment.type === 'credit' ? 'text-[var(--uc-green-olive)]' : ''}`}>
                    {payment.type === 'credit' ? '+' : '−'}{formatEvo2027Number(Math.abs(payment.amount))} {person.currency}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className="shrink-0 bg-[var(--uc-app-bg)] px-[24px] pb-[28px] pt-[10px]" data-beneficiary-send-money-footer>
        <PrimaryButton onClick={onSendMoney} disabled={sendMoneyDisabled}>
          Send money
        </PrimaryButton>
      </div>
    </div>
  )
}
