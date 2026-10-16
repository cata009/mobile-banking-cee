import type { CountryId, ProductId, ReleaseId } from '@/app/state/demoTypes'
import type { DomesticPaymentDraft } from '@/data/paymentFlow'
import { isValidCzechPrefix, isValidCzechMainAccountNumber, isValidCzechBankCode } from '@/data/czechDomesticAccount'

/** Source current form eligibility, shared without changing its legacy field rules. */
export function isCurrentDomesticPaymentDraftValid(
  country: CountryId,
  release: ReleaseId,
  draft: Pick<DomesticPaymentDraft, 'beneficiaryName' | 'prefix' | 'accountNumber' | 'bankCode' | 'amount'>,
  product: ProductId = 'PI',
): boolean {
  const czBaseline = product === 'PI' && country === 'CZ' && release === 'release-current'
  return (
    draft.beneficiaryName.trim().length > 0 &&
    (czBaseline || draft.prefix.trim().length > 0) &&
    draft.accountNumber.trim().length > 0 &&
    draft.bankCode.trim().length > 0 &&
    (!czBaseline ||
      (isValidCzechPrefix(draft.prefix.trim()) &&
        isValidCzechMainAccountNumber(draft.accountNumber.trim()) &&
        isValidCzechBankCode(draft.bankCode.trim()))) &&
    draft.amount.trim().length > 0
  )
}
