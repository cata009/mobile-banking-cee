import React from 'react';
import LegacyPfm from './LegacyPfm';
import RoBaselinePfmScreen from '../baseline/spending/PfmScreen';
import { isPiClassicCompositionContext } from '../baseline/policy';
import type { CurrentScreenProps } from '../contracts';
import { analyticsTransactionRoute } from '../banking/analyticsTransaction';
import { bankingProducts } from '../banking/model';

/** Current PI baseline countries consume the same Source-faithful composition. */
export default function ResolvedPfm(host: CurrentScreenProps) {
  return isPiClassicCompositionContext(host) ? (
    <RoBaselinePfmScreen
      {...host}
      onTransactionClick={transaction => {
        if (!host.onTransactionSelected) {
          host.onNavigate(analyticsTransactionRoute(transaction));
          return;
        }
        const product = bankingProducts(host).products.find(
          item => item.id === transaction.sourceProductId,
        );
        if (!product) return;
        const source =
          product.type === 'credit_card' || product.type === 'debit_card'
            ? 'card'
            : 'account';
        host.onTransactionSelected({
          transaction,
          productId: product.id,
          source,
        });
      }}
    />
  ) : (
    <LegacyPfm {...host} />
  );
}
