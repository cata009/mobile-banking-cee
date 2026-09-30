import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { BANK_BADGES } from "@/app/config/bankLogos";
import type { Currency } from "@/data/products";
import {
  deleteFrequentBeneficiary,
  getFrequentBeneficiaries,
  saveFrequentBeneficiaryDetails,
  type FrequentBeneficiary,
} from "@/data/paymentsHub";

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
  bank?: FrequentBeneficiary["bank"];
  recipientKind?: FrequentBeneficiary["recipientKind"];
  paymentAccountPrefix?: string;
  paymentAccountNumber?: string;
}

interface StoredPaymentSelectionChanges {
  updated: Record<string, Partial<PaymentTemplateSelection>>;
  deletedIds: string[];
}

const PAYMENT_SELECTIONS_STORAGE_KEY = "uc.evo2027.payments.templateChanges";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPaymentTemplateSelection(value: unknown): value is PaymentTemplateSelection {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && (value.kind === "template" || value.kind === "beneficiary")
    && typeof value.title === "string"
    && typeof value.beneficiaryName === "string"
    && typeof value.accountNumber === "string"
    && typeof value.bankCode === "string"
    && typeof value.bankName === "string"
    && typeof value.amount === "string"
    && typeof value.currency === "string"
    && typeof value.paymentNote === "string";
}

function getStoredPaymentSelectionChanges(country: CountryId): StoredPaymentSelectionChanges {
  const empty: StoredPaymentSelectionChanges = { updated: {}, deletedIds: [] };
  if (typeof window === "undefined") return empty;

  try {
    const stored: unknown = JSON.parse(
      window.localStorage.getItem(`${PAYMENT_SELECTIONS_STORAGE_KEY}.${country}`) ?? "{}",
    );
    if (!isRecord(stored)) return empty;
    const updated = isRecord(stored.updated) ? stored.updated : {};
    return {
      updated: Object.fromEntries(Object.entries(updated).filter(([, value]) => isRecord(value))) as Record<
        string,
        Partial<PaymentTemplateSelection>
      >,
      deletedIds: Array.isArray(stored.deletedIds)
        ? stored.deletedIds.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch {
    return empty;
  }
}

function storePaymentSelectionChanges(country: CountryId, changes: StoredPaymentSelectionChanges) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${PAYMENT_SELECTIONS_STORAGE_KEY}.${country}`, JSON.stringify(changes));
  } catch {
    /* Changes still update the current details page if storage is unavailable. */
  }
}

function applyPaymentSelectionChanges(country: CountryId, items: PaymentTemplateSelection[]) {
  const changes = getStoredPaymentSelectionChanges(country);
  const deletedIds = new Set(changes.deletedIds);
  return items
    .filter((item) => !deletedIds.has(item.id))
    .map((item) => ({ ...item, ...changes.updated[item.id] }))
    .filter(isPaymentTemplateSelection);
}

export function savePaymentTemplateSelection(country: CountryId, selection: PaymentTemplateSelection) {
  if (selection.kind === "beneficiary") {
    const existing = getFrequentBeneficiaries(country).find((person) => person.id === selection.id);
    if (existing) {
      saveFrequentBeneficiaryDetails({
        ...existing,
        name: selection.beneficiaryName,
        paymentAccountPrefix: selection.paymentAccountPrefix ?? existing.paymentAccountPrefix,
        paymentAccountNumber: selection.paymentAccountNumber ?? existing.paymentAccountNumber,
        paymentBankCode: selection.bankCode,
        bank: selection.bank ?? existing.bank,
        recipientKind: selection.recipientKind ?? existing.recipientKind,
      });
    }
    return;
  }

  const changes = getStoredPaymentSelectionChanges(country);
  changes.updated[selection.id] = selection;
  changes.deletedIds = changes.deletedIds.filter((id) => id !== selection.id);
  storePaymentSelectionChanges(country, changes);
}

export function deletePaymentTemplateSelection(country: CountryId, selectionId: string) {
  if (getFrequentBeneficiaries(country).some((person) => person.id === selectionId)) {
    deleteFrequentBeneficiary(country, selectionId);
    return;
  }

  const changes = getStoredPaymentSelectionChanges(country);
  delete changes.updated[selectionId];
  if (!changes.deletedIds.includes(selectionId)) changes.deletedIds.push(selectionId);
  storePaymentSelectionChanges(country, changes);
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
  return applyPaymentSelectionChanges(country, [
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
  ]);
}

export function getEvo2027TemplateBeneficiaryName(
  template: PaymentTemplateSelection,
  country: CountryId,
): string {
  if (country === "CZ" && template.id === "family-savings" && template.beneficiaryName === "Maria Popescu") {
    return "Marie Novotná";
  }
  return template.beneficiaryName;
}

export function getSavedBeneficiaries(
  country: CountryId,
  synchronizeWithPaymentsHome = true,
): PaymentTemplateSelection[] {
  if (synchronizeWithPaymentsHome) {
    return getFrequentBeneficiaries(country).map(mapFrequentBeneficiaryToSelection);
  }

  return applyPaymentSelectionChanges(country, [
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
  ]);
}

export function mapFrequentBeneficiaryToSelection(person: FrequentBeneficiary): PaymentTemplateSelection {
  return {
    id: person.id,
    kind: "beneficiary",
    title: person.name.toLocaleUpperCase(),
    beneficiaryName: person.name,
    accountNumber: person.accountNumber,
    bankCode: person.paymentBankCode,
    bankName: BANK_BADGES[person.bank].name,
    amount: "",
    currency: person.currency,
    paymentNote: "",
    bank: person.bank,
    recipientKind: person.recipientKind,
    paymentAccountPrefix: person.paymentAccountPrefix ?? "",
    paymentAccountNumber: person.paymentAccountNumber,
  };
}
