// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import App2027HomeScreen from '@/app/screens/home/App2027HomeScreen'

afterEach(cleanup)
beforeEach(() => window.sessionStorage.clear())
function creditProgress(amountsHidden: boolean) {
  const { container } = render(
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'CZ',
        scenario: 'active',
        release: 'release-future-evo-2027',
        amountsHidden,
        productCounts: {
          accounts: 2,
          debitCards: 2,
          creditCards: 1,
          mealCards: 0,
          deposits: 1,
          savingsAccounts: 1,
          loans: 1,
          mortgages: 1,
          investments: 1,
        },
      }}
    >
      <LanguageProvider initialLanguage="en">
        <App2027HomeScreen useCzRoboAccountCards />
      </LanguageProvider>
    </DemoProvider>,
  )
  fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
  return container.querySelector('[data-home-credit-limit-progress]')!
}
test('hidden credit money is also absent from accessible progress attributes', () => {
  const progress = creditProgress(true)
  expect(progress).not.toHaveAttribute('aria-valuenow')
  expect(progress).not.toHaveAttribute('aria-valuemax')
  expect(progress).not.toHaveAttribute('aria-valuemin')
  expect(progress).toHaveAttribute('aria-valuetext', 'Amounts hidden')
})
test('visible credit progress retains the original numeric accessibility values', () => {
  const progress = creditProgress(false)
  expect(progress).toHaveAttribute('aria-valuemin', '0')
  expect(progress).toHaveAttribute('aria-valuemax')
  expect(progress).toHaveAttribute('aria-valuenow')
})
