import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import catalog from '@/assets/pi/ro/onboarding/product-catalog.svg';
import activation from '@/assets/pi/ro/onboarding/mobile-activation.svg';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { BaselineCheckbox } from '../../../../../universal/BaselineCheckbox';
import { OnboardingSectionDivider as BaselineSectionDivider } from './OnboardingSectionDivider';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

export const DECLARATIONS = [
  'I AM THE REAL BENEFICIARY OF THE FUNDS/ ASSETS',
  'I AM NOT A PUBLICLY EXPOSED PERSON',
  'I AM NOT IN THE UNICREDIT BANK GROUP OF CUSTOMERS',
  'I AM A ROMANIAN RESIDENT',
  'I DO NOT HOLD A US GREEN CARD',
  'I AM NOT PART OF CONNECTED CUSTOMERS GROUP',
  'I AM ONLY ROMANIAN CITIZEN',
];

export function OnboardingProducts({
  checks,
  toggle,
  onDocument,
}: {
  checks: Record<string, boolean>;
  toggle: (key: string) => void;
  onDocument: (title: string) => void;
}) {
  return (
    <View style={s.content}>
      <BaselineSectionDivider title="INFORMATII PRIVIND PRODUSELE" />
      <View style={s.product}>
        <AssetGlyph asset={catalog} size={24} />
        <View style={s.flex}>
          <Text style={s.strong}>CONT CURENT</Text>
          <Text style={s.small}>Comision de administrare zero*</Text>
        </View>
      </View>
      <Text style={s.body}>Selecteaza contul pe care vrei sa il deschizi:</Text>
      {['LEI', 'EUR'].map(currency => (
        <View style={s.choice} key={currency}>
          <BaselineCheckbox
            presentation="canonical"
            checked={!!checks[currency === 'LEI' ? 'lei' : 'eur']}
            onCheckedChange={() => toggle(currency === 'LEI' ? 'lei' : 'eur')}
            ariaLabel={currency}
          />
          <Text style={s.strong}>{currency}</Text>
        </View>
      ))}
      <View style={s.product}>
        <AssetGlyph asset={catalog} size={24} />
        <View style={s.flex}>
          <Text style={s.strong}>CARD DE DEBIT MASTERCARD STANDARD</Text>
          <Text style={s.small}>
            Fizic/Virtual, comision de administrare zero
          </Text>
        </View>
      </View>
      <Text style={s.heading}>Mobile Banking</Text>
      <BaselineSectionDivider title="COMISION DE ADMINISTRARE CONFORM ANEXA" />
      <Text style={s.body}>
        * Tot ce trebuie să faci:{'\n'}• Să ai un venit de{' '}
        <Text style={s.bold}>min. 1.500 Lei</Text> în oricare din conturi sau{' '}
        <Text style={s.bold}>min. 50.000 Lei (echivalent în valută)</Text> în
        economii și investiții;{'\n'}• Să faci{' '}
        <Text style={s.bold}>min. 1 plată / lună cu cardul de debit</Text> la
        comercianți (tranzacție POS sau E-commerce);{'\n'}** Să accesezi Mobile
        B@nking cel puțin o dată la 90 de zile{'\n'}
        <Text style={s.bold}>
          Dacă cele de mai sus nu sunt respectate, se vor aplica prevederile
          ofertei Optim din Anexa.
        </Text>
      </Text>
      <BaselineSectionDivider title="" ruleOnly />
      <BaselineNavigationRow
        title="TAXE ȘI COMISIOANE ȘI CONDIȚII DE ELIGIBILITATE"
        rowHeight={64}
        titleTone="action"
        trailingAccessory="chevron"
        titleStyle={s.link}
        style={s.flush}
        onPress={() =>
          onDocument('Taxe și comisioane și condiții de eligibilitate')
        }
      />
      <View style={s.product}>
        <Text style={[s.body, s.flex]}>Sunt de acord cu anexa de mai sus</Text>
        <ToggleButton
          checked={!!checks.terms}
          onToggle={() => toggle('terms')}
          ariaLabel="Sunt de acord cu anexa de mai sus"
        />
      </View>
    </View>
  );
}

export function OnboardingDeclarations({
  onSelect,
}: {
  onSelect: (title: string) => void;
}) {
  return (
    <View style={s.content}>
      <Text style={s.body}>
        Please read the statements below carefully and, if they do not
        correspond to your actual situation, please request support so the
        account will be opened in the branch.
      </Text>
      <BaselineSectionDivider title="" ruleOnly />
      <View>
        {DECLARATIONS.map(title => (
          <BaselineNavigationRow
            key={title}
            title={title}
            titleStyle={s.declaration}
            rowHeight={80}
            style={s.flush}
            trailingAccessory="chevron"
            onPress={() => onSelect(title)}
          />
        ))}
      </View>
    </View>
  );
}

export function OnboardingSteps({ detailed = false }: { detailed?: boolean }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <View style={s.content}>
      {!detailed && (
        <Text style={s.body}>
          Mai jos sunt descrisi pasii pentru deschiderea unui cont curent
          online:
        </Text>
      )}
      <View>
        {[
          'Date de contact',
          'Confirmarea identitatii',
          'Informatii suplimentare',
          'Personalizarea produsului',
          'Semnarea contractului',
          'Activarea Mobile Banking',
        ].map((title, index) => (
          <View
            key={title}
            style={
              detailed ? s.stepItem : index === 5 ? s.activationRow : undefined
            }
          >
            <BaselineNavigationRow
              title={title}
              rowHeight={64}
              style={[s.flush, detailed && { height: 72 }]}
              titleStyle={detailed ? s.stepTitle : s.body}
              leadingVisual={
                index === 5 ? (
                  <View style={s.activation}>
                    <AssetGlyph
                      asset={activation}
                      width={15.944}
                      height={11.0007}
                    />
                  </View>
                ) : (
                  <View style={s.number}>
                    <Text style={s.body}>{index + 1}</Text>
                  </View>
                )
              }
              trailingAccessory={detailed ? 'chevron' : 'none'}
              chevronIconName={
                expanded === index ? 'chevron-up' : 'chevron-down'
              }
              onPress={
                detailed
                  ? () => setExpanded(expanded === index ? null : index)
                  : undefined
              }
            />
            {expanded === index && index === 0 && (
              <Text style={[s.body, s.stepDescription]}>
                We provide you consultation before you decide to open your
                current account online, choose the type of debit card and the
                attached Mobile Banking service. At this stage, it is also
                necessary to comply with the displayed eligibility conditions in
                order to continue the flow.
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  content: { gap: 24 },
  flex: { flex: 1 },
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
  strong: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  bold: { fontFamily: 'UniCredit-bold' },
  heading: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    color: sourceColor('var(--uc-text)'),
  },
  product: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  choice: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    minHeight: 32,
  },
  flush: { paddingLeft: 0, paddingRight: 0 },
  link: { fontSize: 14 },
  declaration: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 20 },
  step: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepItem: {
    borderBottomWidth: 1,
    borderColor: sourceColor('var(--uc-border-muted)'),
  },
  stepTitle: { fontFamily: 'UniCredit-bold', fontSize: 18, lineHeight: 24 },
  stepDescription: { paddingBottom: 16 },
  activationRow: {
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
    borderColor: sourceColor('var(--uc-border-muted)'),
  },
  number: {
    height: 32,
    width: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: sourceColor('var(--uc-text-muted)'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activation: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sourceColor('var(--uc-action)'),
  },
});
