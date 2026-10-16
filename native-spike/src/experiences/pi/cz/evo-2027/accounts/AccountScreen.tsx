import {
  BankingCopyToast,
  useBankingCopy,
} from '../../../current/banking/CopyToast';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { type AccountTransaction } from '@/data/accountDetails';
import type { DebitCard } from '@/data/products';
import {
  EMPTY_EVO_TRANSACTION_FILTERS,
  filterEvoTransactions,
  hasAccountTransactionFilters,
} from '@/features/accounts-payments/evoTransactionFilters';
import type { CzechNativeScreenProps } from '../contracts';
import { accountProducts, czechProducts, accountMovements } from './source';
import { tokens, s, Page, Copy, IconButton, Glyph } from './Primitives';
import { MovementDetail, MovementRows } from './Movements';
import SavingsAddMoney from '../payments/SavingsAddMoney';
import AccountInfo from './AccountInfo';
import Carousel, { type CarouselGeometry } from './Carousel';
import BalanceCard from './BalanceCard';
import Indicator from './Indicator';
import LedgerSearch from './LedgerSearch';
import Filters from './Filters';
import {
  getBeneficiaryPaymentHistory,
  getFrequentBeneficiaries,
} from '@/data/paymentsHub';
import { AccountOptionsScreen } from '../../../current/banking/Accounts';
import { czechBankingHost } from '../../../current/banking/czechHost';
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
  const products = czechProducts(productCounts, props.bankingPresentation),
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
    { copy: copyBanking, toast } = useBankingCopy();
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
  const product = accounts.find(p => p.id === id);
  const sourceRows =
    product &&
    props.bankingPresentation?.productId === product.id &&
    props.bankingPresentation.rows !== undefined
      ? props.bankingPresentation.rows
      : undefined;
  const nativeLedger = sourceRows
    ? sourceRows.map(row => row.transaction)
    : product
      ? accountMovements(product, products)
      : [];
  const ledger = nativeLedger.map(transaction => {
    const override =
      props.bankingPresentation?.transactionCategoryOverrides?.[transaction.id];
    return override
      ? {
          ...transaction,
          category: override.groupLabel,
          pfmCategory: override.category,
          pfmSubcategory: override.subcategory,
        }
      : transaction;
  });
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
  const selected = props.transactionSelection && props.transactionSelection.productId === product?.id
    ? props.transactionSelection.transaction
    : detailLedger.find(tx => tx.id === transactionId);
  const openMovement = (tx: AccountTransaction) => {
    if (props.onTransactionSelected && product) {
      props.onTransactionSelected({ productId: product.id, source: 'account', transaction: tx });
      return;
    }
    onNavigate({screen:'transaction',params:{productId:product!.id,accountId:product!.id,transactionId:tx.id}});
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
      <View style={copyStyles.root}>
        <Page title="Accounts" onBack={onBack} topInset={screenTopInset}>
          <View style={s.alert}>
            <Copy>Account not found</Copy>
          </View>
        </Page>
        <BankingCopyToast toast={toast} font={tokens.strongFont} />
      </View>
    );
  if (view === 'movement' && !selected)
    return (
      <View style={copyStyles.root}>
        <Page title="Transaction" onBack={closeSubview}>
          <View style={s.alert}>
            <Copy>Transaction not found</Copy>
          </View>
        </Page>
        <BankingCopyToast toast={toast} font={tokens.strongFont} />
      </View>
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
              label="Help"
              name="help-circle"
              onPress={() => {}}
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
                  copyBanking(account.accountNumber, 'Account number');
                }}
              />
            )}
          />
          <View style={parityStyles.item0}>
            <Indicator
              ids={accounts.map(account => account.id)}
              selectedId={product.id}
              onSelect={setId}
            />
          </View>
          <View style={a.actions}>
            {[
              {
                label: 'Details',
                icon: 'account-details',
                run: () => onNavigate({screen:'account-info',params:{productId:product.id}}),
              },
              {
                label: 'Options',
                icon: 'account-options',
                run: () => onNavigate({screen:'account-options',params:{productId:product.id}}),
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
            ].map(action =>
              action.hidden ? (
                <View
                  key={action.label}
                  testID={`account-action-slot-${
                    action.icon === 'account-options' ? 'options' : 'add-money'
                  }`}
                  style={[a.action, parityStyles.item1]}
                  pointerEvents="none"
                />
              ) : (
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
              ),
            )}
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
          {null}
          {product.type !== 'term_deposit' && (
            <MovementRows
              transactions={transactions}
              presentationRows={sourceRows}
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
        <AccountOptionsScreen
          {...czechBankingHost(
            {
              ...props,
              onBack: closeSubview,
            },
            {
              screen: 'account-options',
              params: {
                productId: product.id,
              },
            },
          )}
        />
      )}
      {view === 'movement' && selected && (
        <MovementDetail
          transaction={selected}
          product={product}
          onTransactionCategoryChange={props.onTransactionCategoryChange}
          cardUsed={product.type === 'current_account' && selected.source === 'card'
            ? products.find((candidate): candidate is DebitCard => candidate.type === 'debit_card' && candidate.linkedAccountId === product.id)
            : undefined}
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
      {view === 'main' && (
        <BankingCopyToast toast={toast} font={tokens.strongFont} />
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
  inactiveOpacity: 0.86 * 0.95,
  inactiveFilter: 'saturate(0.96) brightness(0.99)',
  paddingTop: 16,
  paddingBottom: 34,
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
const parityStyles = StyleSheet.create({
  item0: {
    marginTop: -16,
  },
  item1: {
    opacity: 0,
  },
});
const copyStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
