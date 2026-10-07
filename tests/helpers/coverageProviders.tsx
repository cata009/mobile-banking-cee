import '@testing-library/jest-dom/vitest'
import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider, type Language } from '@/app/contexts/LanguageContext'
import type { CountryId, DemoState } from '@/app/state/demoTypes'

export function renderBankingScreen(
  children: ReactNode,
  {
    country = 'CZ',
    language = 'en',
    state = {},
  }: {
    country?: CountryId
    language?: Language
    state?: Partial<DemoState>
  } = {},
) {
  return render(
    <DemoProvider
      initialState={{
        product: 'PI',
        country,
        scenario: 'active',
        designSystem: 'current',
        bankingScenario: 'retail-multi-account-card',
        release: 'release-current',
        productCounts: {
          accounts: 2,
          debitCards: 1,
          creditCards: 1,
          mealCards: 0,
          deposits: 1,
          savingsAccounts: 1,
          loans: 1,
          mortgages: 1,
          investments: 1,
        },
        ...state,
      }}
    >
      <LanguageProvider initialLanguage={language}>{children}</LanguageProvider>
    </DemoProvider>,
  )
}
