// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MessagesScreen from '@/app/screens/messages/MessagesScreen'
import { getMessagesConfigForCountry } from '@/app/config/messagesConfig'
import { DemoProvider, useDemo } from '@/app/state/demoStore'

const translation = vi.hoisted(() => ({
  t: (_key: string, fallback?: string) => fallback ?? _key,
}))

vi.mock('@/app/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: translation.t, language: 'en' }),
}))

function Providers({ children }: PropsWithChildren) {
  return <DemoProvider initialState={{ country: 'CZ', release: 'release-current' }}>{children}</DemoProvider>
}

function CountryControl() {
  const { country, setCountry } = useDemo()
  return (
    <button type="button" onClick={() => setCountry(country === 'CZ' ? 'RO' : 'CZ')}>
      Switch country
    </button>
  )
}

function renderMessages(withCountryControl = false) {
  return render(
    <>
      {withCountryControl ? <CountryControl /> : null}
      <MessagesScreen onBack={vi.fn()} />
    </>,
    { wrapper: Providers },
  )
}

afterEach(cleanup)

describe('Messages delete actions', () => {
  it('keeps the delete confirmation in the phone viewport outside the scrolling message list', () => {
    renderMessages()
    const scroller = screen.getByRole('searchbox').closest('[class~="overflow-y-auto"]') as HTMLElement
    const phoneViewport = scroller.parentElement!
    fireEvent.scroll(scroller, { target: { scrollTop: 820 } })
    fireEvent.click(screen.getByRole('button', { name: 'Message actions WELCOME MESSAGE' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete message WELCOME MESSAGE' }))
    const confirmation = screen.getByRole('alertdialog')
    expect(phoneViewport).toContainElement(confirmation)
    expect(scroller).not.toContainElement(confirmation)
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('WELCOME MESSAGE')).toBeInTheDocument()
  })

  it('slides the message row to reveal Delete and only removes it after confirmation', () => {
    renderMessages()

    const row = screen.getByText('CARD NOTIFICATION').closest('[data-message-row]')
    expect(row).toBeInTheDocument()

    const actions = within(row as HTMLElement).getByRole('button', { name: 'Message actions CARD NOTIFICATION' })
    fireEvent.click(actions)

    expect(actions).toHaveAttribute('aria-expanded', 'true')
    expect(
      within(row as HTMLElement).getByRole('button', { name: 'Delete message CARD NOTIFICATION' }),
    ).toHaveTextContent('DELETE')
    expect(row?.querySelector('[data-message-content]')).toHaveClass(
      '-translate-x-[24px]',
      'transition-transform',
      'duration-[260ms]',
    )

    fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Delete message CARD NOTIFICATION' }))
    const confirmation = screen.getByRole('alertdialog')
    expect(confirmation).toHaveTextContent('Are you sure you want to delete this message?')

    fireEvent.click(within(confirmation).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('CARD NOTIFICATION')).toBeInTheDocument()
    expect(actions).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(actions)
    fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Delete message CARD NOTIFICATION' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }))

    expect(screen.queryByText('CARD NOTIFICATION')).not.toBeInTheDocument()
  })

  it('keeps deleted messages scoped to their country in the shared screen', () => {
    renderMessages(true)

    const row = screen.getByText('CARD NOTIFICATION').closest('[data-message-row]') as HTMLElement
    fireEvent.click(within(row).getByRole('button', { name: 'Message actions CARD NOTIFICATION' }))
    fireEvent.click(within(row).getByRole('button', { name: 'Delete message CARD NOTIFICATION' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }))
    expect(screen.queryByText('CARD NOTIFICATION')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Switch country' }))
    expect(screen.getByText('CARD NOTIFICATION')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Switch country' }))
    expect(screen.queryByText('CARD NOTIFICATION')).not.toBeInTheDocument()
  })

  it('leaves 16px above and below the search field in the sticky mailbox header', () => {
    renderMessages()

    const searchSpacing = screen.getByRole('searchbox').closest('[data-messages-search-container]')
    expect(searchSpacing).toHaveClass('pt-[16px]', 'pb-[16px]')
  })

  it('uses current 2026 message data in every shared mailbox', () => {
    const config = getMessagesConfigForCountry('RO')

    expect(config.sectionTitle).toBe('2026')
    expect(config.inbox[0]?.id).toBe('inbox-2026-10-01')
    expect(config.outbox[0]?.id).toBe('outbox-2026-09-24')
  })
})
