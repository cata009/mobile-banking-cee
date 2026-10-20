/** Shipped marketing geometry. Feature models own labels, offers, images and banner tones. */
export type MarketingCardVariant = 'standard' | 'compact'
export const SHOPSMART_GIFT_PATH =
  'M3 7h10v7H3V7Zm4.35 0h1.3v7h-1.3V7ZM2 4.75A1.75 1.75 0 0 1 3.75 3H5.1A2.2 2.2 0 0 1 8 1.05 2.2 2.2 0 0 1 10.9 3h1.35A1.75 1.75 0 0 1 14 4.75V6H2V4.75ZM5.1 4.3H3.75a.45.45 0 0 0-.45.45v.05h3.2A1.4 1.4 0 0 0 5.1 4.3Zm2.25.5V3.25A.95.95 0 1 0 6.4 4.2c.34.3.73.49.95.6Zm1.3 0c.22-.11.61-.3.95-.6a.95.95 0 1 0-.95-.95V4.8Zm.85 0h3.2v-.05a.45.45 0 0 0-.45-.45H10.9a1.4 1.4 0 0 0-1.4.5Z'
export const PRODUCT_OFFER_CHEVRON_PATH =
  'M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z'
const menuImages = {
  account: {
    standard: { bottom: -2, right: 0, height: 92, width: 72 },
    compact: { bottom: -2, right: 0, height: 60, width: 48 },
  },
  cards: {
    standard: { bottom: 0, right: 0, height: 70, width: 78 },
    compact: { bottom: 0, right: 0, height: 48, width: 64 },
  },
  'mortgages-loans': {
    standard: { bottom: 0, right: 0, height: 74, width: 78 },
    compact: { bottom: 0, right: 0, height: 48, width: 56 },
  },
  insurance: {
    standard: { bottom: -2, right: -2, height: 76, width: 72 },
    compact: { bottom: -2, right: -2, height: 50, width: 54 },
  },
  'investments-savings': {
    standard: { bottom: -2, right: 0, height: 100, width: 58 },
    compact: { bottom: -2, right: 0, height: 66, width: 44 },
  },
  'market-hedging': {
    standard: { bottom: -1, right: 0, height: 74, width: 76 },
    compact: { bottom: -1, right: 0, height: 50, width: 58 },
  },
  shopsmart: {
    standard: { bottom: -1, right: 0, height: 74, width: 74 },
    compact: { bottom: -1, right: 0, height: 50, width: 58 },
  },
  'partner-offers': {
    standard: { bottom: -1, right: 0, height: 78, width: 70 },
    compact: { bottom: -1, right: 0, height: 52, width: 56 },
  },
} as const
export function resolveProductMenuCard({
  id,
  variant = 'standard',
  badgeCount,
}: {
  id: string
  variant?: MarketingCardVariant
  badgeCount?: number
}) {
  const compact = variant === 'compact'
  const image =
    menuImages[id as keyof typeof menuImages]?.[variant] ??
    (compact ? { bottom: 0, right: 0, height: 50, width: 58 } : { bottom: 0, right: 0, height: 74, width: 78 })
  return {
    variant,
    compact,
    height: compact ? 72 : 120,
    padding: compact ? 12 : 16,
    radius: 8,
    gap: 10,
    titleFontSize: compact ? 16 : 18,
    titleFontWeight: 700,
    titleLineHeight: 'normal',
    image,
    badgeText: typeof badgeCount === 'number' && badgeCount > 0 ? (badgeCount > 99 ? '99+' : badgeCount) : null,
  } as const
}
export function resolveProductOfferCard({
  variant = 'standard',
  caption,
}: {
  variant?: MarketingCardVariant
  caption?: string
}) {
  const compact = variant === 'compact'
  return {
    variant,
    compact,
    width: 327,
    height: 157,
    radius: 8,
    imageWidth: 96,
    imageFit: 'cover',
    imagePosition: 'center',
    titleFontSize: compact ? 20 : 24,
    titleLineHeight: compact ? 22 : 26,
    titleLines: 2,
    descriptionFontSize: compact ? 16 : 18,
    descriptionLineHeight: compact ? 18 : 20,
    descriptionLines: 3,
    textLineHeight: 'normal',
    captionFontSize: 14,
    captionLineHeight: compact ? 15 : undefined,
    showCaption: compact && Boolean(caption),
    paddingLeft: 16,
    paddingRight: 100,
    paddingTop: 16,
    paddingBottom: compact ? 12 : 16,
    contentAlign: 'flex-start',
    gap: 8,
    chevron: { width: 161, height: 157, left: -14, viewBox: '0 0 161 157', path: PRODUCT_OFFER_CHEVRON_PATH },
  } as const
}
export function resolveShopsmartOfferCard({
  interactive = false,
  imageHeight = 130,
  variant = 'default',
  trailingIcon = 'website',
  pillTone = 'teal',
}: {
  interactive?: boolean
  imageHeight?: 130 | 143
  variant?: 'default' | 'partner'
  trailingIcon?: 'website' | 'partners'
  pillTone?: 'teal' | 'white'
}) {
  return {
    variant,
    rootTag: interactive ? 'button' : 'article',
    imageHeight,
    imageFit: 'cover',
    width: '100%',
    radius: 8,
    borderWidth: 0,
    titleFontSize: variant === 'partner' ? 20 : 18,
    titleLineHeight: variant === 'partner' ? 24 : 23,
    titleLetterSpacing: 0.42,
    merchantFontSize: 14,
    merchantLineHeight: 20,
    merchantLetterSpacing: 0.3,
    bodyGap: 16,
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 13,
    icon: trailingIcon === 'website' ? 'contact-website' : 'shopsmart-store',
    iconSize: 24,
    iconSlotSize: 32,
    tagColor: variant === 'partner' ? '#DD1860' : '#F0871D',
    pillTone,
    pillWidth: 120,
    pillHeight: 36,
    pillRadius: 18,
    pillTop: 112,
    pillRight: 7,
    statusFontSize: 14,
    statusLineHeight: 16,
    statusLetterSpacing: 1,
  } as const
}
