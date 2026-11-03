import React, {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import type { CurrentScreenProps } from '../../contracts';
import {
  getRomanianProfileSnapshot,
  subscribeRomanianProfile,
} from '@/features/profile/roPersonalProfile';
import {
  GENIUS_PROTECT_COVERAGE,
  GENIUS_PROTECT_FREE_MONTHS,
  cancelGeniusProtectRequest,
  canContinueGeniusProtectContract,
  canContinueGeniusProtectNotices,
  canContinueGeniusProtectOverview,
  canContinueGeniusProtectPayment,
  canContinueGeniusProtectPersonalData,
  canContinueGeniusProtectPreContract,
  completeGeniusProtectRequest,
  geniusProtectChargeCentsForMonth,
  getGeniusProtectSnapshot,
  resolveGeniusProtectEntry,
  resolveGeniusProtectNeeds,
  startGeniusProtectRequest,
  subscribeGeniusProtect,
  updateGeniusProtectDraft,
  verifyGeniusProtectOtp,
  type GeniusProtectDraft,
  type GeniusProtectStep,
} from '@/features/insurance/geniusProtect';
import geniusProtectHero from '@/assets/pi/ro/genius-protect/genius-protect-hero.png';
import { BaselineCheckbox } from '../../../../../universal/BaselineCheckbox';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { RadioButton } from '../../../../../universal/RadioButton';
import { SourceBottomSheet } from '../../../../../universal/SourceBottomSheet';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { ProfileHost } from '../../profile/Host';
import { RasterImage } from './RasterImage';
import { sourceColor } from '../../../../../universal/sourceColor';

type FlowScreen =
  | 'product'
  | 'how-to'
  | 'personal-data'
  | 'notices'
  | 'needs-analysis'
  | 'payment-account'
  | 'pre-contract'
  | 'contract'
  | 'otp'
  | 'processing'
  | 'success'
  | 'resume'
  | 'active-policy'
  | 'no-account'
  | 'ineligible'
  | 'not-needed'
  | 'quit-reason'
  | 'expired-link';

type DocumentId =
  | 'eligibility'
  | 'active-policy'
  | 'payment'
  | 'withdrawal'
  | 'exclusions'
  | 'unicredit-notice'
  | 'allianz-notice'
  | 'trans-sped-notice'
  | 'debit-mandate'
  | 'insurance-offer'
  | 'trans-sped-documents'
  | 'insurance-contract'
  | 'contract-mandate'
  | 'contract-trans-sped';

type AccountOption = {
  id: string;
  name: string;
  number: string;
  balance: string;
};

const ACCOUNT_OPTIONS: readonly AccountOption[] = [
  {
    id: 'main-ron',
    name: 'Cont curent salariu',
    number: 'RO57BACX0000007913551234',
    balance: '150,44 RON',
  },
  {
    id: 'family-ron',
    name: 'Cont curent familie',
    number: 'RO57BACX0000007913551255',
    balance: '880,44 RON',
  },
];

const EXIT_REASONS = [
  { id: 'difficult', label: 'FLUXUL ÎMI PARE DIFICIL DE PARCURS' },
  { id: 'changed-mind', label: 'M-AM RĂZGÂNDIT' },
  { id: 'better-offer', label: 'AM GĂSIT O OFERTĂ MAI BUNĂ' },
  { id: 'no-time', label: 'NU AM TIMP ACUM' },
  { id: 'other', label: 'ALT MOTIV' },
] as const;

const INFO_CONTENT: Record<DocumentId, { en: string; ro: string }> = {
  eligibility: {
    en: 'You must be at least 18, have an active RON current account at UniCredit Bank, and not be registered with CNAS as a person with a disability. One active Genius Protect policy is allowed.',
    ro: 'Trebuie să ai minimum 18 ani, un cont curent activ în RON la UniCredit Bank și să nu fii înregistrat la CNAS ca persoană cu handicap. Poți deține o singură poliță Genius Protect activă.',
  },
  'active-policy': {
    en: 'To keep the insurance active, the monthly premium is collected automatically from the selected RON account. Make sure the account has enough available funds on the payment date.',
    ro: 'Pentru a păstra asigurarea activă, prima lunară se încasează automat din contul RON selectat. Asigură-te că ai fonduri suficiente la data plății.',
  },
  payment: {
    en: 'The monthly premium is collected automatically from your selected RON current account. If funds are not available, the insurance may end according to the policy terms.',
    ro: 'Prima lunară se debitează automat din contul curent RON selectat. Dacă nu există fonduri disponibile, asigurarea poate înceta conform condițiilor poliței.',
  },
  withdrawal: {
    en: 'You may withdraw from the online insurance agreement within 20 days without a fee. After that period, cancellation follows the insurance conditions.',
    ro: 'Te poți retrage din contractul de asigurare încheiat online în primele 20 de zile, fără costuri. După acest termen, încetarea urmează condițiile de asigurare.',
  },
  exclusions: {
    en: 'The insured events, exclusions, limits and claim requirements are set out in the Genius Protect insurance conditions. Read the full document before signing.',
    ro: 'Evenimentele asigurate, excluderile, limitele și condițiile de despăgubire sunt detaliate în Condițiile de asigurare Genius Protect. Citește documentul integral înainte de semnare.',
  },
  'unicredit-notice': {
    en: 'UniCredit Bank processes your information to intermediate the insurance product and to maintain the banking relationship connected to your request.',
    ro: 'UniCredit Bank prelucrează datele pentru intermedierea produsului de asigurare și pentru administrarea relației bancare aferente cererii.',
  },
  'allianz-notice': {
    en: 'Allianz-Țiriac processes the information required to assess, issue and administer the insurance policy.',
    ro: 'Allianz-Țiriac prelucrează informațiile necesare evaluării, emiterii și administrării poliței de asigurare.',
  },
  'trans-sped-notice': {
    en: 'Trans Sped processes the information required to issue and use the qualified electronic signature certificate.',
    ro: 'Trans Sped prelucrează informațiile necesare emiterii și folosirii certificatului de semnătură electronică calificată.',
  },
  'debit-mandate': {
    en: 'I authorize UniCredit Bank to debit the monthly Genius Protect premium from the selected RON current account.',
    ro: 'Autorizez UniCredit Bank să debiteze prima lunară Genius Protect din contul curent RON selectat.',
  },
  'insurance-offer': {
    en: 'Review the Genius Protect offer and its pre-contractual documents before accepting. The full policy documents will also be available in the app after issue.',
    ro: 'Citește Oferta de asigurare Genius Protect și documentele precontractuale înainte de acceptare. Documentația va fi disponibilă și în aplicație după emitere.',
  },
  'trans-sped-documents': {
    en: 'Review the Trans Sped qualified electronic signature application, terms and conditions.',
    ro: 'Citește cererea Trans Sped pentru emiterea certificatului de semnătură calificată și termenii și condițiile.',
  },
  'insurance-contract': {
    en: 'Review the Genius Protect insurance contract, insured events, limits, premium and cancellation conditions.',
    ro: 'Citește contractul de asigurare Genius Protect, evenimentele asigurate, limitele, prima și condițiile de încetare.',
  },
  'contract-mandate': {
    en: 'Review the direct debit mandate attached to your insurance contract.',
    ro: 'Citește mandatul de debitare directă atașat contractului de asigurare.',
  },
  'contract-trans-sped': {
    en: 'Review the electronic signature certificate application and the related Trans Sped terms.',
    ro: 'Citește cererea pentru certificatul de semnătură electronică și termenii Trans Sped aferenți.',
  },
};

const STEP_SCREEN: Record<GeniusProtectStep, FlowScreen> = {
  'personal-data': 'personal-data',
  notices: 'notices',
  'needs-analysis': 'needs-analysis',
  'payment-account': 'payment-account',
  'pre-contract': 'pre-contract',
  contract: 'contract',
  otp: 'otp',
};

function t(host: CurrentScreenProps, english: string, romanian: string) {
  return host.language === 'ro' ? romanian : english;
}

function SectionHeading({
  children,
  dark,
}: {
  children: string;
  dark: boolean;
}) {
  return (
    <BaselineSectionDivider title={children} variant="section" dark={dark} />
  );
}

function ToggleRow({
  label,
  accessibilityLabel,
  description,
  checked,
  onToggle,
  dark,
}: {
  label: string;
  accessibilityLabel?: string;
  description?: string;
  checked: boolean;
  onToggle: (next: boolean) => void;
  dark: boolean;
}) {
  const text = sourceColor('var(--uc-text)', dark);
  const muted = sourceColor('var(--uc-text-muted)', dark);
  return (
    <View style={styles.toggleRow}>
      <View style={styles.flex}>
        <Text style={[styles.rowTitle, { color: text }]}>{label}</Text>
        {description ? (
          <Text style={[styles.rowDescription, { color: muted }]}>
            {description}
          </Text>
        ) : null}
      </View>
      <ToggleButton
        checked={checked}
        ariaLabel={accessibilityLabel ?? label}
        onToggle={onToggle}
        dark={dark}
      />
    </View>
  );
}

function InfoRow({
  label,
  description,
  onPress,
  dark,
}: {
  label: string;
  description: string;
  onPress: () => void;
  dark: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.infoRow}
    >
      <View style={styles.infoIcon}>
        <SourceCustomIcon
          name="info-circle"
          size={24}
          color={sourceColor('var(--uc-text)', dark)}
        />
      </View>
      <View style={styles.flex}>
        <Text
          style={[
            styles.rowTitle,
            { color: sourceColor('var(--uc-text)', dark) },
          ]}
        >
          {label.toUpperCase()}
        </Text>
        <Text
          style={[
            styles.rowDescription,
            { color: sourceColor('var(--uc-text-muted)', dark) },
          ]}
        >
          {description}
        </Text>
      </View>
      <SourceCustomIcon
        name="chevron-right"
        size={24}
        color={sourceColor('var(--uc-text)', dark)}
      />
    </Pressable>
  );
}

function DataRow({
  label,
  value,
  onPress,
  dark,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  dark: boolean;
}) {
  const content = (
    <View style={styles.dataRow}>
      <View style={styles.flex}>
        <Text
          style={[
            styles.dataLabel,
            { color: sourceColor('var(--uc-text)', dark) },
          ]}
        >
          {label.toUpperCase()}
        </Text>
        <Text
          style={[
            styles.dataValue,
            { color: sourceColor('var(--uc-text)', dark) },
          ]}
        >
          {value}
        </Text>
      </View>
      {onPress ? (
        <SourceCustomIcon
          name="chevron-right"
          size={24}
          color={sourceColor('var(--uc-text)', dark)}
        />
      ) : null}
    </View>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.dataRowPressable}
    >
      {content}
    </Pressable>
  ) : (
    content
  );
}

function ScreenFrame({
  host,
  children,
  onBack,
  footer,
  dark,
}: {
  host: CurrentScreenProps;
  children: React.ReactNode;
  onBack: () => void;
  footer?: React.ReactNode;
  dark: boolean;
}) {
  return (
    <View
      style={[
        styles.page,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <View style={styles.toolbar}>
        <BaselinePageHeader
          title=""
          onBack={onBack}
          showHelp={false}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          renderLargeTitle={false}
          dark={dark}
        />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={[
          styles.scroll,
          Platform.OS === 'web'
            ? ({ transform: 'none' } as unknown as ViewStyle)
            : undefined,
        ]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ height: host.screenTopInset + 48 }} />
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

function FlowFooter({
  dark,
  primaryLabel,
  onPrimary,
  disabled = false,
  secondaryLabel,
  onSecondary,
}: {
  dark: boolean;
  primaryLabel: string;
  onPrimary: () => void;
  disabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <View
      style={[
        styles.footer,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <View style={styles.footerActions}>
        <PrimaryButton
          label={primaryLabel}
          onPress={onPrimary}
          disabled={disabled}
          dark={dark}
        />
        {secondaryLabel && onSecondary ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={secondaryLabel}
            onPress={onSecondary}
            style={styles.secondaryAction}
          >
            <Text
              style={[
                styles.secondaryActionText,
                { color: sourceColor('var(--uc-action-strong)', dark) },
              ]}
            >
              {secondaryLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.homeIndicator}>
        <View
          style={[
            styles.homeIndicatorBar,
            { backgroundColor: sourceColor('var(--uc-text)', dark) },
          ]}
        />
      </View>
    </View>
  );
}

function copyText(documentId: DocumentId, host: CurrentScreenProps) {
  return t(
    host,
    {
      eligibility: 'Eligibility conditions',
      'active-policy': 'Keeping the policy active',
      payment: 'Insurance payment',
      withdrawal: 'Cancellation and withdrawal',
      exclusions: 'Exclusions',
      'unicredit-notice': 'UniCredit Bank privacy notice',
      'allianz-notice': 'Allianz-Țiriac privacy notice',
      'trans-sped-notice': 'Trans Sped privacy notice',
      'debit-mandate': 'Automatic debit mandate',
      'insurance-offer': 'Genius Protect insurance offer',
      'trans-sped-documents': 'Trans Sped documentation',
      'insurance-contract': 'Genius Protect contract',
      'contract-mandate': 'Direct debit mandate',
      'contract-trans-sped': 'Electronic signature certificate request',
    }[documentId],
    {
      eligibility: 'Condiții de eligibilitate',
      'active-policy': 'Cum păstrezi asigurarea activă',
      payment: 'Plata asigurării',
      withdrawal: 'Retragerea și încetarea asigurării',
      exclusions: 'Excluderi',
      'unicredit-notice': 'Notă de informare UniCredit Bank',
      'allianz-notice': 'Notă de informare Allianz-Țiriac',
      'trans-sped-notice': 'Notă de informare Trans Sped',
      'debit-mandate': 'Mandat de debitare automată',
      'insurance-offer': 'Oferta de asigurare Genius Protect',
      'trans-sped-documents': 'Documentație Trans Sped',
      'insurance-contract': 'Contract Genius Protect',
      'contract-mandate': 'Mandat de debitare automată',
      'contract-trans-sped':
        'Cerere pentru certificatul de semnătură electronică',
    }[documentId],
  );
}

function datePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const national = digits.startsWith('0040')
    ? digits.slice(4)
    : digits.startsWith('40')
      ? digits.slice(2)
      : digits.startsWith('0')
        ? digits.slice(1)
        : digits;
  return `+40 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6, 9)}`.trim();
}

function stepToScreen(step: GeniusProtectStep): FlowScreen {
  const screens: Record<GeniusProtectStep, FlowScreen> = {
    'personal-data': 'personal-data',
    notices: 'notices',
    'needs-analysis': 'needs-analysis',
    'payment-account': 'payment-account',
    'pre-contract': 'pre-contract',
    contract: 'contract',
    otp: 'otp',
  };
  return screens[step];
}

function GeniusProtectContent({ host }: { host: CurrentScreenProps }) {
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const ink = sourceColor('var(--uc-text)', dark);
  const muted = sourceColor('var(--uc-text-muted)', dark);
  const accent = sourceColor('var(--uc-action)', dark);
  const profile = useSyncExternalStore(
    subscribeRomanianProfile,
    getRomanianProfileSnapshot,
  );
  const snapshot = useSyncExternalStore(
    subscribeGeniusProtect,
    getGeniusProtectSnapshot,
  );
  const hasRonAccount =
    host.scenario === 'active' && host.productCounts.accounts > 0;
  const expiredLink = host.route.params?.geniusProtectExpiredLink === 'true';
  const [screen, setScreen] = useState<FlowScreen>(() => {
    if (expiredLink) return 'expired-link';
    if (snapshot.draft?.returningFromProfile)
      return stepToScreen(snapshot.draft.step);
    if (snapshot.draft) return 'resume';
    return 'product';
  });
  const [documentModal, setDocumentModal] = useState<DocumentId | null>(null);
  const [infoModal, setInfoModal] = useState<DocumentId | null>(null);
  const [overviewAccepted, setOverviewAccepted] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(2);
  const [exitReason, setExitReason] = useState('');
  const [otherExitReason, setOtherExitReason] = useState('');
  const [screenError, setScreenError] = useState('');

  const copy = (english: string, romanian: string) =>
    t(host, english, romanian);
  const personalData = {
    fullName: `${profile.firstName} ${profile.lastName}`.trim(),
    documentNumber: profile.documentNumber.replace(/\s/g, '-'),
    phone: datePhone(profile.phone),
    email: profile.email,
  };
  const draft = snapshot.draft;

  const setStep = (step: GeniusProtectStep) => {
    updateGeniusProtectDraft({ step });
    setScreen(stepToScreen(step));
    setScreenError('');
  };

  const back = () => {
    if (documentModal) {
      setDocumentModal(null);
      return;
    }
    if (infoModal) {
      setInfoModal(null);
      return;
    }
    setScreenError('');
    if (screen === 'product') return host.onBack();
    if (screen === 'how-to') return setScreen('product');
    if (screen === 'notices') return setScreen('how-to');
    if (screen === 'personal-data') return setStep('notices');
    if (screen === 'needs-analysis') return setStep('personal-data');
    if (screen === 'payment-account') return setStep('needs-analysis');
    if (screen === 'pre-contract') return setStep('payment-account');
    if (screen === 'contract') return setStep('pre-contract');
    if (screen === 'otp') return setStep('contract');
    if (screen === 'processing') return;
    if (screen === 'success') return host.onNavigate({ screen: 'home' });
    if (screen === 'resume') return host.onBack();
    if (screen === 'active-policy' || screen === 'no-account')
      return setScreen('how-to');
    if (screen === 'ineligible' || screen === 'not-needed')
      return setStep('needs-analysis');
    if (screen === 'quit-reason') return setStep('needs-analysis');
    if (screen === 'expired-link') return host.onBack();
  };

  useEffect(() => {
    if (snapshot.draft?.returningFromProfile) {
      updateGeniusProtectDraft({ returningFromProfile: false });
    }
  }, []);

  useEffect(() => {
    const register = host.onBackHandlerChange;
    if (!register) return;
    register(() => {
      if (screen === 'product') return false;
      back();
      return true;
    });
    return () => register(null);
  }, [host.onBackHandlerChange, screen, documentModal, infoModal]);

  useEffect(() => {
    if (screen !== 'processing') return;
    const timer = setTimeout(() => {
      completeGeniusProtectRequest();
      host.onChanged();
      setScreen('success');
    }, 900);
    return () => clearTimeout(timer);
  }, [screen, host]);

  const openProfile = () => {
    updateGeniusProtectDraft({ returningFromProfile: true });
    host.onNavigate({ screen: 'profile', params: { area: 'my-data' } });
  };

  const startAfterOverview = () => {
    if (!canContinueGeniusProtectOverview(overviewAccepted)) return;
    const gate = resolveGeniusProtectEntry(hasRonAccount);
    if (gate === 'active-policy') {
      setScreen('active-policy');
      return;
    }
    if (gate === 'no-account') {
      setScreen('no-account');
      return;
    }
    if (gate === 'resume') {
      setScreen('resume');
      return;
    }
    startGeniusProtectRequest();
    setStep('notices');
  };

  const confirmPersonalData = () => {
    if (
      !canContinueGeniusProtectPersonalData(
        personalData,
        draft?.personalDataConfirmed ?? false,
      )
    ) {
      setScreenError(
        copy(
          'Please confirm your personal data and check that your phone and email are valid.',
          'Confirmă datele personale și verifică numărul de telefon și adresa de e-mail.',
        ),
      );
      return;
    }
    setStep('needs-analysis');
  };

  const continueNotices = () => {
    if (!draft || !canContinueGeniusProtectNotices(draft.notices)) {
      setScreenError(
        copy(
          'Read and acknowledge each information notice to continue.',
          'Citește și confirmă fiecare notă de informare pentru a continua.',
        ),
      );
      return;
    }
    setStep('personal-data');
  };

  const continueNeeds = () => {
    if (!draft) return;
    const result = resolveGeniusProtectNeeds(draft.needs);
    if (result === 'ineligible') {
      setScreen('ineligible');
      return;
    }
    if (result === 'not-needed') {
      setScreen('not-needed');
      return;
    }
    if (result === 'incomplete') {
      setScreenError(
        copy(
          'Complete each declaration before continuing.',
          'Completează toate declarațiile pentru a continua.',
        ),
      );
      return;
    }
    setStep('payment-account');
  };

  const continuePayment = () => {
    if (
      !draft ||
      !canContinueGeniusProtectPayment(
        draft.accountId ?? '',
        draft.debitMandateAccepted,
      )
    ) {
      setScreenError(
        copy(
          'Select a RON account and read the automatic debit mandate.',
          'Selectează un cont în RON și citește mandatul de debitare automată.',
        ),
      );
      return;
    }
    setStep('pre-contract');
  };

  const continuePreContract = () => {
    if (!draft || !canContinueGeniusProtectPreContract(draft.preContract)) {
      setScreenError(
        copy(
          'Read both pre-contract documents and confirm the early disclosure choice.',
          'Citește documentele precontractuale și confirmă opțiunea de informare.',
        ),
      );
      return;
    }
    setStep('contract');
  };

  const continueContract = () => {
    if (
      !draft ||
      !canContinueGeniusProtectContract(
        draft.contractAccepted,
        draft.contractDocumentsRead,
      )
    ) {
      setScreenError(
        copy(
          'Read each contract document and confirm your agreement.',
          'Citește documentele contractuale și confirmă acordul.',
        ),
      );
      return;
    }
    setOtp('');
    setOtpError('');
    setAttemptsRemaining(2);
    setStep('otp');
  };

  const sign = () => {
    if (!verifyGeniusProtectOtp(otp)) {
      const remaining = Math.max(0, attemptsRemaining - 1);
      setAttemptsRemaining(remaining);
      setOtpError(
        remaining === 0
          ? copy(
              'The code has expired. Request a new one.',
              'Codul a expirat. Solicită un cod nou.',
            )
          : copy(
              `Invalid code. ${remaining} attempts remaining.`,
              `Cod invalid. Mai ai ${remaining} încercări.`,
            ),
      );
      return;
    }
    setOtpError('');
    setScreen('processing');
  };

  const openDocument = (id: DocumentId) => setDocumentModal(id);
  const readDocument = () => {
    if (!documentModal || !draft) return setDocumentModal(null);
    if (documentModal === 'unicredit-notice')
      updateGeniusProtectDraft({ notices: { unicredit: true } });
    if (documentModal === 'allianz-notice')
      updateGeniusProtectDraft({ notices: { allianz: true } });
    if (documentModal === 'trans-sped-notice')
      updateGeniusProtectDraft({ notices: { transSped: true } });
    if (documentModal === 'debit-mandate')
      updateGeniusProtectDraft({ debitMandateAccepted: true });
    if (documentModal === 'insurance-offer')
      updateGeniusProtectDraft({ preContract: { offerRead: true } });
    if (documentModal === 'trans-sped-documents')
      updateGeniusProtectDraft({ preContract: { transSpedRead: true } });
    if (documentModal === 'insurance-contract')
      updateGeniusProtectDraft({ contractDocumentsRead: { insurance: true } });
    if (documentModal === 'contract-mandate')
      updateGeniusProtectDraft({
        contractDocumentsRead: { debitMandate: true },
      });
    if (documentModal === 'contract-trans-sped')
      updateGeniusProtectDraft({ contractDocumentsRead: { transSped: true } });
    setDocumentModal(null);
  };

  const saveForLater = () => {
    host.onBack();
  };

  const beginCancellation = () => {
    setExitReason('');
    setOtherExitReason('');
    setScreen('quit-reason');
  };

  const confirmCancellation = () => {
    if (!exitReason || (exitReason === 'other' && !otherExitReason.trim())) {
      setScreenError(
        copy(
          'Select a reason to close the request.',
          'Selectează motivul pentru a închide cererea.',
        ),
      );
      return;
    }
    cancelGeniusProtectRequest();
    host.onBack();
  };

  const screenTitle = (() => {
    switch (screen) {
      case 'product':
        return copy('Genius Protect', 'Genius Protect');
      case 'how-to':
        return copy('How to get insurance', 'Cum obții asigurarea');
      case 'personal-data':
        return copy('Your data', 'Datele tale');
      case 'notices':
        return copy('Information notices', 'Acorduri și note de informare');
      case 'needs-analysis':
        return copy('Needs and requirements', 'Analiza nevoilor și cerințelor');
      case 'payment-account':
        return copy('Payment account', 'Contul de plată');
      case 'pre-contract':
        return copy('Insurance offer', 'Prezentare ofertă de asigurare');
      case 'contract':
        return copy('Your contract', 'Contractul tău');
      case 'otp':
        return copy('Sign with OTP code', 'Semnează cu cod OTP');
      case 'processing':
        return copy('Finalizing signature', 'Finalizăm semnarea');
      case 'success':
        return copy('Genius Protect', 'Genius Protect');
      case 'resume':
        return copy('Active request', 'Cerere activă');
      case 'active-policy':
        return copy('Active policy found', 'Ai deja o poliță activă');
      case 'no-account':
        return copy('Open a RON account', 'Ai nevoie de un cont în RON');
      case 'ineligible':
        return copy(
          'Genius Protect is not available',
          'Nu poți contracta Genius Protect',
        );
      case 'not-needed':
        return copy(
          'Your request was not continued',
          'Cererea nu a fost continuată',
        );
      case 'quit-reason':
        return copy('Why are you leaving?', 'Motivul anulării');
      case 'expired-link':
        return copy('Expired link', 'Link expirat');
    }
  })();

  const primaryButton = (
    label: string,
    onPress: () => void,
    disabled = false,
    secondary?: { label: string; onPress: () => void },
  ) => (
    <FlowFooter
      dark={dark}
      primaryLabel={label}
      onPrimary={onPress}
      disabled={disabled}
      secondaryLabel={secondary?.label}
      onSecondary={secondary?.onPress}
    />
  );

  const footerFor = (
    label: string,
    onPress: () => void,
    disabled = false,
    secondaryLabel?: string,
    onSecondary?: () => void,
  ) =>
    primaryButton(
      label,
      onPress,
      disabled,
      secondaryLabel
        ? { label: secondaryLabel, onPress: onSecondary! }
        : undefined,
    );

  const updateNotice = (
    id: 'unicredit' | 'allianz' | 'transSped',
    value: boolean,
  ) => updateGeniusProtectDraft({ notices: { [id]: value } });

  const body = (() => {
    if (screen === 'product') {
      const monthlyPrice = (
        geniusProtectChargeCentsForMonth(GENIUS_PROTECT_FREE_MONTHS + 1) / 100
      ).toLocaleString(host.language === 'ro' ? 'ro-RO' : 'en-US');
      const benefits = [
        {
          title: copy('EASY TO ACCESS', 'UȘOR DE ACCESAT'),
          description: copy(
            '100% online, with no medical exams.',
            '100% online, fără analize medicale.',
          ),
        },
        {
          title: copy('INTERNATIONAL COVERAGE', 'ACOPERIRE INTERNAȚIONALĂ'),
          description: copy(
            'Covered risks apply worldwide.',
            'Riscurile asigurate sunt acoperite în întreaga lume.',
          ),
        },
        {
          title: copy('NO NEED TO WORRY ABOUT PAYMENTS', 'NU AI GRIJA PLĂȚII'),
          description: copy(
            'The monthly premium is debited automatically from your RON current account.',
            'Prima lunară se debitează automat din contul tău curent în lei.',
          ),
        },
        {
          title: copy('AFFORDABLE PREMIUM', 'PRIMĂ DE ASIGURARE ACCESIBILĂ'),
          description: copy(
            `The first ${GENIUS_PROTECT_FREE_MONTHS} months are free; from month three the premium is:`,
            `Începând cu a treia lună de la contractare, primele două luni sunt gratuite.`,
          ),
          amount: copy(
            `${monthlyPrice} RON / MONTH`,
            `${monthlyPrice} LEI / LUNĂ`,
          ),
        },
      ];
      const coverageLabels: Record<
        (typeof GENIUS_PROTECT_COVERAGE)[number]['id'],
        string
      > = {
        'accidental-death': copy(
          'DEATH AS A RESULT OF AN ACCIDENT',
          'DECES CA URMARE A UNUI ACCIDENT',
        ),
        'illness-death': copy(
          'DEATH AS A RESULT OF ILLNESS',
          'DECES CA URMARE A UNEI BOLI',
        ),
        'accidental-disability': copy(
          'GRADE I DISABILITY AS A RESULT OF AN ACCIDENT',
          'INVALIDITATE DE GRADUL I CA URMARE A UNUI ACCIDENT',
        ),
        'accidental-surgery': copy(
          'SURGERY AS A RESULT OF AN ACCIDENT',
          'INTERVENȚIE CHIRURGICALĂ CA URMARE A UNUI ACCIDENT',
        ),
      };
      return (
        <View style={styles.productContent}>
          <Text style={[styles.productTitle, { color: ink }]}>
            {copy('Genius Protect', 'Genius Protect')}
          </Text>
          <RasterImage
            source={{ uri: geniusProtectHero }}
            resizeMode="cover"
            accessibilityLabel={copy(
              'A couple riding a scooter',
              'Un cuplu pe scuter',
            )}
            style={styles.hero}
          />
          <Text style={[styles.productDescription, { color: ink }]}>
            {copy(
              'Extra protection for unexpected events, at a low monthly cost. Activate it in a few minutes and have financial support ready when you need it.',
              'Protecție extra pentru evenimente neprevăzute, la un cost minim lunar. Activezi totul în câteva minute și ai un sprijin financiar gata pregătit.',
            )}
          </Text>
          <SectionHeading dark={dark}>
            {copy('INSURANCE BENEFITS', 'AVANTAJELE ASIGURĂRII')}
          </SectionHeading>
          <View style={styles.benefits}>
            {benefits.map(({ title, description, amount }) => (
              <View key={title} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <SourceCustomIcon name="check" size={20} color={ink} />
                </View>
                <View style={styles.flex}>
                  <Text style={[styles.benefitTitle, { color: ink }]}>
                    {title}
                  </Text>
                  <Text style={[styles.body, { color: ink }]}>
                    {description}
                  </Text>
                  {amount ? (
                    <Text style={[styles.coverageAmount, { color: ink }]}>
                      {amount}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
          <SectionHeading dark={dark}>
            {copy('WHAT IS COVERED', 'CE RISCURI SUNT ACOPERITE')}
          </SectionHeading>
          <View style={styles.coverageRows}>
            {GENIUS_PROTECT_COVERAGE.map(item => (
              <View key={item.id} style={styles.coverageRow}>
                <View style={styles.coverageGlyph}>
                  <SourceCustomIcon name="shield-check" size={20} color={ink} />
                </View>
                <View style={styles.flex}>
                  <Text style={[styles.coverageTitle, { color: ink }]}>
                    {coverageLabels[item.id]}
                  </Text>
                  <Text style={[styles.body, { color: muted }]}>
                    {copy('Insured amount', 'Sumă asigurată')}
                  </Text>
                  <Text style={[styles.coverageAmount, { color: ink }]}>
                    {`${item.sum.toLocaleString(host.language === 'ro' ? 'ro-RO' : 'en-US')} ${copy('RON', 'LEI')}`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (screen === 'how-to') {
      const steps = [
        [
          copy(
            'YOUR PERSONAL DATA AND CONSENTS',
            'DATELE TALE PERSONALE ȘI ACORDURI',
          ),
          copy(
            'Confirm your data and how it is processed by UniCredit and Allianz-Țiriac.',
            'Confirmi datele și modul în care sunt prelucrate de UniCredit și Allianz-Țiriac.',
          ),
        ],
        [
          copy('NEEDS ANALYSIS', 'ANALIZA NEVOILOR'),
          copy(
            'Confirm your protection needs and eligibility declaration (CNAS).',
            'Confirmi cerințele tale de protecție și declarația de eligibilitate (CNAS).',
          ),
        ],
        [
          copy('PAYMENT ACCOUNT', 'CONTUL DE PLATĂ'),
          copy(
            'Select the RON account from which the premium will be collected automatically.',
            'Selectezi contul în lei din care se va încasa automat prima de asigurare.',
          ),
        ],
        [
          copy('SIGN THE CONTRACT', 'SEMNEZI CONTRACTUL'),
          copy(
            'Review the offer and sign the insurance documentation electronically.',
            'Parcurgi și accepți oferta, apoi semnezi documentația contractuală.',
          ),
        ],
      ] as const;
      return (
        <View style={styles.content}>
          <Text style={[styles.pageTitle, { color: ink }]}>{screenTitle}</Text>
          <SectionHeading dark={dark}>
            {copy('STEPS YOU WILL TAKE', 'CE PAȘI VEI URMA')}
          </SectionHeading>
          <View style={styles.steps}>
            {steps.map(([title, detail], index) => (
              <View key={title} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={[styles.stepTitle, { color: ink }]}>
                    {title}
                  </Text>
                  <Text style={[styles.rowDescription, { color: muted }]}>
                    {detail}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <SectionHeading dark={dark}>
            {copy('PRODUCT DETAILS', 'DETALII DESPRE PRODUS')}
          </SectionHeading>
          <View style={styles.infoRows}>
            <InfoRow
              label={copy(
                'Eligibility conditions',
                'Condiții de eligibilitate',
              )}
              description={copy(
                'Discover who can apply.',
                'Află dacă poți contracta produsul.',
              )}
              onPress={() => setInfoModal('eligibility')}
              dark={dark}
            />
            <InfoRow
              label={copy(
                'Keeping your policy active',
                'Ce trebuie să faci pentru a păstra asigurarea activă',
              )}
              description={copy(
                'How monthly premium payments work.',
                'Cum funcționează plata lunară.',
              )}
              onPress={() => setInfoModal('active-policy')}
              dark={dark}
            />
            <InfoRow
              label={copy(
                'Can I change my mind?',
                'Te poți răzgândi după semnarea contractului?',
              )}
              description={copy(
                'Learn how you can withdraw or cancel.',
                'Află cum te poți retrage sau înceta asigurarea.',
              )}
              onPress={() => setInfoModal('withdrawal')}
              dark={dark}
            />
            <InfoRow
              label={copy('Exclusions', 'Excluderi')}
              description={copy(
                'Information about exclusions.',
                'Informații despre excluderi.',
              )}
              onPress={() => setInfoModal('exclusions')}
              dark={dark}
            />
          </View>
          <ToggleRow
            label={copy(
              'I agree with the Genius Protect insurance conditions',
              'Sunt de acord cu condițiile de asigurare Genius Protect',
            )}
            checked={overviewAccepted}
            onToggle={setOverviewAccepted}
            dark={dark}
          />
          <Text style={[styles.price, { color: ink }]}>
            {copy(
              'First two months free, then 7 RON / month',
              'Primele două luni gratuite, apoi 7 LEI / LUNĂ',
            )}
          </Text>
        </View>
      );
    }

    if (screen === 'personal-data') {
      return (
        <View style={styles.content}>
          <Text style={[styles.pageTitle, { color: ink }]}>
            {copy('Your data', 'Datele tale')}
          </Text>
          <Text style={[styles.bodyLarge, { color: ink }]}>
            {copy(
              'Check and confirm that the personal data you have provided to the Bank is up to date. If something needs changing, open a section below to update it.',
              'Verifică și confirmă dacă datele tale personale în relație cu banca sunt actualizate. Dacă trebuie să le modifici, mergi pe fiecare secțiune și actualizează-le.',
            )}
          </Text>
          <View style={styles.dataList}>
            <DataRow
              label={copy('First and last name', 'Nume și prenume')}
              value={personalData.fullName}
              onPress={openProfile}
              dark={dark}
            />
            <DataRow
              label={copy(
                'ID card series and number',
                'Seria și numărul de buletin',
              )}
              value={personalData.documentNumber}
              onPress={openProfile}
              dark={dark}
            />
            <DataRow
              label={copy('Phone number', 'Număr de telefon')}
              value={personalData.phone}
              onPress={openProfile}
              dark={dark}
            />
            <DataRow
              label={copy('Email address', 'Adresă de email')}
              value={personalData.email}
              onPress={openProfile}
              dark={dark}
            />
          </View>
          <CheckRow
            label={copy('Confirm personal data', 'Confirm datele personale')}
            description={copy(
              'I confirm that these are the current data held by the Bank.',
              'Confirm că datele mele sunt cele actuale și corespund celor declarate băncii.',
            )}
            checked={draft?.personalDataConfirmed ?? false}
            onChange={checked =>
              updateGeniusProtectDraft({ personalDataConfirmed: checked })
            }
            dark={dark}
          />
          {screenError ? (
            <Text
              style={[
                styles.errorText,
                { color: sourceColor('var(--uc-red-main)', dark) },
              ]}
            >
              {screenError}
            </Text>
          ) : null}
        </View>
      );
    }

    if (screen === 'notices') {
      const notices = draft?.notices;
      return (
        <View style={styles.content}>
          <Text style={[styles.pageTitle, { color: ink }]}>{screenTitle}</Text>
          <Text style={[styles.bodyLarge, { color: ink }]}>
            {copy(
              'To issue your Genius Protect policy, please review the information notices below.',
              'Pentru a emite polița Genius Protect, parcurge documentele de mai jos.',
            )}
          </Text>
          <View style={styles.noticesList}>
            {(
              [
                {
                  id: 'unicredit',
                  label: copy(
                    'UNI CREDIT BANK PRIVACY NOTICE',
                    'NOTĂ DE INFORMARE UNICREDIT BANK',
                  ),
                  accessibilityLabel: copy(
                    'UniCredit Bank privacy notice',
                    'Nota de informare UniCredit Bank',
                  ),
                  description: copy(
                    'Data processing for insurance intermediation and the affiliated agent.',
                    'Prelucrarea datelor pentru intermedierea produsului de asigurare și agentul afiliat.',
                  ),
                },
                {
                  id: 'allianz',
                  label: copy(
                    'ALLIANZ-ȚIRIAC PRIVACY NOTICE',
                    'NOTĂ DE INFORMARE ALLIANZ-ȚIRIAC',
                  ),
                  accessibilityLabel: copy(
                    'Allianz-Țiriac privacy notice',
                    'Nota de informare Allianz-Țiriac',
                  ),
                  description: copy(
                    'Personal data processing by the insurer.',
                    'Prelucrarea datelor personale de către asigurător.',
                  ),
                },
                {
                  id: 'transSped',
                  label: copy(
                    'TRANS SPED PRIVACY NOTICE',
                    'NOTĂ DE INFORMARE TRANS SPED',
                  ),
                  accessibilityLabel: copy(
                    'Trans Sped privacy notice',
                    'Nota de informare Trans Sped',
                  ),
                  description: copy(
                    'Personal data processing for the electronic signature certificate.',
                    'Prelucrarea datelor pentru certificatul de semnătură electronică.',
                  ),
                },
              ] as const
            ).map(({ id, label, accessibilityLabel, description }) => (
              <ToggleRow
                key={id}
                label={label}
                accessibilityLabel={accessibilityLabel}
                description={description}
                checked={notices?.[id] ?? false}
                onToggle={checked => updateNotice(id, checked)}
                dark={dark}
              />
            ))}
          </View>
          {screenError ? (
            <Text
              style={[
                styles.errorText,
                { color: sourceColor('var(--uc-red-main)', dark) },
              ]}
            >
              {screenError}
            </Text>
          ) : null}
        </View>
      );
    }

    if (screen === 'needs-analysis') {
      const needs = draft?.needs;
      return (
        <View style={styles.content}>
          <Text style={[styles.pageTitle, { color: ink }]}>{screenTitle}</Text>
          <SectionHeading dark={dark}>
            {copy('ELIGIBILITY DECLARATION', 'DECLARAȚIE DE ELIGIBILITATE')}
          </SectionHeading>
          <Text style={[styles.body, { color: ink }]}>
            {copy(
              'You can apply if you are not registered with CNAS as a person with a disability.',
              'Poți contracta acest produs dacă nu ești înregistrat la Casa Națională de Asigurări de Sănătate ca persoană cu handicap.',
            )}
          </Text>
          <ToggleRow
            label={copy(
              'I am not registered with CNAS as a person with a disability',
              'Declar că NU sunt înregistrat/ă la CNAS ca persoană cu handicap',
            )}
            checked={needs?.notRegisteredAsDisabled === true}
            onToggle={checked =>
              updateGeniusProtectDraft({
                needs: { notRegisteredAsDisabled: checked },
              })
            }
            dark={dark}
          />
          <SectionHeading dark={dark}>
            {copy(
              'NEEDS AND REQUIREMENTS',
              'ANALIZA CERINȚELOR ȘI NECESITĂȚILOR',
            )}
          </SectionHeading>
          <Text style={[styles.body, { color: ink }]}>
            {copy(
              'Answer the question below so we can confirm whether this protection matches your needs.',
              'Marchează răspunsul la întrebarea de mai jos pentru a stabili dacă produsul corespunde nevoilor tale curente.',
            )}
          </Text>
          <ToggleRow
            label={copy(
              'I need financial protection for my family',
              'Consider că eu sau familia mea avem nevoie de protecție financiară',
            )}
            description={copy(
              'In case of grade I disability, surgery due to an accident, or death from accident or illness.',
              'În cazul unei invalidități de gradul I, al unei intervenții chirurgicale după un accident sau al decesului din accident ori boală.',
            )}
            checked={needs?.wantsProtection === true}
            onToggle={checked =>
              updateGeniusProtectDraft({ needs: { wantsProtection: checked } })
            }
            dark={dark}
          />
          <SectionHeading dark={dark}>
            {copy('INFORMATION ABOUT ADVICE', 'INFORMAȚII PRIVIND CONSULTANȚA')}
          </SectionHeading>
          <Text style={[styles.body, { color: ink }]}>
            {copy(
              'To continue in Mobile Banking, please confirm the following.',
              'Pentru a continua în aplicația Mobile Banking, confirmă următoarele.',
            )}
          </Text>
          <ToggleRow
            label={copy(
              'I agree to continue without insurance advice',
              'Sunt de acord că pentru acest produs nu voi primi consultanță',
            )}
            description={copy(
              'The intermediary cannot determine whether the product is the best fit for your needs.',
              'Intermediarul nu poate determina dacă produsul corespunde cel mai bine necesităților tale.',
            )}
            checked={needs?.noAdvice ?? false}
            onToggle={checked =>
              updateGeniusProtectDraft({ needs: { noAdvice: checked } })
            }
            dark={dark}
          />
          {screenError ? (
            <Text
              style={[
                styles.errorText,
                { color: sourceColor('var(--uc-red-main)', dark) },
              ]}
            >
              {screenError}
            </Text>
          ) : null}
        </View>
      );
    }

    if (screen === 'payment-account') {
      return (
        <View style={styles.content}>
          <Text style={[styles.pageTitle, { color: ink }]}>{screenTitle}</Text>
          <Text style={[styles.body, { color: ink }]}>
            {copy(
              'The monthly premium will be collected from this RON account.',
              'Colectarea primei de asigurare se va efectua din contul RON selectat.',
            )}
          </Text>
          <View style={styles.accounts}>
            {ACCOUNT_OPTIONS.map(account => (
              <View key={account.id} style={styles.accountRow}>
                <RadioButton
                  label={account.name}
                  selected={draft?.accountId === account.id}
                  onPress={() =>
                    updateGeniusProtectDraft({ accountId: account.id })
                  }
                  dark={dark}
                  paddingHorizontal={0}
                />
                <View style={styles.accountDetails}>
                  <Text style={[styles.body, { color: ink }]}>
                    {account.number}
                  </Text>
                  <Text style={[styles.rowDescription, { color: muted }]}>
                    {account.balance}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <InfoRow
            label={copy(
              'Automatic debit mandate',
              'Mandat pentru debitarea automată',
            )}
            description={copy(
              'Review how the premium will be collected.',
              'Detalii despre plata primei de asigurare.',
            )}
            onPress={() => openDocument('debit-mandate')}
            dark={dark}
          />
          <Text style={[styles.body, { color: muted }]}>
            {copy(
              'First two months free, then 7 RON per month.',
              'Primele două luni gratuite, apoi 7 lei pe lună.',
            )}
          </Text>
          {screenError ? (
            <Text
              style={[
                styles.errorText,
                { color: sourceColor('var(--uc-red-main)', dark) },
              ]}
            >
              {screenError}
            </Text>
          ) : null}
        </View>
      );
    }

    if (screen === 'pre-contract') {
      return (
        <View style={styles.content}>
          <Text style={[styles.pageTitle, { color: ink }]}>
            {copy(
              'Insurance offer and pre-contract documents',
              'Prezentarea ofertei și documentația precontractuală',
            )}
          </Text>
          <Text style={[styles.bodyLarge, { color: ink }]}>
            {copy(
              'Read the documents before accepting and signing electronically with the SMS code.',
              'Citește documentele înainte de acceptare și semnează electronic cu codul primit prin SMS.',
            )}
          </Text>
          <View style={styles.documentRows}>
            <InfoRow
              label={copy(
                'Genius Protect insurance offer',
                'Oferta de asigurare Genius Protect',
              )}
              description={copy(
                'Offer and pre-contract information.',
                'Oferta împreună cu documentele precontractuale.',
              )}
              onPress={() => openDocument('insurance-offer')}
              dark={dark}
            />
            <InfoRow
              label={copy(
                'Trans Sped documentation',
                'Documentație Trans Sped',
              )}
              description={copy(
                'Application for the qualified signature certificate.',
                'Cerere pentru emiterea certificatului de semnătură calificată.',
              )}
              onPress={() => openDocument('trans-sped-documents')}
              dark={dark}
            />
          </View>
          <View style={styles.inlineDivider} />
          <CheckRow
            label={copy(
              'Early disclosure agreement',
              'Acord informare prealabilă',
            )}
            description={copy(
              'I agree to reduce the legal 15-day pre-contract information period.',
              'Sunt de acord cu reducerea termenului legal de informare prealabilă de 15 zile.',
            )}
            checked={draft?.preContract.earlyDisclosureAccepted ?? false}
            onChange={checked =>
              updateGeniusProtectDraft({
                preContract: { earlyDisclosureAccepted: checked },
              })
            }
            dark={dark}
          />
          {screenError ? (
            <Text
              style={[
                styles.errorText,
                { color: sourceColor('var(--uc-red-main)', dark) },
              ]}
            >
              {screenError}
            </Text>
          ) : null}
        </View>
      );
    }

    if (screen === 'contract') {
      return (
        <View style={styles.content}>
          <Text style={[styles.pageTitle, { color: ink }]}>
            {copy('Your contract', 'Contractul tău')}
          </Text>
          <Text style={[styles.bodyLarge, { color: ink }]}>
            {copy(
              'Open each document, review its terms and confirm your agreement to continue.',
              'Deschide fiecare document, verifică termenii și confirmă acordul pentru a continua.',
            )}
          </Text>
          <View style={styles.documentRows}>
            <InfoRow
              label={copy('Genius Protect contract', 'Contract Genius Protect')}
              description={copy(
                'Insurance contract and policy terms.',
                'Contractul de asigurare și condițiile poliței.',
              )}
              onPress={() => openDocument('insurance-contract')}
              dark={dark}
            />
            <InfoRow
              label={copy(
                'Direct debit mandate',
                'Mandat de debitare automată',
              )}
              description={copy(
                'Mandate for the selected RON account.',
                'Mandatul pentru contul RON selectat.',
              )}
              onPress={() => openDocument('contract-mandate')}
              dark={dark}
            />
            <InfoRow
              label={copy(
                'Trans Sped certificate request',
                'Cerere certificat Trans Sped',
              )}
              description={copy(
                'Qualified electronic signature documentation.',
                'Documentația pentru semnătura electronică calificată.',
              )}
              onPress={() => openDocument('contract-trans-sped')}
              dark={dark}
            />
          </View>
          <View style={styles.inlineDivider} />
          <CheckRow
            label={copy(
              'I accept the contract documents',
              'Confirm că am citit și accept documentele contractuale',
            )}
            checked={draft?.contractAccepted ?? false}
            onChange={checked =>
              updateGeniusProtectDraft({ contractAccepted: checked })
            }
            dark={dark}
          />
          {screenError ? (
            <Text
              style={[
                styles.errorText,
                { color: sourceColor('var(--uc-red-main)', dark) },
              ]}
            >
              {screenError}
            </Text>
          ) : null}
        </View>
      );
    }

    if (screen === 'otp') {
      return (
        <View style={styles.content}>
          <Text style={[styles.pageTitle, { color: ink }]}>{screenTitle}</Text>
          <Text style={[styles.bodyLarge, { color: ink }]}>
            {copy(
              `We sent an SMS to ${datePhone(profile.phone)}. Enter the code to sign your contract.`,
              `Ți-am trimis un SMS la numărul ${datePhone(profile.phone)}. Introdu codul primit pentru a semna contractul.`,
            )}
          </Text>
          <BaselineTextField
            ariaLabel="Cod OTP"
            label="OTP"
            value={otp}
            onChange={value => {
              setOtp(value.replace(/\D/g, '').slice(0, 6));
              setOtpError('');
            }}
            dark={dark}
            inputMode="numeric"
            maxLength={6}
            helperText={otpError || undefined}
            errorText={otpError || undefined}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy('Resend code', 'Retrimite codul')}
            onPress={() => {
              setOtp('');
              setOtpError(
                copy(
                  'A new demo code has been sent.',
                  'A fost trimis un nou cod demonstrativ.',
                ),
              );
              setAttemptsRemaining(2);
            }}
            style={styles.resend}
          >
            <Text style={[styles.resendText, { color: accent }]}>
              {copy('Resend code', 'RETRIMITE CODUL')}
            </Text>
          </Pressable>
          {screenError ? (
            <Text
              style={[
                styles.errorText,
                { color: sourceColor('var(--uc-red-main)', dark) },
              ]}
            >
              {screenError}
            </Text>
          ) : null}
        </View>
      );
    }

    if (screen === 'processing') {
      return (
        <View style={styles.processing}>
          <ActivityIndicator
            size="large"
            color={sourceColor('var(--uc-green-success)', dark)}
          />
          <Text style={[styles.pageTitle, { color: ink }]}>
            {copy('Finalizing the signature', 'Finalizăm semnarea')}
          </Text>
          <Text style={[styles.bodyLarge, { color: ink, textAlign: 'center' }]}>
            {copy(
              'Please do not close the flow while we process your request.',
              'Nu închide fluxul. Procesăm acum toate datele tale.',
            )}
          </Text>
        </View>
      );
    }

    if (screen === 'success') {
      return (
        <View style={styles.success}>
          <View
            style={[
              styles.successMark,
              { borderColor: sourceColor('var(--uc-green-success)', dark) },
            ]}
          >
            <SourceCustomIcon
              name="check"
              size={56}
              color={sourceColor('var(--uc-green-success)', dark)}
            />
          </View>
          <Text style={[styles.successTitle, { color: ink }]}>
            {copy(
              'Congratulations. Your insurance has been issued!',
              'Felicitări. Asigurarea a fost emisă cu succes!',
            )}
          </Text>
          <Text style={[styles.bodyLarge, { color: ink }]}>
            {copy(
              'Your policy documents are available in Insurance documents. We also sent them to the email address you confirmed.',
              'Poți găsi documentația contractuală în secțiunea Documente din detaliile asigurării. Am trimis documentele și pe adresa de e-mail confirmată.',
            )}
          </Text>
        </View>
      );
    }

    if (screen === 'resume') {
      return (
        <View style={styles.content}>
          <View style={styles.gateIcon}>
            <SourceCustomIcon name="info-circle" size={48} color={ink} />
          </View>
          <Text style={[styles.pageTitle, { color: ink, textAlign: 'center' }]}>
            {copy('Active request', 'Cerere activă')}
          </Text>
          <Text style={[styles.bodyLarge, { color: ink, textAlign: 'center' }]}>
            {copy(
              'You have an unfinished Genius Protect request. Continue the required steps to complete your application.',
              'Ai o cerere de asigurare Genius Protect pe care o poți relua. Parcurge pașii obligatorii pentru a finaliza cererea.',
            )}
          </Text>
        </View>
      );
    }

    if (screen === 'active-policy') {
      return (
        <View style={styles.content}>
          <View style={styles.gateIcon}>
            <SourceCustomIcon name="info-circle" size={48} color={ink} />
          </View>
          <Text style={[styles.pageTitle, { color: ink, textAlign: 'center' }]}>
            {copy(
              'You already have an active policy',
              'Ai deja o poliță activă',
            )}
          </Text>
          <Text style={[styles.bodyLarge, { color: ink, textAlign: 'center' }]}>
            {copy(
              'Only one Genius Protect policy may be active at a time. To change your current policy, contact a UniCredit branch.',
              'Poți deține o singură asigurare Genius Protect activă. Pentru modificarea poliței existente, adresează-te unei sucursale UniCredit Bank.',
            )}
          </Text>
        </View>
      );
    }

    if (screen === 'no-account') {
      return (
        <View style={styles.content}>
          <View style={styles.gateIcon}>
            <SourceCustomIcon name="info-circle" size={48} color={ink} />
          </View>
          <Text style={[styles.pageTitle, { color: ink, textAlign: 'center' }]}>
            {copy('You need a RON account', 'Ai nevoie de un cont în RON')}
          </Text>
          <Text style={[styles.bodyLarge, { color: ink, textAlign: 'center' }]}>
            {copy(
              'Genius Protect is available to UniCredit Bank customers with an active RON current account for the monthly premium.',
              'Pentru a activa Genius Protect, ai nevoie de un cont curent RON din care să se realizeze plata lunară. Poți deschide contul direct din aplicație.',
            )}
          </Text>
        </View>
      );
    }

    if (screen === 'ineligible' || screen === 'not-needed') {
      return (
        <View style={styles.content}>
          <View style={styles.gateIcon}>
            <SourceCustomIcon name="info-circle" size={48} color={ink} />
          </View>
          <Text style={[styles.pageTitle, { color: ink, textAlign: 'center' }]}>
            {screen === 'ineligible'
              ? copy(
                  'Genius Protect is not available',
                  'Nu poți contracta Genius Protect',
                )
              : copy(
                  'Your request was not continued',
                  'Cererea nu a fost continuată',
                )}
          </Text>
          <Text style={[styles.bodyLarge, { color: ink, textAlign: 'center' }]}>
            {screen === 'ineligible'
              ? copy(
                  'The eligibility declaration does not match the conditions for this insurance.',
                  'Declarația de eligibilitate nu corespunde condițiilor pentru această asigurare.',
                )
              : copy(
                  'You can return to the product details and review the insurance again.',
                  'Poți reveni la detaliile produsului și să parcurgi din nou informațiile.',
                )}
          </Text>
        </View>
      );
    }

    if (screen === 'quit-reason') {
      return (
        <View style={styles.content}>
          <Text style={[styles.pageTitle, { color: ink }]}>{screenTitle}</Text>
          <Text style={[styles.bodyLarge, { color: ink }]}>
            {copy(
              'Your feedback helps us improve. Choose a reason if you like.',
              'Părerea ta contează. Dacă dorești, spune-ne motivul pentru care închizi cererea.',
            )}
          </Text>
          <View style={styles.exitReasons}>
            {EXIT_REASONS.map(reason => (
              <RadioButton
                key={reason.id}
                label={reason.label}
                selected={exitReason === reason.id}
                onPress={() => {
                  setExitReason(reason.id);
                  setScreenError('');
                }}
                dark={dark}
                paddingHorizontal={0}
              />
            ))}
          </View>
          {exitReason === 'other' ? (
            <BaselineTextField
              label={copy('Describe another reason', 'Introdu motivul tău')}
              value={otherExitReason}
              onChange={setOtherExitReason}
              ariaLabel="Other cancellation reason"
              dark={dark}
            />
          ) : null}
          {screenError ? (
            <Text
              style={[
                styles.errorText,
                { color: sourceColor('var(--uc-red-main)', dark) },
              ]}
            >
              {screenError}
            </Text>
          ) : null}
        </View>
      );
    }

    if (screen === 'expired-link') {
      return (
        <View style={styles.content}>
          <View style={styles.gateIcon}>
            <SourceCustomIcon name="info-circle" size={48} color={ink} />
          </View>
          <Text style={[styles.pageTitle, { color: ink, textAlign: 'center' }]}>
            {copy('Expired link', 'Link expirat')}
          </Text>
          <Text style={[styles.bodyLarge, { color: ink, textAlign: 'center' }]}>
            {copy(
              'The link you are trying to access has expired. Restart the process to apply for Genius Protect.',
              'Linkul pe care încerci să-l accesezi a expirat. Repornește procesul pentru a solicita Genius Protect.',
            )}
          </Text>
        </View>
      );
    }
    return null;
  })();

  const footer = (() => {
    if (screen === 'product')
      return footerFor(copy('Continue', 'Continuă'), () => setScreen('how-to'));
    if (screen === 'how-to')
      return footerFor(
        copy("I'm interested", 'Sunt interesat'),
        startAfterOverview,
        !overviewAccepted,
      );
    if (screen === 'personal-data')
      return footerFor(copy('Continue', 'Continuă'), confirmPersonalData);
    if (screen === 'notices')
      return footerFor(copy('Continue', 'Continuă'), continueNotices);
    if (screen === 'needs-analysis')
      return footerFor(
        copy('Continue', 'Continuă'),
        continueNeeds,
        !draft || resolveGeniusProtectNeeds(draft.needs) === 'incomplete',
        copy('Withdraw from the request', 'Renunț la cerere'),
        beginCancellation,
      );
    if (screen === 'payment-account')
      return footerFor(copy('Continue', 'Continuă'), continuePayment);
    if (screen === 'pre-contract')
      return footerFor(copy('Continue', 'Continuă'), continuePreContract);
    if (screen === 'contract')
      return footerFor(copy('Continue', 'Continuă'), continueContract);
    if (screen === 'otp')
      return footerFor(copy('Sign', 'Semnează'), sign, otp.length !== 6);
    if (screen === 'success')
      return footerFor(copy('Continue', 'Continuă'), () =>
        host.onNavigate({ screen: 'home' }),
      );
    if (screen === 'resume')
      return footerFor(
        copy('Resume flow', 'Continuă fluxul'),
        () => {
          const activeDraft = getGeniusProtectSnapshot().draft;
          if (activeDraft) setStep(activeDraft.step);
        },
        false,
        copy('Cancel request', 'Anulează cererea'),
        beginCancellation,
      );
    if (screen === 'active-policy')
      return footerFor(copy('OK, I understand', 'OK, am înțeles'), () =>
        host.onBack(),
      );
    if (screen === 'no-account')
      return footerFor(
        copy('Open a current account', 'Deschide acum un cont'),
        () =>
          host.onNavigate({
            screen: 'product-detail',
            params: {
              title: 'Current account',
              cardId: 'account',
              optionId: 'current-account',
            },
          }),
      );
    if (screen === 'ineligible' || screen === 'not-needed')
      return footerFor(copy('Back to product', 'Înapoi la produs'), () =>
        setScreen('how-to'),
      );
    if (screen === 'quit-reason')
      return footerFor(
        copy('Close request', 'Închide cererea'),
        confirmCancellation,
        !exitReason || (exitReason === 'other' && !otherExitReason.trim()),
        copy('Resume later', 'Revin mai târziu'),
        saveForLater,
      );
    if (screen === 'expired-link')
      return footerFor(copy('Restart the flow', 'Reîncepe fluxul'), () => {
        cancelGeniusProtectRequest();
        setScreen('product');
      });
    return undefined;
  })();

  return (
    <View style={styles.fill}>
      <ScreenFrame host={host} dark={dark} onBack={back} footer={footer}>
        {body}
      </ScreenFrame>
      {documentModal ? (
        <SourceBottomSheet
          title={copyText(documentModal, host)}
          onClose={() => setDocumentModal(null)}
          dark={dark}
          stickyHeader
          footer={
            <View style={styles.sheetFooter}>
              <PrimaryButton
                label={
                  documentModal === 'insurance-offer'
                    ? copy(
                        'Accept insurance offer',
                        'Acceptă oferta de asigurare',
                      )
                    : copy('I have read and agree', 'Am citit și sunt de acord')
                }
                onPress={readDocument}
                dark={dark}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy(
                  'Download document',
                  'Descarcă documentul',
                )}
                onPress={readDocument}
                style={styles.secondaryAction}
              >
                <Text style={[styles.secondaryActionText, { color: accent }]}>
                  {copy('Download document', 'Descarcă documentul')}
                </Text>
              </Pressable>
            </View>
          }
        >
          <View style={styles.documentBody}>
            <Text style={[styles.bodyLarge, { color: ink }]}>
              {
                INFO_CONTENT[documentModal][
                  host.language === 'ro' ? 'ro' : 'en'
                ]
              }
            </Text>
            <View style={styles.pdfPreview}>
              <Text style={[styles.pdfTitle, { color: ink }]}>
                {copy('PDF Content', 'Conținut PDF')}
              </Text>
              <Text style={[styles.pdfSubtitle, { color: muted }]}>
                {copy('FIRST DOCUMENT TO READ', 'PRIMUL DOCUMENT DE CITIT')}
              </Text>
            </View>
          </View>
        </SourceBottomSheet>
      ) : null}
      {infoModal ? (
        <SourceBottomSheet
          title={copyText(infoModal, host)}
          onClose={() => setInfoModal(null)}
          dark={dark}
          footer={
            <View style={styles.sheetFooter}>
              <PrimaryButton
                label={copy('Close', 'Închide')}
                onPress={() => setInfoModal(null)}
                dark={dark}
              />
            </View>
          }
        >
          <View style={styles.documentBody}>
            <Text style={[styles.bodyLarge, { color: ink }]}>
              {INFO_CONTENT[infoModal][host.language === 'ro' ? 'ro' : 'en']}
            </Text>
          </View>
        </SourceBottomSheet>
      ) : null}
    </View>
  );
}

export default function GeniusProtectFlow(host: CurrentScreenProps) {
  return (
    <ProfileHost host={host}>
      <GeniusProtectContent host={host} />
    </ProfileHost>
  );
}

function CheckRow({
  label,
  description,
  checked,
  onChange,
  dark,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  dark: boolean;
}) {
  const ink = sourceColor('var(--uc-text)', dark);
  const muted = sourceColor('var(--uc-text-muted)', dark);
  return (
    <View style={styles.checkRow}>
      <BaselineCheckbox
        checked={checked}
        ariaLabel={label}
        onCheckedChange={next => onChange(next === true)}
        dark={dark}
        presentation="canonical"
      />
      <View style={styles.flex}>
        <Text style={[styles.rowTitle, { color: ink }]}>{label}</Text>
        {description ? (
          <Text style={[styles.rowDescription, { color: muted }]}>
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0 },
  page: { flex: 1, width: '100%', minHeight: 0, overflow: 'hidden' },
  toolbar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  scroll: { flex: 1, minHeight: 0 },
  scrollContent: { paddingBottom: 24 },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  productContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },
  productTitle: { fontFamily: 'UniCredit-bold', fontSize: 24, lineHeight: 29 },
  hero: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pageTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 4,
  },
  productDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 8,
  },
  bodyLarge: { fontFamily: 'UniCredit-regular', fontSize: 18, lineHeight: 24 },
  body: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 21 },
  benefits: { gap: 0 },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  benefitIcon: { width: 24, alignItems: 'center' },
  benefitTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 19,
    textTransform: 'uppercase',
  },
  coverageRows: { gap: 18, paddingHorizontal: 0, paddingBottom: 8 },
  coverageRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coverageGlyph: { width: 24, alignItems: 'center', justifyContent: 'center' },
  coverageTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 17,
    textTransform: 'uppercase',
  },
  coverageAmount: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
  },
  flex: { flex: 1, minWidth: 0 },
  steps: { gap: 18, paddingHorizontal: 0, paddingVertical: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#262626',
  },
  stepNumberText: {
    color: '#ffffff',
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
  },
  stepTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  rowTitle: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 20 },
  rowDescription: {
    marginTop: 4,
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 19,
  },
  infoRows: { marginHorizontal: -24, paddingBottom: 8 },
  infoRow: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoIcon: { width: 24, alignItems: 'center' },
  price: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    textAlign: 'center',
    paddingBottom: 12,
  },
  dataList: { marginTop: 4 },
  dataRowPressable: { minHeight: 72, justifyContent: 'center' },
  dataRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#d8d8d8',
  },
  dataLabel: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 18 },
  dataValue: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 20 },
  inlineDivider: { borderBottomWidth: 1, borderBottomColor: '#d8d8d8' },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 70,
  },
  toggleRow: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  noticesList: { gap: 18, paddingVertical: 8 },
  accounts: { gap: 10, paddingVertical: 12 },
  accountRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d8d8d8',
  },
  accountDetails: { marginLeft: 40, marginTop: -14, paddingBottom: 6 },
  documentRows: { gap: 8 },
  resend: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  resendText: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  errorText: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 19 },
  footer: { paddingHorizontal: 24, paddingTop: 8 },
  footerActions: { gap: 6 },
  secondaryAction: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: { fontFamily: 'UniCredit-bold', fontSize: 14 },
  homeIndicator: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicatorBar: { width: 134, height: 5, borderRadius: 100, marginTop: 7 },
  processing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  success: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 58,
    gap: 24,
  },
  successMark: {
    width: 100,
    height: 100,
    borderWidth: 6,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
  },
  gateIcon: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitReasons: { gap: 0 },
  documentBody: { paddingHorizontal: 24, paddingVertical: 16, gap: 20 },
  pdfPreview: {
    height: 380,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 70,
  },
  pdfTitle: {
    fontFamily: 'UniCredit-regular',
    fontSize: 28,
    textAlign: 'center',
  },
  pdfSubtitle: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    letterSpacing: 1,
    textAlign: 'center',
  },
  sheetFooter: { paddingHorizontal: 24, gap: 4 },
  sheetDownload: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
