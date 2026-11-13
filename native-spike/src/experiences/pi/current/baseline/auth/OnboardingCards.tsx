import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  cardGoldConflict,
  cardPage,
  cardTitle,
  physicalCardTiers,
  selectedCardAccounts,
  virtualCardTiers,
  type CardTier,
} from '@/features/ro-onboarding/cards';
import { DELIVERY_ADDRESSES } from '@/features/ro-onboarding/delivery';
import { ONBOARDING_INFORMATION } from '@/features/ro-onboarding/information';
import { OnboardingDeliverySheet } from './OnboardingDeliverySheet';
import { OnboardingInformationSheet } from './OnboardingInformationSheet';
import { OnboardingSheet } from './OnboardingSheet';
import { RadioButton } from '../../../../../universal/RadioButton';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { OnboardingCardCostDetails } from './OnboardingCardCostDetails';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import type { OnboardingOffer } from '@/features/ro-onboarding/offers';
import type { CardArtVariant } from '@/app/components/contracts/imageArtwork';
import { BaselineCardArt } from '../../../../../universal/BaselineCardArt';
import { BaselineCheckbox } from '../../../../../universal/BaselineCheckbox';
import { BaselineDropdownField } from '../../../../../universal/BaselineDropdownField';
import { BaselineNavigationLink } from '../../../../../universal/BaselineNavigationLink';
import { OnboardingSectionDivider as BaselineSectionDivider } from './OnboardingSectionDivider';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import benefitIcon from '@/assets/pi/ro/onboarding/card-benefit.svg';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

export function onboardingCardArt(
  tier: CardTier,
  virtual: boolean,
): CardArtVariant {
  return virtual
    ? tier === 'gold'
      ? 'Virtual orange'
      : 'Virtual violet'
    : tier === 'platinum'
      ? 'Credit platinum black'
      : tier === 'gold'
        ? 'Debit white arrow gold'
        : 'Debit white arrow red';
}
const BENEFITS = {
  standard: [
    'You have 24-hour access to your current account for cash withdrawals from ATMs, at home and abroad',
    'Benefit from discounts at UniCredit Bank partner merchants, through the ShopSmart',
    'If you receive your salary by card, you can opt for the Overdraft, up to 5 net salaries;',
  ],
  gold: [
    'Free travel insurance abroad',
    'Mobile phone and smartwatch insurance',
    'Electronics and appliances insurance',
    'Online medical assistance Doctor Chat',
  ],
  platinum: [
    'Free travel insurance abroad',
    'Financial protection in case of unforeseen events, accidents and/or illness',
    'Card protect - free insurance covering various events.',
    'Priority Pass - free access to over 1200 international airport lounges.',
  ],
};
export function OnboardingCards({
  offer,
  values,
  checks,
  onChange,
  onToggle,
  cashLoan = false,
}: {
  offer: OnboardingOffer;
  values: Record<string, string>;
  checks: Record<string, boolean>;
  onChange: (key: string, value: string) => void;
  onToggle: (key: string) => void;
  cashLoan?: boolean;
}) {
  const page = cardPage(values);
  const virtual = page === 'virtual';
  const tier: CardTier =
    page === 'platinum'
      ? 'platinum'
      : page === 'standard'
        ? 'standard'
        : ((values[`${virtual ? 'virtual' : 'physical'}Tier`] ||
            'standard') as CardTier);
  const accountKey =
    page === 'platinum'
      ? 'platinumAccount'
      : virtual
        ? 'virtualAccount'
        : 'physicalAccount';
  const options = selectedCardAccounts(offer, checks).map(([value, label]) => ({
    value,
    label,
  }));
  const title = cardTitle(tier, virtual);
  const tiers = virtual ? virtualCardTiers(offer) : physicalCardTiers(offer);
  const costsPreview = values.cardCostPreview === 'true';
  const [accountSheet, setAccountSheet] = useState(
    values.cardAccountSheet === 'true',
  );
  const [accountSelection, setAccountSelection] = useState(
    values[accountKey] || '',
  );
  const [costDetails, setCostDetails] = useState(
    values.cardCostDetails === 'true',
  );
  const [confirmSwitch, setConfirmSwitch] = useState(
    values.cardSwitchConfirm === 'true',
  );
  const [replacementAccount, setReplacementAccount] = useState(
    values.physicalAccount || options[0]?.value || '',
  );
  const choice = (
    key: string,
    label: string,
    cardTier: CardTier,
    isVirtual: boolean,
    description: string,
  ) => (
    <View key={key} style={[s.choice, checks[key] && s.selectedChoice]}>
      <Text style={[s.choiceTitle, checks[key] && s.action]}>{label}</Text>
      <View style={s.artRow}>
        <View
          style={{
            width: 100,
            height:
              64 +
              (offer === 'prime'
                ? 0
                : (isVirtual
                    ? physicalCardTiers(offer).length
                    : virtualCardTiers(offer).length) - 1) *
                14,
          }}
        >
          {(cashLoan || offer === 'prime'
            ? [cardTier]
            : isVirtual
              ? [...physicalCardTiers(offer)].reverse()
              : [...virtualCardTiers(offer)].reverse()
          ).map((artTier, index) => (
            <View
              key={artTier}
              style={{ position: 'absolute', left: 0, top: index * 14 }}
            >
              <BaselineCardArt
                variant={onboardingCardArt(
                  artTier,
                  cashLoan ? isVirtual : offer === 'prime' ? false : !isVirtual,
                )}
                width={100}
              />
            </View>
          ))}
        </View>
        <BaselineCheckbox
          presentation="canonical"
          checked={!!checks[key]}
          onCheckedChange={() => onToggle(key)}
          ariaLabel={label}
        />
      </View>
      <Text style={s.small}>{description}</Text>
      {!cashLoan && (
        <BaselineNavigationLink
          text="MAI MULTE DETALII"
          presentation="primary"
          onPress={() => {
            onChange(
              'cardPage',
              key === 'physical' && offer === 'prime' ? 'standard' : key,
            );
            onChange(`${isVirtual ? 'virtual' : 'physical'}Tier`, cardTier);
          }}
        />
      )}
    </View>
  );
  const recap = (
    key: string,
    label: string,
    cardTier: CardTier,
    isVirtual: boolean,
  ) => (
    <View key={key} style={s.group}>
      <BaselineSectionDivider title={label} width={327} />
      <BaselineCardArt
        variant={onboardingCardArt(cardTier, isVirtual)}
        width={96}
      />
      <View>
        <Text style={s.label}>CARD SELECTED</Text>
        <Text style={s.small}>{cardTitle(cardTier, isVirtual)}</Text>
      </View>
      <View>
        <Text style={s.label}>ACCOUNT SELECTED</Text>
        <Text style={s.small}>
          {options.find(o => o.value === values[`${key}Account`])?.label ||
            'RON'}{' '}
          account
        </Text>
      </View>
    </View>
  );
  return (
    <View style={s.content}>
      {page === 'types' ? (
        <>
          <Text style={s.body}>
            {cashLoan || options.length > 1
              ? 'Poți selecta unul sau ambele tipuri de card. Cardul urmând să fie atașat unui cont curent ales de tine.'
              : 'Te rog sa alegi unul sau ambele tipuri de carduri Mastercard Standard, care vor fi atasate la contul tau curent.'}
          </Text>
          {cashLoan ? (
            <>
              {choice(
                'physical',
                'CARD FIZIC',
                'standard',
                false,
                'Livrat gratuit în cel mult 5 zile la adresa ta.',
              )}
              {choice(
                'virtual',
                'CARD VIRTUAL',
                'standard',
                true,
                'Disponibil instant.',
              )}
            </>
          ) : offer === 'prime' ? (
            <>
              {choice(
                'platinum',
                'CARD FIZIC MASTERCARD PLATINUM',
                'platinum',
                false,
                'Livrat gratuit la adresa ta în decurs de pana la 5 zile',
              )}
              {choice(
                'physical',
                'CARD FIZIC MASTERCARD STANDARD',
                'standard',
                false,
                'Livrat gratuit la adresa ta în decurs de pana la 5 zile',
              )}
            </>
          ) : (
            <>
              {choice(
                'virtual',
                'CARD VIRTUAL',
                'standard',
                true,
                offer !== 'optim' || options.length > 1
                  ? 'Disponibil instant.'
                  : 'Activat automat',
              )}
              {choice(
                'physical',
                'CARD FIZIC',
                'standard',
                false,
                offer !== 'optim'
                  ? 'Livrat gratuit în cel mult 5 zile la adresa ta.'
                  : 'Livrat gratuit la adresa ta în decurs de pana la 5 zile',
              )}
            </>
          )}
        </>
      ) : page === 'recap' ? (
        <>
          <Text style={s.small}>
            Here is a recap of your choices, if you want a different selection
            you need to go back.
          </Text>
          {checks.platinum &&
            offer === 'prime' &&
            recap('platinum', 'YOUR PHYSICAL CARD', 'platinum', false)}
          {checks.physical &&
            recap(
              'physical',
              'YOUR PHYSICAL CARD',
              (values.physicalTier || 'standard') as CardTier,
              false,
            )}
          {checks.virtual &&
            offer !== 'prime' &&
            recap(
              'virtual',
              'YOUR VIRTUAL CARD',
              (values.virtualTier || 'standard') as CardTier,
              true,
            )}
        </>
      ) : (
        <>
          {(costsPreview || cashLoan) && (
            <Text style={s.small}>
              {cashLoan && !virtual
                ? 'Cardurile fizice vor fi livrate la o adresă selectată de tine în 5 zile lucrătoare.'
                : 'Cardurile Virtuale sunt disponibile instant pentru plăți online, la POS sau prin Apple Pay/Google Pay.'}
            </Text>
          )}
          {tiers.length > 1 && offer !== 'prime' && (
            <>
              <Text style={s.small}>
                {virtual
                  ? 'Cardurile Virtuale sunt disponibile instant pentru plăți online, la POS sau prin Apple Pay/Google Pay.'
                  : 'Cardurile fizice vor fi livrate la o adresă selectată de tine în 5 zile lucrătoare.'}
              </Text>
              <View accessibilityRole="tablist" style={s.tabs}>
                {tiers.map(option => (
                  <Pressable
                    key={option}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: option === tier }}
                    accessibilityLabel={`${virtual ? 'VIRTUAL ' : ''}${option.toUpperCase()}`}
                    onPress={() =>
                      onChange(
                        `${virtual ? 'virtual' : 'physical'}Tier`,
                        option,
                      )
                    }
                    style={[s.tab, option === tier && s.selectedTab]}
                  >
                    <Text style={s.label}>
                      {virtual ? 'VIRTUAL ' : ''}
                      {option.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          <View style={s.hero}>
            <BaselineCardArt
              variant={onboardingCardArt(tier, virtual)}
              width={209}
            />
          </View>
          <Text style={s.cardTitle}>{title}</Text>
          <BaselineSectionDivider
            title="BENEFICIILE CARDULUI"
            width={327}
            softRule={!costsPreview}
          />
          {(costsPreview
            ? [
                'This is a feature description 1st',
                'This is a feature description 2nd',
                'This is a feature description 3rd',
                'This is a feature description 4th',
                'This is a feature description 5th',
              ]
            : [
                ...(cashLoan
                  ? [
                      'Ai acces non-stop la contul tău curent pentru retrageri de numerar de la bancomate, atât în țară, cât și în străinătate.',
                      'Beneficiazi de reduceri la comercianții parteneri UniCredit Bank, prin programul ShopSmart.',
                      'Dacă îți primești salariul pe card, poți opta pentru un overdraft de până la 5 salarii nete.',
                    ]
                  : BENEFITS[tier]),
                ...(!virtual && tier === 'standard'
                  ? [
                      cashLoan
                        ? 'Beneficiezi de livrare gratuită a cardului, direct la tine acasă!'
                        : 'You benefit from free card delivery, right to your home!',
                    ]
                  : []),
              ]
          ).map(benefit => (
            <View key={benefit} style={s.benefit}>
              <AssetGlyph asset={benefitIcon} size={24} />
              <Text style={[s.small, s.grow]}>{benefit}</Text>
            </View>
          ))}
          {costsPreview && (
            <>
              <View style={{ gap: 24 }}>
                <BaselineSectionDivider
                  title=""
                  ruleOnly
                  softRule
                  width={327}
                />
                {['Cost information 1', 'Cost information 2'].map(label => (
                  <View key={label} style={s.artRow}>
                    <Text style={s.small}>{label}</Text>
                    <Text style={s.label}>0 RON</Text>
                  </View>
                ))}
              </View>
              <PrimaryButton
                label="More details"
                variant="secondary"
                onPress={() => setCostDetails(true)}
              />
            </>
          )}
          <View style={s.dropdown}>
            <BaselineDropdownField
              label="Card atasat la contul de"
              value={values[accountKey] || ''}
              options={options}
              onChange={v => onChange(accountKey, v)}
              fillWidth
              onOpen={
                cashLoan
                  ? () => {
                      setAccountSelection(values[accountKey] || '');
                      setAccountSheet(true);
                    }
                  : undefined
              }
            />
          </View>
          {virtual && cardGoldConflict(values, checks) && (
            <View style={s.notice}>
              <Text style={s.small}>
                <Text style={s.label}>Cardul virtual Mastercard Gold</Text>{' '}
                poate fi selectat doar dacă modifici selecția inițială a
                cardului fizic și alegi{' '}
                <Text style={s.label}>cardul fizic Mastercard Standard.</Text>
              </Text>
              <View style={s.artRow}>
                <Text style={s.label}>
                  Card Fizic{'\n'}
                  {cardTitle(
                    (values.physicalTier || 'standard') as CardTier,
                  ).toUpperCase()}
                </Text>
                <BaselineCardArt
                  variant={onboardingCardArt(
                    (values.physicalTier || 'standard') as CardTier,
                    false,
                  )}
                  width={100}
                />
              </View>
              <BaselineNavigationLink
                text="SCHIMBǍ TIPUL DE CARD"
                onPress={() => {
                  setReplacementAccount(
                    values.physicalAccount || options[0]?.value || '',
                  );
                  setConfirmSwitch(true);
                }}
              />
            </View>
          )}
        </>
      )}
      {accountSheet && (
        <OnboardingSheet
          title="Cardul va fi asociat contului"
          onClose={() => setAccountSheet(false)}
          footer={
            <PrimaryButton
              label="Continuǎ"
              disabled={!accountSelection}
              onPress={() => {
                onChange(accountKey, accountSelection);
                setAccountSheet(false);
              }}
            />
          }
        >
          {options.map(option => (
            <RadioButton
              key={option.value}
              label={option.label}
              selected={accountSelection === option.value}
              onPress={() => setAccountSelection(option.value)}
              paddingHorizontal={0}
            />
          ))}
        </OnboardingSheet>
      )}
      {costDetails && (
        <OnboardingCardCostDetails onClose={() => setCostDetails(false)} />
      )}
      {confirmSwitch && (
        <OnboardingSheet
          title="Confirm the card switch?"
          onClose={() => setConfirmSwitch(false)}
          fixedHeight
          maxHeightOffsetPx={24}
          footer={
            <View style={{ gap: 8 }}>
              <PrimaryButton
                label="Da, vreau sa schimb cardul"
                disabled={
                  !options.some(option => option.value === replacementAccount)
                }
                onPress={() => {
                  onChange('physicalTier', 'standard');
                  onChange('physicalAccount', replacementAccount);
                  setConfirmSwitch(false);
                }}
              />
              <PrimaryButton
                label="Nu, M-am razgandit"
                variant="secondary"
                onPress={() => setConfirmSwitch(false)}
              />
            </View>
          }
        >
          <View style={s.content}>
            <Text style={s.small}>
              The <Text style={s.label}>virtual card Mastercard Gold</Text> can
              be selected only if you change your initial physical card
              selection and choose the{' '}
              <Text style={s.label}>physical card Mastercard Standard.</Text>
            </Text>
            <View style={s.hero}>
              <BaselineCardArt
                variant={onboardingCardArt('standard', false)}
                width={209}
              />
            </View>
            <Text style={s.cardTitle}>Mastercard Standard</Text>
            <BaselineSectionDivider title="BENEFICIILE CARDULUI" width={327} />
            {[
              ...BENEFITS.standard,
              'You benefit from free card delivery, right to your home!',
            ].map(benefit => (
              <View key={benefit} style={s.benefit}>
                <AssetGlyph asset={benefitIcon} size={24} />
                <Text style={[s.small, s.grow]}>{benefit}</Text>
              </View>
            ))}
            <View style={s.dropdown}>
              <BaselineDropdownField
                label="Card atasat la contul de"
                value={replacementAccount}
                options={options}
                onChange={setReplacementAccount}
                fillWidth
              />
            </View>
          </View>
        </OnboardingSheet>
      )}
    </View>
  );
}
export function OnboardingCardConfiguration({
  values,
  checks,
  offer,
  onChange,
}: {
  values: Record<string, string>;
  checks: Record<string, boolean>;
  offer: OnboardingOffer;
  onChange: (key: string, value: string) => void;
}) {
  const [deliverySheet, setDeliverySheet] = useState(
    values.deliverySheet === 'open',
  );
  const [passwordInfo, setPasswordInfo] = useState(false);
  const physical = checks.physical || (offer === 'prime' && checks.platinum);
  const stacked =
    offer === 'prime'
      ? checks.platinum && checks.physical
      : checks.physical && checks.virtual;
  return (
    <View style={s.content}>
      <View style={s.hero}>
        <View style={{ width: 209, height: stacked ? 159 : 133 }}>
          {stacked && (
            <BaselineCardArt
              variant={onboardingCardArt(
                offer === 'prime'
                  ? 'standard'
                  : ((values.virtualTier || 'standard') as CardTier),
                offer !== 'prime',
              )}
              width={209}
            />
          )}
          <View
            style={{ position: 'absolute', top: stacked ? 26 : 0, left: 0 }}
          >
            <BaselineCardArt
              variant={onboardingCardArt(
                offer === 'prime' && checks.platinum
                  ? 'platinum'
                  : physical
                    ? ((values.physicalTier || 'standard') as CardTier)
                    : ((values.virtualTier || 'standard') as CardTier),
                !physical,
              )}
              width={209}
            />
          </View>
        </View>
      </View>
      {physical && (
        <>
          <BaselineSectionDivider
            title="ADRESA DE LIVRARE A CARDULUI FIZIC"
            width={327}
          />
          <View style={s.dropdown}>
            <BaselineDropdownField
              label="Selecteaza adresa"
              value={values.deliveryAddress || ''}
              options={DELIVERY_ADDRESSES.map(address => ({
                value: address.value,
                label: address.display,
              }))}
              onChange={v => onChange('deliveryAddress', v)}
              onOpen={() => setDeliverySheet(true)}
              expanded={deliverySheet}
              fillWidth
            />
          </View>
          {!!values.deliveryAddress && (
            <View style={s.notice}>
              <Text style={s.small}>
                {ONBOARDING_INFORMATION.delivery.body}
              </Text>
            </View>
          )}
          {values.deliveryAddress === 'new' && (
            <View style={s.content}>
              <BaselineSectionDivider title="NEW ADDRESS" width={327} />
              {[
                ['deliveryCounty', 'Județ | Sector'],
                ['deliveryCity', 'Oraș'],
                ['deliveryStreet', 'Strada'],
                ['deliveryNumber', 'Număr'],
                ['deliveryBlock', 'Bloc'],
                ['deliveryStair', 'Scară'],
                ['deliveryFloor', 'Etaj'],
                ['deliveryApartment', 'Apartament'],
                ['deliveryPostal', 'Cod Postal'],
              ].map(([key, label]) => (
                <BaselineTextField
                  key={key}
                  label={label}
                  value={values[key] || ''}
                  onChange={v => onChange(key, v)}
                  maxLength={key === 'deliveryPostal' ? 6 : 100}
                  inputMode={key === 'deliveryPostal' ? 'numeric' : 'text'}
                />
              ))}
            </View>
          )}
        </>
      )}
      <View>
        <BaselineSectionDivider
          title="PAROLA ÎN RELAȚIE CU BANCA"
          width={327}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Parola in relatia cu banca"
          onPress={() => setPasswordInfo(true)}
          style={{
            position: 'absolute',
            right: 0,
            top: -8,
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SourceCustomIcon
            name="info-circle"
            size={16}
            color={sourceColor('var(--uc-text)')}
          />
        </Pressable>
      </View>
      <BaselineTextField
        label="Introdu parola"
        value={values.bankPassword || ''}
        onChange={v => onChange('bankPassword', v)}
        secureTextEntry
      />
      <BaselineTextField
        label="Confirma parola"
        value={values.bankPasswordConfirm || ''}
        onChange={v => onChange('bankPasswordConfirm', v)}
        secureTextEntry
        errorText={
          values.bankPasswordConfirm &&
          values.bankPassword !== values.bankPasswordConfirm
            ? 'Parolele nu coincid'
            : undefined
        }
      />
      {deliverySheet && (
        <OnboardingDeliverySheet
          value={values.deliveryAddress || ''}
          onClose={() => setDeliverySheet(false)}
          onConfirm={value => {
            onChange('deliveryAddress', value);
            setDeliverySheet(false);
          }}
        />
      )}
      {passwordInfo && (
        <OnboardingInformationSheet
          kind="password"
          onClose={() => setPasswordInfo(false)}
        />
      )}
    </View>
  );
}
const s = StyleSheet.create({
  content: { gap: 24 },
  group: { gap: 16 },
  grow: { flex: 1 },
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
  choice: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: sourceColor('var(--uc-text)'),
    padding: 16,
    gap: 12,
  },
  selectedChoice: {
    borderWidth: 2,
    padding: 15,
    borderColor: sourceColor('var(--uc-action)'),
  },
  choiceTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 20,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  action: { color: sourceColor('var(--uc-action)') },
  artRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hero: { alignItems: 'center' },
  cardTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    textAlign: 'center',
    color: sourceColor('var(--uc-text)'),
  },
  benefit: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  dropdown: { marginHorizontal: -24 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: sourceColor('var(--uc-text-muted)'),
  },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  selectedTab: {
    borderBottomWidth: 3,
    borderColor: sourceColor('var(--uc-text)'),
  },
  notice: {
    borderWidth: 1,
    borderColor: sourceColor('var(--uc-text)'),
    borderRadius: 4,
    padding: 16,
    gap: 24,
  },
});
