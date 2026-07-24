// @vitest-environment node

import { describe, expect, it } from "vitest";
import {
  decidePayment,
  RS_INSTANT_THRESHOLD,
  RS_WEEKLY_LIMIT,
  RS_PAYEES,
  getRsPayee,
} from "@/app/screens/kids/rs/payees";

/**
 * decidePayment matrix — the balance-aware parent-approval brain.
 *
 * This is the test the RO Teens engine never had (RO's decidePayment was
 * balance-blind and untested). Serbia checks `amount > balance` as a hard
 * block, so the matrix below proves the engine is honest about coverage.
 */
describe("RS Teens decidePayment matrix", () => {
  // A trusted family payee with a generous per-payment limit.
  const trustedPayee = getRsPayee("payee-tata")!;
  // A payee flagged always-needs-approval (friend, untrusted).
  const alwaysApprovalPayee = getRsPayee("payee-marko")!;
  // A merchant flagged alwaysNeedsApproval (dm).
  const alwaysApprovalMerchant = getRsPayee("payee-dm")!;

  const baseCtx = {
    weeklyRemaining: RS_WEEKLY_LIMIT,
    balance: 10_000,
    instantThreshold: RS_INSTANT_THRESHOLD,
  };

  it("blocks non-positive amounts", () => {
    expect(
      decidePayment({ amount: 0, payee: trustedPayee, ...baseCtx }).status,
    ).toBe("blocked");
    expect(
      decidePayment({ amount: -50, payee: trustedPayee, ...baseCtx }).status,
    ).toBe("blocked");
  });

  it("blocks amounts above the per-payee limit", () => {
    expect(
      decidePayment({
        amount: trustedPayee.perPaymentLimit + 1,
        payee: trustedPayee,
        ...baseCtx,
      }).status,
    ).toBe("blocked");
  });

  it("blocks amounts above the remaining weekly capacity", () => {
    expect(
      decidePayment({
        amount: baseCtx.weeklyRemaining + 1,
        payee: trustedPayee,
        ...baseCtx,
      }).status,
    ).toBe("blocked");
  });

  it("blocks amounts the balance cannot cover (the RO engine did not check this)", () => {
    const decision = decidePayment({
      amount: 600,
      payee: trustedPayee,
      weeklyRemaining: RS_WEEKLY_LIMIT,
      balance: 100,
      instantThreshold: RS_INSTANT_THRESHOLD,
    });
    expect(decision.status).toBe("blocked");
    expect(decision.reason).toContain("Nemaš dovoljno");
  });

  it("routes always-needs-approval payees to the parent regardless of amount", () => {
    const small = decidePayment({ amount: 50, payee: alwaysApprovalPayee, ...baseCtx });
    expect(small.status).toBe("needs-approval");
    const merchant = decidePayment({ amount: 100, payee: alwaysApprovalMerchant, ...baseCtx });
    expect(merchant.status).toBe("needs-approval");
  });

  it("settles instantly when a trusted payee is paid within the instant threshold", () => {
    const decision = decidePayment({
      amount: RS_INSTANT_THRESHOLD,
      payee: trustedPayee,
      ...baseCtx,
    });
    expect(decision.status).toBe("instant");
  });

  it("routes trusted payees above the instant threshold to the parent", () => {
    const decision = decidePayment({
      amount: RS_INSTANT_THRESHOLD + 1,
      payee: trustedPayee,
      ...baseCtx,
    });
    expect(decision.status).toBe("needs-approval");
    expect(decision.reason).toContain("Tata");
  });

  it("prioritises hard blocks over approval routing", () => {
    // Over the per-payee limit AND always-needs-approval → still blocked, not approval.
    const overLimit = decidePayment({
      amount: alwaysApprovalMerchant.perPaymentLimit + 1,
      payee: alwaysApprovalMerchant,
      ...baseCtx,
    });
    expect(overLimit.status).toBe("blocked");
  });

  it("exposes the full Serbian payee catalogue with consistent trust flags", () => {
    expect(RS_PAYEES.length).toBeGreaterThanOrEqual(12);
    for (const payee of RS_PAYEES) {
      expect(payee.perPaymentLimit).toBeGreaterThan(0);
      expect(typeof payee.trusted).toBe("boolean");
      expect(typeof payee.alwaysNeedsApproval).toBe("boolean");
      // A payee that always needs approval is never trusted-instant.
      if (payee.alwaysNeedsApproval) {
        expect(payee.trusted).toBe(false);
      }
    }
  });
});
