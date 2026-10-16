import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { createTransactionDetailData } from '@/data/paymentFlow';
import {
  PFM_CATEGORY_GROUPS,
  getPfmCategorySelection,
  type PfmCategorySelection,
} from '@/data/pfmCategories';
import {
  resolveTransactionMerchant,
  getMerchantLocation,
  getMerchantRoundel,
  getMerchantMarkPath,
} from '@/data/merchantDirectory';
import emag from '@/assets/ethoca/emag-official.svg';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { Select } from '../../../../universal/Select';
import { ActionButton } from '../../../../universal/ActionButton';
import { Page, Heading } from '../Primitives';
import type { CurrentScreenProps } from '../contracts';
import { bankingProducts, copy, productTransactions } from './model';
import { applyCategoryOverride, overrideCategory } from './categoryOverrides';
import {
  Amount,
  Fact,
  Label,
  QuickActions,
  Row,
  Search,
  Section,
} from './Primitives';
import { CategoryMark } from './CategoryMark';
import { CardArt } from './CardArt';

export function TransactionScreen(host: CurrentScreenProps) {
  const data = bankingProducts(host);
  const product =
    data.products.find(
      item =>
        item.id ===
        (host.route.params?.productId ??
          host.route.params?.accountId ??
          host.route.params?.cardId),
    ) ?? data.currentAccounts[0];
  const raw = product
    ? productTransactions(host, product).find(
        item => item.id === host.route.params?.transactionId,
      )
    : undefined;
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selection, setSelection] = useState<PfmCategorySelection | null>(null);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [, changed] = useState(0);
  if (!raw || !product)
    return (
      <Page
        host={host}
        title={copy(
          host,
          'runtime.transactionDetail.title',
          'Transaction details',
        )}
      >
        <Heading host={host}>
          {copy(host, 'runtime.transactionDetail.title', 'Transaction details')}
        </Heading>
        <Label host={host}>No transaction selected</Label>
      </Page>
    );
  const transaction = applyCategoryOverride(host, raw);
  const detail = createTransactionDetailData(
    transaction,
    host.country,
    product,
  );
  const card =
    product.type === 'credit_card' || product.type === 'debit_card'
      ? product
      : transaction.source === 'card'
      ? data.cards.find(
          item =>
            item.type === 'debit_card' && item.linkedAccountId === product.id,
        )
      : undefined;
  const merchant = resolveTransactionMerchant(transaction);
  const roundel = merchant ? getMerchantRoundel(merchant) : null;
  const mark = merchant ? getMerchantMarkPath(merchant) : null;
  const location = merchant
    ? getMerchantLocation(merchant, host.country)
    : undefined;
  const currentSelection = getPfmCategorySelection(
    transaction.pfmCategory,
    transaction.pfmSubcategory,
  );
  const draftSelection = selection ?? currentSelection;
  const chosenGroup = PFM_CATEGORY_GROUPS.find(
    group => group.id === draftSelection.groupId,
  );
  const title = merchant?.name ?? transaction.label;
  return (
    <Page host={host} title={title}>
      <View style={s.summary}>
        {roundel ? (
          <View
            style={[s.merchantDisc, { backgroundColor: roundel.background }]}
          >
            {mark ? (
              <Svg
                width={64 * roundel.scale}
                height={64 * roundel.scale}
                viewBox="0 0 24 24"
              >
                <Path
                  d={mark}
                  fill={roundel.foreground.replace(
                    /var\(--uc-static-white\)/g,
                    '#ffffff',
                  )}
                />
              </Svg>
            ) : merchant?.asset === 'emag' ? (
              <AssetGlyph asset={emag} size={48} />
            ) : (
              <CategoryMark category={transaction.pfmCategory} size={48} />
            )}
          </View>
        ) : (
          <CategoryMark category={transaction.pfmCategory} size={64} />
        )}
        <Heading host={host}>{title}</Heading>
        <Label host={host} muted size={14}>
          {detail.bookingDate}
        </Label>
        <Amount
          host={host}
          value={transaction.amount}
          currency={product.currency}
          size={22}
        />
        <Label host={host} strong muted size={13}>
          {transaction.status === 'Pending' ? 'Pending' : detail.categoryGroup}
        </Label>
        {transaction.status !== 'Pending' ? (
          <View style={[s.tag, { borderColor: host.tokens.accent }]}>
            <Label host={host} size={12}>
              {detail.categoryTag}
            </Label>
          </View>
        ) : null}
      </View>
      {transaction.status !== 'Pending' ? (
        <QuickActions
          host={host}
          items={[
            {
              id: 'category',
              icon: 'grid-2x2',
              label: copy(
                host,
                'runtime.transactionDetail.actions.changeCategory',
                'Change\ncategory',
              ),
              onPress: () => {
                setSelection(currentSelection);
                setCategoryOpen(true);
              },
            },
            ...(card
              ? [
                  {
                    id: 'chargeback',
                    icon: 'request-chargeback',
                    label: 'Request\nchargeback',
                  },
                ]
              : [
                  {
                    id: 'standing-order',
                    icon: 'standing-order',
                    label: copy(
                      host,
                      'runtime.transactionDetail.actions.createStandingOrder',
                      'Create\nStanding order',
                    ),
                  },
                  {
                    id: 'redo',
                    icon: 'redo-payment',
                    label: copy(
                      host,
                      'runtime.transactionDetail.actions.redoPayment',
                      'Redo\npayment',
                    ),
                    onPress: () =>
                      host.onNavigate({
                        screen: 'payment-create',
                        params: {
                          productId: product.id,
                          transactionId: transaction.id,
                        },
                      }),
                  },
                ]),
            {
              id: 'send',
              icon: 'send-payment',
              label: copy(
                host,
                'runtime.transactionDetail.actions.sendPayment',
                'Send\npayment',
              ),
            },
          ]}
        />
      ) : null}
      <Heading host={host}>
        {copy(host, 'runtime.transactionDetail.title', 'Transaction details')}
      </Heading>
      {card ? (
        <View>
          {location ? (
            <View style={[s.location, { borderColor: host.tokens.border }]}>
              <Svg width="100%" height={100} viewBox="0 0 340 118">
                <Rect width="340" height="118" fill="#E8ECE6" />
                <Path
                  d="M257 -8C250 20 257 42 276 61C291 76 298 97 306 126"
                  fill="none"
                  stroke="#ACD3E6"
                  strokeWidth="12"
                />
                <Path
                  d="M-18 26C40 29 67 46 105 57C156 72 204 67 249 37C282 15 314 12 358 19"
                  fill="none"
                  stroke="#FFFDF8"
                  strokeWidth="20"
                />
                <Path
                  d="M11 129C32 92 64 80 102 64C151 44 182 19 208 -12"
                  fill="none"
                  stroke="#FFFDF8"
                  strokeWidth="15"
                />
                <Path
                  d="M170 39c-11 0-20 9-20 20 0 14 20 29 20 29s20-15 20-29c0-11-9-20-20-20Z"
                  fill="#e2001a"
                />
              </Svg>
              <Fact host={host} label="Merchant location" value={location} />
            </View>
          ) : null}
          <Fact
            host={host}
            label={copy(
              host,
              'runtime.cardTransactionDetail.description',
              'Transaction description',
            )}
            value={title}
          />
          <Fact
            host={host}
            label={copy(host, 'runtime.transactionDetail.amount', 'Amount')}
            value={
              <Amount
                host={host}
                value={transaction.amount}
                currency={product.currency}
                size={18}
              />
            }
          />
          <Fact
            host={host}
            label={copy(
              host,
              'runtime.cardTransactionDetail.postingDate',
              'Posting date',
            )}
            value={detail.bookingDate}
          />
          {expanded ? (
            <Fact
              host={host}
              label={copy(
                host,
                'runtime.cardTransactionDetail.transactionDate',
                'Transaction date',
              )}
              value={detail.bookingDate}
            />
          ) : null}
          {merchant?.mcc ? (
            <Fact
              host={host}
              label="Merchant Category Code (MCC)"
              value={merchant.mcc.replace(/^\d{4}\s*[·•–—-]\s*/, '')}
            />
          ) : null}
        </View>
      ) : (
        <View>
          <Fact
            host={host}
            label={copy(
              host,
              'runtime.accounts.detailsInfo.accountNumber',
              'Account number',
            )}
            value={detail.accountNumber}
          />
          <Fact
            host={host}
            label={copy(
              host,
              'runtime.accounts.detailsInfo.accountTitle',
              'Account title',
            )}
            value={detail.accountTitle}
          />
          <Fact
            host={host}
            label={copy(
              host,
              'runtime.transactionDetail.accountOwner',
              'Account owner',
            )}
            value={detail.accountOwner}
          />
          {expanded ? (
            <View>
              {[
                ['bookingDate', 'Booking date', detail.bookingDate],
                ['beneficiaryName', 'Beneficiary Name', detail.beneficiaryName],
                [
                  'beneficiaryBankName',
                  'Beneficiary Bank Name',
                  detail.beneficiaryBankName,
                ],
                [
                  'beneficiaryAccountNumber',
                  'Beneficiary account number',
                  detail.beneficiaryAccountNumber,
                ],
                ['referenceNumber', 'Reference number', detail.referenceNumber],
              ].map(([key, label, value]) => (
                <Fact
                  key={key}
                  host={host}
                  label={copy(host, `runtime.transactionDetail.${key}`, label!)}
                  value={value}
                />
              ))}
              <Fact
                host={host}
                label={copy(host, 'runtime.transactionDetail.amount', 'Amount')}
                value={
                  <Amount
                    host={host}
                    value={transaction.amount}
                    currency={product.currency}
                    size={18}
                  />
                }
              />
              <Fact
                host={host}
                label={copy(
                  host,
                  'runtime.payments.domesticFlow.paymentDetails',
                  'Payment details',
                )}
                value={detail.paymentDetails}
              />
            </View>
          ) : null}
        </View>
      )}
      <ActionButton
        tokens={host.tokens}
        secondary
        label={copy(
          host,
          expanded ? 'runtime.actions.showLess' : 'runtime.actions.showMore',
          expanded ? 'Show less' : 'Show more',
        )}
        onPress={() => setExpanded(value => !value)}
      />
      {card ? (
        <View>
          <Section
            host={host}
            title={copy(
              host,
              'runtime.cardTransactionDetail.cardUsed',
              'Card used',
            )}
          />
          <Row
            host={host}
            title={card.name}
            subtitle={`•••• ${card.cardNumber.slice(-4)}`}
            trailing={<CardArt card={card} width={64} />}
          />
        </View>
      ) : null}
      <ModalPanel
        tokens={host.tokens}
        title={copy(host, 'runtime.pfmCategoryChange.title', 'Change category')}
        visible={categoryOpen}
        onClose={() => setCategoryOpen(false)}
      >
        <ScrollView style={s.categoryScroll}>
          <Search host={host} value={query} onChange={setQuery} />
          {PFM_CATEGORY_GROUPS.filter(
            group =>
              !query ||
              [group.label, ...group.subcategories].some(text =>
                text.toLowerCase().includes(query.toLowerCase()),
              ),
          ).map(group => (
            <Row
              key={group.id}
              host={host}
              title={group.label}
              subtitle={`${group.subcategories.length} categories`}
              onPress={() =>
                setSelection({
                  groupId: group.id,
                  groupLabel: group.label,
                  category: group.category,
                  subcategory: group.subcategories[0] ?? group.label,
                })
              }
            />
          ))}
          {chosenGroup ? (
            <Select
              tokens={host.tokens}
              label="Category"
              value={draftSelection.subcategory}
              items={chosenGroup.subcategories.map(subcategory => ({
                value: subcategory,
                label: subcategory,
              }))}
              onChange={subcategory =>
                setSelection({ ...draftSelection, subcategory })
              }
            />
          ) : null}
          <ActionButton
            tokens={host.tokens}
            label={copy(host, 'runtime.actions.confirm', 'Confirm')}
            disabled={
              draftSelection.groupId === currentSelection.groupId &&
              draftSelection.subcategory === currentSelection.subcategory
            }
            onPress={() => {
              overrideCategory(host, transaction.id, draftSelection);
              host.onTransactionCategoryChange?.(transaction, draftSelection);
              setCategoryOpen(false);
              changed(value => value + 1);
              host.onChanged();
            }}
          />
        </ScrollView>
      </ModalPanel>
    </Page>
  );
}
const s = StyleSheet.create({
  categoryScroll: { maxHeight: 420 },
  merchantDisc: {
    height: 64,
    width: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: { alignItems: 'center', gap: 12, paddingTop: 8 },
  tag: {
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  location: { borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
});
