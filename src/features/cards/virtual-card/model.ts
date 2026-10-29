import type { BankingScenarioId, CountryId } from '@/app/state/demoTypes'
import type { CurrentAccount, DebitCard } from '@/data/products'

export const VIRTUAL_CARD_DESIGNS = [
  { id: 'ferrari-evening', name: 'Ferrari Evening', group: 'FERRARI THEME' },
  { id: 'ferrari-mountain', name: 'Ferrari Mountain', group: 'FERRARI THEME' },
  { id: 'ferrari-racing', name: 'Ferrari Racing', group: 'FERRARI THEME' },
  { id: 'cat', name: 'Cat', group: 'HOBBIES' },
  { id: 'tennis', name: 'Tennis', group: 'HOBBIES' },
  { id: 'photography', name: 'Photography', group: 'HOBBIES' },
  { id: 'alpine-lake', name: 'Alpine Lake', group: 'NATURE' },
  { id: 'mediterranean', name: 'Mediterranean', group: 'NATURE' },
  { id: 'forest', name: 'Forest', group: 'NATURE' },
  { id: 'clean-green', name: 'Clean Green', group: 'CLASIC' },
  { id: 'blue', name: 'Blue', group: 'CLASIC' },
  { id: 'purple', name: 'Purple', group: 'CLASIC' },
] as const
export type VirtualCardDesign = (typeof VIRTUAL_CARD_DESIGNS)[number]['id']
export type VirtualCardTier = 'Standard' | 'Gold'
export function isDesignAvailable(design: VirtualCardDesign, tier: VirtualCardTier) {
  return VIRTUAL_CARD_DESIGNS.some(
    (item) => item.id === design && (tier === 'Standard' || item.group !== 'FERRARI THEME'),
  )
}
export type VirtualCardScope = { country: CountryId; bankingScenario: BankingScenarioId }
export interface VirtualCard extends DebitCard {
  design: VirtualCardDesign
  issuedOn: string
  virtual: true
}
export type VirtualCardState = Record<string, readonly VirtualCard[]>
const EMPTY: readonly VirtualCard[] = []
const key = (scope: VirtualCardScope) => `${scope.country}:${scope.bankingScenario}`
export const eligibleVirtualCardAccount = (account: CurrentAccount) =>
  account.currency === 'RON' || account.currency === 'EUR' || account.currency === 'USD'
export function readVirtualCards(state: VirtualCardState, scope: VirtualCardScope): readonly VirtualCard[] {
  return state[key(scope)] ?? EMPTY
}
export function issueVirtualCard(
  state: VirtualCardState,
  scope: VirtualCardScope,
  draft: {
    account: CurrentAccount
    design: VirtualCardDesign
    termsAccepted: boolean
    tier?: VirtualCardTier
    issuedOn?: string
  },
): VirtualCardState {
  const date = draft.issuedOn ?? new Date().toISOString().slice(0, 10)
  const cards = readVirtualCards(state, scope)
  if (
    scope.country !== 'RO' ||
    !draft.termsAccepted ||
    !eligibleVirtualCardAccount(draft.account) ||
    cards.filter((card) => card.issuedOn === date).length >= 2 ||
    !isDesignAvailable(draft.design, draft.tier ?? 'Standard')
  )
    return state
  const serial = cards.length + 1
  const lastFour = String(7000 + serial).padStart(4, '0')
  const card: VirtualCard = {
    id: `virtual-card-${serial}`,
    virtual: true,
    type: 'debit_card',
    name: 'Virtual card',
    cardType: draft.tier ?? 'Standard',
    cardNumber: `517312340000${lastFour}`,
    accountNumber: `517312340000${lastFour}`,
    expiryDate: '12/30',
    linkedAccountId: draft.account.id,
    balance: draft.account.balance,
    currency: draft.account.currency,
    design: draft.design,
    issuedOn: date,
  }
  return { ...state, [key(scope)]: [...cards, card] }
}
export function changeVirtualCardPicture(
  state: VirtualCardState,
  scope: VirtualCardScope,
  id: string,
  design: VirtualCardDesign,
): VirtualCardState {
  const cards = readVirtualCards(state, scope)
  const card = cards.find((item) => item.id === id)
  if (!card || !isDesignAvailable(design, card.cardType === 'Gold' ? 'Gold' : 'Standard')) return state
  return { ...state, [key(scope)]: cards.map((card) => (card.id === id ? { ...card, design } : card)) }
}
