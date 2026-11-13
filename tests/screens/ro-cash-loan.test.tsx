// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'
import { RO_CASH_LOAN_FLOW } from '@/flows/ro/cash-loan'
import { cashLoanSession } from '@/features/ro-cash-loan/session'
vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})
afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
  cashLoanSession.clearOnboardingDraft()
})
function mount(step = 'loan-introduction', country: 'RO' | 'RS' = 'RO') {
  return render(
    <DemoProvider>
      <LanguageProvider>
        <NativeScreenPreview
          route={{
            screen: 'prelogin',
            params: { onboarding: 'true', onboardingJourney: 'cash-loan', onboardingStep: step },
          }}
          snapshot={{ country, release: 'release-current', scenario: 'inactive', language: 'ro' }}
        />
      </LanguageProvider>
    </DemoProvider>,
  )
}
const nextName = /^Continu[ăǎ]$/
async function nativePress(button: HTMLElement) {
  // The compiled React 19 host updates RN Web's PressResponder in a passive
  // effect. Let the enabled state paint before a single simulated user press.
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  fireEvent.click(button)
}
async function click(name: string | RegExp = nextName) {
  const button = await screen.findByRole('button', { name })
  await waitFor(() => expect(button).not.toHaveAttribute('aria-disabled', 'true'))
  await nativePress(button)
}
async function field(name: string, value: string) {
  fireEvent.change(await screen.findByLabelText(name), { target: { value } })
}
async function otp() {
  fireEvent.change(await screen.findByRole('textbox', { name: 'Cod de verificare digit 1 of 6' }), {
    target: { value: '124610' },
  })
}
async function resumeSavedLoan() {
  await field('Introdu parola pentru a continua fluxul', 'Demo resume')
  await click('Continuǎ')
  await field('Cifrele lipsă digit 1 of 4', '0200')
  await click('Continuǎ')
  await field('Cod de reluare digit 1 of 6', '124610')
  await click('Continuǎ')
}
async function clearNativeLoanDraft() {
  const reset = mount('resume-password')
  await click('Reîncepe fluxul')
  reset.unmount()
}
it('rejects a draft that expires between phone verification and the recovery OTP', async () => {
  await clearNativeLoanDraft()
  const expiresAt = Date.now() + 60000
  await cashLoanSession.saveOnboardingDraft(
    {
      index: 6,
      values: { phone: '720020020', email: 'demo@example.com' },
      checks: {},
      emailVerified: true,
      completed: false,
      expiresAt,
    },
    'Demo resume',
  )
  mount('resume-password')
  await field('Introdu parola pentru a continua fluxul', 'Demo resume')
  await click('Continuǎ')
  await field('Cifrele lipsă digit 1 of 4', '0200')
  await click('Continuǎ')
  await field('Cod de reluare digit 1 of 6', '124610')
  const clock = vi.spyOn(Date, 'now').mockReturnValue(expiresAt + 1)
  try {
    await click('Continuǎ')
    await screen.findByRole('heading', { name: 'Link expirat' })
    expect(screen.queryByRole('heading', { name: 'Scanează-ți cartea de identitate' })).not.toBeInTheDocument()
  } finally {
    clock.mockRestore()
  }
})
it('resaves the new stage after resuming from a temporary loan data-review page', async () => {
  await clearNativeLoanDraft()
  await cashLoanSession.saveOnboardingDraft(
    {
      index: 17,
      values: { phone: '720020020', email: 'demo@example.com', resumeLoanOverride: 'loan-data-review' },
      checks: {},
      emailVerified: true,
      completed: false,
      expiresAt: Date.now() + 60000,
    },
    'Demo resume',
  )
  const first = mount('resume-password')
  await resumeSavedLoan()
  await click('Confirm datele si continui')
  await screen.findByRole('heading', { name: 'Acorduri şi Documente' })
  await click('Închide')
  await field('Seteazǎ parola pentru a putea relua fluxul', 'Demo resume')
  await click('Confirm parola şi revin mai târziu')
  await screen.findByRole('heading', { name: 'Ne pare rău să te vedem plecând!' })
  first.unmount()
  mount('resume-password')
  await resumeSavedLoan()
  await screen.findByRole('heading', { name: 'Acorduri şi Documente' })
})
async function choose(label: string, option: string, shared = true) {
  await click(`Open ${label}`)
  const dialog = await screen.findByRole('dialog')
  fireEvent.click(within(dialog).getByRole(shared ? 'checkbox' : 'radio', { name: option }))
  const button = within(dialog).getByRole('button', { name: nextName })
  await waitFor(() => expect(button).not.toHaveAttribute('aria-disabled', 'true'))
  await nativePress(button)
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
}
async function readDocument(title: string) {
  await click(title)
  const content = await screen.findByLabelText('Document content')
  const dialog = screen.getByRole('dialog')
  const accept = within(dialog).getByRole('button', { name: 'Am citit si sunt de acord' })
  expect(accept).toHaveAttribute('aria-disabled', 'true')
  Object.defineProperties(content, {
    offsetHeight: { value: 280 },
    scrollHeight: { value: 520 },
    scrollTop: { value: 250, configurable: true },
  })
  fireEvent.scroll(content)
  await waitFor(() => expect(accept).not.toHaveAttribute('aria-disabled', 'true'))
  await nativePress(accept)
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
}
it('keeps Cash Loan restricted to Romania Baseline', async () => {
  mount('loan-introduction', 'RS')
  await screen.findByRole('button', { name: /OTHER|ALTELE/i })
  expect(screen.queryByRole('heading', { name: 'Creditul 100% online' })).not.toBeInTheDocument()
})
it('completes the connected credit journey through the shared identification and account setup', async () => {
  mount()
  fireEvent.click(
    await screen.findByRole('switch', { name: 'Am citit si am inteles anterior si integral documentele de mai sus' }),
  )
  await click()
  await field('Numarul de telefon mobil', '720020020')
  await click()
  await otp()
  await click()
  await screen.findByText('Numărul de telefon a fost validat cu succes')
  await click()
  await field('Email-ul tau', 'demo@example.com')
  await click()
  await otp()
  await click()
  expect(screen.queryByRole('switch', { name: /Renunt la termenul/ })).not.toBeInTheDocument()
  await click()
  fireEvent.click(await screen.findByRole('switch', { name: /Sunt de acord să particip la procesul de identificare/ }))
  await click()
  await click()
  await click('Allow')
  await click('Scanează documentul')
  await click('Confirmă si continuǎ')
  await screen.findByText('HEIDI')
  await click()
  await field('Cod Postal', '021918')
  await click()
  fireEvent.click(await screen.findByRole('switch', { name: 'Sunt de acord cu prelucrarea datelor mele biometrice' }))
  await click()
  await click('Confirm face in oval')
  await click('Capture smile')
  await screen.findByRole('heading', { name: 'Identificare făcută cu success' }, { timeout: 5000 })
  await click()
  await screen.findByText('ÎMPĂRTĂȘIREA DATELOR CU GRUPUL')
  await click()
  await field('INTRODU CODUL PIN', '124610')
  await field('CONFIRMĂ CODUL PIN', '124610')
  await click()
  for (const title of [
    'SOLICITARE OFERTĂ CREDIT',
    'ACORD ANAF',
    'NOTA DE INFORMARE BIROUL DE CREDIT',
    'NOTA DE INFORMARE ȘI ACORD GDPR UCFIN',
  ])
    await readDocument(`Deschide ${title}`)
  await click('Semneazǎ Acorduri')
  await field('INTRODU CODUL PIN', '124610')
  await click('SIGN')
  await choose('Statut Profesional', 'ANGAJAT')
  await choose('Tipul contractului de munca', 'PERIOADA NEDETERMINATA')
  await field('Ocupatia', 'Contabil')
  await choose('Persoane aflate in intretinere', '0')
  await choose('Starea civila', 'CASATORIT')
  await click()
  await screen.findByRole('heading', { name: 'Oferta preliminară' }, { timeout: 5000 })
  fireEvent.click(screen.getByRole('switch', { name: 'ACORD GDPR GENERALI' }))
  await choose('Achitare credit prin', 'Rată egală')
  await choose('Ziua cand vei plati rata', '13')
  await click()
  await screen.findByRole('heading', { name: 'Sumarizare ofertă' })
  for (const title of [
    'DOCUMENTAȚIE PRECONTRACTUALĂ CREDIT',
    'EMITERE CERTIFICAT ELECTRONIC',
    'DOCUMENTAȚIE PRECONTRACTUALĂ ASIGURARE',
    'CONDIȚII DE ASIGURARE',
  ])
    await readDocument(`Deschide ${title}`)
  await click()
  await field('INTRODU CODUL PIN', '124610')
  await click('SIGN')
  await screen.findByRole('heading', { name: 'Credit aprobat' }, { timeout: 5000 })
  await click()
  expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  fireEvent.click(await screen.findByRole('switch', { name: 'Sunt de acord cu anexa de mai sus' }))
  await click()
  fireEvent.click(await screen.findByRole('checkbox', { name: 'CARD VIRTUAL' }))
  await click()
  await click('Aleg Virtual Mastercard Standard')
  await field('Introdu parola', 'Demo access')
  await field('Confirma parola', 'Demo access')
  await click()
  await choose('1. Care este sursa fondurilor', 'SALARIU SAU PLĂȚI PENTRU SERVICII PRESTATE', true)
  await choose('2. Care este scopul si relatia cu banca?', 'ÎNCASAREA SALARIULUI', true)
  await click()
  await choose('1. Ce fel de tranzactii faci in decursul unei luni?', 'TRANSFERURI / PLAȚI CU CARDUL', true)
  await choose('1.1 Tranzacții internaționale în țările', 'NU ESTE CAZUL', true)
  expect(screen.queryByRole('button', { name: 'Open 2. Ai venituri provenite din alte țări?' })).not.toBeInTheDocument()
  await click()
  await click()
  const branches = await screen.findByRole('dialog')
  fireEvent.focus(within(branches).getByRole('textbox', { name: 'Caută' }))
  fireEvent.click(await within(branches).findByRole('button', { name: /BRANCH ATM NAME 1/ }))
  await click('Alege Sucursala')
  await screen.findByRole('heading', { name: 'Contractul tău' }, { timeout: 5000 })
  await choose('Modalitatea de plata a ratei', 'Debit direct')
  for (const title of ['ISNE', 'CONTRACT', 'DOCUMENTAȚIE CONTRACTUALĂ']) await readDocument(title)
  fireEvent.click(screen.getByRole('checkbox', { name: 'ACORD INFORMARE PREALABILĂ' }))
  await click()
  await otp()
  await click('Semneazǎ')
  await screen.findByRole('heading', { name: 'Părerea ta contează' }, { timeout: 5000 })
  await click()
  await screen.findByRole('heading', { name: 'Bine ai venit!' })
  await click('Inapoi in Mobile Banking')
  await screen.findByRole('button', { name: /OTHER|ALTELE/i })
}, 60000)
it('does not reuse an incorrect PIN and locks signing on the third wrong attempt', async () => {
  mount('loan-agreements-pin')
  for (let i = 0; i < 3; i++) {
    await field('INTRODU CODUL PIN', '000000')
    await click('SIGN')
    if (i < 2) await screen.findByText(`PIN incorect. Încercări rămase: ${2 - i}`)
  }
  await screen.findByRole('heading', { name: 'Nu mai poți continua' })
})
it('requires reading the credit documents before the study-period waiver', async () => {
  mount('loan-contract')
  fireEvent.click(await screen.findByRole('checkbox', { name: 'ACORD INFORMARE PREALABILĂ' }))
  expect(screen.getByRole('checkbox', { name: 'ACORD INFORMARE PREALABILĂ' })).toHaveAttribute('aria-checked', 'false')
  await screen.findByText('Este necesar să deschizi mai întâi documentația contractuală.')
})
it('confirms removal of an uploaded filename and requires another document afterwards', async () => {
  mount('loan-document-uploaded')
  await click('Șterge Nume document.pdf')
  await click('Sterge')
  await screen.findByRole('button', { name: 'ÎNCARCĂ DOCUMENTUL' })
  expect(screen.getByRole('button', { name: nextName })).toHaveAttribute('aria-disabled', 'true')
})

const reviewScreens = [
  ...new Set(
    RO_CASH_LOAN_FLOW.scenarios.flatMap((scenario) =>
      scenario.steps.map((step) => step.screen.replace('ro-cash-loan-', '')),
    ),
  ),
]
it.each(reviewScreens)('mounts the registered Cash Loan review screen %s in the real native host', async (step) => {
  const { container } = mount(step)
  await waitFor(() =>
    expect(container.querySelector('[data-native-screen-preview]')).toHaveAttribute(
      'data-native-screen-preview',
      'ready',
    ),
  )
  expect(screen.queryByText('Native preview unavailable.')).not.toBeInTheDocument()
  expect(container.querySelector('[data-native-current-host]')?.textContent?.trim().length).toBeGreaterThan(10)
  if (step !== 'loan-introduction')
    expect(screen.queryByRole('heading', { name: 'Creditul 100% online' })).not.toBeInTheDocument()
})

it('keeps the loan card order and Romanian benefits and skips the account-opening CR recap', async () => {
  mount('cards')
  fireEvent.click(await screen.findByRole('checkbox', { name: 'CARD FIZIC' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'CARD VIRTUAL' }))
  await click()
  expect(
    await screen.findByText('Beneficiezi de livrare gratuită a cardului, direct la tine acasă!'),
  ).toBeInTheDocument()
  await click('Aleg Mastercard Standard')
  await screen.findByRole('heading', { name: 'Selectează cardul virtual' })
  await click('Aleg Virtual Mastercard Standard')
  await screen.findByLabelText('Introdu parola')
  expect(screen.queryByText(/Here is a recap/)).not.toBeInTheDocument()
})
it('shows the source low-score follow-up and hides it for a high score', async () => {
  mount('loan-rating-low')
  await screen.findByText('Cum putem imbunatati fluxul?')
  expect(screen.queryByText('Value description')).not.toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'Durata fluxului' })).toHaveAttribute('aria-checked', 'true')
  fireEvent.click(screen.getByRole('radio', { name: '5 of 5 stars' }))
  await waitFor(() => expect(screen.queryByText('Cum putem imbunatati fluxul?')).not.toBeInTheDocument())
})
it('requires a resumable password on the original pending-identification screen', async () => {
  mount('loan-identity-pending')
  await screen.findByRole('heading', { name: 'Procesǎm datele tale' })
  await field('Seteazǎ parola pentru a putea relua fluxul', 'ab')
  expect(screen.getByRole('button', { name: 'Confirm parola și revin mai târziu' })).toHaveAttribute(
    'aria-disabled',
    'true',
  )
  await screen.findByText('Parola este invalidă. Introduceți cel puțin 3 caractere.')
})
it('offers the source income categories and lets the applicant opt out without completing an income form', async () => {
  mount('loan-other-income')
  await click('Open Alte tipuri de venit')
  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByRole('checkbox', { name: 'Pensie militara' })).toBeInTheDocument()
  expect(
    within(dialog).getByRole('checkbox', { name: 'Norma de hrana pentru angajatii institutiilor de stat' }),
  ).toBeInTheDocument()
  expect(within(dialog).getByText(/Daca esti angajat al unei institutii publice/)).toBeInTheDocument()
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
  await click('Nu am alte tipuri de venit')
  await screen.findByRole('heading', { name: 'Oferta preliminară' }, { timeout: 5000 })
})
it('adds another income without losing the previously declared income entries', async () => {
  mount('loan-income-summary')
  await click('Adaugǎ alte tipuri de venit')
  await choose('Alte tipuri de venit', 'Pensie militara')
  await field('Venitul lunar incasat', '2500')
  await field('CUI Angajator', '123456')
  await field('Ocupatia', 'Pensionar')
  await field('Data angajare', '01-01-2020')
  await choose('Tipul contractului de munca', 'Perioada nedeterminata')
  await click()
  expect(await screen.findByRole('button', { name: 'Pensie militara' })).toHaveTextContent('2500')
  expect(screen.getByRole('button', { name: 'Diurnă' })).toHaveTextContent('2.000')
})
it('uses the source recommended-insurance panel and removes it when insurance is declined', async () => {
  mount('loan-insurance-recommended')
  await screen.findByText('RECOMANDAT')
  expect(screen.getByText('1 punct procentual')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('radio', { name: /^NU DORESC ASIGURARE PENTRU CREDIT/ }))
  await waitFor(() => expect(screen.queryByText('RECOMANDAT')).not.toBeInTheDocument())
  expect(screen.queryByRole('switch', { name: 'ACORD GDPR GENERALI' })).not.toBeInTheDocument()
})
it.each([
  ['loan-phone-information', /Va fi utilizat pentru activarea Mobile Banking, procesul de creditare/],
  [
    'loan-email-information',
    /La aceasta adresa vei primi comunicari din partea UniCredit Bank si Unicredit Consumer Financing/,
  ],
  ['loan-biometrics-information', /În procesul de acordare a creditului online/],
] as const)('shows the credit-specific common information state %s', async (step, copy) => {
  mount(step)
  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText(copy)).toBeInTheDocument()
})
