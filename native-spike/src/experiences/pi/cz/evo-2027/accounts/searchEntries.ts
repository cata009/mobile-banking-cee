import type {
  CzechNativeScreenProps,
  CzechNativeSearchEntry,
} from '../contracts';
import {
  czechProducts,
  accountProducts,
  cardProducts,
  accountMovements,
  cardMovements,
} from './source';
import {
  getFrequentBeneficiaries,
  getAllRecurrentPayments,
} from '@/data/paymentsHub';
import { getPaymentTemplates } from '@/data/paymentTemplates';
/** Metadata entry stays free of React/UI runtime imports. Source IDs remain exact. */
export function czechAccountsSearchEntries({
  productCounts,
}: Pick<
  CzechNativeScreenProps,
  'scenario' | 'productCounts'
>): CzechNativeSearchEntry[] {
  const products = czechProducts(productCounts),
    entries: CzechNativeSearchEntry[] = [];
  for (const product of accountProducts(products)) {
    entries.push({
      id: `cz-account-${product.id}`,
      label: product.name,
      subtitle: product.accountNumber,
      keywords: ['account', product.currency, product.accountNumber],
      target: { screen: 'account', params: { productId: product.id } },
    });
    for (const tx of accountMovements(product, products))
      entries.push({
        id: `cz-account-${product.id}-${tx.id}`,
        label: tx.label,
        subtitle: tx.details ?? tx.category,
        keywords: [
          tx.category,
          tx.status,
          tx.day,
          tx.monthTitle,
          tx.id,
          String(tx.amount),
        ],
        target: {
          screen: 'transaction',
          params: { productId: product.id, transactionId: tx.id },
        },
      });
  }
  for (const card of cardProducts(products)) {
    entries.push({
      id: `cz-card-${card.id}`,
      label: card.name,
      subtitle: `•••• ${card.cardNumber.slice(-4)}`,
      keywords: ['card', card.cardType, card.currency],
      target: { screen: 'card', params: { cardId: card.id } },
    });
    for (const tx of cardMovements(card, products))
      entries.push({
        id: `cz-card-${card.id}-${tx.id}`,
        label: tx.label,
        subtitle: tx.details ?? tx.category,
        keywords: ['card', tx.category, tx.status, tx.id, String(tx.amount)],
        target: {
          screen: 'transaction',
          params: { cardId: card.id, transactionId: tx.id },
        },
      });
  }
  for (const person of getFrequentBeneficiaries('CZ'))
    entries.push({
      id: `cz-beneficiary-${person.id}`,
      label: person.name,
      subtitle: person.accountNumber,
      keywords: ['beneficiary', 'payment', person.accountNumber],
      target: { screen: 'payments', params: { beneficiaryId: person.id } },
    });
  for (const template of getPaymentTemplates('CZ'))
    entries.push({
      id: `cz-template-${template.id}`,
      label: template.title,
      subtitle: template.beneficiaryName,
      keywords: ['template', 'payment', template.accountNumber],
      target: { screen: 'payments', params: { templateId: template.id } },
    });
  for (const payment of getAllRecurrentPayments('CZ'))
    entries.push({
      id: `cz-scheduled-${payment.id}`,
      label: payment.name,
      subtitle: payment.nextDate,
      keywords: ['scheduled', 'payment', payment.kind],
      target: { screen: 'payments', params: { paymentId: payment.id } },
    });
  entries.push(
    {
      id: 'cz-payments-new',
      label: 'New Payment',
      keywords: ['pay', 'transfer', 'payment'],
      target: { screen: 'payment-create' },
    },
    {
      id: 'cz-payments-transfer',
      label: 'Move money',
      keywords: ['internal', 'transfer', 'accounts'],
      target: { screen: 'payments', params: { view: 'transfer' } },
    },
  );
  return entries;
}
