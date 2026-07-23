/**
 * useTransactionCategoryOverrides
 *
 * Owns the session-local PFM recategorization map that was previously inlined in
 * the App god-component. A confirmed change records the override by transaction
 * id and keeps the currently-selected transaction (if it is the one changed) in
 * sync, so list and detail views agree for the demo session.
 */

import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AccountTransaction } from "@/data/accountDetails";
import type { PfmCategorySelection } from "@/data/pfmCategories";

interface UseTransactionCategoryOverridesOptions {
  /** The shared selected-transaction setter, kept in sync on a matching change. */
  setSelectedTransaction: Dispatch<SetStateAction<AccountTransaction | null>>;
}

export function useTransactionCategoryOverrides({
  setSelectedTransaction,
}: UseTransactionCategoryOverridesOptions) {
  const [transactionCategoryOverrides, setTransactionCategoryOverrides] = useState<
    Record<string, PfmCategorySelection>
  >({});

  const handleTransactionCategoryChange = useCallback(
    (transaction: AccountTransaction, selection: PfmCategorySelection) => {
      const updatedTransaction: AccountTransaction = {
        ...transaction,
        category: selection.groupLabel,
        pfmCategory: selection.category,
        pfmSubcategory: selection.subcategory,
      };

      setTransactionCategoryOverrides((current) => ({
        ...current,
        [transaction.id]: selection,
      }));
      setSelectedTransaction((current) =>
        current?.id === transaction.id ? updatedTransaction : current,
      );
    },
    [setSelectedTransaction],
  );

  return { transactionCategoryOverrides, handleTransactionCategoryChange };
}
