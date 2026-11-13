import source from '../../../../native-spike/src/experiences/pi/current/baseline/auth/RomanianOnboarding.tsx?raw'
const dependencies = import.meta.glob<string>(
  [
    '/native-spike/src/experiences/pi/current/baseline/auth/Onboarding*.tsx',
    '/native-spike/src/experiences/pi/current/baseline/auth/CashLoan*.tsx',
    '/native-spike/src/experiences/pi/current/baseline/auth/InactiveBaselinePrelogin.tsx',
    '/src/features/ro-onboarding/*.ts',
    '/src/features/ro-onboarding/*.json',
    '/src/features/ro-cash-loan/*.ts',
    '/src/flows/ro/cash-loan/definition.ts',
    '/src/flows/ro/cash-loan/index.ts',
    '/src/flows/ro/cash-loan/preview.tsx',
    '/src/flows/ro/onboarding/screenContracts.ts',
    '/src/assets/pi/ro/onboarding/*.svg',
    '/src/assets/pi/ro/cash-loan/*.svg',
    '/tests/features/ro-cash-loan.test.ts',
    '/tests/screens/ro-cash-loan.test.tsx',
    '/src/assets/pi/ro/cash-loan/README.md',
    '/src/assets/pi/ro/onboarding/README.md',
  ],
  { eager: true, query: '?raw', import: 'default' },
)
export const RO_CASH_LOAN_SCREEN_SOURCE = {
  file: 'native-spike/src/experiences/pi/current/baseline/auth/RomanianOnboarding.tsx',
  source,
  dependencies: Object.entries(dependencies).map(([file, source]) => ({ file: file.replace(/^\//, ''), source })),
}
