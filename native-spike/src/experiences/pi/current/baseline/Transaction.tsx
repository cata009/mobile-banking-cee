import React, { useState, type CSSProperties } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { createTransactionDetailData } from '@/data/paymentFlow';
import {
  getMerchantLocation,
  resolveTransactionMerchant,
} from '@/data/merchantDirectory';
import { getPfmCategorySelection } from '@/data/pfmCategories';
import { formatMaskedCardNumber } from '@/app/utils/cardNumber';
import type { CurrentScreenProps } from '../contracts';
import { NativeTransactionLeadingVisual } from './NativeTransactionLeadingVisual';
import { bankingProducts, productTransactions } from '../banking/model';
import { resolveAnalyticsTransaction } from '../banking/analyticsTransaction';
import {
  applyCategoryOverride,
  overrideCategory,
} from '../banking/categoryOverrides';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { BaselineTransactionAvatar } from '../../../../universal/BaselineTransactionAvatar';
import {
  BaselineAccountActionBar,
  type BaselineAccountAction,
} from '../../../../universal/BaselineAccountActionBar';
import { BaselineSectionDivider } from '../../../../universal/BaselineSectionDivider';
import { BaselineCardNavigationRow } from '../../../../universal/BaselineCardNavigationRow';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
import { RoBaselineCategorySheet } from './CategorySheet';
const untransformedWebStyle = {
  transform: 'none',
} satisfies CSSProperties;
const sourceWebScrollStyle = untransformedWebStyle as unknown as ViewStyle;

/** RO Source TransactionDetailScreen baseline branch; original banking renderer stays intact. */
export function RoBaselineTransaction(host: CurrentScreenProps) {
  const data = bankingProducts(host),
    routeProductId =
      host.route.params?.productId ??
      host.route.params?.accountId ??
      host.route.params?.cardId,
    hasPresentedProduct = Object.prototype.hasOwnProperty.call(
      host.transactionPresentation ?? {},
      'product',
    ),
    product = hasPresentedProduct
      ? host.transactionPresentation?.product ?? undefined
      : data.products.find(p => {
          return p.id === routeProductId;
        }) ?? data.currentAccounts[0];
  const ledgerRaw = product
    ? productTransactions(host, product).find(t => {
        return t.id === host.route.params?.transactionId;
      })
    : undefined;
  const selection = host.transactionSelection,
    exactEmptyPreviewProduct =
      hasPresentedProduct &&
      host.transactionPresentation?.product === null &&
      routeProductId === '' &&
      selection?.productId === '',
    selectionMatchesRoute =
      !!selection &&
      (selection.productId === routeProductId || exactEmptyPreviewProduct) &&
      selection.source === host.route.params?.source &&
      selection.transaction.id === host.route.params?.transactionId,
    raw = selectionMatchesRoute
      ? selection.transaction
      : product
      ? resolveAnalyticsTransaction(host.route.params, product.id, ledgerRaw)
      : undefined;
  const [progress, setProgress] = useState(0),
    [expanded, setExpanded] = useState(false),
    [categoryOpen, setCategoryOpen] = useState(false),
    [, setRevision] = useState(0);
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true),
    surface = sourceColor('var(--uc-surface)', dark);
  const sourceStyle0 = {
    flex: 1,
    backgroundColor: surface,
  } as const;
  if (!raw)
    return (
      <View style={sourceStyle0}>
        <BaselinePageHeader
          title={host.t(
            'runtime.transactionDetail.title',
            'Transaction details',
          )}
          onBack={host.onBack}
          showHelp={false}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          dark={dark}
        />
        <Text>No transaction selected</Text>
      </View>
    );
  const transaction = applyCategoryOverride(host, raw),
    detail = createTransactionDetailData(transaction, host.country, product),
    pending = transaction.status === 'Pending';
  const card = product ? (
    product.type === 'credit_card' || product.type === 'debit_card'
      ? product
      : product.type === 'current_account' && transaction.source === 'card'
      ? data.cards.find(c => {
          return c.type === 'debit_card' && c.linkedAccountId === product.id;
        })
      : undefined
  ) : undefined;
  const enrichment = host.transactionPresentation?.merchantEnrichment;
  const merchant = resolveTransactionMerchant(transaction),
    title = enrichment?.cleanMerchantName ?? merchant?.name ?? detail.title,
    location = enrichment?.location ??
      (merchant ? getMerchantLocation(merchant, host.country) : undefined),
    leadingVisual = enrichment?.leadingVisual;
  const rawMcc = (enrichment?.mcc ?? merchant?.mcc)?.trim(),
    mcc =
      rawMcc?.match(/^\d{4}\s*[·•–—-]\s*(.+)$/)?.[1]?.trim() ??
      (rawMcc && !/^\d{4}$/.test(rawMcc) ? rawMcc : undefined);
  const t = host.t,
    strong = {
      fontFamily: 'UniCredit-bold',
      color: host.tokens.text,
    } as const,
    regular = {
      fontFamily: 'UniCredit-regular',
      color: host.tokens.text,
    } as const;
  const fact = (label: string, value: string, copy = false) => {
    const sourceStyle1 = {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 17,
      backgroundColor: surface,
    } as const;
    const sourceStyle2 = {
      flex: 1,
      minWidth: 0,
    } as const;
    const sourceStyle3 = {
      fontSize: 14,
      lineHeight: 15,
      color: host.tokens.muted,
    } as const;
    const sourceStyle4 = {
      fontSize: 16,
      lineHeight: 17,
      marginTop: 3,
    } as const;
    const sourceStyle5 = {
      width: 32,
      height: 32,
      marginTop: 8,
      alignItems: 'center',
      justifyContent: 'center',
    } as const;
    return (
      <View
        key={label}
        testID="transaction-fact"
        accessibilityLabel={label}
        style={sourceStyle1}
      >
        <View style={sourceStyle2}>
          <Text style={[regular, sourceStyle3]}>{label}</Text>
          <Text style={[strong, sourceStyle4]}>{value}</Text>
        </View>
        {copy ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Copy ${label}`}
            style={sourceStyle5}
          >
            <SourceCustomIcon
              name="copy-documents"
              size={20}
              color={host.tokens.text}
            />
          </Pressable>
        ) : null}
      </View>
    );
  };
  const sectionTitle = (titleText: string) => {
    const sourceStyle6 = {
      paddingTop: 30,
    } as const;
    return (
      <View style={sourceStyle6}>
        <BaselineSectionDivider title={titleText} dark={dark} />
      </View>
    );
  };
  const actions: BaselineAccountAction[] = [
    {
      id: 'change-category',
      iconName: 'grid-2x2',
      label: t(
        'runtime.transactionDetail.actions.changeCategory',
        'Change\ncategory',
      ),
      onPress: () => {
        return setCategoryOpen(true);
      },
    },
    {
      id: 'standing-order',
      iconName: 'standing-order',
      label: t(
        'runtime.transactionDetail.actions.createStandingOrder',
        'Create\nStanding order',
      ),
      hidden: Boolean(card),
    },
    card
      ? {
          id: 'request-chargeback',
          iconName: 'request-chargeback',
          label: 'Request\nchargeback',
        }
      : {
          id: 'redo-payment',
          iconName: 'redo-payment',
          icon: (
            <SourceCustomIcon
              name="redo-payment"
              width={22}
              height={18}
              color={host.tokens.text}
            />
          ),
          label: t(
            'runtime.transactionDetail.actions.redoPayment',
            'Redo\npayment',
          ),
          onPress: () => {
            return host.onNavigate({
              screen: 'payment-create',
              params: {
                productId: product?.id ?? routeProductId ?? selection?.productId ?? '',
                transactionId: transaction.id,
                ...(host.route.params?.analyticsTransaction
                  ? {
                      analyticsTransaction: JSON.stringify({
                        ...transaction,
                        ...(product
                          ? { sourceProductId: product.id, sourceProductName: product.name }
                          : {}),
                      }),
                    }
                  : {}),
              },
            });
          },
        },
    {
      id: 'send-payment',
      iconName: 'send-payment',
      label: t(
        'runtime.transactionDetail.actions.sendPayment',
        'Send\npayment',
      ),
    },
  ];
  const sourceStyle7 = {
    flex: 1,
    backgroundColor: surface,
  } as const;
  const sourceStyle8 = {
    backgroundColor: host.tokens.background,
    paddingBottom: pending ? 11.5 : 8,
  } as const;
  const sourceStyle9 = {
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: 'center',
    opacity: 1 - progress,
    backgroundColor: host.tokens.background,
  } as const;
  const sourceStyle10 = {
    marginTop: 12,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.56,
    textAlign: 'center',
  } as const;
  const sourceStyle11 = {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 15,
    color: host.tokens.muted,
  } as const;
  const sourceStyle12 = {
    marginTop: 8,
    fontSize: 22,
    lineHeight: 33,
  } as const;
  const sourceStyle13 = {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  } as const;
  const sourceStyle14 = {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: sourceColor('var(--uc-orange-status)', dark),
  } as const;
  const sourceStyle15 = {
    fontSize: 14,
    lineHeight: 15,
    color: host.tokens.muted,
    textTransform: 'uppercase',
  } as const;
  const sourceStyle16 = {
    marginTop: 18,
    fontSize: 13,
    lineHeight: 19.5,
    color: host.tokens.muted,
  } as const;
  const sourceStyle17 = {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: sourceColor(`var(${detail.pfmCategoryColorVar})`, dark),
    paddingHorizontal: 16,
    paddingVertical: 4,
  } as const;
  const sourceStyle18 = {
    fontSize: 12,
    lineHeight: 18,
    color: sourceColor(`var(${detail.pfmCategoryColorVar})`, dark),
  } as const;
  const sourceStyle19 = {
    marginTop: 31,
  } as const;
  const sourceStyle20 = {
    backgroundColor: host.tokens.background,
  } as const;
  const sourceStyle21 = {
    paddingHorizontal: 22,
    paddingTop: 23,
    backgroundColor: surface,
  } as const;
  const sourceStyle22 = {
    fontSize: 22,
    lineHeight: 33,
  } as const;
  const sourceStyle23 = {
    paddingTop: 28,
  } as const;
  const sourceStyle24 = {
    fontSize: 13,
    lineHeight: 19.5,
    color: host.tokens.muted,
  } as const;
  const sourceStyle25 = {
    fontSize: 18,
    lineHeight: 20,
  } as const;
  const sourceStyle26 = {
    marginTop: 10,
    height: 16,
    borderRadius: 999,
    backgroundColor: host.tokens.accent,
  } as const;
  const sourceStyle27 = {
    marginTop: 18,
    height: 16,
    width: 166,
    borderRadius: 999,
    backgroundColor: host.tokens.accent,
  } as const;
  const sourceStyle28 = {
    marginTop: 9,
    fontSize: 13,
    lineHeight: 19.5,
    color: host.tokens.muted,
  } as const;
  const sourceStyle29 = {
    fontSize: 18,
    lineHeight: 20,
  } as const;
  const sourceStyle30 = {
    marginTop: 34,
  } as const;
  const sourceStyle31 = {
    height: 120,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  } as const;
  const sourceStyle33 = {
    height: 1,
    backgroundColor: host.tokens.border,
  } as const;
  const sourceStyle34 = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
  } as const;
  const sourceStyle36 = {
    paddingHorizontal: 24,
    paddingTop: 30,
    backgroundColor: surface,
  } as const;
  const sourceStyle37 = {
    fontSize: 22,
    lineHeight: 33,
  } as const;
  const sourceStyle38 = {
    paddingTop: 20,
  } as const;
  const sourceStyle39 = {
    marginTop: 18,
    paddingBottom: 18,
    alignSelf: 'center',
  } as const;
  const sourceStyle40 = {
    fontSize: 14,
    lineHeight: 21,
    color: host.tokens.accent,
  } as const;
  const sourceStyle41 = {
    paddingTop: 14,
  } as const;
  return (
    <View style={sourceStyle7}>
      <ScrollView
        testID="ro-transaction-page"
        style={Platform.OS === 'web' ? sourceWebScrollStyle : undefined}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event => {
          return setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 48)),
          );
        }}
      >
        <BaselinePageHeader
          title={title}
          onBack={host.onBack}
          variant="gray"
          showHelp={false}
          renderLargeTitle={false}
          collapsedTitleProgress={progress}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          dark={dark}
        />
        <View style={sourceStyle8}>
          <View style={sourceStyle9}>
            {leadingVisual ? (
              <NativeTransactionLeadingVisual
                transaction={transaction}
                visual={leadingVisual}
              />
            ) : (
              <BaselineTransactionAvatar
                transaction={transaction}
                size={64}
                elevated={Boolean(merchant || enrichment)}
                dark={dark}
              />
            )}
            <Text style={[strong, sourceStyle10]}>{title}</Text>
            <Text style={[strong, sourceStyle11]}>{detail.bookingDate}</Text>
            <Text style={[strong, sourceStyle12]}>{detail.amount}</Text>
            {pending ? (
              <View style={sourceStyle13}>
                <View style={sourceStyle14} />
                <Text style={[strong, sourceStyle15]}>Pending</Text>
              </View>
            ) : (
              <>
                <Text style={[strong, sourceStyle16]}>
                  {detail.pfmCategoryLabel.toUpperCase()}
                </Text>
                <View style={sourceStyle17}>
                  <BaselineTransactionAvatar
                    identity={{
                      kind: 'category',
                      category: detail.pfmCategory,
                      pfmVariant: 'glyph',
                    }}
                    size={20}
                    dark={dark}
                  />
                  <Text style={[strong, sourceStyle18]}>
                    {detail.pfmSubcategoryLabel.toUpperCase()}
                  </Text>
                </View>
              </>
            )}
          </View>
          {!pending ? (
            <View style={sourceStyle19}>
              <BaselineAccountActionBar
                items={actions}
                dark={dark}
                style={sourceStyle20}
              />
            </View>
          ) : null}
        </View>
        {!pending ? (
          <View style={sourceStyle21}>
            <Text style={[strong, sourceStyle22]}>
              {t(
                'runtime.transactionDetail.spendingInsight',
                'Spending Insight',
              )}
            </Text>
            {sectionTitle(
              t(
                'runtime.payments.domesticFlow.overviewFor2026',
                'OVERVIEW FOR 2026',
              ),
            )}
            <View style={sourceStyle23}>
              <Text style={[strong, sourceStyle24]}>
                {detail.categoryGroup}
              </Text>
              <Text style={[strong, sourceStyle25]}>
                26,341.33 {getCurrency(detail.amount)}
              </Text>
              <View style={sourceStyle26} />
              <View style={sourceStyle27} />
              <Text style={[strong, sourceStyle28]}>{detail.categoryTag}</Text>
              <Text style={[strong, sourceStyle29]}>
                10,334.22 {getCurrency(detail.amount)}
              </Text>
            </View>
            {sectionTitle(
              `${t(
                'runtime.transactionDetail.breakdownFor',
                'BREAKDOWN FOR',
              )} ${detail.categoryTag}`,
            )}
            <View style={sourceStyle30}>
              <View style={sourceStyle31}>
                {[118, 74, 47, 86, 69, 51, 82].map((height, index) => {
                  const sourceStyle32 = {
                    width: 16,
                    height,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    backgroundColor: host.tokens.accent,
                  } as const;
                  return <View key={index} style={sourceStyle32} />;
                })}
              </View>
              <View style={sourceStyle33} />
              <View style={sourceStyle34}>
                {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'].map(
                  label => {
                    const sourceStyle35 = {
                      fontSize: 11,
                      lineHeight: 16.5,
                      color: host.tokens.muted,
                    } as const;
                    return (
                      <Text key={label} style={[strong, sourceStyle35]}>
                        {label}
                      </Text>
                    );
                  },
                )}
              </View>
            </View>
          </View>
        ) : null}
        <View style={sourceStyle36}>
          <Text style={[strong, sourceStyle37]}>
            {t('runtime.transactionDetail.title', 'Transaction details')}
          </Text>
          <View style={sourceStyle38}>
            {card ? (
              <>
                {location ? (
                  typeof location === 'string' ? (
                    <MerchantLocation host={host} address={location} />
                  ) : (
                    <MerchantLocation
                      host={host}
                      address={location.address}
                      label={location.label}
                    />
                  )
                ) : null}
                {fact(
                  t(
                    'runtime.cardTransactionDetail.description',
                    'Transaction description',
                  ),
                  title,
                )}
                {fact(
                  t('runtime.transactionDetail.amount', 'Amount'),
                  detail.amount,
                )}
                {fact(
                  t(
                    'runtime.cardTransactionDetail.postingDate',
                    'Posting date',
                  ),
                  detail.bookingDate,
                )}
                {expanded
                  ? fact(
                      t(
                        'runtime.cardTransactionDetail.transactionDate',
                        'Transaction date',
                      ),
                      detail.bookingDate,
                    )
                  : null}
                {mcc ? fact('Merchant Category Code (MCC)', mcc) : null}
              </>
            ) : (
              <>
                {fact(
                  t(
                    'runtime.accounts.detailsInfo.accountNumber',
                    'Account number',
                  ),
                  detail.accountNumber,
                  true,
                )}
                {fact(
                  t(
                    'runtime.accounts.detailsInfo.accountTitle',
                    'Account title',
                  ),
                  detail.accountTitle,
                )}
                {fact(
                  t('runtime.transactionDetail.accountOwner', 'Account owner'),
                  detail.accountOwner,
                )}
                {expanded ? (
                  <>
                    {fact(
                      t(
                        'runtime.transactionDetail.bookingDate',
                        'Booking date',
                      ),
                      detail.bookingDate,
                    )}
                    {fact(
                      t(
                        'runtime.transactionDetail.beneficiaryName',
                        'Beneficiary Name',
                      ),
                      detail.beneficiaryName,
                    )}
                    {fact(
                      t(
                        'runtime.transactionDetail.beneficiaryBankName',
                        'Beneficiary Bank Name',
                      ),
                      detail.beneficiaryBankName,
                    )}
                    {fact(
                      t(
                        'runtime.transactionDetail.beneficiaryAccountNumber',
                        'Beneficiary account number',
                      ),
                      detail.beneficiaryAccountNumber,
                      true,
                    )}
                    {fact(
                      t('runtime.transactionDetail.amount', 'Amount'),
                      detail.amount,
                    )}
                    {fact(
                      t(
                        'runtime.payments.domesticFlow.paymentDetails',
                        'Payment details',
                      ),
                      detail.paymentDetails,
                    )}
                    {fact(
                      t(
                        'runtime.transactionDetail.referenceNumber',
                        'Reference number',
                      ),
                      detail.referenceNumber,
                    )}
                  </>
                ) : null}
              </>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              expanded
                ? t('runtime.actions.showLess', 'Show less')
                : t('runtime.actions.showMore', 'Show more')
            }
            accessibilityState={{
              expanded,
            }}
            onPress={() => {
              return setExpanded(value => {
                return !value;
              });
            }}
            style={sourceStyle39}
          >
            <Text style={[strong, sourceStyle40]}>
              {expanded
                ? t('runtime.actions.showLess', 'Show less')
                : t('runtime.actions.showMore', 'Show more')}
            </Text>
          </Pressable>
          {card ? (
            <View style={sourceStyle41}>
              <BaselineSectionDivider
                title={t('runtime.cardTransactionDetail.cardUsed', 'Card used')}
                dark={dark}
              />
              <BaselineCardNavigationRow
                card={card}
                label={
                  card.type === 'credit_card'
                    ? t(
                        'runtime.cardUsed.mastercardStandardCredit',
                        'Mastercard Standard Credit',
                      )
                    : t(
                        'runtime.accounts.detailsInfo.mastercardStandardDebit',
                        'Mastercard Standard Debit',
                      )
                }
                maskedNumber={formatMaskedCardNumber(card.cardNumber)}
                dark={dark}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
      {categoryOpen ? (
        <RoBaselineCategorySheet
          host={host}
          currentSelection={getPfmCategorySelection(
            transaction.pfmCategory,
            transaction.pfmSubcategory,
          )}
          onClose={() => {
            return setCategoryOpen(false);
          }}
          onConfirm={selection => {
            overrideCategory(host, transaction.id, selection);
            host.onTransactionCategoryChange?.(transaction, selection);
            setCategoryOpen(false);
            setRevision(value => {
              return value + 1;
            });
            host.onChanged();
          }}
        />
      ) : null}
    </View>
  );
}
function getCurrency(amount: string) {
  return amount.split(' ').slice(-1)[0];
}

/** Original Source static map artwork, without substitutions. */
function MerchantLocation({
  host,
  address,
  label = 'Merchant location',
}: {
  host: CurrentScreenProps;
  address: string;
  label?: string;
}) {
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const sourceStyle42 = {
    marginBottom: 8,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: host.tokens.border,
    backgroundColor: sourceColor('var(--uc-surface)', dark),
  } as const;
  const sourceStyle43 = {
    height: 118,
    overflow: 'hidden',
    backgroundColor: '#e7ebe5',
  } as const;
  const sourceStyle44 = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  } as const;
  const sourceStyle45 = {
    flex: 1,
    minWidth: 0,
  } as const;
  const sourceStyle46 = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 15,
    color: host.tokens.muted,
    textTransform: 'uppercase',
  } as const;
  const sourceStyle47 = {
    marginTop: 2,
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 15,
    color: host.tokens.text,
  } as const;
  return (
    <View
      accessibilityLabel={`${label}: ${address}`}
      style={sourceStyle42}
    >
      <View style={sourceStyle43}>
        <Svg
          testID="merchant-location-static-map"
          accessibilityRole="image"
          accessibilityLabel={`Map showing ${address}`}
          width="100%"
          height={118}
          viewBox="0 0 340 118"
          preserveAspectRatio="xMidYMid slice"
        >
          <Rect width={340} height={118} fill="#E8ECE6" />
          <Path
            d="M-12 104C38 81 70 72 114 77C160 82 189 102 229 94C269 86 292 60 356 54V132H-12Z"
            fill="#DDE7D8"
          />
          <Path
            d="M257 -8C250 20 257 42 276 61C291 76 298 97 306 126"
            fill="none"
            stroke="#ACD3E6"
            strokeWidth={12}
          />
          <Path
            d="M257 -8C250 20 257 42 276 61C291 76 298 97 306 126"
            fill="none"
            stroke="#D4EEF8"
            strokeWidth={5}
          />
          <Path
            d="M-18 26C40 29 67 46 105 57C156 72 204 67 249 37C282 15 314 12 358 19"
            fill="none"
            stroke="#FFFDF8"
            strokeWidth={20}
          />
          <Path
            d="M-18 26C40 29 67 46 105 57C156 72 204 67 249 37C282 15 314 12 358 19"
            fill="none"
            stroke="#D4D4CE"
            strokeWidth={2}
          />
          <Path
            d="M11 129C32 92 64 80 102 64C151 44 182 19 208 -12"
            fill="none"
            stroke="#FFFDF8"
            strokeWidth={15}
          />
          <Path
            d="M11 129C32 92 64 80 102 64C151 44 182 19 208 -12"
            fill="none"
            stroke="#D4D4CE"
            strokeWidth={2}
          />
          <Path
            d="M66 -6C78 29 91 49 125 75C149 93 178 104 221 122"
            fill="none"
            stroke="#FFFDF8"
            strokeWidth={10}
          />
          <Path
            d="M66 -6C78 29 91 49 125 75C149 93 178 104 221 122"
            fill="none"
            stroke="#D4D4CE"
            strokeWidth={1.5}
          />
          <G fill="#D4D1C7">
            {[
              [22, 41, 25, 13, 12],
              [47, 62, 23, 12, 12],
              [108, 24, 25, 14, -18],
              [138, 39, 20, 12, -18],
              [175, 73, 23, 13, 8],
              [206, 76, 27, 15, 8],
              [287, 35, 23, 13, 16],
              [313, 47, 20, 12, 16],
            ].map(([x, y, width, height, angle], i) => {
              return (
                <Rect
                  key={i}
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx={2}
                  transform={`rotate(${angle} ${x} ${y})`}
                />
              );
            })}
          </G>
        </Svg>
      </View>
      <View style={sourceStyle44}>
        <SourceCustomIcon
          name="contact-location"
          size={20}
          color={host.tokens.text}
        />
        <View style={sourceStyle45}>
          <Text style={sourceStyle46}>{label}</Text>
          <Text numberOfLines={1} style={sourceStyle47}>
            {address}
          </Text>
        </View>
      </View>
    </View>
  );
}
