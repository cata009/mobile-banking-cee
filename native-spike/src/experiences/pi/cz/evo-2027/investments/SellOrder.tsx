import React, { useRef, useState } from 'react';
import {
  getInvestmentSellOrderValidation,
  CTS_UNITS_ONLY_MESSAGE,
  type InvestmentSellMode,
} from '@/features/investments/orders/sellOrder';
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
import { OrderDocuments } from './OrderDocuments';
import { Signing } from './Signing';
import { useInvestmentBack } from './Runtime';

export interface NativeSellExecution {
  quantity: number;
  amount: number;
  currency: InvestmentCatalogSecurity['instrumentCurrency'];
}
export function SellOrder({
  security,
  accounts,
  onBack,
  onComplete,
  hidden = false,
}: {
  security: InvestmentCatalogSecurity;
  accounts: readonly CurrentAccount[];
  onBack: () => void;
  onComplete: (execution: NativeSellExecution) => void;
  hidden?: boolean;
}) {
  const [step, setStep] = useState<
    'order-data' | 'review' | 'sign' | 'success'
  >('order-data');
  useInvestmentBack(() => {
    if (step === 'sign') return false;
    if (step === 'success') complete();
    else if (step === 'review') setStep('order-data');
    else onBack();
    return true;
  });
  const [mode, setMode] = useState<InvestmentSellMode>('units'),
    [unitsValue, setUnitsValue] = useState(''),
    [amountValue, setAmountValue] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? ''),
    [terms, setTerms] = useState(false),
    [sellAll, setSellAll] = useState(false);
  const account =
    accounts.find(candidate => candidate.id === accountId) ?? null;
  const validation = getInvestmentSellOrderValidation({
    security,
    account,
    mode,
    unitsValue,
    amountValue,
  });
  const { quote, canReview, currentError, amountSellingAvailable } = validation;
  const completed = useRef(false);
  const complete = () => {
    if (completed.current || !quote) return;
    completed.current = true;
    onComplete({
      quantity: quote.quantity,
      amount: quote.productAmount,
      currency: security.instrumentCurrency,
    });
  };
  const money = (value: number, currency: string) =>
    formatInvestmentMoney(value, 'CZ', currency, hidden);
  if (step === 'sign')
    return (
      <Signing
        pinHelper="Authorize your sell order securely"
        onBack={() => setStep('review')}
        onExit={onBack}
        onSigned={() => setStep('success')}
      />
    );
  if (step === 'success')
    return (
      <Page
        kind="sell-success"
        title="Order accepted"
        onBack={complete}
        footer={<Button label="Back to investments" onPress={complete} />}
      >
        <Notice
          text={`Your order to sell ${security.title} has been accepted. You can follow its status in Investments History.`}
        />
      </Page>
    );
  if (step === 'review' && quote && account)
    return (
      <Page
        kind="sell-review"
        title="Review Data"
        onBack={() => setStep('order-data')}
        footer={
          <Button
            label="Sell"
            disabled={!terms || !canReview}
            onPress={() => setStep('sign')}
          />
        }
      >
        <Copy strong style={ui.section}>
          ORDER SUMMARY
        </Copy>
        <Row title="Product" subtitle={security.title} />
        <Row title="Product ID" subtitle={security.productId} />
        <Row title="Order type" value="SELL" />
        <Row
          title="Quantity"
          value={hidden ? '•• PCS' : `${quote.quantity} PCS`}
        />
        <Row
          title="Estimated proceeds"
          value={money(quote.productAmount, security.instrumentCurrency)}
        />
        <Row
          title="Estimated credit"
          value={money(quote.accountAmount, account.currency)}
        />
        <Row title="Cash account" subtitle={account.name} />
        <OrderDocuments security={security} />
        <Choice
          title="I have read and accept the terms and conditions."
          label="Accept terms and conditions"
          selected={terms}
          onPress={() => setTerms(!terms)}
        />
      </Page>
    );
  return (
    <Page
      kind="sell-order-data"
      title="Sell Order"
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
      <Copy>Product is in client's target market</Copy>
      <Copy>Product is appropriate</Copy>
      <Copy strong style={ui.section}>
        PRODUCT DETAIL
      </Copy>
      <Row title="Product ID" subtitle={security.productId} />
      <Row title="Product type" value={security.productType} />
      <Row
        title="Price of instrument"
        value={money(security.marketPrice, security.instrumentCurrency)}
      />
      <Row
        title="Product value in portfolio"
        value={money(security.value, security.instrumentCurrency)}
      />
      <Row
        title="Disposable quantity"
        value={hidden ? '•• PCS' : `${security.quantity} PCS`}
      />
      <Choice
        title="By units"
        selected={mode === 'units'}
        onPress={() => {
          setMode('units');
          setSellAll(false);
        }}
      />
      {amountSellingAvailable ? (
        <Choice
          title="By amount"
          selected={mode === 'amount'}
          onPress={() => {
            setMode('amount');
            setSellAll(false);
          }}
        />
      ) : (
        <Notice text={CTS_UNITS_ONLY_MESSAGE} />
      )}
      <FormField
        tokens={czInvestmentTokens}
        label={mode === 'units' ? 'Number of units' : 'Amount'}
        value={mode === 'units' ? unitsValue : amountValue}
        onChange={value => {
          if (mode === 'units') setUnitsValue(value);
          else setAmountValue(value);
          setSellAll(false);
        }}
        inputProps={{ keyboardType: 'decimal-pad', returnKeyType: 'done' }}
        error={currentError ?? undefined}
      />
      <Choice
        title="Sell all"
        selected={sellAll}
        onPress={() => {
          setSellAll(!sellAll);
          setMode('units');
          setUnitsValue(
            !sellAll ? security.quantity.toFixed(6).replace(/\.?0+$/, '') : '',
          );
        }}
      />
      <Select
        tokens={czInvestmentTokens}
        label="Cash account"
        value={accountId}
        items={accounts.map(candidate => ({
          value: candidate.id,
          label: `${candidate.name} · ${candidate.currency}`,
        }))}
        onChange={setAccountId}
        closeLabel="Close cash accounts"
      />
      {quote ? (
        <Row
          title="Estimated credit"
          value={money(quote.accountAmount, account?.currency ?? 'CZK')}
        />
      ) : null}
      {!accounts.length ? (
        <Notice text="No cash account is available." error />
      ) : null}
    </Page>
  );
}
