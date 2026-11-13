import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  OFFER_ACCOUNTS,
  OFFER_COPY,
  employerHasOnboardingConvention,
  type OnboardingOffer as Offer,
} from '@/features/ro-onboarding/offers';
import { BaselineCardArt } from '../../../../../universal/BaselineCardArt';
import { BaselineCheckbox } from '../../../../../universal/BaselineCheckbox';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { OnboardingSectionDivider as BaselineSectionDivider } from './OnboardingSectionDivider';
import cardsIcon from '@/assets/pi/ro/onboarding/offer-cards.svg';
import mobileIcon from '@/assets/pi/ro/onboarding/offer-mobile.svg';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import catalog from '@/assets/pi/ro/onboarding/product-catalog.svg';
import primeIcon from '@/assets/pi/ro/onboarding/prime.svg';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';

export function OnboardingOffer({
  offer,
  employer,
  checks,
  onOffer,
  onEmployer,
  toggle,
  onDocument,
  sourceVariant = 'onboarding',
}: {
  offer: Offer;
  employer: string;
  checks: Record<string, boolean>;
  onOffer: (offer: Offer) => void;
  onEmployer: () => void;
  toggle: (key: string) => void;
  onDocument: (title: string) => void;
  sourceVariant?: 'onboarding' | 'cash-loan';
}) {
  const data = OFFER_COPY[offer];
  const tabs: Offer[] = [
    'optim',
    'star',
    offer === 'premium' ? 'premium' : 'prime',
  ];
  const row = (icon: React.ReactNode, title: string, description: string) => (
    <View style={s.row}>
      {icon}
      <View style={s.grow}>
        <Text style={s.label}>{title}</Text>
        <Text style={s.small}>{description}</Text>
      </View>
    </View>
  );
  return (
    <View style={s.content}>
      {!!employer && (
        <View style={s.employer}>
          <View style={s.employerTop}>
            <Text style={[s.body, { flex: 1 }]} numberOfLines={2}>
              {employer}
            </Text>
            {employerHasOnboardingConvention(employer) && (
              <Text style={s.badge}>✓ CONVENTIE</Text>
            )}
          </View>
          <Pressable accessibilityRole="button" onPress={onEmployer}>
            <Text style={s.link}>EDIT COMPANY</Text>
          </Pressable>
        </View>
      )}
      {sourceVariant !== 'cash-loan' && (
        <View accessibilityRole="tablist" style={s.tabs}>
          {tabs.map(id => (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityLabel={id === 'star' ? 'STAR +' : id.toUpperCase()}
              accessibilityState={{ selected: offer === id }}
              onPress={() => onOffer(id)}
              style={[s.tab, offer === id && s.selectedTab]}
            >
              <Text style={[s.tabLabel, offer === id && s.selectedLabel]}>
                {id === 'star' ? 'STAR +' : id.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      <View style={s.hero}>
        <View style={s.grow}>
          {offer === 'prime' && <AssetGlyph asset={primeIcon} size={24} />}
          <Text style={s.title}>{data.title}</Text>
          <Text style={s.small}>
            {sourceVariant === 'cash-loan'
              ? 'Astăzi vrei să fie simplu.\nȘi simplu e!'
              : data.slogan}
          </Text>
        </View>
        <View style={s.art}>
          <BaselineCardArt variant="Debit white arrow red" width={140} />
          {offer !== 'optim' && (
            <View style={s.frontCard}>
              <BaselineCardArt
                variant={
                  offer === 'star'
                    ? 'Debit white arrow gold'
                    : 'Credit platinum black'
                }
                width={140}
              />
            </View>
          )}
        </View>
      </View>
      {row(
        <AssetGlyph asset={catalog} size={24} />,
        offer === 'prime' ? '4 CONTURI CURENTE' : 'CONTURI CURENTE',
        offer === 'prime'
          ? 'LEI, USD și EURO, organizate exact așa cum ai nevoie, fără comision de administrare*'
          : 'Comision de administrare zero*',
      )}
      <Text style={s.body}>
        {offer === 'prime'
          ? 'Alege conturile curente de care ai nevoie acum:'
          : sourceVariant === 'cash-loan'
            ? 'Alege moneda conturilor dorite:'
            : 'Selecteaza contul pe care vrei sa il deschizi:'}
      </Text>
      <View
        style={[
          s.accounts,
          offer === 'prime' && s.primeAccounts,
          sourceVariant === 'cash-loan' && {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 32,
          },
        ]}
      >
        {OFFER_ACCOUNTS[offer].map(key => {
          const label =
            offer === 'prime'
              ? (
                  {
                    lei: 'Cont in LEI',
                    additionalLei: 'Cont aditional in LEI',
                    eur: 'Cont in EUR',
                    usd: 'Cont in USD',
                  } as Record<string, string>
                )[key]
              : key.toUpperCase();
          return (
            <View style={[s.account, offer === 'prime' && s.half]} key={key}>
              <BaselineCheckbox
                checked={!!checks[key]}
                onCheckedChange={() => toggle(key)}
                presentation="canonical"
                ariaLabel={label}
              />
              <Text style={s.label}>{label}</Text>
            </View>
          );
        })}
      </View>
      {row(
        <AssetGlyph asset={cardsIcon} size={24} />,
        offer === 'prime'
          ? '2 CARDURI DE DEBIT'
          : sourceVariant === 'cash-loan'
            ? 'CARD DE DEBIT FIZIC ȘI CARD VIRTUAL'
            : 'CARD DE DEBIT MASTERCARD STANDARD',
        data.card,
      )}
      {row(
        <AssetGlyph asset={mobileIcon} size={24} />,
        'MOBILE BANKING',
        offer === 'prime'
          ? 'Controlezi totul din aplicație, plăți, transferuri, notificări – fără costuri de administrare**'
          : 'Zero comision de administrare**',
      )}
      <Text
        style={[
          s.small,
          sourceVariant === 'cash-loan' && {
            padding: 16,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: sourceColor('var(--uc-border)'),
          },
        ]}
      >
        * Tot ce trebuie sa faci :{'\n'}• Sa ai un venit de{' '}
        <Text style={s.bold}>{data.income}</Text>
        {offer === 'star' ? (
          ' lunar de la angajator, cumulat, in orice cont curent.'
        ) : (
          <>
            {' '}
            {offer === 'optim'
              ? 'in oricare din conturi sau '
              : 'cumulat, in orice cont curent sau '}
            <Text style={s.bold}>{data.savings}</Text> in economii si
            investitii;
          </>
        )}
        {'\n'}
        {offer === 'prime' || offer === 'premium'
          ? '• Sa ai card de debit emis, atașat contului, sau o cerere de reemitere a acestuia'
          : '• Sa faci min. 1 plata / luna cu cardul de debit la comercianti (tranzactie POS sau E-commerce);'}
        {'\n'}** Sa accesezi Mobile B@nking cel putin odata la 90 de zile{'\n'}
        <Text style={s.bold}>
          Daca cele de mai sus nu sunt respectate, se vor aplica prevederile
          ofertei {data.fallback} din Anexa.
        </Text>
      </Text>
      <BaselineSectionDivider title="" ruleOnly />
      <BaselineNavigationRow
        title="TAXE ȘI COMISIOANE ȘI CONDIȚII DE ELIGIBILITATE"
        titleTone="action"
        titleStyle={s.link}
        rowHeight={64}
        trailingAccessory="chevron"
        style={s.flush}
        onPress={() =>
          onDocument('Taxe și comisioane și condiții de eligibilitate')
        }
      />
      <View style={s.row}>
        <Text style={[s.body, s.grow]}>Sunt de acord cu anexa de mai sus</Text>
        <ToggleButton
          checked={!!checks.terms}
          onToggle={() => toggle('terms')}
          ariaLabel="Sunt de acord cu anexa de mai sus"
        />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  content: { gap: 32 },
  grow: { flex: 1 },
  row: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  small: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  label: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  bold: { fontFamily: 'UniCredit-bold' },
  employer: {
    padding: 16,
    gap: 8,
    backgroundColor: sourceColor('var(--uc-surface-muted)'),
    borderRadius: 4,
  },
  employerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontFamily: 'UniCredit-bold',
    fontSize: 12,
    color: sourceColor('var(--uc-static-white)'),
    backgroundColor: sourceColor('var(--uc-green-olive)'),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  link: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    color: sourceColor('var(--uc-action)'),
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: sourceColor('var(--uc-text-muted)'),
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedTab: { borderBottomColor: sourceColor('var(--uc-text)') },
  tabLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    color: sourceColor('var(--uc-text-muted)'),
  },
  selectedLabel: { color: sourceColor('var(--uc-text)') },
  hero: { flexDirection: 'row', gap: 16, alignItems: 'center', minHeight: 110 },
  title: {
    fontFamily: 'UniCredit-bold',
    fontSize: 32,
    color: sourceColor('var(--uc-text)'),
  },
  art: { width: 140, height: 110 },
  frontCard: { position: 'absolute', top: 16, left: 0 },
  accounts: { gap: 24 },
  primeAccounts: { flexDirection: 'row', flexWrap: 'wrap' },
  account: {
    minHeight: 32,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  half: { width: '46%' },
  flush: { paddingLeft: 0, paddingRight: 0 },
});
