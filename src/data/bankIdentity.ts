export type BankId = 'unicredit' | 'revolut' | 'kb' | 'cs' | 'raiffeisen' | 'moneta'

export interface BankBadge {
  id: BankId
  name: string
  /** Two characters at most: the badge is 18px across. */
  short: string
  /** Badge ground when no official file is present. */
  color: string
  /** Mark colour on that ground — a light ground needs a dark mark. */
  textColor: string
  /** Set when the app already ships the artwork in its own brand registry. */
  brandLogoId?: 'unicredit'
  /**
   * Share of the badge kept clear around the artwork, 0–1. Square marks need the
   * default or the round badge clips their corners; a tall, narrow glyph has no
   * corners to lose and can run nearly edge to edge.
   */
  logoInset?: number
}

/** Enough clearance for a square mark to sit inside the circle uncut. */
export const DEFAULT_BANK_LOGO_INSET = 0.14

export const BANK_BADGES: Record<BankId, BankBadge> = {
  unicredit: {
    id: 'unicredit',
    name: 'UniCredit Bank',
    short: 'UC',
    color: '#E2001A',
    textColor: '#FFFFFF',
    brandLogoId: 'unicredit',
  },
  revolut: { id: 'revolut', name: 'Revolut', short: 'R', color: '#0A0A0A', textColor: '#FFFFFF', logoInset: 0.2 },
  // The KB mark is a square block: it reads as an app icon filling the badge,
  // so it keeps no inset and lets the circle crop its corners.
  kb: { id: 'kb', name: 'Komerční banka', short: 'KB', color: '#8C1D40', textColor: '#FFFFFF', logoInset: 0 },
  cs: { id: 'cs', name: 'Česká spořitelna', short: 'ČS', color: '#2870ED', textColor: '#FFFFFF' },
  // Square yellow block, like KB: it fills the badge rather than floating in it.
  raiffeisen: {
    id: 'raiffeisen',
    name: 'Raiffeisenbank',
    short: 'RB',
    color: '#FFD500',
    textColor: '#000000',
    logoInset: 0.2,
  },
  // Tall, narrow glyph like Revolut's: no corners to clip, so it runs closer to the edge.
  moneta: {
    id: 'moneta',
    name: 'MONETA Money Bank',
    short: 'M',
    color: '#6E2585',
    textColor: '#FFFFFF',
    logoInset: 0.2,
  },
}
