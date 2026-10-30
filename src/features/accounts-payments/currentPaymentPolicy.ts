import type { CountryId, ProductId, ReleaseId } from '@/app/state/demoTypes'
import type { DomesticPaymentDraft } from '@/data/paymentFlow'
import { isValidCzechPrefix, isValidCzechMainAccountNumber, isValidCzechBankCode } from '@/data/czechDomesticAccount'

/** Current baseline eligibility keeps Czech local parts separate from other markets' IBANs. */
export function isCurrentDomesticPaymentDraftValid(
  country: CountryId,
  release: ReleaseId,
  draft: Pick<DomesticPaymentDraft, 'beneficiaryName' | 'prefix' | 'accountNumber' | 'bankCode' | 'amount'>,
  product: ProductId = 'PI',
): boolean {
  const czechDomestic = product === 'PI' && country === 'CZ'
  const strictCzechBaseline = czechDomestic && release === 'release-current'
  const accountValid = czechDomestic
    ? (strictCzechBaseline || draft.prefix.trim().length > 0) &&
      draft.accountNumber.trim().length > 0 &&
      draft.bankCode.trim().length > 0 &&
      (!strictCzechBaseline ||
        (isValidCzechPrefix(draft.prefix.trim()) &&
          isValidCzechMainAccountNumber(draft.accountNumber.trim()) &&
          isValidCzechBankCode(draft.bankCode.trim())))
    : draft.accountNumber.trim().length > 0
  return draft.beneficiaryName.trim().length > 0 && accountValid && draft.amount.trim().length > 0
}
