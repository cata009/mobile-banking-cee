import { describe, expect, it } from "vitest";
import * as accountProductDetails from "@/data/accountProductDetails";
import type { Loan, Mortgage, TermDeposit } from "@/data/products";

type ExpectedDetailsApi = {
  calculateProgress: (completed: number, total: number) => number;
  getLoanDetails: (product: Loan | Mortgage) => {
    ownedAmount: number;
    originalAmount: number;
    paidAmount: number;
    nextInstallment: number;
    progress: number;
    startDate: string;
    finalPayment: string;
  };
};

const detailsApi = accountProductDetails as typeof accountProductDetails & Partial<ExpectedDetailsApi>;

const termDeposit: TermDeposit = {
  id: "term-test",
  type: "term_deposit",
  name: "Term Deposit",
  accountNumber: "RO10TEST",
  balance: 10_000,
  currency: "RON",
};

const personalLoan: Loan = {
  id: "loan-test",
  type: "loan",
  name: "Personal Loan",
  accountNumber: "RO20TEST",
  balance: -9_706.21,
  currency: "RON",
};

const mortgage: Mortgage = {
  id: "mortgage-test",
  type: "mortgage",
  name: "Mortgage Loan",
  accountNumber: "RO30TEST",
  balance: -614_726.36,
  currency: "RON",
};

describe("account product detail models", () => {
  it("derives term-deposit progress from its connected start and maturity dates", () => {
    const details = accountProductDetails.getTermDepositDetails(termDeposit, "RO40CURRENT");

    expect(details.startValueDate).toBe("20.09.2025");
    expect(details.maturityDate).toBe("20.09.2026");
    expect((details as typeof details & { progress?: number }).progress).toBeCloseTo(0.83, 2);
  });

  it("clamps reusable progress to the zero-to-one interval", () => {
    expect(detailsApi.calculateProgress).toBeTypeOf("function");
    if (!detailsApi.calculateProgress) return;

    expect(detailsApi.calculateProgress(-10, 100)).toBe(0);
    expect(detailsApi.calculateProgress(45, 100)).toBe(0.45);
    expect(detailsApi.calculateProgress(150, 100)).toBe(1);
    expect(detailsApi.calculateProgress(1, 0)).toBe(0);
  });

  it("connects personal-loan repayment progress to owned and original amounts", () => {
    expect(detailsApi.getLoanDetails).toBeTypeOf("function");
    if (!detailsApi.getLoanDetails) return;

    const details = detailsApi.getLoanDetails(personalLoan);

    expect(details.ownedAmount).toBe(9_706.21);
    expect(details.originalAmount).toBe(16_177.02);
    expect(details.paidAmount).toBeCloseTo(details.originalAmount - details.ownedAmount, 2);
    expect(details.progress).toBeCloseTo(details.paidAmount / details.originalAmount, 5);
    expect(details.progress).toBeCloseTo(0.4, 5);
    expect(details.nextInstallment).toBe(291.19);
    expect(details.startDate).toBe("20.07.2024");
    expect(details.finalPayment).toBe("20.07.2029");
  });

  it("connects mortgage repayment progress to owned and original amounts", () => {
    expect(detailsApi.getLoanDetails).toBeTypeOf("function");
    if (!detailsApi.getLoanDetails) return;

    const details = detailsApi.getLoanDetails(mortgage);

    expect(details.ownedAmount).toBe(614_726.36);
    expect(details.originalAmount).toBe(731_817.1);
    expect(details.paidAmount).toBeCloseTo(details.originalAmount - details.ownedAmount, 2);
    expect(details.progress).toBeCloseTo(details.paidAmount / details.originalAmount, 5);
    expect(details.progress).toBeCloseTo(0.16, 5);
    expect(details.nextInstallment).toBe(3_512.72);
    expect(details.startDate).toBe("20.07.2022");
    expect(details.finalPayment).toBe("20.07.2047");
  });
});
