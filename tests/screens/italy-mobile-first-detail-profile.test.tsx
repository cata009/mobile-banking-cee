// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstAccount from '@/experiences/pi/it/mobile-first/MobileFirstAccount'
import { AccountPage } from '@/experiences/pi/it/mobile-first/MobileFirstAccountPrimitives'
import MobileFirstCards from '@/experiences/pi/it/mobile-first/MobileFirstCards'
import MobileFirstLoans from '@/experiences/pi/it/mobile-first/MobileFirstLoans'
import { LoansHeader } from '@/experiences/pi/it/mobile-first/MobileFirstLoansPrimitives'
import MobileFirstPfm from '@/experiences/pi/it/mobile-first/MobileFirstPfm'
import MobileFirstInsurance from '@/experiences/pi/it/mobile-first/MobileFirstInsurance'
import { CardsPage } from '@/experiences/pi/it/mobile-first/MobileFirstCardsPrimitives'

afterEach(cleanup)
const close = () => undefined

const screens = [
  [
    'account',
    (onProfile: () => void) => (
      <MobileFirstAccount
        account={{ name: 'Andrea Rossini', number: '000012345', balance: 0 }}
        onClose={close}
        onProfile={onProfile}
      />
    ),
  ],
  [
    'card detail',
    (onProfile: () => void) => <MobileFirstCards initialView="detail" onClose={close} onProfile={onProfile} />,
  ],
  ['card hub', (onProfile: () => void) => <MobileFirstCards initialView="hub" onClose={close} onProfile={onProfile} />],
  ['loan', (onProfile: () => void) => <MobileFirstLoans onClose={close} onProfile={onProfile} />],
  ['PFM', (onProfile: () => void) => <MobileFirstPfm onClose={close} onProfile={onProfile} />],
  ['insurance', (onProfile: () => void) => <MobileFirstInsurance onClose={close} onProfile={onProfile} />],
] as const

function preview(children: React.ReactNode) {
  return render(
    <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
      {children}
    </DemoProvider>,
  )
}

describe('Italy detail Profile entry points', () => {
  it.each(screens)('routes the %s avatar to the shared Profile callback', (_name, element) => {
    const onProfile = vi.fn()
    preview(element(onProfile))
    fireEvent.click(screen.getByRole('button', { name: 'Profilo' }))
    expect(onProfile).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog', { name: 'Profilo' })).toBeNull()
    if (_name !== 'PFM')
      expect(
        screen.getByRole('button', { name: 'Profilo' }).closest('[data-mobile-first-detail-header="true"]'),
      ).not.toBeNull()
  })

  it('routes the full account-list avatar through the originating account callback', () => {
    const onProfile = vi.fn()
    preview(
      <MobileFirstAccount
        account={{ name: 'Andrea Rossini', number: '000012345', balance: 0 }}
        initialView="accounts"
        onClose={close}
        onProfile={onProfile}
      />,
    )
    const list = screen.getByRole('dialog', { name: 'Tutti i conti' })
    fireEvent.click(list.querySelector('button[aria-label="Profilo"]')!)
    expect(onProfile).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog', { name: 'Tutti i conti' })).toBeNull()
  })

  it('supports the same callback on a standalone account-list page', () => {
    const onProfile = vi.fn()
    preview(
      <AccountPage title="Tutti i conti" list onClose={close} onProfile={onProfile}>
        Contenuto
      </AccountPage>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Profilo' }))
    expect(onProfile).toHaveBeenCalledTimes(1)
  })

  it('uses the common detail header and 24px back asset for Loans', () => {
    render(<LoansHeader onBack={close} onProfile={close} />)
    const back = screen.getByRole('button', { name: 'Indietro' })
    expect(back.closest('[data-mobile-first-detail-header="true"]')).not.toBeNull()
    expect(back.querySelector('img')?.getAttribute('width')).toBe('24')
    expect(back.querySelector('img')?.getAttribute('height')).toBe('24')
    expect(screen.getByRole('button', { name: 'Profilo' }).querySelector('img')?.getAttribute('width')).toBe('32')
  })

  it.each(['detail', 'documents'] as const)(
    'dismisses local insurance modals before delegating contact from %s',
    (initialView) => {
      const onContact = vi.fn()
      preview(<MobileFirstInsurance initialView={initialView} onClose={close} onContact={onContact} />)
      if (initialView === 'documents') fireEvent.click(screen.getByRole('button', { name: 'Filtri di ricerca' }))
      fireEvent.click(screen.getByRole('button', { name: 'Aiuto' }))
      fireEvent.click(screen.getByRole('button', { name: 'Avvia Chat' }))
      expect(onContact).toHaveBeenCalledWith('chat', expect.any(String))
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.getByRole('main', { name: 'Polizza assicurativa' })).not.toBeNull()
    },
  )

  it('opens the real Profile hub for a standalone card avatar and returns to the card page', async () => {
    preview(
      <CardsPage title="Carte" profile onBack={close}>
        Contenuto carta
      </CardsPage>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Profilo' }))
    await screen.findByRole('main', { name: 'Profilo' })
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi profilo' }))
    expect(screen.getByRole('main', { name: 'Carte' })).not.toBeNull()
  })

  it.each(['loan', 'PFM', 'insurance'])(
    'keeps the retained %s detail open when Escape belongs to an external Profile overlay',
    (kind) => {
      const onClose = vi.fn()
      preview(
        kind === 'loan' ? (
          <MobileFirstLoans onClose={onClose} externalOverlayOpen />
        ) : kind === 'PFM' ? (
          <MobileFirstPfm onClose={onClose} externalOverlayOpen />
        ) : (
          <MobileFirstInsurance onClose={onClose} externalOverlayOpen />
        ),
      )
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    },
  )
})
