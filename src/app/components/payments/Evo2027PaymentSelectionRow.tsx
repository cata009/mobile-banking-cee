import BeneficiaryAvatar from '@/app/components/payments/BeneficiaryAvatar'
import SelectedMark from '@/app/components/payments/SelectedMark'
import type { BankId } from '@/app/config/bankLogos'

export interface Evo2027PaymentSelectionItem {
  id: string
  kind: 'template' | 'beneficiary'
  title: string
  beneficiaryName: string
  accountNumber: string
  amount: string
  currency: string
  bank?: BankId
}

function sentenceCase(value: string) {
  const lower = value.toLocaleLowerCase()
  return `${lower.slice(0, 1).toLocaleUpperCase()}${lower.slice(1)}`
}

export default function Evo2027PaymentSelectionRow({
  item,
  onSelect,
  selectLabel,
  selected,
  withLeadingInset = false,
}: {
  item: Evo2027PaymentSelectionItem
  onSelect: () => void
  selectLabel: string
  selected?: boolean
  withLeadingInset?: boolean
}) {
  const title = sentenceCase(item.title)
  const accessibleLabel = item.kind === 'template'
    ? `${selectLabel} ${title} for ${item.beneficiaryName}`
    : `${selectLabel} ${item.beneficiaryName}`

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={accessibleLabel}
      aria-pressed={selected}
      className={`grid min-h-[82px] w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-[12px] py-[12px] ${withLeadingInset ? 'pl-[14px]' : 'pl-0'} pr-[14px] text-left transition-colors active:bg-[var(--uc-app-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]`}
    >
      <BeneficiaryAvatar name={item.beneficiaryName} bank={item.bank ?? 'unicredit'} size={40} />
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-semibold leading-[18px] text-[var(--uc-text)]">
          {item.beneficiaryName}
        </span>
        {item.kind === 'template' ? (
          <span className="mt-[2px] block truncate text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
            {title}
          </span>
        ) : null}
        <span className="mt-[2px] block truncate text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
          {item.accountNumber}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-[8px]">
        {item.kind === 'template' ? (
          <span className="whitespace-nowrap text-[14px] font-semibold tabular-nums text-[var(--uc-text)]">
            {item.amount} {item.currency}
          </span>
        ) : null}
        {selected ? <SelectedMark /> : null}
      </span>
    </button>
  )
}
