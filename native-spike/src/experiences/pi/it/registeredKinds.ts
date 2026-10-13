import type { SearchTarget } from '@/features/search/mobileFirstSearch';

/** Pure coverage metadata; its stable identity preserves component Fast Refresh. */
export const NATIVE_ITALY_REGISTERED_KINDS: readonly SearchTarget['kind'][] = [
  'account',
  'card',
  'loan',
  'insurance',
  'payment',
  'category',
  'pfm',
  'investments',
  'profile',
];
