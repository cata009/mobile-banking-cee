import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  View,
  StyleSheet,
} from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';
import {
  groupAccountTransactionsByMonth,
  groupAccountTransactionsByDate,
  type AccountTransaction,
} from '@/data/accountDetails';
import type { CreditCard, DebitCard, Product } from '@/data/products';
import { createTransactionDetailData } from '@/data/paymentFlow';
import {
  getMerchantLocation,
  resolveTransactionMerchant,
} from '@/data/merchantDirectory';
import {
  getPfmCategorySelection,
  PFM_CATEGORY_GROUPS,
  type PfmCategoryGroupDefinition,
  type PfmCategorySelection,
} from '@/data/pfmCategories';
import { formatMaskedCardNumber } from '@/app/utils/cardNumber';
import { tokens, s, Copy, money, Glyph } from './Primitives';
import MovementAvatar from './MovementAvatar';
import MonthlyReport from './MonthlyReport';
import { formatEvo2027SignedNumber } from '@/app/utils/evo2027Formatting';
import { Text } from '../../../../../universal/Typography';
import { BaselineAccountActionBar } from '../../../../../universal/BaselineAccountActionBar';
import { BaselineCardNavigationRow } from '../../../../../universal/BaselineCardNavigationRow';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import { SearchField } from '../../../../../universal/SearchField';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { sourceColor } from '../../../../../universal/sourceColor';
import { nativeModalVisibility } from '../../../../../platform/nativeModalVisibility';
import { CategoryMark } from '../pfm/CategoryMark';
import {
  applyCategoryOverride,
  overrideCategory,
} from '../../../current/banking/categoryOverrides';
import {
  BankingCopyToast,
  useBankingCopy,
} from '../../../current/banking/CopyToast';
import type { NativeBankingPresentation } from '@/features/demo-native/bankingPresentation';
import type { NativeTransactionPresentation } from '@/features/demo-native/transactionPresentation';
import { NativeTransactionLeadingVisual } from '../../../current/baseline/NativeTransactionLeadingVisual';
export function MovementRows({
  transactions,
  onSelect,
  presentationRows,
  hidden: _hidden,
  currency = 'CZK',
  pending = true,
  monthlyReports = false,
  onOpenReport,
}: {
  transactions: AccountTransaction[];
  onSelect: (tx: AccountTransaction) => void;
  presentationRows?: NativeBankingPresentation['rows'];
  hidden: boolean;
  currency?: string;
  pending?: boolean;
  monthlyReports?: boolean;
  onOpenReport?: (direction?: 'income' | 'expense') => void;
}) {
  const presentationById = new Map(
    (presentationRows ?? []).map(row => [row.transaction.id, row] as const),
  );
  const row = (tx: AccountTransaction, compact = false) => {
    const presentation = presentationById.get(tx.id);
    return (
      <Pressable
        key={tx.id}
        accessibilityRole="button"
        accessibilityLabel={`Transaction ${tx.id}`}
        onPress={() => onSelect(tx)}
        style={[
          extractedStyles.item0,
          [
            compact ? extractedStyles.item6 : extractedStyles.item7,
            compact
              ? extractedStyles.item8
              : tx.status === 'Pending'
              ? extractedStyles.item9
              : extractedStyles.item10,
          ],
        ]}
      >
        {presentation?.leadingVisual ? (
          <NativeTransactionLeadingVisual
            transaction={tx}
            visual={presentation.leadingVisual}
          />
        ) : (
          <MovementAvatar transaction={tx} />
        )}
        <View style={extractedStyles.item1}>
          <Copy strong>{presentation?.displayLabel ?? tx.label}</Copy>
          {tx.details ? (
            <Copy muted size={14} lineHeight={18}>
              {tx.details}
            </Copy>
          ) : null}
        </View>
        <View style={extractedStyles.item2}>
          <Text
            style={[
              extractedStyles.item3,
              [
                tx.status === 'Pending'
                  ? {
                      color: tokens.muted,
                    }
                  : tx.type === 'credit'
                  ? extractedStyles.item11
                  : {
                      color: tokens.text,
                    },
                {
                  fontFamily: tokens.strongFont,
                },
              ],
            ]}
          >
            {money(tx.amount, currency, false, true).replace(
              /([,.]\d{2}|[,.]\*\*)\s\w+$/,
              '',
            )}
            <Text
              style={[
                extractedStyles.item4,
                {
                  fontFamily: tokens.font,
                },
              ]}
            >
              {
                money(tx.amount, currency, false, true).match(
                  /([,.](?:\d{2}|\*\*)\s\w+)$/,
                )?.[0]
              }
            </Text>
          </Text>
        </View>
      </Pressable>
    );
  };
  const pendingRows = pending
    ? transactions.filter(tx => tx.status === 'Pending')
    : [];
  return (
    <>
      {pendingRows.length > 0 && (
        <>
          <View style={s.section}>
            <Copy strong muted>
              PENDING
            </Copy>
          </View>
          <View style={ledger.card}>{pendingRows.map(tx => row(tx))}</View>
        </>
      )}
      {groupAccountTransactionsByMonth(
        transactions.filter(tx => tx.status === 'Booked'),
      ).map(month => (
        <View key={month.monthKey}>
          {monthlyReports &&
            month.monthKey !==
              transactions.reduce(
                (latest, tx) => (tx.monthKey > latest ? tx.monthKey : latest),
                '',
              ) && (
              <MonthlyReport
                group={month}
                currency={currency}
                hidden={false}
                onOpen={onOpenReport}
              />
            )}
          {groupAccountTransactionsByDate(month.transactions).map(day => (
            <View key={day.dateKey}>
              <View
                style={[
                  extractedStyles.item12,
                  {
                    borderColor: tokens.border,
                  },
                ]}
              >
                <Copy strong muted size={14} lineHeight={15.5}>
                  {day.dateTitle}
                </Copy>
                {day.transactions.length > 1 && (
                  <Copy strong size={14} lineHeight={15.5}>
                    {formatEvo2027SignedNumber(day.dailyTotal)} {currency}
                  </Copy>
                )}
              </View>
              <View style={ledger.card}>
                {day.transactions.map(tx =>
                  row(tx, day.transactions.length === 1),
                )}
              </View>
            </View>
          ))}
        </View>
      ))}
      {transactions.length === 0 && (
        <View style={s.alert}>
          <Copy>No transactions found</Copy>
        </View>
      )}
    </>
  );
}

const transactionCategoryContext = {
  country: 'CZ',
  release: 'release-future-evo-2027',
} as const;

function getMccDisplayName(value?: string) {
  const mcc = value?.trim();
  if (!mcc) return undefined;
  const localizedName = mcc.match(/^\d{4}\s*[·•–—-]\s*(.+)$/)?.[1]?.trim();
  if (localizedName) return localizedName;
  return /^\d{4}$/.test(mcc) ? undefined : mcc;
}

function TransactionFactRow({
  label,
  value,
  copy = false,
  onCopy,
}: {
  label: string;
  value: string;
  copy?: boolean;
  onCopy?: (value: string, label: string) => Promise<void>;
}) {
  return (
    <View style={transactionDetailStyles.factRow}>
      <Text style={transactionDetailStyles.factLabel}>{label}</Text>
      <View style={transactionDetailStyles.factValueSlot}>
        <Text style={transactionDetailStyles.factValue}>{value}</Text>
        {copy ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Copy ${label}`}
            onPress={() => onCopy?.(value, label)}
            style={transactionDetailStyles.copyButton}
          >
            <Glyph name="copy-documents" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function MerchantLocationDetail({
  address,
  label = 'MERCHANT LOCATION',
}: {
  address: string;
  label?: string;
}) {
  return (
    <View
      accessibilityLabel={`${label}: ${address}`}
      style={transactionDetailStyles.locationCard}
    >
      <View
        accessibilityRole="image"
        accessibilityLabel={`Map showing ${address}`}
        style={transactionDetailStyles.locationMap}
      >
        <Svg
          width="100%"
          height={118}
          viewBox="0 0 340 118"
          preserveAspectRatio="xMidYMid slice"
        >
          <Rect width="340" height="118" fill="#E8ECE6" />
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
            <Rect
              x={22}
              y={41}
              width={25}
              height={13}
              rx={2}
              transform="rotate(12 22 41)"
            />
            <Rect
              x={47}
              y={62}
              width={23}
              height={12}
              rx={2}
              transform="rotate(12 47 62)"
            />
            <Rect
              x={108}
              y={24}
              width={25}
              height={14}
              rx={2}
              transform="rotate(-18 108 24)"
            />
            <Rect
              x={138}
              y={39}
              width={20}
              height={12}
              rx={2}
              transform="rotate(-18 138 39)"
            />
            <Rect
              x={175}
              y={73}
              width={23}
              height={13}
              rx={2}
              transform="rotate(8 175 73)"
            />
            <Rect
              x={206}
              y={76}
              width={27}
              height={15}
              rx={2}
              transform="rotate(8 206 76)"
            />
            <Rect
              x={287}
              y={35}
              width={23}
              height={13}
              rx={2}
              transform="rotate(16 287 35)"
            />
            <Rect
              x={313}
              y={47}
              width={20}
              height={12}
              rx={2}
              transform="rotate(16 313 47)"
            />
          </G>
        </Svg>
      </View>
      <View style={transactionDetailStyles.locationCopy}>
        <Glyph name="contact-location" size={20} />
        <View style={transactionDetailStyles.locationText}>
          <Copy strong muted size={12} lineHeight={16}>
            {label.toLocaleUpperCase()}
          </Copy>
          <Copy muted size={12} lineHeight={16}>
            {address}
          </Copy>
        </View>
      </View>
    </View>
  );
}

function TransactionCategorySheet({
  currentSelection,
  onClose,
  onConfirm,
}: {
  currentSelection: PfmCategorySelection;
  onClose: () => void;
  onConfirm: (selection: PfmCategorySelection) => void;
}) {
  const [query, setQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [draftSelection, setDraftSelection] = useState(currentSelection);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleGroups = useMemo(
    () =>
      PFM_CATEGORY_GROUPS.flatMap<PfmCategoryGroupDefinition>(group => {
        if (!normalizedQuery) return [group];
        const groupMatches = group.label
          .toLocaleLowerCase()
          .includes(normalizedQuery);
        const subcategories = group.subcategories.filter(subcategory =>
          subcategory.toLocaleLowerCase().includes(normalizedQuery),
        );
        if (!groupMatches && subcategories.length === 0) return [];
        return [
          {
            ...group,
            subcategories: groupMatches ? group.subcategories : subcategories,
          },
        ];
      }),
    [normalizedQuery],
  );
  const sameSelection = (
    left: PfmCategorySelection,
    right: PfmCategorySelection,
  ) => left.groupId === right.groupId && left.subcategory === right.subcategory;
  const selectionChanged = !sameSelection(draftSelection, currentSelection);
  const sentenceCase = (value: string) => {
    const lower = value.toLocaleLowerCase();
    return `${lower.charAt(0).toLocaleUpperCase()}${lower.slice(1)}`;
  };

  return (
    <ModalPanel
      tokens={tokens}
      title="Change category"
      visible
      onClose={onClose}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Copy strong size={16} lineHeight={20}>
          Recommended categories
        </Copy>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Recommended category"
          onPress={() => setDraftSelection(currentSelection)}
          style={transactionDetailStyles.recommendedCategory}
        >
          <View>
            <Copy muted strong size={12} lineHeight={16}>
              Tap to choose
            </Copy>
            <Copy size={14} lineHeight={18}>
              {sentenceCase(currentSelection.subcategory)}
            </Copy>
          </View>
          <Glyph name="chevron-down-wide" size={20} />
        </Pressable>

        <View style={transactionDetailStyles.categoryGroupsTitle}>
          <Copy strong size={16} lineHeight={20}>
            CATEGORY GROUPS
          </Copy>
        </View>
        <SearchField
          tokens={tokens}
          label="Search categories"
          placeholder="Search"
          value={query}
          onChange={setQuery}
          onSubmit={() => {}}
          onClear={() => setQuery('')}
          containerStyle={transactionDetailStyles.categorySearch}
        />

        {visibleGroups.map(group => {
          const originalGroup =
            PFM_CATEGORY_GROUPS.find(candidate => candidate.id === group.id) ??
            group;
          const count = originalGroup.subcategories.length;
          const expanded =
            normalizedQuery.length > 0 || expandedGroups.includes(group.id);
          const countLabel = count === 1 ? 'category' : 'categories';
          return (
            <View key={group.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${group.label} ${count} ${countLabel}`}
                accessibilityState={{ expanded }}
                onPress={() =>
                  setExpandedGroups(current =>
                    current.includes(group.id)
                      ? current.filter(id => id !== group.id)
                      : [...current, group.id],
                  )
                }
                style={transactionDetailStyles.categoryGroup}
              >
                <View style={transactionDetailStyles.categoryIcon}>
                  <CategoryMark category={group.iconCategory} size={32} />
                </View>
                <View style={transactionDetailStyles.categoryGroupCopy}>
                  <Copy strong size={16} lineHeight={20}>
                    {group.label}
                  </Copy>
                  <Copy muted size={12} lineHeight={16}>
                    {count} {countLabel}
                  </Copy>
                </View>
                <Glyph
                  name={expanded ? 'chevron-up' : 'chevron-down-wide'}
                  size={20}
                />
              </Pressable>
              {expanded ? (
                <View
                  accessibilityRole="radiogroup"
                  accessibilityLabel={`${group.label} subcategories`}
                >
                  {group.subcategories.map(subcategory => {
                    const selection: PfmCategorySelection = {
                      groupId: group.id,
                      groupLabel: group.label,
                      category: group.category,
                      subcategory,
                    };
                    const checked = sameSelection(draftSelection, selection);
                    return (
                      <Pressable
                        key={subcategory}
                        accessibilityRole="radio"
                        accessibilityLabel={subcategory}
                        accessibilityState={{ checked }}
                        onPress={() => setDraftSelection(selection)}
                        style={transactionDetailStyles.subcategory}
                      >
                        <View
                          style={[
                            transactionDetailStyles.radio,
                            {
                              borderWidth: checked ? 7 : 1,
                              borderColor: checked
                                ? tokens.accent
                                : tokens.border,
                            },
                          ]}
                        />
                        <Copy strong size={16} lineHeight={20}>
                          {subcategory}
                        </Copy>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
        {visibleGroups.length === 0 ? (
          <Copy strong muted size={16} lineHeight={20}>
            No categories found
          </Copy>
        ) : null}
        <PrimaryButton
          label="CHANGE CATEGORY"
          disabled={!selectionChanged}
          onPress={() => onConfirm(draftSelection)}
        />
      </ScrollView>
    </ModalPanel>
  );
}

export function MovementDetail({
  transaction,
  product,
  hidden: _hidden,
  onBack,
  onRedo,
  onTransactionCategoryChange,
  cardUsed: providedCard,
  active = true,
  topInset,
  transactionPresentation,
}: {
  transaction: AccountTransaction;
  product?: Product | null;
  hidden: boolean;
  onBack: () => void;
  onRedo?: () => void;
  onTransactionCategoryChange?: (
    transaction: AccountTransaction,
    selection: PfmCategorySelection,
  ) => void;
  cardUsed?: DebitCard | CreditCard | null;
  active?: boolean;
  topInset?: number;
  transactionPresentation?: NativeTransactionPresentation;
}) {
  const [headerProgress, setHeaderProgress] = useState(0),
    [detailsExpanded, setDetailsExpanded] = useState(false),
    [categoryOpen, setCategoryOpen] = useState(false),
    [, setCategoryRevision] = useState(0);
  const { copy: copyBanking, toast } = useBankingCopy();
  const categoryContext = transactionCategoryContext;
  const displayTransaction = applyCategoryOverride(
    categoryContext,
    transaction,
  );
  const detail = createTransactionDetailData(
    displayTransaction,
    'CZ',
    product ?? null,
  );
  const merchant = resolveTransactionMerchant(displayTransaction);
  const enrichment = transactionPresentation?.merchantEnrichment;
  const merchantName =
    enrichment?.cleanMerchantName ?? merchant?.name ?? detail.title;
  const merchantLocation =
    enrichment?.location ??
    (merchant ? getMerchantLocation(merchant, 'CZ') : undefined);
  const mcc = enrichment?.mcc ?? merchant?.mcc;
  const merchantCategory = mcc ? getMccDisplayName(mcc) : undefined;
  const card =
    providedCard ??
    (product &&
    (product.type === 'credit_card' || product.type === 'debit_card')
      ? product
      : null);
  const isCardTransaction = Boolean(card);
  const isPending = displayTransaction.status === 'Pending';
  const currentSelection = getPfmCategorySelection(
    displayTransaction.pfmCategory,
    displayTransaction.pfmSubcategory,
  );
  const categoryOpenForSelection = () => {
    setCategoryOpen(true);
  };
  const handleBack = useCallback(() => {
    if (categoryOpen) setCategoryOpen(false);
    else onBack();
  }, [categoryOpen, onBack]);
  useEffect(() => {
    if (!active) return;
    if (Platform.OS === 'web') {
      const escape = (event: KeyboardEvent) => {
        if (
          event.key === 'Escape' &&
          !event.defaultPrevented &&
          !nativeModalVisibility.getSnapshot()
        ) {
          event.preventDefault();
          handleBack();
        }
      };
      globalThis.addEventListener('keydown', escape);
      return () => globalThis.removeEventListener('keydown', escape);
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (nativeModalVisibility.getSnapshot()) return false;
        handleBack();
        return true;
      },
    );
    return () => subscription.remove();
  }, [active, handleBack]);

  const actionItems = isPending
    ? []
    : [
        {
          id: 'change-category',
          iconName: 'grid-2x2',
          label: 'Change\ncategory',
          onPress: onTransactionCategoryChange
            ? categoryOpenForSelection
            : undefined,
        },
        isCardTransaction
          ? {
              id: 'standing-order-slot',
              iconName: 'standing-order',
              label: 'Create\nStanding order',
              hidden: true,
            }
          : {
              id: 'standing-order',
              iconName: 'standing-order',
              label: 'Create\nStanding order',
            },
        isCardTransaction
          ? {
              id: 'request-chargeback',
              iconName: 'request-chargeback',
              label: 'Request\nchargeback',
            }
          : {
              id: 'redo-payment',
              iconName: 'redo-payment',
              label: 'Redo\npayment',
              onPress: onRedo,
            },
        {
          id: 'send-payment',
          iconName: 'send-payment',
          label: 'Send\npayment',
        },
      ];
  const currencyLabel = detail.amount.split(' ').at(-1) ?? 'CZK';

  return (
    <View style={transactionDetailStyles.screen}>
      <ScrollView
        stickyHeaderIndices={[0]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={transactionDetailStyles.content}
        onScroll={event =>
          setHeaderProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 48)),
          )
        }
      >
        <View>
          <BaselinePageHeader
            title={merchantName}
            onBack={handleBack}
            includeSafeArea
            safeAreaReserve={topInset}
            showHelp={false}
            variant="gray"
            largeTitleAlign="center"
            renderLargeTitle={false}
            collapsedTitleProgress={headerProgress}
          />
        </View>

        <View style={transactionDetailStyles.topSurface}>
          <View style={transactionDetailStyles.summary}>
            {enrichment?.leadingVisual ? (
              <NativeTransactionLeadingVisual
                transaction={displayTransaction}
                visual={enrichment.leadingVisual}
              />
            ) : (
              <MovementAvatar transaction={displayTransaction} size={64} />
            )}
            <Text
              accessibilityRole="header"
              style={transactionDetailStyles.title}
            >
              {merchantName}
            </Text>
            <Copy muted strong size={14} lineHeight={18}>
              {detail.bookingDate}
            </Copy>
            <Text style={transactionDetailStyles.heroAmount}>
              {detail.amount}
            </Text>
            {isPending ? (
              <View style={transactionDetailStyles.pendingStatus}>
                <View style={transactionDetailStyles.pendingDot} />
                <Copy muted strong size={12} lineHeight={16}>
                  Pending
                </Copy>
              </View>
            ) : (
              <>
                <Copy muted strong size={13} lineHeight={16}>
                  {detail.pfmCategoryLabel.toUpperCase()}
                </Copy>
                <View
                  style={[
                    transactionDetailStyles.categoryTag,
                    {
                      borderColor: sourceColor(
                        `var(${detail.pfmCategoryColorVar})`,
                      ),
                    },
                  ]}
                >
                  <CategoryMark
                    category={displayTransaction.pfmCategory}
                    size={20}
                  />
                  <Copy
                    strong
                    size={12}
                    lineHeight={16}
                    color={sourceColor(`var(${detail.pfmCategoryColorVar})`)}
                  >
                    {detail.pfmSubcategoryLabel.toUpperCase()}
                  </Copy>
                </View>
              </>
            )}
          </View>
          {!isPending ? (
            <View style={transactionDetailStyles.actions}>
              <BaselineAccountActionBar
                items={actionItems}
                align="between"
                iconTreatment="bare"
              />
            </View>
          ) : null}
        </View>

        {!isPending ? (
          <View style={transactionDetailStyles.insight}>
            <Text style={transactionDetailStyles.insightTitle}>
              Spending Insight
            </Text>
            <View style={transactionDetailStyles.insightSection}>
              <BaselineSectionDivider title="OVERVIEW FOR 2026" />
              <View style={transactionDetailStyles.insightMeasure}>
                <Copy muted strong size={13} lineHeight={16}>
                  {detail.categoryGroup}
                </Copy>
                <Copy strong size={18} lineHeight={22}>
                  26,341.33 {currencyLabel}
                </Copy>
                <View style={transactionDetailStyles.insightBarFull} />
                <View style={transactionDetailStyles.insightBarShort} />
                <Copy muted strong size={13} lineHeight={16}>
                  {detail.categoryTag}
                </Copy>
                <Copy strong size={18} lineHeight={22}>
                  10,334.22 {currencyLabel}
                </Copy>
              </View>
              <BaselineSectionDivider
                title={`BREAKDOWN FOR ${detail.categoryTag}`}
              />
              <View style={transactionDetailStyles.chart}>
                <View style={transactionDetailStyles.bars}>
                  {[118, 74, 47, 86, 69, 51, 82].map((height, index) => (
                    <View
                      key={index}
                      style={[transactionDetailStyles.bar, { height }]}
                    />
                  ))}
                </View>
                <View style={transactionDetailStyles.chartRule} />
                <View style={transactionDetailStyles.months}>
                  {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'].map(
                    month => (
                      <Copy key={month} muted strong size={11} lineHeight={14}>
                        {month}
                      </Copy>
                    ),
                  )}
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <View style={transactionDetailStyles.detailsSection}>
          <Text style={transactionDetailStyles.detailsTitle}>
            Transaction details
          </Text>
          {card ? (
            <>
              {merchantLocation ? (
                typeof merchantLocation === 'string' ? (
                  <MerchantLocationDetail address={merchantLocation} />
                ) : (
                  <MerchantLocationDetail
                    address={merchantLocation.address}
                    label={merchantLocation.label}
                  />
                )
              ) : null}
              <View style={transactionDetailStyles.factCard}>
                <TransactionFactRow
                  label="Transaction description"
                  value={merchantName}
                />
                <TransactionFactRow label="Amount" value={detail.amount} />
                <TransactionFactRow
                  label="Posting date"
                  value={detail.bookingDate}
                />
                {detailsExpanded ? (
                  <TransactionFactRow
                    label="Transaction date"
                    value={detail.bookingDate}
                  />
                ) : null}
                {merchantCategory ? (
                  <TransactionFactRow
                    label="Merchant Category Code (MCC)"
                    value={merchantCategory}
                  />
                ) : null}
              </View>
            </>
          ) : (
            <View style={transactionDetailStyles.factCard}>
              <TransactionFactRow
                label="Account number"
                value={detail.accountNumber}
                copy
                onCopy={copyBanking}
              />
              <TransactionFactRow
                label="Account title"
                value={detail.accountTitle}
              />
              <TransactionFactRow
                label="Account owner"
                value={detail.accountOwner}
              />
              {detailsExpanded ? (
                <>
                  <TransactionFactRow
                    label="Booking date"
                    value={detail.bookingDate}
                  />
                  <TransactionFactRow
                    label="Beneficiary Name"
                    value={detail.beneficiaryName}
                  />
                  <TransactionFactRow
                    label="Beneficiary Bank Name"
                    value={detail.beneficiaryBankName}
                  />
                  <TransactionFactRow
                    label="Beneficiary account number"
                    value={detail.beneficiaryAccountNumber}
                    copy
                    onCopy={copyBanking}
                  />
                  <TransactionFactRow label="Amount" value={detail.amount} />
                  <TransactionFactRow
                    label="Payment details"
                    value={detail.paymentDetails}
                  />
                  <TransactionFactRow
                    label="Reference number"
                    value={detail.referenceNumber}
                  />
                </>
              ) : null}
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={detailsExpanded ? 'Show less' : 'Show more'}
            accessibilityState={{ expanded: detailsExpanded }}
            onPress={() => setDetailsExpanded(current => !current)}
            style={transactionDetailStyles.showMore}
          >
            <Copy strong size={14} lineHeight={20} color={tokens.accent}>
              {detailsExpanded ? 'Show less' : 'Show more'}
            </Copy>
          </Pressable>
          {card ? (
            <View style={transactionDetailStyles.cardUsed}>
              <BaselineSectionDivider title="CARD USED" />
              <BaselineCardNavigationRow
                card={card}
                label={
                  card.type === 'credit_card'
                    ? 'Mastercard Standard Credit'
                    : 'Mastercard Standard Debit'
                }
                maskedNumber={formatMaskedCardNumber(card.cardNumber)}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
      {categoryOpen && onTransactionCategoryChange ? (
        <TransactionCategorySheet
          currentSelection={currentSelection}
          onClose={() => setCategoryOpen(false)}
          onConfirm={selection => {
            overrideCategory(categoryContext, transaction.id, selection);
            onTransactionCategoryChange(transaction, selection);
            setCategoryRevision(value => value + 1);
            setCategoryOpen(false);
          }}
        />
      ) : null}
      <BankingCopyToast toast={toast} font={tokens.strongFont} />
    </View>
  );
}
const transactionDetailStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.surface,
  },
  content: {
    paddingBottom: 32,
  },
  topSurface: {
    backgroundColor: tokens.background,
    paddingBottom: 8,
  },
  summary: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    marginTop: 12,
    fontFamily: tokens.strongFont,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.56,
    textAlign: 'center',
    color: tokens.text,
  },
  date: {
    marginTop: 8,
  },
  heroAmount: {
    marginTop: 8,
    fontFamily: tokens.strongFont,
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
    color: tokens.text,
  },
  pendingStatus: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: sourceColor('var(--uc-orange-status)'),
  },
  categoryLabel: {
    marginTop: 18,
  },
  categoryTag: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  actions: {
    marginTop: 31,
  },
  insight: {
    paddingHorizontal: 22,
    paddingTop: 23,
  },
  insightTitle: {
    fontFamily: tokens.strongFont,
    fontSize: 22,
    lineHeight: 28,
    color: tokens.text,
  },
  insightSection: {
    paddingTop: 28,
  },
  insightMeasure: {
    paddingTop: 28,
  },
  insightBarFull: {
    height: 16,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: sourceColor('var(--uc-action)'),
  },
  insightBarShort: {
    width: 166,
    height: 16,
    marginTop: 18,
    borderRadius: 8,
    backgroundColor: sourceColor('var(--uc-action)'),
  },
  chart: {
    marginTop: 34,
  },
  bars: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  bar: {
    width: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: sourceColor('var(--uc-action)'),
  },
  chartRule: {
    height: 1,
    backgroundColor: tokens.border,
  },
  months: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  detailsSection: {
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  detailsTitle: {
    fontFamily: tokens.strongFont,
    fontSize: 22,
    lineHeight: 28,
    color: tokens.text,
  },
  factCard: {
    marginTop: 20,
    borderRadius: 18,
    backgroundColor: tokens.surface,
    paddingHorizontal: 16,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: sourceColor('var(--uc-border-muted)'),
  },
  factLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: tokens.font,
    fontSize: 13,
    lineHeight: 18,
    color: tokens.muted,
  },
  factValueSlot: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: 8,
  },
  factValue: {
    flex: 1,
    minWidth: 0,
    fontFamily: tokens.strongFont,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
    color: tokens.text,
  },
  copyButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showMore: {
    alignItems: 'center',
    marginTop: 18,
    paddingBottom: 18,
  },
  cardUsed: {
    paddingTop: 14,
  },
  locationCard: {
    width: '100%',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: 8,
    backgroundColor: tokens.surface,
    overflow: 'hidden',
  },
  locationMap: {
    height: 118,
    overflow: 'hidden',
    backgroundColor: '#e7ebe5',
  },
  locationCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  locationText: {
    flex: 1,
    minWidth: 0,
  },
  categorySheetScroll: {
    maxHeight: 600,
  },
  categorySheetHeading: {
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  recommendedCategory: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  categoryGroupsTitle: {
    paddingTop: 32,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  categorySearch: {
    paddingVertical: 24,
  },
  categoryGroup: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryGroupCopy: {
    flex: 1,
    minWidth: 0,
  },
  categorySubcategories: {
    paddingBottom: 4,
  },
  subcategory: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
const ledger = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    backgroundColor: tokens.surface,
    overflow: 'hidden',
  },
});
const extractedStyles = StyleSheet.create({
  item0: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'center',
  },
  item1: {
    flex: 1,
  },
  item2: {
    alignItems: 'flex-end',
  },
  item3: {
    fontSize: 20,
    lineHeight: 22,
  },
  item4: {
    fontSize: 14,
    lineHeight: 18,
  },
  item5: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item6: {
    paddingVertical: 8,
  },
  item7: {
    paddingVertical: 16,
  },
  item8: {
    minHeight: 64,
  },
  item9: {
    minHeight: 92,
  },
  item10: {
    minHeight: 80,
  },
  item11: {
    color: '#3d7d43',
  },
  item12: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
