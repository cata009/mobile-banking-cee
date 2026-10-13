// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { type ReactNode, useState } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstAccount from '@/experiences/pi/it/mobile-first/MobileFirstAccount'
import MobileFirstCards from '@/experiences/pi/it/mobile-first/MobileFirstCards'
import { CARD_MOVEMENTS, ITALY_CARDS } from '@/experiences/pi/it/mobile-first/cardsContent'
import { saveAccountMovementChanges } from '@/features/accounts-payments/mobileFirstAccounts'
import { resetItalyFinancialState, setEventAnnotations } from '@/features/finance/italyFinancials'

const account = { name: 'Andrea Rossini', number: '000012345', balance: 53550.27 }
beforeEach(resetItalyFinancialState)

afterEach(() => {
  cleanup()
  saveAccountMovementChanges(account.number, '2-0', {})
})

function Provider({ children, hidden = false }: { children: ReactNode; hidden?: boolean }) {
  return (
    <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first', amountsHidden: hidden }}>
      {children}
    </DemoProvider>
  )
}

function Entry({
  kind,
  movementId,
  overlay = false,
}: {
  kind: 'account' | 'card'
  movementId?: string
  overlay?: boolean
}) {
  const [closed, setClosed] = useState(false)
  if (closed) return <p>Ricerca globale</p>
  return kind === 'account' ? (
    <MobileFirstAccount
      account={account}
      initialMovementId={movementId}
      externalOverlayOpen={overlay}
      onClose={() => setClosed(true)}
    />
  ) : (
    <MobileFirstCards
      initialCardId="flexia"
      initialMovementId={movementId}
      externalOverlayOpen={overlay}
      onClose={() => setClosed(true)}
    />
  )
}

describe('Italy global search movement entry', () => {
  it('opens the exact account movement, closes to its account, and then returns to global search', () => {
    render(
      <Provider>
        <Entry kind="account" movementId="2-0" />
      </Provider>,
    )
    const movement = screen.getByRole('dialog', { name: 'Altro' })
    expect(within(movement).getByText('Insegna').parentElement).toHaveTextContent('PayPal')
    expect(within(movement).getByText('Importo speso').parentElement).toHaveTextContent('-130,00 €')
    expect(within(movement).getByText('Data operazione').parentElement).toHaveTextContent('07/02/2025')
    fireEvent.click(within(movement).getByRole('button', { name: 'Chiudi' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: account.name })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByText('Ricerca globale')).toBeVisible()
  })

  it('opens the exact card movement and backs out through its card without entering the hub', () => {
    render(
      <Provider>
        <Entry kind="card" movementId="paypal-feb" />
      </Provider>,
    )
    const movement = screen.getByRole('main', { name: 'PayPal' })
    expect(within(movement).getByText('Data operazione')).toHaveTextContent('07/02/2025')
    expect(within(movement).getAllByText('-130')[0]).toBeVisible()
    fireEvent.click(within(movement).getByRole('button', { name: 'Indietro' }))
    expect(screen.getByRole('heading', { name: 'Movimenti' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'PIN UniCredit Flexia Classic' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByText('Ricerca globale')).toBeVisible()
  })

  it('opens pending account movements with their existing pending detail', () => {
    render(
      <Provider>
        <Entry kind="account" movementId="pending-0" />
      </Provider>,
    )
    const movement = screen.getByRole('dialog', { name: 'Movimento da contabilizzare' })
    expect(within(movement).getByText('Insegna').parentElement).toHaveTextContent('Pagamento e-commerce')
    expect(within(movement).queryByText('Data registrazione')).not.toBeInTheDocument()
  })

  it('uses saved account category edits in the selected detail', () => {
    saveAccountMovementChanges(account.number, '2-0', { category: 'Viaggi', note: 'Viaggio in Italia' })
    render(
      <Provider>
        <Entry kind="account" movementId="2-0" />
      </Provider>,
    )
    const movement = screen.getByRole('dialog', { name: 'Altro' })
    expect(within(movement).getByText('Viaggi')).toBeVisible()
    expect(within(movement).getByText('Viaggio in Italia')).toBeVisible()
  })

  it('uses canonical card annotations and money while ignoring stale snapshot values', () => {
    setEventAnnotations('genius:paypal', { category: 'Viaggi', note: 'Carta vacanze' })
    render(
      <Provider>
        <MobileFirstCards
          initialCardId="genius"
          initialMovementId="paypal"
          initialSnapshot={{
            cards: ITALY_CARDS.map((card) => ({ ...card })),
            movements: {
              genius: CARD_MOVEMENTS.map((movement) =>
                movement.id === 'paypal'
                  ? { ...movement, category: 'Viaggi', note: 'Carta vacanze', amount: -145 }
                  : { ...movement },
              ),
            },
          }}
          onClose={() => undefined}
        />
      </Provider>,
    )
    const movement = screen.getByRole('main', { name: 'PayPal' })
    expect(within(movement).getByText('Carta vacanze')).toBeVisible()
    expect(within(movement).getAllByText('-30')[0]).toBeVisible()
    expect(movement).not.toHaveTextContent('-145')
  })

  it.each(['missing', 'share', ''])('falls back to card detail for the invalid movement ID %j', (movementId) => {
    render(
      <Provider>
        <Entry kind="card" movementId={movementId} />
      </Provider>,
    )
    expect(screen.getByRole('heading', { name: 'Movimenti' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Filtri di ricerca' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByText('Ricerca globale')).toBeVisible()
  })

  it('falls back to account detail when the movement is invalid', () => {
    render(
      <Provider>
        <MobileFirstAccount
          account={account}
          initialView="accounts"
          initialMovementId="missing"
          onClose={() => undefined}
        />
      </Provider>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: account.name })).toBeVisible()
  })

  it('keeps normal card hub and account list entries when no movement ID is supplied', () => {
    const first = render(
      <Provider>
        <Entry kind="card" />
      </Provider>,
    )
    expect(screen.getByRole('heading', { name: 'Carte' })).toBeVisible()
    first.unmount()
    render(
      <Provider>
        <MobileFirstAccount account={account} initialView="accounts" onClose={() => undefined} />
      </Provider>,
    )
    expect(screen.getByRole('dialog', { name: 'Tutti i conti' })).toBeVisible()
  })

  it('does not reopen the account movement after a parent rerender', () => {
    const entry = render(
      <Provider>
        <Entry kind="account" movementId="2-0" />
      </Provider>,
    )
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Altro' })).getByRole('button', { name: 'Chiudi' }))
    entry.rerender(
      <Provider hidden>
        <Entry kind="account" movementId="2-0" />
      </Provider>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not reopen the card movement after a parent rerender', () => {
    const entry = render(
      <Provider>
        <Entry kind="card" movementId="paypal-feb" />
      </Provider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    entry.rerender(
      <Provider hidden>
        <Entry kind="card" movementId="paypal-feb" />
      </Provider>,
    )
    expect(screen.getByRole('heading', { name: 'Movimenti' })).toBeVisible()
  })

  it.each(['account', 'card'] as const)('preserves %s amount privacy on movement entry', (kind) => {
    render(
      <Provider hidden>
        <Entry kind={kind} movementId={kind === 'account' ? '2-0' : 'paypal-feb'} />
      </Provider>,
    )
    const movement =
      kind === 'account' ? screen.getByRole('dialog', { name: 'Altro' }) : screen.getByRole('main', { name: 'PayPal' })
    expect(movement).not.toHaveTextContent('-130')
    expect(movement).toHaveTextContent(kind === 'account' ? '-***,** €' : '••••')
  })

  it('keeps the card movement mounted while an external overlay is open', () => {
    const entry = render(
      <Provider>
        <Entry kind="card" movementId="paypal-feb" overlay />
      </Provider>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('main', { name: 'PayPal' })).toBeVisible()
    entry.rerender(
      <Provider>
        <Entry kind="card" movementId="paypal-feb" />
      </Provider>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('heading', { name: 'Movimenti' })).toBeVisible()
  })

  it('keeps the account movement mounted while an external overlay is open', () => {
    const entry = render(
      <Provider>
        <Entry kind="account" movementId="2-0" overlay />
      </Provider>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('dialog', { name: 'Altro' })).toBeVisible()
    entry.rerender(
      <Provider>
        <Entry kind="account" movementId="2-0" />
      </Provider>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: account.name })).toBeVisible()
  })

  it.each(['account', 'card'] as const)(
    'keeps the %s parent detail mounted while an external overlay is open',
    (kind) => {
      render(
        <Provider>
          <Entry kind={kind} movementId="missing" overlay />
        </Provider>,
      )
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByText('Ricerca globale')).not.toBeInTheDocument()
    },
  )
})
