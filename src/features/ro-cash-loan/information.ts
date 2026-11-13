import type { OnboardingInformationKind } from '@/features/ro-onboarding/information'

/** Credit-specific copy over the shared executable information sheets. */
export const CASH_LOAN_INFORMATION: Partial<Record<OnboardingInformationKind, { title: string; body: string }>> = {
  phone: {
    title: 'Numarul de telefon mobil',
    body: 'Va fi utilizat pentru activarea Mobile Banking, procesul de creditare, cont curent cu card de debit, activarea cardului, setarea parolelor pentru plăți, semnarea electronică a contractelor cu certificat calificat și comunicări de la UniCredit Bank/UniCredit Consumer Financing IFN SA.',
  },
  email: {
    title: 'Email-ul tau',
    body: 'La aceasta adresa vei primi comunicari din partea UniCredit Bank si Unicredit Consumer Financing IFN SA , inclusiv documentele pre-contractuale si celee contractuala semnate si extrasul lunar de cont curent',
  },
}
