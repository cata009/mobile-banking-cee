import { COLOR_TOKENS, resolveColorToken } from "./colorTokens";

export type ColorPaletteId =
  | "neutral"
  | "action-teal"
  | "brand-red"
  | "product"
  | "semantic-green"
  | "warning-orange"
  | "peach"
  | "pfm"
  | "utility"
  | "roles"
  | "banners"
  | "scoped"
  | "other";

export type AppColorAuditStatus = "mapped" | "asset-exception" | "pending-review";

export interface DesignSystemPalette {
  id: ColorPaletteId;
  label: string;
  description: string;
}

export interface DesignSystemColor {
  id: string;
  name: string;
  paletteId: ColorPaletteId;
  lightHex: string;
  darkHex: string;
  sourceTokens: string[];
  usage: string;
  cssVariable: string;
  /** For a role that points at another token: the token it follows (a change there changes this too). */
  aliasOf?: string;
  darkNote?: string;
}

/** A palette entry as documented here; its hex values come from the color token source. */
export type RawDesignSystemColor = Omit<DesignSystemColor, "lightHex" | "darkHex">;

export interface AppColorAuditItem {
  sourceColor: string;
  targetToken: string;
  targetHex: string;
  status: AppColorAuditStatus;
  usage: string;
  note?: string;
}

export const COLOR_SOURCE_AUDIT = {
  sourcePath: "screenshots/Colors.svg",
  extractedColorGroups: 66,
  solidColorGroups: 59,
  uniqueSolidColors: 48,
  normalizedColorsInRegistry: 60,
  gradientGroups: 1,
};

export const COLOR_PALETTES = [
  {
    id: "neutral",
    label: "Neutral / Primary",
    description: "Core backgrounds, surfaces, text, dividers, and icons.",
  },
  {
    id: "action-teal",
    label: "Action Teal",
    description: "Primary actions, selected states, active navigation, and informational surfaces.",
  },
  {
    id: "brand-red",
    label: "UniCredit Red",
    description: "Brand marks, destructive emphasis, and high-priority visual accents.",
  },
  {
    id: "product",
    label: "Product Tiles",
    description: "Product card surfaces and editorial offer backgrounds.",
  },
  {
    id: "semantic-green",
    label: "Semantic Green",
    description: "Success, positive, environmental, and specialty green accents.",
  },
  {
    id: "warning-orange",
    label: "Warning / Orange",
    description: "Warning, card-network adjacent, gold, and orange attention colors.",
  },
  {
    id: "peach",
    label: "Peach",
    description: "Soft supporting surfaces used in light illustrations and warm accents.",
  },
  {
    id: "pfm",
    label: "PFM Categories",
    description:
      "Semantic Personal Finance Management category colors used in analytics and account transactions; dark variants preserve light hue/chroma with a perceptual lightness lift for dark surfaces.",
  },
  {
    id: "utility",
    label: "Utility",
    description: "Special status and audit-only colors from the source SVG.",
  },
  {
    id: "roles",
    label: "Roles",
    description:
      "What the UI means by a color (action, surface, text, border). Components use these roles, not the raw palette, so changing a role here changes every component that uses it.",
  },
  {
    id: "banners",
    label: "Banner tones",
    description: "Editorial banner and offer backgrounds, three tones per family.",
  },
  {
    id: "scoped",
    label: "Screen-scoped",
    description: "Values owned by one screen family (the App 2027 Home glass theme, the static investment reference snapshots).",
  },
  {
    id: "other",
    label: "Other tokens",
    description: "Remaining color tokens: goal, robo scenario, summary and static colors.",
  },
] as const satisfies readonly [DesignSystemPalette, ...DesignSystemPalette[]];

const RAW_DESIGN_SYSTEM_COLORS: RawDesignSystemColor[] = [
  {
    id: "neutral-white",
    name: "White",
    paletteId: "neutral",
    sourceTokens: ["Primary / 100", "Primary / 600 Copy 2-5"],
    usage: "Light surfaces, cards, nav bars, and inverse text.",
    cssVariable: "--uc-neutral-white",
    darkNote: "Dark surfaces move to Primary 900 to keep contrast calm.",
  },
  {
    id: "neutral-100",
    name: "Neutral 100",
    paletteId: "neutral",
    sourceTokens: ["Primary / 200"],
    usage: "App background and subtle section background.",
    cssVariable: "--uc-neutral-100",
  },
  {
    id: "neutral-200",
    name: "Neutral 200",
    paletteId: "neutral",
    sourceTokens: ["Primary / 300"],
    usage: "Secondary separators and muted cards.",
    cssVariable: "--uc-neutral-200",
  },
  {
    id: "neutral-300",
    name: "Neutral 300",
    paletteId: "neutral",
    sourceTokens: ["Primary / 902"],
    usage: "Primary borders and divider lines.",
    cssVariable: "--uc-neutral-300",
  },
  {
    id: "neutral-400",
    name: "Neutral 400",
    paletteId: "neutral",
    sourceTokens: ["Primary / 600"],
    usage: "Disabled borders and low-emphasis controls.",
    cssVariable: "--uc-neutral-400",
  },
  {
    id: "neutral-500",
    name: "Neutral 500",
    paletteId: "neutral",
    sourceTokens: ["Primary / Main 22"],
    usage: "Secondary UI chrome and inactive indicators.",
    cssVariable: "--uc-neutral-500",
  },
  {
    id: "neutral-600",
    name: "Neutral 600",
    paletteId: "neutral",
    sourceTokens: ["Primary / 600 Copy"],
    usage: "Muted labels and secondary text.",
    cssVariable: "--uc-neutral-600",
  },
  {
    id: "neutral-650",
    name: "Neutral 650",
    paletteId: "neutral",
    sourceTokens: ["Primary / Main 26"],
    usage: "Status and chart helper labels.",
    cssVariable: "--uc-neutral-650",
  },
  {
    id: "neutral-700",
    name: "Neutral 700",
    paletteId: "neutral",
    sourceTokens: ["Primary / 901"],
    usage: "Secondary labels and inactive navigation text.",
    cssVariable: "--uc-neutral-700",
  },
  {
    id: "neutral-750",
    name: "Neutral 750",
    paletteId: "neutral",
    sourceTokens: ["Primary / Main Copy 3"],
    usage: "Deep muted product surfaces.",
    cssVariable: "--uc-neutral-750",
  },
  {
    id: "neutral-800",
    name: "Neutral 800",
    paletteId: "neutral",
    sourceTokens: ["Primary / Main 20"],
    usage: "Dense dark UI surfaces.",
    cssVariable: "--uc-neutral-800",
  },
  {
    id: "neutral-900",
    name: "Primary K1",
    paletteId: "neutral",
    sourceTokens: ["Primary / 900", "Primary / Main 21"],
    usage: "Primary text, icons, and strong dividers.",
    cssVariable: "--uc-primary-k1",
  },
  {
    id: "neutral-black",
    name: "Black",
    paletteId: "neutral",
    sourceTokens: ["Primary / Main"],
    usage: "Device chrome and strong dark surfaces, normalized away from pure black.",
    cssVariable: "--uc-primary-main",
  },
  {
    id: "teal-900",
    name: "Teal Deep",
    paletteId: "action-teal",
    sourceTokens: ["Primary / Main 2", "Primary / 900 Copy 3", "Primary / Main 18"],
    usage: "Pressed action, deep selected state, and offer backgrounds.",
    cssVariable: "--uc-teal-900",
  },
  {
    id: "teal-700",
    name: "Teal Main",
    paletteId: "action-teal",
    sourceTokens: ["Primary / Main 3", "Primary / 900 2", "Primary / 900 16", "Primary / Main 27"],
    usage: "Primary action, active navigation, banners, and chart inflow.",
    cssVariable: "--uc-teal-main",
  },
  {
    id: "teal-650",
    name: "Teal Blue",
    paletteId: "action-teal",
    sourceTokens: ["Primary / Main 19"],
    usage: "Alternate selected teal for charts and status surfaces.",
    cssVariable: "--uc-teal-blue",
  },
  {
    id: "teal-600",
    name: "Teal Bright",
    paletteId: "action-teal",
    sourceTokens: ["Primary / Main 4"],
    usage: "Bright action accent and dark-mode active state.",
    cssVariable: "--uc-teal-bright",
  },
  {
    id: "teal-300",
    name: "Teal Soft",
    paletteId: "action-teal",
    sourceTokens: ["Primary / 900 3"],
    usage: "Soft active surface and light selected background.",
    cssVariable: "--uc-teal-soft",
  },
  {
    id: "teal-100",
    name: "Teal Pale",
    paletteId: "action-teal",
    sourceTokens: ["Primary / 800"],
    usage: "Low-emphasis success/info background.",
    cssVariable: "--uc-teal-pale",
  },
  {
    id: "red-main",
    name: "UniCredit Red",
    paletteId: "brand-red",
    sourceTokens: ["Primary / Main 5", "Primary / 900 14"],
    usage: "Brand mark and primary brand accent.",
    cssVariable: "--uc-red-main",
  },
  {
    id: "red-bright",
    name: "Red Bright",
    paletteId: "brand-red",
    sourceTokens: ["Primary / 600 Copy 6"],
    usage: "Dark-mode brand accent and alert emphasis.",
    cssVariable: "--uc-red-bright",
  },
  {
    id: "red-card",
    name: "Red Card",
    paletteId: "brand-red",
    sourceTokens: ["Primary / 600 Copy 2", "Primary / 900 13"],
    usage: "Card product tile and strong warning.",
    cssVariable: "--uc-red-card",
  },
  {
    id: "red-deep",
    name: "Red Deep",
    paletteId: "brand-red",
    sourceTokens: ["Primary / 900 Copy", "Primary / Main 15"],
    usage: "Deep red surfaces and dark red accents.",
    cssVariable: "--uc-red-deep",
  },
  {
    id: "red-brown",
    name: "Red Brown",
    paletteId: "brand-red",
    sourceTokens: ["Primary / 900 4"],
    usage: "Legacy deep warning and decorative emphasis.",
    cssVariable: "--uc-red-brown",
  },
  {
    id: "product-blue-deep",
    name: "Product Blue Deep",
    paletteId: "product",
    sourceTokens: ["Primary / Main 6"],
    usage: "Account product tile.",
    cssVariable: "--uc-product-blue-deep",
  },
  {
    id: "product-slate",
    name: "Product Slate",
    paletteId: "product",
    sourceTokens: ["Primary / 900 5"],
    usage: "Investments and neutral product tile.",
    cssVariable: "--uc-product-slate",
  },
  {
    id: "product-blue",
    name: "Product Blue",
    paletteId: "product",
    sourceTokens: ["Primary / Main 7"],
    usage: "Insurance product tile.",
    cssVariable: "--uc-product-blue",
  },
  {
    id: "product-mauve",
    name: "Product Mauve",
    paletteId: "product",
    sourceTokens: ["Primary / Main 8"],
    usage: "Mortgage and loans product tile.",
    cssVariable: "--uc-product-mauve",
  },
  {
    id: "product-pink",
    name: "Product Pink",
    paletteId: "product",
    sourceTokens: ["Primary / 900 6"],
    usage: "Pink accent in product/editorial visuals.",
    cssVariable: "--uc-product-pink",
  },
  {
    id: "product-brown",
    name: "Product Brown",
    paletteId: "product",
    sourceTokens: ["Primary / Main 9"],
    usage: "Warm product surface and illustration accent.",
    cssVariable: "--uc-product-brown",
  },
  {
    id: "product-hedging",
    name: "Product Hedging",
    paletteId: "product",
    sourceTokens: ["Prestiti"],
    usage: "Market Hedging product menu tile.",
    cssVariable: "--uc-product-hedging",
  },
  {
    id: "green-deep",
    name: "Green Deep",
    paletteId: "semantic-green",
    sourceTokens: ["Primary / Main Copy 2", "Primary / Main 16"],
    usage: "Deep green editorial and success surface.",
    cssVariable: "--uc-green-deep",
  },
  {
    id: "green-main",
    name: "Green Main",
    paletteId: "semantic-green",
    sourceTokens: ["Primary / 900 15"],
    usage: "Positive/action green accent.",
    cssVariable: "--uc-green-main",
  },
  {
    id: "green-bright",
    name: "Green Bright",
    paletteId: "semantic-green",
    sourceTokens: ["Primary / Main 17"],
    usage: "Bright green selected/semantic accent.",
    cssVariable: "--uc-green-bright",
  },
  {
    id: "green-success",
    name: "Green Success",
    paletteId: "semantic-green",
    sourceTokens: ["Primary / Main 10"],
    usage: "Success and positive status.",
    cssVariable: "--uc-green-success",
  },
  {
    id: "green-status",
    name: "Green Status",
    paletteId: "semantic-green",
    sourceTokens: ["Primary / Main Copy 4"],
    usage: "Status green in audit and message states.",
    cssVariable: "--uc-green-status",
  },
  {
    id: "green-olive",
    name: "Green Olive",
    paletteId: "semantic-green",
    sourceTokens: ["Primary / Main 23"],
    usage: "Olive product/status accent.",
    cssVariable: "--uc-green-olive",
  },
  {
    id: "orange-main",
    name: "Orange Main",
    paletteId: "warning-orange",
    sourceTokens: ["Primary / Main Copy"],
    usage: "Warning and orange emphasis.",
    cssVariable: "--uc-orange-main",
  },
  {
    id: "orange-card",
    name: "Orange Card",
    paletteId: "warning-orange",
    sourceTokens: ["Primary / Main 13"],
    usage: "Card/network adjacent orange.",
    cssVariable: "--uc-orange-card",
  },
  {
    id: "orange-bright",
    name: "Orange Bright",
    paletteId: "warning-orange",
    sourceTokens: ["Primary / 900 10"],
    usage: "Bright warning highlight.",
    cssVariable: "--uc-orange-bright",
  },
  {
    id: "orange-status",
    name: "Orange Status",
    paletteId: "warning-orange",
    sourceTokens: ["Primary / Main 24"],
    usage: "Status warning accent.",
    cssVariable: "--uc-orange-status",
  },
  {
    id: "yellow-gold",
    name: "Gold",
    paletteId: "warning-orange",
    sourceTokens: ["Primary / 900 7"],
    usage: "Gold and attention highlights.",
    cssVariable: "--uc-yellow-gold",
  },
  {
    id: "yellow-muted",
    name: "Muted Gold",
    paletteId: "warning-orange",
    sourceTokens: ["Primary / 900 8"],
    usage: "Muted gold highlight.",
    cssVariable: "--uc-yellow-muted",
  },
  {
    id: "yellow-brown",
    name: "Brown Gold",
    paletteId: "warning-orange",
    sourceTokens: ["Primary / Main 11"],
    usage: "Deep gold/brown surface.",
    cssVariable: "--uc-yellow-brown",
  },
  {
    id: "yellow-main",
    name: "Yellow Main",
    paletteId: "warning-orange",
    sourceTokens: ["Primary / 900 9"],
    usage: "Yellow highlight.",
    cssVariable: "--uc-yellow-main",
  },
  {
    id: "orange-deep",
    name: "Orange Deep",
    paletteId: "warning-orange",
    sourceTokens: ["Primary / Main 12"],
    usage: "Deep orange accent.",
    cssVariable: "--uc-orange-deep",
  },
  {
    id: "peach-100",
    name: "Peach 100",
    paletteId: "peach",
    sourceTokens: ["Primary / 900 12"],
    usage: "Warm pale surface.",
    cssVariable: "--uc-peach-100",
  },
  {
    id: "peach-200",
    name: "Peach 200",
    paletteId: "peach",
    sourceTokens: ["Primary / 900 11"],
    usage: "Warm supporting surface.",
    cssVariable: "--uc-peach-200",
  },
  {
    id: "peach-300",
    name: "Peach 300",
    paletteId: "peach",
    sourceTokens: ["Primary / Main 14"],
    usage: "Warm supporting accent.",
    cssVariable: "--uc-peach-300",
  },
  {
    id: "pfm-taxes-penalties",
    name: "PFM Taxes and Penalties",
    paletteId: "pfm",
    sourceTokens: ["PFM / Taxes and penalties"],
    usage: "Personal finance category color for taxes and penalties transactions.",
    cssVariable: "--uc-pfm-taxes-penalties",
  },
  {
    id: "pfm-groceries",
    name: "PFM Groceries",
    paletteId: "pfm",
    sourceTokens: ["PFM / Groceries"],
    usage: "Personal finance category color for groceries.",
    cssVariable: "--uc-pfm-groceries",
  },
  {
    id: "pfm-lifestyle",
    name: "PFM Lifestyle",
    paletteId: "pfm",
    sourceTokens: ["PFM / Lifestyle"],
    usage: "Personal finance category color for lifestyle and personal care.",
    cssVariable: "--uc-pfm-lifestyle",
  },
  {
    id: "pfm-investments",
    name: "PFM Investments",
    paletteId: "pfm",
    sourceTokens: ["PFM / Investments"],
    usage: "Personal finance category color for investments.",
    cssVariable: "--uc-pfm-investments",
  },
  {
    id: "pfm-internal",
    name: "PFM Internal",
    paletteId: "pfm",
    sourceTokens: ["PFM / Internal"],
    usage: "Personal finance category color for internal own-account movements.",
    cssVariable: "--uc-pfm-internal",
  },
  {
    id: "pfm-income",
    name: "PFM Income",
    paletteId: "pfm",
    sourceTokens: ["PFM / Income"],
    usage: "Personal finance category color for income; intentionally aligned with the shared teal-blue action family.",
    cssVariable: "--uc-pfm-income",
  },
  {
    id: "pfm-utilities",
    name: "PFM Utilities",
    paletteId: "pfm",
    sourceTokens: ["PFM / Utilities"],
    usage: "Personal finance category color for utilities; intentionally aligned with Teal Deep.",
    cssVariable: "--uc-pfm-utilities",
  },
  {
    id: "pfm-exclude-budget",
    name: "PFM Exclude from Budget",
    paletteId: "pfm",
    sourceTokens: ["PFM / Exclude from budget"],
    usage: "Personal finance category color for excluded spend.",
    cssVariable: "--uc-pfm-exclude-budget",
  },
  {
    id: "pfm-shopping",
    name: "PFM Shopping",
    paletteId: "pfm",
    sourceTokens: ["PFM / Shopping"],
    usage: "Personal finance category color for shopping.",
    cssVariable: "--uc-pfm-shopping",
  },
  {
    id: "pfm-insurance",
    name: "PFM Insurance",
    paletteId: "pfm",
    sourceTokens: ["PFM / Insurance"],
    usage: "Personal finance category color for insurance.",
    cssVariable: "--uc-pfm-insurance",
  },
  {
    id: "pfm-home",
    name: "PFM Home",
    paletteId: "pfm",
    sourceTokens: ["PFM / Home"],
    usage: "Personal finance category color for home.",
    cssVariable: "--uc-pfm-home",
  },
  {
    id: "pfm-education",
    name: "PFM Education",
    paletteId: "pfm",
    sourceTokens: ["PFM / Education"],
    usage: "Personal finance category color for education.",
    cssVariable: "--uc-pfm-education",
  },
  {
    id: "pfm-transportation",
    name: "PFM Transportation",
    paletteId: "pfm",
    sourceTokens: ["PFM / Transportation"],
    usage: "Personal finance category color for transportation.",
    cssVariable: "--uc-pfm-transportation",
  },
  {
    id: "pfm-leisure-time",
    name: "PFM Leisure Time",
    paletteId: "pfm",
    sourceTokens: ["PFM / Leisure time"],
    usage: "Personal finance category color for leisure time.",
    cssVariable: "--uc-pfm-leisure-time",
  },
  {
    id: "pfm-healthcare",
    name: "PFM Healthcare",
    paletteId: "pfm",
    sourceTokens: ["PFM / Healthcare"],
    usage: "Personal finance category color for healthcare.",
    cssVariable: "--uc-pfm-healthcare",
  },
  {
    id: "pfm-children",
    name: "PFM Children",
    paletteId: "pfm",
    sourceTokens: ["PFM / Children"],
    usage: "Personal finance category color for children-related spend.",
    cssVariable: "--uc-pfm-children",
  },
  {
    id: "pfm-wallet",
    name: "PFM Wallet",
    paletteId: "pfm",
    sourceTokens: ["PFM / Wallet"],
    usage: "Personal finance category color for wallet and cash-like activity.",
    cssVariable: "--uc-pfm-wallet",
  },
  {
    id: "pfm-transfers",
    name: "PFM Transfers",
    paletteId: "pfm",
    sourceTokens: ["PFM / Transfers"],
    usage: "Personal finance category color for transfers.",
    cssVariable: "--uc-pfm-transfers",
  },
  {
    id: "pfm-finance",
    name: "PFM Finance",
    paletteId: "pfm",
    sourceTokens: ["PFM / Finance"],
    usage: "Personal finance category color for finance-related activity.",
    cssVariable: "--uc-pfm-finance",
  },
  {
    id: "pfm-uncategorized",
    name: "PFM Uncategorized",
    paletteId: "pfm",
    sourceTokens: ["PFM / Uncategorized"],
    usage: "Fallback personal finance category color for uncategorized items.",
    cssVariable: "--uc-pfm-uncategorized",
  },
  {
    id: "pfm-atm",
    name: "PFM ATM",
    paletteId: "pfm",
    sourceTokens: ["PFM / ATM"],
    usage: "Personal finance category color for ATM activity.",
    cssVariable: "--uc-pfm-atm",
  },
  {
    id: "pfm-fx",
    name: "PFM FX",
    paletteId: "pfm",
    sourceTokens: ["PFM / FX"],
    usage: "Personal finance category color for foreign exchange activity.",
    cssVariable: "--uc-pfm-fx",
  },
  {
    id: "red-status",
    name: "Status Red",
    paletteId: "utility",
    sourceTokens: ["Primary / Main 25"],
    usage: "Status red in audit and warning surfaces.",
    cssVariable: "--uc-status-red",
  },
  {
    id: "gold-brown",
    name: "Gold Brown",
    paletteId: "utility",
    sourceTokens: ["Primary / Main Copy 4 2"],
    usage: "Utility brown/gold accent from source SVG.",
    cssVariable: "--uc-gold-brown",
  },
];

/** The hex values are not stored here: they are resolved from colorTokens.ts, the single color source. */
const PALETTE_COLORS: DesignSystemColor[] = RAW_DESIGN_SYSTEM_COLORS.map((color) => ({
  ...color,
  lightHex: resolveColorToken(color.cssVariable, "light"),
  darkHex: resolveColorToken(color.cssVariable, "dark"),
}));

const ROLE_USAGE: Record<string, string> = {
  "--uc-app-bg": "App background behind surfaces.",
  "--uc-surface": "Cards, sheets and list rows.",
  "--uc-surface-muted": "Subtle fills and section backgrounds.",
  "--uc-surface-raised": "Elevated surfaces.",
  "--uc-text": "Primary text.",
  "--uc-text-muted": "Secondary text and captions.",
  "--uc-text-subtle": "Tertiary text and placeholders.",
  "--uc-text-inverse": "Text on filled actions and dark surfaces.",
  "--uc-action": "Interactive color: links, selected states and active navigation.",
  "--uc-action-strong": "Fill of the primary button.",
  "--uc-action-hover": "Hover and pressed state of actions.",
  "--uc-action-soft": "Soft action background for chips and tags.",
  "--uc-action-soft-strong": "Stronger soft action background.",
  "--uc-brand": "Brand red.",
  "--uc-danger": "Errors and destructive actions.",
  "--uc-icon": "Default icon color.",
  "--uc-icon-muted": "Secondary icons.",
  "--uc-border": "Borders and divider lines.",
  "--uc-border-muted": "Subtle separators.",
  "--uc-bottom-bar-bg": "Bottom navigation bar background.",
  "--uc-sheet-bg": "Bottom sheet background.",
  "--uc-overlay": "Backdrop behind sheets and dialogs.",
  "--uc-static-white": "White that does not change with the theme.",
  "--uc-static-black": "Dark that does not change with the theme.",
};

const humanize = (name: string) =>
  name
    .replace(/^--uc-/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

/** A bare `r g b` triplet (used for alpha mixing) is shown as a real color so it has a swatch. */
const displayValue = (value: string) => (/^\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?$/.test(value) ? `rgb(${value})` : value);

const documented = new Set(RAW_DESIGN_SYSTEM_COLORS.map((color) => color.cssVariable));

/** Every other color token (roles, banners, scoped, extras), so the page shows the whole source, not a subset. */
const TOKEN_COLORS: DesignSystemColor[] = COLOR_TOKENS.filter(
  (token) => token.group !== "web-alias" && !documented.has(token.name) && token.name.startsWith("--uc-"),
).map((token) => {
  const paletteId: ColorPaletteId =
    token.group === "role" && ROLE_USAGE[token.name] !== undefined
      ? "roles"
      : token.name.startsWith("--uc-banner-")
        ? "banners"
        : token.group === "scope"
          ? "scoped"
          : token.group === "role"
            ? "roles"
            : "other";
  const alias = token.light?.match(/^var\((--[A-Za-z0-9-]+)\)$/)?.[1];
  return {
    id: token.name.replace(/^--/, ""),
    name: humanize(token.name),
    paletteId,
    lightHex: displayValue(resolveColorToken(token.name, "light")),
    darkHex: displayValue(resolveColorToken(token.name, "dark")),
    sourceTokens: [],
    usage: ROLE_USAGE[token.name] ?? "",
    cssVariable: token.name,
    ...(alias ? { aliasOf: alias } : {}),
  };
});

export const DESIGN_SYSTEM_COLORS: DesignSystemColor[] = [...PALETTE_COLORS, ...TOKEN_COLORS];


export const APP_COLOR_AUDIT: AppColorAuditItem[] = [
  {
    sourceColor: "#F5F5F5",
    targetToken: "--uc-app-bg",
    targetHex: "#F5F5F5",
    status: "mapped",
    usage: "Main app background.",
  },
  {
    sourceColor: "#FFFFFF",
    targetToken: "--uc-surface",
    targetHex: "#FFFFFF",
    status: "mapped",
    usage: "Cards, sheets, nav bars, and page surfaces.",
  },
  {
    sourceColor: "#262626",
    targetToken: "--uc-text",
    targetHex: "#262626",
    status: "mapped",
    usage: "Primary text and icons.",
  },
  {
    sourceColor: "#666666",
    targetToken: "--uc-text-muted",
    targetHex: "#666666",
    status: "mapped",
    usage: "Secondary labels and inactive navigation.",
  },
  {
    sourceColor: "#D8D8D8",
    targetToken: "--uc-border",
    targetHex: "#D8D8D8",
    status: "mapped",
    usage: "Dividers and borders.",
  },
  {
    sourceColor: "#007A91",
    targetToken: "--uc-action",
    targetHex: "#007A91",
    status: "mapped",
    usage: "Primary action, active navigation, teal banners.",
  },
  {
    sourceColor: "#E2001A",
    targetToken: "--uc-brand",
    targetHex: "#E2001A",
    status: "mapped",
    usage: "UniCredit brand and selected shell controls.",
  },
  {
    sourceColor: "#245466",
    targetToken: "--uc-product-blue-deep",
    targetHex: "#244858",
    status: "mapped",
    usage: "Legacy product-card blue mapped to DS Product Blue Deep.",
  },
  {
    sourceColor: "#A70F14",
    targetToken: "--uc-red-card",
    targetHex: "#B91823",
    status: "mapped",
    usage: "Legacy card tile red mapped to DS Red Card.",
  },
  {
    sourceColor: "#A86683",
    targetToken: "--uc-product-mauve",
    targetHex: "#A26077",
    status: "mapped",
    usage: "Legacy mortgages tile mauve mapped to DS Product Mauve.",
  },
  {
    sourceColor: "#467392",
    targetToken: "--uc-product-blue",
    targetHex: "#3F6A8B",
    status: "mapped",
    usage: "Legacy insurance tile blue mapped to DS Product Blue.",
  },
  {
    sourceColor: "#667A7B",
    targetToken: "--uc-product-slate",
    targetHex: "#5E6F73",
    status: "mapped",
    usage: "Legacy investments tile slate mapped to DS Product Slate.",
  },
  {
    sourceColor: "#77816A",
    targetToken: "--uc-neutral-750",
    targetHex: "#535453",
    status: "mapped",
    usage: "Legacy additional-services tile mapped to DS neutral utility.",
  },
  {
    sourceColor: "#7757A4 / #A33694 / #388BCA / #363338 / #0D5870",
    targetToken: "PFM category tokens",
    targetHex: "see registry",
    status: "mapped",
    usage: "PFM-only colors now cataloged explicitly in the DS registry instead of living only in theme.css.",
    note: "See the `pfm` palette entries for Taxes and Penalties, Groceries, Lifestyle, Investments, and Internal.",
  },
  {
    sourceColor: "#EB001B / #FF5F00 / #F79E1B",
    targetToken: "asset exception",
    targetHex: "#E2001A",
    status: "asset-exception",
    usage: "Card-network decorative mark colors inside mock card artwork.",
    note: "Kept only where the color is part of an embedded brand-like illustration.",
  },
];

export const COLOR_BY_HEX = DESIGN_SYSTEM_COLORS.reduce<Record<string, DesignSystemColor[]>>((acc, color) => {
  const key = color.lightHex.toUpperCase();
  acc[key] = [...(acc[key] ?? []), color];
  return acc;
}, {});

export function normalizeHexColor(value: string) {
  const trimmed = value.trim().toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9A-F]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return trimmed;
}

export function findDesignSystemColorsByHex(value: string) {
  return COLOR_BY_HEX[normalizeHexColor(value)] ?? [];
}
