// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstInsurance, { MobileFirstInsurancePanel } from '@/experiences/pi/it/mobile-first/MobileFirstInsurance'
import MobileFirstHome from '@/experiences/pi/it/mobile-first/MobileFirstHome'
import { ITALY_INSURANCE_POLICIES } from '@/experiences/pi/it/mobile-first/insuranceContent'

afterEach(cleanup)
function setup(props: Partial<ComponentProps<typeof MobileFirstInsurance>> = {}, hidden = false) {
  return render(
    <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first', amountsHidden: hidden }}>
      <MobileFirstInsurance initialPolicyId="famiglia-20" onClose={() => {}} {...props} />
    </DemoProvider>,
  )
}

describe('PI Italy insurance Figma flows', () => {
  it('opens the actual Home insurance panel, policy list and policy, then returns to Home', () => {
    render(
      <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
        <MobileFirstHome />
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Polizze assicurative' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tutte le polizze' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apri polizza My Care Famiglia 20' }))
    expect(screen.getByRole('main', { name: 'Polizza assicurativa' })).toHaveTextContent('Numero Polizza 20')
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByRole('heading', { name: 'I tuoi prodotti' })).toBeVisible()
  })
  it('opens the favorite policy with its own data and supports real module detail', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'My Care Famiglia' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'La mia polizza' })).toHaveTextContent('20')
    expect(screen.getByRole('region', { name: 'La mia polizza' })).toHaveTextContent('450,00 €')
    fireEvent.click(screen.getByRole('button', { name: 'Apri modulo Casa' }))
    const module = screen.getByRole('dialog', { name: 'Casa' })
    expect(module).toHaveTextContent('150,00 €')
    expect(module).toHaveTextContent('Via Livio Campi, 11, 20800, Verona, VR')
    fireEvent.click(within(module).getByRole('button', { name: 'Chiudi' }))
    expect(screen.getByRole('heading', { name: 'My Care Famiglia' })).toBeVisible()
  })
  it('returns from an all-policies detour to the original detail, then closes', () => {
    const onClose = vi.fn()
    setup({ onClose })
    fireEvent.click(screen.getByRole('tab', { name: 'Tutte le polizze' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apri polizza My Care Futuro 25' }))
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByRole('heading', { name: 'My Care Famiglia' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
  it('uses a different insured person when the Persona tab changes', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Apri modulo Persona' }))
    const module = screen.getByRole('dialog', { name: 'Persona' })
    fireEvent.click(within(module).getByRole('tab', { name: 'Assicurato 2' }))
    expect(module).toHaveTextContent('Bianchini Flavia')
    expect(module).not.toHaveTextContent('Rossini Andrea')
  })
  it('opens the supplied guarantee detail and restores the selected insured person', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Apri modulo Persona' }))
    fireEvent.click(screen.getByRole('button', { name: 'Responsabilità civile' }))
    expect(screen.getByRole('dialog', { name: 'Responsabilità civile' })).toHaveTextContent('Principali esclusioni')
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
    expect(screen.getByRole('dialog', { name: 'Persona' })).toHaveTextContent('Rossini Andrea')
  })
  it('shows the non-module policy and respects its assistance-only actions', () => {
    setup({ initialPolicyId: 'incendio-30' })
    expect(screen.getByRole('heading', { name: 'Polizza Incendio e scoppio' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Aggiungi modulo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Gestione polizza' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Dettaglio protezione' })).toHaveTextContent('Decesso')
  })
  it('filters documents inclusively by date and restores the chosen filters after viewing one', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Documenti' }))
    fireEvent.click(screen.getByRole('button', { name: 'Vai a tutti i documenti' }))
    fireEvent.click(screen.getByRole('button', { name: 'Filtri di ricerca' }))
    fireEvent.click(screen.getByRole('button', { name: 'Personalizza periodo' }))
    fireEvent.change(screen.getByLabelText('Data iniziale'), { target: { value: '2024-10-10' } })
    fireEvent.change(screen.getByLabelText('Data finale'), { target: { value: '2024-10-19' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    fireEvent.click(screen.getByRole('button', { name: 'Applica' }))
    const documents = screen.getByRole('dialog', { name: 'Documenti' })
    expect(within(documents).getAllByRole('button', { name: /Apri documento/ })).toHaveLength(2)
    expect(documents).toHaveTextContent('10/10/2024 - 19/10/2024')
    fireEvent.click(within(documents).getAllByRole('button', { name: /Apri documento/ })[0]!)
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Contratto di polizza' })).getByRole('button', { name: 'Chiudi' }),
    )
    expect(screen.getByRole('dialog', { name: 'Documenti' })).toHaveTextContent('10/10/2024 - 19/10/2024')
  })
  it('saves favorite order and keeps it after the insurance view remounts', () => {
    setup({ initialView: 'list' })
    fireEvent.click(screen.getByRole('button', { name: 'Personalizza vista' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sposta in alto Polizza Incendio e scoppio' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salva modifica' }))
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Modifiche salvate' })).getByRole('button', { name: 'Chiudi' }),
    )
    cleanup()
    setup({ initialView: 'list' })
    expect(within(screen.getByRole('region', { name: 'Preferite' })).getAllByRole('button')[0]).toHaveAccessibleName(
      /Polizza Incendio e scoppio/,
    )
  })
  it('masks policy and module premiums without changing the selected policy', () => {
    setup({}, true)
    expect(screen.queryByText('21')).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'La mia polizza' })).not.toHaveTextContent('21,81')
    fireEvent.click(screen.getByRole('button', { name: 'Apri modulo Casa' }))
    expect(screen.getByRole('dialog', { name: 'Casa' })).not.toHaveTextContent('150,00')
  })
  it('requires a valid year before preparing an ISEE certificate request', () => {
    setup({ initialView: 'documents' })
    fireEvent.click(screen.getByRole('button', { name: 'Attestazione ISEE Richiedi' }))
    expect(screen.getByRole('button', { name: 'Richiedi' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Anno di riferimento'), { target: { value: '2024' } })
    fireEvent.click(screen.getByRole('button', { name: 'Richiedi' }))
    expect(screen.getByRole('status')).toHaveTextContent('Richiesta registrata')
  })
  it('renders the insurance homepage panel with only the selected favorite policy records', () => {
    render(
      <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
        <div className="mf-home">
          <MobileFirstInsurancePanel
            policies={ITALY_INSURANCE_POLICIES.filter((p) => p.id === 'famiglia-20')}
            onOpen={() => {}}
          />
        </div>
      </DemoProvider>,
    )
    expect(screen.getByRole('button', { name: 'Apri polizza My Care Famiglia' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Apri polizza Polizza Incendio e scoppio' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Le nostre polizze' })).toBeVisible()
  })
  it('preserves the document filter draft while opening help and closes only help with Escape', () => {
    setup({ initialView: 'documents' })
    fireEvent.click(screen.getByRole('button', { name: 'Filtri di ricerca' }))
    fireEvent.click(screen.getByRole('button', { name: '3M' }))
    fireEvent.click(screen.getByRole('button', { name: 'Aiuto' }))
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    fireEvent.keyDown(document, { key: 'Escape' })
    const filters = screen.getByRole('dialog', { name: 'Filtri di ricerca' })
    expect(within(filters).getByRole('button', { name: '3M' })).toHaveAttribute('aria-pressed', 'true')
  })
  it('keeps keyboard focus in the chat input after typing', async () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Contattaci' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Chiudi' })).toHaveFocus())
    fireEvent.click(screen.getByRole('button', { name: 'Chatta con noi' }))
    const input = screen.getByRole('textbox', { name: 'Messaggio' })
    input.focus()
    fireEvent.change(input, { target: { value: 'a' } })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1))
    })
    expect(input).toHaveFocus()
  })
})
