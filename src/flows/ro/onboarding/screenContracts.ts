import type { FlowFieldSpec, FlowScreenSpec } from '@/app/screens/flow-library/flows/types'
import { ONBOARDING_VARIANTS } from '@/features/ro-onboarding/variants'

const field = (name: string, type: string, validation: string, required = true): FlowFieldSpec => ({
  name,
  type,
  required,
  validation,
})
const FIELDS: Record<string, FlowFieldSpec[]> = {
  employment: [
    field(
      'Employment status',
      'Single selection',
      'Employed opens employer search; other statuses continue to offers.',
    ),
  ],
  employer: [
    field('Search employer', 'Search', 'Filter the source employer fixtures; selecting a company returns to offers.'),
  ],
  products: [
    field('Current accounts', 'Multiple selection', 'At least one account allowed by the selected offer.'),
    field('Annex consent', 'Switch', 'Required; changing the offer clears acceptance.'),
  ],
  privacy: [
    field('Privacy consent', 'Switch', 'Required; the three source document links open executable document sheets.'),
  ],
  phone: [field('Romanian mobile number', 'Telephone', 'Nine digits starting with 7; +40 is a separate fixed prefix.')],
  'phone-code': [
    field(
      'SMS code',
      'Six-digit OTP',
      'Five-minute expiry; three incorrect attempts; three resends. Correct local fixture: 124610.',
    ),
  ],
  email: [field('Email address', 'Email', 'A nonempty local part, domain and domain suffix; no whitespace.')],
  'email-code': [
    field(
      'Email code',
      'Six-digit OTP',
      'Five-minute expiry; three incorrect attempts; three resends. Correct local fixture: 124610.',
    ),
  ],
  'email-verified': [field('Study period waiver', 'Switch', 'Required before the identification stage.')],
  identity: [field('Identification consent', 'Switch', 'Required before scan instructions.')],
  personal: [
    field(
      'OCR identity summary',
      'Read-only data',
      'Preserve the source sample; do not replace it with an identity-entry form.',
      false,
    ),
  ],
  address: [
    field('Postal code', 'Numeric', 'Exactly six digits.'),
    field('PO box', 'Numeric', 'Optional, up to 35 digits.', false),
    field(
      'Same residence and correspondence address',
      'Switch',
      'Turning off reveals the residence and correspondence fields.',
    ),
    field(
      'Residence address',
      'Address form',
      'When different: county, city, street, number, six-digit postal code and correspondence choice are required.',
      false,
    ),
  ],
  selfie: [field('Biometric processing consent', 'Switch', 'Required before the provider capture.')],
  additional: [
    field('Source of funds', 'Multiple selection', 'At least one source.'),
    field(
      'Purpose of relationship',
      'Multiple selection',
      'At least one purpose. Employment is collected earlier by the CR.',
    ),
  ],
  transactions: [
    field('Transaction types', 'Multiple selection', 'At least one type.'),
    field('International countries', 'Multiple selection', 'At least one source option, including Not applicable.'),
    field('Foreign income', 'Single selection', 'Yes or No.'),
    field(
      'Monthly counts and EUR volumes',
      'Numeric details',
      'Positive integer counts and nonnegative amounts for selected types.',
    ),
    field('Financial data consent', 'Checkbox', 'Required; editing a financial answer clears consent.'),
  ],
  branch: [field('Reference branch', 'Searchable map/list', 'Choose a source branch from its details panel.')],
  marketing: [
    field(
      'Marketing consents and channels',
      'Optional switches/checkboxes',
      'Each consent can be declined; channel selection is shown when enabled.',
      false,
    ),
  ],
  cards: [
    field('Card type', 'Multiple selection', 'At least one card. Prime offers physical Platinum and Standard.'),
    field(
      'Card tier',
      'Tabs',
      'Offer-specific tiers; virtual Gold requires physical Standard when both types are selected.',
    ),
    field('Attached account', 'Dropdown', 'Only an account selected on the offer screen can be attached.'),
  ],
  delivery: [
    field(
      'Delivery address',
      'Address selection/form',
      'Required for a physical card; the source uncovered-address notice explains another address or delivery to the selected branch.',
      false,
    ),
    field('Bank relationship password', 'Password and confirmation', 'Nonempty matching values.'),
  ],
  contract: [
    field(
      'Contractual documentation',
      'Scroll-to-confirm document',
      'Read to the end and confirm; material changes invalidate earlier reading.',
    ),
    field('Study period waiver', 'Switch', 'Requires opening and accepting the document first.'),
    field('Trans Sped contract', 'Switch', 'Required before requesting the signing OTP.'),
  ],
  signature: [
    field('Signing code', 'Six-digit OTP', 'Five-minute expiry and three incorrect attempts. Local fixture 124610.'),
  ],
  rating: [
    field('Recommendation score', 'Five-star selection', 'Optional.', false),
    field('Comment', 'Text area', 'Optional.', false),
  ],
  'resume-password': [
    field('Resume password', 'Password', 'Match the saved local draft; three incorrect attempts lock the session.'),
  ],
  'resume-phone': [
    field(
      'Missing phone digits',
      'Four-digit code',
      'Match positions 4–7 of the saved Romanian number; three incorrect attempts lock the session.',
    ),
  ],
  'resume-code': [
    field('Resume code', 'Six-digit OTP', 'The local code is 124610; expiry and resend limits are preserved.'),
  ],
}
const PURPOSES: Record<string, string> = {
  introduction: 'Explain eligibility and required documents; optionally validate a recommendation code.',
  steps: 'Describe the original stages and show the source expandable stage details.',
  'scan-guidelines': 'Show the original phone/identity photographs and scan guidance.',
  scan: 'Capture the local document fixture; handle legibility retries.',
  'scan-review': 'Confirm the document photograph or retake it without losing the journey state.',
  'selfie-capture': 'Run the provider center, smile, waiting and retry stages with executable controls.',
  identified: 'Confirm successful local identification and continue to the CR questionnaire.',
  processing: 'Show source processing feedback while the local signing result is prepared.',
  success: 'Show the source account/IBAN confirmation and continue to the rating screen.',
  'link-expired': 'Offer a clean restart when no valid saved draft is available.',
}
export function onboardingScreenContract(id: string, title: string, node: string): FlowScreenSpec {
  const base = ONBOARDING_VARIANTS.find((row) => row[0] === id)?.[3] || id
  return {
    title,
    purpose: PURPOSES[base] || title,
    defaultState:
      id === base
        ? 'Source defaults; the primary action is disabled until the required values and consents are complete.'
        : `Source alternate state ${id}; the same journey model and validation rules apply.`,
    fields: FIELDS[base] || [],
    states: ONBOARDING_VARIANTS.filter((row) => row[3] === base).map((row) => row[1]),
    actions: [
      { label: 'Primary action', result: 'Validate the current stage and continue along its selected branch.' },
      { label: 'Close', result: 'Use the source interruption, save/resume or terminal-screen exit behavior.' },
    ],
    back: 'Preserve entered values when returning; material changes invalidate contractual acceptance.',
    edgeCases: ['Service responses are local fixtures. No SMS, email, camera capture or real signature is submitted.'],
    acceptance: [
      `Compare the rendered host against Figma node ${node}.`,
      'Use the same implementation from Apply 100% online and Flows; restrict entry to PI Romania Baseline.',
    ],
  }
}
