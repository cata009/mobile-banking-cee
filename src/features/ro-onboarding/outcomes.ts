export const OUTCOME_ACTIONS = {
  received: { label: '', target: 'close' },
  pending: { label: 'Got it', target: 'close' },
  ceased: { label: 'Find a UniCredit branch', target: 'branch' },
  'document-expired': { label: 'Continuǎ mai târziu', target: 'close' },
  'document-retry': { label: 'Încearca din nou', target: 'scan' },
  'identification-failed': { label: 'Gǎsește o sucursalǎ', target: 'branch' },
  'existing-customer': { label: 'Activează Mobile Banking', target: 'close' },
  'system-error': { label: 'Ok, I will be back later', target: 'close' },
  'evaluation-waiting': { label: '', target: 'close' },
  'evaluation-ceased': { label: 'Inapoi in Mobile Banking', target: 'close' },
} as const
export type OnboardingOutcome = keyof typeof OUTCOME_ACTIONS
export function isOnboardingOutcome(value: string): value is OnboardingOutcome {
  return Object.prototype.hasOwnProperty.call(OUTCOME_ACTIONS, value)
}
