import { parseIsoDateOnly } from "@/app/utils/dateOnly";
import type { Loan, Mortgage, TermDeposit } from "@/data/products";

const TERM_DEPOSIT_ANNUAL_INTEREST_RATE = 0.035;
const ACCOUNT_PRODUCT_REFERENCE_DATE = "2026-07-20";
const TERM_DEPOSIT_START_DATE = "2025-09-20";
const TERM_DEPOSIT_MATURITY_DATE = "2026-09-20";

const LOAN_DETAIL_PROFILES = {
  loan: {
    repaymentProgress: 0.4,
    installmentRate: 0.018,
    nextInstallmentDate: "2026-08-05",
    interestRate: "6.25%",
    overdueInterestRate: "0.00%",
    startDate: "2024-07-20",
    finalPayment: "2029-07-20",
  },
  mortgage: {
    repaymentProgress: 0.16,
    installmentRate: 0.0048,
    nextInstallmentDate: "2026-08-05",
    interestRate: "4.35%",
    overdueInterestRate: "0.00%",
    startDate: "2022-07-20",
    finalPayment: "2047-07-20",
  },
} as const;

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function formatIsoDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

export function calculateProgress(completed: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, completed / total));
}

function calculateDateProgress(startDate: string, endDate: string, referenceDate: string) {
  const start = parseIsoDateOnly(startDate).getTime();
  const end = parseIsoDateOnly(endDate).getTime();
  const reference = parseIsoDateOnly(referenceDate).getTime();
  return calculateProgress(reference - start, end - start);
}

export function getTermDepositMaturityAmount(product: Pick<TermDeposit, "balance">) {
  return roundCurrency(product.balance * (1 + TERM_DEPOSIT_ANNUAL_INTEREST_RATE));
}

export function getTermDepositDetails(
  product: Pick<TermDeposit, "balance">,
  currentAccountNumber: string,
) {
  const interestAmountBeforeTax = roundCurrency(
    product.balance * TERM_DEPOSIT_ANNUAL_INTEREST_RATE,
  );

  return {
    maturityAmount: getTermDepositMaturityAmount(product),
    interestAmountBeforeTax,
    maturityDate: formatIsoDate(TERM_DEPOSIT_MATURITY_DATE),
    rollover: "Yes",
    accountOwner: "John Snow",
    depositAmount: product.balance,
    startValueDate: formatIsoDate(TERM_DEPOSIT_START_DATE),
    maturityPeriod: "12 months",
    interestRatePerYear: `${(TERM_DEPOSIT_ANNUAL_INTEREST_RATE * 100).toFixed(2)}%`,
    currentAccountNumber,
    decreaseAmountBy: 0,
    reinvestInterest: "Yes",
    progress: calculateDateProgress(
      TERM_DEPOSIT_START_DATE,
      TERM_DEPOSIT_MATURITY_DATE,
      ACCOUNT_PRODUCT_REFERENCE_DATE,
    ),
  };
}

export function getLoanDetails(product: Loan | Mortgage) {
  const profile = LOAN_DETAIL_PROFILES[product.type];
  const ownedAmount = roundCurrency(Math.abs(product.balance));
  const originalAmount = roundCurrency(ownedAmount / (1 - profile.repaymentProgress));
  const paidAmount = roundCurrency(originalAmount - ownedAmount);

  return {
    nextInstallment: roundCurrency(originalAmount * profile.installmentRate),
    nextInstallmentDate: formatIsoDate(profile.nextInstallmentDate),
    interestRate: profile.interestRate,
    overdueAmount: 0,
    overdueInterestRate: profile.overdueInterestRate,
    ownedAmount,
    originalAmount,
    paidAmount,
    iban: product.accountNumber,
    accountOwner: "John Snow",
    startDate: formatIsoDate(profile.startDate),
    finalPayment: formatIsoDate(profile.finalPayment),
    progress: calculateProgress(paidAmount, originalAmount),
  };
}
