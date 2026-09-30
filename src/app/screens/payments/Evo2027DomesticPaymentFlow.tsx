import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, CalendarDays, ChevronRight, Delete, Info, Landmark } from 'lucide-react'
import { BottomSheet } from '@/app/components/BottomSheet'
import AccountSearchBar from '@/app/components/accounts/AccountSearchBar'
import Evo2027PaymentSelectionRow from '@/app/components/payments/Evo2027PaymentSelectionRow'
import BankBadge from '@/app/components/payments/BankBadge'
import CountryFlagRoundel from '@/app/components/payments/CountryFlagRoundel'
import IbanMaskedField from '@/app/components/payments/IbanMaskedField'
import SelectedMark from '@/app/components/payments/SelectedMark'
import SelectChevron from '@/app/components/payments/SelectChevron'
import { CurrencyFlagRoundel } from '@/app/components/payments/CurrencyFlag'
import { getPartyInitials, partyTint } from '@/app/components/transactions/TransactionPartyAvatar'
import type { BankId } from '@/app/config/bankLogos'
import PageHeader from '@/app/components/PageHeader'
import PrimaryButton from '@/app/components/PrimaryButton'
import ToggleButton from '@/app/components/ToggleButton'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useCountry } from '@/app/state/demoStore'
import { useProducts } from '@/hooks/useProducts'
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting'
import { getEvo2027TemplateBeneficiaryName, getPaymentTemplates } from '@/data/paymentTemplates'
import {
  appendPaymentToken,
  evaluatePaymentExpression,
  paymentAmountPresets,
} from '@/app/utils/paymentAmountCalculator'
import type { DomesticPaymentDraft } from '@/data/paymentFlow'
import { getPaymentFxQuote, type PaymentFxQuote } from '@/data/paymentFxQuote'
import { getFrequentBeneficiaries, type FrequentBeneficiary } from '@/data/paymentsHub'
import {
  CHINA_PAYMENT_PURPOSES,
  getRecipientCountry,
  isCountryCurrencySupported,
  isValidIban,
  isValidSwiftBic,
  isValidUsBankDetails,
  isValidUsRoutingNumber,
  PAYMENT_CURRENCIES,
  RECIPIENT_COUNTRIES,
  resolveRecipientRoute,
  US_BANK_DETAILS_OPTIONS,
} from '@/data/paymentRecipientRules'
import type { CountryId } from '@/app/state/demoTypes'

function countryName(code: string) {
  return getRecipientCountry(code === 'BA_BL' ? 'BA' : code)?.name ?? code
}

const BANK_NAMES: Record<string, string> = {
  '0100': 'Komerční banka',
  '0300': 'ČSOB',
  '0600': 'MONETA Money Bank',
  '0800': 'Česká spořitelna',
  '8250': 'Revolut',
  '2010': 'Fio banka',
  '2700': 'UniCredit Bank',
  '5500': 'Raiffeisenbank',
  '6210': 'mBank',
  '6700': 'Trinity Bank',
}

const fieldClass =
  'w-full rounded-[18px] bg-[color-mix(in_srgb,var(--uc-text)_7%,var(--uc-surface))] px-[17px] py-[13px] text-[17px] leading-[23px] text-[var(--uc-text)] outline-none transition-shadow placeholder:text-[var(--uc-text-muted)] focus-within:ring-2 focus-within:ring-[var(--uc-action)]'
const cardClass = 'rounded-[20px] bg-[color-mix(in_srgb,var(--uc-text)_4%,var(--uc-surface))] px-[18px] py-[17px]'

function todayIso() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function dueDateDisplay(value: string) {
  if (!value) return 'Today'
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : value.replace(/^(\d{2})\.(\d{2})\.(\d{4})$/, '$3-$2-$1')
  if (iso === todayIso()) return 'Today'
  const date = new Date(`${iso}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function formatRecipientAccount(draft: DomesticPaymentDraft, homeCountry: CountryId) {
  const route = resolveRecipientRoute(homeCountry, draft.recipientCountry ?? homeCountry, draft.currency)
  if (route === 'foreign-us' || route === 'foreign-cn') return draft.accountNumber
  if (
    route === 'cz-domestic' &&
    (draft.recipientAccountMode ?? 'local') === 'local'
  ) {
    return [draft.prefix && `${draft.prefix}-`, draft.accountNumber, draft.bankCode && `/${draft.bankCode}`]
      .filter(Boolean)
      .join('')
  }
  return draft.accountNumber
}

function isSavedPaymentRecipient(draft: DomesticPaymentDraft, homeCountry: CountryId) {
  const normalizedCountry = homeCountry === 'BA_BL' ? 'BA' : homeCountry
  const recipientCountry = draft.recipientCountry ?? normalizedCountry
  const recipientKind = draft.recipientKind ?? 'individual'
  if (recipientCountry !== normalizedCountry || (draft.recipientAccountMode ?? 'local') !== 'local') return false

  const savedBeneficiary = getFrequentBeneficiaries(homeCountry).some((person) =>
    draft.beneficiaryName === person.name &&
    recipientKind === person.recipientKind &&
    draft.prefix === (person.paymentAccountPrefix ?? '') &&
    draft.accountNumber === person.paymentAccountNumber &&
    draft.bankCode === person.paymentBankCode &&
    draft.currency === person.currency,
  )
  if (savedBeneficiary) return true

  return getPaymentTemplates(homeCountry).some((template) => {
    const beneficiaryName = getEvo2027TemplateBeneficiaryName(template, homeCountry)
    const templateRecipientKind = template.id === 'family-savings' ? 'individual' : 'business'
    const accountNumber = template.accountNumber.replace(/\D/g, '').slice(-6)

    return draft.beneficiaryName === beneficiaryName &&
      recipientKind === templateRecipientKind &&
      draft.prefix === '' &&
      draft.accountNumber === accountNumber &&
      draft.bankCode === template.bankCode &&
      draft.currency === template.currency
  })
}

function beneficiaryBankId(draft: DomesticPaymentDraft, homeCountry: CountryId): BankId | null {
  if (draft.recipientCountry !== 'CZ' && !(draft.recipientCountry === undefined && homeCountry === 'CZ')) return null
  const code = (draft.recipientAccountMode ?? 'local') === 'iban' ? draft.accountNumber.slice(4, 8) : draft.bankCode
  return (
    (
      { '2700': 'unicredit', '0100': 'kb', '0800': 'cs', '5500': 'raiffeisen', '0600': 'moneta', '8250': 'revolut' } as Partial<
        Record<string, BankId>
      >
    )[code] ?? null
  )
}

function BeneficiaryAvatar({
  draft,
  homeCountry,
  size = 32,
}: {
  draft: DomesticPaymentDraft
  homeCountry: CountryId
  size?: number
}) {
  const name = draft.beneficiaryName || 'Recipient'
  const bank = beneficiaryBankId(draft, homeCountry)
  return (
    <span aria-hidden="true" className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className="grid size-full place-items-center rounded-full text-[var(--uc-static-white)] font-bold"
        style={{ backgroundColor: partyTint(name), fontSize: Math.round(size * 0.36) }}
      >
        {getPartyInitials(name)}
      </span>
      <span className="absolute -bottom-[2px] -right-[2px]">
        {bank ? (
          <BankBadge bank={bank} size={Math.round(size * 0.45)} />
        ) : (
          <span
            className="grid place-items-center rounded-full bg-[var(--uc-text)] text-[var(--uc-surface)] shadow-[0_0_0_2px_var(--uc-surface)]"
            style={{ width: Math.round(size * 0.45), height: Math.round(size * 0.45) }}
          >
            <Landmark size={Math.round(size * 0.28)} />
          </span>
        )}
      </span>
    </span>
  )
}

function ExistingBeneficiaryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M4.13944 1H19.8537C21.5894 1 22.9966 2.40721 22.9966 4.14286V19.8571C22.9966 21.5928 21.5894 23 19.8537 23H4.13944V1ZM8.06801 17.5H19.068V12.7857H12.8687C10.2523 12.7896 8.11908 14.8844 8.06801 17.5ZM15.9252 8.46429C15.9252 6.9455 14.694 5.71429 13.1752 5.71429C11.6564 5.71429 10.4252 6.9455 10.4252 8.46429C10.4252 9.98307 11.6564 11.2143 13.1752 11.2143C14.694 11.2143 15.9252 9.98307 15.9252 8.46429Z" fill="currentColor" />
      <path d="M0.996582 18.2857C0.996582 16.9838 2.0518 15.9286 3.35372 15.9286V20.6429C2.0518 20.6429 0.996582 19.5876 0.996582 18.2857Z" fill="currentColor" />
      <path d="M3.35372 9.64286C2.0518 9.64286 0.996582 10.6981 0.996582 12C0.996582 13.3019 2.0518 14.3571 3.35372 14.3571V9.64286Z" fill="currentColor" />
      <path d="M0.996582 5.71429C0.996582 4.41236 2.0518 3.35714 3.35372 3.35714V8.07143C2.0518 8.07143 0.996582 7.01621 0.996582 5.71429Z" fill="currentColor" />
    </svg>
  )
}

function FlowTop({
  title,
  headerSubtitle,
  onBack,
  rightAction,
  onRightActionClick,
  rightActionLabel,
}: {
  title: string
  headerSubtitle?: string
  onBack: () => void
  rightAction?: ReactNode
  onRightActionClick?: () => void
  rightActionLabel?: string
}) {
  return (
    <PageHeader
      title={title}
      headerSubtitle={headerSubtitle}
      onBack={onBack}
      showHelp={false}
      rightActionIcon={rightAction}
      onRightActionClick={onRightActionClick}
      rightActionLabel={rightActionLabel ?? "Recipient details"}
      variant="light"
      includeSafeArea
      renderLargeTitle={false}
      collapsedTitleProgress={title ? 1 : 0}
    />
  )
}

function FlowButton({ children, disabled, onClick }: { children: string; disabled?: boolean; onClick: () => void }) {
  return (
    <PrimaryButton className="!w-full" disabled={disabled} onClick={onClick}>
      {children}
    </PrimaryButton>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  type = 'text',
  headerAccessory,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  inputMode?: 'numeric' | 'email'
  type?: string
  headerAccessory?: ReactNode
}) {
  const id = useId()
  return (
    <label htmlFor={id} className="block w-full">
      <div className="flex items-center justify-between gap-[8px]">
        <span className="uc-type-n4 block text-[var(--uc-text)]">{label}</span>
        {headerAccessory}
      </div>
      <input
        id={id}
        aria-label={label}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="uc-type-p1 mt-[8px] h-[52px] w-full rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-subtle)] focus:border-[var(--uc-action)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--uc-action)_18%,transparent)]"
      />
    </label>
  )
}

function formatFxRate(rate: number) {
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(rate)
}

function formatFxReferenceDate(dateIso: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${dateIso}T12:00:00`),
  )
}

function PaymentFxBreakdownContent({ quote }: { quote: PaymentFxQuote }) {
  const amount = (value: number, currency: string) => `${formatEvo2027Number(value)} ${currency}`
  return (
    <div className="pb-[12px]">
      <div className="space-y-[20px] rounded-[20px] bg-[color-mix(in_srgb,var(--uc-text)_4%,var(--uc-surface))] px-[18px] py-[17px] text-[14px]">
        <div className="flex items-start justify-between gap-[12px]">
          <span className="text-[var(--uc-text-muted)]">Recipient gets</span>
          <span className="font-medium">{amount(quote.recipientAmount, quote.recipientCurrency)}</span>
        </div>
        <div className="flex items-start justify-between gap-[12px]">
          <span className="text-[var(--uc-text-muted)]">Exchange rate</span>
          <span className="text-right font-medium text-[var(--uc-action-strong)]">
            1 {quote.sourceCurrency} = {formatFxRate(quote.rate)} {quote.recipientCurrency}
          </span>
        </div>
        <div className="flex items-start justify-between gap-[12px]">
          <span className="text-[var(--uc-text-muted)]">Exchanged amount</span>
          <span className="font-medium">{amount(quote.exchangedAmount, quote.sourceCurrency)}</span>
        </div>
        <div className="flex items-start justify-between gap-[12px]">
          <span className="text-[var(--uc-text-muted)]">Fees</span>
          <span className="font-medium">{amount(quote.feeAmount, quote.sourceCurrency)}</span>
        </div>
        <div className="flex items-start justify-between gap-[12px] border-t border-[var(--uc-border-muted)] pt-[16px] font-semibold">
          <span>Your total</span>
          <span>{amount(quote.totalSourceAmount, quote.sourceCurrency)}</span>
        </div>
      </div>
      <p className="mt-[12px] text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
        Indicative rate as of {formatFxReferenceDate(quote.referenceDate)}. Final rate and fees are confirmed before payment.
      </p>
    </div>
  )
}

export function Evo2027DomesticPaymentCreateScreen({
  draft,
  initialStep = 'recipient',
  onBack,
  onNext,
}: {
  draft: DomesticPaymentDraft
  initialStep?: 'recipient' | 'amount'
  onBack: () => void
  onNext: (draft: DomesticPaymentDraft) => void
}) {
  const { t } = useLanguage()
  const country = useCountry()
  const { categories } = useProducts()
  const accounts = categories
    .flatMap((category) => category.products)
    .filter((product) => product.type === 'current_account')
  const initialPayer =
    accounts.find((account) => account.accountNumber === draft.payerAccountNumber) ??
    accounts.find((account) => account.name === draft.payerAccountName && account.currency === draft.currency) ??
    accounts.find((account) => account.currency === draft.currency)
  const [form, setForm] = useState<DomesticPaymentDraft>({
    ...draft,
    recipientCountry: draft.recipientCountry ?? (country === 'BA_BL' ? 'BA' : country),
    ...(initialPayer
      ? {
          payerAccountName: initialPayer.name,
          payerAccountNumber: initialPayer.accountNumber,
          payerBalance: `${formatEvo2027Number(initialPayer.balance)} ${initialPayer.currency}`,
        }
      : {}),
    dueDate: draft.instantPayment || !draft.amount ? todayIso() : draft.dueDate,
  })
  const [amountExpression, setAmountExpression] = useState(draft.amount.replace('.', ','))
  const [step, setStep] = useState<'recipient' | 'amount'>(
    initialStep === 'amount' || draft.amount ? 'amount' : 'recipient',
  )
  const [accountPickerOpen, setAccountPickerOpen] = useState(false)
  const [fxBreakdownOpen, setFxBreakdownOpen] = useState(false)
  const [beneficiaryInfoOpen, setBeneficiaryInfoOpen] = useState(false)
  const [existingBeneficiaryPickerOpen, setExistingBeneficiaryPickerOpen] = useState(false)
  const [existingBeneficiarySearch, setExistingBeneficiarySearch] = useState('')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [countryPickerOpen, setCountryPickerOpen] = useState(false)
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false)
  const [bankDetailsPickerOpen, setBankDetailsPickerOpen] = useState(false)
  const [usBankDetailsPickerOpen, setUsBankDetailsPickerOpen] = useState(false)
  const [ibanScanOpen, setIbanScanOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [currencySearch, setCurrencySearch] = useState('')
  const [recentCountries, setRecentCountries] = useState<string[]>(() =>
    Array.from(new Set([country === 'BA_BL' ? 'BA' : country, 'DE', 'SK', 'AT'])).slice(0, 3),
  )
  const [countryChosen, setCountryChosen] = useState(true)
  const [currencyChosen, setCurrencyChosen] = useState(true)
  const [showCompactTitle, setShowCompactTitle] = useState(false)
  const initialNameParts = draft.beneficiaryName.trim().split(/\s+/).filter(Boolean)
  const [firstNames, setFirstNames] = useState(
    initialNameParts.length > 1 ? initialNameParts.slice(0, -1).join(' ') : (initialNameParts[0] ?? ''),
  )
  const [lastName, setLastName] = useState(initialNameParts.length > 1 ? (initialNameParts.at(-1) ?? '') : '')
  const recipientCountry = form.recipientCountry ?? country
  const recipientRoute = resolveRecipientRoute(country, recipientCountry, form.currency)
  const existingBeneficiaries = getFrequentBeneficiaries(country)
  const existingTemplates = getPaymentTemplates(country).map((template) =>
    ({ ...template, beneficiaryName: getEvo2027TemplateBeneficiaryName(template, country) }),
  )
  const normalizedBeneficiarySearch = existingBeneficiarySearch.trim().toLocaleLowerCase()
  const filteredExistingBeneficiaries = existingBeneficiaries.filter((person) => {
    if (!normalizedBeneficiarySearch) return true
    return [person.name, person.accountNumber, person.paymentAccountNumber, person.paymentBankCode]
      .some((value) => value.toLocaleLowerCase().includes(normalizedBeneficiarySearch))
  })
  const filteredExistingTemplates = existingTemplates.filter((template) => {
    if (!normalizedBeneficiarySearch) return true
    return [template.title, template.beneficiaryName, template.accountNumber]
      .some((value) => value.toLocaleLowerCase().includes(normalizedBeneficiarySearch))
  })
  const templateAccountNumber = (template: (typeof existingTemplates)[number]) =>
    template.accountNumber.replace(/\D/g, '').slice(-6)
  const templateRecipientKind = (template: (typeof existingTemplates)[number]) =>
    template.id === 'family-savings' ? 'individual' : 'business'
  const selectedExistingBeneficiaryId = existingBeneficiaries.find((person) =>
    form.beneficiaryName === person.name &&
    form.recipientKind === person.recipientKind &&
    (form.recipientCountry ?? (country === 'BA_BL' ? 'BA' : country)) === (country === 'BA_BL' ? 'BA' : country) &&
    (form.recipientAccountMode ?? 'local') === 'local' &&
    form.prefix === (person.paymentAccountPrefix ?? '') &&
    form.accountNumber === person.paymentAccountNumber &&
    form.bankCode === person.paymentBankCode &&
    form.currency === person.currency,
  )?.id
  const selectedExistingTemplateId = existingTemplates.find((template) =>
    form.beneficiaryName === template.beneficiaryName &&
    form.recipientKind === templateRecipientKind(template) &&
    (form.recipientAccountMode ?? 'local') === 'local' &&
    form.prefix === '' &&
    form.accountNumber === templateAccountNumber(template) &&
    form.bankCode === template.bankCode &&
    form.currency === template.currency &&
    form.amount === template.amount.replace(/\./g, '') &&
    form.informationForBeneficiary === template.paymentNote,
  )?.id
  const isCzLocal = recipientRoute === 'cz-domestic' && (form.recipientAccountMode ?? 'local') === 'local'
  const isForeignUs = recipientRoute === 'foreign-us'
  const isForeignCn = recipientRoute === 'foreign-cn'
  const isForeignRoute = isForeignUs || isForeignCn
  const usBankDetailsMode = form.usBankDetailsMode ?? 'ach'
  const bankName =
    recipientRoute === 'cz-domestic'
      ? (isCzLocal ? BANK_NAMES[form.bankCode] : BANK_NAMES[form.accountNumber.slice(4, 8)]) || form.bankName
      : form.bankName
  const czAccountModeSelector = recipientRoute === 'cz-domestic' ? (
    <button
      type="button"
      onClick={() => setBankDetailsPickerOpen(true)}
      aria-label={`Change account details type, currently ${isCzLocal ? 'Account number' : 'IBAN'}`}
      className="inline-flex shrink-0 items-center gap-[4px] rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[8px] py-[3px] text-[12px] font-semibold text-[var(--uc-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
    >
      {isCzLocal ? 'Account number' : 'IBAN'}
      <SelectChevron filled size={14} />
    </button>
  ) : null
  const usBankDetailsModeSelector = isForeignUs ? (
    <button
      type="button"
      onClick={() => setUsBankDetailsPickerOpen(true)}
      aria-label="Choose US bank details"
      className="inline-flex shrink-0 items-center gap-[4px] rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[8px] py-[3px] text-[12px] font-semibold text-[var(--uc-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
    >
      {US_BANK_DETAILS_OPTIONS.find((option) => option.value === usBankDetailsMode)?.label}
      <SelectChevron filled size={14} />
    </button>
  ) : null
  const selectedPayerAccount =
    accounts.find((account) => account.accountNumber === form.payerAccountNumber) ??
    accounts.find((account) => account.name === form.payerAccountName)
  const sourceCurrencyMatchesPayment = selectedPayerAccount?.currency === form.currency
  const ownedCurrencyTotals = new Map<string, number>()
  for (const account of accounts)
    ownedCurrencyTotals.set(account.currency, (ownedCurrencyTotals.get(account.currency) ?? 0) + account.balance)
  const destinationCurrencies = PAYMENT_CURRENCIES.filter((option) =>
    isCountryCurrencySupported(recipientCountry, option.code),
  )
  const ownedCurrencies = destinationCurrencies.filter((option) => ownedCurrencyTotals.has(option.code))
  const otherCurrencies = destinationCurrencies.filter((option) => !ownedCurrencyTotals.has(option.code))
  const countryQuery = countrySearch.trim().toLowerCase()
  const filteredCountries = RECIPIENT_COUNTRIES.filter(
    (option) =>
      `${option.name} ${option.code}`.toLowerCase().includes(countryQuery) &&
      (countryQuery.length > 0 || !recentCountries.includes(option.code)),
  )
  const currencyMatchesSearch = (option: (typeof PAYMENT_CURRENCIES)[number]) =>
    `${option.code} ${option.name}`.toLowerCase().includes(currencySearch.trim().toLowerCase())
  const update = (key: keyof DomesticPaymentDraft, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }))
  const selectExistingBeneficiary = (person: FrequentBeneficiary) => {
    const parts = person.name.trim().split(/\s+/).filter(Boolean)
    setFirstNames(parts.length > 1 ? parts.slice(0, -1).join(' ') : (parts[0] ?? ''))
    setLastName(parts.length > 1 ? (parts.at(-1) ?? '') : '')
    setForm((current) => ({
      ...current,
      recipientCountry: country === 'BA_BL' ? 'BA' : country,
      recipientAccountMode: 'local',
      recipientKind: person.recipientKind,
      recipientEmail: '',
      beneficiaryName: person.name,
      prefix: person.paymentAccountPrefix ?? '',
      accountNumber: person.paymentAccountNumber,
      bankCode: person.paymentBankCode,
      bankName: BANK_NAMES[person.paymentBankCode] ?? '',
      bankSwift: '',
      routingNumber: '',
      cnapsCode: '',
      recipientStreet: '',
      recipientCity: '',
      recipientRegion: '',
      recipientPostalCode: '',
      paymentPurpose: '',
      currency: person.currency,
      amount: '',
      informationForBeneficiary: '',
    }))
    setAmountExpression('')
    setCountryChosen(true)
    setCurrencyChosen(true)
    setExistingBeneficiarySearch('')
    setExistingBeneficiaryPickerOpen(false)
  }
  const selectExistingTemplate = (template: (typeof existingTemplates)[number]) => {
    const beneficiaryName = template.beneficiaryName
    const recipientKind = template.recipientKind ?? templateRecipientKind(template)
    const nameParts = beneficiaryName.trim().split(/\s+/).filter(Boolean)
    const nextAmountExpression = template.amount.replace(/\./g, '')
    setFirstNames(nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : (nameParts[0] ?? ''))
    setLastName(nameParts.length > 1 ? (nameParts.at(-1) ?? '') : '')
    setAmountExpression(nextAmountExpression)
    setForm((current) => ({
      ...current,
      recipientCountry: country === 'BA_BL' ? 'BA' : country,
      recipientAccountMode: 'local',
      recipientKind,
      recipientEmail: '',
      beneficiaryName,
      prefix: template.paymentAccountPrefix ?? '',
      accountNumber: template.paymentAccountNumber ?? templateAccountNumber(template),
      bankCode: template.bankCode,
      bankName: template.bankName,
      bankSwift: '',
      routingNumber: '',
      cnapsCode: '',
      recipientStreet: '',
      recipientCity: '',
      recipientRegion: '',
      recipientPostalCode: '',
      paymentPurpose: '',
      currency: template.currency,
      amount: nextAmountExpression,
      informationForBeneficiary: template.paymentNote,
    }))
    setCountryChosen(true)
    setCurrencyChosen(true)
    setExistingBeneficiarySearch('')
    setExistingBeneficiaryPickerOpen(false)
  }
  const nameValid =
    (form.recipientKind ?? 'individual') === 'business'
      ? form.beneficiaryName.trim().length >= 2
      : firstNames.trim().length > 0 && lastName.trim().length > 0
  const foreignAddressValid =
    (form.recipientStreet?.trim().length ?? 0) >= 3 &&
    (form.recipientCity?.trim().length ?? 0) >= 2 &&
    (form.recipientRegion?.trim().length ?? 0) >= 2 &&
    (!isForeignUs || /^\d{5}(?:-?\d{4})?$/.test(form.recipientPostalCode?.trim() ?? ''))
  const foreignBankValid =
    (form.bankName?.trim().length ?? 0) >= 2 &&
    (isForeignUs
      ? isValidUsBankDetails(usBankDetailsMode, form.routingNumber ?? '', form.bankSwift ?? '')
      : isValidSwiftBic(form.bankSwift ?? ''))
  const foreignAccountValid = /^[A-Z0-9]{4,34}$/.test(form.accountNumber)
  const chinaPurposeValid = CHINA_PAYMENT_PURPOSES.some(
    (purpose) => purpose.code === form.paymentPurpose &&
      purpose.kinds.some((kind) => kind === (form.recipientKind ?? 'individual')),
  )
  const recipientValid =
    nameValid &&
    countryChosen &&
    currencyChosen &&
    isCountryCurrencySupported(recipientCountry, form.currency) &&
    Boolean(selectedPayerAccount) &&
    (isForeignRoute
      ? foreignAccountValid && foreignBankValid && foreignAddressValid &&
        (!isForeignCn || (chinaPurposeValid && (form.currency !== 'CNY' || (form.cnapsCode?.trim().length ?? 0) >= 8)))
      : isCzLocal
        ? /^\d{2,10}$/.test(form.accountNumber) && /^\d{4}$/.test(form.bankCode)
        : isValidIban(form.accountNumber, recipientCountry)) &&
    (!form.recipientEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail))
  const evaluatedAmount = evaluatePaymentExpression(amountExpression)
  const hasAmountExpression = amountExpression.length > 0
  const hasOperator = /[+\-*/]/.test(amountExpression)
  const expressionComplete = Number.isFinite(evaluatedAmount)
  const fxRequired = Boolean(selectedPayerAccount && !sourceCurrencyMatchesPayment)
  const canUseInstantPayment = !fxRequired && (recipientRoute === 'cz-domestic' || recipientRoute === 'ro-domestic')
  const fxQuote = fxRequired && expressionComplete && evaluatedAmount > 0 && selectedPayerAccount
    ? getPaymentFxQuote({
        recipientAmount: evaluatedAmount,
        recipientCurrency: form.currency,
        sourceCurrency: selectedPayerAccount.currency,
      })
    : null
  const sourceDebitAmount = fxRequired ? fxQuote?.totalSourceAmount : evaluatedAmount
  const exceedsBalance = Boolean(
    selectedPayerAccount &&
    sourceDebitAmount !== undefined &&
    sourceDebitAmount > selectedPayerAccount.balance,
  )
  const amountValid = expressionComplete && evaluatedAmount > 0 && !exceedsBalance && (!fxRequired || Boolean(fxQuote))
  const expressionDisplay = amountExpression.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−')
  const displayText =
    hasOperator && expressionComplete
      ? `${expressionDisplay}=${String(evaluatedAmount).replace('.', ',')}`
      : hasAmountExpression
        ? expressionDisplay
        : '0'
  const amountFontSize =
    displayText.length <= 6
      ? 48
      : displayText.length <= 8
        ? 40
        : displayText.length <= 10
          ? 34
          : displayText.length <= 12
            ? 28
            : 24
  const amountPresets = paymentAmountPresets(form.currency)

  const chooseCountry = (nextCountry: string) => {
    if (nextCountry !== recipientCountry) {
      setAmountExpression('')
      setForm((current) => ({
        ...current,
        recipientCountry: nextCountry,
        currency: getRecipientCountry(nextCountry)?.currency ?? current.currency,
        accountNumber: '',
        prefix: '',
        bankCode: '',
        bankName: '',
        amount: '',
        bankSwift: '',
        usBankDetailsMode: 'ach',
        routingNumber: '',
        cnapsCode: '',
        recipientStreet: '',
        recipientCity: '',
        recipientRegion: '',
        recipientPostalCode: '',
        paymentPurpose: '',
        recipientAccountMode: 'local',
      }))
    }
    setCountryChosen(true)
    setCurrencyChosen(true)
    setRecentCountries((current) => [nextCountry, ...current.filter((code) => code !== nextCountry)].slice(0, 3))
    setCurrencySearch('')
    setCountryPickerOpen(false)
  }

  const chooseCurrency = (nextCurrency: string) => {
    const payer = accounts.find((account) => account.currency === nextCurrency)
    if (nextCurrency !== form.currency) {
      setAmountExpression('')
      setForm((current) => ({
        ...current,
        currency: nextCurrency,
        amount: '',
        ...(isForeignRoute ? {} : {
          accountNumber: '',
          prefix: '',
          bankCode: '',
          bankName: '',
          recipientAccountMode: 'local' as const,
        }),
        ...(payer
          ? {
              payerAccountName: payer.name,
              payerAccountNumber: payer.accountNumber,
              payerBalance: `${formatEvo2027Number(payer.balance)} ${payer.currency}`,
            }
          : {}),
      }))
    } else if (payer) {
      setForm((current) => ({
        ...current,
        payerAccountName: payer.name,
        payerAccountNumber: payer.accountNumber,
        payerBalance: `${formatEvo2027Number(payer.balance)} ${payer.currency}`,
      }))
    }
    setCurrencyChosen(true)
    setCurrencyPickerOpen(false)
  }

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]"
      data-evo-domestic-flow
    >
      <FlowTop
        title={
          step === 'recipient'
            ? showCompactTitle
              ? t('runtime.payments.evo.recipientTitle', 'Add beneficiary')
              : ''
            : form.beneficiaryName || 'Amount'
        }
        headerSubtitle={step === 'amount' ? formatRecipientAccount(form, country) : undefined}
        onBack={step === 'amount' ? () => setStep('recipient') : onBack}
        rightAction={step === 'amount' ? <BeneficiaryAvatar draft={form} homeCountry={country} /> : undefined}
        rightActionLabel="Recipient details"
        onRightActionClick={step === 'amount' ? () => setBeneficiaryInfoOpen(true) : undefined}
      />
      {step === 'recipient' ? (
        <>
          <div
            className="min-h-0 flex-1 overflow-y-auto px-[20px] pb-[20px] scrollbar-hide"
            onScroll={(event) => setShowCompactTitle(event.currentTarget.scrollTop > 45)}
          >
            <h1 className="mb-[23px] mt-[14px] font-['UniCredit',sans-serif] text-[30px] font-bold leading-[35px]">
              {t('runtime.payments.evo.recipientTitle', 'Add beneficiary')}
            </h1>
            <div
              className="mb-[16px] grid grid-cols-2 rounded-full bg-[var(--uc-surface-muted)] p-[2px]"
              aria-label="Recipient type"
            >
              {(['individual', 'business'] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      recipientKind: kind,
                      paymentPurpose: kind === current.recipientKind ? current.paymentPurpose : '',
                      beneficiaryName:
                        kind === 'individual' ? `${firstNames} ${lastName}`.trim() : current.beneficiaryName,
                    }))
                  }
                  className={`h-[32px] rounded-full text-[14px] font-semibold ${(form.recipientKind || 'individual') === kind ? 'bg-[var(--uc-surface)] shadow-sm' : 'text-[var(--uc-text-muted)]'}`}
                >
                  {kind === 'individual' ? 'Individual' : 'Business'}
                </button>
              ))}
            </div>
            <div className="space-y-[12px]">
              <div>
                <span className="uc-type-n4 block text-[var(--uc-text)]">Country / region of recipient’s account</span>
                <button
                  type="button"
                  onClick={() => {
                    setCountrySearch('')
                    setCountryPickerOpen(true)
                  }}
                  className="uc-type-p1 mt-[8px] flex h-[52px] w-full items-center justify-between rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] text-left text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--uc-action)_18%,transparent)]"
                  aria-label="Country or region of recipient's account"
                >
                  <span className={countryChosen ? undefined : 'text-[var(--uc-text-subtle)]'}>
                    {countryChosen ? countryName(recipientCountry) : 'Select a country or region'}
                  </span>
                  <SelectChevron filled={countryChosen} />
                </button>
              </div>
              {countryChosen ? (
                <div>
                  <span className="uc-type-n4 block text-[var(--uc-text)]">Currency</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrencySearch('')
                      setCurrencyPickerOpen(true)
                    }}
                    className="uc-type-p1 mt-[8px] flex h-[52px] w-full items-center justify-between rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] text-left text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--uc-action)_18%,transparent)]"
                    aria-label="Currency"
                  >
                    <span className={currencyChosen ? undefined : 'text-[var(--uc-text-subtle)]'}>
                      {currencyChosen ? form.currency : 'Choose currency'}
                    </span>
                    <SelectChevron filled={currencyChosen} />
                  </button>
                </div>
              ) : null}
              {countryChosen && currencyChosen ? (
                <>
                  <div className="flex items-center justify-between gap-[8px] px-[2px] pt-[13px]">
                    <div className="flex min-w-0 flex-col items-start">
                      <h2 className="text-[17px] font-semibold">Recipient details</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setExistingBeneficiarySearch('')
                        setExistingBeneficiaryPickerOpen(true)
                      }}
                      aria-label="Select an existing beneficiary"
                      className="grid size-[32px] shrink-0 place-items-center rounded-[8px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
                    >
                      <ExistingBeneficiaryIcon />
                    </button>
                  </div>
                  {isCzLocal ? (
                    <FormField
                      label="Account number prefix (optional)"
                      value={form.prefix}
                      onChange={(value) => update('prefix', value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric"
                      placeholder="e.g. 19"
                    />
                  ) : null}
                  {isForeignRoute ? (
                    <>
                      <FormField
                        label="Account number"
                        value={form.accountNumber}
                        headerAccessory={usBankDetailsModeSelector}
                        onChange={(value) => update('accountNumber', value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 34))}
                        inputMode={isForeignUs ? 'numeric' : undefined}
                        placeholder={isForeignUs ? 'e.g. 1234567890' : 'Account number supplied by recipient'}
                      />
                      {isForeignUs ? (
                        <>
                          {usBankDetailsMode === 'swift' ? (
                            <FormField
                              label="BIC / SWIFT"
                              value={form.bankSwift ?? ''}
                              onChange={(value) => update('bankSwift', value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
                              placeholder="8 or 11 characters"
                            />
                          ) : (
                            <FormField
                              label={usBankDetailsMode === 'ach' ? 'ACH routing number' : 'Fedwire routing number'}
                              value={form.routingNumber ?? ''}
                              onChange={(value) => update('routingNumber', value.replace(/\D/g, '').slice(0, 9))}
                              inputMode="numeric"
                              placeholder="9 digits"
                            />
                          )}
                          {usBankDetailsMode === 'swift' && form.bankSwift && !isValidSwiftBic(form.bankSwift) ? (
                            <p className="px-[8px] text-[12px] text-[var(--uc-red-main)]">Enter an 8 or 11 character BIC / SWIFT code.</p>
                          ) : null}
                          {usBankDetailsMode !== 'swift' && form.routingNumber && !isValidUsRoutingNumber(form.routingNumber) ? (
                            <p className="px-[8px] text-[12px] text-[var(--uc-red-main)]">Check the nine-digit routing number.</p>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <FormField
                            label="Receiving bank SWIFT/BIC"
                            value={form.bankSwift ?? ''}
                            onChange={(value) => update('bankSwift', value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
                            placeholder="e.g. BKCHCNBJ"
                          />
                          {form.bankSwift && !isValidSwiftBic(form.bankSwift) ? (
                            <p className="px-[8px] text-[12px] text-[var(--uc-red-main)]">Enter an 8 or 11 character SWIFT/BIC.</p>
                          ) : null}
                          <FormField
                            label={`CNAPS identifier${form.currency === 'CNY' ? '' : ' (optional)'}`}
                            value={form.cnapsCode ?? ''}
                            onChange={(value) => update('cnapsCode', value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14))}
                            placeholder="Use the receiving bank's CNAPS code"
                          />
                          {form.currency === 'CNY' ? (
                            <p className="px-[8px] text-[12px] text-[var(--uc-text-muted)]">Required for CNY. Copy the identifier supplied by the receiving bank.</p>
                          ) : null}
                        </>
                      )}
                    </>
                  ) : isCzLocal ? (
                    <FormField
                      label="Account number"
                      value={form.accountNumber}
                      headerAccessory={czAccountModeSelector}
                      onChange={(value) => update('accountNumber', value.replace(/\D/g, '').slice(0, 10))}
                      inputMode="numeric"
                      placeholder="e.g. 2000145399"
                    />
                  ) : (
                    <IbanMaskedField
                      value={form.accountNumber}
                      countryCode={recipientCountry}
                      length={getRecipientCountry(recipientCountry)?.ibanLength ?? 34}
                      headerAccessory={czAccountModeSelector}
                      onChange={(value) => update('accountNumber', value)}
                      onScan={() => setIbanScanOpen(true)}
                    />
                  )}
                  {!isCzLocal && !isForeignRoute && form.accountNumber.length >= (getRecipientCountry(recipientCountry)?.ibanLength ?? 34) ? (
                    <p className="px-[8px] text-[12px] text-[var(--uc-text-muted)]">
                      {isValidIban(form.accountNumber, recipientCountry)
                        ? 'IBAN format and check digits are valid'
                        : 'Check the IBAN format and check digits'}
                    </p>
                  ) : null}
                  {isCzLocal ? (
                    <FormField
                      label="Bank code (4 digits)"
                      value={form.bankCode}
                      onChange={(value) => {
                        const code = value.replace(/\D/g, '').slice(0, 4)
                        setForm((current) => ({ ...current, bankCode: code, bankName: BANK_NAMES[code] || '' }))
                      }}
                      inputMode="numeric"
                      placeholder="e.g. 0800"
                    />
                  ) : null}
                  {bankName ? (
                    <p className="flex items-center gap-[7px] px-[8px] text-[12px] text-[var(--uc-text)]">
                      <Landmark size={15} className="shrink-0 text-[var(--uc-text)]" />
                      <span className="truncate" title={bankName}>{bankName}</span>
                    </p>
                  ) : null}
                  {(form.recipientKind ?? 'individual') === 'business' ? (
                    <FormField
                      label="Business name"
                      value={form.beneficiaryName}
                      onChange={(value) => update('beneficiaryName', value)}
                      placeholder="Registered business name"
                    />
                  ) : (
                    <>
                      <FormField
                        label="First and middle names"
                        value={firstNames}
                        onChange={(value) => {
                          setFirstNames(value)
                          setForm((current) => ({ ...current, beneficiaryName: `${value} ${lastName}`.trim() }))
                        }}
                        placeholder="First and middle names"
                      />
                      <FormField
                        label="Last name(s)"
                        value={lastName}
                        onChange={(value) => {
                          setLastName(value)
                          setForm((current) => ({ ...current, beneficiaryName: `${firstNames} ${value}`.trim() }))
                        }}
                        placeholder="Last name(s)"
                      />
                    </>
                  )}
                  {isForeignRoute ? (
                    <>
                      <p className="px-[2px] pt-[8px] text-[14px] font-semibold">Receiving bank</p>
                      <FormField
                        label="Bank name"
                        value={form.bankName}
                        onChange={(value) => update('bankName', value)}
                        placeholder={isForeignUs ? 'e.g. JPMorgan Chase Bank' : 'e.g. Bank of China'}
                      />
                      <p className="px-[2px] pt-[8px] text-[14px] font-semibold">Recipient address</p>
                      <FormField
                        label="Street address"
                        value={form.recipientStreet ?? ''}
                        onChange={(value) => update('recipientStreet', value)}
                        placeholder="Street and building number"
                      />
                      <FormField
                        label="City"
                        value={form.recipientCity ?? ''}
                        onChange={(value) => update('recipientCity', value)}
                        placeholder={isForeignUs ? 'e.g. New York' : 'e.g. Beijing'}
                      />
                      <FormField
                        label={isForeignUs ? 'State (2 letters)' : 'Province or region'}
                        value={form.recipientRegion ?? ''}
                        onChange={(value) => update('recipientRegion', isForeignUs ? value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) : value)}
                        placeholder={isForeignUs ? 'e.g. NY' : 'e.g. Beijing'}
                      />
                      <FormField
                        label={isForeignUs ? 'ZIP code' : 'Postal code (optional)'}
                        value={form.recipientPostalCode ?? ''}
                        onChange={(value) => update('recipientPostalCode', value.slice(0, 10))}
                        placeholder={isForeignUs ? 'e.g. 10001' : 'Postal code'}
                      />
                      {isForeignCn ? (
                        <label htmlFor="evo-china-payment-purpose" className="block w-full">
                          <span className="uc-type-n4 block text-[var(--uc-text)]">Payment purpose</span>
                          <select
                            id="evo-china-payment-purpose"
                            aria-label="Payment purpose"
                            value={form.paymentPurpose ?? ''}
                            onChange={(event) => update('paymentPurpose', event.target.value)}
                            className="uc-type-p1 mt-[8px] h-[52px] w-full rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
                          >
                            <option value="">Choose payment purpose</option>
                            {CHINA_PAYMENT_PURPOSES.filter((purpose) =>
                              purpose.kinds.some((kind) => kind === (form.recipientKind ?? 'individual')),
                            ).map((purpose) => (
                              <option key={purpose.code} value={purpose.code}>{purpose.label}</option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                    </>
                  ) : null}
                  <FormField
                    label="Email (optional)"
                    value={form.recipientEmail || ''}
                    onChange={(value) => update('recipientEmail', value)}
                    type="email"
                    inputMode="email"
                    placeholder="name@example.com"
                  />
                  <p className="px-[8px] text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
                    Used to send the recipient a payment confirmation.
                  </p>
                </>
              ) : (
                <p className="px-[8px] text-[13px] leading-[19px] text-[var(--uc-text-muted)]">
                  Choose the recipient country and payment currency to see the account details needed for this transfer.
                </p>
              )}
            </div>
          </div>
          <div className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[42px] pt-[10px]" data-domestic-payment-footer>
            <FlowButton onClick={() => setStep('amount')} disabled={!recipientValid}>
              Continue
            </FlowButton>
          </div>
        </>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-[24px] scrollbar-hide">
            <div className="pt-[34px] text-center">
              <label htmlFor="evo-domestic-amount" className="mt-[28px] flex items-baseline justify-center gap-[6px]">
                <span className="sr-only">Amount in {form.currency}</span>
                <input
                  id="evo-domestic-amount"
                  aria-label={`Amount in ${form.currency}`}
                  value={expressionDisplay}
                  onChange={(event) =>
                    setAmountExpression(
                      event.target.value
                        .replace(/×/g, '*')
                        .replace(/÷/g, '/')
                        .replace(/−/g, '-')
                        .replace(/[^\d,+\-*/.]/g, '')
                        .replace(/\./g, ',')
                        .slice(0, 24),
                    )
                  }
                  inputMode="decimal"
                  placeholder="0"
                  style={{
                    width: `${Math.max(2, Math.min(amountExpression.length + 1, 15))}ch`,
                    fontSize: amountFontSize,
                    lineHeight: `${amountFontSize + 4}px`,
                  }}
                  className="min-w-0 bg-transparent text-right font-['UniCredit',sans-serif] font-bold text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)]"
                />
                <span className="text-[16px] font-medium text-[var(--uc-text-muted)]">{form.currency}</span>
              </label>
              {hasOperator && expressionComplete ? (
                <p aria-live="polite" className="mt-[8px] text-[18px] font-semibold text-[var(--uc-text)]">
                  = {formatEvo2027Number(evaluatedAmount)} {form.currency}
                </p>
              ) : null}
              {fxQuote ? (
                <button
                  type="button"
                  onClick={() => setFxBreakdownOpen(true)}
                  aria-label={`Payment breakdown, estimated total ${formatEvo2027Number(fxQuote.totalSourceAmount)} ${fxQuote.sourceCurrency}`}
                  className="mx-auto mt-[8px] flex items-center justify-center gap-[6px] text-[14px] text-[var(--uc-text-muted)]"
                >
                  <Info size={16} />
                  <span>≈ {formatEvo2027Number(fxQuote.totalSourceAmount)} {fxQuote.sourceCurrency}</span>
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setAccountPickerOpen(true)}
              className={`mx-auto mt-[18px] flex max-w-full items-center gap-[6px] rounded-full border px-[14px] py-[8px] text-[13px] font-semibold ${exceedsBalance ? 'border-[var(--uc-red-main)] bg-[color-mix(in_srgb,var(--uc-red-main)_9%,var(--uc-surface))]' : 'border-[var(--uc-border-muted)] bg-[var(--uc-surface)]'}`}
            >
              {selectedPayerAccount ? <CurrencyFlagRoundel currency={selectedPayerAccount.currency} size={20} /> : null}
              <span className="truncate">
                {form.payerAccountName} · {form.payerBalance}
              </span>
              <SelectChevron filled={Boolean(selectedPayerAccount)} size={16} />
            </button>
            {exceedsBalance ? (
              <p className="mt-[8px] text-center text-[12px] text-[var(--uc-red-main)]">
                Estimated debit exceeds the available {selectedPayerAccount?.currency} balance.
              </p>
            ) : null}
            {fxRequired && !fxQuote && hasAmountExpression ? (
              <p className="mt-[10px] text-center text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
                An exchange rate is unavailable for this currency pair. Choose a {form.currency} account to continue.
              </p>
            ) : null}
            <div className="mt-[28px]">
              <FormField
                label="Reference for recipient"
                value={form.informationForBeneficiary}
                onChange={(value) => update('informationForBeneficiary', value)}
                placeholder="What is this payment for?"
              />
            </div>
          </div>
          <div className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[20px] pt-[8px]">
            {!form.instantPayment && form.dueDate !== todayIso() ? (
              <p className="mb-[9px] text-center text-[12px] text-[var(--uc-text-muted)]">
                Scheduled: <strong className="text-[var(--uc-text)]">{dueDateDisplay(form.dueDate)}</strong>
              </p>
            ) : null}
            <div className="flex items-center gap-[8px]">
              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                aria-label={`Payment date: ${canUseInstantPayment && form.instantPayment ? 'Instant payment' : dueDateDisplay(form.dueDate)}`}
                title={`Payment date: ${canUseInstantPayment && form.instantPayment ? 'Instant payment' : dueDateDisplay(form.dueDate)}`}
                className={`grid size-[48px] shrink-0 place-items-center rounded-[12px] border ${!form.instantPayment && form.dueDate !== todayIso() ? 'border-transparent bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]' : 'border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[var(--uc-text)]'}`}
              >
                <CalendarDays size={22} />
              </button>
              <PrimaryButton
                className="!h-[48px] !flex-1"
                disabled={!amountValid || !recipientValid}
                onClick={() => onNext({ ...form, amount: String(evaluatedAmount).replace('.', ',') })}
              >
                Review transfer
              </PrimaryButton>
            </div>
            {hasAmountExpression ? (
              <div className="mt-[12px] grid grid-cols-5 gap-[8px]" aria-label="Amount calculator">
                {(
                  [
                    ['+', '+'],
                    ['−', '-'],
                    ['×', '*'],
                    ['÷', '/'],
                  ] as const
                ).map(([label, token]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setAmountExpression((current) => appendPaymentToken(current, token))}
                    className="flex h-[44px] items-center justify-center rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[20px] font-semibold text-[var(--uc-text)] active:bg-[var(--uc-surface-muted)]"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmountExpression(String(evaluatedAmount).replace('.', ','))}
                  disabled={!hasOperator || !expressionComplete}
                  className="flex h-[44px] items-center justify-center rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[20px] font-semibold text-[var(--uc-text)] disabled:opacity-40"
                >
                  =
                </button>
              </div>
            ) : (
              <div className="mt-[12px] grid grid-cols-3 gap-[8px]" aria-label="Suggested amounts">
                {amountPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountExpression(String(preset))}
                    className="h-[44px] rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[13px] font-bold text-[var(--uc-text)] active:bg-[var(--uc-surface-muted)]"
                  >
                    {new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(preset)} {form.currency}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-[12px] grid grid-cols-3 gap-[8px]" aria-label="Amount keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAmountExpression((current) => appendPaymentToken(current, key))}
                  aria-label={key === ',' ? 'Decimal separator' : key}
                  className="flex h-[50px] items-center justify-center rounded-[12px] text-[26px] font-semibold text-[var(--uc-text)] active:bg-[var(--uc-surface-muted)]"
                >
                  {key}
                </button>
              ))}
              {hasAmountExpression ? (
                <button
                  type="button"
                  onClick={() => setAmountExpression((current) => current.slice(0, -1))}
                  aria-label="Delete digit"
                  className="flex h-[50px] items-center justify-center rounded-[12px] text-[var(--uc-text)] active:bg-[var(--uc-surface-muted)]"
                >
                  <Delete size={25} />
                </button>
              ) : (
                <div aria-hidden="true" className="h-[50px]" />
              )}
            </div>
          </div>
        </>
      )}
      {bankDetailsPickerOpen ? (
        <BottomSheet title="Choose bank details" onClose={() => setBankDetailsPickerOpen(false)} maxHeightOffsetPx={70}>
          <div className="overflow-hidden rounded-[14px] bg-[var(--uc-surface)]">
            <button
              type="button"
              onClick={() => {
                setForm((current) => ({
                  ...current,
                  recipientAccountMode: 'local',
                  accountNumber: '',
                  bankCode: '',
                  bankName: '',
                }))
                setBankDetailsPickerOpen(false)
              }}
              aria-pressed={isCzLocal}
              className={`flex min-h-[62px] w-full items-center justify-between border-b border-[var(--uc-border-muted)] pl-0 pr-[14px] text-left ${isCzLocal ? 'text-[var(--uc-action-strong)]' : ''}`}
            >
              <span className="text-[16px] font-semibold">Account number</span>
              {isCzLocal ? <SelectedMark /> : null}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm((current) => ({
                  ...current,
                  recipientAccountMode: 'iban',
                  accountNumber: '',
                  prefix: '',
                  bankCode: '',
                  bankName: '',
                }))
                setBankDetailsPickerOpen(false)
              }}
              aria-pressed={!isCzLocal}
              className={`flex min-h-[62px] w-full items-center justify-between pl-0 pr-[14px] text-left ${!isCzLocal ? 'text-[var(--uc-action-strong)]' : ''}`}
            >
              <span className="text-[16px] font-semibold">IBAN</span>
              {!isCzLocal ? <SelectedMark /> : null}
            </button>
          </div>
        </BottomSheet>
      ) : null}
      {usBankDetailsPickerOpen ? (
        <BottomSheet
          title="Choose bank details"
          onClose={() => setUsBankDetailsPickerOpen(false)}
        >
          <div className="overflow-hidden rounded-[14px] bg-[var(--uc-surface)]">
            {US_BANK_DETAILS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={usBankDetailsMode === option.value}
                onClick={() => {
                  setForm((current) => ({
                    ...current,
                    usBankDetailsMode: option.value,
                    routingNumber: '',
                    bankSwift: '',
                  }))
                  setUsBankDetailsPickerOpen(false)
                }}
                className={`flex min-h-[62px] w-full items-center justify-between gap-[12px] border-b border-[var(--uc-border-muted)] px-[14px] text-left last:border-0 ${usBankDetailsMode === option.value ? 'text-[var(--uc-action-strong)]' : 'text-[var(--uc-text)]'}`}
              >
                <span className="min-w-0">
                  <span className="block text-[16px] font-semibold">{option.label}</span>
                  {option.description ? <span className="block text-[12px] text-[var(--uc-text-muted)]">{option.description}</span> : null}
                </span>
                {usBankDetailsMode === option.value ? <SelectedMark /> : null}
              </button>
            ))}
          </div>
        </BottomSheet>
      ) : null}
      {existingBeneficiaryPickerOpen ? (
        <BottomSheet
          title="Choose a beneficiary or template"
          onClose={() => {
            setExistingBeneficiaryPickerOpen(false)
            setExistingBeneficiarySearch('')
          }}
          fillHeight
          maxHeightOffsetPx={70}
        >
          <div className="sticky top-0 z-10 mb-[8px] bg-[var(--uc-sheet-bg)] pb-[12px]">
            <div
              className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[8px]"
              style={{ ['--uc-app-bg' as string]: 'var(--uc-surface)' }}
            >
              <AccountSearchBar
                value={existingBeneficiarySearch}
                onValueChange={setExistingBeneficiarySearch}
                placeholder="Search beneficiaries and templates"
                showTrailingAction={false}
              />
            </div>
          </div>
          <div className="space-y-[18px]">
            {filteredExistingBeneficiaries.length > 0 ? (
              <section aria-label="Beneficiaries">
                <h2 className="mb-[8px] text-[15px] font-semibold text-[var(--uc-text)]">Beneficiaries</h2>
                <div className="overflow-hidden rounded-[14px] bg-[var(--uc-surface)] divide-y divide-[var(--uc-border-muted)]">
                  {filteredExistingBeneficiaries.map((person) => (
                    <Evo2027PaymentSelectionRow
                      key={person.id}
                      item={{
                        id: person.id,
                        kind: 'beneficiary',
                        title: person.name,
                        beneficiaryName: person.name,
                        accountNumber: `${person.paymentAccountPrefix ? `${person.paymentAccountPrefix}-` : ''}${person.paymentAccountNumber}/${person.paymentBankCode}`,
                        amount: '',
                        currency: person.currency,
                        bank: person.bank,
                      }}
                      onSelect={() => selectExistingBeneficiary(person)}
                      selectLabel="Select beneficiary"
                      selected={selectedExistingBeneficiaryId === person.id}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {filteredExistingTemplates.length > 0 ? (
              <section aria-label="Templates">
                <h2 className="mb-[8px] text-[15px] font-semibold text-[var(--uc-text)]">Templates</h2>
                <div className="overflow-hidden rounded-[14px] bg-[var(--uc-surface)] divide-y divide-[var(--uc-border-muted)]">
                  {filteredExistingTemplates.map((template) => {
                    return (
                      <Evo2027PaymentSelectionRow
                        key={template.id}
                        item={template}
                        onSelect={() => selectExistingTemplate(template)}
                        selectLabel="Select template"
                        selected={selectedExistingTemplateId === template.id}
                      />
                    )
                  })}
                </div>
              </section>
            ) : null}
          </div>
          {filteredExistingBeneficiaries.length === 0 && filteredExistingTemplates.length === 0 ? (
            <p className="px-[12px] py-[24px] text-center text-[14px] text-[var(--uc-text-muted)]">
              {existingBeneficiaries.length === 0 && existingTemplates.length === 0
                ? 'No existing beneficiaries or templates are available yet.'
                : 'No beneficiaries or templates match this search.'}
            </p>
          ) : null}
        </BottomSheet>
      ) : null}
      {countryPickerOpen ? (
        <BottomSheet
          title="Select country / region"
          onClose={() => setCountryPickerOpen(false)}
          fillHeight
          maxHeightOffsetPx={70}
        >
          <div className="sticky top-0 z-10 mb-[6px] bg-[var(--uc-sheet-bg)] pb-[12px]">
            <div
              className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[8px]"
              style={{ ['--uc-app-bg' as string]: 'var(--uc-surface)' }}
            >
              <AccountSearchBar
                value={countrySearch}
                onValueChange={setCountrySearch}
                placeholder="Search for a country / region"
                showTrailingAction={false}
              />
            </div>
          </div>
          {!countrySearch.trim() ? (
            <section className="mb-[20px]">
              <h2 className="mb-[8px] text-[13px] font-semibold text-[var(--uc-text-muted)]">Recents</h2>
              <div className="divide-y divide-[var(--uc-border-muted)]">
                {recentCountries.map((recentCountry) => (
                  <button
                    key={recentCountry}
                    type="button"
                    onClick={() => chooseCountry(recentCountry)}
                    aria-pressed={countryChosen && recipientCountry === recentCountry}
                    className={`flex min-h-[62px] w-full items-center gap-[12px] pl-0 pr-[14px] text-left ${countryChosen && recipientCountry === recentCountry ? 'text-[var(--uc-action-strong)]' : ''}`}
                  >
                    <CountryFlagRoundel country={recentCountry} size={36} />
                    <span>
                      <span className="block text-[16px] font-semibold">{countryName(recentCountry)}</span>
                      <span className="text-[12px] text-[var(--uc-text-muted)]">{recentCountry}</span>
                    </span>
                    {countryChosen && recipientCountry === recentCountry ? <SelectedMark className="ml-auto" /> : null}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          <section className="pb-[14px]">
            <h2 className="mb-[8px] text-[13px] font-semibold text-[var(--uc-text-muted)]">
              Available countries / regions
            </h2>
            <div className="overflow-hidden rounded-[14px] bg-[var(--uc-surface)]">
              {filteredCountries.length ? (
                filteredCountries.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => chooseCountry(option.code)}
                    aria-pressed={countryChosen && recipientCountry === option.code}
                    className={`flex min-h-[56px] w-full items-center gap-[12px] border-b border-[var(--uc-border-muted)] pl-0 pr-[14px] text-left last:border-0 ${countryChosen && recipientCountry === option.code ? 'text-[var(--uc-action-strong)]' : ''}`}
                  >
                    <CountryFlagRoundel country={option.code} size={36} />
                    <span>
                      <span className="block text-[15px] font-semibold">{option.name}</span>
                      <span className="text-[12px] text-[var(--uc-text-muted)]">{option.code}</span>
                    </span>
                    {countryChosen && recipientCountry === option.code ? <SelectedMark className="ml-auto" /> : null}
                  </button>
                ))
              ) : (
                <p className="py-[24px] text-center text-[13px] text-[var(--uc-text-muted)]">
                  No supported destination matches this search.
                </p>
              )}
            </div>
          </section>
        </BottomSheet>
      ) : null}
      {currencyPickerOpen ? (
        <BottomSheet
          title="Choose currency"
          onClose={() => setCurrencyPickerOpen(false)}
          fillHeight
          maxHeightOffsetPx={70}
        >
          <div className="sticky top-0 z-10 mb-[6px] bg-[var(--uc-sheet-bg)] pb-[12px]">
            <div
              className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[8px]"
              style={{ ['--uc-app-bg' as string]: 'var(--uc-surface)' }}
            >
              <AccountSearchBar
                value={currencySearch}
                onValueChange={setCurrencySearch}
                placeholder="Search currencies"
                showTrailingAction={false}
              />
            </div>
          </div>
          {ownedCurrencies.some(currencyMatchesSearch) ? (
            <section className="mb-[20px]">
              <h2 className="mb-[8px] text-[13px] font-semibold text-[var(--uc-text-muted)]">Your currencies</h2>
              <div className="overflow-hidden rounded-[14px] bg-[var(--uc-surface)]">
                {ownedCurrencies.filter(currencyMatchesSearch).map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => chooseCurrency(option.code)}
                    aria-pressed={currencyChosen && form.currency === option.code}
                    className={`grid min-h-[76px] w-full grid-cols-[36px_minmax(0,1fr)_16px] items-center gap-[12px] border-b border-[var(--uc-border-muted)] pl-0 pr-[14px] text-left last:border-0 ${currencyChosen && form.currency === option.code ? 'text-[var(--uc-action-strong)]' : ''}`}
                  >
                    <CountryFlagRoundel currency={option.code} size={36} />
                    <span className="min-w-0">
                      <span className="block text-[16px] font-semibold leading-[18px]">{option.code}</span>
                      <span className="mt-[2px] block text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
                        {option.name}
                      </span>
                      <span className="mt-[2px] block text-[12px] font-semibold leading-[16px] text-[var(--uc-text)]">
                        Available {formatEvo2027Number(ownedCurrencyTotals.get(option.code) ?? 0)} {option.code}
                      </span>
                    </span>
                    {currencyChosen && form.currency === option.code ? <SelectedMark /> : <span aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          {otherCurrencies.some(currencyMatchesSearch) ? (
            <section className="pb-[14px]">
              <h2 className="mb-[8px] text-[13px] font-semibold text-[var(--uc-text-muted)]">Other currencies</h2>
              <div className="overflow-hidden rounded-[14px] bg-[var(--uc-surface)]">
                {otherCurrencies.filter(currencyMatchesSearch).map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => chooseCurrency(option.code)}
                    aria-pressed={currencyChosen && form.currency === option.code}
                    className={`flex min-h-[56px] w-full items-center justify-between border-b border-[var(--uc-border-muted)] pl-0 pr-[14px] text-left last:border-0 ${currencyChosen && form.currency === option.code ? 'text-[var(--uc-action-strong)]' : ''}`}
                  >
                    <span className="flex min-w-0 items-center gap-[12px]">
                      <CountryFlagRoundel currency={option.code} size={36} />
                      <span>
                        <span className="block text-[15px] font-semibold leading-[18px]">{option.code}</span>
                        <span className="mt-[2px] block text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
                          {option.name}
                        </span>
                      </span>
                    </span>
                    {currencyChosen && form.currency === option.code ? (
                      <SelectedMark />
                    ) : null}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          {!PAYMENT_CURRENCIES.some(currencyMatchesSearch) ? (
            <p className="py-[24px] text-center text-[13px] text-[var(--uc-text-muted)]">
              No currency matches this search.
            </p>
          ) : null}
        </BottomSheet>
      ) : null}
      {accountPickerOpen ? (
        <BottomSheet
          title="Choose source account"
          onClose={() => setAccountPickerOpen(false)}
          maxHeightOffsetPx={70}
        >
          <div className="overflow-hidden rounded-[14px] bg-[var(--uc-surface)]">
            {accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                aria-pressed={form.payerAccountNumber === account.accountNumber}
                aria-label={`${account.name}, ${account.accountNumber}, available ${formatEvo2027Number(account.balance)} ${account.currency}${account.currency !== form.currency ? ', different currency' : ''}`}
                onClick={() => {
                  setForm((current) => ({
                    ...current,
                    payerAccountName: account.name,
                    payerAccountNumber: account.accountNumber,
                    payerBalance: `${formatEvo2027Number(account.balance)} ${account.currency}`,
                  }))
                  setAccountPickerOpen(false)
                }}
                className={`grid min-h-[76px] w-full grid-cols-[36px_minmax(0,1fr)_16px] items-center gap-[12px] border-b border-[var(--uc-border-muted)] pl-0 pr-[14px] text-left last:border-0 ${form.payerAccountNumber === account.accountNumber ? 'text-[var(--uc-action-strong)]' : ''}`}
              >
                <CurrencyFlagRoundel currency={account.currency} size={36} />
                <span className="min-w-0">
                  <span className="block truncate text-[16px] font-semibold leading-[20px]">{account.name}</span>
                  <span className="block truncate text-[12px] text-[var(--uc-text-muted)]">
                    {account.accountNumber}
                  </span>
                  <span className="block truncate text-[12px] text-[var(--uc-text-muted)]">
                    Available {formatEvo2027Number(account.balance)} {account.currency}
                  </span>
                </span>
                {form.payerAccountNumber === account.accountNumber ? <SelectedMark /> : <span aria-hidden="true" />}
              </button>
            ))}
          </div>
        </BottomSheet>
      ) : null}
      {fxBreakdownOpen && fxQuote ? (
        <BottomSheet title="Payment breakdown" onClose={() => setFxBreakdownOpen(false)}>
          <PaymentFxBreakdownContent quote={fxQuote} />
        </BottomSheet>
      ) : null}
      {scheduleOpen ? (
        <BottomSheet title="Payment date" onClose={() => setScheduleOpen(false)}>
          <div className="space-y-[16px] pb-[20px]">
            {canUseInstantPayment ? (
              <div className="flex items-center justify-between gap-[16px] rounded-[12px] bg-[color-mix(in_srgb,var(--uc-text)_4%,var(--uc-surface))] px-[16px] py-[14px]">
                <div>
                  <p className="text-[14px] font-semibold text-[var(--uc-text)]">Instant payment</p>
                  <p className="mt-[3px] text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
                    Send as soon as the payment is confirmed.
                  </p>
                </div>
                <ToggleButton
                  ariaLabel="Instant payment"
                  checked={form.instantPayment}
                  onToggle={(instantPayment) => setForm((current) => ({
                    ...current,
                    instantPayment,
                    dueDate: instantPayment ? todayIso() : current.dueDate,
                  }))}
                />
              </div>
            ) : null}
            {canUseInstantPayment && form.instantPayment ? (
              <p className="text-[13px] leading-[19px] text-[var(--uc-text-muted)]">
                This payment will be sent immediately.
              </p>
            ) : (
              <label htmlFor="evo-payment-date" className="block text-[13px] text-[var(--uc-text-muted)]">
                Choose when to submit this payment.
                <input
                  id="evo-payment-date"
                  aria-label="Payment date"
                  type="date"
                  min={todayIso()}
                  value={/^\d{4}-\d{2}-\d{2}$/.test(form.dueDate) ? form.dueDate : todayIso()}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    dueDate: event.target.value,
                    instantPayment: false,
                  }))}
                  className={`${fieldClass} mt-[9px] block`}
                />
              </label>
            )}
            <FlowButton onClick={() => setScheduleOpen(false)}>Done</FlowButton>
          </div>
        </BottomSheet>
      ) : null}
      {ibanScanOpen ? (
        <BottomSheet title="Scan IBAN" onClose={() => setIbanScanOpen(false)}>
          <div className="space-y-[18px] pb-[12px]">
            <p className="text-[14px] leading-[21px] text-[var(--uc-text-muted)]">
              IBAN scanning is unavailable right now. Enter the IBAN manually using the format shown in the field.
            </p>
            <PrimaryButton onClick={() => setIbanScanOpen(false)}>Enter IBAN manually</PrimaryButton>
          </div>
        </BottomSheet>
      ) : null}
      {beneficiaryInfoOpen ? (
        <BottomSheet title="Beneficiary details" onClose={() => setBeneficiaryInfoOpen(false)}>
          <div className="space-y-[8px] pb-[18px] text-[13px]">
            <p>
              <strong>Name:</strong> {form.beneficiaryName}
            </p>
            <p>
              <strong>Account:</strong> {formatRecipientAccount(form, country)}
            </p>
            <p>
              <strong>Bank:</strong> {bankName || 'Recipient bank'}
            </p>
          </div>
        </BottomSheet>
      ) : null}
    </div>
  )
}

export function Evo2027PaymentReviewScreen({
  draft,
  onDraftChange,
  onBack,
  onSign,
}: {
  draft: DomesticPaymentDraft
  onDraftChange: (nextDraft: DomesticPaymentDraft) => void
  onBack: () => void
  onSign: () => void
}) {
  const { t } = useLanguage()
  const country = useCountry()
  const { categories } = useProducts()
  const [infoOpen, setInfoOpen] = useState(false)
  const [fxBreakdownOpen, setFxBreakdownOpen] = useState(false)
  const [editField, setEditField] = useState<'reference' | 'note' | null>(null)
  const [editValue, setEditValue] = useState('')
  const openEditor = (field: 'reference' | 'note') => {
    setEditValue(field === 'reference' ? draft.informationForBeneficiary : draft.informationForMe)
    setEditField(field)
  }
  const saveEditor = () => {
    if (!editField) return
    onDraftChange({
      ...draft,
      [editField === 'reference' ? 'informationForBeneficiary' : 'informationForMe']: editValue.trim(),
    })
    setEditField(null)
  }
  const account = formatRecipientAccount(draft, country)
  const payerAccount = categories
    .flatMap((category) => category.products)
    .find((product) => product.type === 'current_account' && product.accountNumber === draft.payerAccountNumber)
  const payerCurrency = payerAccount?.currency ?? draft.payerBalance.split(/\s+/).at(-1)
  const fxRequired = Boolean(payerCurrency && payerCurrency !== draft.currency)
  const recipientAmount = Number(draft.amount.replace(/\s/g, '').replace(',', '.'))
  const formattedAmount = `${formatEvo2027Number(recipientAmount)} ${draft.currency}`
  const fxQuote = fxRequired && payerCurrency
    ? getPaymentFxQuote({ recipientAmount, recipientCurrency: draft.currency, sourceCurrency: payerCurrency })
    : null
  const recipientRoute = resolveRecipientRoute(country, draft.recipientCountry ?? country, draft.currency)
  const isForeignRoute = recipientRoute === 'foreign-us' || recipientRoute === 'foreign-cn'
  const canContinueToSign =
    (recipientRoute === 'cz-domestic' || recipientRoute === 'ro-domestic') && (!fxRequired || Boolean(fxQuote))
  const requiresBankQuote = isForeignRoute || (fxRequired && !fxQuote)
  const canUseInstantPayment = !fxRequired && (recipientRoute === 'cz-domestic' || recipientRoute === 'ro-domestic')
  const savedRecipient = isSavedPaymentRecipient(draft, country)
  const bankName =
    draft.bankName ||
    (recipientRoute === 'cz-domestic'
      ? BANK_NAMES[
          (draft.recipientAccountMode ?? 'local') === 'local' ? draft.bankCode : draft.accountNumber.slice(4, 8)
        ]
      : '')
  return (
    <div
      className="flex h-full min-h-0 w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]"
      data-evo-domestic-review
    >
      <FlowTop
        title={t('runtime.payments.evo.reviewTitle', 'Review transfer')}
        onBack={onBack}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-[20px] pb-[15px] pt-[24px] scrollbar-hide">
        <div className="space-y-[12px]">
          {!savedRecipient ? (
            <section className={cardClass}>
              <div className="flex items-start gap-[12px]">
                <span className="flex-1 text-[15px] font-semibold leading-[20px]">Do you know and trust the payee?</span>
                <AlertTriangle size={21} className="shrink-0 text-[var(--uc-orange-main)]" />
              </div>
              <p className="mt-[8px] text-[13px] leading-[19px] text-[var(--uc-text-muted)]">
                If you are unsure, check the recipient’s details before sending. Fraudsters can impersonate people and
                businesses.
              </p>
            </section>
          ) : null}
          {recipientRoute === 'sepa-eur' ? (
            <section className={cardClass}>
              <p className="text-[13px] font-semibold">Recipient verification required</p>
              <p className="mt-[6px] text-[12px] leading-[18px] text-[var(--uc-text-muted)]">
                The recipient name and IBAN will be checked by the bank before authorisation.
              </p>
            </section>
          ) : null}
          {recipientRoute === 'unavailable' ? (
            <section className={cardClass}>
              <p className="text-[13px] font-semibold">Foreign payment</p>
              <p className="mt-[6px] text-[12px] leading-[18px] text-[var(--uc-text-muted)]">
                Exchange rate, delivery and fees need a supported foreign payment service. This route cannot be
                authorised right now.
              </p>
            </section>
          ) : null}
          {isForeignRoute ? (
            <section className={cardClass}>
              <p className="text-[13px] font-semibold">International payment details</p>
              <p className="mt-[6px] text-[12px] leading-[18px] text-[var(--uc-text-muted)]">
                The receiving bank may request additional information before accepting this transfer.
              </p>
              <div className="mt-[14px] space-y-[10px] border-t border-[var(--uc-border-muted)] pt-[12px] text-[12px]">
                {recipientRoute === 'foreign-us' ? (
                  <div className="flex justify-between gap-[10px]"><span className="text-[var(--uc-text-muted)]">Bank details</span><span>{US_BANK_DETAILS_OPTIONS.find((option) => option.value === (draft.usBankDetailsMode ?? 'ach'))?.label}</span></div>
                ) : null}
                {draft.bankSwift ? <div className="flex justify-between gap-[10px]"><span className="text-[var(--uc-text-muted)]">SWIFT/BIC</span><span>{draft.bankSwift}</span></div> : null}
                {draft.routingNumber ? <div className="flex justify-between gap-[10px]"><span className="text-[var(--uc-text-muted)]">{draft.usBankDetailsMode === 'wire' ? 'Fedwire routing' : 'ACH routing'}</span><span>{draft.routingNumber}</span></div> : null}
                {draft.cnapsCode ? <div className="flex justify-between gap-[10px]"><span className="text-[var(--uc-text-muted)]">CNAPS</span><span>{draft.cnapsCode}</span></div> : null}
                <div className="flex justify-between gap-[10px]"><span className="shrink-0 text-[var(--uc-text-muted)]">Recipient address</span><span className="text-right">{[draft.recipientStreet, draft.recipientCity, draft.recipientRegion, draft.recipientPostalCode].filter(Boolean).join(', ')}</span></div>
                {draft.paymentPurpose ? <div className="flex justify-between gap-[10px]"><span className="text-[var(--uc-text-muted)]">Purpose</span><span>{CHINA_PAYMENT_PURPOSES.find((purpose) => purpose.code === draft.paymentPurpose)?.label ?? draft.paymentPurpose}</span></div> : null}
              </div>
            </section>
          ) : null}
          <section className={cardClass}>
            <div className="flex items-start gap-[12px]">
              <BeneficiaryAvatar draft={draft} homeCountry={country} size={38} />
              <div className="min-w-0 flex-1">
                <p className="break-words text-[17px] font-semibold leading-[21px]">{draft.beneficiaryName}</p>
                <p className="mt-[7px] break-all text-[12px] text-[var(--uc-text-muted)]">{account}</p>
                <p className="mt-[3px] text-[12px] text-[var(--uc-text-muted)]">
                  {bankName || `${countryName(draft.recipientCountry ?? country)} · ${draft.currency}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInfoOpen(true)}
                aria-label="Recipient information"
                className="text-[var(--uc-text-muted)]"
              >
                <Info size={19} />
              </button>
            </div>
          </section>
          <section className={`${cardClass} flex items-center justify-between gap-[10px]`}>
            <span className="text-[13px] text-[var(--uc-text-muted)]">From account</span>
            <span className="max-w-[58%] truncate text-right text-[13px] font-medium">{draft.payerAccountName}</span>
          </section>
          <section className={`${cardClass} flex items-center justify-between gap-[10px]`}>
            <span className="text-[13px] text-[var(--uc-text-muted)]">Payment date</span>
            <span className="text-right text-[13px] font-medium">
              {canUseInstantPayment && draft.instantPayment ? 'Instant' : dueDateDisplay(draft.dueDate)}
            </span>
          </section>
          <section className="overflow-hidden rounded-[20px] bg-[color-mix(in_srgb,var(--uc-text)_4%,var(--uc-surface))] px-[18px]">
            <button
              type="button"
              onClick={() => openEditor('reference')}
              className="flex w-full items-center justify-between gap-[10px] py-[16px] text-left"
            >
              <span className="min-w-0">
                <span className="block text-[13px] text-[var(--uc-text-muted)]">Reference for recipient</span>
                <span className="mt-[3px] block truncate text-[14px]">
                  {draft.informationForBeneficiary || 'Add a reference'}
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-[var(--uc-text-muted)]" />
            </button>
            <button
              type="button"
              onClick={() => openEditor('note')}
              className="flex w-full items-center justify-between gap-[10px] border-t border-[var(--uc-border-muted)] py-[16px] text-left"
            >
              <span className="min-w-0">
                <span className="block text-[13px] text-[var(--uc-text-muted)]">Note for me</span>
                <span className="mt-[3px] block truncate text-[14px]">
                  {draft.informationForMe || 'Add a private note'}
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-[var(--uc-text-muted)]" />
            </button>
          </section>
          <section className={cardClass}>
            {fxQuote ? (
              <>
                <div className="flex justify-between gap-[12px] text-[13px]">
                  <span className="text-[var(--uc-text-muted)]">Recipient gets</span>
                  <span className="font-medium">{formattedAmount}</span>
                </div>
                <div className="mt-[16px] flex justify-between gap-[12px] text-[14px] font-semibold">
                  <span>Estimated debit</span>
                  <span>{formatEvo2027Number(fxQuote.totalSourceAmount)} {fxQuote.sourceCurrency}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFxBreakdownOpen(true)}
                  className="mt-[14px] text-[12px] font-semibold text-[var(--uc-action-strong)]"
                >
                  View payment breakdown
                </button>
                <p className="mt-[8px] text-[11px] leading-[15px] text-[var(--uc-text-muted)]">
                  Indicative rate as of {formatFxReferenceDate(fxQuote.referenceDate)}. Final values are confirmed before payment.
                </p>
              </>
            ) : isForeignRoute || recipientRoute === 'unavailable' ? (
              <>
                <div className="flex justify-between gap-[12px] text-[14px] font-semibold">
                  <span>Payment amount</span>
                  <span>{formattedAmount}</span>
                </div>
                <p className="mt-[8px] text-[11px] leading-[15px] text-[var(--uc-text-muted)]">
                  Fees and delivery details require a bank quote.
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-between gap-[12px] text-[13px]">
                  <span className="text-[var(--uc-text-muted)]">Recipient gets</span>
                  <span className="font-medium">{formattedAmount}</span>
                </div>
                <div className="mt-[16px] flex justify-between gap-[12px] text-[13px]">
                  <span className="text-[var(--uc-text-muted)]">UniCredit fee</span>
                  <span className="text-right">See account tariff</span>
                </div>
                <div className="mt-[15px] border-t border-[var(--uc-border)] pt-[14px]">
                  <div className="flex justify-between gap-[12px] text-[14px] font-semibold">
                    <span>Payment amount</span>
                    <span>{formattedAmount}</span>
                  </div>
                  <p className="mt-[8px] text-[11px] leading-[15px] text-[var(--uc-text-muted)]">
                    Any applicable fee is determined by your account tariff.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
      <div className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[42px] pt-[10px]">
        {requiresBankQuote ? (
          <p className="mb-[9px] text-center text-[12px] text-[var(--uc-text-muted)]">
            A current bank quote is required before signing.
          </p>
        ) : null}
        <FlowButton disabled={!canContinueToSign} onClick={onSign}>
          Continue to sign
        </FlowButton>
      </div>
      {fxBreakdownOpen && fxQuote ? (
        <BottomSheet title="Payment breakdown" onClose={() => setFxBreakdownOpen(false)}>
          <PaymentFxBreakdownContent quote={fxQuote} />
        </BottomSheet>
      ) : null}
      {editField ? (
        <BottomSheet
          title={editField === 'reference' ? 'Reference for recipient' : 'Note for me'}
          onClose={() => setEditField(null)}
        >
          <div className="space-y-[18px] pb-[12px]">
            <FormField
              label={editField === 'reference' ? 'Reference for recipient' : 'Note for me (optional)'}
              value={editValue}
              onChange={setEditValue}
              placeholder={editField === 'reference' ? 'What is this payment for?' : 'Only you can see this note'}
            />
            <PrimaryButton onClick={saveEditor}>Save</PrimaryButton>
          </div>
        </BottomSheet>
      ) : null}
      {infoOpen ? (
        <BottomSheet title="Recipient details" onClose={() => setInfoOpen(false)}>
          <div className="space-y-[8px] pb-[20px] text-[13px]">
            <p>
              <strong>Name:</strong> {draft.beneficiaryName}
            </p>
            <p>
              <strong>Account:</strong> {account}
            </p>
            <p>
              <strong>Bank:</strong> {bankName}
            </p>
            <p>
              <strong>Country:</strong> {countryName(draft.recipientCountry ?? country)}
            </p>
            <p>
              <strong>Currency:</strong> {draft.currency}
            </p>
            {draft.recipientEmail ? (
              <p>
                <strong>Email:</strong> {draft.recipientEmail}
              </p>
            ) : null}
          </div>
        </BottomSheet>
      ) : null}
    </div>
  )
}
