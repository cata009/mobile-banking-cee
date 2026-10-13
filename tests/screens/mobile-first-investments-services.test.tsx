// @vitest-environment jsdom
import { resetItalyFinancialState } from '@/features/finance/italyFinancials'
import { getFiscalSummary } from '@/features/investments/mobileFirstInvestmentServices'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstInvestmentServices from '@/experiences/pi/it/mobile-first/MobileFirstInvestmentServices'
import { investmentInterviewQuestions } from '@/experiences/pi/it/mobile-first/investmentsServicesContent'
import {
  canSignService,
  isNonProfessionalMarketSubscriber,
  selectInterviewAnswer,
  validateAlertPrice,
  validateSavingsAmount,
  readInvestmentServicePreferences,
  saveInvestmentServicePreferences,
} from '@/features/investments/mobileFirstInvestmentServices'

beforeEach(() => resetItalyFinancialState())
afterEach(() => {
  vi.restoreAllMocks()
  cleanup()
  saveInvestmentServicePreferences({
    activePackages: ['Money Trading'],
    preferredDeposit: '13216 - 0000022832432',
    completedInterviews: [],
  })
  localStorage.clear()
})
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
function view(name: string, hidden = false, action?: string) {
  const onNavigate = vi.fn()
  const onClose = vi.fn()
  const result = render(
    <DemoProvider initialState={{ country: 'IT', designSystem: 'mobile-first', amountsHidden: hidden }}>
      <MobileFirstInvestmentServices
        area="services"
        view={name}
        action={action}
        onNavigate={onNavigate}
        onClose={onClose}
      />
    </DemoProvider>,
  )
  return { ...result, onNavigate, onClose }
}
function reviewDocument() {
  click('APRI IL DOCUMENTO')
  fireEvent.click(screen.getByRole('checkbox', { name: 'Ho preso visione del documento' }))
}

describe('services feature policies', () => {
  it('enforces savings bounds, increments, code and market subscriber requirements', () => {
    expect(validateSavingsAmount('4999')).toMatch(/5.000/)
    expect(validateSavingsAmount('5500')).toMatch(/multiplo/)
    expect(validateSavingsAmount('100001')).not.toBeNull()
    expect(validateSavingsAmount('5000')).toBeNull()
    expect(canSignService(false, true, '12345')).toBe(false)
    expect(canSignService(true, false, '12345')).toBe(false)
    expect(canSignService(true, true, '1234')).toBe(false)
    expect(canSignService(true, true, '12345')).toBe(true)
    expect(isNonProfessionalMarketSubscriber(['Sì', ...Array<string>(9).fill('No')])).toBe(true)
    expect(isNonProfessionalMarketSubscriber(Array<string>(10).fill('Sì'))).toBe(false)
    expect(validateAlertPrice('204.75', 204.75)).toBe(false)
    expect(validateAlertPrice('-1', 204.75)).toBe(false)
    expect(selectInterviewAnswer(['Nessuna'], 'Azioni', true)).toEqual(['Azioni'])
    expect(selectInterviewAnswer(['Azioni'], 'Nessuna', true)).toEqual(['Nessuna'])
  })
})

it('requires every suitability answer, preserves back navigation and gates both document and signature', () => {
  view('mifid')
  click('Completa adeguatezza')
  expect(screen.getByRole('button', { name: 'Prosegui' }).closest('.mfix-page-footer')).toBeInTheDocument()
  click('Prosegui')
  expect(screen.getByRole('button', { name: 'Prosegui' })).toBeDisabled()
  fireEvent.click(screen.getByRole('radio', { name: 'Fino a 1.000€' }))
  click('Prosegui')
  click('Indietro')
  expect(screen.getByRole('radio', { name: 'Fino a 1.000€' })).toBeChecked()
  const adequacy = investmentInterviewQuestions.filter(
    (question) => question.group === 'financial' || question.group === 'risk',
  )
  adequacy.forEach((question) => {
    expect(screen.getByRole('heading', { name: question.title })).toBeInTheDocument()
    if (!screen.getByRole('radio', { name: question.options[0] }).getAttribute('checked'))
      fireEvent.click(screen.getByRole('radio', { name: question.options[0] }))
    click('Prosegui')
  })
  click('Prosegui')
  expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()
  reviewDocument()
  click('Conferma')
  expect(screen.getByRole('button', { name: 'Accetta e prosegui' })).toBeDisabled()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Accetto le dichiarazioni del cliente' }))
  click('Accetta e prosegui')
  click('Conferma')
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '1234' } })
  expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
  click('Conferma')
  expect(screen.getByText('Sottoscrizione intervista adeguatezza effettuata con successo!')).toBeInTheDocument()
})

it('includes all appropriateness questions and supports multiple exclusive answers', () => {
  view('mifid')
  click('Completa appropriatezza')
  const appropriate = investmentInterviewQuestions.filter((question) =>
    ['education', 'knowledge', 'experience'].includes(question.group),
  )
  expect(appropriate).toHaveLength(12)
  appropriate.forEach((question) => {
    expect(screen.getByRole('heading', { name: question.title })).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole(question.multiple ? 'checkbox' : 'radio', {
        name: question.id === 'q19' ? question.options[1] : question.options[0],
      }),
    )
    click('Prosegui')
  })
  expect(
    screen.getByRole('heading', { level: 2, name: 'Sottoscrizione intervista appropriatezza' }),
  ).toBeInTheDocument()
})

it('validates savings subscription selection, precontract, custom amount and final authentication', () => {
  view('savings')
  click('Sottoscrivi')
  click('Prosegui')
  expect(screen.getByRole('button', { name: 'Prosegui' })).toBeDisabled()
  fireEvent.click(screen.getByRole('radio'))
  reviewDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Ho preso visione dell’Informativa precontrattuale' }))
  click('Prosegui')
  fireEvent.change(screen.getByLabelText('Seleziona l’importo del certificato di deposito'), {
    target: { value: 'other' },
  })
  fireEvent.change(screen.getByLabelText('Importo'), { target: { value: '5500' } })
  click('Prosegui')
  expect(screen.getByRole('alert')).toHaveTextContent('Inserire un multiplo di 1.000')
  fireEvent.change(screen.getByLabelText('Importo'), { target: { value: '6000' } })
  click('Prosegui')
  click('Prosegui')
  expect(screen.getByRole('heading', { name: 'Riepilogo operazione' })).toBeInTheDocument()
  click('Prosegui')
  expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()
  reviewDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Confermo la presa visione della documentazione' }))
  click('Conferma')
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
  click('Conferma')
  expect(screen.getByRole('heading', { name: 'Certificato di deposito sottoscritto' })).toBeInTheDocument()
})

it('gates all advisory documents and three signature points before Mobile Code', () => {
  view('advisory')
  click('Visualizza e firma')
  expect(screen.getByRole('button', { name: 'Continua' })).toBeDisabled()
  reviewDocument()
  click('Continua')
  expect(screen.getByRole('button', { name: 'Continua' })).toBeDisabled()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Accetto il punto firma' }))
  click('Continua')
  reviewDocument()
  click('Continua')
  for (let i = 0; i < 2; i++) {
    expect(screen.getByRole('button', { name: 'Continua' })).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Accetto il punto firma' }))
    click('Continua')
  }
  click('Continua')
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
  click('Conferma')
  expect(screen.getByRole('heading', { name: 'La sottoscrizione si è conclusa correttamente' })).toBeInTheDocument()
})

it('respects global privacy on fiscal, savings, insurance and profile values', () => {
  for (const area of ['fiscal', 'savings', 'insurance', 'profile']) {
    const result = view(area, true)
    expect(result.container).toHaveTextContent('••••')
    expect(result.container).not.toHaveTextContent('4.014,79')
    expect(result.container).not.toHaveTextContent('27.500')
    expect(result.container).not.toHaveTextContent('5.000,00')
    cleanup()
  }
})

it('routes MIFID from profile and confirms alert deletion with an archive', () => {
  const { onNavigate } = view('profile')
  click('VISUALIZZA MIFID')
  expect(onNavigate).toHaveBeenCalledWith({ area: 'services', view: 'mifid' })
  click('Alert')
  click('Elimina Apple')
  click('Annulla')
  expect(screen.getByRole('button', { name: 'Elimina Apple' })).toBeInTheDocument()
  click('Elimina Apple')
  click('Conferma')
  expect(screen.queryByRole('button', { name: 'Elimina Apple' })).not.toBeInTheDocument()
  click('Archivio')
  expect(screen.getByRole('heading', { name: 'Apple' })).toBeInTheDocument()
  expect(screen.getAllByText('Cancellato').length).toBeGreaterThan(0)
})

it('activates a package only after contract review, consent and authentication and retains the resulting status', () => {
  const first = view('profile')
  click('apri pacchetto Money Trading Advanced')
  click('Attiva funzionalità')
  expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()
  reviewDocument()
  click('Conferma')
  fireEvent.click(screen.getByRole('checkbox', { name: 'Accetto i punti firma' }))
  click('Accetta e prosegui')
  click('Prosegui')
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
  click('Conferma')
  expect(screen.getByRole('heading', { name: 'Funzionalità aggiuntiva attivata' })).toBeInTheDocument()
  expect(readInvestmentServicePreferences().activePackages).toContain('Money Trading Advanced')
  first.unmount()
  view('packages')
  click('Recesso')
  click('Conferma')
  expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
  click('Conferma')
  expect(screen.getByRole('heading', { name: 'Revoca confermata' })).toBeInTheDocument()
  expect(readInvestmentServicePreferences().activePackages).not.toContain('Money Trading')
})

it('routes advisory operations to the exact fund and security transactions', () => {
  const { onNavigate } = view('advisory', false, 'operations')
  click('Inserisci operazione 2001049726590')
  expect(onNavigate).toHaveBeenCalledWith({
    area: 'funds',
    view: 'operation',
    action: 'subscribe',
    instrument: 'IT0005418741',
  })
  click('Inserisci operazione 2001049726591')
  expect(onNavigate).toHaveBeenCalledWith({
    area: 'securities',
    view: 'transaction',
    action: 'buy',
    instrument: 'IT0003153852',
  })
})

it('renders the missing fiscal position and sparse available months without dead-end sheets', () => {
  const empty = view('fiscal', false, 'no-position')
  expect(screen.getByText('Posizione fiscale non rilevata')).toBeInTheDocument()
  empty.unmount()
  view('fiscal', false, 'sparse-months')
  click('dettaglio 2024')
  expect(screen.getByRole('tab', { name: 'Maggio' })).toBeInTheDocument()
  expect(screen.queryByRole('tab', { name: 'Giugno' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('tab', { name: 'Prezzi' }))
  expect(screen.getAllByRole('heading', { name: 'UniCredit' })).toHaveLength(
    getFiscalSummary('2024', 10).records.length,
  )
})
it('shows only recorded fiscal losses through the demo date and derives the last processing date', () => {
  const { container } = view('fiscal')
  expect(screen.getByText('Minus accantonata').parentElement).toHaveTextContent('8,70 €')
  expect(screen.getByText('Ultima elaborazione').parentElement).toHaveTextContent('08/12/2024')
  expect(container).not.toHaveTextContent('10/10/2025')
  click('dettaglio 2025')
  expect(screen.getByText('Nessuna operazione nel periodo selezionato')).toBeInTheDocument()
})

it('blocks professional real-time market subscribers before document signing', () => {
  view('profile')
  click('apri pacchetto Trading Real Time NYSE')
  click('Attiva funzionalità')
  for (const label of ['Nome di azienda', 'Indirizzo di azienda', 'Titolo e Posizione ricoperta', 'Funzione'])
    fireEvent.change(screen.getByLabelText(label), { target: { value: 'Demo' } })
  click('Conferma')
  screen.getAllByRole('radio', { name: 'Sì' }).forEach((radio) => fireEvent.click(radio))
  click('Conferma')
  expect(screen.getByRole('alert')).toHaveTextContent('non consentono l’adesione')
  expect(screen.queryByRole('button', { name: 'APRI IL DOCUMENTO' })).not.toBeInTheDocument()
})

it('preserves service preferences for the demo session when browser storage denies writes', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage denied', 'SecurityError')
  })
  expect(() => saveInvestmentServicePreferences({ completedInterviews: ['adequacy'] })).not.toThrow()
  expect(readInvestmentServicePreferences().completedInterviews).toEqual(['adequacy'])
})

it('completes package activation when browser storage denies writes', () => {
  view('profile')
  click('apri pacchetto Money Trading Advanced')
  click('Attiva funzionalità')
  reviewDocument()
  click('Conferma')
  fireEvent.click(screen.getByRole('checkbox', { name: 'Accetto i punti firma' }))
  click('Accetta e prosegui')
  click('Prosegui')
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage denied', 'SecurityError')
  })
  click('Conferma')
  expect(screen.getByRole('heading', { name: 'Funzionalità aggiuntiva attivata' })).toBeInTheDocument()
  expect(readInvestmentServicePreferences().activePackages).toContain('Money Trading Advanced')
})

it('invalidates every advisory review and signature when another consultation is selected', () => {
  view('advisory')
  click('Visualizza e firma')
  reviewDocument()
  click('Continua')
  fireEvent.click(screen.getByRole('checkbox', { name: 'Accetto il punto firma' }))
  click('Continua')
  reviewDocument()
  click('Continua')
  for (let i = 0; i < 2; i++) {
    fireEvent.click(screen.getByRole('checkbox', { name: 'Accetto il punto firma' }))
    click('Continua')
  }
  for (let i = 0; i < 6; i++) click('Indietro')
  fireEvent.change(screen.getByLabelText('Seleziona la consulenza'), { target: { value: '2601086209285' } })
  click('Visualizza e firma')
  expect(screen.getByRole('button', { name: 'Continua' })).toBeDisabled()
  reviewDocument()
  click('Continua')
  expect(screen.getByRole('checkbox', { name: 'Accetto il punto firma' })).not.toBeChecked()
  expect(screen.getByRole('button', { name: 'Continua' })).toBeDisabled()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Accetto il punto firma' }))
  click('Continua')
  expect(screen.getByRole('button', { name: 'Continua' })).toBeDisabled()
  reviewDocument()
  click('Continua')
  for (let i = 0; i < 2; i++) {
    expect(screen.getByRole('checkbox', { name: 'Accetto il punto firma' })).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Continua' })).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Accetto il punto firma' }))
    click('Continua')
  }
})

it('rejects an incorrect five-digit Mobile Code without revoking a package and allows retry', () => {
  view('packages')
  click('Recesso')
  click('Conferma')
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '99999' } })
  click('Conferma')
  expect(screen.getByRole('alert')).toHaveTextContent('Mobile Code')
  expect(readInvestmentServicePreferences().activePackages).toContain('Money Trading')
  expect(screen.queryByRole('heading', { name: 'Revoca confermata' })).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
  click('Conferma')
  expect(screen.getByRole('heading', { name: 'Revoca confermata' })).toBeInTheDocument()
})
