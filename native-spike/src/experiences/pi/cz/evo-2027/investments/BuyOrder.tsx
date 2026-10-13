import React, { useState } from 'react';
import {
  buildInvestmentBuyOrderQuote,
  getInvestmentBuyOrderValidation,
  parseInvestmentOrderQuantity,
} from '@/app/screens/investments/investmentBuyOrderModel';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import type { CurrentAccount } from '@/data/products';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { FormField } from '../../../../../universal/FormField';
import { Select } from '../../../../../universal/Select';
import {
  Button,
  Choice,
  Copy,
  Notice,
  Page,
  Row,
  czInvestmentTokens,
  ui,
} from './Primitives';
import { Signing } from './Signing';
import { OrderDocuments } from './OrderDocuments';
import { useInvestmentBack } from './Runtime';

export function BuyOrder({
  security,
  accounts,
  onBack,
  onComplete,
  amountsHidden = false,
}: {
  security: InvestmentCatalogSecurity;
  accounts: readonly CurrentAccount[];
  onBack: () => void;
  onComplete: () => void;
  amountsHidden?: boolean;
}) {
  const [step, setStep] = useState<
    'order-data' | 'review' | 'sign' | 'success'
  >('order-data');
  const [terms, setTerms] = useState(false);
  useInvestmentBack(() => {
    if (step === 'sign') return false;
    if (step === 'review') {
      setTerms(false);
      setStep('order-data');
    } else onBack();
    return true;
  });
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? ''),
    [quantityText, setQuantityText] = useState('');
  const account =
    accounts.find(candidate => candidate.id === accountId) ?? null;
  const quantity = parseInvestmentOrderQuantity(quantityText);
  const quote =
    account && quantity
      ? buildInvestmentBuyOrderQuote(security, account, quantity)
      : null;
  const error =
    quote && account
      ? getInvestmentBuyOrderValidation(quote, account)
      : quantityText && !quantity
      ? 'Enter a positive whole number of units.'
      : null;
  const canReview =
    !!quote && !!account && !error && security.status === 'active';
  const money = (value: number, currency: string) =>
    formatInvestmentMoney(value, 'CZ', currency, amountsHidden);
  if (step === 'sign')
    return (
      <Signing
        onBack={() => {
          setTerms(false);
          setStep('review');
        }}
        onExit={onBack}
        onSigned={() => setStep('success')}
      />
    );
  if (step === 'success')
    return (
      <Page
        kind="buy-success"
        title="Order accepted"
        onBack={onComplete}
        footer={<Button label="Back to investments" onPress={onComplete} />}
      >
        <Notice text="Your investment order has been accepted. You can track it in your order history." />
      </Page>
    );
  if (step === 'review' && quote && account)
    return (
      <Page
        kind="buy-review"
        title="Review Data"
        onBack={() => {
          setTerms(false);
          setStep('order-data');
        }}
        footer={
          <Button
            label="Buy"
            disabled={!canReview || !terms}
            onPress={() => setStep('sign')}
          />
        }
      >
        <Row title="Product" subtitle={security.title} />
        <Row title="Product ID" subtitle={security.productId} />
        <Row
          title="Quantity"
          value={amountsHidden ? '•• PCS' : `${quote.quantity} PCS`}
        />
        <Row
          title="Market price"
          value={money(quote.marketPrice, quote.productCurrency)}
        />
        <Row
          title="Estimated amount"
          value={money(quote.productAmount, quote.productCurrency)}
        />
        <Row
          title="Estimated debit"
          value={money(quote.debitAmount, quote.accountCurrency)}
        />
        <Row title="Cash account" subtitle={account.name} />
        <OrderDocuments security={security} />
        <Choice
          title="I have read and accept the terms and conditions."
          label="Accept terms and conditions"
          selected={terms}
          onPress={() => setTerms(!terms)}
        />
        <Notice text="This is a demo order. The final price can differ from the current market price." />
      </Page>
    );
  return (
    <Page
      kind="buy-order-data"
      title="One off BUY Order"
      onBack={onBack}
      footer={
        <Button
          label="Next"
          disabled={!canReview}
          onPress={() => setStep('review')}
        />
      }
    >
      <Copy strong style={ui.section}>
        PRODUCT EVALUATION
      </Copy>
      <Row title="Product" subtitle={security.title} />
      <Copy strong style={ui.section}>
        PRODUCT DETAIL
      </Copy>
      <Row title="Product ID" subtitle={security.productId} />
      <Row title="Product type" value={security.productType} />
      <Row title="Asset class" value={security.assetClass} />
      <Row
        title="Market price"
        value={money(security.marketPrice, security.instrumentCurrency)}
      />
      <Row title="Price updated at" value={security.lastUpdate} />
      <Copy strong style={ui.section}>
        ORDER DATA
      </Copy>
      <Row
        title="Security account"
        subtitle={`${security.securityAccountName} · ${security.securityAccountCurrency}`}
      />
      <Select
        tokens={czInvestmentTokens}
        label="Cash account"
        value={accountId}
        onChange={setAccountId}
        items={accounts.map(candidate => ({
          value: candidate.id,
          label: `${candidate.name} · ${money(
            candidate.balance,
            candidate.currency,
          )}`,
        }))}
        closeLabel="Close cash accounts"
      />
      <FormField
        tokens={czInvestmentTokens}
        label="Quantity"
        value={quantityText}
        onChange={setQuantityText}
        inputProps={{ keyboardType: 'number-pad', returnKeyType: 'done' }}
        error={error ?? undefined}
      />
      {!accounts.length ? (
        <Notice error text="No cash account is available." />
      ) : null}
      <Row title="Frequency" value="One off" />
      <Row title="Execution" value="Today" />
      {quote ? (
        <Row
          title="Estimated debit"
          value={money(quote.debitAmount, quote.accountCurrency)}
        />
      ) : null}
    </Page>
  );
}
