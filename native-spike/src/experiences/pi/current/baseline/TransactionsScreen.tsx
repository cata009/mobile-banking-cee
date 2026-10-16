import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import type { AccountTransaction } from '@/data/accountDetails';
import type { Product } from '@/data/products';
import type { CurrentScreenProps } from '../contracts';
import { BaselineBottomSheet } from '../../../../universal/BaselineBottomSheet';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
import { productTransactions, bankingProducts } from '../banking/model';
import { RoBaselineTransactions } from './Transactions';

const ALL_ACCOUNTS_SCOPE = 'all-accounts';
const EMPTY_PRODUCTS: readonly Product[] = [];

interface TransactionScope {
  id: string;
  label: string;
  products: readonly Product[];
}

/** Global transactions route composed from the same Native baseline ledger as account details. */
export function RoBaselineTransactionsScreen(host: CurrentScreenProps) {
  const [selectedScopeId, setSelectedScopeId] = useState(ALL_ACCOUNTS_SCOPE);
  const [scopeSheetOpen, setScopeSheetOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const {
    country,
    release,
    productCounts,
    bankingPresentation,
    creditLimitOverrides,
  } = host;
  const transactionContext = useMemo(
    () => ({
      country,
      release,
      productCounts,
      bankingPresentation,
      creditLimitOverrides,
    }),
    [
      country,
      release,
      productCounts,
      bankingPresentation,
      creditLimitOverrides,
    ],
  );
  const data = useMemo(
    () => bankingProducts(transactionContext),
    [transactionContext],
  );
  const scopes = useMemo<TransactionScope[]>(
    () => [
      {
        id: ALL_ACCOUNTS_SCOPE,
        label: 'All accounts',
        products: data.currentAccounts,
      },
      ...data.currentAccounts.map(product => ({
        id: product.id,
        label: product.name,
        products: [product],
      })),
    ],
    [data.currentAccounts],
  );
  const activeScope =
    scopes.find(scope => scope.id === selectedScopeId) ?? scopes[0];
  const activeProducts = activeScope?.products ?? EMPTY_PRODUCTS;
  const displayProduct = activeProducts[0] ?? data.currentAccounts[0];
  const ledger = useMemo(() => {
    const transactions: AccountTransaction[] = [];
    const productByTransactionId = new Map<string, Product>();
    const originalIdByTransactionId = new Map<string, string>();

    if (
      bankingPresentation?.productId === undefined &&
      bankingPresentation?.rows !== undefined
    ) {
      for (const row of bankingPresentation.rows) {
        const product = activeProducts.find(candidate =>
          row.transaction.id.startsWith(`${candidate.id}-`),
        );
        if (!product) continue;
        const originalId = row.transaction.id.slice(product.id.length + 1);
        const override =
          bankingPresentation.transactionCategoryOverrides?.[originalId];
        const transaction = override
          ? {
              ...row.transaction,
              category: override.groupLabel,
              pfmCategory: override.category,
              pfmSubcategory: override.subcategory,
            }
          : row.transaction;
        transactions.push(transaction);
        productByTransactionId.set(transaction.id, product);
        originalIdByTransactionId.set(transaction.id, originalId);
      }
      return {
        transactions,
        productByTransactionId,
        originalIdByTransactionId,
      };
    }

    for (const product of activeProducts) {
      for (const transaction of productTransactions(
        transactionContext,
        product,
      )) {
        const override =
          bankingPresentation?.transactionCategoryOverrides?.[transaction.id];
        const resolved = override
          ? {
              ...transaction,
              category: override.groupLabel,
              pfmCategory: override.category,
              pfmSubcategory: override.subcategory,
            }
          : transaction;
        const id = `${product.id}-${resolved.id}`;
        transactions.push({ ...resolved, id });
        productByTransactionId.set(id, product);
        originalIdByTransactionId.set(id, resolved.id);
      }
    }
    return { transactions, productByTransactionId, originalIdByTransactionId };
  }, [activeProducts, bankingPresentation, transactionContext]);
  const surface = sourceColor('var(--uc-surface)', dark);
  const appBackground = sourceColor('var(--uc-app-bg)', dark);
  const textColor = sourceColor('var(--uc-text)', dark);
  const mutedColor = sourceColor('var(--uc-icon-muted)', dark);
  const borderColor = sourceColor('var(--uc-border-muted)', dark);
  const openTransaction = (transaction: AccountTransaction) => {
    const product = ledger.productByTransactionId.get(transaction.id);
    if (!product) return;
    if (host.onTransactionSelected) {
      host.onTransactionSelected({
        transaction,
        productId: product.id,
        source: 'account',
      });
      return;
    }
    host.onNavigate({
      screen: 'transaction',
      params: {
        productId: product.id,
        transactionId:
          ledger.originalIdByTransactionId.get(transaction.id) ??
          transaction.id,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: appBackground }}>
      <ScrollView
        testID="ro-baseline-transactions-screen"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BaselinePageHeader
          title={host.t('runtime.accounts.transactions', 'Transactions')}
          onBack={host.onBack}
          variant="gray"
          showHelp={false}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          dark={dark}
        />
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 10,
            backgroundColor: appBackground,
            zIndex: 20,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Show transactions for"
            accessibilityState={{ expanded: scopeSheetOpen }}
            onPress={() => setScopeSheetOpen(true)}
            style={{
              minHeight: 32,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                fontFamily: 'UniCredit-bold',
                fontSize: 16,
                color: textColor,
              }}
            >
              {activeScope?.label ?? 'All accounts'}
            </Text>
            <SourceCustomIcon
              name="chevron-down-wide"
              size={18}
              color={textColor}
            />
          </Pressable>
        </View>
        {displayProduct ? (
          <RoBaselineTransactions
            host={host}
            kind="account"
            product={displayProduct}
            transactions={ledger.transactions}
            query={query}
            onQueryChange={setQuery}
            showPending
            onTransaction={openTransaction}
          />
        ) : (
          <View style={{ paddingHorizontal: 16, paddingVertical: 32 }}>
            <Text style={{ fontSize: 16, lineHeight: 22, color: mutedColor }}>
              No transactions on the selected accounts.
            </Text>
          </View>
        )}
      </ScrollView>
      {scopeSheetOpen ? (
        <BaselineBottomSheet
          title="Show transactions for"
          onClose={() => setScopeSheetOpen(false)}
          dark={dark}
        >
          <View
            style={{
              overflow: 'hidden',
              borderRadius: 8,
              backgroundColor: surface,
            }}
          >
            {scopes.map((scope, index) => {
              const selected = scope.id === selectedScopeId;
              return (
                <Pressable
                  key={scope.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => {
                    setSelectedScopeId(scope.id);
                    setScopeSheetOpen(false);
                  }}
                  style={{
                    minHeight: 64,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderTopWidth: index > 0 ? 0.5 : 0,
                    borderTopColor: borderColor,
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 16, color: textColor }}>
                    {scope.label}
                  </Text>
                  <SourceCustomIcon
                    name={selected ? 'radio-selected' : 'radio-unselected'}
                    size={24}
                    color={
                      selected
                        ? sourceColor('var(--uc-action)', dark)
                        : mutedColor
                    }
                  />
                </Pressable>
              );
            })}
          </View>
        </BaselineBottomSheet>
      ) : null}
    </View>
  );
}
