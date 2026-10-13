// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import MobileFirstOperations from '@/experiences/pi/it/mobile-first/MobileFirstOperations'

afterEach(cleanup)

function Harness() {
  const [open, setOpen] = useState(true)
  const [selection, setSelection] = useState('')
  return (
    <div>
      {open ? <MobileFirstOperations onClose={() => setOpen(false)} onSelect={setSelection} /> : <p>Conto</p>}
      <output aria-label="Operazione selezionata">{selection}</output>
    </div>
  )
}

const groups = [
  {
    title: 'Bonifici e Bancomat Pay',
    choices: ['Bonifico, Giroconto, Agevolazioni fiscali, Estero', 'Bonifico, Giroconto periodico', 'BANCOMAT® Pay'],
  },
  { title: 'Ricariche', choices: ['Ricarica cellulare', 'Ricarica prepagata'] },
  {
    title: 'Pagamenti verso Enti e Tributi',
    choices: [
      'F24',
      'Bollettino CBILL/PagoPA',
      'Avvisi pagoPA',
      'Bollo auto e moto',
      'Bollettino',
      'MAV, RAV, REP',
      'Pagamento effetti',
      'Agenzia delle Entrate (pagoPA)',
      'Enti Convenzionati',
    ],
  },
  { title: 'Altri pagamenti', choices: ['Donazione', 'Pagamento con codice Terze Parti', 'My Bank'] },
]

describe('Italy Mobile First operations menu', () => {
  it('exposes every operation in its payment group and sends the selected label to the host', () => {
    render(<Harness />)
    const dialog = screen.getByRole('dialog', { name: 'Operazioni' })
    for (const group of groups) {
      const region = within(dialog).getByRole('region', { name: group.title })
      for (const label of group.choices) {
        fireEvent.click(within(region).getByRole('button', { name: label }))
        expect(screen.getByLabelText('Operazione selezionata')).toHaveTextContent(label)
      }
    }
  })

  it('routes the four quick actions and assistance without dispatching a payment', () => {
    render(<Harness />)
    const dialog = screen.getByRole('dialog', { name: 'Operazioni' })
    for (const label of [
      'Riproponi pagamento',
      'Paga con foto',
      'Archivio pagamenti',
      'Prelievo smart',
      'Assistenza',
    ]) {
      fireEvent.click(within(dialog).getByRole('button', { name: label }))
      expect(screen.getByLabelText('Operazione selezionata')).toHaveTextContent(label)
    }
  })

  it.each(['handle', 'Escape'] as const)('returns to the host using %s', async (method) => {
    render(<Harness />)
    if (method === 'handle') fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
    else fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText('Conto')).toBeVisible()
  })
})
