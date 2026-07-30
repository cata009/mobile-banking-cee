import type { CardTransactionMerchantEnrichment } from "@/app/screens/payments/DomesticPaymentFlowScreens";
import type { AccountTransaction } from "@/data/accountDetails";
import { HuMerchantDetailLogo } from "./merchantLogos";
import type { HuKidsTransaction, HuMerchantLogoId } from "./types";

type MerchantDetail = Pick<CardTransactionMerchantEnrichment, "cleanMerchantName" | "location" | "mcc">;

const HU_MERCHANT_DETAILS: Record<HuMerchantLogoId, MerchantDetail> = {
  mcdonalds: {
    cleanMerchantName: "McDonalds",
    location: {
      label: "Merchant location",
      address: "McDonald's · Váci utca 1, Budapest",
    },
    mcc: "5814 · Fast food restaurants",
  },
  spotify: {
    cleanMerchantName: "Spotify",
    mcc: "4899 · Streaming services",
  },
  tesco: {
    cleanMerchantName: "Tesco",
    location: {
      label: "Merchant location",
      address: "Tesco · Váci út 178, Budapest",
    },
    mcc: "5411 · Grocery stores, supermarkets",
  },
  youtube: { cleanMerchantName: "YouTube", mcc: "4899 · Streaming services" },
  apple: { cleanMerchantName: "Apple", mcc: "5734 · Computer software stores" },
  roblox: { cleanMerchantName: "Roblox", mcc: "5816 · Digital goods" },
  netflix: { cleanMerchantName: "Netflix", mcc: "4899 · Streaming services" },
  ikea: {
    cleanMerchantName: "IKEA",
    location: {
      label: "Merchant location",
      address: "IKEA · Örs vezér tere 22, Budapest",
    },
    mcc: "5712 · Furniture stores",
  },
  steam: { cleanMerchantName: "Steam", mcc: "5816 · Digital goods" },
  amazon: { cleanMerchantName: "Amazon", mcc: "5942 · Book stores" },
  nintendo: { cleanMerchantName: "Nintendo", mcc: "5816 · Digital goods" },
  playstation: { cleanMerchantName: "PlayStation", mcc: "5816 · Digital goods" },
};

/** Card-originated Kids rows are the rows that already carry a merchant logo. */
export function getHuKidsCardMerchantEnrichment(
  transaction: AccountTransaction,
): CardTransactionMerchantEnrichment | undefined {
  const merchantLogo = (transaction as HuKidsTransaction).merchantLogo;
  if (!merchantLogo) return undefined;

  const detail = HU_MERCHANT_DETAILS[merchantLogo];
  return {
    ...detail,
    merchantLogo: <HuMerchantDetailLogo merchant={merchantLogo} />,
  };
}
