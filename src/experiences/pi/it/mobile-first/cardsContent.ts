import {
  getCardLedgerMovements,
  getCardLedgerRecord,
  type CardKind,
  type CardStatus,
  type CardMovement,
} from '@/features/cards/mobileFirstCards'

export interface ItalyCard {
  id: string
  name: string
  holder: string
  nickname?: string
  lastFour: string
  kind: CardKind
  status: CardStatus
  spending: number
  available: number
  limit: number
  favorite: boolean
  owner: 'mine' | 'minor' | 'other'
  expiry: string
  premium?: boolean
  settings?: Record<string, string[]>
  repayment?: string
  plans?: { total: number; months: number; ids?: string[] }[]
  balance?: number
  debt?: number
  wallet?: string
}
export interface ItalyCardsSnapshot {
  cards: ItalyCard[]
  movements: Record<string, ItalyCardMovement[]>
}
const CARD_IDENTITIES: readonly Omit<ItalyCard, 'spending' | 'available' | 'limit' | 'balance' | 'debt'>[] = [
  {
    id: 'flexia',
    name: 'UniCredit Flexia Classic',
    holder: 'Andrea Rossini',
    lastFour: '5678',
    kind: 'credit',
    status: 'active',
    favorite: true,
    owner: 'mine',
    expiry: '04/2027',
  },
  {
    id: 'my-one',
    name: 'UniCredit My One',
    holder: 'Andrea Rossini',
    lastFour: '5678',
    kind: 'debit',
    status: 'active',
    favorite: true,
    owner: 'mine',
    expiry: '04/2027',
  },
  {
    id: 'etica',
    name: 'UniCredit Flexia Etica',
    holder: 'Flavia Bianchini',
    lastFour: '5656',
    kind: 'credit',
    status: 'renewing',
    favorite: false,
    owner: 'other',
    expiry: '04/2027',
  },
  {
    id: 'genius',
    name: 'UniCredit Genius Card',
    holder: 'Andrea Rossini',
    lastFour: '7878',
    kind: 'prepaid',
    status: 'active',
    favorite: false,
    owner: 'mine',
    expiry: '04/2027',
  },
  {
    id: 'minor',
    name: 'UniCredit My One',
    holder: 'Sofia Rossini',
    lastFour: '1234',
    kind: 'debit',
    status: 'active',
    favorite: false,
    owner: 'minor',
    expiry: '04/2027',
  },
  {
    id: 'suspended',
    name: 'UniCredit Flexia Classic',
    holder: 'Andrea Rossini',
    lastFour: '4040',
    kind: 'credit',
    status: 'suspended',
    favorite: false,
    owner: 'mine',
    expiry: '04/2027',
  },
  {
    id: 'blocked',
    name: 'UniCredit Genius Card',
    holder: 'Andrea Rossini',
    lastFour: '6688',
    kind: 'prepaid',
    status: 'blocked',
    favorite: false,
    owner: 'mine',
    expiry: '04/2027',
  },
  {
    id: 'delivered',
    name: 'UniCredit My One',
    holder: 'Andrea Rossini',
    lastFour: '8899',
    kind: 'debit',
    status: 'delivered',
    favorite: false,
    owner: 'mine',
    expiry: '04/2029',
  },
]
export const ITALY_CARDS: readonly ItalyCard[] = CARD_IDENTITIES.map((card) => getCardLedgerRecord(card))
export interface ItalyCardMovement extends CardMovement {
  eventId?: string
  kind?: string
  bookedOn?: string
  day: string
  icon: 'utilities' | 'taxes' | 'other' | 'income'
  note?: string
  excluded?: boolean
  subcategory?: string
  splits?: number[]
  splitCategories?: { category: string; amount: number }[]
}
export const CARD_MOVEMENTS: readonly ItalyCardMovement[] = getCardLedgerMovements('flexia')
export const RATE_MOVEMENTS = CARD_MOVEMENTS.filter(
  (row) => row.kind === 'purchase' && row.status === 'settled' && row.amount < 0,
)
export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  active: 'Attiva',
  suspended: 'Sospesa',
  blocked: 'Bloccata',
  delivered: 'Da attivare',
  shipping: 'In spedizione',
  renewing: 'In rinnovo',
}
export const CARD_PROBLEMS = [
  [
    'suspend',
    'Voglio sospendere temporaneamente la carta',
    'Sospendi la carta rendendola temporaneamente non utilizzabile. Puoi riattivarla quando vuoi.',
  ],
  ['lost', 'Ho perso la carta', 'Blocca la carta definitivamente così nessuno potrà utilizzarla.'],
  [
    'stolen',
    'Mi hanno rubato la carta',
    'Blocca la carta definitivamente per impedire a chi te l’ha rubata di utilizzarla.',
  ],
  [
    'fraud',
    'Qualcuno sta usando la mia carta',
    'Se temi che un estraneo stia usando la tua carta, bloccala definitivamente.',
  ],
  [
    'broken',
    'La carta non funziona',
    'Richiedi una nuova carta identica alla tua. Ricordati di distruggere quella attuale tagliandola.',
  ],
] as const
