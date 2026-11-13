import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  getPaymentsMenuForCountry,
  getHeroSheetForRelease,
  type PaymentHeroId,
} from '@/app/config/paymentsMenuConfig';
import type { CurrentScreenProps } from '../../../contracts';
import { disabledBankingActions } from '../../../banking/model';
import { requiredPaymentShortcutAction } from '@/features/accounts-payments/paymentShortcutPolicy';
import { BaselineL1Header } from '../../../../../../universal/BaselineL1Header';
import {
  BaselineHeaderActionButton,
  BaselineHeaderActionRail,
} from '../../../../../../universal/BaselineHeaderActions';
import { BaselinePaymentHero } from '../../../../../../universal/BaselinePaymentHero';
import { BaselineSectionDivider } from '../../../../../../universal/BaselineSectionDivider';
import { BaselineBanner } from '../../../../../../universal/BaselineBanner';
import { PaymentIcon } from './Icon';
import { Text } from '../../../../../../universal/Typography';
import { sourceColor } from '../../../../../../universal/sourceColor';
import { RoBaselinePaymentTemplates } from './Templates';
import { RoBaselineExchangeRates } from './ExchangeRates';
import { PaymentsSheet } from './Sheet';
import { RO_SHEETS } from './roSheetOptions';
import { RoPayIcon } from './RoPayIcon';
import { RoPaymentOptionIcon } from './RoPaymentOptionIcon';
import { RoBillIcon } from './RoBillIcon';
import {
  createRecurrentPayment,
  getCreatedRecurrentPayments,
} from '@/data/paymentsHub';
import type { RecurrentPayment } from '@/data/paymentsHub';
import type {
  RoBaselineBillProvider,
  RoBaselinePaymentKind,
} from '@/features/accounts-payments/currentPaymentPolicy';
import {
  RoBaselineBillProviderPicker,
  RoBaselineDirectDebitList,
  RoBaselinePaymentFormFlow,
} from '../forms/RoBaselinePaymentFlow';

const otherIcons = {
  qr: 'payment-create-qr',
  templates: 'payment-templates',
  card: 'payment-card-repayment',
  standing: 'payment-recurrent',
  foreign: 'new-payment-foreign',
  exchange: 'payment-exchange-rates',
};
const actionIcons = {
  domestic: 'new-payment-domestic',
  foreign: 'new-payment-foreign',
  templates: 'payment-templates',
  qr: 'payment-scan-qr',
  slip: 'payment-create-qr',
  exchange: 'payment-exchange-rates',
};
export function RoBaselinePaymentsScreen(host: CurrentScreenProps) {
  const [view, setView] = useState(host.route.params?.view ?? 'overview');
  const [hero, setHero] = useState<PaymentHeroId | null>(null);
  const [activePayment, setActivePayment] =
    useState<RoBaselinePaymentKind | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<
    RoBaselineBillProvider | undefined
  >();
  const visibility = host.onPrimaryNavigationChange;
  useEffect(() => {
    visibility?.(view === 'overview');
    return () => visibility?.(true);
  }, [view, visibility]);
  const registerBack = host.onBackHandlerChange;
  useEffect(() => {
    // Full-screen child flows own nested chooser/step back handling.
    if (view === 'exchange-rates' || view === 'payment-form') return;
    registerBack?.(() => {
      if (hero) {
        setHero(null);
        return true;
      }
      if (view !== 'overview') {
        if (view === 'payment-form' && activePayment === 'direct-debit')
          setView('direct-debit-providers');
        else if (view === 'direct-debit-providers')
          setView('direct-debit-list');
        else setView('overview');
        return true;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [registerBack, view, hero, activePayment]);
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const menu = getPaymentsMenuForCountry(host.country);
  const disabled = disabledBankingActions(host);
  const t = host.t;
  const bosniaHeader = host.country === 'BA' || host.country === 'BA_BL';
  if (view === 'templates')
    return (
      <RoBaselinePaymentTemplates
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
    return (
      <RoBaselineExchangeRates host={host} onBack={() => setView('overview')} />
    );
  if (view === 'direct-debit-list')
    return (
      <RoBaselineDirectDebitList
        host={host}
        records={getCreatedRecurrentPayments('RO', 'direct-debit')}
        onBack={() => setView('overview')}
        onCreate={() => setView('direct-debit-providers')}
      />
    );
  if (view === 'direct-debit-providers')
    return (
      <RoBaselineBillProviderPicker
        host={host}
        onBack={() => setView('direct-debit-list')}
        onSelect={provider => {
          setSelectedProvider(provider);
          setActivePayment('direct-debit');
          setView('payment-form');
        }}
      />
    );
  if (view === 'payment-form' && activePayment)
    return (
      <RoBaselinePaymentFormFlow
        host={host}
        kind={activePayment}
        provider={selectedProvider}
        onBack={() =>
          setView(
            activePayment === 'direct-debit'
              ? 'direct-debit-providers'
              : 'overview',
          )
        }
        onComplete={(payment: RecurrentPayment | null) => {
          if (payment) createRecurrentPayment('RO', payment);
          setSelectedProvider(undefined);
          setActivePayment(null);
          setView('overview');
        }}
      />
    );
  const sheet = hero
    ? getHeroSheetForRelease(menu, host.country, hero, { baseline: true })
    : null;
  const roSheet = hero && host.country === 'RO' ? RO_SHEETS[hero] : undefined;
  return (
    <View style={[s.page, { backgroundColor: color('--uc-surface') }]}>
      <View
        style={[s.reserve, { height: Math.max(54, host.screenTopInset) }]}
      />
      <BaselineL1Header
        variant="payments"
        backgroundColor={color('--uc-surface')}
        title={t('runtime.payments.title', menu.title)}
        dark={dark}
        actions={
          <BaselineHeaderActionRail>
            <BaselineHeaderActionButton
              icon={bosniaHeader ? 'contact-phone' : 'profile'}
              label={
                bosniaHeader
                  ? 'Contact phone'
                  : t('runtime.actions.profile', 'Profile')
              }
              dark={dark}
              onPress={
                bosniaHeader
                  ? () => host.onNavigate({ screen: 'contacts' })
                  : host.onProfile
              }
            />
            <BaselineHeaderActionButton
              icon="messages"
              label={t('runtime.actions.messages', 'Messages')}
              dark={dark}
              onPress={() => host.onNavigate({ screen: 'messages' })}
            />
            {bosniaHeader ? null : (
              <BaselineHeaderActionButton
                icon="help"
                label={t('runtime.actions.help', 'Help')}
                dark={dark}
              />
            )}
          </BaselineHeaderActionRail>
        }
      />
      <ScrollView
        style={Platform.OS === 'web' ? s.webScroll : undefined}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={s.heroes}>
          {menu.primaryItems.map(item => {
            const key =
              item.translationKey === undefined ? item.id : item.translationKey;
            const localized = {
              ...item,
              title: key
                ? t(`runtime.payments.primaryItems.${key}.title`, item.title)
                : item.title,
              description: key
                ? t(
                    `runtime.payments.primaryItems.${key}.description`,
                    item.description,
                  )
                : item.description,
            };
            const action =
              item.id === 'between-accounts'
                ? 'payments.exchange.create'
                : item.id === 'manage-ebills'
                ? 'payments.ebills.manage'
                : item.id === 'recurrent-payments'
                ? 'payments.templates.manage'
                : 'payments.domestic.create';
            return (
              <View
                key={item.id}
                testID="duo-payment-tile"
                style={{ width: '100%' }}
              >
                <BaselinePaymentHero
                  item={localized}
                  imageVariant={item.imageVariant}
                  dark={dark}
                  disabled={disabled.has(action)}
                  onSelect={() => {
                    if (
                      host.country === 'RO' &&
                      item.id === 'between-accounts'
                    ) {
                      setActivePayment('currency-exchange');
                      setView('payment-form');
                      return;
                    }
                    setHero(item.id);
                  }}
                />
              </View>
            );
          })}
        </View>
        <View style={s.other}>
          <BaselineSectionDivider
            title={
              menu.otherTitleTranslationKey === null
                ? menu.otherTitle
                : t(
                    menu.otherTitleTranslationKey ?? 'runtime.payments.other',
                    menu.otherTitle,
                  )
            }
            dark={dark}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[
              s.shortcutScroll,
              Platform.OS === 'web' ? s.webScroll : undefined,
            ]}
            contentContainerStyle={s.shortcuts}
          >
            {menu.otherItems.map(item => {
              const requiredAction = requiredPaymentShortcutAction(item.id);
              const isDisabled = requiredAction !== null && disabled.has(requiredAction);
              const label =
                item.translationKey === null
                  ? item.label
                  : t(
                      `runtime.payments.otherItems.${
                        item.translationKey ?? item.id
                      }`,
                      item.label,
                    );
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={label.replace(/\n/g, ' ')}
                  accessibilityState={{ disabled: isDisabled }}
                  disabled={isDisabled}
                  style={[s.shortcut, isDisabled && { opacity: 0.45 }]}
                  onPress={() => {
                    if (isDisabled) return;
                    if (item.id === 'templates') setView('templates');
                    if (item.id === 'exchange-rates') setView('exchange-rates');
                    if (
                      host.country === 'RO' &&
                      item.id === 'foreign-payments'
                    ) {
                      setActivePayment('foreign-payment');
                      setView('payment-form');
                    }
                    if (host.country === 'RO' && item.id === 'standing-order') {
                      setActivePayment('standing-order');
                      setView('payment-form');
                    }
                  }}
                >
                  <View
                    style={[
                      s.bubble,
                      { backgroundColor: color('--uc-action') },
                    ]}
                  >
                    <PaymentIcon
                      name={otherIcons[item.icon]}
                      color={color('--uc-text-inverse')}
                    />
                  </View>
                  <Text
                    numberOfLines={2}
                    style={[s.shortcutText, { color: color('--uc-text') }]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
      {hero && sheet ? (
        <PaymentsSheet
          title={
            roSheet?.title ??
            t(`runtime.payments.heroSheets.${hero}.title`, sheet.title)
          }
          onClose={() => setHero(null)}
          dark={dark}
        >
          <View style={s.sheetBody}>
            {(roSheet?.actions ?? sheet.actions).map(action => {
              const title = roSheet
                ? action.title
                : t(
                    `runtime.payments.heroSheets.${hero}.actions.${action.id}.title`,
                    t(
                      `runtime.payments.newPayment.actions.${action.id}.title`,
                      action.title,
                    ),
                  );
              const description = roSheet
                ? action.description
                : t(
                    `runtime.payments.heroSheets.${hero}.actions.${action.id}.description`,
                    t(
                      `runtime.payments.newPayment.actions.${action.id}.description`,
                      action.description,
                    ),
                  );
              return (
                <Pressable
                  key={action.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${title} ${description}`}
                  style={s.action}
                  onPress={() => {
                    if (action.id === 'domestic-payment') {
                      setHero(null);
                      host.onNavigate({ screen: 'payment-create' });
                    }
                    if (roSheet && action.id === 'templates-beneficiaries') {
                      setHero(null);
                      setView('templates');
                    }
                    if (
                      host.country === 'RO' &&
                      action.id === 'foreign-payment'
                    ) {
                      setHero(null);
                      setActivePayment('foreign-payment');
                      setView('payment-form');
                    }
                    if (
                      host.country === 'RO' &&
                      action.id === 'treasury-payment'
                    ) {
                      setHero(null);
                      setActivePayment('treasury-payment');
                      setView('payment-form');
                    }
                    if (
                      host.country === 'RO' &&
                      action.id === 'own-account-transfer'
                    ) {
                      setHero(null);
                      setActivePayment('own-account-transfer');
                      setView('payment-form');
                    }
                    if (host.country === 'RO' && action.id === 'direct-debit') {
                      setHero(null);
                      setView('direct-debit-list');
                    }
                  }}
                >
                  <View style={s.actionIcon}>
                    {roSheet &&
                    (action.id === 'new-bill' ||
                      action.id === 'direct-debit' ||
                      action.id === 'scan-paycode') ? (
                      <RoBillIcon
                        kind={action.id}
                        color={
                          action.id === 'new-bill' && !dark
                            ? '#000000'
                            : color('--uc-icon')
                        }
                      />
                    ) : roSheet &&
                      (action.id === 'treasury-payment' ||
                        action.id === 'own-account-transfer') ? (
                      <RoPaymentOptionIcon
                        kind={
                          action.id === 'treasury-payment'
                            ? 'treasury'
                            : 'own-accounts'
                        }
                        color={color('--uc-icon')}
                      />
                    ) : action.icon === 'ropay' ? (
                      <RoPayIcon color={color('--uc-icon')} />
                    ) : (
                      <PaymentIcon
                        name={actionIcons[action.icon]}
                        color={color('--uc-icon')}
                      />
                    )}
                  </View>
                  <View style={s.actionCopy}>
                    <Text
                      style={[s.actionTitle, { color: color('--uc-text') }]}
                    >
                      {title}
                    </Text>
                    <Text
                      style={[
                        s.actionDescription,
                        { color: color('--uc-text') },
                      ]}
                    >
                      {description}
                    </Text>
                  </View>
                  <View style={s.actionIcon}>
                    <PaymentIcon
                      name="chevron-link"
                      color={color('--uc-icon')}
                    />
                  </View>
                </Pressable>
              );
            })}
            {!roSheet && (
              <View style={s.banner}>
                <BaselineBanner
                  variant="payment-discover"
                  dark={dark}
                  title={t(
                    `runtime.payments.heroSheets.${hero}.infoBanner.title`,
                    sheet.infoBanner.translationKey === null
                      ? sheet.infoBanner.title
                      : t(
                          'runtime.payments.newPayment.infoBanner.title',
                          sheet.infoBanner.title,
                        ),
                  )}
                  description={t(
                    `runtime.payments.heroSheets.${hero}.infoBanner.description`,
                    sheet.infoBanner.translationKey === null
                      ? sheet.infoBanner.description
                      : t(
                          'runtime.payments.newPayment.infoBanner.description',
                          sheet.infoBanner.description,
                        ),
                  )}
                />
              </View>
            )}
          </View>
        </PaymentsSheet>
      ) : null}
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1 },
  reserve: { height: 54 },
  webScroll: { transform: 'none' },
  scroll: { paddingBottom: 96 },
  heroes: { paddingHorizontal: 20, paddingTop: 8, gap: 13 },
  artwork: { position: 'absolute' },
  other: { paddingHorizontal: 20, paddingTop: 16 },
  shortcutScroll: { paddingTop: 8 },
  shortcuts: { gap: 12, paddingRight: 20 },
  shortcut: { width: 74, alignItems: 'center', gap: 10, borderRadius: 8 },
  bubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutText: {
    width: '100%',
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    textAlign: 'center',
  },
  sheetBody: { width: '100%' },
  action: { height: 80, flexDirection: 'row', alignItems: 'center', gap: 16 },
  actionIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: { flex: 1, minWidth: 0 },
  actionTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    letterSpacing: 0.3,
  },
  actionDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    marginTop: 2,
  },
  banner: { marginTop: 24 },
});
