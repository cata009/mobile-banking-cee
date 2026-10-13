import cards0 from '@/assets/mobile-first/it/products/cards-promo-0.png'
import cards1 from '@/assets/mobile-first/it/products/cards-promo-1.png'
import cards2 from '@/assets/mobile-first/it/products/cards-promo-2.png'
import cards3 from '@/assets/mobile-first/it/products/cards-promo-3.png'
import cards4 from '@/assets/mobile-first/it/products/cards-promo-4.png'
import loans0 from '@/assets/mobile-first/it/products/loans-promo-0.png'
import loans1 from '@/assets/mobile-first/it/products/loans-promo-1.png'
import loans2 from '@/assets/mobile-first/it/products/loans-promo-2.png'
import loans3 from '@/assets/mobile-first/it/products/loans-promo-3.png'
import loans4 from '@/assets/mobile-first/it/products/loans-promo-4.png'
import insurance0 from '@/assets/mobile-first/it/products/insurance-promo-0.png'
import insurance1 from '@/assets/mobile-first/it/products/insurance-promo-1.png'
import insurance2 from '@/assets/mobile-first/it/products/insurance-promo-2.png'
import insurance3 from '@/assets/mobile-first/it/products/insurance-promo-3.png'
import insurance4 from '@/assets/mobile-first/it/products/insurance-promo-4.png'

/** Exact category content and image crops from Figma 24251:94498 / 94525 / 94549. */
export const MOBILE_FIRST_TAB_CONTENT = {
  Carte: {
    heading: 'Le nostre carte',
    allLabel: 'TUTTE LE CARTE',
    products: [
      {
        title: 'UniCreditCard Flexia Classic',
        description: 'Per i piccoli e grandi acquisti di tutti i giorni',
        image: cards0,
        crop: { left: '-58.84%', width: '208.42%' },
      },
      {
        title: 'La carta amica dell’ambiente',
        description: 'Scegli Genius Card WWF e prenditi cura del mare',
        image: cards1,
        crop: { left: '-120.06%', width: '317.59%' },
      },
      {
        title: 'Carta di Debito: UniCredit MyOne',
        description: 'Immediatamente utilizzabile, ideale per il tuo shopping',
        image: cards2,
        crop: { left: '-465.15%', width: '622.73%' },
      },
      {
        title: 'UniCreditCard Click',
        description: 'La carta per i tuoi acquisti online e non solo',
        image: cards3,
        crop: { left: '-438.68%', width: '622.73%' },
      },
      {
        title: 'Genius Pay Minore',
        description: 'La carta riservata ai minori per le prime spese',
        image: cards4,
        crop: { left: '-444.74%', width: '622.73%', top: '-0.02%' },
      },
    ],
  },
  'Mutui e Prestiti': {
    heading: 'I nostri mutui e prestiti',
    allLabel: 'TUTTI I MUTUI E PRESTITI',
    products: [
      {
        title: 'Mutuo UniCredit - Finalità acquisto',
        description: 'Adesso posso dire davvero "casa mia"',
        image: loans0,
        crop: { left: '-85.47%', width: '208.41%' },
      },
      {
        title: 'Mutuo UniCredit Sostenibilità Energetica',
        description: 'La mia casa con la giusta classe',
        image: loans1,
        crop: { left: '-53.4%', width: '192.29%', height: '101.23%', top: '-1.23%' },
      },
      {
        title: 'UniCredit Ad Honorem',
        description: 'Scegli il conto che in più ti protegge',
        image: loans2,
        crop: { left: '-27%', width: '252.11%', height: '101.36%', top: '-1.36%' },
      },
      {
        title: 'I tuoi prestiti personali',
        description: 'Per chi vuole raccogliere i propri risparmi',
        image: loans3,
        crop: { left: '-26.89%', width: '191.53%', height: '99.71%', top: '0.15%' },
      },
      {
        title: 'Fondo Garanzia Casa',
        description: 'Scopri la filiale online 24/7',
        image: loans4,
        crop: { left: '-31.02%', width: '207.28%' },
      },
    ],
  },
  'Polizze assicurative': {
    heading: 'Le nostre polizze',
    allLabel: 'TUTTE LE POLIZZE',
    products: [
      {
        title: 'UniCredit My Care Futuro',
        description: 'Progetta la tua casa con noi',
        image: insurance0,
        crop: { left: '-80.61%', width: '212.18%', height: '102.04%', top: '-2.04%' },
      },
      {
        title: 'UniCredit My Care Famiglia',
        description: 'Vivi la tua famiglia al sicuro',
        image: insurance1,
        crop: { objectFit: 'cover' as const },
      },
      {
        title: 'UniCredit Allianz My Care Salute',
        description: 'La mia salute è un patrimonio da proteggere',
        image: insurance2,
        crop: { objectFit: 'cover' as const },
      },
      {
        title: 'Guida Protetta Auto',
        description: 'Una sicurezza in più',
        image: insurance3,
        crop: { left: '-63.94%', width: '217.7%' },
      },
      {
        title: 'Guida Protetta Moto',
        description: 'Una sicurezza in più',
        image: insurance4,
        crop: { left: '-57.47%', width: '208.41%', top: '0.06%' },
      },
    ],
  },
} as const

export type MobileFirstProductCategory = keyof typeof MOBILE_FIRST_TAB_CONTENT
