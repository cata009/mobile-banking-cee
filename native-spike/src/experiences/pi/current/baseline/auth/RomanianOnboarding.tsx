import React, { useEffect, useState } from 'react';
import {
  CASH_LOAN_STEPS,
  LOAN_ANALYSIS_STAGES,
  loanValidation,
  nextCashLoanStage,
  amendedLoanChecks,
  readIncomeEntries,
} from '@/features/ro-cash-loan/model';
import { cashLoanFixture } from '@/features/ro-cash-loan/fixtures';
import { cashLoanSession } from '@/features/ro-cash-loan/session';
import { CashLoanPages, isCashLoanResult } from './CashLoanPages';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { addressChoices } from '@/features/ro-onboarding/addresses';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ONBOARDING_STEPS,
  createOtpChallenge,
  submitOtp,
  resendOtp,
  type OnboardingStep,
  type OnboardingRecoveryStep,
} from '@/features/ro-onboarding/model';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { OnboardingSheet } from './OnboardingSheet';
import { RadioButton } from '../../../../../universal/RadioButton';
import {
  completeScan,
  type ScanAttempt,
} from '@/features/ro-onboarding/identity';
import { validTransactionDetails } from '@/features/ro-onboarding/questionnaire';
import { onboardingValidation } from '@/features/ro-onboarding/validation';
import { amendedOnboardingChecks } from '@/features/ro-onboarding/amendments';
import { OnboardingQuestionnaire } from './OnboardingQuestionnaire';
import { OnboardingMarketing } from './OnboardingMarketing';
import { OnboardingContract } from './OnboardingContract';
import { OnboardingResult } from './OnboardingResult';
import { OnboardingRating } from './OnboardingRating';
import {
  OnboardingSelfieCapture,
  type SelfiePhase,
} from './OnboardingSelfieCapture';
import { OnboardingSupport } from './OnboardingSupport';
import { OnboardingDetails } from './OnboardingDetails';
import { OnboardingBranches } from './OnboardingBranches';
import { OnboardingInformationSheet } from './OnboardingInformationSheet';
import { OnboardingProgressSheet } from './OnboardingProgressSheet';
import { OnboardingExitSurvey } from './OnboardingExitSurvey';
import { OnboardingDocumentSheet } from './OnboardingDocumentSheet';
import { OnboardingCameraPermission } from './OnboardingCameraPermission';
import { OnboardingEmailReference } from './OnboardingEmailReference';
import type { OnboardingInformationKind } from '@/features/ro-onboarding/information';
import { onboardingFixture } from '@/features/ro-onboarding/variants';
import {
  OUTCOME_ACTIONS,
  isOnboardingOutcome,
  type OnboardingOutcome,
} from '@/features/ro-onboarding/outcomes';
import {
  OnboardingCards,
  OnboardingCardConfiguration,
} from './OnboardingCards';
import {
  cardPage,
  cardSelectionLabel,
  physicalCardTiers,
  canContinueCardPage,
  nextCardPage,
  selectedCardAccounts,
} from '@/features/ro-onboarding/cards';
import {
  OnboardingIdentityConsent,
  OnboardingScanGuidelines,
  OnboardingScanSurface,
  OnboardingPersonalSummary,
  OnboardingAddressSummary,
} from './OnboardingIdentityPages';
import {
  OnboardingStageBar,
  OnboardingPrivacy,
  OnboardingContactInput,
  OnboardingOtp,
  OnboardingEmailVerified,
} from './OnboardingContactPages';
import { OnboardingVerificationBlocked } from './OnboardingVerificationBlocked';
import {
  onboardingSession,
  type OnboardingDraft,
} from '@/features/ro-onboarding/session';
import {
  OnboardingRecoveryPage,
  OnboardingPausePage,
} from './OnboardingRecoveryPages';
import { OnboardingOffer } from './OnboardingOffer';
import {
  changeOnboardingOffer,
  type OnboardingOffer as Offer,
} from '@/features/ro-onboarding/offers';
import {
  OnboardingEmployment,
  OnboardingEmployer,
} from './OnboardingEmployment';
import { OnboardingIntroduction } from './OnboardingIntroduction';
import { OnboardingRecommendation } from './OnboardingRecommendation';
import {
  OnboardingDeclarations,
  OnboardingSteps,
} from './OnboardingProductPages';

/** Local demonstration: no identification, messages or contracts leave this device. */
export function RomanianOnboarding({
  initialStep,
  journey = 'onboarding',
  onClose,
  topInset = 44,
  onBackHandlerChange,
}: {
  initialStep?: OnboardingStep;
  journey?: 'onboarding' | 'cash-loan';
  onClose: () => void;
  topInset?: number;
  onBackHandlerChange?: (handler: (() => boolean) | null) => void;
}) {
  const loan = journey === 'cash-loan';
  initialStep = initialStep || (loan ? 'loan-introduction' : 'introduction');
  const steps: ReadonlyArray<readonly [string, string, string]> = loan
    ? CASH_LOAN_STEPS
    : ONBOARDING_STEPS;
  const {
    readOnboardingDraft,
    saveOnboardingDraft,
    clearOnboardingDraft,
    unlockOnboardingDraft,
    submitResumePhone,
  } = loan ? cashLoanSession : onboardingSession;
  const fixture = loan
    ? cashLoanFixture(initialStep)
    : onboardingFixture(initialStep);
  const [loanOverride, setLoanOverride] = useState<string | null>(
    loan &&
      !steps.some(row => row[0] === fixture.base) &&
      fixture.base.startsWith('loan-')
      ? fixture.base
      : null,
  );
  const [loanDocument, setLoanDocument] = useState<{
    title: string;
    agreement?: string;
  } | null>(null);
  const [addressSearch, setAddressSearch] = useState('');
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      steps.findIndex(s => s[0] === fixture.base),
    ),
  );
  const [values, setValues] = useState<Record<string, string>>(fixture.values);
  const [checks, setChecks] = useState<Record<string, boolean>>({
    lei: true,
    virtual: false,
    sameAddress: true,
    ...fixture.checks,
  });
  const [error, setError] = useState(
    initialStep.endsWith('-input-invalid')
      ? 'Numărul nu este valid, te rugăm să reîncerci'
      : '',
  );
  const [addressSheet, setAddressSheet] = useState<string | null>(null);
  const [editingTransactions, setEditingTransactions] = useState(
    initialStep === 'transaction-details',
  );
  const [scanAttempt, setScanAttempt] = useState<ScanAttempt>(
    initialStep === 'scan-error'
      ? { failures: 1, status: 'retry' }
      : { failures: 0, status: 'ready' },
  );
  const [outcome, setOutcome] = useState<OnboardingOutcome | null>(() =>
    isOnboardingOutcome(initialStep) ? initialStep : null,
  );
  const [selfiePhase, setSelfiePhase] = useState<SelfiePhase>(
    initialStep === 'selfie-error'
      ? 'error'
      : initialStep === 'selfie-smile'
        ? 'smile'
        : initialStep === 'selfie-waiting'
          ? 'waiting'
          : 'center',
  );
  const [selfieFailures, setSelfieFailures] = useState(
    initialStep === 'selfie-error' ? 1 : 0,
  );
  const [document, setDocumentTitle] = useState<string | null>(
    initialStep === 'details-expanded' ? 'More details' : null,
  );
  const [legalDocument, setLegalDocument] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState(
    initialStep === 'camera-permission',
  );
  const [information, setInformation] =
    useState<OnboardingInformationKind | null>(
      initialStep === 'loan-phone-information'
        ? 'phone'
        : initialStep === 'loan-email-information'
          ? 'email'
          : initialStep === 'loan-biometrics-information'
            ? 'biometrics'
            : null,
    );
  const [progressMenu, setProgressMenu] = useState(false);
  const setDocument = (label: string | null) => {
    if (
      label &&
      (/^(NOTĂ|NOTA|FORMULAR|Taxe și comisioane)/.test(label) ||
        label === 'Trans Sped Contract')
    )
      setLegalDocument(label);
    else if (label === 'I AM NOT A PUBLICLY EXPOSED PERSON')
      setInformation('publiclyExposed');
    else if (label === 'Procesarea datelor biometrice')
      setInformation('biometrics');
    else if (label === 'Pașii procesului') setProgressMenu(true);
    else setDocumentTitle(label);
  };
  const [support, setSupport] = useState<string | null>(null);
  const [branchSelection, setBranchSelection] = useState(
    initialStep.startsWith('branch-'),
  );
  const [terminalBranch, setTerminalBranch] = useState(false);
  const [closing, setClosing] = useState(
    initialStep === 'pause-before-email' ||
      initialStep === 'pause-after-email' ||
      initialStep === 'pending-save' ||
      initialStep === 'loan-identity-pending',
  );
  const [exitSurvey, setExitSurvey] = useState(
    initialStep === 'exit-survey' || initialStep === 'exit-other',
  );
  const [recommendation, setRecommendation] = useState(
    initialStep.startsWith('recommendation'),
  );
  const [challenge, setChallenge] = useState(() => {
    const next = createOtpChallenge(Date.now());
    if (initialStep.endsWith('-expired'))
      return {
        ...next,
        issuedAt: Date.now() - 300001,
        status: 'expired' as const,
      };
    if (initialStep.endsWith('-invalid'))
      return { ...next, attempts: 1, status: 'invalid' as const };
    if (initialStep.endsWith('-resend-locked'))
      return { ...next, resends: 3, status: 'resend-locked' as const };
    if (initialStep.endsWith('-code-locked'))
      return { ...next, attempts: 3, status: 'code-locked' as const };
    if (initialStep.endsWith('-locked'))
      return { ...next, attempts: 3, status: 'locked' as const };
    if (initialStep === 'phone-verified')
      return { ...next, status: 'valid' as const };
    return next;
  });
  const [emailVerified, setEmailVerified] = useState(fixture.emailVerified);
  const [sendingCode, setSendingCode] = useState(
    initialStep.endsWith('-loading'),
  );
  const [code, setCode] = useState(
    initialStep === 'phone-verified'
      ? '124610'
      : initialStep.endsWith('-invalid')
        ? '000000'
        : '',
  );
  const [recovery, setRecovery] = useState<OnboardingRecoveryStep | null>(() =>
    ['resume-password', 'resume-phone', 'resume-code', 'link-expired'].includes(
      initialStep,
    )
      ? (initialStep as OnboardingRecoveryStep)
      : null,
  );
  const [resumeDraft, setResumeDraft] = useState<OnboardingDraft | null>(null);
  const [resumePassword, setResumePassword] = useState('');
  const [resumeDigits, setResumeDigits] = useState('');
  const [resumeRemaining, setResumeRemaining] = useState(3);
  const [pausePassword, setPausePassword] = useState('');
  const [expiresAt] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date.getTime();
  });
  const [baseStep, baseTitle] = steps[index];
  const step = loanOverride || baseStep;
  const title = loanOverride
    ? loanOverride === 'loan-data-review'
      ? 'Datele tale'
      : loanOverride === 'loan-extra-information'
        ? 'Alte solicitări/Info suplimentare'
        : loanOverride === 'loan-active-request'
          ? 'Cerere activa'
          : loanOverride === 'loan-cancel-request'
            ? 'Motivul anularii'
            : ''
    : baseTitle;
  const go = (target: string) => {
    if (
      [
        'resume-password',
        'resume-phone',
        'resume-code',
        'link-expired',
      ].includes(target)
    ) {
      setRecovery(target as OnboardingRecoveryStep);
      return;
    }
    const targetIndex = steps.findIndex(row => row[0] === target);
    setLoanOverride(targetIndex < 0 ? target : null);
    if (targetIndex >= 0) setIndex(targetIndex);
    setError('');
  };
  const validate = () =>
    editingTransactions
      ? validTransactionDetails(values)
        ? ''
        : 'Completează numărul și volumul tranzacțiilor.'
      : initialStep === 'contact-summary' && step === 'email-verified'
        ? ''
        : loan && step.startsWith('loan-')
          ? loanValidation(step, values, checks)
          : loan && step === 'email-verified'
            ? ''
            : loan && step === 'transactions'
              ? values.transactions && values.countries
                ? ''
                : 'Completează tranzacțiile și țările.'
              : onboardingValidation(
                  step,
                  values,
                  checks,
                  offer,
                  code,
                  editingTransactions,
                );
  useEffect(() => {
    if (!sendingCode || initialStep.endsWith('-loading')) return;
    const timer = setTimeout(() => setSendingCode(false), 400);
    return () => clearTimeout(timer);
  }, [sendingCode, initialStep]);
  useEffect(() => {
    if (
      !['phone-code', 'email-code', 'signature'].includes(step) &&
      recovery !== 'resume-code'
    )
      return;
    if (challenge.status !== 'ready' && challenge.status !== 'invalid') return;
    const timer = setTimeout(
      () => {
        setChallenge(current => ({ ...current, status: 'expired' }));
        setCode('');
      },
      Math.max(0, challenge.issuedAt + 300000 - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [step, recovery, challenge.issuedAt, challenge.status]);
  const sendAnotherCode = () => {
    const next = resendOtp(challenge, Date.now());
    setChallenge(next);
    setCode('');
    if (next.status === 'ready') setSendingCode(true);
  };
  const changeContact = () => {
    setIndex(
      steps.findIndex(
        item => item[0] === (step === 'email-code' ? 'email' : 'phone'),
      ),
    );
    setCode('');
    setChallenge(createOtpChallenge(Date.now()));
    setSendingCode(false);
    setEmailVerified(false);
  };
  useEffect(() => {
    if (loan) {
      if (!LOAN_ANALYSIS_STAGES.includes(step) || initialStep === step) return;
      const timer = setTimeout(() => {
        if (step === 'processing') clearOnboardingDraft();
        const next = nextCashLoanStage(step, values, checks);
        if (next) go(next);
      }, 1200);
      return () => clearTimeout(timer);
    }
    if (step !== 'processing') return;
    const timer = setTimeout(() => {
      clearOnboardingDraft();
      setEmailVerified(false);
      setIndex(steps.findIndex(item => item[0] === 'success'));
    }, 1000);
    return () => clearTimeout(timer);
  }, [step, loan]);
  useEffect(() => {
    if (step !== 'selfie-capture' || selfiePhase !== 'waiting') return;
    const timer = setTimeout(() => {
      if (initialStep === 'selfie-error') {
        setSelfieFailures(count => count + 1);
        setSelfiePhase('error');
      } else setIndex(steps.findIndex(item => item[0] === 'identified'));
    }, 1000);
    return () => clearTimeout(timer);
  }, [step, selfiePhase, initialStep]);
  const offer: Offer = ['optim', 'star', 'premium', 'prime'].includes(
    values.offer,
  )
    ? (values.offer as Offer)
    : 'optim';
  const update = (key: string, value: string) => {
    if (key === 'email' || key === 'phone') {
      setEmailVerified(false);
      setError('');
    }
    setValues(v => ({ ...v, [key]: value }));
    setChecks(v =>
      loan
        ? amendedLoanChecks(amendedOnboardingChecks(v, key), key)
        : amendedOnboardingChecks(v, key),
    );
  };
  const toggle = (key: string) =>
    setChecks(v => ({
      ...(loan
        ? amendedLoanChecks(amendedOnboardingChecks(v, key), key)
        : amendedOnboardingChecks(v, key)),
      [key]: !v[key],
    }));
  const loanCheck = (key: string, value: boolean) =>
    setChecks(v => ({ ...amendedLoanChecks(v, key), [key]: value }));
  const copy = (text: string) => <Text style={s.body}>{text}</Text>;
  const action = (label: string, onPress: () => void) => (
    <PrimaryButton label={label} onPress={onPress} variant="secondary" />
  );
  const doc = (label: string) =>
    action(label, () => {
      if (label === 'Get support' || label === 'Vreau Suport')
        setSupport(
          label === 'Get support' ? '+ 420 221 210 031' : '+ 4021 200 20 20',
        );
      else
        setDocument(
          label === 'Mai multe detalii'
            ? step === 'steps'
              ? 'Step details'
              : step === 'products' || step === 'loan-account-offer'
                ? 'Detalii produse'
                : 'More details'
            : label,
        );
    });
  const advance = () => {
    if (loan && step === 'loan-success') {
      clearOnboardingDraft();
      onClose();
      return;
    }
    if (
      loan &&
      ['loan-rejected', 'loan-online-ceased', 'loan-callback'].includes(step)
    ) {
      onClose();
      return;
    }
    if (loan && step === 'loan-identity-pending') {
      setClosing(true);
      return;
    }
    if (loan && step === 'loan-cancel-request') {
      if (!validate()) restart();
      return;
    }
    if (
      loan &&
      step !== 'loan-create-pin' &&
      step.endsWith('-pin') &&
      values.signPin !== values.pin
    ) {
      const attempts = Number(values.pinAttempts || '0') + 1;
      setValues(v => ({ ...v, pinAttempts: String(attempts), signPin: '' }));
      if (attempts >= 3) setChallenge({ ...challenge, status: 'locked' });
      else setError(`PIN incorect. Încercări rămase: ${3 - attempts}`);
      return;
    }
    if (step === 'scan-guidelines' && !checks.cameraAllowed) {
      setCameraPermission(true);
      return;
    }
    if (outcome) {
      if (outcome === 'pending') {
        setClosing(true);
        return;
      }
      const target = OUTCOME_ACTIONS[outcome].target;
      if (target === 'branch') {
        clearOnboardingDraft();
        setTerminalBranch(true);
        setOutcome(null);
        setBranchSelection(true);
      } else if (target === 'scan') {
        setOutcome(null);
        setIndex(steps.findIndex(item => item[0] === 'scan'));
      } else {
        clearOnboardingDraft();
        onClose();
      }
      return;
    }
    if (step === 'branch') {
      setBranchSelection(true);
      return;
    }
    if (editingTransactions) {
      if (validTransactionDetails(values)) setEditingTransactions(false);
      return;
    }
    if (step === 'cards') {
      if (!canContinueCardPage(offer, values, checks)) return;
      const currentPage = cardPage(values);
      const cardChecks =
        currentPage === 'types' || currentPage === 'recap'
          ? checks
          : {
              ...checks,
              [currentPage === 'standard' ? 'physical' : currentPage]: true,
            };
      setChecks(cardChecks);
      const next = nextCardPage(offer, values, cardChecks);
      if (next && !(loan && next === 'recap')) {
        const account = selectedCardAccounts(offer, checks)[0]?.[0] || '';
        setValues(current => ({
          ...current,
          cardPage: next,
          physicalTier: current.physicalTier || physicalCardTiers(offer)[0],
          virtualTier: current.virtualTier || 'standard',
          physicalAccount: current.physicalAccount || account,
          virtualAccount: current.virtualAccount || account,
          platinumAccount: current.platinumAccount || account,
        }));
        return;
      }
    }
    const message = validate();
    if (
      ['phone-code', 'email-code', 'signature'].includes(step) &&
      challenge.status !== 'valid'
    ) {
      const next = submitOtp(challenge, code, Date.now());
      setChallenge(next);
      if (next.status !== 'valid') return;
      if (step === 'phone-code') return;
      if (step === 'email-code') setEmailVerified(true);
    }
    if (message) {
      setError(message);
      return;
    }
    if (step === 'address' && !checks.sameAddress && !checks.addressReviewed) {
      setChecks(current => ({ ...current, addressReviewed: true }));
      return;
    }
    setError('');
    setCode('');
    setChallenge(createOtpChallenge(Date.now()));
    if (loan) {
      if (step === 'loan-extra-information') {
        go('loan-document-analysis');
        return;
      }
      if (step === 'loan-other-income') {
        const incomes = readIncomeEntries(values.incomes);
        const entry = { type: values.incomeType, amount: values.monthlyIncome };
        setValues(v => ({
          ...v,
          signPin: '',
          pinAttempts: '0',
          incomes: JSON.stringify([
            ...incomes.filter(row => row.type !== entry.type),
            entry,
          ]),
        }));
      } else if (step.endsWith('-pin'))
        setValues(v => ({ ...v, signPin: '', pinAttempts: '0' }));
      const next = nextCashLoanStage(step, values, checks);
      if (next) go(next);
    } else if (step === 'rating') {
      clearOnboardingDraft();
      onClose();
    } else if (step === 'employment' && values.employment !== 'EMPLOYED')
      setIndex(steps.findIndex(s => s[0] === 'products'));
    else setIndex(i => Math.min(i + 1, steps.length - 1));
  };
  const back = () => {
    if (loanOverride) {
      setLoanOverride(null);
      return;
    }
    if (editingTransactions) {
      setEditingTransactions(false);
      return;
    }
    if (step === 'cards' && cardPage(values) !== 'types') {
      update('cardPage', 'types');
      return;
    }
    setError('');
    if (step === 'products' && values.employment !== 'EMPLOYED')
      setIndex(steps.findIndex(s => s[0] === 'employment'));
    else if (index) setIndex(i => i - 1);
    else onClose();
  };
  useEffect(() => {
    onBackHandlerChange?.(() => {
      if (loanDocument) setLoanDocument(null);
      else if (legalDocument) setLegalDocument(null);
      else if (information) setInformation(null);
      else if (branchSelection) setBranchSelection(false);
      else if (document) setDocument(null);
      else if (closing) setClosing(false);
      else if (
        outcome ||
        ['locked', 'resend-locked'].includes(challenge.status)
      ) {
        clearOnboardingDraft();
        onClose();
      } else if (step === 'selfie-capture' || recovery || index === 0)
        setClosing(true);
      else back();
      return true;
    });
    return () => onBackHandlerChange?.(null);
  }, [
    onBackHandlerChange,
    loanDocument,
    legalDocument,
    information,
    branchSelection,
    document,
    closing,
    outcome,
    challenge.status,
    step,
    recovery,
    index,
    values.cardPage,
    values.employment,
    editingTransactions,
  ]);
  let content: React.ReactNode;
  switch (step) {
    case 'introduction':
      content = recommendation ? (
        <OnboardingRecommendation
          value={values.recommendation || ''}
          onChange={value => update('recommendation', value)}
          onContinue={() => {
            setChecks(current => ({
              ...current,
              recommendationVerified: true,
            }));
            setRecommendation(false);
          }}
        />
      ) : (
        <OnboardingIntroduction
          recommended={!!checks.recommendationVerified}
          onRecommendation={() => setRecommendation(true)}
        />
      );
      break;
    case 'employment':
      content = (
        <OnboardingEmployment
          value={values.employment || ''}
          onChange={v => update('employment', v)}
        />
      );
      break;
    case 'employer':
      content = (
        <OnboardingEmployer
          search={values.employerSearch || ''}
          onSearch={v => update('employerSearch', v)}
          onSelect={v => {
            update('employer', v);
            setIndex(steps.findIndex(s => s[0] === 'products'));
          }}
        />
      );
      break;
    case 'products':
      content = (
        <OnboardingOffer
          offer={offer}
          employer={values.employer || ''}
          checks={checks}
          toggle={toggle}
          onDocument={setDocument}
          onEmployer={() => setIndex(steps.findIndex(s => s[0] === 'employer'))}
          onOffer={next => {
            setValues(current => ({
              ...current,
              offer: next,
              cardPage: 'types',
              physicalTier: physicalCardTiers(next)[0],
              virtualTier: 'standard',
              physicalAccount: '',
              virtualAccount: '',
              platinumAccount: '',
            }));
            setChecks({
              ...changeOnboardingOffer(next, checks),
              physical: false,
              virtual: false,
              platinum: false,
            });
          }}
        />
      );
      break;
    case 'declarations':
      content = <OnboardingDeclarations onSelect={setDocument} />;
      break;
    case 'steps':
      content = <OnboardingSteps />;
      break;
    case 'privacy':
      content = (
        <OnboardingPrivacy
          accepted={!!checks.privacy}
          onToggle={() => toggle('privacy')}
          onDocument={setDocument}
        />
      );
      break;
    case 'phone':
    case 'email':
      content = (
        <OnboardingContactInput
          kind={step}
          cashLoan={loan}
          value={values[step] || ''}
          onChange={v => update(step, v)}
          error={error}
        />
      );
      break;
    case 'phone-code':
    case 'email-code':
    case 'signature':
      content = (
        <OnboardingOtp
          kind={
            step === 'email-code'
              ? 'email'
              : step === 'signature'
                ? 'signature'
                : 'phone'
          }
          recipient={
            step === 'email-code'
              ? values.email || 'abc@gmail.com'
              : `+40 ${values.phone || '720020020'}`
          }
          value={code}
          onChange={setCode}
          challenge={challenge}
          sending={sendingCode}
          cashLoan={loan}
          onResend={sendAnotherCode}
        />
      );
      break;
    case 'identity':
      content = (
        <OnboardingIdentityConsent
          cashLoan={loan}
          accepted={!!checks.identification}
          onToggle={() => toggle('identification')}
          onDetails={() => setDocument('Identificare')}
        />
      );
      break;
    case 'email-verified':
      content =
        initialStep === 'precontract-email' ? (
          <OnboardingEmailReference
            onResume={() => setRecovery('resume-password')}
            onDocument={setLegalDocument}
          />
        ) : (
          <OnboardingEmailVerified
            cashLoan={loan}
            summary={initialStep === 'contact-summary'}
            phone={values.phone}
            recipient={values.email || 'abc@gmail.com'}
            accepted={!!checks.studyPeriod}
            onToggle={() => toggle('studyPeriod')}
          />
        );
      break;
    case 'scan-guidelines':
      content = <OnboardingScanGuidelines cashLoan={loan} />;
      break;
    case 'scan':
      content = (
        <OnboardingScanSurface
          review={false}
          failed={scanAttempt.status === 'retry'}
          remaining={3 - scanAttempt.failures}
          onCapture={() => {
            const result = completeScan(
              scanAttempt,
              initialStep !== 'scan-error',
            );
            setScanAttempt(result);
            if (result.status === 'locked') {
              setOutcome('identification-failed');
              setIndex(steps.findIndex(item => item[0] === 'branch'));
            } else if (result.status === 'review') advance();
          }}
        />
      );
      break;
    case 'scan-review':
      content = (
        <OnboardingScanSurface
          review
          failed={false}
          remaining={3 - scanAttempt.failures}
          onCapture={() => {}}
        />
      );
      break;
    case 'personal':
      content = (
        <OnboardingPersonalSummary notice={initialStep === 'personal-notice'} />
      );
      break;
    case 'address':
      content = (
        <OnboardingAddressSummary
          values={values}
          sameAddress={!!checks.sameAddress}
          onChange={update}
          onToggle={() => toggle('sameAddress')}
          onSelect={key => {
            setAddressSearch('');
            setAddressSheet(key);
          }}
          reviewed={!!checks.addressReviewed}
          onEdit={() =>
            setChecks(current => ({ ...current, addressReviewed: false }))
          }
        />
      );
      break;
    case 'selfie':
      content = (
        <OnboardingIdentityConsent
          selfie
          cashLoan={loan}
          accepted={!!checks.biometrics}
          onToggle={() => toggle('biometrics')}
          onDetails={() => setDocument('Procesarea datelor biometrice')}
        />
      );
      break;
    case 'selfie-capture':
      content = null;
      break;
    case 'identified':
      content = (
        <OnboardingResult
          kind="identified"
          content={
            loan
              ? { title: 'Identificare făcută cu success', body: '' }
              : undefined
          }
        />
      );
      break;
    case 'additional':
      content = (
        <OnboardingQuestionnaire
          cashLoan={loan}
          mode="additional"
          values={values}
          accepted={!!checks.financial}
          onChange={update}
          onToggle={() => toggle('financial')}
          onDetails={() => setEditingTransactions(true)}
        />
      );
      break;
    case 'transactions':
      content = (
        <OnboardingQuestionnaire
          cashLoan={loan}
          mode={editingTransactions ? 'details' : 'transactions'}
          values={values}
          accepted={!!checks.financial}
          onChange={update}
          onToggle={() => toggle('financial')}
          onDetails={() => setEditingTransactions(true)}
        />
      );
      break;
    case 'branch':
      content = <OnboardingResult kind={outcome || 'branch'} />;
      break;
    case 'marketing':
      content = (
        <OnboardingMarketing
          checks={checks}
          cashLoan={loan}
          onToggle={toggle}
          onDetails={setDocument}
        />
      );
      break;
    case 'cards':
      content = (
        <OnboardingCards
          cashLoan={loan}
          offer={offer}
          values={values}
          checks={checks}
          onChange={update}
          onToggle={toggle}
        />
      );
      break;
    case 'delivery':
      content = (
        <OnboardingCardConfiguration
          values={values}
          checks={checks}
          offer={offer}
          onChange={update}
        />
      );
      break;
    case 'contract':
      content = (
        <OnboardingContract
          checks={checks}
          initialWarning={initialStep === 'contract-warning'}
          onToggle={toggle}
          onRead={() =>
            setChecks(current => ({ ...current, documentRead: true }))
          }
          onDocument={setDocument}
        />
      );
      break;
    case 'processing':
      content = loan ? null : <OnboardingResult kind="processing" />;
      break;
    case 'success':
      content = <OnboardingResult kind="success" />;
      break;
    case 'rating':
      content = (
        <OnboardingRating
          value={Number(values.rating || 0)}
          comment={values.comment || ''}
          onRating={value => update('rating', String(value))}
          onComment={value => update('comment', value)}
        />
      );
      break;
  }
  if (loan && (step.startsWith('loan-') || step === 'processing'))
    content = (
      <CashLoanPages
        key={step}
        step={step}
        values={values}
        checks={checks}
        onChange={update}
        onCheck={loanCheck}
        onDocument={(title, agreement) => setLoanDocument({ title, agreement })}
        onGo={go}
        onClose={onClose}
      />
    );
  const restart = () => {
    setLoanOverride(null);
    setLoanDocument(null);
    clearOnboardingDraft();
    setIndex(0);
    setValues(loan ? cashLoanFixture('loan-introduction').values : {});
    setChecks({ lei: true, virtual: false, sameAddress: true });
    setChallenge(createOtpChallenge(Date.now()));
    setEmailVerified(false);
    setCode('');
    setError('');
    setRecovery(null);
    setClosing(false);
    setExitSurvey(false);
    setPausePassword('');
    setResumePassword('');
    setResumeDigits('');
    setResumeRemaining(3);
    setOutcome(null);
    setScanAttempt({ failures: 0, status: 'ready' });
    setEditingTransactions(false);
    setAddressSheet(null);
    setBranchSelection(false);
    setTerminalBranch(false);
    setSelfiePhase('center');
    setSelfieFailures(0);
    setSendingCode(false);
    setCameraPermission(false);
  };
  const continueRecovery = async () => {
    setError('');
    if (recovery === 'resume-password') {
      const result = await unlockOnboardingDraft(resumePassword, Date.now());
      if (result.status === 'expired') setRecovery('link-expired');
      else if (result.status === 'locked')
        setChallenge({ ...challenge, status: 'locked' });
      else if (result.status === 'invalid') {
        setResumeRemaining(result.remaining);
        setError('Parolă incorectă');
      } else if (result.status === 'valid') {
        setResumeDraft(result.draft);
        setRecovery('resume-phone');
      }
    } else if (recovery === 'resume-phone') {
      const draft = resumeDraft || readOnboardingDraft(Date.now());
      if (!draft) {
        setRecovery('link-expired');
        return;
      }
      const result = submitResumePhone(resumeDigits, Date.now());
      if (result.status === 'locked')
        setChallenge({ ...challenge, status: 'locked' });
      else if (result.status === 'invalid')
        setError(`Număr incorect. Încercări rămase: ${result.remaining}`);
      else if (result.status === 'expired') setRecovery('link-expired');
      else {
        setRecovery('resume-code');
        setChallenge(createOtpChallenge(Date.now()));
        setCode('');
      }
    } else if (recovery === 'resume-code') {
      const next = submitOtp(challenge, code, Date.now());
      setChallenge(next);
      if (next.status === 'valid') {
        const draft = readOnboardingDraft(Date.now());
        if (!draft) {
          setRecovery('link-expired');
          return;
        }
        setIndex(Math.max(0, Math.min(draft.index, steps.length - 1)));
        const { resumeLoanOverride: restoredOverride, ...restoredValues } =
          draft.values;
        setValues(restoredValues);
        setLoanOverride(loan ? restoredOverride || null : null);
        setChecks(draft.checks);
        setEmailVerified(true);
        setRecovery(null);
        setChallenge(createOtpChallenge(Date.now()));
        setCode('');
      }
    }
  };
  const identificationStage = [
    'identity',
    'scan-guidelines',
    'personal',
    'address',
    'selfie',
    'identified',
  ].includes(step);
  const contactStage = [
    'privacy',
    'phone',
    'phone-code',
    'email',
    'email-code',
    'email-verified',
  ].includes(step);
  const retryScan = () => {
    setScanAttempt({ ...scanAttempt, status: 'ready' });
    setIndex(steps.findIndex(item => item[0] === 'scan'));
  };
  if (
    (challenge.status === 'locked' || challenge.status === 'resend-locked') &&
    !document
  )
    return (
      <>
        <OnboardingVerificationBlocked
          reason={
            loan && step.endsWith('-pin')
              ? 'pin'
              : recovery === 'resume-password'
                ? 'password'
                : recovery === 'resume-phone'
                  ? 'phone'
                  : 'otp'
          }
          resend={challenge.status === 'resend-locked'}
          topInset={topInset}
          onRestart={restart}
          onSupport={() => setSupport('+ 4021 200 20 20')}
          onClose={onClose}
        />
        {support && (
          <OnboardingSupport
            number={support}
            onClose={() => setSupport(null)}
          />
        )}
      </>
    );
  if (recovery && !document)
    return (
      <OnboardingRecoveryPage
        mode={recovery}
        password={resumePassword}
        digits={resumeDigits}
        phone={
          resumeDraft?.values.phone ||
          readOnboardingDraft(Date.now())?.values.phone ||
          '720020020'
        }
        code={code}
        challenge={challenge}
        error={error}
        remaining={resumeRemaining}
        topInset={topInset}
        onPassword={setResumePassword}
        onDigits={setResumeDigits}
        onCode={setCode}
        onContinue={continueRecovery}
        onRestart={restart}
        onClose={onClose}
        onResend={() => {
          setChallenge(resendOtp(challenge, Date.now()));
          setCode('');
        }}
      />
    );
  if (exitSurvey)
    return (
      <OnboardingExitSurvey
        topInset={topInset}
        initialOther={initialStep === 'exit-other'}
        onClose={onClose}
      />
    );
  if (closing)
    return (
      <OnboardingPausePage
        password={pausePassword}
        onPassword={setPausePassword}
        emailVerified={emailVerified}
        pending={
          outcome === 'pending' ||
          initialStep === 'pending-save' ||
          step === 'loan-identity-pending'
        }
        loanPending={loan && step === 'loan-identity-pending'}
        topInset={topInset}
        expiry={new Date(expiresAt).toLocaleDateString('ro-RO')}
        onContinue={() => setClosing(false)}
        onClose={() => {
          clearOnboardingDraft();
          setExitSurvey(true);
        }}
        onSave={async () => {
          try {
            await saveOnboardingDraft(
              {
                index,
                values: loanOverride
                  ? { ...values, resumeLoanOverride: loanOverride }
                  : values,
                checks,
                emailVerified,
                completed: false,
                expiresAt,
              },
              pausePassword,
            );
            setExitSurvey(true);
          } catch {
            setClosing(false);
            setOutcome('system-error');
            setIndex(steps.findIndex(item => item[0] === 'branch'));
          }
        }}
      />
    );
  if (step === 'selfie-capture' && !document && !closing)
    return (
      <OnboardingSelfieCapture
        phase={selfiePhase}
        remaining={Math.max(0, 3 - selfieFailures)}
        topInset={topInset}
        onCapture={() =>
          setSelfiePhase(selfiePhase === 'center' ? 'smile' : 'waiting')
        }
        onRetry={() => {
          if (selfieFailures >= 3) {
            setOutcome('identification-failed');
            setIndex(steps.findIndex(item => item[0] === 'branch'));
          } else setSelfiePhase('center');
        }}
        onClose={() => setClosing(true)}
      />
    );
  return (
    <View style={s.root}>
      <BaselinePageHeader
        title={
          (initialStep === 'contact-summary' && step === 'email-verified'
            ? 'Your contact info'
            : '') ||
          (loan && step !== 'cards' && !document ? title : '') ||
          (document === 'Step details' ? 'More details' : document) ||
          (editingTransactions ? 'Detalii despre tranzacții' : '') ||
          (step === 'cards'
            ? cardPage(values) === 'types'
              ? 'Alege tipul de card'
              : cardPage(values) === 'recap'
                ? 'Your card selections'
                : loan && cardPage(values) === 'virtual'
                  ? 'Selectează cardul virtual'
                  : 'Selectează cardul fizic'
            : step === 'delivery'
              ? 'Configurarea cardului'
              : '') ||
          (closing
            ? 'Închizi procesul?'
            : recommendation
              ? 'I received a recommendation'
              : step === 'introduction'
                ? 'Aplica 100% online'
                : step === 'products'
                  ? 'Select your offer'
                  : step === 'rating'
                    ? initialStep === 'rating-ro'
                      ? 'Părerea ta contează'
                      : 'Would you\nrecommend us?'
                    : ['phone', 'phone-code'].includes(step)
                      ? 'Verificare numar mobil'
                      : ['email', 'email-code'].includes(step)
                        ? 'Verificare adresa e-mail'
                        : step === 'privacy'
                          ? 'Consimtamantul privind confidentialitatea datelor'
                          : title)
        }
        onBack={
          document
            ? () => setDocument(null)
            : recommendation
              ? () => setRecommendation(false)
              : back
        }
        showBack={
          (loan
            ? !isCashLoanResult(step) &&
              ![
                'loan-introduction',
                'loan-active-request',
                'loan-financial',
                'loan-agreements',
                'loan-account-offer',
                'loan-contract',
                'marketing',
                'phone',
                'email',
                'email-verified',
              ].includes(step)
            : ![
                'introduction',
                'identity',
                'scan-guidelines',
                'personal',
                'address',
                'selfie',
                'identified',
                'marketing',
                'branch',
                'contract',
                'signature',
                'processing',
                'success',
                ...(initialStep === 'precontract-email'
                  ? ['email-verified']
                  : []),
                'rating',
              ].includes(step)) ||
          recommendation ||
          !!document
        }
        largeTitleGutter={24}
        largeTitleNumberOfLines={0}
        rightActionIcon={
          !['identified', 'processing', 'success'].includes(step) &&
          !(loan && step.endsWith('-pin')) ? (
            <SourceCustomIcon
              name="close-flow"
              size={20}
              color={sourceColor('var(--uc-text)')}
            />
          ) : undefined
        }
        rightActionLabel="Închide"
        onRightActionPress={() =>
          ['success', 'rating'].includes(step)
            ? onClose()
            : step === 'processing'
              ? undefined
              : setClosing(true)
        }
        showHelp={false}
        hideCollapsedTitleWhenHidden
        renderLargeTitle={
          (initialStep !== 'precontract-email' &&
            !isCashLoanResult(loan ? step : '') &&
            ![
              'scan',
              'scan-review',
              'identified',
              'branch',
              'processing',
              'success',
            ].includes(step) &&
            !outcome) ||
          !!document
        }
        includeSafeArea
        safeAreaReserve={topInset}
      />
      {!loan &&
        !document &&
        !closing &&
        !editingTransactions &&
        step !== 'identified' &&
        initialStep !== 'precontract-email' &&
        (contactStage ||
          identificationStage ||
          [
            'additional',
            'transactions',
            'marketing',
            'cards',
            'delivery',
            'contract',
            'signature',
          ].includes(step)) && (
          <OnboardingStageBar
            stage={
              identificationStage
                ? 2
                : contactStage
                  ? 1
                  : ['cards', 'delivery'].includes(step)
                    ? 4
                    : ['contract', 'signature'].includes(step)
                      ? 5
                      : 3
            }
            label={
              identificationStage
                ? 'Confirmarea identitatii'
                : contactStage
                  ? 'Date de contact'
                  : ['cards', 'delivery'].includes(step)
                    ? 'Personalizarea produsului'
                    : ['contract', 'signature'].includes(step)
                      ? 'Sign Contract'
                      : 'Date suplimentare'
            }
            total={
              step.startsWith('email') ||
              ['contract', 'signature'].includes(step)
                ? 5
                : 6
            }
            onMenu={() => setDocument('Pașii procesului')}
          />
        )}
      <ScrollView
        key={`${step}:${document}:${closing}`}
        contentContainerStyle={[
          s.content,
          recommendation && { flexGrow: 1 },
          (contactStage || identificationStage) && { paddingTop: 24 },
          ['scan', 'scan-review'].includes(step) && { paddingTop: 0 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {closing ? (
          <>
            {copy(
              'Dacă închizi acum, datele introduse în această demonstrație vor fi pierdute.',
            )}
            {action('Continuă procesul', () => setClosing(false))}
            {action('Închide procesul', onClose)}
          </>
        ) : document ? (
          document === 'Step details' ? (
            <OnboardingSteps detailed />
          ) : document === 'More details' || document === 'Detalii produse' ? (
            <OnboardingDetails
              expandedSource={initialStep === 'details-expanded'}
              cashLoan={loan}
              products={document === 'Detalii produse'}
            />
          ) : (
            <>
              {copy(document)}
              {action('Am citit', () => setDocument(null))}
            </>
          )
        ) : (
          content
        )}
        {!!error && !['phone', 'email'].includes(step) && (
          <Text accessibilityRole="alert" style={s.error}>
            {error}
          </Text>
        )}
      </ScrollView>
      {(document === 'Step details' ||
        document === 'More details' ||
        document === 'Detalii produse') && (
        <View style={s.footer}>
          <PrimaryButton
            label={
              document === 'Step details' ? 'Incepe procesul' : 'Am inteles'
            }
            onPress={() => {
              setDocument(null);
              if (document === 'Step details') advance();
            }}
          />
        </View>
      )}
      {!document &&
        !closing &&
        !recommendation &&
        ![
          'employer',
          'processing',
          'loan-active-request',
          'loan-data-review',
        ].includes(step) &&
        !(loan && LOAN_ANALYSIS_STAGES.includes(step)) &&
        initialStep !== 'precontract-email' &&
        outcome !== 'received' &&
        outcome !== 'evaluation-waiting' &&
        (step !== 'scan' || scanAttempt.status === 'retry') && (
          <View style={s.footer}>
            <PrimaryButton
              label={
                initialStep === 'contact-summary' && step === 'email-verified'
                  ? 'Next'
                  : loan && step.startsWith('loan-')
                    ? step === 'loan-agreements'
                      ? 'Semneazǎ Acorduri'
                      : step !== 'loan-create-pin' && step.endsWith('-pin')
                        ? 'SIGN'
                        : [
                              'loan-success',
                              'loan-rejected',
                              'loan-callback',
                              'loan-online-ceased',
                            ].includes(step)
                          ? 'Inapoi in Mobile Banking'
                          : step === 'loan-identity-pending'
                            ? 'Confirm parola și revin mai târziu'
                            : 'Continuǎ'
                    : outcome
                      ? OUTCOME_ACTIONS[outcome].label
                      : challenge.status === 'code-locked' &&
                          ['phone-code', 'email-code', 'signature'].includes(
                            step,
                          )
                        ? step === 'signature'
                          ? 'Solicită un nou cod'
                          : step === 'email-code'
                            ? 'Schimb adresa de Email'
                            : 'Schimb numǎrul de telefon'
                        : step === 'cards' &&
                            !['types', 'recap'].includes(cardPage(values))
                          ? cardSelectionLabel(offer, values)
                          : step === 'success'
                            ? 'Continuă'
                            : step === 'rating'
                              ? 'Activeaza Mobile Banking'
                              : step === 'contract'
                                ? 'Send me an OTP'
                                : step === 'signature'
                                  ? 'Semneazǎ'
                                  : step === 'scan'
                                    ? 'Refă o nouă poză'
                                    : step === 'scan-review'
                                      ? 'Confirmă si continuǎ'
                                      : step === 'identity'
                                        ? loan
                                          ? 'Continuǎ'
                                          : 'Start'
                                        : step === 'selfie-capture'
                                          ? 'Simulează identificarea'
                                          : step === 'introduction'
                                            ? checks.recommendationVerified
                                              ? 'Next'
                                              : 'Continua'
                                            : step === 'declarations'
                                              ? 'I agree'
                                              : step === 'steps'
                                                ? 'Incepe procesul'
                                                : 'Continuă'
              }
              onPress={
                step === 'scan'
                  ? retryScan
                  : challenge.status === 'code-locked' &&
                      ['phone-code', 'email-code', 'signature'].includes(step)
                    ? step === 'signature'
                      ? sendAnotherCode
                      : changeContact
                    : advance
              }
              disabled={
                sendingCode ||
                (step === 'phone' || step === 'email'
                  ? !values[step]?.trim()
                  : challenge.status !== 'code-locked' && !!validate())
              }
            />
            {loan &&
              step === 'loan-summary' &&
              action('Modificǎ Oferta', () => go('loan-preliminary'))}
            {loan && step === 'loan-account-offer' && doc('Mai multe detalii')}
            {loan &&
              step === 'loan-other-income' &&
              action('Nu am alte tipuri de venit', () => {
                const entries = readIncomeEntries(values.incomes);
                const last = entries[entries.length - 1];
                setChecks(current => ({ ...current, otherIncome: !!last }));
                setValues(current => ({
                  ...current,
                  incomeType: last?.type || '',
                  monthlyIncome: last?.amount || '',
                }));
                go('loan-offer-analysis');
              })}
            {loan &&
              step === 'loan-income-summary' &&
              action('Adaugǎ alte tipuri de venit', () => {
                setValues(current => ({
                  ...current,
                  incomeType: '',
                  monthlyIncome: '',
                  employerCui: '',
                  incomeOccupation: '',
                  employmentDate: '',
                  incomeContract: '',
                }));
                go('loan-other-income');
              })}
            {['introduction', 'products', 'steps'].includes(step) &&
              doc('Mai multe detalii')}
            {step === 'declarations' && doc('Get support')}
            {outcome === 'system-error' && doc('Vreau Suport')}
            {challenge.status === 'code-locked' &&
              ['phone-code', 'email-code'].includes(step) &&
              doc('Vreau Suport')}
            {challenge.status === 'expired' &&
              ['phone-code', 'email-code'].includes(step) &&
              action(
                step === 'email-code'
                  ? 'Schimb adresa de Email'
                  : 'Schimb numǎrul de telefon',
                changeContact,
              )}
            {outcome === 'existing-customer' && action('Închide', onClose)}
            {step === 'scan-review' && action('Refă o nouă poză', retryScan)}
          </View>
        )}
      {addressSheet && (
        <OnboardingSheet
          title={
            addressSheet === 'correspondence'
              ? 'Adresa de corespondență'
              : addressSheet === 'residenceCounty'
                ? 'Județ | Sector'
                : 'Oraș'
          }
          onClose={() => setAddressSheet(null)}
          footer={
            <PrimaryButton
              label="Continuă"
              onPress={() => setAddressSheet(null)}
              disabled={!values[addressSheet]}
            />
          }
        >
          {addressSheet !== 'correspondence' && (
            <BaselineTextField
              label="Search"
              value={addressSearch}
              onChange={setAddressSearch}
              trailingIconName="search"
            />
          )}
          {(addressSheet === 'correspondence'
            ? [
                [
                  'home',
                  'ADRESA DE DOMICILIU: Sos Iancului, 41, AP. 65, 021918',
                ],
                [
                  'residence',
                  `ADRESA DE REȘEDINȚĂ: ${values.residenceStreet || ''}, ${values.residenceNumber || ''}, ${values.residencePostal || ''}`,
                ],
              ]
            : addressChoices(addressSheet, addressSearch).map(v => [v, v])
          ).map(([value, label]) => (
            <RadioButton
              key={value}
              label={label}
              selected={values[addressSheet] === value}
              onPress={() => update(addressSheet, value)}
              paddingHorizontal={0}
              labelStyle={{
                color: sourceColor('var(--uc-text)'),
                fontSize: 16,
              }}
            />
          ))}
        </OnboardingSheet>
      )}
      {support && (
        <OnboardingSupport number={support} onClose={() => setSupport(null)} />
      )}
      {branchSelection && (
        <OnboardingBranches
          initialState={
            initialStep === 'branch-detail'
              ? 'detail'
              : initialStep === 'branch-list'
                ? 'list'
                : 'map'
          }
          onClose={() => setBranchSelection(false)}
          onSelect={id => {
            if (terminalBranch) {
              onClose();
              return;
            }
            update('branch', id);
            setBranchSelection(false);
            if (loan) {
              const next = nextCashLoanStage('branch', values, checks);
              if (next) go(next);
            } else setIndex(steps.findIndex(item => item[0] === 'marketing'));
          }}
        />
      )}
      {information && (
        <OnboardingInformationSheet
          kind={information}
          cashLoan={loan}
          onClose={() => setInformation(null)}
        />
      )}
      {loanDocument && (
        <OnboardingDocumentSheet
          key={loanDocument.title}
          title={loanDocument.title}
          onClose={() => setLoanDocument(null)}
          onAgree={() => {
            if (loanDocument.agreement) loanCheck(loanDocument.agreement, true);
            setLoanDocument(null);
          }}
        />
      )}
      {legalDocument && (
        <OnboardingDocumentSheet
          title={legalDocument}
          annex={legalDocument.startsWith('Taxe')}
          onClose={() => setLegalDocument(null)}
          onAgree={() => {
            if (legalDocument.startsWith('Taxe'))
              setChecks(current => ({ ...current, terms: true }));
            setLegalDocument(null);
          }}
        />
      )}
      {cameraPermission && (
        <OnboardingCameraPermission
          onBlock={() => setCameraPermission(false)}
          onAllow={() => {
            setCameraPermission(false);
            setChecks(current => ({ ...current, cameraAllowed: true }));
            setIndex(steps.findIndex(item => item[0] === 'scan'));
          }}
        />
      )}
      {progressMenu && (
        <OnboardingProgressSheet
          stage={
            identificationStage
              ? 2
              : contactStage
                ? 1
                : ['cards', 'delivery'].includes(step)
                  ? 4
                  : ['contract', 'signature'].includes(step)
                    ? 5
                    : 3
          }
          onClose={() => setProgressMenu(false)}
        />
      )}
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: sourceColor('var(--uc-surface)') },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24, gap: 24 },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  section: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    color: sourceColor('var(--uc-text)'),
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  label: {
    flex: 1,
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  capture: {
    minHeight: 200,
    borderWidth: 2,
    borderRadius: 16,
    borderColor: sourceColor('var(--uc-action)'),
    padding: 24,
    justifyContent: 'center',
  },
  error: { color: sourceColor('var(--uc-status-red)'), fontSize: 16 },
  footer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 34, gap: 8 },
});
