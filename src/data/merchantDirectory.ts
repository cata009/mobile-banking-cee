/**
 * Merchant directory — the single source of truth for merchant identity.
 *
 * Card-originated transactions are presented with the merchant's own brand
 * mark, not with a PFM category icon: the PFM icon answers "what kind of
 * spending is this", the merchant mark answers "who did I pay", and on a card
 * ledger the second question is the one the customer is actually asking.
 * Account-originated rows (standing orders, direct debits, transfers, taxes)
 * keep the PFM category icon, because their counterparty is an institution
 * rather than a shop.
 *
 * Every mark here is real brand artwork — never a hand-drawn approximation and
 * never a letter stand-in. Marks come from two places, both bundled with the
 * app so it never requests artwork from a merchant domain at runtime:
 *
 * - `mark`  a Simple Icons brand path baked into `merchantMarks.ts`;
 * - `asset` a brand SVG already shipped under `src/assets/`.
 *
 * A merchant with no real artwork does not belong in this directory: the row
 * falls back to its PFM category icon instead, which is the honest outcome.
 *
 * Add a merchant by adding its slug to `scripts/generate-merchant-marks.mjs`,
 * regenerating, and appending an entry to {@link MERCHANTS}. `aliases` lets a
 * raw ledger descriptor resolve without touching the ledger.
 */
import type { Country } from "@/app/state/demoTypes";
import { MERCHANT_MARKS, type MerchantMarkSlug } from "@/data/merchantMarks";

/** Bundled brand artwork already shipped in `src/assets/`, keyed for the renderer. */
export type MerchantAssetId = "emag";

/**
 * Whether the card was presented at a counter or online. In-store merchants
 * get a location on the transaction detail; online merchants never do.
 */
export type MerchantChannel = "in-store" | "online";

export interface MerchantEntry {
  id: MerchantId;
  /** Clean, customer-facing merchant name; this is what the ledger row says. */
  name: string;
  /** Extra raw descriptors that resolve to this merchant. */
  aliases?: readonly string[];
  /** Brand mark; exactly one of `mark` or `asset` is set. */
  mark?: MerchantMarkSlug;
  asset?: MerchantAssetId;
  /** Roundel fill. Defaults to the brand colour recorded with the mark. */
  background?: string;
  /** Mark colour. Defaults to white or near-black, whichever the fill needs. */
  foreground?: string;
  /** Glyph size as a fraction of the roundel; defaults to a balanced 0.5. */
  scale?: number;
  /** Card-scheme classification shown on the transaction detail. */
  mcc?: string;
  /** Defaults to `in-store`; set `online` to suppress the location block. */
  channel?: MerchantChannel;
  /** Curated store addresses per market. In-store merchants without one fall
   * back to the market's high street, so the detail always has a location. */
  locations?: Partial<Record<Country, string>>;
}

export type MerchantId =
  // Groceries
  | "carrefour"
  | "tesco"
  | "lidl"
  | "kaufland"
  | "auchan"
  | "hofer"
  // Eating out
  | "mcdonalds"
  | "kfc"
  | "burger-king"
  | "starbucks"
  | "glovo"
  | "foodpanda"
  // Retail
  | "emag"
  | "media-markt"
  | "ikea"
  | "hm"
  | "zara"
  | "nike"
  | "adidas"
  | "puma"
  // Health and drugstore
  | "dm"
  | "rossmann"
  // Fuel and mobility
  | "shell"
  | "uber"
  // Travel
  | "booking-com"
  | "airbnb"
  | "wizz-air"
  | "ryanair"
  // Digital
  | "spotify"
  | "netflix"
  | "youtube"
  | "youtube-premium"
  | "hbo-max"
  | "apple"
  | "steam"
  | "playstation"
  | "google-play"
  | "epic-games"
  | "roblox";

export const MERCHANTS: Record<MerchantId, MerchantEntry> = {
  // -------------------------------------------------------------- groceries
  carrefour: {
    id: "carrefour",
    name: "Carrefour",
    mark: "carrefour",
    mcc: "5411 · Grocery stores, supermarkets",
    locations: {
      RO: "Carrefour Băneasa · Șos. București-Ploiești 42D, Bucharest",
      RS: "Carrefour · Bulevar Mihajla Pupina 85, Belgrade",
    },
  },
  tesco: {
    id: "tesco",
    name: "Tesco",
    mark: "tesco",
    mcc: "5411 · Grocery stores, supermarkets",
    locations: {
      CZ: "Tesco · Národní 26, Prague",
      HU: "Tesco · Váci út 178, Budapest",
      SK: "Tesco · Kamenné námestie 1, Bratislava",
    },
  },
  lidl: {
    id: "lidl",
    name: "Lidl",
    // Yellow on Lidl blue is the brand lockup; the auto pairing would go white.
    foreground: "#FFF000",
    mark: "lidl",
    mcc: "5411 · Grocery stores, supermarkets",
    locations: {
      RO: "Lidl · Calea Dorobanți 172, Bucharest",
      CZ: "Lidl · Vinohradská 151, Prague",
      SK: "Lidl · Račianska 44, Bratislava",
      HU: "Lidl · Rákóczi út 34, Budapest",
      RS: "Lidl · Bulevar oslobođenja 22, Belgrade",
      SI: "Lidl · Dunajska cesta 138, Ljubljana",
    },
  },
  kaufland: {
    id: "kaufland",
    name: "Kaufland",
    mark: "kaufland",
    mcc: "5411 · Grocery stores, supermarkets",
    locations: {
      SK: "Kaufland · Trnavské mýto 1, Bratislava",
      RS: "Kaufland · Bulevar Zorana Đinđića 64, Belgrade",
      BA: "Kaufland · Džemala Bijedića 160, Sarajevo",
      BA_BL: "Kaufland · Bulevar srpske vojske 17, Banja Luka",
    },
  },
  auchan: {
    id: "auchan",
    name: "Auchan",
    mark: "auchan",
    mcc: "5411 · Grocery stores, supermarkets",
    locations: {
      HU: "Auchan · Szentmihályi út 137, Budapest",
      RO: "Auchan · Bd. Timișoara 26, Bucharest",
    },
  },
  hofer: {
    id: "hofer",
    name: "Hofer",
    aliases: ["aldi"],
    mark: "aldisud",
    mcc: "5411 · Grocery stores, supermarkets",
    locations: { SI: "Hofer · Celovška cesta 264, Ljubljana" },
  },

  // ------------------------------------------------------------- eating out
  mcdonalds: {
    id: "mcdonalds",
    name: "McDonald's",
    aliases: ["mcdonalds", "mc donalds"],
    // The arches are yellow on red; the brand hex records the arches only.
    background: "#DA291C",
    foreground: "#FFC72C",
    mark: "mcdonalds",
    scale: 0.55,
    mcc: "5814 · Fast food restaurants",
    locations: {
      CZ: "McDonald's · Václavské náměstí 9, Prague",
      SK: "McDonald's · Námestie SNP 1, Bratislava",
      HU: "McDonald's · Régi posta utca 2, Budapest",
      RO: "McDonald's · Piața Unirii 1, Bucharest",
      RS: "McDonald's · Terazije 5, Belgrade",
      BA: "McDonald's · Ferhadija 20, Sarajevo",
      BA_BL: "McDonald's · Trg Krajine 2, Banja Luka",
      SI: "McDonald's · Čopova ulica 14, Ljubljana",
    },
  },
  kfc: {
    id: "kfc",
    name: "KFC",
    mark: "kfc",
    mcc: "5814 · Fast food restaurants",
    locations: {
      RO: "KFC · Calea Victoriei 21, Bucharest",
      SK: "KFC · Obchodná 4, Bratislava",
      RS: "KFC · Knez Mihailova 6, Belgrade",
    },
  },
  "burger-king": {
    id: "burger-king",
    name: "Burger King",
    mark: "burgerking",
    mcc: "5814 · Fast food restaurants",
    locations: {
      CZ: "Burger King · Wenceslas Square 42, Prague",
      HU: "Burger King · Blaha Lujza tér 1, Budapest",
      BA: "Burger King · Zmaja od Bosne 4, Sarajevo",
      BA_BL: "Burger King · Kralja Petra I 12, Banja Luka",
    },
  },
  starbucks: {
    id: "starbucks",
    name: "Starbucks",
    mark: "starbucks",
    mcc: "5814 · Coffee shops",
    locations: {
      RO: "Starbucks · Calea Victoriei 68, Bucharest",
      CZ: "Starbucks · Malostranské náměstí 28, Prague",
      SK: "Starbucks · Hviezdoslavovo námestie 18, Bratislava",
      HU: "Starbucks · Deák Ferenc tér 3, Budapest",
      RS: "Starbucks · Bulevar Mihajla Pupina 6, Belgrade",
      SI: "Starbucks · Slovenska cesta 35, Ljubljana",
    },
  },
  glovo: {
    id: "glovo",
    name: "Glovo",
    mark: "glovo",
    channel: "online",
    mcc: "5812 · Food delivery",
  },
  foodpanda: {
    id: "foodpanda",
    name: "foodpanda",
    mark: "foodpanda",
    channel: "online",
    mcc: "5812 · Food delivery",
  },

  // ----------------------------------------------------------------- retail
  emag: {
    id: "emag",
    name: "eMAG",
    asset: "emag",
    background: "var(--uc-static-white)",
    channel: "online",
    mcc: "5732 · Electronics stores",
  },
  "media-markt": {
    id: "media-markt",
    name: "Media Markt",
    mark: "mediamarkt",
    mcc: "5732 · Electronics stores",
    locations: {
      HU: "Media Markt · Váci út 1-3, Budapest",
      CZ: "Media Markt · Radlická 117, Prague",
      SK: "Media Markt · Ivanská cesta 12, Bratislava",
    },
  },
  ikea: {
    id: "ikea",
    name: "IKEA",
    // Yellow wordmark on IKEA blue; the brand hex records the blue field.
    foreground: "#FFDA1A",
    mark: "ikea",
    scale: 0.46,
    mcc: "5712 · Furniture stores",
    locations: {
      CZ: "IKEA Zličín · Skandinávská 15a, Prague",
      SK: "IKEA · Ivanská cesta 18, Bratislava",
      HU: "IKEA · Örs vezér tere 22, Budapest",
      RO: "IKEA Băneasa · Șos. București-Ploiești 42A, Bucharest",
      RS: "IKEA · Astrid Lindgren 11, Belgrade",
      SI: "IKEA · Cesta v Mestni log 100, Ljubljana",
    },
  },
  hm: {
    id: "hm",
    name: "H&M",
    aliases: ["h and m", "handm"],
    mark: "handm",
    scale: 0.46,
    mcc: "5651 · Family clothing stores",
    locations: {
      RO: "H&M · Calea Victoriei 100, Bucharest",
      SK: "H&M · Obchodná 30, Bratislava",
      HU: "H&M · Váci utca 20, Budapest",
      BA: "H&M · Maršala Tita 26, Sarajevo",
      BA_BL: "H&M · Veselina Masleše 5, Banja Luka",
    },
  },
  zara: {
    id: "zara",
    name: "Zara",
    mark: "zara",
    scale: 0.46,
    mcc: "5651 · Family clothing stores",
    locations: {
      CZ: "Zara · Na Příkopě 14, Prague",
      RS: "Zara · Knez Mihailova 27, Belgrade",
    },
  },
  nike: {
    id: "nike",
    name: "Nike",
    mark: "nike",
    scale: 0.46,
    mcc: "5941 · Sporting goods stores",
    locations: {
      RO: "Nike · Bd. Unirii 4, Bucharest",
      RS: "Nike · Knez Mihailova 40, Belgrade",
    },
  },
  adidas: {
    id: "adidas",
    name: "adidas",
    mark: "adidas",
    mcc: "5941 · Sporting goods stores",
    locations: {
      CZ: "adidas · Na Příkopě 22, Prague",
      HU: "adidas · Váci utca 32, Budapest",
      BA: "adidas · Ferhadija 8, Sarajevo",
      BA_BL: "adidas · Gospodska 24, Banja Luka",
    },
  },
  puma: {
    id: "puma",
    name: "PUMA",
    mark: "puma",
    mcc: "5941 · Sporting goods stores",
    locations: { SK: "PUMA · Einsteinova 18, Bratislava" },
  },

  // ---------------------------------------------------- health and drugstore
  dm: {
    id: "dm",
    name: "dm",
    aliases: ["dm drogerie markt", "dm drogerie"],
    mark: "dm",
    scale: 0.44,
    mcc: "5912 · Drug stores and pharmacies",
    locations: {
      RO: "dm · Calea Dorobanți 130, Bucharest",
      CZ: "dm · Václavské náměstí 21, Prague",
      SK: "dm · Obchodná 26, Bratislava",
      RS: "dm · Bulevar kralja Aleksandra 78, Belgrade",
      BA: "dm · Ferhadija 15, Sarajevo",
      BA_BL: "dm · Gospodska 30, Banja Luka",
      SI: "dm · Slovenska cesta 55, Ljubljana",
    },
  },
  rossmann: {
    id: "rossmann",
    name: "Rossmann",
    mark: "rossmann",
    scale: 0.44,
    mcc: "5912 · Drug stores and pharmacies",
    locations: {
      HU: "Rossmann · Andrássy út 39, Budapest",
      CZ: "Rossmann · Vodičkova 30, Prague",
    },
  },

  // ------------------------------------------------------ fuel and mobility
  shell: {
    id: "shell",
    name: "Shell",
    // The pecten is red on the yellow field the brand hex records.
    foreground: "#DD1D21",
    mark: "shell",
    mcc: "5541 · Service stations",
    locations: {
      RO: "Shell · Șos. Kiseleff 32, Bucharest",
      CZ: "Shell · Strakonická 1, Prague",
      SK: "Shell · Einsteinova 25, Bratislava",
      HU: "Shell · Váci út 74, Budapest",
      RS: "Shell · Bulevar oslobođenja 88, Belgrade",
      BA: "Shell · Zmaja od Bosne 44, Sarajevo",
      BA_BL: "Shell · Bulevar srpske vojske 4, Banja Luka",
      SI: "Shell · Dunajska cesta 50, Ljubljana",
    },
  },
  uber: {
    id: "uber",
    name: "Uber",
    mark: "uber",
    channel: "online",
    mcc: "4121 · Taxicabs and ride sharing",
  },

  // ----------------------------------------------------------------- travel
  "booking-com": {
    id: "booking-com",
    name: "Booking.com",
    mark: "bookingdotcom",
    channel: "online",
    mcc: "7011 · Lodging and hotels",
  },
  airbnb: {
    id: "airbnb",
    name: "Airbnb",
    mark: "airbnb",
    channel: "online",
    mcc: "7011 · Lodging and hotels",
  },
  "wizz-air": {
    id: "wizz-air",
    name: "Wizz Air",
    mark: "wizzair",
    channel: "online",
    mcc: "3000 · Airlines",
  },
  ryanair: {
    id: "ryanair",
    name: "Ryanair",
    mark: "ryanair",
    channel: "online",
    mcc: "3000 · Airlines",
  },

  // ---------------------------------------------------------------- digital
  spotify: {
    id: "spotify",
    name: "Spotify",
    // The lockup is a black mark on Spotify green.
    foreground: "var(--uc-static-black)",
    mark: "spotify",
    channel: "online",
    mcc: "5815 · Digital goods and media",
  },
  netflix: {
    id: "netflix",
    name: "Netflix",
    mark: "netflix",
    scale: 0.46,
    channel: "online",
    mcc: "4899 · Streaming services",
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    mark: "youtube",
    channel: "online",
    mcc: "4899 · Streaming services",
  },
  "youtube-premium": {
    id: "youtube-premium",
    name: "YouTube Premium",
    mark: "youtube",
    channel: "online",
    mcc: "4899 · Streaming services",
  },
  "hbo-max": {
    id: "hbo-max",
    name: "HBO Max",
    mark: "hbo",
    scale: 0.44,
    channel: "online",
    mcc: "4899 · Streaming services",
  },
  apple: {
    id: "apple",
    name: "Apple",
    aliases: ["apple.com/bill", "itunes"],
    mark: "apple",
    scale: 0.52,
    channel: "online",
    mcc: "5734 · Computer software stores",
  },
  steam: {
    id: "steam",
    name: "Steam",
    mark: "steam",
    channel: "online",
    mcc: "5816 · Digital goods",
  },
  playstation: {
    id: "playstation",
    name: "PlayStation",
    mark: "playstation",
    channel: "online",
    mcc: "5816 · Digital goods",
  },
  "google-play": {
    id: "google-play",
    name: "Google Play",
    mark: "googleplay",
    channel: "online",
    mcc: "5816 · Digital goods",
  },
  "epic-games": {
    id: "epic-games",
    name: "Epic Games",
    mark: "epicgames",
    channel: "online",
    mcc: "5816 · Digital goods",
  },
  roblox: {
    id: "roblox",
    name: "Roblox",
    mark: "roblox",
    channel: "online",
    mcc: "5816 · Digital goods",
  },
};

/** Relative luminance of a `#rrggbb` colour, used to pick a legible mark colour. */
function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
  const [red = 0, green = 0, blue = 0] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export interface MerchantRoundel {
  background: string;
  foreground: string;
  /** Light fills need a dark hairline instead of the white one. */
  isLightFill: boolean;
  /** Glyph size as a fraction of the roundel diameter. */
  scale: number;
}

/**
 * Resolves a merchant's roundel colours. The fill is the brand colour and the
 * mark is white or near-black, whichever the fill can carry — entries override
 * either side when the real lockup is two-tone (McDonald's, IKEA, Lidl, Shell).
 */
export function getMerchantRoundel(entry: MerchantEntry): MerchantRoundel {
  const brandHex = entry.mark ? MERCHANT_MARKS[entry.mark].hex : "#FFFFFF";
  const background = entry.background ?? brandHex;
  const isLightFill = background.startsWith("#") ? luminance(background) > 0.55 : true;

  return {
    background,
    foreground: entry.foreground ?? (isLightFill ? "#111111" : "var(--uc-static-white)"),
    isLightFill,
    scale: entry.scale ?? 0.5,
  };
}

/** Path data for a merchant's brand mark, or null when it uses a bundled asset. */
export function getMerchantMarkPath(entry: MerchantEntry): string | null {
  return entry.mark ? MERCHANT_MARKS[entry.mark].path : null;
}

function normalizeMerchantKey(value: string) {
  return value
    .normalize("NFD")
    // Strip diacritics so "Lokál" and "Lokal" resolve to the same merchant.
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const MERCHANT_ID_BY_KEY = new Map<string, MerchantId>();

(Object.keys(MERCHANTS) as MerchantId[]).forEach((id) => {
  const entry = MERCHANTS[id];
  const keys = [entry.id, entry.name, ...(entry.aliases ?? [])];
  keys.forEach((key) => {
    const normalized = normalizeMerchantKey(key);
    // First writer wins, so a dedicated entry is never shadowed by an alias.
    if (normalized && !MERCHANT_ID_BY_KEY.has(normalized)) {
      MERCHANT_ID_BY_KEY.set(normalized, id);
    }
  });
});

export function getMerchant(id: MerchantId | string | undefined | null): MerchantEntry | null {
  if (!id) return null;
  return (MERCHANTS as Record<string, MerchantEntry>)[id] ?? null;
}

/**
 * Resolves a raw ledger descriptor to a merchant. Returns null when the
 * counterparty is not a merchant we can brand — the caller then falls back to
 * the PFM category icon.
 */
export function resolveMerchant(label: string | undefined | null): MerchantEntry | null {
  if (!label) return null;
  const id = MERCHANT_ID_BY_KEY.get(normalizeMerchantKey(label));
  return id ? MERCHANTS[id] : null;
}

/**
 * Card activity that never carries a merchant brand: cash at an ATM, the
 * bank's own fees, currency exchange at a desk, and wallet plumbing. These
 * keep the PFM category icon even though they sit on a card ledger.
 */
const NON_MERCHANT_KEYWORDS = [
  "atm",
  "cash withdrawal",
  "cash deposit",
  "bank fee",
  "currency exchange",
  "exchange desk",
  "wallet",
  "transfer",
  "refund",
] as const;

export function isNonMerchantCounterparty(label: string | undefined | null): boolean {
  if (!label) return true;
  const lowered = label.toLocaleLowerCase();
  return NON_MERCHANT_KEYWORDS.some((keyword) => lowered.includes(keyword));
}

/** Shape shared with `AccountTransaction`; kept structural so data modules stay decoupled. */
export interface MerchantResolvable {
  label: string;
  source?: "account" | "card";
  merchantId?: MerchantId;
}

/**
 * The one rule the whole app follows: a card transaction shows its merchant,
 * an account transaction shows its PFM category. A card transaction whose
 * counterparty is not a branded merchant (ATM, market stall, bank fee) also
 * falls back to the PFM category.
 */
export function resolveTransactionMerchant(transaction: MerchantResolvable): MerchantEntry | null {
  if (transaction.source !== "card") return null;
  if (transaction.merchantId) return getMerchant(transaction.merchantId);
  if (isNonMerchantCounterparty(transaction.label)) return null;
  return resolveMerchant(transaction.label);
}

/**
 * The high street each market's unlisted in-store merchants are placed on, so
 * an in-store card purchase always has an address — and therefore a map — on
 * the transaction detail. Mock data, like the rest of this directory.
 */
const MARKET_HIGH_STREETS: Record<Country, string> = {
  RO: "Calea Victoriei 45, Bucharest",
  CZ: "Na Příkopě 22, Prague",
  SK: "Obchodná 18, Bratislava",
  HU: "Váci utca 12, Budapest",
  RS: "Knez Mihailova 24, Belgrade",
  BA: "Ferhadija 12, Sarajevo",
  BA_BL: "Gospodska 18, Banja Luka",
  SI: "Čopova ulica 14, Ljubljana",
};

/** Merchant street address for the active market; undefined for online merchants. */
export function getMerchantLocation(entry: MerchantEntry, country: Country): string | undefined {
  if (entry.channel === "online") return undefined;
  return entry.locations?.[country] ?? `${entry.name} · ${MARKET_HIGH_STREETS[country]}`;
}
