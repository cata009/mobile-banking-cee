import type { CountryId } from "@/app/state/demoTypes";

export type PaymentHeroId =
  | "new-payment"
  | "between-accounts"
  | "recurrent-payments"
  | "scan-pay";

export type PaymentOtherId =
  | "create-qr-code"
  | "templates"
  | "card-repayment"
  | "exchange-rates";

export type PaymentHeroIllustration = "wallet" | "laptop" | "pen" | "qr-phone";
export type PaymentOtherIcon = "qr" | "templates" | "card" | "exchange";
export type NewPaymentActionId =
  | "domestic-payment"
  | "foreign-payment"
  | "templates-beneficiaries";
export type NewPaymentActionIcon = "domestic" | "foreign" | "templates";

export interface PaymentHeroItem {
  id: PaymentHeroId;
  title: string;
  description: string;
  illustration: PaymentHeroIllustration;
}

export interface PaymentOtherItem {
  id: PaymentOtherId;
  label: string;
  icon: PaymentOtherIcon;
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
  otherItems: readonly PaymentOtherItem[];
  newPaymentSheet: NewPaymentSheetConfig;
}

const DEFAULT_PRIMARY_ITEMS: readonly PaymentHeroItem[] = [
  {
    id: "new-payment",
    title: "New payment",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    illustration: "wallet",
  },
  {
    id: "between-accounts",
    title: "Between my accounts",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    illustration: "laptop",
  },
  {
    id: "recurrent-payments",
    title: "Recurrent payments",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    illustration: "pen",
  },
  {
    id: "scan-pay",
    title: "Scan & pay",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    illustration: "qr-phone",
  },
];

const DEFAULT_OTHER_ITEMS: readonly PaymentOtherItem[] = [
  { id: "create-qr-code", label: "CREATE QR\nCODE", icon: "qr" },
  { id: "templates", label: "TEMPLATES", icon: "templates" },
  { id: "card-repayment", label: "CARD\nREPAYMENT", icon: "card" },
  { id: "exchange-rates", label: "EXCHANGE\nRATES", icon: "exchange" },
];

const DOMESTIC_PAYMENT_DESCRIPTION: Record<CountryId, string> = {
  RO: "Send payment in RON in RO",
  CZ: "Send payment in CZK in CR",
  SK: "Send payment in EUR in SK",
  HU: "Send payment in HUF in HU",
  RS: "Send payment in RSD in RS",
  BA: "Send payment in BAM in BA",
  SI: "Send payment in EUR in SI",
};

function createPaymentsMenuConfig(country: CountryId): PaymentsMenuConfig {
  return {
    title: "Payments",
    primaryItems: DEFAULT_PRIMARY_ITEMS,
    otherTitle: "OTHER",
    otherItems: DEFAULT_OTHER_ITEMS,
    newPaymentSheet: {
      title: "New payment",
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
    },
  };
}

export const PAYMENTS_MENU_CONFIG: Record<CountryId, PaymentsMenuConfig> = {
  RO: createPaymentsMenuConfig("RO"),
  CZ: createPaymentsMenuConfig("CZ"),
  SK: createPaymentsMenuConfig("SK"),
  HU: createPaymentsMenuConfig("HU"),
  RS: createPaymentsMenuConfig("RS"),
  BA: createPaymentsMenuConfig("BA"),
  SI: createPaymentsMenuConfig("SI"),
};

export function getPaymentsMenuForCountry(country: CountryId): PaymentsMenuConfig {
  return PAYMENTS_MENU_CONFIG[country];
}
