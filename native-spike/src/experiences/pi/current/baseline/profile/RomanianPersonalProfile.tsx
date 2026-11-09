import React, { useState, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { CurrentScreenProps } from '../../contracts';
import {
  getRomanianProfileSnapshot,
  subscribeRomanianProfile,
  updateRomanianProfileAddress,
  updateRomanianProfileContact,
  validateRomanianProfileAddress,
  validateRomanianProfileContact,
  submitRomanianIdentityUpdate,
  type RomanianProfileAddress,
} from '@/features/profile/roPersonalProfile';
import contactsIllustration from '@/assets/design-system/compositions/variant-1518-3435-1.svg';
// Canonical vector from RO - DBN - Flows, node 10306:62188.
import identityScanIllustration from '@/assets/pi/ro/personal-profile/identity-scan.svg';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { BaselineCodeField } from '../../../../../universal/BaselineCodeField';
import { BaselineStandardSuccess } from '../../../../../universal/BaselineStandardSuccess';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { sourceColor } from '../../../../../universal/sourceColor';
import { Button, Copy, Page, useCurrentTokens } from '../../profile/Primitives';
import { SourceTextField } from '../../profile/SourceTextField';

type Screen =
  | 'overview'
  | 'contact-intro'
  | 'contact-edit'
  | 'contact-verify'
  | 'address-intro'
  | 'address-edit'
  | 'address-verify'
  | 'identity-intro'
  | 'identity-scan'
  | 'success';
type ContactKind = 'phone' | 'email';
type AddressKind = 'residenceAddress' | 'correspondenceAddress';

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dataRow}>
      <Copy strong size={16} lineHeight={19}>
        {label}
      </Copy>
      <Copy size={16} lineHeight={20}>
        {value}
      </Copy>
    </View>
  );
}

function EditLink({
  label,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const tokens = useCurrentTokens();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.editLink}
    >
      <Copy strong color={tokens.accent} size={16}>
        {label}
      </Copy>
    </Pressable>
  );
}

function ConsentToggle({
  checked,
  onPress,
  label,
  title,
  body,
}: {
  checked: boolean;
  onPress: () => void;
  label: string;
  title: string;
  body: string;
}) {
  const tokens = useCurrentTokens();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={styles.consent}
    >
      <View style={styles.consentCopy}>
        <Copy strong size={13}>
          {title}
        </Copy>
        <Copy size={14} lineHeight={18}>
          {body}
        </Copy>
      </View>
      {/* Canonical Design System toggle; the row owns the press and the accessible name. */}
      <View
        pointerEvents="none"
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <ToggleButton
          checked={checked}
          dark={tokens.text.toLowerCase() !== '#262626'}
        />
      </View>
    </Pressable>
  );
}

function addressLabel(address: RomanianProfileAddress) {
  return `${address.street} ${address.number}, bl ${address.building}, sc ${address.stair}, et${address.floor}, ap ${address.apartment}, ${address.sector}, ${address.city}, ${address.postalCode}`;
}

function accordionChevron(open: boolean, color: string) {
  return (
    <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
      <SourceCustomIcon name="chevron-down-wide" size={24} color={color} />
    </View>
  );
}

export function RomanianPersonalProfile(host: CurrentScreenProps) {
  const tokens = useCurrentTokens();
  const dark = tokens.text.toLowerCase() !== '#262626';
  const profile = useSyncExternalStore(
    subscribeRomanianProfile,
    getRomanianProfileSnapshot,
  );
  const [screen, setScreen] = useState<Screen>('overview');
  const [personalOpen, setPersonalOpen] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [consented, setConsented] = useState(false);
  const [contactKind, setContactKind] = useState<ContactKind>('phone');
  const [contactValue, setContactValue] = useState(profile.phone);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successKind, setSuccessKind] = useState<
    'contact' | 'address' | 'identity'
  >('contact');
  const [documentCaptured, setDocumentCaptured] = useState(false);
  const [addressKind, setAddressKind] =
    useState<AddressKind>('residenceAddress');
  const [sameAsHome, setSameAsHome] = useState(true);
  const [address, setAddress] = useState<RomanianProfileAddress>(
    profile.residenceAddress,
  );

  const copy = (english: string, romanian: string) =>
    host.language === 'ro' ? romanian : english;
  const formattedHome = addressLabel(profile.homeAddress);
  const back = () => {
    setError('');
    if (screen === 'overview') return host.onBack();
    if (screen === 'contact-edit') return setScreen('contact-intro');
    if (screen === 'contact-verify') return setScreen('contact-edit');
    if (screen === 'address-edit') return setScreen('address-intro');
    if (screen === 'address-verify') return setScreen('address-edit');
    if (screen === 'identity-scan') return setScreen('identity-intro');
    if (screen === 'success') return setScreen('overview');
    return setScreen('overview');
  };
  const openContact = () => {
    setContactKind('phone');
    setContactValue(profile.phone);
    setConsented(false);
    setError('');
    setScreen('contact-intro');
  };
  const openAddresses = () => {
    setAddressKind('residenceAddress');
    setAddress(profile.residenceAddress);
    setSameAsHome(true);
    setConsented(false);
    setError('');
    setScreen('address-intro');
  };
  const openIdentity = () => {
    setConsented(false);
    setDocumentCaptured(false);
    setError('');
    setScreen('identity-intro');
  };
  const changeContact = (kind: ContactKind) => {
    setContactKind(kind);
    setContactValue(kind === 'phone' ? profile.phone : profile.email);
    setOtp('');
    setError('');
  };
  const updateAddressField = (
    key: keyof RomanianProfileAddress,
    value: string,
  ) => setAddress(current => ({ ...current, [key]: value }));
  const continueContact = () => {
    if (!validateRomanianProfileContact(contactKind, contactValue)) {
      setError(
        contactKind === 'phone'
          ? copy(
              'Enter a valid Romanian mobile number.',
              'Introdu un număr de telefon valid.',
            )
          : copy(
              'Enter a valid email address.',
              'Introdu o adresă de e-mail validă.',
            ),
      );
      return;
    }
    setOtp('');
    setError('');
    setScreen('contact-verify');
  };
  const verifyContact = () => {
    if (!updateRomanianProfileContact(contactKind, contactValue, otp)) {
      setError(
        copy(
          'The verification code is not valid.',
          'Codul de verificare nu este valid.',
        ),
      );
      return;
    }
    host.onChanged();
    setSuccessKind('contact');
    setError('');
    setScreen('success');
  };
  const continueAddress = () => {
    const nextAddress = sameAsHome ? profile.homeAddress : address;
    if (!validateRomanianProfileAddress(nextAddress)) {
      setError(
        copy(
          'Complete the required address fields and enter a six digit postal code.',
          'Completează adresa și codul poștal din 6 cifre.',
        ),
      );
      return;
    }
    setAddress(nextAddress);
    setOtp('');
    setError('');
    setScreen('address-verify');
  };
  const verifyAddress = () => {
    if (!updateRomanianProfileAddress(addressKind, address, otp)) {
      setError(
        copy(
          'The verification code is not valid.',
          'Codul de verificare nu este valid.',
        ),
      );
      return;
    }
    host.onChanged();
    setSuccessKind('address');
    setError('');
    setScreen('success');
  };
  const title = screen === 'overview' ? copy('My data', 'Datele mele') : '';
  const footer = (label: string, onPress: () => void, disabled = false) => (
    <View style={styles.footer}>
      <Button label={label} onPress={onPress} disabled={disabled} />
      <View style={styles.homeIndicator} />
    </View>
  );
  const agreement = (
    <ConsentToggle
      checked={consented}
      onPress={() => setConsented(value => !value)}
      label="I agree that my personal data will be managed and updated by UniCredit Bank."
      title={copy('PERSONAL DATA CONSENT', 'ACORD DATE PERSONALE')}
      body={copy(
        'I agree that my personal data will be managed and updated by UniCredit Bank.',
        'Sunt de acord ca datele mele să fie gestionate și actualizate de UniCredit Bank.',
      )}
    />
  );

  if (screen === 'success')
    return (
      <BaselineStandardSuccess
        testID="ro-personal-profile-success"
        title={
          successKind === 'identity'
            ? copy(
                'Your document was sent for review',
                'Documentul a fost trimis spre verificare',
              )
            : copy('Your data has been updated', 'Datele au fost actualizate')
        }
        message={copy(
          'You can review your updated information in My data.',
          'Poți verifica informațiile actualizate în Datele mele.',
        )}
        actionLabel={copy('Back to My data', 'Înapoi la datele mele')}
        onDone={() => setScreen('overview')}
        dark={dark}
      />
    );

  return (
    <Page
      title={title}
      onBack={back}
      topInset={host.screenTopInset}
      active={host.isActive}
      largeTitle={screen === 'overview'}
      footer={
        screen === 'contact-intro' ||
        screen === 'address-intro' ||
        screen === 'identity-intro' ? (
          <View>
            {agreement}
            {footer(
              copy('Start', 'Începe'),
              () => {
                if (!consented) return;
                setError('');
                setScreen(
                  screen === 'contact-intro'
                    ? 'contact-edit'
                    : screen === 'address-intro'
                      ? 'address-edit'
                      : 'identity-scan',
                );
              },
              !consented,
            )}
          </View>
        ) : screen === 'contact-edit' ? (
          footer(copy('Continue', 'Continuă'), continueContact)
        ) : screen === 'contact-verify' ? (
          footer(copy('Verify', 'Verifică'), verifyContact)
        ) : screen === 'address-edit' ? (
          footer(copy('Continue', 'Continuă'), continueAddress)
        ) : screen === 'address-verify' ? (
          footer(copy('Verify', 'Verifică'), verifyAddress)
        ) : screen === 'identity-scan' ? (
          footer(
            copy('Send for review', 'Trimite spre verificare'),
            () => {
              if (submitRomanianIdentityUpdate(consented)) {
                host.onChanged();
                setSuccessKind('identity');
                setScreen('success');
              }
            },
            !documentCaptured,
          )
        ) : undefined
      }
    >
      {screen === 'overview' ? (
        <View style={styles.content}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy('Personal data', 'Date personale')}
            accessibilityState={{ expanded: personalOpen }}
            onPress={() => setPersonalOpen(value => !value)}
            style={styles.accordionHeader}
          >
            <SourceCustomIcon
              name="header-profile"
              size={24}
              color={tokens.text}
            />
            <Copy strong size={18}>
              {copy('Personal data', 'Date personale')}
            </Copy>
            <View style={styles.grow} />
            {accordionChevron(personalOpen, tokens.text)}
          </Pressable>
          {personalOpen ? (
            <View style={styles.accordionBody}>
              <DataRow
                label={copy('First and Last name', 'Nume și prenume')}
                value={`${profile.firstName} ${profile.lastName}`}
              />
              <DataRow
                label={copy('Document type', 'Tipul documentului')}
                value={profile.documentType}
              />
              <DataRow
                label={copy('Series and number', 'Serie și număr')}
                value={profile.documentNumber}
              />
              <DataRow
                label={copy(
                  'Document expiry date',
                  'Data expirării documentului',
                )}
                value={profile.documentExpiry}
              />
              <DataRow
                label={copy('Issued by', 'Eliberat de')}
                value={profile.issuedBy}
              />
              <DataRow
                label={copy('Citizenship', 'Cetățenie')}
                value={profile.citizenship}
              />
              <DataRow
                label={copy('Home address', 'Adresa de domiciliu')}
                value={formattedHome}
              />
              <EditLink
                label={copy('Edit data', 'Modifică datele')}
                accessibilityLabel="Edit personal data"
                onPress={openIdentity}
              />
            </View>
          ) : null}
          <View style={[styles.divider, { borderColor: tokens.border }]} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy('Contact data', 'Date de contact')}
            accessibilityState={{ expanded: contactOpen }}
            onPress={() => setContactOpen(value => !value)}
            style={styles.accordionHeader}
          >
            <SourceCustomIcon
              name="header-messages"
              size={24}
              color={tokens.text}
            />
            <Copy strong size={18}>
              {copy('Contact data', 'Date de contact')}
            </Copy>
            <View style={styles.grow} />
            {accordionChevron(contactOpen, tokens.text)}
          </Pressable>
          {contactOpen ? (
            <View style={styles.accordionBody}>
              <Copy strong size={14} color={tokens.muted}>
                {copy('Contact info', 'Informații de contact')}
              </Copy>
              {profile.verifiedEmail ? null : (
                <Copy size={14} color={sourceColor('var(--uc-red-main)')}>
                  {copy(
                    'Your email address is not verified',
                    'Adresa de e-mail nu este verificată',
                  )}
                </Copy>
              )}
              <DataRow
                label={copy('Phone number', 'Număr de telefon')}
                value={profile.phone}
              />
              <DataRow
                label={copy('Email address', 'Adresă de e-mail')}
                value={profile.email}
              />
              <EditLink
                label={copy('Edit data', 'Modifică datele')}
                accessibilityLabel="Edit contact data"
                onPress={openContact}
              />
              <Copy strong size={14} color={tokens.muted}>
                {copy('Addresses info', 'Informații despre adrese')}
              </Copy>
              <DataRow
                label={copy('Home address', 'Adresa de domiciliu')}
                value={formattedHome}
              />
              <DataRow
                label={copy('Residence address', 'Adresa de reședință')}
                value={addressLabel(profile.residenceAddress)}
              />
              <DataRow
                label={copy(
                  'Correspondence address',
                  'Adresa de corespondență',
                )}
                value={addressLabel(profile.correspondenceAddress)}
              />
              <EditLink
                label={copy('Edit data', 'Modifică datele')}
                accessibilityLabel="Edit addresses"
                onPress={openAddresses}
              />
            </View>
          ) : null}
          <View style={[styles.divider, { borderColor: tokens.border }]} />
        </View>
      ) : screen === 'contact-intro' ||
        screen === 'address-intro' ||
        screen === 'identity-intro' ? (
        <View style={styles.intro}>
          <View style={styles.illustration}>
            <AssetGlyph
              asset={
                screen === 'identity-intro'
                  ? identityScanIllustration
                  : contactsIllustration
              }
              size={100}
              tintColor={
                screen === 'identity-intro' ? undefined : tokens.text
              }
            />
          </View>
          <Copy strong size={28} lineHeight={32} textAlign="center">
            {screen === 'contact-intro'
              ? copy('Update contact details', 'Actualizează datele de contact')
              : screen === 'address-intro'
                ? copy('Update addresses', 'Modifică adresele')
                : copy(
                    'Scan your identity document',
                    'Scanează actul de identitate',
                  )}
          </Copy>
          <Copy size={18} lineHeight={24} textAlign="center">
            {screen === 'contact-intro'
              ? copy(
                  'Using your phone number or email address requires a verification code sent to the new contact.',
                  'Utilizarea numărului de telefon sau a adresei de e-mail necesită validarea cu un cod trimis la noul contact.',
                )
              : screen === 'address-intro'
                ? copy(
                    'Change your residence or correspondence address and verify the request with a PIN or biometric data.',
                    'Modifică adresa de reședință sau de corespondență și validează solicitarea cu un cod PIN sau date biometrice.',
                  )
                : copy(
                    'Take a photo of your identity document. The Bank will review it and update your details.',
                    'Fotografiază documentul de identitate. Banca îl va analiza și va actualiza datele.',
                  )}
          </Copy>
        </View>
      ) : screen === 'contact-edit' ? (
        <View style={styles.content}>
          <View style={styles.tabs}>
            {(['phone', 'email'] as const).map(kind => (
              <Pressable
                key={kind}
                accessibilityRole="tab"
                accessibilityLabel={
                  kind === 'phone' ? 'Phone number' : 'Email address'
                }
                accessibilityState={{ selected: contactKind === kind }}
                onPress={() => changeContact(kind)}
                style={[styles.tab, contactKind === kind && styles.activeTab]}
              >
                <Copy
                  strong
                  size={14}
                  color={contactKind === kind ? tokens.accent : tokens.muted}
                >
                  {kind === 'phone'
                    ? copy('PHONE NUMBER', 'NUMĂR DE TELEFON')
                    : copy('EMAIL', 'E-MAIL')}
                </Copy>
              </Pressable>
            ))}
          </View>
          {contactKind === 'phone' ? (
            <SourceTextField
              label={copy('Phone number', 'Număr de telefon')}
              value={contactValue}
              onChange={setContactValue}
              inputProps={{
                accessibilityLabel: 'Phone number',
                keyboardType: 'phone-pad',
                maxLength: 16,
              }}
            />
          ) : (
            <SourceTextField
              label={copy('Email address', 'Adresă de e-mail')}
              value={contactValue}
              onChange={setContactValue}
              inputProps={{
                accessibilityLabel: 'Email address',
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              }}
            />
          )}
          <Copy size={14} lineHeight={18} color={tokens.muted}>
            {contactKind === 'phone'
              ? copy(
                  'We will send an SMS with a verification code to this number.',
                  'Îți vom trimite un SMS cu un cod de verificare la acest număr.',
                )
              : copy(
                  'We will send an email with a verification code to this address.',
                  'Îți vom trimite un e-mail cu un cod de verificare la această adresă.',
                )}
          </Copy>
          {error ? (
            <Copy size={14} color={sourceColor('var(--uc-red-main)')}>
              {error}
            </Copy>
          ) : null}
        </View>
      ) : screen === 'contact-verify' ? (
        <View style={styles.content}>
          <View style={styles.tabs}>
            {(['phone', 'email'] as const).map(kind => (
              <View
                key={kind}
                style={[styles.tab, contactKind === kind && styles.activeTab]}
              >
                <Copy
                  strong
                  size={14}
                  color={contactKind === kind ? tokens.accent : tokens.muted}
                >
                  {kind === 'phone'
                    ? copy('PHONE NUMBER', 'NUMĂR DE TELEFON')
                    : 'E-MAIL'}
                </Copy>
              </View>
            ))}
          </View>
          <Copy strong size={18}>
            {copy('Verification code', 'Cod de verificare')}
          </Copy>
          <Copy size={16} lineHeight={22}>
            {contactKind === 'phone'
              ? copy(
                  `We sent a verification code by SMS to ${contactValue}.`,
                  `Am trimis un cod prin SMS la ${contactValue}.`,
                )
              : copy(
                  `We sent a verification code to ${contactValue}.`,
                  `Am trimis un cod de verificare la ${contactValue}.`,
                )}
          </Copy>
          <BaselineCodeField
            value={otp}
            onChange={setOtp}
            length={6}
            ariaLabel="Verification code"
            visualState={error ? 'error' : undefined}
            errorText={error || undefined}
            dark={dark}
          />
          <EditLink
            label={copy('Resend code', 'Retrimite codul')}
            accessibilityLabel="Resend code"
            onPress={() => setOtp('')}
          />
        </View>
      ) : screen === 'address-edit' ? (
        <View style={styles.content}>
          <View style={styles.tabs}>
            {(['residenceAddress', 'correspondenceAddress'] as const).map(
              kind => (
                <Pressable
                  key={kind}
                  accessibilityRole="tab"
                  accessibilityLabel={
                    kind === 'residenceAddress' ? 'Residence' : 'Correspondence'
                  }
                  accessibilityState={{ selected: addressKind === kind }}
                  onPress={() => {
                    setAddressKind(kind);
                    setAddress(profile[kind]);
                    setSameAsHome(
                      kind === 'correspondenceAddress' &&
                        addressLabel(profile[kind]) === formattedHome,
                    );
                    setError('');
                  }}
                  style={[styles.tab, addressKind === kind && styles.activeTab]}
                >
                  <Copy
                    strong
                    size={14}
                    color={addressKind === kind ? tokens.accent : tokens.muted}
                  >
                    {kind === 'residenceAddress'
                      ? copy('RESIDENCE', 'REȘEDINȚĂ')
                      : copy('CORRESPONDENCE', 'CORESPONDENȚĂ')}
                  </Copy>
                </Pressable>
              ),
            )}
          </View>
          <Copy strong size={14} color={tokens.muted}>
            {copy('My address is the same as:', 'Adresa mea este aceeași cu:')}
          </Copy>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel="Same as home address"
            accessibilityState={{ checked: sameAsHome }}
            onPress={() => setSameAsHome(value => !value)}
            style={styles.choice}
          >
            <View
              style={[
                styles.radio,
                sameAsHome && { borderColor: tokens.accent },
              ]}
            >
              {sameAsHome ? (
                <View
                  style={[styles.radioDot, { backgroundColor: tokens.accent }]}
                />
              ) : null}
            </View>
            <View style={styles.grow}>
              <Copy strong size={14}>
                {copy('HOME ADDRESS', 'ADRESA DE DOMICILIU')}
              </Copy>
              <Copy size={14} lineHeight={18}>
                {formattedHome}
              </Copy>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select a new address"
            onPress={() => {
              setSameAsHome(false);
              setError('');
            }}
            style={styles.newAddress}
          >
            <Copy strong color={tokens.accent} size={14}>
              {copy('SELECT A NEW ADDRESS', 'SELECTEAZĂ O ADRESĂ NOUĂ')}
            </Copy>
          </Pressable>
          {!sameAsHome ? (
            <View style={styles.addressFields}>
              {(
                [
                  ['country', copy('Country', 'Țara')],
                  ['sector', copy('County / Sector', 'Județ / Sector')],
                  ['city', copy('City', 'Localitate / Oraș')],
                  ['street', copy('Street name', 'Numele străzii')],
                  ['number', copy('Street number', 'Numărul străzii')],
                  ['building', copy('Building', 'Bloc')],
                  ['stair', copy('Staircase', 'Scara')],
                  ['floor', copy('Floor', 'Etaj')],
                  ['apartment', copy('Apartment', 'Apartament')],
                  ['postalCode', copy('Postal code', 'Cod poștal')],
                ] as const
              ).map(([key, label]) => (
                <SourceTextField
                  key={key}
                  label={label}
                  value={address[key]}
                  onChange={value => updateAddressField(key, value)}
                  inputProps={{ accessibilityLabel: label }}
                />
              ))}
            </View>
          ) : null}
          {error ? (
            <Copy size={14} color={sourceColor('var(--uc-red-main)')}>
              {error}
            </Copy>
          ) : null}
        </View>
      ) : screen === 'address-verify' ? (
        <View style={styles.content}>
          <Copy strong size={18}>
            {copy('Confirm address change', 'Confirmă modificarea adresei')}
          </Copy>
          <Copy size={16} lineHeight={22}>
            {copy(
              'Enter your six digit demo code to confirm the request.',
              'Introdu codul demonstrativ din șase cifre pentru a confirma solicitarea.',
            )}
          </Copy>
          <BaselineCodeField
            value={otp}
            onChange={setOtp}
            length={6}
            ariaLabel="Verification code"
            visualState={error ? 'error' : undefined}
            errorText={error || undefined}
            dark={dark}
          />
        </View>
      ) : screen === 'identity-scan' ? (
        <View style={styles.intro}>
          <View style={styles.illustration}>
            <AssetGlyph asset={identityScanIllustration} size={100} />
          </View>
          <Copy strong size={28} lineHeight={32} textAlign="center">
            {copy(
              'Scan your identity document',
              'Scanează actul de identitate',
            )}
          </Copy>
          <Copy size={18} lineHeight={24} textAlign="center">
            {copy(
              'Take a clear photo of the front of your identity document. The Bank will review the request before updating your data.',
              'Fotografiază clar partea din față a actului de identitate. Banca va analiza solicitarea înainte de actualizarea datelor.',
            )}
          </Copy>
          <Button
            label={
              documentCaptured
                ? copy('Document captured', 'Document fotografiat')
                : copy('Capture document', 'Fotografiază documentul')
            }
            onPress={() => setDocumentCaptured(true)}
          />
          {profile.identityReviewPending ? (
            <Copy size={14}>
              {copy(
                'A document is already waiting for review.',
                'Un document este deja în curs de verificare.',
              )}
            </Copy>
          ) : null}
        </View>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 20 },
  grow: { flex: 1 },
  accordionHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  accordionBody: { gap: 20, paddingTop: 8, paddingBottom: 16 },
  dataRow: { gap: 4 },
  divider: { borderBottomWidth: 1 },
  editLink: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  intro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  illustration: {
    height: 100,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingTop: 12, paddingBottom: 0, gap: 8 },
  homeIndicator: {
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#262626',
    marginVertical: 12,
  },
  consent: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  consentCopy: { flex: 1, gap: 4 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d6d6d6',
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#007a91' },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  newAddress: { minHeight: 48, justifyContent: 'center' },
  addressFields: { gap: 18 },
});
