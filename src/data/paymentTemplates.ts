import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import type { Currency } from "@/data/products";

export type PaymentTemplateSelectionKind = "template" | "beneficiary";

export interface PaymentTemplateSelection {
  id: string;
  kind: PaymentTemplateSelectionKind;
  title: string;
  beneficiaryName: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  amount: string;
  currency: Currency;
  paymentNote: string;
}

function getCountryPrefix(country: CountryId) {
  return country === "BA_BL" ? "BA" : country;
}

function createDemoAccountNumber(country: CountryId, suffix: string) {
  return `${getCountryPrefix(country)}49BACX000009${suffix}`;
}

function createSelection(
  country: CountryId,
  selection: Omit<PaymentTemplateSelection, "accountNumber" | "currency" | "bankCode" | "bankName"> & {
    accountSuffix: string;
  },
): PaymentTemplateSelection {
  const currency = getCountryConfig(country).currency;

  return {
    id: selection.id,
    kind: selection.kind,
    title: selection.title,
    beneficiaryName: selection.beneficiaryName,
    accountNumber: createDemoAccountNumber(country, selection.accountSuffix),
    bankCode: "0292",
    bankName: "Demo Commerce Bank",
    amount: selection.amount,
    currency,
    paymentNote: selection.paymentNote,
  };
}

export function getPaymentTemplates(country: CountryId): PaymentTemplateSelection[] {
  return [
    createSelection(country, {
      id: "green-energy",
      kind: "template",
      title: "GREEN ENERGY INVOICE",
      beneficiaryName: "Green Energy Services",
      accountSuffix: "310001",
      amount: "286,40",
      paymentNote: "Monthly electricity invoice",
    }),
    createSelection(country, {
      id: "monthly-rent",
      kind: "template",
      title: "MONTHLY RENT",
      beneficiaryName: "North Residence",
      accountSuffix: "310002",
      amount: "2.750,00",
      paymentNote: "Apartment rent",
    }),
    createSelection(country, {
      id: "music-lessons",
      kind: "template",
      title: "MUSIC LESSONS",
      beneficiaryName: "Harmony Studio",
      accountSuffix: "310003",
      amount: "420,00",
      paymentNote: "Monthly course fee",
    }),
    createSelection(country, {
      id: "family-savings",
      kind: "template",
      title: "FAMILY SAVINGS",
      beneficiaryName: "Maria Popescu",
      accountSuffix: "310004",
      amount: "1.150,00",
      paymentNote: "Savings transfer",
    }),
    createSelection(country, {
      id: "sports-club",
      kind: "template",
      title: "SPORTS CLUB",
      beneficiaryName: "Active Life Club",
      accountSuffix: "310005",
      amount: "195,00",
      paymentNote: "Monthly membership",
    }),
  ];
}

export function getSavedBeneficiaries(country: CountryId): PaymentTemplateSelection[] {
  return [
    createSelection(country, {
      id: "maria-popescu",
      kind: "beneficiary",
      title: "MARIA POPESCU",
      beneficiaryName: "Maria Popescu",
      accountSuffix: "410001",
      amount: "",
      paymentNote: "",
    }),
    createSelection(country, {
      id: "victor-ionescu",
      kind: "beneficiary",
      title: "VICTOR IONESCU",
      beneficiaryName: "Victor Ionescu",
      accountSuffix: "410002",
      amount: "",
      paymentNote: "",
    }),
    createSelection(country, {
      id: "bright-future-foundation",
      kind: "beneficiary",
      title: "BRIGHT FUTURE FOUNDATION",
      beneficiaryName: "Bright Future Foundation",
      accountSuffix: "410003",
      amount: "",
      paymentNote: "",
    }),
  ];
}
