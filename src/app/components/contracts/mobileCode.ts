/** Authored Mobile Code presentation only. The consuming feature owns secrets and authorization. */
export type MobileCodeDigits = 6 | 7 | 8
export type MobileCodeBiometric = 'face-id' | 'fingerprint' | 'none'
export type MobileCodeGlyph = Exclude<MobileCodeBiometric, 'none'> | 'delete'

export const MOBILE_CODE_SOURCE = {
  fileKey: 'FKbbStgBIP9bFAMl3DPKHF',
  glyph: {
    familyId: '10175:21282',
    variants: { 'face-id': '10175:21272', fingerprint: '10175:21275', delete: '10175:21278' },
  },
  key: { familyId: '10175:21291', variants: { digit: '10175:21283', action: '10175:21285' } },
  keypad: {
    familyId: '10175:21400',
    variants: { 'face-id': '10175:21292', fingerprint: '10175:21329', none: '10175:21366' },
  },
  progress: {
    familyId: '10175:21475',
    variants: {
      '6-empty': '10175:21401',
      '6-partial': '10175:21408',
      '6-complete': '10175:21415',
      '7-empty': '10175:21422',
      '7-partial': '10175:21430',
      '7-complete': '10175:21438',
      '8-empty': '10175:21446',
      '8-partial': '10175:21455',
      '8-complete': '10175:21464',
    },
  },
  entry: '10175:21476',
  assets: {
    'face-id': 'src/assets/mobile-first/it/profile/settings/face-id.svg',
    fingerprint: 'src/assets/design-system/mobile-code/fingerprint.svg',
    delete: 'src/assets/mobile-first/it/profile/auth-imgNavigationAndActionDeleteMcodeT2.svg',
    recovery: 'src/assets/mobile-first/it/investments/funds/660985-imgNavigationAndActionForthK1.svg',
  },
} as const

export const MOBILE_CODE_GEOMETRY = {
  entryWidth: 375,
  entryPaddingHorizontal: 15,
  headingFontSize: 32,
  headingLineHeight: 36,
  headingToProgress: 74,
  progressToKeypad: 60,
  keypadToRecovery: 34,
  keyWidth: 88,
  keyMinHeight: 48,
  keyPaddingVertical: 4,
  digitMinHeight: 40,
  digitFontSize: 32,
  digitLineHeight: 36,
  keypadWidth: 280,
  columnGap: 8,
  rowGap: 24,
  glyphSize: 32,
  faceIdArtworkSize: 88 / 3,
  faceIdArtworkTop: 4 / 3,
  dotSize: 12,
  dotGap: 16,
  recoveryMinHeight: 44,
  recoveryContentMinHeight: 24,
  recoveryFontSize: 14,
  recoveryLineHeight: 16,
  recoveryGap: 4,
  recoveryIconSize: 16,
  textToken: '--uc-text',
  emptyDotToken: '--uc-neutral-500',
  filledDotToken: '--uc-action-strong',
} as const

export const MOBILE_CODE_PREVIEW_VARIANTS = [
  'entry',
  'face-id',
  'fingerprint',
  'none',
  '6-empty',
  '6-partial',
  '6-complete',
  '7-empty',
  '7-partial',
  '7-complete',
  '8-empty',
  '8-partial',
  '8-complete',
] as const

export function resolveMobileCodeProgress({
  digits = 6,
  enteredDigits = 0,
}: {
  digits?: MobileCodeDigits
  enteredDigits?: number
} = {}) {
  const entered = Number.isFinite(enteredDigits) ? Math.max(0, Math.min(digits, Math.floor(enteredDigits))) : 0
  return {
    digits,
    enteredDigits: entered,
    width: digits * MOBILE_CODE_GEOMETRY.dotSize + (digits - 1) * MOBILE_CODE_GEOMETRY.dotGap,
    height: MOBILE_CODE_GEOMETRY.dotSize,
  }
}
