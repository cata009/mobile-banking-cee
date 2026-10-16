import logoPaths from '@/imports/svg-pn3y56bdut'

export const CARD_SOURCE = {
  schema: 'figma-meniga-harmonization-icons/v1',
  figmaComponentName: 'Card',
  sourceNodeIds: {
    mcDebitGoldSmall: '3039:30713',
    mcCreditPremiumGold: '3039:7485',
    mcCreditPartnerStandard: '3039:8064',
    mcDebitStandard: '4161:9198',
    mcVirtualStandardViolet: '3039:12315',
    mcVirtualStandardOrange: '3039:12380',
  },
  width: 64,
  height: 40,
  cornerRadius: 4,
} as const

export type CardVariant =
  | 'mc-debit-gold'
  | 'mc-credit-premium-gold'
  | 'mc-credit-partner-standard'
  | 'mc-debit-standard'
  | 'mc-virtual-standard-violet'
  | 'mc-virtual-standard-orange'

export type CardSize = 'figma' | 'medium' | 'large'

export type CardTone = {
  label: string
  network: string
  typeLabel: 'debit' | 'credit'
  sourceNodeId: string
  background: string
  backgroundEnd?: string
  pattern: string
  patternEnd?: string
  logoText: string
  brandMark: string
  labelColor: string
  mastercardStroke: string
  mastercardRed: string
  mastercardYellow: string
  mastercardCenter: string
  shadowOpacity?: number
}

export const CARD_VARIANTS: Record<CardVariant, CardTone> = {
  'mc-debit-gold': {
    label: 'MC Debit Gold',
    network: 'Mastercard',
    typeLabel: 'debit',
    sourceNodeId: CARD_SOURCE.sourceNodeIds.mcDebitGoldSmall,
    background: '#F9F9FA',
    pattern: '#B1A06F',
    patternEnd: '#D9D1BD',
    logoText: '#111111',
    brandMark: '#E30613',
    labelColor: '#8E8E8E',
    mastercardStroke: 'transparent',
    mastercardRed: '#EB001B',
    mastercardYellow: '#F79E1B',
    mastercardCenter: '#FF5F00',
  },
  'mc-credit-premium-gold': {
    label: 'MC Credit Premium Gold',
    network: 'Mastercard',
    typeLabel: 'credit',
    sourceNodeId: CARD_SOURCE.sourceNodeIds.mcCreditPremiumGold,
    background: '#CF0612',
    backgroundEnd: '#7C0F0D',
    pattern: '#B1A06F',
    patternEnd: '#D9D1BD',
    logoText: '#FFFFFF',
    brandMark: '#E30613',
    labelColor: '#FFFFFF',
    mastercardStroke: '#FFFFFF',
    mastercardRed: '#EB001B',
    mastercardYellow: '#F79E1B',
    mastercardCenter: '#FF5F00',
    shadowOpacity: 0.16,
  },
  'mc-credit-partner-standard': {
    label: 'MC Credit Partner Standard',
    network: 'Mastercard',
    typeLabel: 'credit',
    sourceNodeId: CARD_SOURCE.sourceNodeIds.mcCreditPartnerStandard,
    background: '#CF0612',
    backgroundEnd: '#7C0F0D',
    pattern: '#E30613',
    patternEnd: '#B80E19',
    logoText: '#FFFFFF',
    brandMark: '#E30613',
    labelColor: '#FFFFFF',
    mastercardStroke: '#FFFFFF',
    mastercardRed: '#EB001B',
    mastercardYellow: '#F79E1B',
    mastercardCenter: '#FF5F00',
    shadowOpacity: 0.16,
  },
  'mc-debit-standard': {
    label: 'MC Debit Standard',
    network: 'Mastercard',
    typeLabel: 'debit',
    sourceNodeId: CARD_SOURCE.sourceNodeIds.mcDebitStandard,
    background: '#F9F9FA',
    pattern: '#E30613',
    logoText: '#111111',
    brandMark: '#E30613',
    labelColor: '#8E8E8E',
    mastercardStroke: 'transparent',
    mastercardRed: '#EB001B',
    mastercardYellow: '#F79E1B',
    mastercardCenter: '#FF5F00',
  },
  'mc-virtual-standard-violet': {
    label: 'MC Virtual Standard Electric Violet',
    network: 'Mastercard',
    typeLabel: 'debit',
    sourceNodeId: CARD_SOURCE.sourceNodeIds.mcVirtualStandardViolet,
    background: '#772B8B',
    pattern: '#AD80B9',
    logoText: '#FFFFFF',
    brandMark: '#E30613',
    labelColor: '#FFFFFF',
    mastercardStroke: 'transparent',
    mastercardRed: '#EB001B',
    mastercardYellow: '#F79E1B',
    mastercardCenter: '#FF5F00',
    shadowOpacity: 0.1,
  },
  'mc-virtual-standard-orange': {
    label: 'MC Virtual Standard Vibrant Orange',
    network: 'Mastercard',
    typeLabel: 'debit',
    sourceNodeId: CARD_SOURCE.sourceNodeIds.mcVirtualStandardOrange,
    background: '#F78F20',
    pattern: '#FABC79',
    logoText: '#FFFFFF',
    brandMark: '#E30613',
    labelColor: '#FFFFFF',
    mastercardStroke: '#FFFFFF',
    mastercardRed: '#EB001B',
    mastercardYellow: '#F79E1B',
    mastercardCenter: '#FF5F00',
    shadowOpacity: 0.1,
  },
}

export const CARD_SIZES: Record<CardSize, { width: number; height: number }> = {
  figma: { width: 64, height: 40 },
  medium: { width: 96, height: 60 },
  large: { width: 160, height: 100 },
}

export const CARD_ARTWORK = {
  arrowPath:
    'M10.3 0 31.4 20 10.3 40c-2.4-2.7-3-6.2-1.6-9.7.45-1.1 1.2-2.05 2.05-2.9L18.6 20l-7.85-7.4C9.9 11.8 9.15 10.8 8.7 9.7 7.3 6.2 7.9 2.7 10.3 0Z',
  edgeArrowPath: 'M-10 4 6.3 20-10 36v-9.8L-3.7 20-10 13.8V4Z',
  detailPath: 'M10.3 0 31.4 20 10.3 40',
  networkCenterPath: 'M6.6.82a4.1 4.1 0 0 1 0 6.56 4.1 4.1 0 0 1 0-6.56Z',
  logoPaths,
  logoTransform: 'translate(42.15 2.05) scale(0.14013533274077472)',
  networkTransform: 'translate(47.7 9.1)',
} as const
export function resolveCardArtwork({
  variant = 'mc-debit-gold',
  size = 'figma',
}: { variant?: CardVariant; size?: CardSize } = {}) {
  const tone = CARD_VARIANTS[variant],
    dimensions = CARD_SIZES[size]
  return {
    variant,
    size,
    tone,
    ...dimensions,
    radius: (dimensions.width / CARD_SOURCE.width) * CARD_SOURCE.cornerRadius,
    viewBox: '0 0 64 40',
    firstArrowOpacity: tone.shadowOpacity ? 0.96 : 1,
    secondArrowOpacity: tone.shadowOpacity ? 0.88 : 1,
  } as const
}
