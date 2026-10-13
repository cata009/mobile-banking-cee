import { createCallDraft as createSourceCallDraft } from '@/features/profile/evoCallRequest';
export {
  canContinueCall,
  CONTACT_INTERVALS as contactIntervals,
} from '@/features/profile/evoCallRequest';
export type { RequestCallDraft as CallDraft } from '@/features/profile/evoCallRequest';

/** Native UI state port of RequestCallScreen. Source phone predicate and ordering are preserved. */
export function createCallDraft() {
  return createSourceCallDraft('CZ');
}
export function toggleChoice(
  values: readonly string[],
  value: string,
): string[] {
  return values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value];
}
