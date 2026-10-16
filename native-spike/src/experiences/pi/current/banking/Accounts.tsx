import { BankingCopyToast, useBankingCopy } from './CopyToast';
import React, { useEffect, useId, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import {
  ACCOUNT_OPTION_ITEMS,
  ACCOUNT_PRODUCT_OPTIONS,
} from '@/data/accountDetails';
import {
  getLoanDetails,
  getTermDepositDetails,
} from '@/data/accountProductDetails';
import type { Product } from '@/data/products';
import { Heading, IconAction } from '../Primitives';
import { BankingPage as Page } from './Primitives';
import type { CurrentScreenProps } from '../contracts';
import {
  bankingProducts,
  accountActions,
  copy,
  productTransactions,
} from './model';
import { Amount, Fact, Label, QuickActions, Row, Section } from './Primitives';
import { Ledger } from './Ledger';
import { CardArt } from './CardArt';
import { optionArt } from './assets';
import { Text } from '../../../../universal/Typography';
import {openCurrentContextHelp} from '../coapping/adapter';
import {getCzChatHelpAreaForAccountProduct} from '@/app/chat/cz/context';
import { formatMaskedCardNumber } from '@/app/utils/cardNumber';
import {
  formatMoneyNumber,
  getCountryConfig,
} from '@/app/registry/countryConfig';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { SoftShadow } from '../../../../universal/SoftShadow';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import {
  maskAmountParts,
  maskFormattedAmount,
} from '@/app/utils/amountPrivacy';
import Carousel from '../../cz/evo-2027/accounts/Carousel';
import Indicator from '../../cz/evo-2027/accounts/Indicator';
export function AccountsScreen(host: CurrentScreenProps) {
  const accounts = bankingProducts(host).accounts;
  return (
    <Page
      host={host}
      title={copy(host, 'runtime.accounts.myProductsTitle', 'My Products')}
    >
      <Heading host={host}>
        {copy(host, 'runtime.accounts.myProductsTitle', 'My Products')}
      </Heading>
      {accounts.map(product => (
        <Row
          key={product.id}
          host={host}
          title={product.name}
          subtitle={product.accountNumber}
          icon="account-details"
          trailing={
            <Amount
              host={host}
              value={Math.abs(product.balance)}
              currency={product.currency}
              size={16}
            />
          }
          onPress={() =>
            host.onNavigate({
              screen: 'account',
              params: {
                productId: product.id,
              },
            })
          }
        />
      ))}
      {accounts.length === 0 ? (
        <Label host={host} muted>
          No accounts
        </Label>
      ) : null}
    </Page>
  );
}
function BalanceCard({
  host,
  product,
  active,
  onCopy,
}: {
  host: CurrentScreenProps;
  product: Product;
  active: boolean;
  onCopy: () => void;
}) {
  const data = bankingProducts(host);
  const deposit =
    product.type === 'term_deposit'
      ? getTermDepositDetails(
          product,
          data.currentAccounts[0]?.accountNumber ?? '',
        )
      : null;
  const loan =
    product.type === 'loan' || product.type === 'mortgage'
      ? getLoanDetails(product)
      : null;
  const label =
    product.type === 'saving_account'
      ? 'Available funds'
      : deposit
      ? 'Deposit amount'
      : loan
      ? 'Remaining loan amount'
      : 'Available balance';
  const formatted = formatEvo2027Number(loan?.ownedAmount ?? product.balance);
  const split = formatted.match(/^(.+?)([,.]\d{2})$/);
  const primary = maskAmountParts(
    {
      integer: split?.[1] ?? formatted,
      decimals: split?.[2] ?? ',00',
      currency: product.currency,
    },
    host.amountsHidden,
  );
  const progress = deposit?.progress ?? loan?.progress;
  const secondary = maskFormattedAmount(
    formatEvo2027Number(
      deposit?.maturityAmount ??
        loan?.nextInstallment ??
        product.balance * 0.92,
    ),
    host.amountsHidden,
  );
  return (
    <View
      style={[
        s.balance,
        [
          {
            backgroundColor: host.tokens.surface,
          },
          active ? parityStyles.item0 : parityStyles.item1,
        ],
        Platform.OS !== 'android' && parityStyles.item2,
      ]}
    >
      <SoftShadow
        width={311}
        height={197}
        radius={6}
        offsetY={16}
        blur={32}
        color="#000000"
        opacity={0.08}
      />
      <SoftShadow
        width={311}
        height={197}
        radius={6}
        offsetY={3}
        blur={10}
        color="#000000"
        opacity={0.05}
      />
      <View>
        <Text
          style={[
            {
              fontFamily: host.tokens.strongFont,
            },
            parityStyles.item3,
            {
              color: host.tokens.accent,
            },
          ]}
        >
          {product.name}
        </Text>
        <View style={s.iban}>
          <Text
            numberOfLines={1}
            style={[
              parityStyles.item4,
              {
                fontFamily: host.tokens.strongFont,
              },
              parityStyles.item5,
              {
                color: host.tokens.muted,
              },
            ]}
          >
            {deposit
              ? `Maturity date ${deposit.maturityDate}`
              : product.accountNumber}
          </Text>
          {!deposit ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Copy account number"
              onPress={event => {
                event.stopPropagation();
                onCopy();
              }}
              style={s.copy}
            >
              <SourceCustomIcon
                name="copy-documents"
                size={24}
                color={host.tokens.text}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
      <View style={s.balanceValues}>
        <View>
          <Text
            style={[
              {
                fontFamily: host.tokens.strongFont,
              },
              parityStyles.item6,
              {
                color: host.tokens.muted,
              },
            ]}
          >
            {label}
          </Text>
          <Text
            style={[
              {
                fontFamily: host.tokens.strongFont,
              },
              parityStyles.item7,
              {
                color: host.tokens.text,
              },
            ]}
          >
            {primary.integer}
            <Text
              style={[
                {
                  fontFamily: host.tokens.font,
                },
                parityStyles.item8,
              ]}
            >
              {primary.decimals} {primary.currency}
            </Text>
          </Text>
        </View>
        {progress !== undefined ? (
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: Math.round(Math.min(1, Math.max(0, progress)) * 100),
            }}
            style={[
              s.progress,
              {
                backgroundColor: host.tokens.border,
              },
            ]}
          >
            <View
              style={[
                [
                  parityStyles.item9,
                  {
                    width: `${Math.min(1, Math.max(0, progress)) * 100}%`,
                  },
                ],
                {
                  backgroundColor: host.tokens.accent,
                },
              ]}
            />
          </View>
        ) : (
          <View
            style={[
              parityStyles.item10,
              {
                backgroundColor: host.tokens.border,
              },
            ]}
          />
        )}
        {product.type !== 'saving_account' ? (
          <View style={s.secondary}>
            <Text
              style={[
                {
                  fontFamily: host.tokens.strongFont,
                },
                parityStyles.item6,
                {
                  color: host.tokens.muted,
                },
              ]}
            >
              {deposit
                ? 'Maturity amount'
                : loan
                ? 'Next installment'
                : 'Current balance'}
            </Text>
            <Text
              style={[
                {
                  fontFamily: host.tokens.strongFont,
                },
                parityStyles.item6,
                {
                  color: host.tokens.text,
                },
              ]}
            >
              {secondary} {product.currency}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
export function AccountScreen(host: CurrentScreenProps) {
  const data = bankingProducts(host);
  const initialSelection =
    host.route.params?.productId ??
    host.route.params?.accountId ??
    data.accounts[0]?.id ??
    '';
  const [selected, setSelected] = useState(initialSelection);
  const { copy: copyBanking, toast } = useBankingCopy();
  useEffect(() => {
    setSelected(initialSelection);
  }, [initialSelection]);
  const product =
    data.accounts.find(account => account.id === selected) ?? data.accounts[0];
  if (!product) return <AccountsScreen {...host} />;
  const copyAccount = (value: string) => copyBanking(value, 'Account number');
  const firstAccount = data.currentAccounts[0];
  return (
    <View style={copyStyles.root}>
      <Page
        host={host}
        title={copy(host, 'runtime.accounts.myProductsTitle', 'My Products')}
        contentContainerStyle={parityStyles.item11}
        trailing={
          <IconAction
            host={host}
            name="help-circle"
            label="Help"
            onPress={() => openCurrentContextHelp(host,getCzChatHelpAreaForAccountProduct(product))}
          />
        }
      >
        <Heading host={host} style={parityStyles.item12}>
          {copy(host, 'runtime.accounts.myProductsTitle', 'My Products')}
        </Heading>
        <Carousel
          items={data.accounts}
          selectedId={product.id}
          onSelect={account => setSelected(account.id)}
          geometry={ACCOUNT_GEOMETRY}
          label={account => account.name}
          renderItem={account => (
            <BalanceCard
              host={host}
              product={account}
              active={account.id === product.id}
              onCopy={() => copyAccount(account.accountNumber)}
            />
          )}
        />
        <View style={parityStyles.item13}>
          <Indicator
            ids={data.accounts.map(account => account.id)}
            selectedId={product.id}
            onSelect={setSelected}
            controlTokens={host.tokens}
          />
        </View>
        {null}
        <QuickActions
          host={host}
          items={['details', 'options', 'add-money', 'mcash']
            .map(
              id =>
                accountActions(product).find(action => action.id === id) ?? {
                  id,
                  icon: id === 'mcash' ? 'mcash' : `account-${id}`,
                  key: id,
                  label: id,
                  active: false,
                  hidden: true,
                },
            )
            .map(action => ({
              id: action.id,
              hidden: 'hidden' in action && action.hidden === true,
              icon: action.icon,
              label: copy(
                host,
                `runtime.accounts.actions.${action.key}`,
                action.label,
              ),
              onPress: action.active
                ? () =>
                    host.onNavigate({
                      screen:
                        action.id === 'details'
                          ? 'account-info'
                          : 'account-options',
                      params: {
                        productId: product.id,
                      },
                    })
                : undefined,
            }))}
        />
        {product.type !== 'term_deposit' ? (
          <Ledger
            host={host}
            rows={productTransactions(host, product).map(transaction => ({
              transaction,
              product,
            }))}
            filtersEnabled
            report={product.type === 'current_account'}
            pending={product.id === firstAccount?.id}
          />
        ) : null}
      </Page>
      <BankingCopyToast toast={toast} font={host.tokens.strongFont} />
    </View>
  );
}
export function AccountInfoScreen(host: CurrentScreenProps) {
  const data = bankingProducts(host);
  const product =
    data.accounts.find(
      account =>
        account.id ===
        (host.route.params?.productId ?? host.route.params?.accountId),
    ) ?? data.accounts[0];
  const { copy: copyBanking, toast } = useBankingCopy();
  if (!product) return <AccountsScreen {...host} />;
  const format = (value: number) =>
    `${maskFormattedAmount(
      formatMoneyNumber(value, host.country),
      host.amountsHidden,
    )} ${getCountryConfig(host.country).currency}`;
  const deposit =
    product.type === 'term_deposit'
      ? getTermDepositDetails(
          product,
          data.currentAccounts[0]?.accountNumber ?? product.accountNumber,
        )
      : null;
  const loan =
    product.type === 'loan' || product.type === 'mortgage'
      ? getLoanDetails(product)
      : null;
  const titleField = {
    label: copy(
      host,
      'runtime.accounts.detailsInfo.accountTitle',
      'Account title',
    ),
    value: copy(host,`runtime.accounts.productTitles.${product.type==='saving_account' ? 'savingAccount' : product.type==='term_deposit' ? 'termDeposit' : product.type==='current_account' ? 'currentAccount' : product.type}`,product.type.replace(/_/g, ' ').toUpperCase()),
  };
  const fields: {
    label: string;
    value: React.ReactNode;
  }[] = deposit
    ? [
        ['Maturity amount', format(deposit.maturityAmount)],
        ['Interest amount before tax', format(deposit.interestAmountBeforeTax)],
        ['Maturity date', deposit.maturityDate],
        ['Rollover', deposit.rollover],
        ['Account title', titleField.value],
        ['Account owner', deposit.accountOwner],
        ['Deposit Amount', format(deposit.depositAmount)],
        ['Start/Value Date', deposit.startValueDate],
        ['Maturity period', deposit.maturityPeriod],
        ['Interest rate/year', deposit.interestRatePerYear],
        ['Current account number', deposit.currentAccountNumber],
        ['Decrease amount by', format(deposit.decreaseAmountBy)],
        ['Reinvest the interest', deposit.reinvestInterest],
      ].map(([label, value]) => ({
        label: label as string,
        value,
      }))
    : loan
    ? [
        ['Next installment', format(loan.nextInstallment)],
        ['Next installment date', loan.nextInstallmentDate],
        ['Interest rate', loan.interestRate],
        ['Overdue amount', format(loan.overdueAmount)],
        ['Overdue interest rate', loan.overdueInterestRate],
        ['Owned amount', format(loan.ownedAmount)],
        ['Original amount', format(loan.originalAmount)],
        ['Account title', titleField.value],
        ['IBAN', loan.iban],
        ['Account owner', loan.accountOwner],
        ['Start date', loan.startDate],
        ['Final payment', loan.finalPayment],
      ].map(([label, value]) => ({
        label: label as string,
        value,
      }))
    : [
        {
          label: copy(
            host,
            'runtime.accounts.detailsInfo.accountNumber',
            'Account number',
          ),
          value: product.accountNumber,
        },
        ...(product.type === 'saving_account'
          ? [titleField]
          : [
              {
                label: copy(
                  host,
                  'runtime.accounts.detailsInfo.availableFunds',
                  'Available funds',
                ),
                value: format(product.balance),
              },
            ]),
        {
          label: copy(
            host,
            'runtime.accounts.detailsInfo.currentBalance',
            'Current balance',
          ),
          value: format(
            product.type === 'saving_account'
              ? product.balance
              : product.balance * 0.92,
          ),
        },
        ...(product.type === 'saving_account'
          ? []
          : [
              {
                label: copy(
                  host,
                  'runtime.accounts.detailsInfo.blockedReservedAmount',
                  'Blocked/reserved amount',
                ),
                value: format(0),
              },
              {
                label: copy(
                  host,
                  'runtime.accounts.detailsInfo.overdraft',
                  'Overdraft',
                ),
                value: format(0),
              },
              titleField,
              {
                label: copy(
                  host,
                  'runtime.accounts.detailsInfo.offer',
                  'Offer',
                ),
                value: copy(
                  host,
                  'runtime.accounts.detailsInfo.offerValue',
                  'Account under favorable conditions',
                ),
              },
            ]),
      ];
  const connected = data.cards.find(
    card => card.type === 'debit_card' && card.linkedAccountId === product.id,
  );
  return (
    <View style={copyStyles.root}>
      <Page
        host={host}
        title={copy(
          host,
          'runtime.accounts.detailsInfo.title',
          'Account Details',
        )}
        contentContainerStyle={parityStyles.item14}
        trailing={
          <IconAction
            host={host}
            name="share-filled"
            label="Share account details"
          />
        }
      >
        <Heading host={host} style={parityStyles.item15}>
          {copy(host, 'runtime.accounts.detailsInfo.title', 'Account Details')}
        </Heading>
        <View style={parityStyles.item16}>
          {fields.map((field, index) => (
            <Fact
              information
              key={index}
              host={host}
              label={field.label}
              value={field.value}
              trailing={
                field.value === product.accountNumber ? (
                  <IconAction
                    host={host}
                    name="copy-documents"
                    label="Copy account number"
                    onPress={() => {
                      return copyBanking(
                        product.accountNumber,
                        'Account number',
                      );
                    }}
                  />
                ) : undefined
              }
            />
          ))}
          {null}
          {product.type === 'current_account' ? (
            <View>
              <View style={parityStyles.item17}>
                <Label
                  host={host}
                  strong
                  style={{
                    color: host.tokens.accent,
                  }}
                >
                  SHOW LESS
                </Label>
              </View>
              <Section
                host={host}
                title={copy(
                  host,
                  'runtime.accounts.detailsInfo.connectedCards',
                  'Connected cards',
                )}
              />
              <View style={parityStyles.item18}>
                {connected ? <CardArt card={connected} width={64} /> : null}
                <View style={parityStyles.item19}>
                  <Label host={host} strong style={parityStyles.item20}>
                    {copy(
                      host,
                      'runtime.accounts.detailsInfo.mastercardStandardDebit',
                      'Mastercard Standard Debit',
                    )}
                  </Label>
                  <Label
                    host={host}
                    size={14}
                    muted
                    style={parityStyles.item21}
                  >
                    {connected
                      ? formatMaskedCardNumber(connected.cardNumber)
                      : '5545 XXXX XXXX 3250'}
                  </Label>
                </View>
                <SourceCustomIcon
                  name="chevron-link"
                  size={24}
                  color={host.tokens.text}
                />
              </View>
            </View>
          ) : null}
        </View>
      </Page>
      <BankingCopyToast toast={toast} font={host.tokens.strongFont} />
    </View>
  );
}
export function AccountOptionsScreen(host: CurrentScreenProps) {
  const shadeId = useId().replace(/:/g, '');
  return (
    <Page
      host={host}
      title={copy(host, 'runtime.accountOptions.title', 'Account options')}
      contentContainerStyle={parityStyles.item11}
      trailing={<View />}
    >
      <Heading host={host} style={parityStyles.item22}>
        {copy(host, 'runtime.accountOptions.title', 'Account options')}
      </Heading>
      <View style={parityStyles.item23}>
        <View style={parityStyles.item24}>
          {ACCOUNT_OPTION_ITEMS.map(item => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={copy(
                host,
                `runtime.accountOptions.items.${item.id}.title`,
                item.title,
              )}
              style={parityStyles.item25}
            >
              <View style={parityStyles.item26}>
                <SourceCustomIcon
                  name={`account-option-${
                    item.id === 'share-account-info'
                      ? 'share-info'
                      : item.id === 'account-statement'
                      ? 'statement'
                      : item.id === 'change-account-name'
                      ? 'change-name'
                      : item.id
                  }`}
                  size={24}
                  color={host.tokens.text}
                />
              </View>
              <View style={parityStyles.item19}>
                <Label host={host} strong size={14} style={parityStyles.item27}>
                  {copy(
                    host,
                    `runtime.accountOptions.items.${item.id}.title`,
                    item.title,
                  ).toUpperCase()}
                </Label>
                <Label host={host} muted size={14} style={parityStyles.item27}>
                  {copy(
                    host,
                    `runtime.accountOptions.items.${item.id}.description`,
                    item.description,
                  )}
                </Label>
              </View>
              <View style={parityStyles.item26}>
                <SourceCustomIcon
                  name="chevron-link"
                  size={24}
                  color={host.tokens.text}
                />
              </View>
            </Pressable>
          ))}
        </View>
        <View style={parityStyles.item28}>
          <View
            style={[
              parityStyles.item29,
              {
                borderColor: host.tokens.border,
              },
            ]}
          >
            <Label host={host} strong style={parityStyles.item20}>
              {copy(
                host,
                'runtime.productsMenu.title',
                'Products',
              ).toUpperCase()}
            </Label>
          </View>
          <View style={parityStyles.item30}>
            {ACCOUNT_PRODUCT_OPTIONS.map(item => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={copy(
                  host,
                  `runtime.accountOptions.products.${item.id}.title`,
                  item.title,
                )}
                style={[s.offer, parityStyles.item31]}
              >
                <Image
                  source={optionArt[item.image]}
                  style={s.fill}
                  resizeMode="cover"
                />
                <Svg width="100%" height="100%" style={s.fill}>
                  <Defs>
                    <LinearGradient id={shadeId} x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0" stopColor="#000000" stopOpacity={0.7} />
                      <Stop
                        offset=".5"
                        stopColor="#000000"
                        stopOpacity={0.32}
                      />
                      <Stop offset="1" stopColor="#000000" stopOpacity={0.1} />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill={`url(#${shadeId})`} />
                </Svg>
                <View style={parityStyles.item32}>
                  <Text
                    style={[
                      {
                        fontFamily: host.tokens.strongFont,
                      },
                      parityStyles.item33,
                    ]}
                  >
                    {copy(
                      host,
                      `runtime.accountOptions.products.${item.id}.title`,
                      item.title,
                    )}
                  </Text>
                  <Text
                    style={[
                      {
                        fontFamily: host.tokens.font,
                      },
                      parityStyles.item34,
                    ]}
                  >
                    {copy(
                      host,
                      `runtime.accountOptions.products.${item.id}.description`,
                      item.description,
                    )}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Page>
  );
}
const ACCOUNT_GEOMETRY = {
  width: 311,
  height: 197,
  gap: 16,
  gutter: 16,
  inactiveScale: 165 / 197,
  inactiveOpacity: 0.86,
  inactiveFilter: 'saturate(0.96) brightness(0.99)',
  paddingTop: 16,
  paddingBottom: 34,
};
const s = StyleSheet.create({
  flex: {
    flex: 1,
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  balance: {
    width: 311,
    height: 197,
    padding: 16,
    borderRadius: 6,
    gap: 16,
  },
  iban: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    height: 32,
  },
  copy: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceValues: {
    height: 80,
    gap: 8,
  },
  secondary: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  progress: {
    height: 4,
    width: 279,
    borderRadius: 2,
    overflow: 'hidden',
  },
  offer: {
    height: 119,
    borderRadius: 6,
    overflow: 'hidden',
  },
  offerShade: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,.45)',
  },
});
const parityStyles = StyleSheet.create({
  item0: {
    opacity: 1,
  },
  item1: {
    opacity: 0.95,
  },
  item2: {
    boxShadow: '0 16px 32px rgba(0,0,0,0.08), 0 3px 10px rgba(0,0,0,0.05)',
  },
  item3: {
    fontSize: 20,
    lineHeight: 22,
  },
  item4: {
    flex: 1,
    maxWidth: 235,
  },
  item5: {
    fontSize: 16,
    lineHeight: 20,
  },
  item6: {
    fontSize: 14,
    lineHeight: 15.5,
  },
  item7: {
    fontSize: 30,
    lineHeight: 30,
  },
  item8: {
    fontSize: 20,
  },
  item9: {
    height: 4,
    borderRadius: 2,
  },
  item10: {
    height: 1,
    width: 279,
  },
  item11: {
    padding: 0,
    paddingBottom: 32,
    gap: 0,
  },
  item12: {
    fontSize: 28,
    lineHeight: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  item13: {
    marginTop: -16,
  },
  item14: {
    padding: 0,
    paddingBottom: 40,
    gap: 0,
  },
  item15: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 28,
    lineHeight: 32,
  },
  item16: {
    paddingHorizontal: 24,
    paddingTop: 46,
  },
  item17: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  item18: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
  },
  item19: {
    flex: 1,
    gap: 2,
  },
  item20: {
    lineHeight: 20,
  },
  item21: {
    lineHeight: 15,
  },
  item22: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  item23: {
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  item24: {
    gap: 28,
  },
  item25: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  item26: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item27: {
    lineHeight: 18,
  },
  item28: {
    paddingTop: 28,
  },
  item29: {
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  item30: {
    paddingTop: 16,
    gap: 16,
  },
  item31: {
    boxShadow: '0 12px 22px rgba(0,0,0,.18)',
  },
  item32: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  item33: {
    fontSize: 26,
    lineHeight: 28,
    color: '#ffffff',
  },
  item34: {
    fontSize: 14,
    lineHeight: 17,
    color: '#ffffff',
    maxWidth: 250,
  },
});
const copyStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
