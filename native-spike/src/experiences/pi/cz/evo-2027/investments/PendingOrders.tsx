import React, { useState } from 'react';
import {
  buildPendingInvestmentOrders,
  getPendingOrderQuantity,
  type PendingOrder,
} from '@/features/investments/orders/pendingOrders';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import type { CurrentAccount } from '@/data/products';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { Button, Copy, Notice, Page, Row, ui } from './Primitives';
import { OrderDocuments } from './OrderDocuments';
import { useInvestmentBack } from './Runtime';

/** Ordinary Source actions are presentation-only; preserve the no-op instead of fabricating execution. */
export function PendingOrders({
  catalog,
  account,
  onBack,
  hidden = false,
}: {
  catalog: readonly InvestmentCatalogSecurity[];
  account?: CurrentAccount;
  onBack: () => void;
  hidden?: boolean;
}) {
  const [selected, setSelected] = useState<PendingOrder | null>(null);
  const data = buildPendingInvestmentOrders(catalog);
  useInvestmentBack(() => {
    if (selected) setSelected(null);
    else onBack();
    return true;
  });
  const money = (value: number, currency: string) =>
    formatInvestmentMoney(value, 'CZ', currency, hidden);
  if (selected)
    return (
      <Page
        kind="pending-order-detail"
        title="Review Data"
        onBack={() => setSelected(null)}
        footer={
          <>
            <Button label="Reject" secondary onPress={() => undefined} />
            <Button label="Sign order" onPress={() => undefined} />
          </>
        }
      >
        <Copy strong style={ui.section}>
          ORDER SUMMARY
        </Copy>
        <Row title="Product" subtitle={selected.security.title} />
        <Row title="Product ID" subtitle={selected.security.productId} />
        <Row
          title="Order type"
          subtitle={
            selected.type === 'REGULAR INVESTMENT'
              ? 'Regular investment'
              : 'One off ' + selected.type
          }
        />
        {selected.type === 'REGULAR INVESTMENT' ? (
          <>
            <Row title="Frequency" value="Monthly" />
            <Row
              title="Contribution amount"
              value={money(selected.amount, selected.security.localCurrency)}
            />
          </>
        ) : (
          <Row
            title="Quantity"
            value={String(getPendingOrderQuantity(selected)) + ' PCS'}
          />
        )}
        <Row title="Execution" value="Today" />
        <Row
          title="Market price"
          value={money(
            selected.security.marketPrice,
            selected.security.instrumentCurrency,
          )}
        />
        <Row
          title={
            selected.type === 'SELL' ? 'Estimated credit' : 'Estimated amount'
          }
          value={money(selected.amount, selected.security.localCurrency)}
        />
        <Copy strong style={ui.section}>
          ACCOUNTS
        </Copy>
        <Row
          title="Security account"
          subtitle={selected.security.securityAccountName}
        />
        {account ? <Row title="Cash account" subtitle={account.name} /> : null}
        <OrderDocuments security={selected.security} />
      </Page>
    );
  return (
    <Page
      kind="pending-orders"
      title="Orders to approve"
      onBack={onBack}
      gutter={16}
      contentTop={14}
    >
      <Copy>
        Orders are valid until the end of day and they require your approval to
        complete acquisition.
      </Copy>
      <Notice text="Prices fluctuate constantly based on market conditions, so the price can change at any time." />
      {[
        { title: 'ADVISORY ORDERS', rows: data.advisory },
        { title: 'NON ADVISORY ORDERS', rows: data.nonAdvisory },
      ].map(group => (
        <React.Fragment key={group.title}>
          <Copy strong style={ui.section}>
            {group.title}
          </Copy>
          {group.rows.map(order => (
            <Row
              key={order.id}
              title={order.type}
              subtitle={order.security.title + ' · ' + order.security.productId}
              value={money(order.amount, order.security.localCurrency)}
              label={
                'Open ' + order.type + ' order for ' + order.security.title
              }
              onPress={() => setSelected(order)}
            />
          ))}
        </React.Fragment>
      ))}
    </Page>
  );
}
