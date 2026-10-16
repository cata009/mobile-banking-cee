import React from 'react';
import type { AccountTransaction } from '@/data/accountDetails';
import { MERCHANTS } from '@/data/merchantDirectory';
import type { NativeTransactionLeadingVisual as NativeTransactionLeadingVisualDTO } from '@/features/demo-native/bankingPresentation';
import { BaselineTransactionAvatar } from '../../../../universal/BaselineTransactionAvatar';

export function NativeTransactionLeadingVisual({
  transaction,
  visual,
}: {
  transaction?: AccountTransaction;
  visual: NativeTransactionLeadingVisualDTO;
}) {
  switch (visual.kind) {
    case 'identity':
      return (
        <BaselineTransactionAvatar
          transaction={transaction}
          identity={visual.identity}
          size={visual.size}
        />
      );
    case 'pfm':
      return (
        <BaselineTransactionAvatar
          transaction={transaction}
          identity={{
            kind: 'category',
            category: visual.category,
            pfmVariant: visual.variant ?? 'category-circle',
          }}
          size={visual.size}
        />
      );
    case 'merchant-logo':
      return (
        <BaselineTransactionAvatar
          transaction={transaction}
          identity={{ kind: 'merchant', merchant: MERCHANTS[visual.merchant] }}
          size={visual.size ?? 32}
        />
      );
    default:
      return null;
  }
}
