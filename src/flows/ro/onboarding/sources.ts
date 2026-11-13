import source from '../../../../native-spike/src/experiences/pi/current/baseline/auth/RomanianOnboarding.tsx?raw'

// Text-only implementation exports; these imports never execute the Native UI.
const dependencies = import.meta.glob<string>(
  [
    '/native-spike/src/experiences/pi/current/baseline/auth/Onboarding*.tsx',
    '/native-spike/src/experiences/pi/current/baseline/auth/CashLoan*.tsx',
    '/native-spike/src/experiences/pi/current/baseline/auth/InactiveBaselinePrelogin.tsx',
    '/src/features/ro-onboarding/*.ts',
    '/src/features/ro-onboarding/*.json',
    '/src/features/ro-cash-loan/*.ts',
    '/src/flows/ro/onboarding/definition.ts',
    '/src/flows/ro/onboarding/preview.tsx',
    '/src/flows/ro/onboarding/index.ts',
    '/src/flows/ro/onboarding/screenContracts.ts',
    '/tests/features/ro-onboarding*.test.ts',
    '/tests/screens/ro-onboarding.test.tsx',
    '/src/assets/pi/ro/onboarding/*.svg',
    '/src/assets/pi/ro/onboarding/README.md',
    '/src/assets/pi/ro/cash-loan/README.md',
  ],
  { eager: true, query: '?raw', import: 'default' },
)
export const RO_ONBOARDING_SCREEN_SOURCE = {
  file: 'native-spike/src/experiences/pi/current/baseline/auth/RomanianOnboarding.tsx',
  source,
  dependencies: Object.entries(dependencies).map(([file, text]) => ({ file: file.replace(/^\//, ''), source: text })),
}
