import React, { useEffect, useId, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import {
  getHeroSheetForRelease,
  getPaymentsMenuForCountry,
  type PaymentHeroId,
} from '@/app/config/paymentsMenuConfig';
import {
  createEmptyDomesticPaymentDraft,
  createRedoDomesticPaymentDraft,
  formatDraftAmount,
  type DomesticPaymentDraft,
} from '@/data/paymentFlow';
import {
  getPaymentTemplates,
  getSavedBeneficiaries,
  type PaymentTemplateSelection,
} from '@/data/paymentTemplates';
import {
  getCzechPaymentBankName,
  isValidCzechBankCode,
  isValidCzechMainAccountNumber,
  isValidCzechPrefix,
} from '@/data/czechDomesticAccount';
import {
  EXCHANGE_CURRENCIES,
  EXCHANGE_RATE_DATE,
  getCountryCurrency,
  getExchangeRateRows,
} from '@/data/exchangeRates';
import type { Currency } from '@/data/products';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { Authorization } from '../profile/Authorization';
import { ActionButton } from '../../../../universal/ActionButton';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { FormField } from '../../../../universal/FormField';
import { Select } from '../../../../universal/Select';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { MainNavigationHeader } from '../../../../universal/MainNavigationHeader';
import { sourceColor } from '../../../../universal/sourceColor';
import { Text } from '../../../../universal/Typography';
import { Heading } from '../Primitives';
import { BankingPage as Page } from './Primitives';
import type { CurrentScreenProps } from '../contracts';
import {
  bankingProducts,
  disabledBankingActions,
  copy,
  paymentDraftValid,
  paymentTemplateDraft,
  productTransactions,
} from './model';
import {
  Amount,
  Fact,
  Footer,
  Label,
  Row,
  Search,
  Section,
  Toggle,
} from './Primitives';
import { BaselinePaymentImage } from '../../../../universal/BaselinePaymentImage';
const otherIcons = {
  qr: 'payment-create-qr',
  templates: 'payment-templates',
  card: 'payment-card-repayment',
  standing: 'payment-templates',
  foreign: 'payment-exchange-rates',
  exchange: 'payment-exchange-rates',
};
const sheetIcons = {
  domestic: 'domestic-payment',
  foreign: 'foreign-payment',
  templates: 'templates-beneficiaries',
  qr: 'qr-code',
  slip: 'payment-slip',
  exchange: 'currency-exchange',
};
function Templates({
  host,
  onBack,
  onSelect,
}: {
  host: CurrentScreenProps;
  onBack: () => void;
  onSelect: (selection: PaymentTemplateSelection) => void;
}) {
  const [query, setQuery] = useState('');
  const matches = (item: PaymentTemplateSelection) =>
    [item.title, item.beneficiaryName, item.accountNumber].some(value =>
      value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
    );
  const templates = getPaymentTemplates(host.country).filter(matches);
  const beneficiaries = getSavedBeneficiaries(host.country, false).filter(
    matches,
  );
  return (
    <Page
      host={{
        ...host,
        onBack,
      }}
      title={copy(host, 'runtime.payments.templates.title', 'Templates')}
    >
      <Heading host={host}>
        {copy(host, 'runtime.payments.templates.title', 'Templates')}
      </Heading>
      <Search host={host} value={query} onChange={setQuery} />
      {templates.length ? (
        <Section
          host={host}
          title={copy(
            host,
            'runtime.payments.templates.selectTemplate',
            'SELECT A TEMPLATE',
          )}
        />
      ) : null}
      {templates.map(item => (
        <Row
          key={item.id}
          host={host}
          title={item.title}
          subtitle={`${copy(
            host,
            'runtime.payments.templates.forBeneficiary',
            'for',
          )} ${item.beneficiaryName}`}
          icon="templates-beneficiaries"
          trailing={
            <Amount
              host={host}
              value={Number(item.amount.replace(',', '.'))}
              currency={item.currency}
              size={16}
            />
          }
          onPress={() => onSelect(item)}
        />
      ))}
      {beneficiaries.length ? (
        <Section
          host={host}
          title={copy(
            host,
            'runtime.payments.templates.chooseBeneficiary',
            'OR CHOOSE A BENEFICIARY',
          )}
        />
      ) : null}
      {beneficiaries.map(item => (
        <Row
          key={item.id}
          host={host}
          title={item.title}
          subtitle={item.accountNumber}
          icon="templates-beneficiaries"
          onPress={() => onSelect(item)}
        />
      ))}
      {templates.length + beneficiaries.length === 0 ? (
        <Label host={host} muted>
          {copy(
            host,
            'runtime.payments.templates.noResults',
            'No templates or beneficiaries found',
          )}
        </Label>
      ) : null}
    </Page>
  );
}
function ExchangeRates({
  host,
  onBack,
}: {
  host: CurrentScreenProps;
  onBack: () => void;
}) {
  const [value, setValue] = useState('1.00');
  const [currency, setCurrency] = useState<Currency>(
    getCountryCurrency(host.country),
  );
  const parsed = Number(value.trim().replace(/\s/g, '').replace(',', '.'));
  const amount = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  return (
    <Page
      host={{
        ...host,
        onBack,
      }}
      title={copy(
        host,
        'runtime.payments.exchangeRates.title',
        'Exchange rates',
      )}
    >
      <Heading host={host}>
        {copy(host, 'runtime.payments.exchangeRates.title', 'Exchange rates')}
      </Heading>
      <Label host={host} muted>
        {copy(
          host,
          'runtime.payments.exchangeRates.lastUpdated',
          'Last updated on',
        )}{' '}
        {EXCHANGE_RATE_DATE}
      </Label>
      <Section
        host={host}
        title={copy(
          host,
          'runtime.payments.exchangeRates.chooseCurrencyAndAmount',
          'CHOOSE CURRENCY AND AMOUNT',
        )}
      />
      <FormField
        tokens={host.tokens}
        label={copy(host, 'runtime.payments.exchangeRates.amount', 'Amount')}
        value={value}
        onChange={setValue}
        inputProps={{
          keyboardType: 'decimal-pad',
        }}
      />
      <Select
        tokens={host.tokens}
        label={copy(
          host,
          'runtime.payments.exchangeRates.chooseCurrency',
          'Choose currency',
        )}
        value={currency}
        items={EXCHANGE_CURRENCIES.map(code => ({
          value: code,
          label: code,
        }))}
        onChange={setCurrency}
      />
      <Section
        host={host}
        title={copy(
          host,
          'runtime.payments.exchangeRates.exchangeRates',
          'Exchange rates',
        )}
      />
      {getExchangeRateRows(amount, currency).map(row => (
        <Fact
          key={row.currency}
          host={host}
          label={`1 ${row.currency} = ${row.unitRate.toFixed(4)} ${currency}`}
          value={
            <Amount
              host={host}
              value={row.convertedAmount}
              currency={row.currency}
              size={20}
            />
          }
        />
      ))}
    </Page>
  );
}
export function PaymentsScreen(host: CurrentScreenProps) {
  const heroGradientId = useId().replace(/:/g, '');
  const [heroWidth, setHeroWidth] = useState(335);
  const gradientAngle = (105 * Math.PI) / 180,
    dx = Math.sin(gradientAngle),
    dy = -Math.cos(gradientAngle),
    gradientLength = Math.abs(heroWidth * dx) + Math.abs(120 * dy);
  const [view, setView] = useState<'overview' | 'templates' | 'exchange-rates'>(
    host.route.params?.view === 'templates'
      ? 'templates'
      : host.route.params?.view === 'exchange-rates'
      ? 'exchange-rates'
      : 'overview',
  );
  const [hero, setHero] = useState<PaymentHeroId | null>(null);
  const onPrimaryNavigationChange = host.onPrimaryNavigationChange;
  useEffect(() => {
    onPrimaryNavigationChange?.(view === 'overview');
    return () => onPrimaryNavigationChange?.(true);
  }, [view, onPrimaryNavigationChange]);
  const menu = getPaymentsMenuForCountry(host.country);
  const disabledActions = disabledBankingActions(host);
  const sheet = hero
    ? getHeroSheetForRelease(menu, host.country, hero, {
        baseline: host.release !== 'release-future-evo-2027',
      })
    : null;
  if (view === 'templates')
    return (
      <Templates
        host={host}
        onBack={() => setView('overview')}
        onSelect={selection =>
          host.onNavigate({
            screen: 'payment-create',
            params: {
              selectionId: selection.id,
              selectionKind: selection.kind,
            },
          })
        }
      />
    );
  if (view === 'exchange-rates')
    return <ExchangeRates host={host} onBack={() => setView('overview')} />;
  const title = copy(host, 'runtime.payments.title', menu.title);
  return (
    <View
      style={[
        parityStyles.item0,
        {
          backgroundColor: host.tokens.background,
        },
        parityStyles.item1,
      ]}
    >
      <View style={parityStyles.item2}>
        <MainNavigationHeader
          tokens={host.tokens}
          brand={
            <Text
              style={[
                {
                  fontFamily: host.tokens.strongFont,
                },
                parityStyles.item3,
                {
                  color: host.tokens.text,
                },
              ]}
            >
              {title}
            </Text>
          }
          items={[]}
          value="payments"
          onChange={() => {}}
          label="Payments"
          actionsRowHeight={32}
          actionsPaddingHorizontal={20}
          actionsAlignItems="flex-start"
          actions={
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  host.country === 'BA' || host.country === 'BA_BL'
                    ? 'Contact phone'
                    : 'Profile'
                }
                onPress={
                  host.country === 'BA' || host.country === 'BA_BL'
                    ? () =>
                        host.onNavigate({
                          screen: 'contacts',
                        })
                    : undefined
                }
                style={s.headerAction}
              >
                <SourceCustomIcon
                  name={
                    host.country === 'BA' || host.country === 'BA_BL'
                      ? 'contact-phone'
                      : 'header-profile'
                  }
                  size={24}
                  color={host.tokens.text}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Messages"
                onPress={() =>
                  host.onNavigate({
                    screen: 'messages',
                  })
                }
                style={s.headerAction}
              >
                <SourceCustomIcon
                  name="messages"
                  size={24}
                  color={host.tokens.text}
                />
              </Pressable>
              {host.country !== 'BA' && host.country !== 'BA_BL' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Help"
                  style={s.headerAction}
                >
                  <SourceCustomIcon
                    name="help-circle"
                    size={24}
                    color={host.tokens.text}
                  />
                </Pressable>
              ) : null}
            </>
          }
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={parityStyles.item4}
      >
        <View style={parityStyles.item5}>
          {menu.primaryItems.map(item => {
            const disabled = disabledActions.has(
              item.id === 'between-accounts'
                ? 'payments.exchange.create'
                : item.id === 'manage-ebills'
                ? 'payments.ebills.manage'
                : item.id === 'recurrent-payments'
                ? 'payments.templates.manage'
                : 'payments.domestic.create',
            );
            const translationKey =
              item.translationKey === undefined ? item.id : item.translationKey;
            const label = translationKey
              ? copy(
                  host,
                  `runtime.payments.primaryItems.${translationKey}.title`,
                  item.title,
                )
              : item.title;
            const description = translationKey
              ? copy(
                  host,
                  `runtime.payments.primaryItems.${translationKey}.description`,
                  item.description,
                )
              : item.description;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={label}
                disabled={disabled}
                onLayout={event => setHeroWidth(event.nativeEvent.layout.width)}
                onPress={() => setHero(item.id)}
                style={[
                  s.hero,
                  [
                    {
                      backgroundColor: host.tokens.background,
                    },
                    disabled ? parityStyles.item6 : parityStyles.item7,
                  ],
                ]}
              >
                <Svg width="100%" height="100%" style={s.fill}>
                  <Defs>
                    <LinearGradient
                      id={heroGradientId}
                      gradientUnits="userSpaceOnUse"
                      x1={heroWidth / 2 - (dx * gradientLength) / 2}
                      y1={60 - (dy * gradientLength) / 2}
                      x2={heroWidth / 2 + (dx * gradientLength) / 2}
                      y2={60 + (dy * gradientLength) / 2}
                    >
                      <Stop
                        offset="0"
                        stopColor={sourceColor(
                          'var(--uc-surface-muted)',
                          host.mode === 'dark',
                        )}
                      />
                      <Stop
                        offset={0.48}
                        stopColor={sourceColor(
                          'var(--uc-neutral-200)',
                          host.mode === 'dark',
                        )}
                      />
                      <Stop
                        offset="1"
                        stopColor={sourceColor(
                          'var(--uc-neutral-300)',
                          host.mode === 'dark',
                        )}
                      />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    width="100%"
                    height="100%"
                    fill={`url(#${heroGradientId})`}
                  />
                </Svg>
                <View
                  style={[
                    s.heroCopy,
                    label.includes('\n')
                      ? parityStyles.item8
                      : parityStyles.item9,
                  ]}
                >
                  <Label
                    host={host}
                    strong
                    size={24}
                    style={
                      label.includes('\n')
                        ? parityStyles.item10
                        : parityStyles.item11
                    }
                  >
                    {label}
                  </Label>
                  <Label host={host} size={14}>
                    {description}
                  </Label>
                </View>
                {item.imageVariant ? (
                  <View style={s.heroArt}>
                    <BaselinePaymentImage
                      preset={item.imageVariant}
                      alignment="center"
                    />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        <View style={parityStyles.item12}>
          <Section
            host={host}
            title={
              menu.otherTitleTranslationKey === null
                ? menu.otherTitle
                : copy(
                    host,
                    menu.otherTitleTranslationKey ?? 'runtime.payments.other',
                    menu.otherTitle,
                  )
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.shortcuts}
          >
            {menu.otherItems.map(item => {
              const label =
                item.translationKey === null
                  ? item.label
                  : copy(
                      host,
                      `runtime.payments.otherItems.${
                        item.translationKey ?? item.id
                      }`,
                      item.label,
                    );
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  onPress={() => {
                    if (item.id === 'templates') setView('templates');
                    if (item.id === 'exchange-rates') setView('exchange-rates');
                  }}
                  style={s.shortcut}
                >
                  <View
                    style={[
                      parityStyles.item13,
                      {
                        backgroundColor: host.tokens.accent,
                      },
                      parityStyles.item14,
                    ]}
                  >
                    <SourceCustomIcon
                      name={otherIcons[item.icon]}
                      size={24}
                      color={host.tokens.inverse}
                    />
                  </View>
                  <Label
                    host={host}
                    strong
                    size={14}
                    style={parityStyles.item15}
                  >
                    {label}
                  </Label>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
      <ModalPanel
        tokens={host.tokens}
        title={
          hero && sheet
            ? copy(
                host,
                `runtime.payments.heroSheets.${hero}.title`,
                sheet.title,
              )
            : ''
        }
        visible={!!sheet}
        onClose={() => setHero(null)}
      >
        <ScrollView style={s.sheetScroll}>
          {sheet?.actions.map(action => (
            <Row
              key={action.id}
              host={host}
              title={copy(
                host,
                `runtime.payments.heroSheets.${hero}.actions.${action.id}.title`,
                copy(
                  host,
                  `runtime.payments.newPayment.actions.${action.id}.title`,
                  action.title,
                ),
              )}
              subtitle={copy(
                host,
                `runtime.payments.heroSheets.${hero}.actions.${action.id}.description`,
                copy(
                  host,
                  `runtime.payments.newPayment.actions.${action.id}.description`,
                  action.description,
                ),
              )}
              icon={sheetIcons[action.icon]}
              onPress={
                action.id === 'domestic-payment'
                  ? () => {
                      setHero(null);
                      host.onNavigate({
                        screen: 'payment-create',
                      });
                    }
                  : undefined
              }
            />
          ))}
          {sheet ? (
            <View
              style={[
                s.infoBanner,
                {
                  backgroundColor: host.tokens.surface,
                },
              ]}
            >
              <Label host={host} strong>
                {copy(
                  host,
                  `runtime.payments.heroSheets.${hero}.infoBanner.title`,
                  sheet.infoBanner.title,
                )}
              </Label>
              <Label host={host} size={14}>
                {copy(
                  host,
                  `runtime.payments.heroSheets.${hero}.infoBanner.description`,
                  sheet.infoBanner.description,
                )}
              </Label>
            </View>
          ) : null}
        </ScrollView>
      </ModalPanel>
    </View>
  );
}
function initialDraft(host: CurrentScreenProps): DomesticPaymentDraft {
  const data = bankingProducts(host);
  const accountId =
    host.route.params?.productId ?? host.route.params?.accountId;
  const product =
    data.products.find(item => item.id === accountId) ??
    data.currentAccounts[0];
  const transactionId = host.route.params?.transactionId;
  const transaction =
    product && transactionId
      ? productTransactions(host, product).find(
          item => item.id === transactionId,
        )
      : null;
  if (transaction)
    return createRedoDomesticPaymentDraft(transaction, host.country, product);
  const selectionId = host.route.params?.selectionId;
  const selection = selectionId
    ? [
        ...getPaymentTemplates(host.country),
        ...getSavedBeneficiaries(host.country, false),
      ].find(item => item.id === selectionId)
    : null;
  return selection
    ? paymentTemplateDraft(selection, host.country, host.release, product)
    : createEmptyDomesticPaymentDraft(host.country, product);
}
export function PaymentCreateScreen(host: CurrentScreenProps) {
  const [draft, setDraft] = useState(() => initialDraft(host));
  const [step, setStep] = useState<'create' | 'review' | 'sign' | 'success'>(
    'create',
  );
  const [picker, setPicker] = useState(false);
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [touched, setTouched] = useState({
    prefix: false,
    accountNumber: false,
    bankCode: false,
  });
  const cz = host.country === 'CZ' && host.release === 'release-current';
  const update = <K extends keyof DomesticPaymentDraft>(
    key: K,
    value: DomesticPaymentDraft[K],
  ) =>
    setDraft(current => ({
      ...current,
      [key]: value,
    }));
  const selectTemplate = (selection: PaymentTemplateSelection) => {
    const selected = paymentTemplateDraft(
      selection,
      host.country,
      host.release,
    );
    setDraft(current => ({
      ...current,
      beneficiaryName: selected.beneficiaryName,
      prefix: selected.prefix,
      accountNumber: selected.accountNumber,
      bankCode: selected.bankCode,
      bankName: selected.bankName,
      recipientKind: selected.recipientKind,
      currency: selected.currency,
      ...(selection.kind === 'template'
        ? {
            amount: selected.amount,
            informationForBeneficiary: selected.informationForBeneficiary,
          }
        : {}),
    }));
    setPicker(false);
  };
  if (picker)
    return (
      <Templates
        host={host}
        onBack={() => setPicker(false)}
        onSelect={selectTemplate}
      />
    );
  const back = () =>
    step === 'create'
      ? host.onBack()
      : setStep(
          step === 'review' ? 'create' : step === 'sign' ? 'review' : 'create',
        );
  const pageHost = {
    ...host,
    onBack: back,
  };
  const flowCopy = (key: string, fallback: string) =>
    copy(host, `runtime.payments.domesticFlow.${key}`, fallback);
  const formattedAmount =
    maskFormattedAmount(
      formatDraftAmount(draft).replace(` ${draft.currency}`, ''),
      host.amountsHidden,
    ) + ` ${draft.currency}`;
  const field = (
    key: keyof DomesticPaymentDraft,
    label: string,
    numeric = false,
  ) => (
    <FormField
      tokens={host.tokens}
      label={label}
      value={String(draft[key])}
      onChange={value => update(key, value)}
      inputProps={
        numeric
          ? {
              keyboardType: 'decimal-pad',
            }
          : undefined
      }
    />
  );
  const czField = (
    key: 'prefix' | 'accountNumber' | 'bankCode',
    label: string,
  ) => (
    <FormField
      tokens={host.tokens}
      label={label}
      value={draft[key]}
      onChange={value => {
        const clean = value
          .replace(/\D/g, '')
          .slice(0, key === 'prefix' ? 6 : key === 'accountNumber' ? 10 : 4);
        setDraft(current => ({
          ...current,
          [key]: clean,
          ...(key === 'bankCode'
            ? {
                bankName: getCzechPaymentBankName(clean) ?? '',
              }
            : {}),
        }));
      }}
      inputProps={{
        keyboardType: 'number-pad',
        onBlur: () =>
          setTouched(current => ({
            ...current,
            [key]: true,
          })),
      }}
      error={
        touched[key] &&
        !(key === 'prefix'
          ? isValidCzechPrefix(draft.prefix)
          : key === 'accountNumber'
          ? isValidCzechMainAccountNumber(draft.accountNumber)
          : isValidCzechBankCode(draft.bankCode))
          ? `Invalid ${label.toLowerCase()}`
          : undefined
      }
    />
  );
  const actionLabel = copy(
    host,
    step === 'create'
      ? 'runtime.actions.next'
      : step === 'success'
      ? 'runtime.actions.okGotIt'
      : 'runtime.actions.sign',
    step === 'create' ? 'Next' : step === 'success' ? 'Ok, got it' : 'Sign',
  );
  const submit = () => {
    if (step === 'create') {
      if (paymentDraftValid(host.country, host.release, draft))
        setStep('review');
    } else if (step === 'review') setStep('sign');
    else if (step === 'success')
      host.onNavigate({
        screen: 'payments',
      });
  };
  const title =
    step === 'review'
      ? flowCopy('reviewData', 'Review data')
      : step === 'sign'
      ? copy(host, 'runtime.actions.sign', 'Sign')
      : step === 'success'
      ? flowCopy('successfulPayment', 'Successful payment')
      : flowCopy('domesticPaymentTitle', 'Domestic payment');
  if (step === 'sign')
    return (
      <Authorization
        host={host}
        title={title}
        onBack={() => setStep('review')}
        onDone={() => setStep('success')}
        actionLabel={copy(host, 'runtime.actions.sign', 'Sign')}
      />
    );
  return (
    <Page
      host={pageHost}
      title={title}
      trailing={<View />}
      footer={
        <Footer host={host}>
          <ActionButton
            tokens={host.tokens}
            label={actionLabel}
            disabled={
              step === 'create' &&
              !paymentDraftValid(host.country, host.release, draft)
            }
            onPress={submit}
          />
        </Footer>
      }
    >
      {step === 'create' ? (
        <View>
          <Heading host={host}>
            {cz ? flowCopy('newBeneficiary', 'New beneficiary') : title}
          </Heading>
          <Section
            host={host}
            title={flowCopy('fromAccount', 'FROM ACCOUNT')}
          />
          {field(
            'payerAccountNumber',
            flowCopy('payerAccountNumber', 'Payer account number'),
          )}
          <Label host={host} size={14} muted>
            {draft.payerAccountName}
          </Label>
          <Label host={host} size={14} muted>
            {maskFormattedAmount(draft.payerBalance, host.amountsHidden)}
          </Label>
          <Section
            host={host}
            title={flowCopy(
              cz ? 'toBeneficiary' : 'beneficiary',
              cz ? 'TO BENEFICIARY' : 'BENEFICIARY',
            )}
          />
          {field(
            'beneficiaryName',
            copy(
              host,
              'runtime.transactionDetail.beneficiaryName',
              'Beneficiary',
            ),
          )}
          {cz ? (
            <ActionButton
              tokens={host.tokens}
              secondary
              label={copy(
                host,
                'runtime.payments.templates.open',
                'Choose beneficiary or template',
              )}
              onPress={() => setPicker(true)}
            />
          ) : null}
          {cz
            ? czField('prefix', flowCopy('prefix', 'Prefix'))
            : field('prefix', flowCopy('prefix', 'Prefix'))}
          {cz
            ? czField(
                'accountNumber',
                copy(
                  host,
                  'runtime.accounts.detailsInfo.accountNumber',
                  'Account number',
                ),
              )
            : field(
                'accountNumber',
                copy(
                  host,
                  'runtime.accounts.detailsInfo.accountNumber',
                  'Account number',
                ),
              )}
          {cz
            ? czField('bankCode', flowCopy('bankCode', 'Bank code'))
            : field('bankCode', flowCopy('bankCode', 'Bank code'))}
          {draft.bankName ? (
            <Label host={host} muted size={14}>
              {draft.bankName}
            </Label>
          ) : null}
          <Section
            host={host}
            title={flowCopy('paymentDetails', 'PAYMENT DETAILS')}
          />
          {field(
            'amount',
            copy(host, 'runtime.transactionDetail.amount', 'Amount'),
            true,
          )}
          <Label host={host} strong size={20}>
            {draft.currency}
          </Label>
          <Toggle
            host={host}
            label={flowCopy('instantPayment', 'Instant Payment')}
            value={draft.instantPayment}
            onChange={value => update('instantPayment', value)}
          />
          {field('dueDate', flowCopy('dueDate', 'Due date'))}
          <Toggle
            host={host}
            label={flowCopy(
              'expressPayment',
              'Express Payment (a fee is charged)',
            )}
            value={draft.expressPayment}
            onChange={value => update('expressPayment', value)}
          />
          {field(
            'informationForBeneficiary',
            flowCopy(
              'informationForBeneficiary',
              'Information for beneficiary',
            ),
          )}
          {field(
            'informationForMe',
            flowCopy('informationForMe', 'Information for me'),
          )}
          <Label host={host} size={14} muted>
            {flowCopy(
              'reviewAndSignHint',
              'You can review and sign your payment in the next step',
            )}
          </Label>
        </View>
      ) : null}
      {step === 'review' ? (
        <View>
          <Heading host={host}>{title}</Heading>
          <Section
            host={host}
            title={flowCopy('paymentOrder', 'PAYMENT ORDER')}
          />
          {[
            [flowCopy('payerAccount', 'Payer account'), draft.payerAccountName],
            [
              flowCopy('payerAccountNumber', 'Payer account number'),
              draft.payerAccountNumber,
            ],
            [
              copy(
                host,
                'runtime.transactionDetail.beneficiaryName',
                'Beneficiary name',
              ),
              draft.beneficiaryName,
            ],
            [
              copy(
                host,
                'runtime.transactionDetail.beneficiaryAccountNumber',
                'Beneficiary account number',
              ),
              [draft.prefix, draft.accountNumber, draft.bankCode]
                .filter(Boolean)
                .join('-'),
            ],
            [
              copy(host, 'runtime.transactionDetail.amount', 'Amount'),
              formattedAmount,
            ],
            [
              flowCopy('instantPayment', 'Instant Payment'),
              copy(
                host,
                draft.instantPayment
                  ? 'runtime.common.yes'
                  : 'runtime.common.no',
                draft.instantPayment ? 'Yes' : 'No',
              ),
            ],
            [flowCopy('dueDate', 'Due date'), draft.dueDate],
            [
              flowCopy('expressPayment', 'Express Payment (a fee is charged)'),
              copy(
                host,
                draft.expressPayment
                  ? 'runtime.common.yes'
                  : 'runtime.common.no',
                draft.expressPayment ? 'Yes' : 'No',
              ),
            ],
            [
              flowCopy(
                'informationForBeneficiary',
                'Information for beneficiary',
              ),
              draft.informationForBeneficiary || '-',
            ],
          ].map(([label, value], index) => (
            <Fact key={index} host={host} label={label!} value={value} />
          ))}
          <Toggle
            host={host}
            label={flowCopy('saveAsTemplate', 'SAVE AS TEMPLATE')}
            value={saveTemplate}
            onChange={setSaveTemplate}
          />
        </View>
      ) : null}
      {step === 'success' ? (
        <View style={s.success}>
          <SourceCustomIcon name="check-circle" size={72} color="#89a525" />
          <Heading host={host}>{title}</Heading>
          <Label host={host}>
            {flowCopy(
              'paymentSentToBank',
              'Your payment has been successfully sent to the bank',
            )}
          </Label>
        </View>
      ) : null}
    </Page>
  );
}
const s = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(38,38,38,.08)',
  },
  heroCopy: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
    zIndex: 1,
  },
  heroArt: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 137,
    height: 120,
  },
  shortcuts: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    paddingRight: 20,
  },
  shortcut: {
    width: 74,
    alignItems: 'center',
    gap: 10,
  },
  sheetScroll: {
    maxHeight: 460,
  },
  infoBanner: {
    marginTop: 24,
    padding: 20,
    gap: 8,
    borderRadius: 8,
  },
  success: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 24,
  },
});

const parityStyles = StyleSheet.create({
  item0: {
    flex: 1,
  },
  item1: {
    paddingTop: 54,
  },
  item2: {
    paddingBottom: 20,
  },
  item3: {
    fontSize: 28,
    lineHeight: 32,
  },
  item4: {
    paddingBottom: 96,
  },
  item5: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 13,
  },
  item6: {
    opacity: 0.55,
  },
  item7: {
    opacity: 1,
  },
  item8: {
    gap: 8,
  },
  item9: {
    gap: 16,
  },
  item10: {
    lineHeight: 26,
  },
  item11: {
    lineHeight: 27,
  },
  item12: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  item13: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  item14: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  item15: {
    textAlign: 'center',
    lineHeight: 15.5,
  },
});
