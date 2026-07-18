// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import KidsMarketHomeApp from '@/app/screens/kids/KidsMarketHomeApp'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'SK', product: 'KIDS_PI' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
})

afterEach(cleanup)

describe('SK Kids Bulbank tree', () => {
  it('renders the Bulbank home plus the Education, Tasks, and More tabs', () => {
    render(<KidsMarketHomeApp country="SK" />, { wrapper: AppProviders })

    // Home: account, cards, and offer come from the SK concept surfaces.
    expect(screen.getByText('Kids account 1')).toBeInTheDocument()
    expect(screen.getByText('**** **** **** 4007')).toBeInTheDocument()
    expect(screen.getByText('Offer banner style from the Bulbank concept')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Education' }))
    const education = screen.getByText('Financial education').closest('section')
    expect(education?.querySelector('svg')).toHaveAttribute('viewBox', '6 9 20 14')
    expect(screen.getByText('What is a budget?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tasks' }))
    expect(screen.getByText('Clean your room')).toBeInTheDocument()
    expect(screen.getByText('Rejected by parent')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'More' }))
    expect(screen.getByText('My family')).toBeInTheDocument()
    expect(screen.getByText('Contacts and info')).toBeInTheDocument()
  })
})
