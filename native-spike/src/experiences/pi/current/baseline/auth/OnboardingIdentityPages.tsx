import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import identityIcon from '@/assets/pi/ro/onboarding/identity-card.svg';
import camera from '@/assets/pi/ro/onboarding/scan-camera.svg';
import instructions from '@/assets/pi/ro/onboarding/scan-instructions.svg';
import person from '@/assets/pi/ro/onboarding/scan-person.svg';
import phoneOutline from '@/assets/pi/ro/onboarding/scan-phone-outline.svg';
import sampleId from '@/assets/pi/ro/onboarding/scan-example-id.png';
import desk from '@/assets/pi/ro/onboarding/scan-desk.png';
import reviewId from '@/assets/pi/ro/onboarding/scan-review-id.png';
import check from '@/assets/pi/ro/onboarding/scan-check.svg';
import cross from '@/assets/pi/ro/onboarding/scan-cross.svg';
import {
  HOME_ADDRESS,
  IDENTITY_SUMMARY,
} from '@/features/ro-onboarding/identity';
import { RasterImage } from '../offers/RasterImage';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { OnboardingSectionDivider as BaselineSectionDivider } from './OnboardingSectionDivider';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { BaselineDropdownField } from '../../../../../universal/BaselineDropdownField';
import { BaselineNavigationLink } from '../../../../../universal/BaselineNavigationLink';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { BaselineBanner } from '../../../../../universal/BaselineBanner';

export function OnboardingIdentityConsent({
  selfie = false,
  accepted,
  onToggle,
  onDetails,
  cashLoan = false,
}: {
  selfie?: boolean;
  accepted: boolean;
  onToggle: () => void;
  onDetails: () => void;
  cashLoan?: boolean;
}) {
  const rows = cashLoan
    ? selfie
      ? [
          [
            camera,
            'PERMISIUNE PENTRU CAMERA FOTO/VIDEO',
            'Pe pagina următoare, ți se va cere permisiunea de a porni camera.',
          ],
          [
            person,
            'MENȚINE-ȚI FAȚA CÂT MAI CLARĂ',
            'Când faci fotografia, asigură-te că nu porți mască sau ochelari.',
          ],
          [
            instructions,
            'INDICAȚII',
            'Urmărește instrucțiunile afișate pe ecran.',
          ],
        ]
      : [
          [
            identityIcon,
            'CARTEA DE IDENTITATE ÎN ORIGINAL',
            'Numai cărțile de identitate românești sunt acceptate.',
          ],
          [
            camera,
            'PERMISIUNE PENTRU FOTO/VIDEO',
            'Pe pagina următoare, ți se va solicita permisiunea de a activa camera.',
          ],
          [
            instructions,
            'ÎNDRUMARE',
            'Urmărește instrucțiunile afișate pe ecran',
          ],
        ]
    : selfie
      ? [
          [
            camera,
            'INCADREAZA CORESPUNZATOR FATA',
            'Pe pagina următoare, este necesar sa iti incadrezi corespunzator fata, in chenarul dedicat. Incadreaza doar fata ta.',
          ],
          [
            person,
            'MENȚINE FATA NEACOPERITA',
            'Cand faci fotografia, asigura-te ca nu porti masca, ochelari, sapca sau palarie',
          ],
          [
            instructions,
            'INFO',
            'Urmeaza instructiunile afisate in ecranul urmator',
          ],
        ]
      : [
          [
            identityIcon,
            'TINE CARTEA DE IDENTITATE LA INDEMANA',
            'Este acceptata doar Cartea de identitate romaneasca clasica',
          ],
          [
            camera,
            'PERMISIUNE PENTRU CAMERA FOTO/VIDEO',
            'Pe pagina următoare, ți se va cere permisiunea de a porni camera, apasa butonul Autorizeaza/Permite.',
          ],
          [
            instructions,
            'INDICATII',
            'Urmeaza instructiunile afisate in ecranul urmator.',
          ],
        ];
  const consent = cashLoan
    ? selfie
      ? 'Sunt de acord cu prelucrarea datelor mele biometrice'
      : 'Sunt de acord să particip la procesul de identificare pentru a-mi confirma identitatea, prin capturarea imaginii cărții de identitate originale.'
    : selfie
      ? 'Sunt de acord cu procesarea datelor mele biometrice'
      : 'Sunt de acord sa parcurg procesul de identificare pentru a-mi confirma identitatea, prin capturarea imaginii cartii mele de identitate in original';
  return (
    <View style={s.consentPage}>
      <View style={selfie ? s.selfieRows : s.rows}>
        {rows.map(([asset, title, body]) => (
          <View key={title} style={s.instruction}>
            <AssetGlyph asset={asset} size={24} />
            <View style={s.grow}>
              <Text style={s.label}>{title}</Text>
              <Text style={s.small}>{body}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={s.rule} />
      <View style={s.consent}>
        <Text style={[s.small, s.grow]}>{consent}</Text>
        <ToggleButton
          checked={accepted}
          onToggle={onToggle}
          ariaLabel={consent}
        />
      </View>
      {selfie && (
        <BaselineNavigationLink
          text="MAI MULTE DETALII"
          presentation="primary"
          onPress={onDetails}
        />
      )}
    </View>
  );
}

export function OnboardingScanGuidelines({
  cashLoan = false,
}: {
  cashLoan?: boolean;
}) {
  const rows = cashLoan
    ? [
        'Telefonul trebuie sa fie tinut pe verticala',
        'Cartea de identitate trebuie sa fie asezata vertical, pe o suprafata dreapta',
        'Nu acoperi informatiile si marginele cartii de indentitate',
      ]
    : [
        'TINE TELEFONUL SI CARTEA DE IDENTITATE IN POZITIE VERTICALA',
        'CARTEA DE IDENTITATE TREBUIE ASEZATA PE O SUPRAFATA DREAPTA DE CULOARE INCHISA',
        'INCLINA CARTEA DE IDENTITATE PE VERTICALA IN FATA CAMEREI',
        'NU ACOPERI INFORMATIILE SI MARGINELE CARTII DE INDENTITATE',
      ];
  return (
    <View style={s.guidelines}>
      <View style={s.phone}>
        <View style={s.phoneArt}>
          <AssetGlyph asset={phoneOutline} width={189.756} height={100} />
        </View>
        <RasterImage
          source={{ uri: sampleId }}
          style={s.guideId}
          resizeMode="contain"
        />
        <View style={s.guideBorder} />
      </View>
      {rows.map((title, index) => (
        <View key={title} style={s.instruction}>
          <AssetGlyph
            asset={index === rows.length - 1 ? cross : check}
            size={24}
          />
          <Text style={[s.label, s.grow]}>{title}</Text>
        </View>
      ))}
    </View>
  );
}

/** Executable fixture camera surface; the design's photographs remain separate assets. */
export function OnboardingScanSurface({
  review,
  failed,
  remaining,
  onCapture,
}: {
  review: boolean;
  failed: boolean;
  remaining: number;
  onCapture: () => void;
}) {
  return (
    <View style={s.capturePage}>
      <View style={s.captureHeading}>
        {(review || failed) && (
          <AssetGlyph asset={failed ? cross : check} size={32} />
        )}
        <Text style={s.captureTitle}>
          {failed
            ? 'Refa poza documentul nu s-a putut scana'
            : review
              ? 'Fața documentului a fost scanată\nConfirmi că poza este legibilă?'
              : 'Scanează fața documentului'}
        </Text>
        {failed && (
          <Text style={s.small}>
            mai ai {remaining} tentative la dispozitie
          </Text>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Scanează documentul"
        onPress={onCapture}
        disabled={review || failed}
        style={s.camera}
      >
        <RasterImage source={{ uri: desk }} style={s.desk} resizeMode="cover" />
        {(review || failed) && (
          <View style={s.reviewFrame}>
            <RasterImage
              source={{ uri: reviewId }}
              style={s.reviewId}
              resizeMode="contain"
            />
          </View>
        )}
      </Pressable>
    </View>
  );
}

function SummaryRows({
  rows,
}: {
  rows: readonly (readonly [string, string])[];
}) {
  return (
    <View style={s.summaryRows}>
      {rows.map(([label, value]) => (
        <View key={label} style={s.summaryRow}>
          <Text style={s.label}>{label}</Text>
          <Text style={s.small}>{value}</Text>
        </View>
      ))}
    </View>
  );
}
export function OnboardingPersonalSummary({
  notice = false,
}: {
  notice?: boolean;
}) {
  return (
    <View style={s.summary}>
      {notice && (
        <BaselineBanner
          variant="info"
          title="In cazul in care datele tale nu sunt in conformitate cu cartea de identitate, acestea vor fi corectate. Te rugam sa verifici corectitudinea acestora, in documentatia contractuala afisata in etapa de semnare a contractului."
          iconName="info-circle"
          presentation={{
            radius: 4,
            width: 327,
            titleFont: 'UniCredit-regular',
            titleSize: 16,
            titleLineHeight: 20,
          }}
        />
      )}
      {IDENTITY_SUMMARY.map(([section, rows]) => (
        <View key={section} style={s.summaryGroup}>
          <BaselineSectionDivider title={section} width={327} />
          <SummaryRows rows={rows} />
        </View>
      ))}
    </View>
  );
}
export function OnboardingAddressSummary({
  values,
  sameAddress,
  onChange,
  onToggle,
  onSelect,
  reviewed = false,
  onEdit,
}: {
  values: Record<string, string>;
  sameAddress: boolean;
  onChange: (key: string, value: string) => void;
  onToggle: () => void;
  onSelect: (key: string) => void;
  reviewed?: boolean;
  onEdit?: () => void;
}) {
  const field = (
    key: string,
    label: string,
    numeric = false,
    maxLength?: number,
    helperText?: string,
  ) => (
    <BaselineTextField
      key={key}
      label={label}
      value={values[key] || ''}
      onChange={v => onChange(key, numeric ? v.replace(/[^0-9]/g, '') : v)}
      inputMode={numeric ? 'numeric' : 'text'}
      maxLength={maxLength}
      helperText={helperText}
    />
  );
  const select = (key: string, label: string) => (
    <View key={key} style={{ marginHorizontal: -24 }}>
      <BaselineDropdownField
        label={label}
        value={values[key] || ''}
        options={[{ value: values[key] || '', label: values[key] || '' }]}
        onChange={v => onChange(key, v)}
        fillWidth
        onOpen={() => onSelect(key)}
      />
    </View>
  );
  return (
    <View style={s.summary}>
      <BaselineSectionDivider title="ADRESA DE DOMICILIU" width={327} />
      <SummaryRows rows={HOME_ADDRESS} />
      {field('postal', 'Cod Postal', true, 6)}
      {field('poBox', 'PO BOX (opțional)', true, 35, 'Maximum 35 de cifre')}
      <View style={s.consent}>
        <Text style={[s.small, s.grow]}>
          Resedinta si adresa de corespondenta sunt identice cu adresa de
          domiciliu
        </Text>
        <ToggleButton
          checked={sameAddress}
          onToggle={onToggle}
          ariaLabel="Resedinta si adresa de corespondenta sunt identice cu adresa de domiciliu"
        />
      </View>
      {!sameAddress && reviewed ? (
        <>
          <BaselineSectionDivider
            title={
              values.correspondence === 'residence'
                ? 'ADRESA DE REȘEDINȚĂ ȘI CORESPONDENȚĂ'
                : 'ADRESA DE REȘEDINȚĂ'
            }
            width={327}
          />
          <SummaryRows
            rows={[
              ['JUDEȚ | SECTOR', values.residenceCounty || ''],
              ['ORAȘ', values.residenceCity || ''],
              [
                'STRADA | NUMĂR',
                `${values.residenceStreet || ''} | ${values.residenceNumber || ''}`,
              ],
              ['BLOC', values.residenceBlock || ''],
              ['SCARĂ', values.residenceStair || ''],
              ['ETAJ', values.residenceFloor || ''],
              ['APARTAMENT', values.residenceApartment || ''],
              ['COD POSTAL', values.residencePostal || ''],
            ]}
          />
          {field(
            'residencePoBox',
            'PO BOX (opțional)',
            true,
            35,
            'Maximum 35 de cifre',
          )}
          {values.correspondence === 'home' && (
            <>
              <BaselineSectionDivider
                title="ADRESA DE CORESPONDENȚĂ"
                width={327}
              />
              <SummaryRows rows={HOME_ADDRESS} />
            </>
          )}
          <BaselineNavigationLink text="Modifică adresele" onPress={onEdit} />
        </>
      ) : (
        !sameAddress && (
          <>
            <BaselineSectionDivider title="ADRESA DE RESEDINTA" width={327} />
            {select('residenceCounty', 'Județ | Sector')}
            {select('residenceCity', 'Oraș')}
            {field('residenceStreet', 'Strada')}
            {field('residenceNumber', 'Număr')}
            {field('residenceBlock', 'Bloc')}
            {field('residenceStair', 'Scară')}
            {field('residenceFloor', 'Etaj')}
            {field('residenceApartment', 'Apartament')}
            {field('residencePostal', 'Cod Postal', true, 6)}
            {field(
              'residencePoBox',
              'PO BOX (opțional)',
              true,
              35,
              'Maximum 35 de cifre',
            )}
            <BaselineSectionDivider
              title="ADRESA DE CORESPONDENȚĂ"
              width={327}
            />
            <View style={{ marginHorizontal: -24 }}>
              <BaselineDropdownField
                label="ADRESA ESTE SIMILARĂ CU"
                value={values.correspondence || ''}
                options={[
                  { value: 'home', label: 'Adresa de domiciliu' },
                  { value: 'residence', label: 'Adresa de reședință' },
                ]}
                onChange={v => onChange('correspondence', v)}
                helperText="Selecteaza una dintre valorile disponibile"
                fillWidth
                onOpen={() => onSelect('correspondence')}
              />
            </View>
          </>
        )
      )}
    </View>
  );
}
const s = StyleSheet.create({
  grow: { flex: 1 },
  consentPage: { gap: 24 },
  rows: { gap: 48, paddingTop: 24, paddingBottom: 24 },
  selfieRows: { gap: 24 },
  instruction: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  label: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  small: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  rule: { height: 1, backgroundColor: sourceColor('var(--uc-text-muted)') },
  consent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  guidelines: { gap: 48 },
  phone: { width: 100, height: 190, alignSelf: 'center', marginBottom: 0 },
  phoneArt: {
    position: 'absolute',
    left: -45,
    top: 45,
    transform: [{ rotate: '-90deg' }],
  },
  guideId: {
    position: 'absolute',
    left: 4,
    top: 62,
    width: 92,
    height: 64,
    transform: [{ rotate: '90deg' }],
  },
  guideBorder: {
    position: 'absolute',
    borderColor: sourceColor('var(--uc-action)'),
    borderWidth: 2,
    borderRadius: 6,
    left: 12,
    top: 43,
    width: 76,
    height: 108,
  },
  summary: { gap: 24 },
  summaryGroup: { gap: 24 },
  summaryRows: { gap: 24 },
  summaryRow: { gap: 4 },
  capturePage: { flex: 1, marginHorizontal: -24 },
  captureHeading: {
    minHeight: 114,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  captureTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: sourceColor('var(--uc-text)'),
  },
  camera: { height: 442, alignItems: 'center', justifyContent: 'center' },
  desk: { position: 'absolute', width: '100%', height: '100%' },
  reviewFrame: {
    width: 215,
    height: 307,
    borderWidth: 5,
    borderColor: sourceColor('var(--uc-action)'),
    borderRadius: 15,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewId: {
    width: 297,
    maxWidth: 297,
    height: 205,
    transform: [{ rotate: '90deg' }],
  },
});
