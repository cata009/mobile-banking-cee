import type { CountryId } from "@/app/state/demoTypes";

export type PaymentHeroId =
  | "new-payment"
  | "between-accounts"
  | "manage-ebills"
  | "recurrent-payments"
  | "scan-pay";

export type PaymentOtherId =
  | "create-qr-code"
  | "templates"
  | "card-repayment"
  | "standing-order"
  | "foreign-payments"
  | "exchange-rates";

export type PaymentHeroIllustration = "wallet" | "laptop" | "pen" | "qr-phone";
export type PaymentHeroImageVariant =
  | "payments-1"
  | "payments-2"
  | "payments-3"
  | "payments-4"
  | "payments-5"
  | "payments-6"
  | "payments-7"
  | "payments-8"
  | "payments-9";
export type PaymentOtherIcon = "qr" | "templates" | "card" | "standing" | "foreign" | "exchange";
export type NewPaymentActionId =
  | "domestic-payment"
  | "foreign-payment"
  | "templates-beneficiaries"
  | "scan-qr-code"
  | "payment-slip"
  | "standard-transfer"
  | "currency-conversion";
export type NewPaymentActionIcon = "domestic" | "foreign" | "templates" | "qr" | "slip" | "exchange";

export interface PaymentHeroItem {
  id: PaymentHeroId;
  title: string;
  description: string;
  illustration: PaymentHeroIllustration;
  imageVariant?: PaymentHeroImageVariant;
  imageSrc?: string;
  translationKey?: string | null;
}

export interface PaymentOtherItem {
  id: PaymentOtherId;
  label: string;
  icon: PaymentOtherIcon;
  translationKey?: string | null;
}

export interface NewPaymentAction {
  id: NewPaymentActionId;
  title: string;
  description: string;
  icon: NewPaymentActionIcon;
}

export interface NewPaymentInfoBanner {
  title: string;
  description: string;
  /**
   * `null` keeps this copy as written instead of falling back to the shared
   * "New payment" banner translation — a sheet that carries its own message
   * would otherwise be overwritten by the generic one.
   */
  translationKey?: string | null;
}

export interface NewPaymentSheetConfig {
  title: string;
  actions: readonly NewPaymentAction[];
  infoBanner: NewPaymentInfoBanner;
}

export interface PaymentsMenuConfig {
  title: string;
  primaryItems: readonly PaymentHeroItem[];
  otherTitle: string;
  otherTitleTranslationKey?: string | null;
  otherItems: readonly PaymentOtherItem[];
  heroSheets: Record<PaymentHeroId, NewPaymentSheetConfig>;
}

const DEFAULT_PRIMARY_ITEMS: readonly PaymentHeroItem[] = [
  {
    id: "new-payment",
    title: "New payment",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    illustration: "wallet",
    imageVariant: "payments-1",
  },
  {
    id: "between-accounts",
    title: "Between my accounts",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    illustration: "laptop",
    imageVariant: "payments-2",
  },
  {
    id: "recurrent-payments",
    title: "Recurrent payments",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    illustration: "pen",
    imageVariant: "payments-5",
  },
  {
    id: "scan-pay",
    title: "Scan & pay",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    illustration: "qr-phone",
    imageVariant: "payments-4",
  },
];

const RO_PRIMARY_ITEMS: readonly PaymentHeroItem[] = [
  {
    id: "new-payment",
    title: "Payment to account",
    description: "To a new beneficiary, using the template\nor foreign currency",
    illustration: "wallet",
    imageVariant: "payments-1",
    translationKey: null,
  },
  {
    id: "scan-pay",
    title: "RoPay",
    description: "Instant payments with QR or\nRoPay Alias",
    illustration: "qr-phone",
    imageVariant: "payments-9",
    translationKey: null,
  },
  {
    id: "between-accounts",
    title: "Currency exchange",
    description: "Currency exchange between\nyour accounts",
    illustration: "laptop",
    imageVariant: "payments-2",
    translationKey: null,
  },
  {
    id: "manage-ebills",
    title: "Bills & Direct Debit",
    description: "Utility payments bils and donations",
    illustration: "wallet",
    imageVariant: "payments-3",
    translationKey: null,
  },
];

const BA_PRIMARY_ITEMS: readonly PaymentHeroItem[] = [
  {
    id: "new-payment",
    title: "New payment",
    description: "New beneficiary, budget\npayment, template",
    illustration: "wallet",
    imageVariant: "payments-1",
    translationKey: null,
  },
  {
    id: "between-accounts",
    title: "Transfer money",
    description: "Transfer money in local or foreign",
    illustration: "laptop",
    imageVariant: "payments-2",
    translationKey: null,
  },
  {
    id: "manage-ebills",
    title: "Manage e-bills",
    description: "Contract e-bill and make payments fast\nand easy",
    illustration: "wallet",
    imageVariant: "payments-3",
    translationKey: null,
  },
  {
    id: "recurrent-payments",
    title: "Standing orders",
    description: "Recurrent payments info",
    illustration: "pen",
    imageVariant: "payments-5",
    translationKey: null,
  },
  {
    id: "scan-pay",
    title: "Scan and pay",
    description: "Qr code payment",
    illustration: "qr-phone",
    imageVariant: "payments-4",
    translationKey: null,
  },
];

const BA_BL_PRIMARY_ITEMS: readonly PaymentHeroItem[] = [
  {
    id: "new-payment",
    title: "Make a payment",
    description: "To new beneficiary or using template",
    illustration: "wallet",
    imageVariant: "payments-1",
    translationKey: null,
  },
  {
    id: "between-accounts",
    title: "Transfer money\nbetween accounts",
    description: "Transfer money in local or foreign currency",
    illustration: "laptop",
    imageVariant: "payments-2",
    translationKey: null,
  },
  {
    id: "manage-ebills",
    title: "Manage e-bills",
    description: "Create contracts and pay utility bills",
    illustration: "wallet",
    imageVariant: "payments-3",
    translationKey: null,
  },
  {
    id: "recurrent-payments",
    title: "Recurrent payments",
    description: "Create a new Standing Order/\nDirect Debit",
    illustration: "pen",
    imageVariant: "payments-5",
    translationKey: null,
  },
  {
    id: "scan-pay",
    title: "QR code",
    description: "QR Code",
    illustration: "qr-phone",
    imageVariant: "payments-4",
    translationKey: null,
  },
];

// Sentence case, like the account actions these shortcuts now share their mark with.
const DEFAULT_OTHER_ITEMS: readonly PaymentOtherItem[] = [
  { id: "create-qr-code", label: "Create QR\ncode", icon: "qr" },
  { id: "templates", label: "Templates", icon: "templates" },
  { id: "card-repayment", label: "Card\nrepayment", icon: "card" },
  { id: "exchange-rates", label: "Exchange\nrates", icon: "exchange" },
];

const RO_OTHER_ITEMS: readonly PaymentOtherItem[] = [
  { id: "standing-order", label: "Recurrent\nPayments", icon: "standing", translationKey: null },
  { id: "templates", label: "My\nTemplates", icon: "templates", translationKey: null },
  { id: "foreign-payments", label: "Foreign\nPayments", icon: "foreign", translationKey: null },
  { id: "exchange-rates", label: "Exchange\nRates", icon: "exchange", translationKey: null },
];

const BA_OTHER_ITEMS: readonly PaymentOtherItem[] = [
  { id: "templates", label: "Template", icon: "templates", translationKey: null },
  { id: "card-repayment", label: "Card repayment", icon: "card", translationKey: null },
  { id: "standing-order", label: "Standing Order", icon: "standing", translationKey: null },
  { id: "foreign-payments", label: "Foreign Payments", icon: "foreign", translationKey: null },
  { id: "exchange-rates", label: "Exchange Rate", icon: "exchange", translationKey: null },
];

const DOMESTIC_PAYMENT_DESCRIPTION: Record<CountryId, string> = {
  RO: "Send payment in RON in RO",
  CZ: "Send payment in CZK in CR",
  SK: "Send payment in EUR in SK",
  HU: "Send payment in HUF in HU",
  RS: "Send payment in RSD in RS",
  BA: "Send payment in BAM in BA",
  BA_BL: "Send payment in BAM in BA",
  SI: "Send payment in EUR in SI",
};

/**
 * Czech Republic ships its own copy for two of the hero sheets: Scan & pay opens
 * on the two things there are to scan, and Between my accounts on the two kinds
 * of internal transfer. Everything else keeps the shared three-action sheet.
 */
const CZ_HERO_SHEET_OVERRIDES: Partial<Record<PaymentHeroId, Omit<NewPaymentSheetConfig, "title">>> = {
  "scan-pay": {
    actions: [
      {
        id: "scan-qr-code",
        title: "SCAN A QR CODE",
        description: "Make a payment by scanning a QR code",
        icon: "qr",
      },
      {
        id: "payment-slip",
        title: "PAYMENT SLIP",
        description: "Make a payment by scanning a payment slip",
        icon: "slip",
      },
    ],
    infoBanner: {
      title: "Scan & pay",
      description: "No more filling up payment forms, pay quickly and simply!",
      translationKey: null,
    },
  },
  "between-accounts": {
    actions: [
      {
        id: "standard-transfer",
        title: "STANDARD TRANSFER",
        description: "Send CZK between your accounts",
        icon: "domestic",
      },
      {
        id: "currency-conversion",
        title: "CURRENCY CONVERSIONS",
        description: "Send foreign currency between your accounts",
        icon: "exchange",
      },
    ],
    infoBanner: {
      title: "Currency conversions",
      description: "Easy money transfers between your accounts in foreign currencies",
      translationKey: null,
    },
  },
};

function createHeroSheetConfig(
  title: string,
  country: CountryId,
  heroId: PaymentHeroId,
  options: { allowCountryOverrides?: boolean } = {},
): NewPaymentSheetConfig {
  const { allowCountryOverrides = true } = options;
  const override = allowCountryOverrides && country === "CZ" ? CZ_HERO_SHEET_OVERRIDES[heroId] : undefined;
  if (override) return { title, ...override };

  return {
    title,
    actions: [
      {
        id: "domestic-payment",
        title: "DOMESTIC PAYMENT",
        description: DOMESTIC_PAYMENT_DESCRIPTION[country],
        icon: "domestic",
      },
      {
        id: "foreign-payment",
        title: "FOREIGN PAYMENT",
        description: "Send foreign or SEPA payment",
        icon: "foreign",
      },
      {
        id: "templates-beneficiaries",
        title: "TEMPLATES AND BENEFICIARIES",
        description: "Reuse details from a payment you made in the past",
        icon: "templates",
      },
    ],
    infoBanner: {
      title: "Discover how to pay easier",
      description: "Does the invoice has a QR code or postal order? Pay easier!",
    },
  };
}

const DEFAULT_HERO_SHEET_TITLES: Record<PaymentHeroId, string> = {
  "new-payment": "New payment",
  "between-accounts": "Between my accounts",
  "manage-ebills": "Manage e-bills",
  "recurrent-payments": "Recurrent payments",
  "scan-pay": "Scan & pay",
};

const PAYMENT_HERO_IDS: readonly PaymentHeroId[] = [
  "new-payment",
  "between-accounts",
  "manage-ebills",
  "recurrent-payments",
  "scan-pay",
];

function createHeroSheets(
  country: CountryId,
  primaryItems: readonly PaymentHeroItem[],
): Record<PaymentHeroId, NewPaymentSheetConfig> {
  return PAYMENT_HERO_IDS.reduce((sheets, heroId) => {
    const itemTitle = primaryItems.find((item) => item.id === heroId)?.title.replace(/\n/g, " ");
    sheets[heroId] = createHeroSheetConfig(itemTitle ?? DEFAULT_HERO_SHEET_TITLES[heroId], country, heroId);
    return sheets;
  }, {} as Record<PaymentHeroId, NewPaymentSheetConfig>);
}

function createPaymentsMenuConfig(
  country: CountryId,
  options: {
    primaryItems?: readonly PaymentHeroItem[];
    otherTitle?: string;
    otherTitleTranslationKey?: string | null;
    otherItems?: readonly PaymentOtherItem[];
  } = {},
): PaymentsMenuConfig {
  const primaryItems = options.primaryItems ?? DEFAULT_PRIMARY_ITEMS;
  const otherItems = options.otherItems ?? DEFAULT_OTHER_ITEMS;

  return {
    title: "Payments",
    primaryItems,
    otherTitle: options.otherTitle ?? "Other",
    otherTitleTranslationKey: options.otherTitleTranslationKey,
    otherItems,
    heroSheets: createHeroSheets(country, primaryItems),
  };
}

export const PAYMENTS_MENU_CONFIG: Record<CountryId, PaymentsMenuConfig> = {
  RO: createPaymentsMenuConfig("RO", {
    primaryItems: RO_PRIMARY_ITEMS,
    otherTitle: "Shortcuts",
    otherTitleTranslationKey: null,
    otherItems: RO_OTHER_ITEMS,
  }),
  CZ: createPaymentsMenuConfig("CZ"),
  SK: createPaymentsMenuConfig("SK"),
  HU: createPaymentsMenuConfig("HU"),
  RS: createPaymentsMenuConfig("RS"),
  BA: createPaymentsMenuConfig("BA", { primaryItems: BA_PRIMARY_ITEMS, otherItems: BA_OTHER_ITEMS }),
  BA_BL: createPaymentsMenuConfig("BA_BL", { primaryItems: BA_BL_PRIMARY_ITEMS, otherItems: BA_OTHER_ITEMS }),
  SI: createPaymentsMenuConfig("SI"),
};

export function getPaymentsMenuForCountry(country: CountryId): PaymentsMenuConfig {
  return PAYMENTS_MENU_CONFIG[country];
}

/**
 * The CZ hero-sheet copy is a baseline-only detail: the future releases redesign
 * these journeys, so they keep the shared sheet.
 */
export function getHeroSheetForRelease(
  menu: PaymentsMenuConfig,
  country: CountryId,
  heroId: PaymentHeroId,
  options: { baseline: boolean },
): NewPaymentSheetConfig {
  if (options.baseline) return menu.heroSheets[heroId];

  const title = menu.heroSheets[heroId].title;
  return createHeroSheetConfig(title, country, heroId, { allowCountryOverrides: false });
}
