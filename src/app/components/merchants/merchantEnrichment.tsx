import MerchantLogo from "@/app/components/merchants/MerchantLogo";
import type { CardTransactionMerchantEnrichment } from "@/app/screens/payments/DomesticPaymentFlowScreens";
import type { Country } from "@/app/state/demoTypes";
import { getMerchantLocation, resolveTransactionMerchant, type MerchantResolvable } from "@/data/merchantDirectory";

/** Diameter of the merchant mark on the transaction detail header. */
const DETAIL_LOGO_SIZE = 64;

/**
 * Builds the merchant header for a card transaction detail: the clean merchant
 * name replaces the raw ledger descriptor, the brand mark replaces the PFM
 * roundel, and a store address is attached when the merchant has stores in the
 * active market.
 *
 * Returns undefined for account transactions and for card activity with no
 * brandable counterparty, so the detail keeps its PFM presentation.
 */
export function getCardMerchantEnrichment(
  transaction: MerchantResolvable,
  country: Country,
): CardTransactionMerchantEnrichment | undefined {
  const merchant = resolveTransactionMerchant(transaction);
  if (!merchant) return undefined;

  const address = getMerchantLocation(merchant, country);

  return {
    cleanMerchantName: merchant.name,
    merchantLogo: <MerchantLogo merchant={merchant} size={DETAIL_LOGO_SIZE} elevated />,
    ...(address ? { location: { label: "Merchant location", address } } : {}),
    ...(merchant.mcc ? { mcc: merchant.mcc } : {}),
  };
}
