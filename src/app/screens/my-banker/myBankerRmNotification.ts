/**
 * RM notification for a My Banker inquiry.
 *
 * Stands in for the back-end call that e-mails the client's relationship
 * manager. The contract the screen depends on: it never rejects. A delivery
 * failure resolves with `delivered: false` and a reason, so the client keeps
 * their success state while the failure stays visible to whoever reads the
 * event log.
 */

import { MY_BANKER_RM } from "@/data/myBankerCore";
import type { MyBankerProductKey } from "@/data/myBankerCore";

export interface MyBankerRmRequest {
  clientId: string;
  productKey: MyBankerProductKey;
  productName: string;
  amount: number;
  currency: string;
  termMonths: number | null;
  ratePercent: number | null;
  message: string;
}

export interface MyBankerRmDelivery {
  delivered: boolean;
  recipient: string;
  reason?: string;
}

/** Milliseconds the mock takes to "reach" the mail gateway. */
const DELIVERY_LATENCY_MS = 450;

export function sendMyBankerRequestToRm(request: MyBankerRmRequest): Promise<MyBankerRmDelivery> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        delivered: request.clientId.length > 0,
        recipient: MY_BANKER_RM.email,
        reason: request.clientId.length > 0 ? undefined : "missing-client-identifier",
      });
    }, DELIVERY_LATENCY_MS);
  });
}
