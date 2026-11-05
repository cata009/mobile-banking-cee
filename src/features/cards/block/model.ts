export type BlockedCards = Readonly<Record<string, boolean>>
const key = (country: string, cardId: string) => `${country}:${cardId}`
export function isCardBlocked(state: BlockedCards, country: string, cardId: string) {
  return state[key(country, cardId)] === true
}
export function setCardBlocked(state: BlockedCards, country: string, cardId: string, blocked: boolean): BlockedCards {
  return { ...state, [key(country, cardId)]: blocked }
}
