import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  ACCOUNT_OPTION_ITEMS,
  type AccountTransaction,
} from '@/data/accountDetails';
import {
  EMPTY_EVO_TRANSACTION_FILTERS,
  filterEvoTransactions,
  hasAccountTransactionFilters,
} from '@/features/accounts-payments/evoTransactionFilters';
import type { CzechNativeScreenProps } from '../contracts';
import { accountProducts, czechProducts, accountMovements } from './source';
import { tokens, s, Page, Copy, Row, IconButton, Glyph } from './Primitives';
import { MovementDetail, MovementRows } from './Movements';
import SavingsAddMoney from '../payments/SavingsAddMoney';
import AccountInfo from './AccountInfo';
import Carousel, { type CarouselGeometry } from './Carousel';
import BalanceCard from './BalanceCard';
import Indicator from './Indicator';
import LedgerSearch from './LedgerSearch';
import Filters from './Filters';
import { copyDemoText } from '../../../../../platform/nativeFiles';
import {
  getBeneficiaryPaymentHistory,
  getFrequentBeneficiaries,
} from '@/data/paymentsHub';
export default function AccountScreen(props: CzechNativeScreenProps) {
  const {
    route,
    productCounts,
    onBack,
    onNavigate,
    amountsHidden,
    isActive,
    screenTopInset,
  } = props;
  const products = czechProducts(productCounts),
    accounts = accountProducts(products);
  const requested = route.params?.productId ?? route.params?.accountId;
  const [id, setId] = useState(requested ?? accounts[0]?.id);
  const [query, setQuery] = useState(''),
    [filters, setFilters] = useState({
      ...EMPTY_EVO_TRANSACTION_FILTERS,
    }),
    [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState(
    route.screen === 'account-info'
      ? 'info'
      : route.screen === 'account-options'
      ? 'options'
      : route.screen === 'transaction'
      ? 'movement'
      : 'main',
  );
  const [transactionId, setTransactionId] = useState(
      route.params?.transactionId,
    ),
    [notice, setNotice] = useState('');
  useEffect(() => {
    if (requested) setId(requested);
    setTransactionId(route.params?.transactionId);
    setView(
      route.screen === 'account-info'
        ? 'info'
        : route.screen === 'account-options'
        ? 'options'
        : route.screen === 'transaction'
        ? 'movement'
        : 'main',
    );
  }, [requested, route.screen, route.params?.transactionId]);
  const product = accounts.find(p => p.id === id),
    ledger = product ? accountMovements(product, products) : [];
  const transactions = filterEvoTransactions({
    transactions: ledger,
    search: query,
    filters,
    accountNumber: product?.accountNumber ?? '',
    currency: 'CZK',
  });
  const beneficiary = route.params?.beneficiaryId
    ? getFrequentBeneficiaries('CZ').find(
        person => person.id === route.params?.beneficiaryId,
      )
    : undefined;
  const detailLedger = route.params?.beneficiaryId
    ? beneficiary
      ? getBeneficiaryPaymentHistory(beneficiary, 'CZ')
      : []
    : ledger;
  const selected = detailLedger.find(tx => tx.id === transactionId);
  const openMovement = (tx: AccountTransaction) => {
    setTransactionId(tx.id);
    setView('movement');
  };
  const closeSubview = () => {
    if (
      route.screen === 'transaction' ||
      route.screen === 'account-info' ||
      route.screen === 'account-options'
    )
      onBack();
    else setView('main');
  };
  const renderInfo = () =>
    product ? (
      <AccountInfo
        product={product}
        products={products}
        hidden={amountsHidden}
        active={isActive}
        topInset={screenTopInset}
        onBack={closeSubview}
      />
    ) : null;
  if (!product)
    return (
      <Page title="Accounts" onBack={onBack} topInset={screenTopInset}>
        <View style={s.alert}>
          <Copy>Account not found</Copy>
        </View>
      </Page>
    );
  if (view === 'movement' && !selected)
    return (
      <Page title="Transaction" onBack={closeSubview}>
        <View style={s.alert}>
          <Copy>Transaction not found</Copy>
        </View>
      </Page>
    );
  return (
    <View style={s.page}>
      <View
        style={[
          extractedStyles.item0,
          view !== 'main' && extractedStyles.item1,
        ]}
      >
        <Page
          title="My Products"
          onBack={onBack}
          active={isActive !== false && view === 'main'}
          topInset={screenTopInset}
          trailing={
            <IconButton
              label={amountsHidden ? 'Show amounts' : 'Hide amounts'}
              name={amountsHidden ? 'show' : 'hide'}
              onPress={props.onAmountsToggle}
            />
          }
        >
          <Carousel
            items={accounts}
            selectedId={product.id}
            geometry={ACCOUNT_GEOMETRY}
            onSelect={account => setId(account.id)}
            label={account => `Account ${account.id}`}
            renderItem={account => (
              <BalanceCard
                product={account}
                products={products}
                hidden={amountsHidden}
                onCopy={() => {
                  copyDemoText(account.accountNumber).then(
                    () => setNotice('Account number copied'),
                    () => setNotice('Copy unavailable'),
                  );
                }}
              />
            )}
          />
          <Indicator
            ids={accounts.map(account => account.id)}
            selectedId={product.id}
            onSelect={setId}
          />
          <View style={a.actions}>
            {[
              {
                label: 'Details',
                icon: 'account-details',
                run: () => setView('info'),
              },
              {
                label: 'Options',
                icon: 'account-options',
                run: () => setView('options'),
                hidden:
                  product.type === 'term_deposit' ||
                  product.type === 'loan' ||
                  product.type === 'mortgage',
              },
              {
                label:
                  product.type === 'term_deposit'
                    ? 'Open term deposit'
                    : 'Add money',
                icon: 'add-money',
                run: () => setView('saving-add-money'),
                disabled: product.type !== 'saving_account',
                hidden: product.type === 'loan' || product.type === 'mortgage',
              },
              {
                label:
                  product.type === 'term_deposit'
                    ? 'Close term deposit'
                    : product.type === 'loan' || product.type === 'mortgage'
                    ? 'Reimbursement'
                    : 'Internal transfer',
                icon: 'mcash',
                run: () => {},
                disabled: true,
              },
            ]
              .filter(action => !action.hidden)
              .map(action => (
                <Pressable
                  key={action.label}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  accessibilityState={{
                    disabled: action.disabled ?? false,
                  }}
                  disabled={action.disabled}
                  onPress={action.run}
                  style={a.action}
                >
                  <View style={a.bubble}>
                    <Glyph name={action.icon} />
                  </View>
                  <Copy size={14} lineHeight={16}>
                    {action.label}
                  </Copy>
                </Pressable>
              ))}
          </View>
          {product.type !== 'term_deposit' && (
            <View style={extractedStyles.item4}>
              <LedgerSearch
                value={query}
                onChange={setQuery}
                onFilters={() => setFilterOpen(true)}
              />
              {hasAccountTransactionFilters(filters) && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove filters"
                  onPress={() =>
                    setFilters({
                      ...EMPTY_EVO_TRANSACTION_FILTERS,
                    })
                  }
                >
                  <Copy>Remove filters</Copy>
                </Pressable>
              )}
            </View>
          )}
          {Boolean(notice) && (
            <View style={s.inset}>
              <Copy>{notice}</Copy>
            </View>
          )}
          {product.type !== 'term_deposit' && (
            <MovementRows
              transactions={transactions}
              hidden={amountsHidden}
              currency={product.currency}
              monthlyReports={
                product.type === 'current_account' &&
                !query.trim() &&
                !hasAccountTransactionFilters(filters)
              }
              onOpenReport={direction =>
                onNavigate({
                  screen: 'pfm',
                  params: {
                    scopeId: product.id,
                    ...(direction
                      ? {
                          direction,
                        }
                      : {}),
                  },
                })
              }
              onSelect={openMovement}
              pending={
                product.id ===
                accounts.find(p => p.type === 'current_account')?.id
              }
            />
          )}
        </Page>
      </View>
      {view === 'info' && renderInfo()}
      {view === 'options' && (
        <Page
          title="Account options"
          onBack={closeSubview}
          active={isActive}
          topInset={screenTopInset}
        >
          <View style={s.panel}>
            {ACCOUNT_OPTION_ITEMS.map(option => (
              <Row
                key={option.id}
                title={option.title}
                subtitle={option.description}
                disabled
                onPress={() => {}}
              />
            ))}
          </View>
        </Page>
      )}
      {view === 'movement' && selected && (
        <MovementDetail
          transaction={selected}
          product={product}
          hidden={amountsHidden}
          active={isActive}
          topInset={screenTopInset}
          onBack={closeSubview}
          onRedo={() =>
            onNavigate({
              screen: 'payment-create',
              params: {
                productId: product.id,
                transactionId: selected.id,
                entry: 'redo',
              },
            })
          }
        />
      )}
      {view === 'saving-add-money' && product.type === 'saving_account' && (
        <SavingsAddMoney
          savingAccount={product}
          sourceAccounts={products.filter(
            (
              candidate,
            ): candidate is import('@/data/products').CurrentAccount =>
              candidate.type === 'current_account' &&
              candidate.currency === product.currency,
          )}
          hidden={amountsHidden}
          active={isActive}
          topInset={screenTopInset}
          onBack={() => setView('main')}
        />
      )}
      {filterOpen && (
        <Filters
          filters={filters}
          onClose={() => setFilterOpen(false)}
          onApply={value => {
            setFilters(value);
            setFilterOpen(false);
          }}
        />
      )}
    </View>
  );
}
const a = StyleSheet.create({
  card: {
    width: 311,
    height: 197,
    padding: 16,
    borderRadius: 6,
    backgroundColor: tokens.surface,
    gap: 6,
  },
  actions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 0,
    marginVertical: 8,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    minHeight: 64,
  },
  bubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
const ACCOUNT_GEOMETRY: CarouselGeometry = {
  width: 311,
  height: 197,
  gap: 16,
  gutter: 16,
  inactiveScale: 165 / 197,
};
const extractedStyles = StyleSheet.create({
  item0: {
    flex: 1,
  },
  item1: {
    display: 'none',
  },
  item2: {
    justifyContent: 'space-between',
  },
  item3: {
    borderTopWidth: 1,
    paddingTop: 8,
  },
  item4: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  item5: {
    flex: 1,
  },
  item6: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 16,
  },
});
