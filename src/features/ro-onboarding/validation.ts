import { canContinueCardPage, validBankPassword } from './cards'
import { validAddress } from './identity'
import { offerHasSelectedAccount, type OnboardingOffer } from './offers'
import { questionnaireComplete, transactionsComplete, validTransactionDetails } from './questionnaire'
export function validOnboardingPhone(value: string): boolean {
  return /^7\d{8}$/.test(value)
}
export function validOnboardingEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
export function onboardingValidation(
  step: string,
  values: Record<string, string>,
  checks: Record<string, boolean>,
  offer: OnboardingOffer,
  code: string,
  editingTransactions = false,
): string {
  if (editingTransactions) return validTransactionDetails(values) ? '' : 'Completează numărul și volumul tranzacțiilor.'
  switch (step) {
    case 'employment':
      return values.employment ? '' : 'Select your employment status.'
    case 'products':
      return offerHasSelectedAccount(offer, checks) && checks.terms
        ? ''
        : 'Selectează cel puțin un cont și acceptă anexa.'
    case 'privacy':
      return checks.privacy ? '' : 'Confirmă că ai citit documentele.'
    case 'identity':
      return checks.identification ? '' : 'Confirmă acordul pentru identificare.'
    case 'email-verified':
      return checks.studyPeriod ? '' : 'Confirmă opțiunea pentru termenul de studiu.'
    case 'address':
      return validAddress(values, !!checks.sameAddress) ? '' : 'Completează adresa și codul poștal.'
    case 'additional':
      return questionnaireComplete(values) ? '' : 'Completează sursa fondurilor și scopul relației cu banca.'
    case 'transactions':
      return transactionsComplete(values, !!checks.financial)
        ? ''
        : 'Completează tranzacțiile și confirmă corectitudinea datelor.'
    case 'phone':
      return validOnboardingPhone(values.phone || '') ? '' : 'Numărul nu este valid, te rugăm să reîncerci'
    case 'email':
      return validOnboardingEmail(values.email || '') ? '' : 'Numărul nu este valid, te rugăm să reîncerci'
    case 'selfie':
      return checks.biometrics ? '' : 'Acordul pentru prelucrarea datelor biometrice este necesar.'
    case 'cards':
      return canContinueCardPage(offer, values, checks) ? '' : 'Completează selecția cardului.'
    case 'delivery':
      return validBankPassword(values, !!(checks.physical || (offer === 'prime' && checks.platinum)))
        ? ''
        : 'Completează adresa de livrare și confirmă parola.'
    case 'contract':
      return checks.documentRead && checks.contract && checks.transsped
        ? ''
        : 'Citește documentația și confirmă acordurile.'
    case 'phone-code':
    case 'email-code':
    case 'signature':
      return /^\d{6}$/.test(code) ? '' : 'Introdu codul de verificare.'
    default:
      return ''
  }
}
