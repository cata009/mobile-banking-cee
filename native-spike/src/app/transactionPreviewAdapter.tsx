import React from 'react';
import { MovementDetail } from '../experiences/pi/cz/evo-2027/accounts/Movements';
import { RoBaselineTransaction } from '../experiences/pi/current/baseline/Transaction';
import { bankingProducts } from '../experiences/pi/current/banking/model';
import type { CurrentAdapter, CurrentScreenProps } from '../experiences/pi/current/contracts';

function TransactionPreview(host: CurrentScreenProps) {
  const selection = host.transactionSelection;
  if (host.country !== 'CZ' || host.release !== 'release-future-evo-2027' || !selection) {
    return <RoBaselineTransaction {...host} />;
  }
  const products = bankingProducts(host);
  const explicitProduct = host.transactionPresentation &&
    Object.prototype.hasOwnProperty.call(host.transactionPresentation, 'product');
  const product = explicitProduct
    ? host.transactionPresentation?.product
    : products.products.find(item => item.id === selection.productId);
  const linkedCard = product?.type === 'current_account' && selection.transaction.source === 'card'
    ? products.cards.find(item => item.type === 'debit_card' && item.linkedAccountId === product.id)
    : undefined;
  return <MovementDetail transaction={selection.transaction} product={product}
    hidden={host.amountsHidden} onBack={host.onBack} active={host.isActive}
    topInset={host.screenTopInset} cardUsed={linkedCard}
    transactionPresentation={host.transactionPresentation}
    onTransactionCategoryChange={host.onTransactionCategoryChange}
    onRedo={() => host.onNavigate({ screen: 'payment-create', params: { entry: 'redo', transactionId: selection.transaction.id } })}
  />;
}

/** Shared Source detail previews use the existing Native leaf, even without a registered product. */
export const NATIVE_TRANSACTION_PREVIEW_ADAPTER: CurrentAdapter = {
  id: 'pi-native-transaction-presentation',
  screens: { transaction: TransactionPreview },
};
