import { formatMoneyNumber, getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import type { AccountTransaction } from "@/data/accountDetails";
import { getPfmCategory, normalizePfmCategory } from "@/data/pfmCategories";
import type { PfmCategoryName } from "@/data/pfmCategories";
import type { Product } from "@/data/products";

export type DomesticPaymentEntry = "new" | "redo";

export interface DomesticPaymentDraft {
  entry: DomesticPaymentEntry;
  payerAccountName: string;
  payerAccountNumber: string;
  payerBalance: string;
  beneficiaryName: string;
  prefix: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  amount: string;
  currency: string;
  instantPayment: boolean;
  dueDate: string;
  expressPayment: boolean;
  informationForBeneficiary: string;
  informationForMe: string;
}

export interface TransactionDetailData {
  title: string;
  bookingDate: string;
  amount: string;
  categoryGroup: string;
  categoryTag: string;
  pfmCategory: PfmCategoryName;
  pfmCategoryLabel: string;
  pfmCategoryColorVar: string;
  pfmSubcategoryLabel: string;
  accountNumber: string;
  accountTitle: string;
  accountOwner: string;
  beneficiaryName: string;
  beneficiaryBankName: string;
  beneficiaryAccountNumber: string;
  paymentDetails: string;
  referenceNumber: string;
}

const COUNTRY_BANK_NAMES: Record<CountryId, string> = {
  RO: "UniCredit Bank Romania",
  CZ: "UniCredit Bank Czech Republic and Slovakia",
  SK: "UniCredit Bank Czech Republic and Slovakia",
  HU: "UniCredit Bank Hungary",
  RS: "UniCredit Bank Serbia",
  BA: "UniCredit Bank Bosnia and Herzegovina",
  BA_BL: "UniCredit Bank Bosnia and Herzegovina",
  SI: "UniCredit Bank Slovenia",
};

const COUNTRY_BANK_CODES: Record<CountryId, string> = {
  RO: "0292",
  CZ: "0800",
  SK: "1100",
  HU: "1091",
  RS: "170",
  BA: "129",
  BA_BL: "129",
  SI: "2900",
};

const MONTH_TO_NUMBER: Record<string, string> = {
  JAN: "01",
  FEB: "02",
  MAR: "03",
  APR: "04",
  MAY: "05",
  JUN: "06",
  JUL: "07",
  AUG: "08",
  SEP: "09",
  OCT: "10",
  NOV: "11",
  DEC: "12",
};

function formatTransactionDate(transaction: AccountTransaction) {
  const [year, month] = transaction.monthKey.split("-");
  return `${transaction.day}.${month ?? MONTH_TO_NUMBER[transaction.month] ?? "01"}.${year ?? "2026"}`;
}

function compactAccountNumber(accountNumber: string, country: CountryId) {
  if (country === "CZ") return "1208187008/2700";
  if (country === "SK") return "1208187008/1100";
  if (country === "RO") return "12081870082700";
  return accountNumber.replace(/\s/g, "");
}

function beneficiaryAccount(country: CountryId) {
  if (country === "CZ") return "CZ40270000000021070555322";
  if (country === "SK") return "SK40270000000021070555322";
  if (country === "RO") return "RO49BACX000008204119876";
  if (country === "BA_BL") return "BA40270000000021070555322";
  return `${country}40270000000021070555322`;
}

function defaultPayerAccount(country: CountryId, product?: Product | null) {
  const config = getCountryConfig(country);
  const productAccount = product?.accountNumber || compactAccountNumber("", country);

  return {
    name: product?.name || "Primary Account",
    number: compactAccountNumber(productAccount, country),
    balance: `300.020,00 ${config.currency}`,
  };
}

export function createEmptyDomesticPaymentDraft(
  country: CountryId,
  product?: Product | null,
): DomesticPaymentDraft {
  const config = getCountryConfig(country);
  const payer = defaultPayerAccount(country, product);

  return {
    entry: "new",
    payerAccountName: payer.name,
    payerAccountNumber: payer.number,
    payerBalance: payer.balance,
    beneficiaryName: "",
    prefix: "",
    accountNumber: "",
    bankCode: "",
    bankName: "",
    amount: "",
    currency: config.currency,
    instantPayment: true,
    dueDate: "15.02.2026",
    expressPayment: false,
    informationForBeneficiary: "",
    informationForMe: "",
  };
}

export function createTransactionDetailData(
  transaction: AccountTransaction,
  country: CountryId,
  product?: Product | null,
): TransactionDetailData {
  const config = getCountryConfig(country);
  const amount = `${transaction.amount < 0 ? "-" : ""}${formatMoneyNumber(Math.abs(transaction.amount), country)} ${config.currency}`;
  const pfmCategory = normalizePfmCategory(transaction.pfmCategory || transaction.category);
  const pfmCategoryDefinition = getPfmCategory(pfmCategory);
  const categoryTag =
    transaction.pfmSubcategory || (pfmCategory === "Children" ? "School fees" : pfmCategory);

  return {
    title: transaction.label,
    bookingDate: formatTransactionDate(transaction),
    amount,
    categoryGroup: pfmCategory.toUpperCase(),
    categoryTag: categoryTag.toUpperCase(),
    pfmCategory,
    pfmCategoryLabel: pfmCategoryDefinition.name,
    pfmCategoryColorVar: pfmCategoryDefinition.colorVar,
    pfmSubcategoryLabel: categoryTag,
    accountNumber: compactAccountNumber(product?.accountNumber || "", country),
    accountTitle: product?.name || "Primary Account",
    accountOwner: "John Snow",
    beneficiaryName: transaction.label,
    beneficiaryBankName: COUNTRY_BANK_NAMES[country],
    beneficiaryAccountNumber: beneficiaryAccount(country),
    paymentDetails: transaction.details || `Payment ${transaction.month.toLowerCase()} - ${transaction.label}`,
    referenceNumber: "6041300502",
  };
}

export function createRedoDomesticPaymentDraft(
  transaction: AccountTransaction,
  country: CountryId,
  product?: Product | null,
): DomesticPaymentDraft {
  const config = getCountryConfig(country);
  const payer = defaultPayerAccount(country, product);
  const amount = Math.abs(transaction.amount);

  return {
    entry: "redo",
    payerAccountName: payer.name,
    payerAccountNumber: payer.number,
    payerBalance: payer.balance,
    beneficiaryName: transaction.label,
    prefix: country === "CZ" ? "19" : "",
    accountNumber: "2000145399",
    bankCode: COUNTRY_BANK_CODES[country],
    bankName: COUNTRY_BANK_NAMES[country],
    amount: amount % 1 === 0 ? String(amount) : amount.toFixed(2).replace(".", ","),
    currency: config.currency,
    instantPayment: true,
    dueDate: formatTransactionDate(transaction),
    expressPayment: false,
    informationForBeneficiary: transaction.details || `Payment ${transaction.month.toLowerCase()} - ${transaction.label}`,
    informationForMe: "",
  };
}

export function formatDraftAmount(draft: DomesticPaymentDraft) {
  const normalized = draft.amount.replace(/\s/g, "").replace(",", ".");
  const numericAmount = Number(normalized);

  if (!Number.isFinite(numericAmount)) {
    return draft.amount ? `${draft.amount} ${draft.currency}` : `0,00 ${draft.currency}`;
  }

  return `${new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)} ${draft.currency}`;
}
