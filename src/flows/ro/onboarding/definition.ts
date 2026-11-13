import { ONBOARDING_STEPS, ONBOARDING_RECOVERY_STEPS } from '@/features/ro-onboarding/model'
import { ONBOARDING_VARIANTS } from '@/features/ro-onboarding/variants'
import type { FlowDefinition } from '@/app/screens/flow-library/flows/types'
import { onboardingScreenContract } from './screenContracts'

export const RO_ONBOARDING_FLOW: FlowDefinition = {
  id: 'ro-onboarding',
  title: 'Apply 100% online · Romania',
  label: 'Romania onboarding',
  summary: 'PI Romania Baseline onboarding, from product information to simulated signing.',
  domain: 'Onboarding',
  countryScope: ['RO'],
  status: 'in-review',
  figmaFile: 'RO · DBN · Flows',
  figmaNodeId: '9852:63285',
  sourceUrl: 'https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY/RO---DBN---Flows?node-id=9852-63285',
  specLayout: 'document-and-screens',
  implementation: {
    sessionModel: {
      name: 'OnboardingDraft',
      shape:
        '{ index: number; values: Record<string, string>; checks: Record<string, boolean>; emailVerified: boolean; completed: boolean; expiresAt: number }',
      description:
        'Local demonstration state. Resume verifies password, missing phone digits and OTP. No identification, mail, SMS, courier lookup or qualified signature service is contacted.',
    },
    guards: [
      {
        name: 'onboardingValidation',
        signature: '(step, values, checks, offer, code, editingTransactions) => string',
        rules: [],
        enforcedOn: ONBOARDING_STEPS.map(([id]) => `ro-onboarding-${id}` as const),
        test: 'tests/screens/ro-onboarding.test.tsx — completes the connected CR journey',
      },
      {
        name: 'submitOtp',
        signature: '(challenge, code, now) => OtpChallenge',
        rules: [],
        enforcedOn: ['ro-onboarding-phone-code', 'ro-onboarding-email-code', 'ro-onboarding-signature'],
        test: 'tests/features/ro-onboarding.test.ts — locks the current code on the third incorrect submission and allows a fresh code within the resend budget',
      },
      {
        name: 'amendedOnboardingChecks',
        signature: '(checks, key) => checks',
        rules: [],
        enforcedOn: ['ro-onboarding-contract'],
        test: 'tests/features/ro-onboarding-amendments.test.ts — requires reading and accepting the updated contract',
      },
    ],
    operations: [],
    openTechnicalQuestions: [
      'Service outcomes are deterministic local fixtures; production identification, messaging, signing and courier integrations are outside this demo.',
      'The source reference supplies PDF placeholders rather than legal document files.',
    ],
    screenSource: {
      shell: 'RomanianOnboarding',
      screens: Object.fromEntries(
        [...ONBOARDING_STEPS, ...ONBOARDING_RECOVERY_STEPS, ...ONBOARDING_VARIANTS].map(([id]) => [
          `ro-onboarding-${id}`,
          'RomanianOnboarding',
        ]),
      ),
    },
  },
  overview: {
    purpose: 'Demonstrate Romanian PI Baseline account opening.',
    scopeNote:
      'Local prototype. Identification, messages and signatures are simulated. Legal document contents are unavailable in the supplied Figma source.',
    businessAnalysis: {
      generalInformation: [{ label: 'Scope', value: 'PI · RO · Baseline' }],
      versionContext:
        'Original Romanian onboarding with the employment, offer, questionnaire and card changes from CR 6216:87322.',
      versionHistory: [
        {
          version: '1.0-review',
          date: '2026-11-13',
          detail:
            'Connected the complete local journey, CR, alternate outcomes, verification limits, card dependencies and password/phone/OTP resumption. Visual review is recorded per source in the audit.',
        },
      ],
      openIssues: [
        {
          reference: 'RO-ONB-01',
          status: 'Open',
          title: 'External service and source-document boundaries',
          detail:
            'Identification, SMS/email, courier and signing use local fixtures. The source provides PDF placeholders and only two FAQ answers. Browser drafts survive page reload in a password-encrypted session envelope; hosts without Web Crypto/sessionStorage use memory.',
        },
      ],
      requirements: [{ title: 'Journey', items: ONBOARDING_STEPS.map((s) => s[1]) }],
      currentStatus: [
        {
          title: 'Implementation status',
          items: [
            'The main prototype opens from Romanian Baseline prelogin and the Flow Library.',
            'The same Native journey handles contact verification, identification, questionnaire, reference branch, marketing, card configuration, contract reading, signing feedback and rating.',
            'The CR changes employment collection, offer/account composition, questionnaire and card selections without removing the remaining base journey.',
            'Error, retry, interruption, save/resume and source variant states are individually accessible from the Journey paths.',
          ],
        },
      ],
      proposedSolution: [
        {
          title: 'Complete source coverage',
          items: [
            'Preserve the complete base journey and apply CR changes only to the affected screens and branching rules.',
            'Use the shared Native implementation for both entry points.',
            'Track every source frame, implemented variant and verification result in docs/tasks/2026-11-13-ro-onboarding-figma-audit.md.',
          ],
        },
      ],
      nonFunctionalRequirements: [
        {
          title: 'Acceptance',
          items: [
            'Verify each screen against its source context and screenshot in the real host.',
            'Exercise required-field, verification-code, cancellation and recovery states.',
            'Preserve accessible labels, keyboard operation and the Romanian Baseline scope.',
          ],
        },
      ],
    },
    entryPoints: [{ label: 'Apply 100% online', intent: 'Start onboarding from Romanian inactive prelogin.' }],
    preconditions: ['PI Romania Baseline'],
    businessRules: [
      'Each code expires after five minutes and allows three attempts. A new code resets its attempts within the shared three-resend budget.',
      'Marketing consent is optional.',
    ],
    successDestinations: ['Return to inactive prelogin after the local demonstration.'],
    analyticsEvents: [],
    openQuestions: [],
    notes: [],
  },
  screenSpecs: Object.fromEntries(
    [...ONBOARDING_STEPS, ...ONBOARDING_RECOVERY_STEPS, ...ONBOARDING_VARIANTS].map(([id, title, node]) => [
      `ro-onboarding-${id}`,
      onboardingScreenContract(id, title, node),
    ]),
  ),
  defaultScenarioId: 'main',
  scenarios: [
    {
      id: 'main',
      label: 'Open an account',
      description: 'Main Romanian baseline journey with simulated verification.',
      kind: 'happy',
      steps: ONBOARDING_STEPS.map(([id, title]) => ({ id, title, description: title, screen: `ro-onboarding-${id}` })),
    },
    {
      id: 'resume',
      label: 'Reluare sesiune',
      description:
        'Resume the local saved draft through password, phone and OTP verification. Save a draft after verifying the email first.',
      kind: 'alternate',
      steps: ONBOARDING_RECOVERY_STEPS.slice(0, 3).map(([id, title]) => ({
        id,
        title,
        description: title,
        screen: `ro-onboarding-${id}`,
      })),
    },
    {
      id: 'expired',
      label: 'Link expirat',
      description: 'Restart when the saved session is no longer available.',
      kind: 'error',
      steps: [
        {
          id: 'link-expired',
          title: 'Link expirat',
          description: 'The session link has expired.',
          screen: 'ro-onboarding-link-expired',
        },
      ],
    },
    ...ONBOARDING_VARIANTS.map(([id, title, node]) => ({
      id,
      label: title,
      description: `Source state ${node}; uses the same executable Romanian Baseline journey.`,
      kind: (/error|invalid|expired|locked|failed|ceased|conflict|uncovered|warning/.test(id)
        ? 'error'
        : 'alternate') as 'error' | 'alternate',
      steps: [{ id, title, description: title, screen: `ro-onboarding-${id}` as const }],
    })),
  ],
}
