import type { FlowDefinition, FlowScreenKind, FlowScreenSpec } from '@/app/screens/flow-library/flows/types'
import { CASH_LOAN_STEPS, CASH_LOAN_VARIANTS } from '@/features/ro-cash-loan/model'
import { onboardingScreenContract } from '../onboarding/screenContracts'

export const CASH_LOAN_SHARED_STATES = [
  ['address-different', 'Adresă de reședință diferită', '9453:160729'],
  ['address-summary', 'Confirmă adresele modificate', '9453:162067'],
  ['personal-notice', 'Corectarea datelor din document', '9453:160687'],
  ['scan-error', 'Scanare nereușită', '9534:197109'],
  ['selfie-smile', 'Smile in the camera', '9453:162710'],
  ['selfie-waiting', 'Identification in progress', '9453:162712'],
  ['selfie-error', 'Recognition failed', '9453:162714'],
  ['transaction-details', 'Detalii despre tranzacții', '24197:12443'],
  ['marketing-channels', 'Acorduri de marketing selectate', '9453:164422'],
  ['card-physical', 'Mastercard Standard fizic', '9453:165815'],
  ['card-virtual', 'Mastercard Standard virtual', '9453:165862'],
  ['document-expired', 'Cartea de identitate este expirată', '9453:162230'],
  ['document-retry', 'Reîncearcă să scanezi', '9453:162245'],
  ['identification-failed', 'Nu mai poți continua', '9453:162260'],
  ['existing-customer', 'Poți reinitia cererea din Mobile Banking', '9534:197421'],
  ['phone-verified', 'Număr verificat', '9453:164297'],
  ['phone-invalid', 'Cod SMS incorect', '9534:193331'],
  ['phone-expired', 'Cod SMS expirat', '9534:193805'],
  ['phone-code-locked', 'Solicită un nou cod SMS', '9534:193749'],
  ['phone-locked', 'Verificarea SMS blocată', '9453:159645'],
  ['phone-resend-locked', 'Retrimiterea SMS blocată', '9534:193964'],
  ['email-invalid', 'Cod email incorect', '9534:195572'],
  ['email-expired', 'Cod email expirat', '9534:195323'],
  ['email-code-locked', 'Solicită un nou cod email', '9534:195644'],
  ['email-locked', 'Verificarea email blocată', '9534:195473'],
  ['email-resend-locked', 'Retrimiterea email blocată', '9534:195403'],
  ['signature-invalid', 'Cod de semnare incorect', '9618:51632'],
  ['phone-input-invalid', 'Număr de telefon invalid', '9534:192824'],
  ['email-input-invalid', 'Adresă de email invalidă', '9534:194284'],
  ['phone-loading', 'Se trimite codul SMS', '9534:193423'],
  ['email-loading', 'Se trimite codul email', '9534:194993'],
  ['pause-before-email', 'Oprire înainte de verificare', '9453:165002'],
  ['pause-after-email', 'Salvează și revino', '9453:165039'],
  ['exit-survey', 'Motivul închiderii fluxului', '9453:165414'],
  ['exit-other', 'Alt motiv pentru închidere', '9534:195998'],
  ['branch-map', 'Harta sucursalelor', '16094:74575'],
  ['branch-list', 'Lista sucursalelor', '9930:97937'],
  ['branch-detail', 'Detalii sucursală', '9930:97603'],
  ['camera-permission', 'Permisiune pentru camera foto', '9534:196644'],
] as const
const RECOVERY = [
  ['resume-password', 'Continuă procesul · parola', '9453:165222'],
  ['resume-phone', 'Continuă procesul · telefon', '9453:165129'],
  ['resume-code', 'Continuă procesul · OTP', '9453:165296'],
  ['link-expired', 'Link expirat', '9618:52540'],
] as const
const screen = (id: string) => `ro-cash-loan-${id}` as FlowScreenKind
const FIELDS: Record<string, string[]> = {
  'loan-introduction': ['Optional friend and branch recommendation codes', 'Required privacy acknowledgement'],
  'loan-create-pin': ['Six-digit PIN', 'Matching PIN confirmation', 'Optional fingerprint preferences'],
  'loan-agreements': [
    'Credit request',
    'ANAF agreement',
    'Credit Bureau notice',
    'UCFIN GDPR',
    'Optional turnover and life-insurance offer permissions',
  ],
  'loan-financial': [
    'Professional status',
    'Employment contract',
    'Occupation',
    'Additional-income declaration',
    'Dependants',
    'Marital status',
  ],
  'loan-other-income': [
    'Income category',
    'Positive monthly income',
    'Employer CUI',
    'Occupation',
    'Employment date',
    'Contract type',
  ],
  'loan-income-documents': [
    'Income certificate, or decision and allowance slip',
    'Local PDF/PNG/JPEG selection, up to 10 MB',
    'Delete confirmation and source document models',
  ],
  'loan-preliminary': [
    '1,500–40,000 LEI amount',
    '6–60 whole months',
    'Insurance and Generali consent',
    'Repayment method',
    'Payment day',
    'Optional selected refinancing credits',
  ],
  'loan-summary': [
    'Offer summary',
    'Read and accept credit documents',
    'Qualified certificate',
    'Insurance documents when selected',
  ],
  'loan-refinancing': [
    'Financial institution',
    'Checksum-valid Romanian IBAN',
    'Contract number for each selected credit',
  ],
  'loan-contract': [
    'Payment method',
    'ISNE',
    'Credit contract',
    'Account-opening documents',
    'Study-period waiver after reading',
  ],
  'loan-rating': ['Optional five-star score', 'Optional comment', 'Optional low-score improvement reason'],
}
function specification(id: string, title: string, node: string): FlowScreenSpec {
  const base = CASH_LOAN_VARIANTS.find((row) => row[0] === id)?.[3] || id
  if (
    !base.startsWith('loan-') &&
    !['email-verified', 'transactions', 'marketing', 'identified', 'processing'].includes(base)
  )
    return onboardingScreenContract(base, title, node)
  return {
    title,
    purpose: title,
    defaultState: 'Source state; required data and document confirmations gate continuation.',
    fields: (FIELDS[base] || []).map((name) => ({
      name,
      type: 'Native shared component',
      required: !name.startsWith('Optional'),
      validation: 'Enforced by the shared onboarding model or loanValidation; source decisions remain in the feature.',
    })),
    states: CASH_LOAN_VARIANTS.filter((row) => row[3] === base).map((row) => row[1]),
    actions: [
      { label: 'Continue', result: 'Validate and follow the selected credit branch.' },
      { label: 'Close', result: 'Interrupt, save an encrypted verified draft or exit the terminal state.' },
    ],
    back: 'Preserve entered data; material amendments invalidate offer/contract acceptance.',
    edgeCases: [
      'All bank, identity, ANAF, credit, messaging and signature results are deterministic local fixtures. Files retain filenames locally; no upload occurs.',
    ],
    acceptance: [`Compare with Figma ${node}.`, 'Available only for PI Romania Baseline, from Loans and Flows.'],
  }
}
export const RO_CASH_LOAN_FLOW: FlowDefinition = {
  id: 'ro-cash-loan',
  title: 'Cash Loan · New to Bank · Romania',
  label: 'Cash Loan New to Bank',
  domain: 'Loans',
  countryScope: ['RO'],
  status: 'in-review',
  summary:
    'Complete Romanian Baseline local credit journey, reusing account-opening contacts, identification, cards and KYC.',
  figmaFile: 'RO · DBN · Flows',
  figmaNodeId: '9453:159644',
  sourceUrl: 'https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY/RO---DBN---Flows?node-id=9453-159644',
  specLayout: 'document-and-screens',
  overview: {
    purpose: 'Demonstrate Cash Loan New to Bank for PI Romania Baseline.',
    scopeNote:
      'Source financial figures and document placeholders are illustrative Figma fixtures, not a bank quotation. No live loan application is submitted.',
    businessAnalysis: {
      generalInformation: [{ label: 'Scope', value: 'PI · RO · Baseline · New to Bank' }],
      versionContext:
        'Cash Loan delta over common onboarding components. The onboarding CR applies to the account-opening journey; this credit journey preserves its own source content and order.',
      versionHistory: [
        {
          version: '1.0-review',
          date: '2026-11-13',
          detail:
            'Shared executable identification and account setup with credit-specific agreements, incomes, offers, refinancing, uploads, signing and isolated encrypted resumption.',
        },
      ],
      openIssues: [
        {
          reference: 'RO-LOAN-SERVICE',
          status: 'Open',
          title: 'External service boundary',
          detail:
            'Credit, ANAF, identity, SMS/email and signing use local fixtures. Source legal PDF content is unavailable.',
        },
      ],
      requirements: [{ title: 'Journey', items: CASH_LOAN_STEPS.map((row) => row[1]) }],
      currentStatus: [
        {
          title: 'Composition',
          items: [
            'Shared native screens are reused with credit source parameters.',
            'Source variants are accessible independently and consume the same model.',
          ],
        },
      ],
      proposedSolution: [
        {
          title: 'Reuse',
          items: [
            'One shared onboarding controller and native design system; only credit deltas have additional compositions.',
          ],
        },
      ],
      nonFunctionalRequirements: [
        {
          title: 'Validation',
          items: [
            'Keep encrypted drafts separate between account opening and credit.',
            'Preserve accessibility roles and source navigation.',
          ],
        },
      ],
    },
    entryPoints: [{ label: 'Loans · Apply 100% online', intent: 'Start the Romanian Baseline credit journey.' }],
    preconditions: ['PI Romania Baseline'],
    businessRules: [
      'Required agreements are read before signing.',
      'Income documents are required only for declared additional income.',
      'Refinancing account data is required for each selected external credit.',
      'OTP expiry and attempt/resend limits are shared with onboarding.',
    ],
    successDestinations: ['Inactive prelogin after the local demonstration.'],
    analyticsEvents: [],
    openQuestions: [],
    notes: [],
  },
  implementation: {
    sessionModel: {
      name: 'OnboardingDraft',
      shape: '{index,values,checks,emailVerified,completed,expiresAt}',
      description:
        'Same encrypted session store with a separate cash-loan storage key. PIN, values and consents remain local.',
    },
    guards: [
      {
        name: 'loanValidation',
        signature: '(stage,values,checks) => string',
        rules: [],
        enforcedOn: CASH_LOAN_STEPS.map((row) => screen(row[0])),
        test: 'tests/features/ro-cash-loan.test.ts; tests/screens/ro-cash-loan.test.tsx',
      },
    ],
    operations: [],
    openTechnicalQuestions: ['External services and legal document content are not provided by this demo.'],
    screenSource: {
      shell: 'RomanianOnboarding',
      screens: Object.fromEntries(
        [...CASH_LOAN_STEPS, ...CASH_LOAN_VARIANTS, ...CASH_LOAN_SHARED_STATES, ...RECOVERY].map((row) => [
          screen(row[0]),
          'RomanianOnboarding',
        ]),
      ),
    },
  },
  screenSpecs: Object.fromEntries(
    [...CASH_LOAN_STEPS, ...CASH_LOAN_VARIANTS, ...CASH_LOAN_SHARED_STATES, ...RECOVERY].map(([id, title, node]) => [
      screen(id),
      specification(id, title, node),
    ]),
  ),
  defaultScenarioId: 'main',
  scenarios: [
    {
      id: 'main',
      label: 'Cash Loan · New to Bank',
      description:
        'Main connected local journey. Optional income and refinancing stages follow their selected branches.',
      kind: 'happy',
      steps: CASH_LOAN_STEPS.map(([id, title]) => ({ id, title, description: title, screen: screen(id) })),
    },
    {
      id: 'resume',
      label: 'Reluare cerere',
      description: 'Save after email verification; resume with password, missing phone digits and OTP.',
      kind: 'alternate',
      steps: RECOVERY.slice(0, 3).map(([id, title]) => ({ id, title, description: title, screen: screen(id) })),
    },
    ...[...CASH_LOAN_VARIANTS, ...CASH_LOAN_SHARED_STATES, RECOVERY[3]].map(([id, title, node]) => ({
      id,
      label: title,
      description: `Source ${node}; same executable journey and validation.`,
      kind: (/invalid|expired|locked|failed|ceased|warning|rejected|error/.test(id) ? 'error' : 'alternate') as
        'error' | 'alternate',
      steps: [{ id, title, description: title, screen: screen(id) }],
    })),
  ],
}
