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
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { BaselineSearchBar } from '../../../../../universal/BaselineSearchBar';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { SourceBottomSheet } from '../../../../../universal/SourceBottomSheet';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

type PolicyTab = 'details' | 'documents';
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

const policyDocuments = [
  {
    title: 'Policy_certificate_34314',
    date: '13',
    month: 'MAR',
    ro: 'Policy_certificate_34314',
    description:
      'Insurance certificate and policy terms for your active Genius Protect cover.',
    roDescription:
      'Certificatul de asigurare și condițiile poliței Genius Protect active.',
  },
  {
    title: 'Policy_contract_34314',
    date: '13',
    month: 'MAR',
    ro: 'Policy_contract_34314',
    description: 'Signed Genius Protect insurance contract and policy terms.',
    roDescription:
      'Contractul de asigurare Genius Protect semnat și condițiile poliței.',
  },
];

export default function GeniusProtectPolicyDetails(host: CurrentScreenProps) {
  const dark = host.tokens.background === '#121212';
  const ink = sourceColor('var(--uc-text)', dark);
  const muted = sourceColor('var(--uc-text-muted)', dark);
  const surface = sourceColor('var(--uc-surface)', dark);
  const snapshot = useSyncExternalStore(
    subscribeGeniusProtect,
    getGeniusProtectSnapshot,
  );
  const [tab, setTab] = useState<PolicyTab>('details');
  const [selectedCoverage, setSelectedCoverage] = useState<
    (typeof coverageRows)[number] | null
  >(null);
  const [selectedDocument, setSelectedDocument] = useState<
    (typeof policyDocuments)[number] | null
  >(null);
  const [documentSearch, setDocumentSearch] = useState('');
  const policy = snapshot.policy;
  const copy = (en: string, ro: string) => (host.language === 'ro' ? ro : en);
  const coverageAmounts = new Map(
    GENIUS_PROTECT_COVERAGE.map(item => [item.id, item.sum]),
  );
  const monthlyPremium =
    (policy?.nextPremiumCents ?? GENIUS_PROTECT_MONTHLY_PREMIUM_CENTS) / 100;

  return (
    <View style={[styles.page, { backgroundColor: surface }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.headerBlock,
            { backgroundColor: sourceColor('var(--uc-app-bg)', dark) },
          ]}
        >
          <BaselinePageHeader
            title=""
            onBack={() =>
              tab === 'documents' ? setTab('details') : host.onBack()
            }
            showHelp={false}
            renderLargeTitle={false}
            includeSafeArea
            safeAreaReserve={host.screenTopInset}
            dark={dark}
          />
          <Text
            accessibilityRole="header"
            style={[styles.pageTitle, { color: ink }]}
          >
            {tab === 'documents'
              ? copy('Documents', 'Documente')
              : copy('Insurances', 'Asigurări')}
          </Text>
          {policy && tab === 'details' ? (
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
          ) : (
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
          )}
          {policy && tab === 'details' ? (
            <View
              accessibilityRole="tablist"
              style={[styles.actionBar, { borderBottomColor: `${ink}26` }]}
            >
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel={copy('Details', 'Detalii')}
                accessibilityState={{ selected: tab === 'details' }}
                onPress={() => setTab('details')}
                style={styles.actionItem}
              >
                <SourceCustomIcon name="info-circle" size={28} color={ink} />
                <Text style={[styles.actionLabel, { color: ink }]}>
                  {copy('Details', 'Detalii')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel={copy('Documents', 'Documente')}
                accessibilityState={{ selected: false }}
                onPress={() => setTab('documents')}
                style={styles.actionItem}
              >
                <SourceCustomIcon
                  name="investment-documents"
                  size={28}
                  color={ink}
                />
                <Text style={[styles.actionLabel, { color: ink }]}>
                  {copy('Documents', 'Documente')}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {policy && tab === 'details' ? (
          <View style={styles.detailsContent}>
            <BaselineSectionDivider
              title={copy('WHAT’S INSURED', 'CE ESTE ASIGURAT')}
              variant="section"
              dark={dark}
            />
            <Text style={[styles.intro, { color: ink }]}>
              {copy(
                'Select a benefit to view full conditions or to start a claim process.',
                'Selectează o acoperire pentru a vedea condițiile complete sau pentru a începe o notificare de daună.',
              )}
            </Text>
            <View style={styles.coverageList}>
              {coverageRows.map(row => (
                <Pressable
                  key={row.id}
                  accessibilityRole="button"
                  accessibilityLabel={copy(row.title.en, row.title.ro)}
                  onPress={() => setSelectedCoverage(row)}
                  style={styles.coverageRow}
                >
                  <View style={styles.coverageIcon}>
                    <AssetGlyph asset={row.icon} size={32} />
                  </View>
                  <View style={styles.coverageCopy}>
                    <Text style={[styles.coverageTitle, { color: ink }]}>
                      {copy(row.title.en, row.title.ro)}
                    </Text>
                    <Text
                      style={[styles.coverageDescription, { color: muted }]}
                    >
                      {copy(row.description.en, row.description.ro)}
                    </Text>
                    <Text style={[styles.coverageAmount, { color: ink }]}>
                      {`${coverageAmounts.get(row.id)?.toLocaleString(host.language === 'ro' ? 'ro-RO' : 'en-US')} ${copy('RON', 'RON')}`}
                    </Text>
                  </View>
                  <SourceCustomIcon
                    name="chevron-right"
                    size={24}
                    color={ink}
                  />
                </Pressable>
              ))}
            </View>
            <BaselineSectionDivider
              title={copy('NOTIFY A CLAIM', 'NOTIFICĂ O DAUNĂ')}
              variant="section"
              dark={dark}
            />
            <View style={styles.claimList}>
              <ClaimContact
                title={copy('ONLINE FORM', 'FORMULAR ONLINE')}
                detail="NOTIFICARE.ALLIANZTIRIAC.RO"
                icon={<AssetGlyph asset={websiteIcon} size={24} />}
                href="https://notificare.allianztiriac.ro"
                dark={dark}
              />
              <ClaimContact
                title={copy(
                  'SEND CLAIM VIA EMAIL',
                  'TRIMITE NOTIFICAREA PRIN E-MAIL',
                )}
                detail="INFO@ALLIANZTIRIAC.RO"
                icon={
                  <SourceCustomIcon
                    name="contact-email"
                    size={24}
                    color={ink}
                  />
                }
                href="mailto:info@allianztiriac.ro"
                dark={dark}
              />
              <ClaimContact
                title={copy(
                  'CALL ALLIANZ TIRIAC HELPLINE',
                  'SUNĂ LA LINIA DE ASISTENȚĂ ALLIANZ-ȚIRIAC',
                )}
                detail={copy(
                  'We are available from Monday to Friday between 08:00 - 20:00\n021 20 19 100',
                  'Luni–vineri, între 08:00 și 20:00\n021 20 19 100',
                )}
                icon={
                  <SourceCustomIcon
                    name="contact-phone"
                    size={24}
                    color={ink}
                  />
                }
                href="tel:+40212019100"
                dark={dark}
              />
            </View>
          </View>
        ) : null}

        {policy && tab === 'documents' ? (
          <View style={styles.documentsContent}>
            <BaselineSearchBar
              value={documentSearch}
              placeholder={copy('Search', 'Caută')}
              accessibilityLabel={copy('Search documents', 'Caută documente')}
              fieldSurface="muted"
              onValueChange={setDocumentSearch}
              onClearClick={() => setDocumentSearch('')}
              dark={dark}
            />
            <BaselineSectionDivider
              title="2026"
              variant="section"
              dark={dark}
            />
            <View style={styles.documentList}>
              {policyDocuments
                .filter(document =>
                  document.title
                    .toLocaleLowerCase()
                    .includes(documentSearch.trim().toLocaleLowerCase()),
                )
                .map(document => (
                  <Pressable
                    key={document.title}
                    accessibilityRole="button"
                    accessibilityLabel={copy(document.title, document.ro)}
                    onPress={() => setSelectedDocument(document)}
                    style={[
                      styles.documentRow,
                      { borderBottomColor: `${ink}26` },
                    ]}
                  >
                    <View style={styles.documentDate}>
                      <Text style={[styles.documentDay, { color: ink }]}>
                        {document.date}
                      </Text>
                      <Text style={[styles.documentMonth, { color: muted }]}>
                        {document.month}
                      </Text>
                    </View>
                    <View style={styles.documentCopy}>
                      <Text style={[styles.documentTitle, { color: ink }]}>
                        {copy(document.title, document.ro)}
                      </Text>
                      <Text
                        style={[
                          styles.documentBadge,
                          { color: sourceColor('var(--uc-action)', dark) },
                        ]}
                      >
                        NEW
                      </Text>
                    </View>
                    <SourceCustomIcon
                      name="chevron-right"
                      size={24}
                      color={ink}
                    />
                  </Pressable>
                ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {selectedCoverage ? (
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
      ) : null}

      {selectedDocument ? (
        <SourceBottomSheet
          title={copy(selectedDocument.title, selectedDocument.ro)}
          onClose={() => setSelectedDocument(null)}
          dark={dark}
          stickyHeader
          footer={
            <View style={styles.sheetFooter}>
              <PrimaryButton
                label={copy('Close', 'Închide')}
                onPress={() => setSelectedDocument(null)}
                dark={dark}
              />
            </View>
          }
        >
          <View style={styles.sheetBody}>
            <Text style={[styles.body, { color: ink }]}>
              {copy(
                selectedDocument.description,
                selectedDocument.roDescription,
              )}
            </Text>
            <Text style={[styles.documentReference, { color: muted }]}>
              {`${copy('Policy number', 'Număr poliță')}: ${policy?.number ?? ''}`}
            </Text>
          </View>
        </SourceBottomSheet>
      ) : null}
    </View>
  );
}

function ClaimContact({
  title,
  detail,
  icon,
  href,
  dark,
}: {
  title: string;
  detail: string;
  icon: React.ReactNode;
  href: string;
  dark: boolean;
}) {
  const ink = sourceColor('var(--uc-text)', dark);
  const muted = sourceColor('var(--uc-text-muted)', dark);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${title} ${detail}`}
      onPress={() => {
        void Linking.openURL(href).catch(() => undefined);
      }}
      style={styles.claimRow}
    >
      <View style={styles.claimIcon}>{icon}</View>
      <View style={styles.coverageCopy}>
        <Text style={[styles.coverageTitle, { color: ink }]}>{title}</Text>
        <Text style={[styles.claimDetail, { color: muted }]}>{detail}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, minHeight: 0 },
  scrollContent: { paddingBottom: 32 },
  headerBlock: { gap: 16, paddingBottom: 16 },
  pageTitle: {
    paddingHorizontal: 24,
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 34,
  },
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
  missingPolicy: { paddingHorizontal: 24, gap: 16 },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  body: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 22 },
  detailsContent: { backgroundColor: '#FFFFFF', gap: 16, paddingBottom: 24 },
  documentsContent: {
    backgroundColor: '#FFFFFF',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  intro: {
    paddingHorizontal: 24,
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 22,
  },
  coverageList: { gap: 0 },
  coverageRow: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  coverageIcon: { width: 32, alignItems: 'center' },
  coverageCopy: { flex: 1, minWidth: 0, gap: 4 },
  coverageTitle: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 19 },
  coverageDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 19,
  },
  coverageAmount: {
    fontFamily: 'UniCredit-bold',
    fontSize: 20,
    lineHeight: 23,
  },
  claimList: { gap: 16, paddingHorizontal: 24 },
  claimRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  claimIcon: { width: 32, alignItems: 'center' },
  claimDetail: {
    marginTop: 4,
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 18,
  },
  documentList: { gap: 0 },
  documentRow: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  documentDate: { width: 36, alignItems: 'center', gap: 2 },
  documentDay: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 16 },
  documentMonth: { fontFamily: 'UniCredit-bold', fontSize: 12, lineHeight: 14 },
  documentCopy: { flex: 1, minWidth: 0, gap: 6 },
  documentTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
  },
  documentBadge: { fontFamily: 'UniCredit-bold', fontSize: 12, lineHeight: 14 },
  sheetFooter: { paddingHorizontal: 24, paddingTop: 8 },
  sheetBody: { paddingHorizontal: 24, paddingVertical: 16, gap: 16 },
  amountInSheet: { fontFamily: 'UniCredit-bold', fontSize: 18, lineHeight: 22 },
  documentReference: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 18,
  },
});
