import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  getLoanDetails,
  getTermDepositDetails,
} from '@/data/accountProductDetails';
import type { Product } from '@/data/products';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import {
  maskAmountParts,
  maskFormattedAmount,
} from '@/app/utils/amountPrivacy';
import {
  EMPTY_ACCOUNT_TRANSACTION_FILTERS,
  type AccountTransactionFilterState,
} from '@/features/accounts-payments/evoTransactionFilters';
import type { CurrentScreenProps } from '../contracts';
import { bankingProducts, copy, productTransactions } from '../banking/model';
import { BankingCopyToast, useBankingCopy } from '../banking/CopyToast';
import { BaselineAccountBalanceCard } from '../../../../universal/BaselineAccountBalanceCard';
import {
  BaselineAccountActionBar,
  type BaselineAccountAction,
} from '../../../../universal/BaselineAccountActionBar';
import { BaselineCarouselIndicator } from '../../../../universal/BaselineCarouselIndicator';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
import { carouselOffsets } from '../../cz/evo-2027/accounts/Carousel';
import { RoBaselineDetailsHeader } from './DetailsHeader';
import { RoBaselineTransactions } from './Transactions';

const geometry = {
  width: 311,
  height: 197,
  gap: 16,
  gutter: 16,
  inactiveScale: 165 / 197,
};

/** The baseline carousel keeps every product on the same source-sized rail. */
function AccountCarousel({
  products,
  activeIndex,
  selectionRequest,
  onSelect,
  renderCard,
}: {
  products: readonly Product[];
  activeIndex: number;
  selectionRequest: number;
  onSelect: (index: number) => void;
  renderCard: (product: Product, index: number) => React.ReactNode;
}) {
  const rail = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [viewport, setViewport] = useState(375);
  const scrollLeft = useRef(0);
  const dragOrigin = useRef(0);
  const suppressClickUntil = useRef(0);
  const offsets = useMemo(
    () => carouselOffsets(products.length, viewport, geometry),
    [products.length, viewport],
  );
  const selectedIndex = useRef(activeIndex);
  selectedIndex.current = activeIndex;
  const select = (index: number, animated = true) => {
    const clamped = Math.max(0, Math.min(products.length - 1, index));
    onSelect(clamped);
    rail.current?.scrollTo({ x: offsets[clamped] ?? 0, y: 0, animated });
  };
  const nearest = (x: number) =>
    offsets.reduce(
      (best, offset, index) =>
        Math.abs(offset - x) < Math.abs((offsets[best] ?? 0) - x)
          ? index
          : best,
      0,
    );
  const latest = useRef({ select, nearest, offsets });
  latest.current = { select, nearest, offsets };
  const drag = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Platform.OS === 'web' &&
          Math.abs(gesture.dx) > 4 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          dragOrigin.current = scrollLeft.current;
          suppressClickUntil.current = Infinity;
        },
        onPanResponderMove: (_event, gesture) => {
          const max = latest.current.offsets.at(-1) ?? 0;
          rail.current?.scrollTo({
            x: Math.max(0, Math.min(max, dragOrigin.current - gesture.dx)),
            y: 0,
            animated: false,
          });
        },
        onPanResponderRelease: () => {
          suppressClickUntil.current = Date.now() + 80;
          latest.current.select(latest.current.nearest(scrollLeft.current));
        },
        onPanResponderTerminate: () => {
          suppressClickUntil.current = Date.now() + 80;
          latest.current.select(latest.current.nearest(scrollLeft.current));
        },
      }),
    [],
  );
  // Indicator/route requests move the rail; the scroll callback only updates selection.
  // Layout changes also recalculate Source's centering and end-clamp.
  useEffect(() => {
    rail.current?.scrollTo({
      x: offsets[selectedIndex.current] ?? 0,
      y: 0,
      animated: selectionRequest > 0,
    });
  }, [offsets, selectionRequest]);
  return (
    <View {...drag.panHandlers}>
      <ScrollView
        ref={rail}
        testID="ro-account-carousel"
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        horizontal
        onLayout={event => {
          if (event.nativeEvent.layout.width > 0)
            setViewport(event.nativeEvent.layout.width);
        }}
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: offsets[activeIndex] ?? 0, y: 0 }}
        snapToOffsets={offsets}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={styles.rail}
        onScroll={event => {
          scrollLeft.current = event.nativeEvent.contentOffset.x;
          onSelect(nearest(scrollLeft.current));
        }}
        onMomentumScrollEnd={() => select(nearest(scrollLeft.current))}
      >
        {products.map((product, index) => (
          <Pressable
            key={product.id}
            testID={`ro-account-carousel-${product.id}`}
            accessibilityRole="button"
            accessibilityLabel={product.name}
            accessibilityState={{ selected: index === activeIndex }}
            onPress={() => {
              if (Date.now() >= suppressClickUntil.current) select(index);
            }}
            style={[
              styles.card,
              index === activeIndex
                ? { transform: [{ scaleY: 1 }] }
                : styles.inactive,
              Platform.OS === 'web'
                ? ({ willChange: 'transform' } as never)
                : undefined,
            ]}
          >
            {renderCard(product, index)}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function balanceProps(
  product: Product,
  currentAccountNumber: string,
  hidden: boolean,
) {
  const deposit =
    product.type === 'term_deposit'
      ? getTermDepositDetails(product, currentAccountNumber)
      : null;
  const loan =
    product.type === 'loan' || product.type === 'mortgage'
      ? getLoanDetails(product)
      : null;
  const formatted = formatEvo2027Number(loan?.ownedAmount ?? product.balance);
  const split = formatted.match(/^(.+?)([,.]\d{2})$/);
  const amount = maskAmountParts(
    {
      integer: split?.[1] ?? formatted,
      decimals: split?.[2] ?? ',00',
      currency: product.currency,
    },
    hidden,
  );
  return {
    account: {
      accountName: product.name,
      accountNumber: deposit
        ? `Maturity date ${deposit.maturityDate}`
        : product.accountNumber,
      subAccount: '',
    },
    availableInteger: amount.integer,
    availableDecimals: amount.decimals,
    currency: amount.currency,
    currentBalance: maskFormattedAmount(
      formatEvo2027Number(
        deposit?.maturityAmount ??
          loan?.nextInstallment ??
          product.balance * 0.92,
      ),
      hidden,
    ),
    showSubAccount: false,
    productType: product.type,
    progress: deposit?.progress ?? loan?.progress,
    progressLabel:
      product.type === 'term_deposit'
        ? 'Term deposit maturity progress'
        : product.type === 'loan'
        ? 'Personal loan repayment progress'
        : product.type === 'mortgage'
        ? 'Mortgage repayment progress'
        : undefined,
    showCopy: product.type !== 'term_deposit',
  };
}

export default function RoBaselineAccount(host: CurrentScreenProps) {
  const data = bankingProducts(host);
  const requestedId =
    host.route.params?.productId ?? host.route.params?.accountId;
  const [selectedId, setSelectedId] = useState(
    requestedId ?? data.accounts[0]?.id,
  );
  const [selectionRequest, setSelectionRequest] = useState(0);
  const defaultId = data.accounts[0]?.id;
  useEffect(() => {
    setSelectedId(requestedId ?? defaultId);
    setSelectionRequest(value => value + 1);
  }, [requestedId, defaultId]);
  const activeIndex = Math.max(
    0,
    data.accounts.findIndex(product => product.id === selectedId),
  );
  const product = data.accounts[activeIndex];
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const measuredScrollY = useRef(0);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<AccountTransactionFilterState>({
    ...EMPTY_ACCOUNT_TRANSACTION_FILTERS,
  });
  const page = useRef<React.ElementRef<typeof ScrollView>>(null);
  const ledgerTop = useRef(0);
  const { copy: copyAccount, toast } = useBankingCopy();
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const title = copy(host, 'runtime.accounts.myProductsTitle', 'My Products');
  const surface = sourceColor('var(--uc-surface)', dark);
  const select = (index: number) => {
    setSelectedId(
      data.accounts[Math.max(0, Math.min(data.accounts.length - 1, index))]?.id,
    );
  };
  const actions: BaselineAccountAction[] = [
    {
      id: 'details',
      iconName: 'account-details',
      label: copy(host, 'runtime.accounts.actions.details', 'Details'),
      onPress: () => {
        if (product)
          host.onNavigate({
            screen: 'account-info',
            params: { productId: product.id },
          });
      },
    },
    {
      id: 'options',
      iconName: 'account-options',
      label: copy(host, 'runtime.accounts.actions.options', 'Options'),
      onPress: () => {
        if (product)
          host.onNavigate({
            screen: 'account-options',
            params: { productId: requestedId ?? defaultId ?? product.id },
          });
      },
      hidden:
        product?.type === 'term_deposit' ||
        product?.type === 'loan' ||
        product?.type === 'mortgage',
    },
    {
      id: 'add-money',
      iconName: 'add-money',
      label:
        product?.type === 'term_deposit'
          ? copy(
              host,
              'runtime.accounts.actions.openTermDeposit',
              'Open term deposit',
            )
          : copy(host, 'runtime.accounts.actions.addMoney', 'Add money'),
      hidden:
        product?.type === 'saving_account' ||
        product?.type === 'loan' ||
        product?.type === 'mortgage',
    },
    {
      id: 'mcash',
      iconName: 'mcash',
      label:
        product?.type === 'term_deposit'
          ? copy(
              host,
              'runtime.accounts.actions.closeTermDeposit',
              'Close term deposit',
            )
          : product?.type === 'loan' || product?.type === 'mortgage'
          ? copy(
              host,
              'runtime.accounts.actions.reimbursement',
              'Reimbursement',
            )
          : copy(
              host,
              'runtime.accounts.actions.internalTransfer',
              'Internal transfer',
            ),
    },
  ];
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    measuredScrollY.current = event.nativeEvent.contentOffset.y;
    setScrollY(event.nativeEvent.contentOffset.y);
    setProgress(
      Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
    );
  };
  const renderPage = ({
    search,
    body,
    overlays,
    stickyTop = 102,
  }: {
    search?: React.ReactNode;
    body?: React.ReactNode;
    overlays?: React.ReactNode;
    stickyTop?: number;
  } = {}) => (
    <>
      <ScrollView
        ref={page}
        testID="ro-account-page"
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={styles.content}
      >
        <RoBaselineDetailsHeader
          host={host}
          title={title}
          progress={product ? progress : 1}
          kind="account"
        />
        {product ? (
          <>
            <View style={{ backgroundColor: host.tokens.background }}>
              <View
                style={[styles.titleFrame, { opacity: 1 - progress * 0.9 }]}
              >
                <Text
                  accessibilityRole="header"
                  style={[styles.title, { color: host.tokens.text }]}
                >
                  {title}
                </Text>
              </View>
              <AccountCarousel
                products={data.accounts}
                activeIndex={activeIndex}
                selectionRequest={selectionRequest}
                onSelect={select}
                renderCard={(account, index) => (
                  <BaselineAccountBalanceCard
                    {...balanceProps(
                      account,
                      data.currentAccounts[0]?.accountNumber ?? '',
                      host.amountsHidden,
                    )}
                    active={index === activeIndex}
                    dark={dark}
                    onCopy={() => {
                      copyAccount(account.accountNumber, 'Account number');
                    }}
                  />
                )}
              />
              <View style={styles.indicator}>
                <BaselineCarouselIndicator
                  count={data.accounts.length}
                  activeIndex={activeIndex}
                  onSelect={index => {
                    select(index);
                    setSelectionRequest(value => value + 1);
                  }}
                  dark={dark}
                />
              </View>
              <BaselineAccountActionBar
                items={actions}
                iconTreatment="bare"
                dark={dark}
                style={{ backgroundColor: host.tokens.background }}
              />
            </View>
            {search ? (
              <View
                testID="ro-account-sticky-search"
                style={[
                  styles.stickySearch,
                  Platform.OS === 'web'
                    ? {
                        position: 'sticky' as never,
                        top: stickyTop,
                        backgroundColor: surface,
                      }
                    : {
                        backgroundColor: surface,
                        transform: [
                          {
                            translateY: Math.max(
                              0,
                              scrollY - ledgerTop.current + stickyTop,
                            ),
                          },
                        ],
                      },
                ]}
                onLayout={event => {
                  ledgerTop.current = event.nativeEvent.layout.y;
                }}
              >
                {search}
              </View>
            ) : null}
            {body}
          </>
        ) : null}
      </ScrollView>
      {overlays}
    </>
  );
  return (
    <View style={[styles.root, { backgroundColor: surface }]}>
      {product && product.type !== 'term_deposit' ? (
        <RoBaselineTransactions
          host={host}
          kind="account"
          product={product}
          transactions={productTransactions(host, product)}
          query={query}
          onQueryChange={setQuery}
          filters={filters}
          onFiltersChange={setFilters}
          report={product.type === 'current_account'}
          showPending={product.id === data.currentAccounts[0]?.id}
          onTransaction={transaction => {
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
                transactionId: transaction.id,
              },
            });
          }}
          onActivateSearch={() =>
            page.current?.scrollTo({
              y: Math.max(0, ledgerTop.current - 102, measuredScrollY.current),
              animated: true,
            })
          }
          renderSections={renderPage}
        />
      ) : (
        renderPage()
      )}
      <BankingCopyToast toast={toast} font={host.tokens.strongFont} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 32 },
  titleFrame: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: 375,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 31 },
  webScroll: { transform: 'none' },
  rail: {
    paddingLeft: 16,
    paddingRight: 16,
    gap: 16,
    paddingTop: 16,
    paddingBottom: 34,
  },
  card: {
    width: 311,
    height: 197,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactive: {
    opacity: 0.86,
    transform: [{ scaleY: 165 / 197 }],
    filter: 'saturate(0.96) brightness(0.99)',
  },
  indicator: { marginTop: -16 },
  stickySearch: { zIndex: 20 },
});
