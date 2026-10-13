import type { DomesticPaymentDraft } from '@/data/paymentFlow'
import type { PaymentTemplateSelection } from '@/data/paymentTemplates'
import type { Product } from '@/data/products'
import type { CountryId } from '@/app/state/demoTypes'
import { evaluatePaymentExpression } from '@/app/utils/paymentAmountCalculator'
import { getPaymentFxQuote } from '@/data/paymentFxQuote'
import {
  CHINA_PAYMENT_PURPOSES,
  isCountryCurrencySupported,
  isValidIban,
  isValidSwiftBic,
  isValidUsBankDetails,
  resolveRecipientRoute,
} from '@/data/paymentRecipientRules'

/** Exact Evo recipient/amount readiness; no additional local account checksum is imposed. */
export function getEvoPaymentReadiness({
  draft,
  payer,
  homeCountry = 'CZ',
  firstNames,
  lastName,
  countryChosen = true,
  currencyChosen = true,
  amountExpression = draft.amount,
}: {
  draft: DomesticPaymentDraft
  payer?: Product
  homeCountry?: CountryId
  firstNames?: string
  lastName?: string
  countryChosen?: boolean
  currencyChosen?: boolean
  amountExpression?: string
}) {
  const parts = draft.beneficiaryName.trim().split(/\s+/).filter(Boolean)
  const names = firstNames ?? (parts.length > 1 ? parts.slice(0, -1).join(' ') : (parts[0] ?? ''))
  const surname = lastName ?? (parts.length > 1 ? (parts.at(-1) ?? '') : '')
  const recipientCountry = draft.recipientCountry ?? homeCountry
  const route = resolveRecipientRoute(homeCountry, recipientCountry, draft.currency)
  const isForeignUs = route === 'foreign-us'
  const isForeignCn = route === 'foreign-cn'
  const isForeignRoute = isForeignUs || isForeignCn
  const isCzLocal = route === 'cz-domestic' && (draft.recipientAccountMode ?? 'local') === 'local'
  const nameValid =
    (draft.recipientKind ?? 'individual') === 'business'
      ? draft.beneficiaryName.trim().length >= 2
      : names.trim().length > 0 && surname.trim().length > 0
  const foreignAddressValid =
    (draft.recipientStreet?.trim().length ?? 0) >= 3 &&
    (draft.recipientCity?.trim().length ?? 0) >= 2 &&
    (draft.recipientRegion?.trim().length ?? 0) >= 2 &&
    (!isForeignUs || /^\d{5}(?:-?\d{4})?$/.test(draft.recipientPostalCode?.trim() ?? ''))
  const foreignBankValid =
    (draft.bankName?.trim().length ?? 0) >= 2 &&
    (isForeignUs
      ? isValidUsBankDetails(draft.usBankDetailsMode ?? 'ach', draft.routingNumber ?? '', draft.bankSwift ?? '')
      : isValidSwiftBic(draft.bankSwift ?? ''))
  const chinaPurposeValid = CHINA_PAYMENT_PURPOSES.some(
    (purpose) =>
      purpose.code === draft.paymentPurpose &&
      purpose.kinds.some((kind) => kind === (draft.recipientKind ?? 'individual')),
  )
  const recipientValid =
    nameValid &&
    countryChosen &&
    currencyChosen &&
    isCountryCurrencySupported(recipientCountry, draft.currency) &&
    Boolean(payer) &&
    (isForeignRoute
      ? /^[A-Z0-9]{4,34}$/.test(draft.accountNumber) &&
        foreignBankValid &&
        foreignAddressValid &&
        (!isForeignCn ||
          (chinaPurposeValid && (draft.currency !== 'CNY' || (draft.cnapsCode?.trim().length ?? 0) >= 8)))
      : isCzLocal
        ? /^\d{2,10}$/.test(draft.accountNumber) && /^\d{4}$/.test(draft.bankCode)
        : isValidIban(draft.accountNumber, recipientCountry)) &&
    (!draft.recipientEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.recipientEmail))
  const amount = evaluatePaymentExpression(amountExpression)
  const expressionComplete = Number.isFinite(amount)
  const fxRequired = Boolean(payer && payer.currency !== draft.currency)
  const canUseInstantPayment = !fxRequired && (route === 'cz-domestic' || route === 'ro-domestic')
  const fxQuote =
    fxRequired && expressionComplete && amount > 0 && payer
      ? getPaymentFxQuote({
          recipientAmount: amount,
          recipientCurrency: draft.currency,
          sourceCurrency: payer.currency,
        })
      : null
  const sourceDebitAmount = fxRequired ? fxQuote?.totalSourceAmount : amount
  const exceedsBalance = Boolean(payer && sourceDebitAmount !== undefined && sourceDebitAmount > payer.balance)
  const amountValid = expressionComplete && amount > 0 && !exceedsBalance && (!fxRequired || Boolean(fxQuote))
  const canContinueToSign = canContinueEvoPaymentToSign(route, fxRequired, Boolean(fxQuote))
  return {
    recipientValid,
    amountValid,
    canUseInstantPayment,
    amount,
    exceedsBalance,
    fxQuote,
    route,
    fxRequired,
    expressionComplete,
    canContinueToSign,
  }
}

export function canContinueEvoPaymentToSign(
  route: ReturnType<typeof resolveRecipientRoute>,
  fxRequired: boolean,
  hasFxQuote: boolean,
): boolean {
  return (route === 'cz-domestic' || route === 'ro-domestic') && (!fxRequired || hasFxQuote)
}

/** The saved-recipient editor uses the same syntax checks as the Source screen. */
export function isValidEvoBeneficiaryEdit({
  name,
  prefix,
  accountNumber,
  bankCode,
  recipientKind = 'individual',
  firstNames,
  lastName,
}: {
  name: string
  prefix: string
  accountNumber: string
  bankCode: string
  recipientKind?: 'individual' | 'business'
  firstNames?: string
  lastName?: string
}) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const names = firstNames ?? (parts.length > 1 ? parts.slice(0, -1).join(' ') : '')
  const surname = lastName ?? (parts.length > 1 ? (parts.at(-1) ?? '') : '')
  const validName =
    recipientKind === 'business' ? name.trim().length >= 2 : names.trim().length > 0 && surname.trim().length > 0
  return validName && /^\d{2,10}$/.test(accountNumber) && /^\d{4}$/.test(bankCode) && /^\d{0,6}$/.test(prefix)
}

export function isValidEvoPaymentTemplate(
  draft: Pick<PaymentTemplateSelection, 'title' | 'beneficiaryName' | 'accountNumber' | 'bankCode' | 'amount'>,
): boolean {
  return (
    draft.title.trim().length > 1 &&
    draft.beneficiaryName.trim().length > 1 &&
    draft.accountNumber.trim().length > 5 &&
    draft.bankCode.trim().length > 0 &&
    draft.amount.trim().length > 0
  )
}
