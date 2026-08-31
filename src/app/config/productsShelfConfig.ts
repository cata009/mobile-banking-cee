import type { ProductsCardId } from "@/app/config/productsMenuConfig";

/**
 * Evo 2027 Products shelf (Figma "2027 - transformation 11", node 24042:10990).
 *
 * The shelf is deliberately static: every product the bank sells in a category
 * is listed, in a fixed order, for every customer. Business-configurable
 * campaign rails live on the home screen, not here.
 *
 * `cardId` + `id` are the legacy `ProductsCard.id` / `ProductCardSheetOption.id`
 * pair, so a shelf card opens the existing ProductDetailScreen content and
 * illustration without duplicating any of it.
 *
 * **Photography rules.** Every image below is used exactly once, and none of
 * them appears anywhere else in the app — Products must not look like a reprint
 * of the home screen. Hero photography is a separate set again: the status bar
 * and dynamic island sit over the hero, so those frames are landscapes,
 * interiors or low-set subjects that no crop can behead.
 */

// Hero only.
import heroLivingRoom from "@/assets/products/shelf/hero-living-room.png";
import heroHomeCover from "@/assets/products/shelf/hero-home-cover.png";
import heroSunriseHills from "@/assets/products/shelf/hero-sunrise-hills.png";
import heroHouseDusk from "@/assets/products/shelf/hero-house-dusk.png";
// Product cards only, one photo per product.
import savingsDesk from "@/assets/products/shelf/savings-desk.png";
import savingsBedroom from "@/assets/products/shelf/savings-bedroom.png";
import adviceTable from "@/assets/products/shelf/shelf-advice-table.png";
import creditsStreet from "@/assets/products/shelf/credits-street.png";
import creditsCouple from "@/assets/products/shelf/credits-couple.png";
import shopCounter from "@/assets/products/shelf/shelf-shop-counter.png";
import insuranceTablet from "@/assets/products/shelf/insurance-tablet.png";
import travelKit from "@/assets/products/shelf/shelf-travel-kit.png";
import cityStreet from "@/assets/products/shelf/shelf-city-street.png";
import familySunset from "@/assets/products/shelf/shelf-family-sunset.png";
import accountsSky from "@/assets/products/shelf/accounts-sky.png";
import marketProduce from "@/assets/products/shelf/shelf-market-produce.png";
import cardsShopper from "@/assets/products/shelf/cards-shopper.png";
import onlineCard from "@/assets/products/shelf/shelf-online-card.png";
// Partner-programme tiles.
import partnerShopsmartV2 from "@/assets/products/shelf/partner-shopsmart-v2.png";
import partnerOffersV2 from "@/assets/products/shelf/partner-offers-v2.png";

export type ProductShelfCategoryId =
  | "savings-investments"
  | "credits"
  | "insurances"
  | "accounts-cards";

export interface ProductShelfItem {
  /** Matches ProductCardSheetOption.id so the existing product detail resolves. */
  id: string;
  /** Legacy products-menu card that owns this option. */
  cardId: ProductsCardId;
  /** Product name shown as the tag over the image — keeps the benefit copy identifiable. */
  productName: string;
  /** Benefit-led headline. */
  title: string;
  /** Single supporting line. */
  body: string;
  image: string;
  /** CSS object-position, derived from the Figma image crop. */
  imagePosition: string;
}

export interface ProductShelfCategory {
  id: ProductShelfCategoryId;
  title: string;
  items: readonly ProductShelfItem[];
}

export interface ProductShelfHeroSlide {
  id: string;
  title: string;
  body: string;
  image: string;
  imagePosition: string;
  /**
   * Height of the photo relative to the hero, anchored at the top. Above 100%
   * it pushes a high-set subject down so the status bar never crosses a face.
   */
  imageZoom?: string;
  /** Category the banner sends the customer to. */
  target: ProductShelfCategoryId;
}

export interface ProductShelfEntryCard {
  id: Extract<ProductsCardId, "shopsmart" | "partner-offers">;
  title: string;
  /** Says what the programme actually gives you — the count alone explained nothing. */
  subtitle: string;
  count: number;
  image: string;
  imagePosition: string;
}

export const PRODUCT_SHELF_HERO_SLIDES: readonly [ProductShelfHeroSlide, ...ProductShelfHeroSlide[]] = [
  {
    id: "hero-home-cover",
    title: "Protect the place you call home",
    body: "Explore cover for your home and belongings.",
    image: heroLivingRoom,
    imagePosition: "center 68%",
    target: "insurances",
  },
  {
    id: "hero-current-account",
    title: "A current account for your plans",
    body: "Keep daily banking simple with flexible digital servicing.",
    image: heroHomeCover,
    // Zoomed and pulled left so her face lands below the status bar and beside
    // the dynamic island instead of behind it.
    imageZoom: "155%",
    imagePosition: "30% 0%",
    target: "accounts-cards",
  },
  {
    id: "hero-savings",
    title: "Savings that grow with every month",
    body: "Put extra money aside and build your reserve with more confidence.",
    image: heroSunriseHills,
    imagePosition: "center 45%",
    target: "savings-investments",
  },
  {
    id: "hero-mortgage",
    title: "Mortgage support for your next move",
    body: "Explore financing for renovations, upgrades or a new home chapter.",
    image: heroHouseDusk,
    imagePosition: "center 50%",
    target: "credits",
  },
];

export const PRODUCT_SHELF_ENTRY_CARDS: readonly ProductShelfEntryCard[] = [
  {
    id: "shopsmart",
    title: "Shopsmart",
    subtitle: "Cashback where you already shop",
    count: 32,
    image: partnerShopsmartV2,
    imagePosition: "100% 100%",
  },
  {
    id: "partner-offers",
    title: "Partner offers",
    subtitle: "Seasonal deals from partner brands",
    count: 13,
    image: partnerOffersV2,
    imagePosition: "100% 100%",
  },
];

export const PRODUCT_SHELF_CATEGORIES: readonly [ProductShelfCategory, ...ProductShelfCategory[]] = [
  {
    id: "savings-investments",
    title: "Savings & Investments",
    items: [
      {
        id: "term-deposit",
        cardId: "investments-savings",
        productName: "Term deposit",
        title: "Make your money work harder",
        body: "Set an amount aside for a fixed term and let time do the work.",
        image: savingsDesk,
        imagePosition: "center 33%",
      },
      {
        id: "saving-account",
        cardId: "investments-savings",
        productName: "Saving account",
        title: "Build a future you look forward to",
        body: "Start with a goal today and let every step add up.",
        image: savingsBedroom,
        imagePosition: "center 20%",
      },
      {
        id: "mutual-funds",
        cardId: "investments-savings",
        productName: "Mutual funds",
        title: "Invest beyond the everyday",
        body: "Choose funds that match the risk you are comfortable with.",
        image: adviceTable,
        imagePosition: "center 40%",
      },
    ],
  },
  {
    id: "credits",
    // "Credits" reads like loyalty points; "Borrowing" is the term the app
    // already uses in PRODUCT_CARD_SHEETS, and it now covers the credit card.
    title: "Borrowing",
    items: [
      {
        id: "personal-loan",
        cardId: "mortgages-loans",
        productName: "Personal loan",
        title: "Make your next step possible",
        body: "Explore flexible credit for the plans that matter to you.",
        image: creditsStreet,
        imagePosition: "center 10%",
      },
      {
        id: "mortgage-loan",
        cardId: "mortgages-loans",
        productName: "Mortgage loan",
        title: "A home loan shaped around you",
        body: "See how your next home could become more achievable.",
        image: creditsCouple,
        imagePosition: "center 30%",
      },
      {
        id: "credit-card",
        cardId: "cards",
        productName: "Credit card",
        title: "More room for the bigger plans",
        body: "Spread the cost of what matters and keep repayment in view.",
        image: shopCounter,
        imagePosition: "center 45%",
      },
    ],
  },
  {
    id: "insurances",
    title: "Insurances",
    items: [
      {
        id: "home-insurance",
        cardId: "insurance",
        productName: "Home insurance",
        title: "Protection for everyday life",
        body: "Choose cover for your home, health and the things you value.",
        image: insuranceTablet,
        imagePosition: "0% 33%",
      },
      {
        id: "travel-insurance",
        cardId: "insurance",
        productName: "Travel insurance",
        title: "Travel with one less worry",
        body: "Add cover for holidays, city breaks and family trips.",
        image: travelKit,
        imagePosition: "center 45%",
      },
      {
        id: "car-insurance",
        cardId: "insurance",
        productName: "Car insurance",
        title: "Confidence for every drive",
        body: "Cover for your car, and help when the road surprises you.",
        image: cityStreet,
        imagePosition: "center 55%",
      },
      {
        id: "life-insurance",
        cardId: "insurance",
        productName: "Life insurance",
        title: "Feel ready for the unexpected",
        body: "Stay protected with cover that changes as life does.",
        image: familySunset,
        imagePosition: "center 45%",
      },
    ],
  },
  {
    id: "accounts-cards",
    title: "Accounts & Cards",
    items: [
      {
        id: "current-account",
        cardId: "account",
        productName: "Current account",
        title: "Everyday banking, made simple",
        body: "Manage your money, payments and cards in one place.",
        image: accountsSky,
        imagePosition: "center 74%",
      },
      {
        id: "overdraft",
        cardId: "account",
        productName: "Overdraft",
        title: "A little room when you need it",
        body: "Keep going when the month turns out tighter than planned.",
        image: marketProduce,
        imagePosition: "center 45%",
      },
      {
        id: "debit-card",
        cardId: "cards",
        productName: "Debit card",
        title: "A card that keeps up with you",
        body: "Pay with confidence and stay in control wherever you are.",
        image: cardsShopper,
        imagePosition: "center 25%",
      },
      {
        id: "virtual-card",
        cardId: "cards",
        productName: "Virtual card",
        title: "Shop online, keep your card private",
        body: "Create a card for the internet and leave your main one untouched.",
        image: onlineCard,
        imagePosition: "center 50%",
      },
    ],
  },
];

export function getProductShelfCategory(id: ProductShelfCategoryId): ProductShelfCategory {
  return PRODUCT_SHELF_CATEGORIES.find((category) => category.id === id) ?? PRODUCT_SHELF_CATEGORIES[0];
}

/** The shelf entry behind an item id, with the category it belongs to. */
export function getProductShelfEntry(
  itemId: string,
): { item: ProductShelfItem; category: ProductShelfCategory } | null {
  for (const category of PRODUCT_SHELF_CATEGORIES) {
    const item = category.items.find((entry) => entry.id === itemId);
    if (item) return { item, category };
  }
  return null;
}

/**
 * A campaign's destination, as the product detail page expects it.
 *
 * Home's campaign cards used to hand the customer to the top of the Offers
 * shelf and leave them to re-find the product they had just tapped. They now
 * carry the shelf item they are advertising, and this turns that id into the
 * same selection a tap on the shelf card would have produced — same photo,
 * same headline, same detail page.
 */
export function buildShelfProductSelection(itemId: string) {
  const entry = getProductShelfEntry(itemId);
  if (!entry) return null;

  const { item, category } = entry;
  return {
    cardId: item.cardId,
    categoryTitle: category.title,
    optionId: item.id,
    title: item.productName,
    heroImage: item.image,
    heroImagePosition: item.imagePosition,
    headline: item.title,
    intro: item.body,
  };
}
