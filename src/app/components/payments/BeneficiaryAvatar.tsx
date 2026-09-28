import BankBadge from '@/app/components/payments/BankBadge'
import { getPartyInitials, partyTint } from '@/app/components/transactions/TransactionPartyAvatar'
import type { BankId } from '@/app/config/bankLogos'

export default function BeneficiaryAvatar({ name, bank, size = 40 }: { name: string; bank: BankId; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span
        className="grid size-full place-items-center rounded-full font-bold leading-none tracking-[0.01em] text-[var(--uc-static-white)]"
        style={{ backgroundColor: partyTint(name), fontSize: Math.round(size * 0.35) }}
      >
        {getPartyInitials(name)}
      </span>
      <span className="absolute" style={{ right: -1, bottom: -1 }}>
        <BankBadge bank={bank} size={Math.round(size * 0.45)} />
      </span>
    </span>
  )
}
