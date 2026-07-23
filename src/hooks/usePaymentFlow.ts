/**
 * usePaymentFlow
 *
 * Owns the domestic-payment draft lifecycle that was previously inlined in the
 * App god-component: the draft state plus the five handlers that create it
 * (redo / empty / from-template), advance it to review, and clear it on
 * completion. The hook reads navigation from context itself, so callers only
 * pass the data a draft is built from.
 */

import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useNavigationContext } from "@/app/contexts/NavigationContext";
import {
  createEmptyDomesticPaymentDraft,
  createRedoDomesticPaymentDraft,
  createTemplateDomesticPaymentDraft,
  type DomesticPaymentDraft,
} from "@/data/paymentFlow";
import type { AccountTransaction } from "@/data/accountDetails";
import type { PaymentTemplateSelection } from "@/data/paymentTemplates";
import type { Product } from "@/data/products";
import type { CountryId } from "@/app/state/demoTypes";

interface UsePaymentFlowOptions {
  country: CountryId;
  /** Account the draft debits from (falls back inside the draft creators when null). */
  selectedAccountProduct: Product | null;
  /** Source transaction for a "redo payment" draft. */
  selectedTransaction: AccountTransaction | null;
  /** Shared selected-transaction setter; cleared when the flow completes. */
  setSelectedTransaction: Dispatch<SetStateAction<AccountTransaction | null>>;
}

export function usePaymentFlow({
  country,
  selectedAccountProduct,
  selectedTransaction,
  setSelectedTransaction,
}: UsePaymentFlowOptions) {
  const { navigateTo } = useNavigationContext();
  const [paymentDraft, setPaymentDraft] = useState<DomesticPaymentDraft | null>(null);

  const handleRedoPaymentClick = useCallback(() => {
    if (!selectedTransaction) return;
    setPaymentDraft(createRedoDomesticPaymentDraft(selectedTransaction, country, selectedAccountProduct));
    navigateTo("domestic-payment");
  }, [country, navigateTo, selectedAccountProduct, selectedTransaction]);

  const handleDomesticPaymentClick = useCallback(() => {
    setPaymentDraft(createEmptyDomesticPaymentDraft(country, selectedAccountProduct));
    navigateTo("domestic-payment");
  }, [country, navigateTo, selectedAccountProduct]);

  const handlePaymentTemplateSelect = useCallback((selection: PaymentTemplateSelection) => {
    setPaymentDraft(createTemplateDomesticPaymentDraft(selection, country, selectedAccountProduct));
    navigateTo("domestic-payment");
  }, [country, navigateTo, selectedAccountProduct]);

  const handleDomesticPaymentNext = useCallback((nextDraft: DomesticPaymentDraft) => {
    setPaymentDraft(nextDraft);
    navigateTo("payment-review");
  }, [navigateTo]);

  const handlePaymentDone = useCallback(() => {
    setPaymentDraft(null);
    setSelectedTransaction(null);
    navigateTo("payments");
  }, [navigateTo, setSelectedTransaction]);

  return {
    paymentDraft,
    handleRedoPaymentClick,
    handleDomesticPaymentClick,
    handlePaymentTemplateSelect,
    handleDomesticPaymentNext,
    handlePaymentDone,
  };
}
