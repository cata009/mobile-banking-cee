export interface DisposableCard {
  id: string
  pan: string
  securityCode: string
  createdAt: string
  expiresAt: string
  closed: boolean
  consumedAt?: string
  parent: { id: string; type: string; holder: string }
}

const VALIDITY_MS = 30 * 24 * 60 * 60 * 1000
const MAX_ACTIVE_CARDS = 3

export function activeDisposableCards(cards: DisposableCard[], now: Date): DisposableCard[] {
  return cards.filter((card) => !card.closed && !card.consumedAt && new Date(card.expiresAt).getTime() > now.getTime())
}

export function createDisposableCard(
  cards: DisposableCard[],
  now: Date,
  parent: DisposableCard['parent'],
): DisposableCard | undefined {
  if (activeDisposableCards(cards, now).length >= MAX_ACTIVE_CARDS) return undefined
  const sequence = cards.length + 1
  const base = `539210764411${String(sequence).padStart(3, '0')}`
  const sum = [...base].reverse().reduce((total, digit, index) => {
    const value = Number(digit) * (index % 2 === 0 ? 2 : 1)
    return total + (value > 9 ? value - 9 : value)
  }, 0)
  const pan = `${base}${(10 - (sum % 10)) % 10}`.replace(/(.{4})(?=.)/g, '$1 ')
  return {
    id: `disposable-${sequence}`,
    pan,
    securityCode: String((481 + sequence) % 1000).padStart(3, '0'),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + VALIDITY_MS).toISOString(),
    closed: false,
    parent,
  }
}

export function closeDisposableCard(cards: DisposableCard[], id: string): DisposableCard[] {
  return cards.map((card) => (card.id === id ? { ...card, closed: true } : card))
}

/** Only a successful payment consumes an active single-use card. */
export function recordDisposableCardPayment(
  cards: DisposableCard[],
  id: string,
  outcome: 'successful' | 'declined',
  now: Date,
): DisposableCard[] {
  if (outcome !== 'successful') return cards
  return cards.map((card) =>
    card.id === id && !card.closed && !card.consumedAt && new Date(card.expiresAt).getTime() > now.getTime()
      ? { ...card, consumedAt: now.toISOString() }
      : card,
  )
}
