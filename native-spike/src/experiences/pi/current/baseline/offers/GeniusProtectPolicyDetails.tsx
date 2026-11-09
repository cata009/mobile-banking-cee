import React, { useState, useSyncExternalStore } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { CurrentScreenProps } from '../../contracts';
import {
  GENIUS_PROTECT_COVERAGE,
  GENIUS_PROTECT_MONTHLY_PREMIUM_CENTS,
  getGeniusProtectSnapshot,
  subscribeGeniusProtect,
} from '@/features/insurance/geniusProtect';
import allianzLogo from '@/assets/pi/ro/genius-protect/genius-protect-allianz-logo.svg';
import illnessIcon from '@/assets/pi/ro/genius-protect/genius-protect-coverage-illness.svg';
import accidentIcon from '@/assets/pi/ro/genius-protect/genius-protect-coverage-accident.svg';
import disabilityIcon from '@/assets/pi/ro/genius-protect/genius-protect-coverage-disability.svg';
import surgeryIcon from '@/assets/pi/ro/genius-protect/genius-protect-coverage-surgery.svg';
import websiteIcon from '@/assets/pi/ro/genius-protect/genius-protect-claim-website.svg';
import documentsIcon from '@/assets/pi/ro/genius-protect/genius-protect-documents.svg';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { BaselineAccountInfoField } from '../../../../../universal/BaselineAccountInfoField';
import { BaselineDetailToolbar } from '../../../../../universal/BaselineDetailToolbar';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { SourceBottomSheet } from '../../../../../universal/SourceBottomSheet';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

type CoverageId = (typeof GENIUS_PROTECT_COVERAGE)[number]['id'];

const coverageRows: readonly {
  id: CoverageId;
  title: { en: string; ro: string };
  description: { en: string; ro: string };
  icon: string | number;
}[] = [
  {
    id: 'illness-death',
    title: { en: 'DEATH DUE TO ILLNESS', ro: 'DECES DIN CAUZA UNEI BOLI' },
    description: {
      en: 'Financial protection for your family in case of death caused by illness.',
      ro: 'Protecție financiară pentru familia ta în cazul decesului cauzat de o boală.',
    },
    icon: illnessIcon,
  },
  {
    id: 'accidental-death',
    title: { en: 'DEATH DUE TO ACCIDENT', ro: 'DECES DIN CAUZA UNUI ACCIDENT' },
    description: {
      en: 'Higher financial support for beneficiaries in case of a fatal accident.',
      ro: 'Sprijin financiar suplimentar pentru beneficiari în cazul unui accident fatal.',
    },
    icon: accidentIcon,
  },
  {
    id: 'accidental-disability',
    title: {
      en: 'TOTAL PERMANENT DISABILITY (GROUP I)',
      ro: 'INVALIDITATE PERMANENTĂ TOTALĂ (GRADUL I)',
    },
    description: {
      en: 'Lump sum payment if an accident results in first-degree permanent disability.',
      ro: 'Plată unică dacă un accident provoacă invaliditate permanentă de gradul I.',
    },
    icon: disabilityIcon,
  },
  {
    id: 'accidental-surgery',
    title: { en: 'SURGICAL INTERVENTION', ro: 'INTERVENȚIE CHIRURGICALĂ' },
    description: {
      en: 'Lump sum payment for surgical procedures required as a result of an accident.',
      ro: 'Plată unică pentru intervenții chirurgicale necesare în urma unui accident.',
    },
    icon: surgeryIcon,
  },
];

export default function GeniusProtectPolicyDetails(host: CurrentScreenProps) {
  const dark = host.tokens.background === '#121212';
  const ink = sourceColor('var(--uc-text)', dark);
  const muted = sourceColor('var(--uc-text-muted)', dark);
  const surface = sourceColor('var(--uc-surface)', dark);
  const appBg = sourceColor('var(--uc-app-bg)', dark);
  const snapshot = useSyncExternalStore(
    subscribeGeniusProtect,
    getGeniusProtectSnapshot,
  );
  const [policyInfoOpen, setPolicyInfoOpen] = useState(false);
  const [infoProgress, setInfoProgress] = useState(0);
  const [detailsProgress, setDetailsProgress] = useState(0);
  const [selectedCoverage, setSelectedCoverage] = useState<
    (typeof coverageRows)[number] | null
  >(null);
  const policy = snapshot.policy;
  const copy = (en: string, ro: string) => (host.language === 'ro' ? ro : en);
  const coverageAmounts = new Map(
    GENIUS_PROTECT_COVERAGE.map(item => [item.id, item.sum]),
  );
  const monthlyPremium =
    (policy?.nextPremiumCents ?? GENIUS_PROTECT_MONTHLY_PREMIUM_CENTS) / 100;

  /* ── Bottom sheets (shared across tabs) ── */
  const coverageSheet = selectedCoverage ? (
    <SourceBottomSheet
      title={copy(selectedCoverage.title.en, selectedCoverage.title.ro)}
      onClose={() => setSelectedCoverage(null)}
      dark={dark}
      stickyHeader
      footer={
        <View style={styles.sheetFooter}>
          <PrimaryButton
            label={copy(
              'Contact Allianz-Țiriac',
              'Contactează Allianz-Țiriac',
            )}
            onPress={() => setSelectedCoverage(null)}
            dark={dark}
          />
        </View>
      }
    >
      <View style={styles.sheetBody}>
        <Text style={[styles.body, { color: ink }]}>
          {copy(
            selectedCoverage.description.en,
            selectedCoverage.description.ro,
          )}
        </Text>
        <Text style={[styles.amountInSheet, { color: ink }]}>
          {`${coverageAmounts.get(selectedCoverage.id)?.toLocaleString(host.language === 'ro' ? 'ro-RO' : 'en-US')} ${copy('RON insured amount', 'RON sumă asigurată')}`}
        </Text>
      </View>
    </SourceBottomSheet>
  ) : null;

  /* ── Missing policy ── */
  if (!policy) {
    return (
      <View style={[styles.page, { backgroundColor: surface }]}>
        <View style={{ backgroundColor: appBg }}>
          <BaselineDetailToolbar
            variant="account"
            title={copy('Insurances', 'Asigurări')}
            progress={1}
            onBack={host.onBack}
            safeAreaReserve={host.screenTopInset}
            dark={dark}
          />
        </View>
        <View style={styles.missingPolicy}>
          <Text style={[styles.body, { color: ink }]}>
            {copy(
              'No active Genius Protect policy is available.',
              'Nu există o poliță Genius Protect activă.',
            )}
          </Text>
          <PrimaryButton
            label={copy('Back to Home', 'Înapoi la Homepage')}
            onPress={() => host.onNavigate({ screen: 'home' })}
            dark={dark}
          />
        </View>
      </View>
    );
  }

  if (policyInfoOpen) {
    const monthlyPayment = new Intl.NumberFormat(
      host.language === 'ro' ? 'ro-RO' : 'en-US',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    ).format(monthlyPremium);
    const fields = [
      [
        copy('Insurance type', 'Tipul asigurării'),
        copy('Life insurance', 'Asigurare de viață'),
      ],
      [
        copy('Status', 'Status'),
        copy(
          policy.status === 'active' ? 'Active' : 'Inactive',
          policy.status === 'active' ? 'Activă' : 'Inactivă',
        ),
      ],
      [copy('Insurance name', 'Numele asigurării'), 'Genius Protect'],
      [copy('Policy number', 'Numărul poliței'), policy.number],
      [
        copy('Offered by', 'Oferită de'),
        copy('Allianz-Tiriac Asigurari', 'Allianz-Țiriac Asigurări'),
      ],
      [copy('Last payment date', 'Data ultimei plăți'), policy.lastPaymentDate],
      [copy('Monthly payment', 'Plată lunară'), `${monthlyPayment} RON`],
      [
        copy('Payment account', 'Contul de plată'),
        snapshot.draft?.accountId ?? '1234567890123456',
      ],
    ] as const;

    return (
      <View style={[styles.page, { backgroundColor: surface }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          scrollEventThrottle={16}
          onScroll={event =>
            setInfoProgress(
              Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
            )
          }
          style={Platform.OS === 'web' ? styles.webScroll : undefined}
          contentContainerStyle={styles.infoScrollContent}
        >
          <BaselinePageHeader
            title={copy('Insurance details', 'Detalii asigurare')}
            onBack={() => setPolicyInfoOpen(false)}
            showHelp={false}
            renderLargeTitle={false}
            includeSafeArea
            safeAreaReserve={host.screenTopInset}
            collapsedTitleProgress={infoProgress}
            dark={dark}
          />
          <View style={[styles.infoTitleFrame, { opacity: 1 - infoProgress }]}>
            <Text
              accessibilityRole="header"
              style={[styles.infoTitle, { color: ink }]}
            >
              {copy('Insurance details', 'Detalii asigurare')}
            </Text>
          </View>
          <View style={styles.infoFields}>
            {fields.map(([title, subtitle]) => (
              <BaselineAccountInfoField
                key={title}
                title={title}
                subtitle={subtitle}
                uppercaseTitle={false}
                subtitleFontSize={18}
                dark={dark}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: surface }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        scrollEventThrottle={16}
        onScroll={event =>
          setDetailsProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
          )
        }
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        contentContainerStyle={styles.scrollContent}
      >
        <BaselineDetailToolbar
          variant="account"
          title={copy('Insurances', 'Asigurări')}
          progress={detailsProgress}
          onBack={host.onBack}
          safeAreaReserve={host.screenTopInset}
          dark={dark}
        />

        <View style={{ backgroundColor: appBg }}>
          <View
            style={[styles.titleFrame, { opacity: 1 - detailsProgress * 0.9 }]}
          >
            <Text
              accessibilityRole="header"
              style={[styles.largeTitle, { color: ink }]}
            >
              {copy('Insurances', 'Asigurări')}
            </Text>
          </View>

          <View
            style={[
              styles.policyCard,
              {
                backgroundColor: surface,
                shadowColor: '#000000',
                boxShadow:
                  Platform.OS === 'web'
                    ? '0 12px 16px rgba(0,0,0,.18)'
                    : undefined,
              },
            ]}
          >
            <View style={styles.policyIdentity}>
              <View style={styles.identityCopy}>
                <Text style={[styles.policyTitle, { color: ink }]}>
                  Genius Protect
                </Text>
                <Text style={[styles.policyType, { color: ink }]}>
                  {copy(
                    'Life insurance policy',
                    'Poliță de asigurare de viață',
                  )}
                </Text>
                <Text style={[styles.policyNumber, { color: muted }]}>
                  {policy.number}
                </Text>
              </View>
              <AssetGlyph asset={allianzLogo} width={87} height={16} />
            </View>
            <View style={[styles.cardDivider, { backgroundColor: muted }]} />
            <View style={styles.paymentRow}>
              <Text style={[styles.cardMeta, { color: muted }]}>
                {copy('Next premium', 'Următoarea primă')}
              </Text>
              <Text style={[styles.cardMetaStrong, { color: ink }]}>
                {`${monthlyPremium} ${copy('RON', 'RON')}`}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={[styles.cardMeta, { color: muted }]}>
                {copy('Last payment date', 'Data ultimei plăți')}
              </Text>
              <Text style={[styles.cardMeta, { color: muted }]}>
                {policy.lastPaymentDate}
              </Text>
            </View>
          </View>

          <View style={styles.actionBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy('Details', 'Detalii')}
              onPress={() => setPolicyInfoOpen(true)}
              style={styles.actionItem}
            >
              <View style={styles.actionIcon}>
                <SourceCustomIcon name="info-circle" size={24} color={ink} />
              </View>
              <Text style={[styles.actionLabel, { color: ink }]}>
                {copy('Details', 'Detalii')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy('Documents', 'Documente')}
              onPress={() => host.onNavigate({ screen: 'documents' })}
              style={styles.actionItem}
            >
              <View style={styles.actionIcon}>
                <AssetGlyph asset={documentsIcon} width={20} height={19} />
              </View>
              <Text style={[styles.actionLabel, { color: ink }]}>
                {copy('Documents', 'Documente')}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.detailsContent, { backgroundColor: surface }]}>
          <View style={styles.sectionDivider}>
            <BaselineSectionDivider
              title={copy('WHAT\u2019S INSURED', 'CE ESTE ASIGURAT')}
              variant="section"
              dark={dark}
            />
          </View>
          <Text style={[styles.intro, { color: ink }]}>
            {copy(
              'Select a benefit to view full conditions or to start a claim process.',
              'Selectează o acoperire pentru a vedea condițiile complete sau pentru a începe o notificare de daună.',
            )}
          </Text>
          <View style={styles.coverageList}>
            {coverageRows.map(row => (
              <BaselineNavigationRow
                key={row.id}
                title={copy(row.title.en, row.title.ro)}
                titleStyle={[styles.coverageTitle, { color: ink }]}
                descriptionStyle={[
                  styles.coverageDescription,
                  { color: muted },
                ]}
                description={copy(row.description.en, row.description.ro)}
                linkLabel={`${coverageAmounts
                  .get(row.id)
                  ?.toLocaleString(
                    host.language === 'ro' ? 'ro-RO' : 'en-US',
                  )} ${copy('RON', 'RON')}`}
                linkLabelStyle={[styles.coverageAmount, { color: ink }]}
                ariaLabel={copy(row.title.en, row.title.ro)}
                onPress={() => setSelectedCoverage(row)}
                trailingAccessory="chevron"
                chevronSize={32}
                leadingVisual={
                  <View style={styles.coverageIcon}>
                    <AssetGlyph
                      asset={row.icon}
                      size={row.id === 'accidental-death' ? 20 : 32}
                    />
                  </View>
                }
                style={styles.coverageRow}
                dark={dark}
              />
            ))}
          </View>
          <View style={styles.sectionDivider}>
            <BaselineSectionDivider
              title={copy('NOTIFY A CLAIM', 'NOTIFICĂ O DAUNĂ')}
              variant="section"
              dark={dark}
            />
          </View>
          <View style={styles.claimList}>
            <ClaimContact
              title={copy('ONLINE FORM', 'FORMULAR ONLINE')}
              linkLabel="NOTIFICARE.ALLIANZTIRIAC.RO"
              leadingVisual={
                <View style={styles.claimIcon}>
                  <AssetGlyph asset={websiteIcon} size={40} />
                </View>
              }
              href="https://notificare.allianztiriac.ro"
              dark={dark}
            />
            <ClaimContact
              title={copy(
                'SEND CLAIM VIA EMAIL',
                'TRIMITE NOTIFICAREA PRIN E-MAIL',
              )}
              linkLabel="INFO@ALLIANZTIRIAC.RO"
              leadingVisual={
                <View style={styles.claimIcon}>
                  <SourceCustomIcon
                    name="contact-email"
                    size={24}
                    color={ink}
                  />
                </View>
              }
              href="mailto:info@allianztiriac.ro"
              dark={dark}
            />
            <ClaimContact
              title={copy(
                'CALL ALLIANZ TIRIAC HELPLINE',
                'SUNĂ LA LINIA DE ASISTENȚĂ ALLIANZ-ȚIRIAC',
              )}
              description={copy(
                'We are available from Monday to Friday between 08:00 - 20:00',
                'Luni–vineri, între 08:00 și 20:00',
              )}
              linkLabel="021 20 19 100"
              linkLabelStyle={styles.phoneLink}
              leadingVisual={
                <View style={styles.claimIcon}>
                  <SourceCustomIcon
                    name="contact-phone"
                    size={24}
                    color={ink}
                  />
                </View>
              }
              href="tel:+40212019100"
              dark={dark}
            />
          </View>
        </View>
      </ScrollView>
      {coverageSheet}
    </View>
  );
}

function ClaimContact({
  title,
  description,
  linkLabel,
  linkLabelStyle,
  leadingVisual,
  href,
  dark,
}: {
  title: string;
  description?: string;
  linkLabel: string;
  linkLabelStyle?: React.ComponentProps<
    typeof BaselineNavigationRow
  >['linkLabelStyle'];
  leadingVisual: React.ReactNode;
  href: string;
  dark: boolean;
}) {
  return (
    <BaselineNavigationRow
      title={title}
      description={description}
      descriptionStyle={
        description
          ? [
              styles.phoneDescription,
              { color: sourceColor('var(--uc-text-muted)', dark) },
            ]
          : undefined
      }
      linkLabel={linkLabel}
      linkLabelStyle={linkLabelStyle}
      linkAccessibilityRole="link"
      leadingVisual={leadingVisual}
      onLinkPress={() => {
        void Linking.openURL(href).catch(() => undefined);
      }}
      ariaLabel={`${title} ${description ?? ''} ${linkLabel}`.trim()}
      dark={dark}
      style={description ? styles.multilineClaimRow : undefined}
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, minHeight: 0 },
  scrollContent: { paddingBottom: 0 },
  infoScrollContent: { paddingBottom: 0 },
  webScroll: { flex: 1, minHeight: 0, transform: 'none' },
  titleFrame: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeTitle: { fontFamily: 'UniCredit-bold', fontSize: 28, flexShrink: 1 },
  infoTitleFrame: { paddingHorizontal: 24, paddingVertical: 8 },
  infoTitle: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 32 },
  infoFields: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  policyCard: {
    alignSelf: 'center',
    width: '83%',
    maxWidth: 311,
    padding: 16,
    gap: 8,
    borderRadius: 6,
    elevation: 6,
  },
  policyIdentity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  identityCopy: { flex: 1, gap: 4, minWidth: 0 },
  policyTitle: { fontFamily: 'UniCredit-bold', fontSize: 20, lineHeight: 24 },
  policyType: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 20 },
  policyNumber: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 20 },
  cardDivider: { height: 1, opacity: 0.3 },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardMeta: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 18 },
  cardMetaStrong: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 18,
  },
  missingPolicy: { paddingHorizontal: 24, paddingTop: 24, gap: 16 },
  actionBar: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  actionItem: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionLabel: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 17,
  },
  phoneLink: { fontSize: 16 },
  actionIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 22 },
  sectionDivider: { paddingHorizontal: 24 },
  detailsContent: { gap: 16, paddingBottom: 24, marginTop: 32 },
  intro: {
    paddingHorizontal: 24,
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 22,
  },
  coverageList: { gap: 0 },
  coverageRow: {
    height: 'auto',
    minHeight: 112,
    paddingVertical: 16,
  },
  coverageIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverageTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 19,
    textTransform: 'uppercase',
  },
  coverageDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 19,
  },
  coverageAmount: {
    fontFamily: 'UniCredit-bold',
    fontSize: 20,
    lineHeight: 23,
    marginTop: 0,
  },
  phoneDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 19,
  },
  claimList: { gap: 0 },
  multilineClaimRow: {
    height: 'auto',
    minHeight: 142,
    paddingVertical: 24,
  },
  claimIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetFooter: { paddingHorizontal: 24, paddingTop: 8 },
  sheetBody: { paddingHorizontal: 24, paddingVertical: 16, gap: 16 },
  amountInSheet: { fontFamily: 'UniCredit-bold', fontSize: 18, lineHeight: 22 },
});
