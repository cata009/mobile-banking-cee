import { useState } from 'react'
import PageHeader from '@/app/components/PageHeader'
import PrimaryButton from '@/app/components/PrimaryButton'
import { BANK_BADGES } from '@/app/config/bankLogos'
import { useCountry } from '@/app/state/demoStore'
import { getRecipientCountry } from '@/data/paymentRecipientRules'
import { getBeneficiaryBankIdForCode, type FrequentBeneficiary } from '@/data/paymentsHub'
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader'

function EditField({
  label,
  value,
  onChange,
  inputMode,
  placeholder,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  inputMode?: 'numeric'
  placeholder?: string
}) {
  return (
    <label className="block w-full">
      <span className="text-[14px] leading-[20px] text-[var(--uc-text)]">{label}</span>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        readOnly={!onChange}
        placeholder={placeholder}
        className="mt-[8px] h-[52px] w-full rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] text-[16px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--uc-action)_18%,transparent)]"
      />
    </label>
  )
}

export default function Evo2027BeneficiaryEditScreen({
  person,
  onBack,
  onSave,
}: {
  person: FrequentBeneficiary
  onBack: () => void
  onSave: (person: FrequentBeneficiary) => void
}) {
  const country = useCountry()
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(48)
  const nameParts = person.name.trim().split(/\s+/).filter(Boolean)
  const [recipientKind, setRecipientKind] = useState(person.recipientKind)
  const [firstNames, setFirstNames] = useState(nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '')
  const [lastName, setLastName] = useState(nameParts.length > 1 ? nameParts.at(-1) ?? '' : '')
  const [businessName, setBusinessName] = useState(person.name)
  const [prefix, setPrefix] = useState(person.paymentAccountPrefix ?? '')
  const [accountNumber, setAccountNumber] = useState(person.paymentAccountNumber)
  const [bankCode, setBankCode] = useState(person.paymentBankCode)

  const beneficiaryName = recipientKind === 'business' ? businessName.trim() : `${firstNames} ${lastName}`.trim()
  const validName = recipientKind === 'business'
    ? businessName.trim().length >= 2
    : firstNames.trim().length > 0 && lastName.trim().length > 0
  const isValid = validName && /^\d{2,10}$/.test(accountNumber) && /^\d{4}$/.test(bankCode) && /^\d{0,6}$/.test(prefix)
  const bankId = getBeneficiaryBankIdForCode(bankCode, person.bank)
  const countryName = getRecipientCountry(country === 'BA_BL' ? 'BA' : country)?.name ?? country

  const save = () => {
    if (!isValid) return
    onSave({
      ...person,
      name: beneficiaryName,
      recipientKind,
      paymentAccountPrefix: prefix,
      paymentAccountNumber: accountNumber,
      paymentBankCode: bankCode,
      bank: bankId,
    })
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]" data-evo-beneficiary-edit>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handlePageScroll}>
        <PageHeader
          title="Edit beneficiary"
          onBack={onBack}
          includeSafeArea
          variant="light"
          showHelp={false}
          collapsedTitleProgress={headerProgress}
        />
        <div className="px-[20px] pb-[24px] pt-[12px]">
          <div className="mb-[22px] grid grid-cols-2 rounded-full bg-[var(--uc-surface-muted)] p-[3px]" aria-label="Recipient type">
            {(['individual', 'business'] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setRecipientKind(kind)}
                aria-pressed={recipientKind === kind}
                className={`h-[39px] rounded-full text-[14px] font-semibold capitalize ${recipientKind === kind ? 'bg-[var(--uc-surface)] shadow-sm' : 'text-[var(--uc-text-muted)]'}`}
              >
                {kind}
              </button>
            ))}
          </div>

          <div className="space-y-[16px]">
            <EditField label="Country / region of recipient’s account" value={countryName} />
            <EditField label="Currency" value={person.currency} />

            <div className="flex items-center justify-between gap-[10px] px-[2px] pt-[5px]">
              <h2 className="text-[17px] font-semibold">Recipient details</h2>
              <span className="text-[13px] font-semibold text-[var(--uc-action)]">Account number</span>
            </div>

            <EditField
              label="Account number prefix (optional)"
              value={prefix}
              onChange={(value) => setPrefix(value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="e.g. 19"
            />
            <EditField
              label="Account number"
              value={accountNumber}
              onChange={(value) => setAccountNumber(value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              placeholder="e.g. 2000145399"
            />
            <EditField
              label="Bank code (4 digits)"
              value={bankCode}
              onChange={(value) => setBankCode(value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
              placeholder="e.g. 0800"
            />
            <p className="-mt-[8px] px-[8px] text-[12px] text-[var(--uc-text-muted)]">{BANK_BADGES[bankId].name}</p>

            {recipientKind === 'business' ? (
              <EditField label="Business name" value={businessName} onChange={setBusinessName} placeholder="Registered business name" />
            ) : (
              <>
                <EditField label="First and middle names" value={firstNames} onChange={setFirstNames} placeholder="First and middle names" />
                <EditField label="Last name(s)" value={lastName} onChange={setLastName} placeholder="Last name(s)" />
              </>
            )}
          </div>
        </div>
      </div>
      <div className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[28px] pt-[10px]" data-beneficiary-edit-footer>
        <PrimaryButton onClick={save} disabled={!isValid}>Save</PrimaryButton>
      </div>
    </div>
  )
}
