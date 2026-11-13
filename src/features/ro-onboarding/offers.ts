export type OnboardingOffer = 'optim' | 'star' | 'premium' | 'prime'
export function employerHasOnboardingConvention(employer: string): boolean {
  return ['carrefour', 'carrefour romania', 'depozitul srl'].includes(employer.trim().toLocaleLowerCase())
}
export const OFFER_ACCOUNTS: Record<OnboardingOffer, readonly string[]> = {
  optim: ['lei', 'eur'],
  star: ['lei', 'eur', 'usd'],
  premium: ['lei', 'eur', 'usd'],
  prime: ['lei', 'additionalLei', 'eur', 'usd'],
}
export function changeOnboardingOffer(
  offer: OnboardingOffer,
  checks: Record<string, boolean>,
): Record<string, boolean> {
  const next: Record<string, boolean> = {
    ...checks,
    terms: false,
    documentRead: false,
    contract: false,
    transsped: false,
  }
  for (const key of ['lei', 'additionalLei', 'eur', 'usd']) if (!OFFER_ACCOUNTS[offer].includes(key)) next[key] = false
  return next
}
export function offerHasSelectedAccount(offer: OnboardingOffer, checks: Record<string, boolean>): boolean {
  return OFFER_ACCOUNTS[offer].some((key) => checks[key])
}
export const OFFER_COPY = {
  optim: {
    title: 'OPTIM',
    slogan: 'Azi vrei sa fie simplu.\nSi simplu e!',
    card: '1 Card de debit Mastercard Standard\nPana la 5 carduri de debit virtuale Mastercard Standard',
    income: 'min. 1.500 Lei',
    savings: 'min. 50.000 Lei (echivalent in valuta)',
    fallback: 'Optim',
  },
  star: {
    title: 'STAR+',
    slogan: 'Azi vrei sa fie despre tine\nSi despre tine e!',
    card: '3 Carduri de debit Mastercard Standard principale sau 2 carduri de debit fizice principale Mastercard Standard + 1 card fizic principal Mastercard Gold si a unui card suplimentar Mastercard Standard.\nPana la 5 carduri de debit virtuale Mastercard Standard',
    income: 'min. 3.000 Lei',
    savings: '',
    fallback: 'Star+',
  },
  premium: {
    title: 'PREMIUM',
    slogan: 'Azi vrei ca totul sa fie posibil.\nSi asa este!',
    card: '1 Card de debit la alegere: Mastercard Platinum sau Mastercard Gold fizic sau virtual\n1 card de debit fizic Mastercard Standard\n1 card suplimentar la alegere: Mastercard Platinum sau Mastercard Gold sau Mastercard Standard\nPana la 5 carduri de debit virtuale Mastercard Standard',
    income: 'min. 10.000 Lei',
    savings: 'min. 250.000 Lei (echivalent in valuta)',
    fallback: 'Premium',
  },
  prime: {
    title: 'PRIME',
    slogan: 'mai mult control, zero griji,\nzero comision',
    card: 'Un card fizic Mastercard Platinum și un card fizic Mastercard Standard, pentru flexibilitate maximă, acasă și în străinătate',
    income: 'min. 10.000 Lei',
    savings: 'min. 250.000 Lei (echivalent in valuta)',
    fallback: 'Premium',
  },
} as const
