// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'
import { RO_ONBOARDING_FLOW } from '@/flows/ro/onboarding'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
})

function mount(country: 'RO' | 'RS' = 'RO', step = 'introduction') {
  return render(
    <DemoProvider>
      <LanguageProvider>
        <NativeScreenPreview
          route={{ screen: 'prelogin', params: { onboarding: 'true', onboardingStep: step } }}
          snapshot={{ country, release: 'release-current', scenario: 'inactive', language: 'ro' }}
        />
      </LanguageProvider>
    </DemoProvider>,
  )
}
async function nativePress(button: HTMLElement) {
  // Allow the separate React 19 Native root's passive PressResponder update
  // to finish after the enabled state paints; send exactly one user press.
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  fireEvent.click(button)
}

it('uses the source photograph and keeps recommendation off the introduction form', async () => {
  const { container } = mount()
  await screen.findByRole('button', { name: 'AM COD DE RECOMANDARE' })
  expect(container.querySelector('img[src*="introduction-"]')).toBeTruthy()
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'AM COD DE RECOMANDARE' }))
  await screen.findByRole('textbox', { name: 'Unique Code' })
})

it('renders six OTP slots, locks only the current code after three failures and makes the resend budget terminal', async () => {
  mount('RO', 'phone-code')
  const first = await screen.findByRole('textbox', { name: 'Cod de verificare digit 1 of 6' })
  expect(screen.getAllByRole('textbox')).toHaveLength(6)
  fireEvent.change(first, { target: { value: '000000' } })
  const next = screen.getByRole('button', { name: 'Continuă' })
  await waitFor(() => expect(next).not.toHaveAttribute('aria-disabled', 'true'))
  fireEvent.click(next)
  await screen.findByText('Cod invalid')
  fireEvent.click(next)
  await screen.findByText('Mai ai 1 încercări pentru a introduce codul corect')
  fireEvent.click(next)
  await screen.findByText('Solicită un nou cod')
  expect(screen.getByRole('button', { name: 'Schimb numǎrul de telefon' })).toBeInTheDocument()
  for (let resend = 0; resend < 3; resend += 1) {
    fireEvent.click(screen.getByRole('button', { name: 'RETRIMITE CODUL' }))
    await screen.findByText('Loading…')
    await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())
  }
  fireEvent.click(screen.getByRole('button', { name: 'RETRIMITE CODUL' }))
  await screen.findByRole('heading', { name: 'Nu mai poți continua' })
  expect(screen.queryByRole('button', { name: 'RETRIMITE CODUL' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Reincepe fluxul' }))
  await screen.findByRole('button', { name: 'AM COD DE RECOMANDARE' })
})

it('does not proceed through privacy consent until the source switch is on', async () => {
  mount('RO', 'privacy')
  const next = await screen.findByRole('button', { name: 'Continuă' })
  expect(next).toHaveAttribute('aria-disabled', 'true')
  fireEvent.click(screen.getByRole('switch', { name: 'Am citit si am inteles pe deplin documentele de mai sus' }))
  await waitFor(() => expect(next).not.toHaveAttribute('aria-disabled', 'true'))
  fireEvent.click(next)
  await screen.findByRole('textbox', { name: 'Numarul de telefon mobil' })
})

it('requires an account and annex consent before leaving the product offer', async () => {
  mount()
  fireEvent.click(await screen.findByRole('button', { name: 'Continua' }))
  fireEvent.click(await screen.findByRole('radio', { name: 'EMPLOYED' }))
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Continuă' })).not.toHaveAttribute('aria-disabled', 'true'),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Continuă' }))
  const search = await screen.findByRole('searchbox', { name: 'Search employer' })
  fireEvent.change(search, { target: { value: 'Car' } })
  fireEvent.click(await screen.findByRole('button', { name: 'Carrefour Romania' }))
  const next = await screen.findByRole('button', { name: 'Continuă' })
  expect(next).toHaveAttribute('aria-disabled', 'true')
  fireEvent.click(screen.getByRole('switch', { name: 'Sunt de acord cu anexa de mai sus' }))
  await waitFor(() => expect(next).not.toHaveAttribute('aria-disabled', 'true'))
  fireEvent.click(screen.getByRole('checkbox', { name: 'LEI' }))
  await waitFor(() => expect(next).toHaveAttribute('aria-disabled', 'true'))
})

it('does not open Romanian onboarding in the Serbian prelogin host', async () => {
  mount('RS')
  await screen.findByRole('button', { name: /OTHER|ALTELE/i })
  expect(screen.queryByRole('button', { name: 'AM COD DE RECOMANDARE' })).not.toBeInTheDocument()
})

it('shows source OCR data as a read-only recap instead of asking for the identity again', async () => {
  mount('RO', 'personal')
  await screen.findByText('HEIDI')
  expect(screen.getByText('1850101400015')).toBeInTheDocument()
  expect(screen.getByText('11.03.2068')).toBeInTheDocument()
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
})

it('requires identity consent and visits the separate scan instructions before capturing', async () => {
  mount('RO', 'identity')
  const start = await screen.findByRole('button', { name: 'Start' })
  expect(start).toHaveAttribute('aria-disabled', 'true')
  fireEvent.click(screen.getByRole('switch', { name: /Sunt de acord sa parcurg procesul de identificare/ }))
  await waitFor(() => expect(start).not.toHaveAttribute('aria-disabled', 'true'))
  fireEvent.click(start)
  await screen.findByText('TINE TELEFONUL SI CARTEA DE IDENTITATE IN POZITIE VERTICALA')
  fireEvent.click(screen.getByRole('button', { name: 'Continuă' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Allow' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Scanează documentul' }))
  await screen.findByRole('button', { name: 'Confirmă si continuǎ' })
  fireEvent.click(screen.getByRole('button', { name: 'Refă o nouă poză' }))
  await screen.findByRole('button', { name: 'Scanează documentul' })
})

it('requires a complete address, and reveals the residence branch when the source switch is off', async () => {
  mount('RO', 'address')
  const next = await screen.findByRole('button', { name: 'Continuă' })
  expect(next).toHaveAttribute('aria-disabled', 'true')
  fireEvent.change(screen.getByRole('textbox', { name: 'Cod Postal' }), { target: { value: '021918' } })
  await waitFor(() => expect(next).not.toHaveAttribute('aria-disabled', 'true'))
  fireEvent.click(screen.getByRole('switch', { name: /Resedinta si adresa de corespondenta/ }))
  await screen.findByRole('textbox', { name: 'Strada' })
  expect(next).toHaveAttribute('aria-disabled', 'true')
})

it('blocks the virtual Gold conflict and lets the applicant change the physical card', async () => {
  mount('RO', 'card-gold-conflict')
  const next = await screen.findByRole('button', { name: 'Aleg Virtual Mastercard Gold' })
  expect(next).toHaveAttribute('aria-disabled', 'true')
  fireEvent.click(screen.getByRole('button', { name: 'SCHIMBǍ TIPUL DE CARD' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Nu, M-am razgandit' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(next).toHaveAttribute('aria-disabled', 'true')
  fireEvent.click(screen.getByRole('button', { name: 'SCHIMBǍ TIPUL DE CARD' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Da, vreau sa schimb cardul' }))
  const virtual = await screen.findByRole('button', { name: 'Aleg Virtual Mastercard Gold' })
  await waitFor(() => expect(virtual).not.toHaveAttribute('aria-disabled', 'true'))
})

it('completes the connected CR journey through contact verification, identity, questionnaire, cards and signing', async () => {
  mount()
  const click = async (name: string) => {
    const button = await screen.findByRole('button', { name })
    await waitFor(() => expect(button).not.toHaveAttribute('aria-disabled', 'true'))
    await nativePress(button)
  }
  const code = async (name: string) =>
    fireEvent.change(await screen.findByRole('textbox', { name }), { target: { value: '124610' } })
  const choose = async (label: string, option: string) => {
    await click(`Open ${label}`)
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole(option === 'Nu' ? 'radio' : 'checkbox', { name: option }))
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Continuă' })).not.toHaveAttribute('aria-disabled', 'true'),
    )
    fireEvent.click(within(dialog).getByRole('button', { name: 'Continuă' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  }
  await click('Continua')
  fireEvent.click(await screen.findByRole('radio', { name: 'RETIRED' }))
  await click('Continuă')
  fireEvent.click(await screen.findByRole('switch', { name: 'Sunt de acord cu anexa de mai sus' }))
  await click('Continuă')
  await click('I agree')
  await click('Incepe procesul')
  fireEvent.click(
    await screen.findByRole('switch', { name: 'Am citit si am inteles pe deplin documentele de mai sus' }),
  )
  await click('Continuă')
  fireEvent.change(await screen.findByRole('textbox', { name: 'Numarul de telefon mobil' }), {
    target: { value: '720020020' },
  })
  await click('Continuă')
  await code('Cod de verificare digit 1 of 6')
  await click('Continuă')
  await screen.findByText('Numărul de telefon a fost validat cu succes')
  await click('Continuă')
  fireEvent.change(await screen.findByRole('textbox', { name: 'Adresa ta de e-mail' }), {
    target: { value: 'demo@example.com' },
  })
  await click('Continuă')
  await code('Cod de verificare digit 1 of 6')
  await click('Continuă')
  fireEvent.click(
    await screen.findByRole('switch', { name: 'Renunt la termenul de 15 zile prevazut de lege, pentru studierea lor' }),
  )
  await click('Continuă')
  fireEvent.click(await screen.findByRole('switch', { name: /Sunt de acord sa parcurg procesul de identificare/ }))
  await click('Start')
  await click('Continuă')
  await click('Allow')
  await click('Scanează documentul')
  await click('Confirmă si continuǎ')
  await screen.findByText('HEIDI')
  await click('Continuă')
  fireEvent.change(await screen.findByRole('textbox', { name: 'Cod Postal' }), { target: { value: '021918' } })
  await click('Continuă')
  fireEvent.click(await screen.findByRole('switch', { name: 'Sunt de acord cu procesarea datelor mele biometrice' }))
  await click('Continuă')
  await click('Confirm face in oval')
  await click('Capture smile')
  await screen.findByRole('heading', { name: 'Identificare reusita' }, { timeout: 5000 })
  await click('Continuă')
  await choose('3. Care este sursa fondurilor tale', 'SALARIU')
  await choose('2. Care este scopul si relatia cu banca?', 'ÎNCASAREA SALARIULUI')
  await click('Continuă')
  await choose('1. Ce fel de tranzactii faci in decursul unei luni?', 'ORDINE DE PLATA/CU CARDUL')
  await choose('1.1 Tranzacții internaționale în țările', 'NU ESTE CAZUL')
  await choose('2. Ai venituri provenite din alte țări?', 'Nu')
  fireEvent.click(screen.getByRole('checkbox', { name: 'ACORD SITUATIA FINANCIARA SI TRANZACTII' }))
  await click('Continuă')
  await click('Continuă')
  const branchDialog = await screen.findByRole('dialog')
  fireEvent.focus(within(branchDialog).getByRole('textbox', { name: 'Caută' }))
  fireEvent.click(await within(branchDialog).findByRole('button', { name: /BRANCH ATM NAME 1/ }))
  fireEvent.click(await screen.findByRole('button', { name: 'Alege Sucursala' }))
  await screen.findByText('MARKETING PENTRU PRODUSELE UNICREDIT')
  await click('Continuă')
  fireEvent.click(await screen.findByRole('checkbox', { name: 'CARD VIRTUAL' }))
  await click('Continuă')
  await click('Aleg Virtual Mastercard Standard')
  fireEvent.change(await screen.findByLabelText('Introdu parola'), { target: { value: 'Demo access' } })
  fireEvent.change(screen.getByLabelText('Confirma parola'), { target: { value: 'Demo access' } })
  await click('Continuă')
  await click('DOCUMENTAȚIE CONTRACTUALĂ')
  const pdf = await screen.findByLabelText('Contractual documentation content')
  const dialog = screen.getByRole('dialog')
  const read = within(dialog).getByRole('button', { name: 'Am citit și sunt de acord' })
  expect(read).toHaveAttribute('aria-disabled', 'true')
  Object.defineProperties(pdf, {
    offsetHeight: { value: 280 },
    scrollHeight: { value: 370 },
    scrollTop: { value: 20, configurable: true },
  })
  fireEvent.scroll(pdf)
  expect(read).toHaveAttribute('aria-disabled', 'true')
  Object.defineProperty(pdf, 'scrollTop', { value: 90, configurable: true })
  fireEvent.scroll(pdf)
  await waitFor(() => expect(read).not.toHaveAttribute('aria-disabled', 'true'))
  await nativePress(read)
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  fireEvent.click(
    screen.getByRole('switch', { name: 'I give up the term of 15 days provided by law, for their study' }),
  )
  fireEvent.click(screen.getByRole('switch', { name: 'I agree with the Trans Sped Contract' }))
  await click('Send me an OTP')
  await code('Cod de verificare digit 1 of 6')
  await click('Semneazǎ')
  await screen.findByText('RO12UCNB1234567890', {}, { timeout: 5000 })
  await click('Continuă')
  fireEvent.click(await screen.findByRole('radio', { name: '4 of 5 stars' }))
  await click('Activeaza Mobile Banking')
  await screen.findByRole('button', { name: /OTHER|ALTELE/i })
}, 60000)

it('saves after email verification and restores the exact step only after password, phone and OTP verification', async () => {
  const first = mount('RO', 'identity')
  await screen.findByRole('button', { name: 'Start' })
  fireEvent.click(screen.getByRole('button', { name: 'Închide' }))
  fireEvent.change(await screen.findByLabelText('Seteazǎ parola pentru a putea relua fluxul'), {
    target: { value: 'Demo resume' },
  })
  const save = screen.getByRole('button', { name: 'Confirm parola şi revin mai târziu' })
  await waitFor(() => expect(save).not.toHaveAttribute('aria-disabled', 'true'))
  fireEvent.click(save)
  fireEvent.click(await screen.findByRole('radio', { name: 'M-AM RĂZGÂNDIT' }))
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Închide fluxul' })).not.toHaveAttribute('aria-disabled', 'true'),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Închide fluxul' }))
  await screen.findByRole('button', { name: /OTHER|ALTELE/i })
  first.unmount()
  mount('RO', 'resume-password')
  fireEvent.change(await screen.findByLabelText('Introdu parola pentru a continua fluxul'), {
    target: { value: 'Demo resume' },
  })
  const next = await screen.findByRole('button', { name: 'Continuǎ' })
  await waitFor(() => expect(next).not.toHaveAttribute('aria-disabled', 'true'))
  fireEvent.click(next)
  fireEvent.change(await screen.findByRole('textbox', { name: 'Cifrele lipsă digit 1 of 4' }), {
    target: { value: '0200' },
  })
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Continuǎ' })).not.toHaveAttribute('aria-disabled', 'true'),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Continuǎ' }))
  fireEvent.change(await screen.findByRole('textbox', { name: 'Cod de reluare digit 1 of 6' }), {
    target: { value: '124610' },
  })
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Continuǎ' })).not.toHaveAttribute('aria-disabled', 'true'),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Continuǎ' }))
  await screen.findByRole('button', { name: 'Start' })
  expect(screen.getByRole('switch', { name: /Sunt de acord sa parcurg procesul de identificare/ })).toHaveAttribute(
    'aria-checked',
    'false',
  )
})

it('rejects an invalid recommendation and returns to the source introduction after the valid code', async () => {
  mount('RO', 'recommendation')
  const input = await screen.findByRole('textbox', { name: 'Unique Code' })
  fireEvent.change(input, { target: { value: '111111111' } })
  const next = screen.getByRole('button', { name: 'Continuǎ' })
  await waitFor(() => expect(next).not.toHaveAttribute('aria-disabled', 'true'))
  fireEvent.click(next)
  await screen.findByText('Codul este invalid, te rugăm să reîncerci')
  fireEvent.change(input, { target: { value: '720020020' } })
  fireEvent.click(next)
  await screen.findByText('WHAT YOU WILL NEED')
  expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
})

it('requires the new delivery address before advancing and exposes the source courier coverage state', async () => {
  mount('RO', 'delivery-new')
  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText(/delivery area of Fan Courier/)).toBeInTheDocument()
  fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }))
  fireEvent.change(await screen.findByLabelText('Introdu parola'), { target: { value: 'Demo bank' } })
  fireEvent.change(screen.getByLabelText('Confirma parola'), { target: { value: 'Demo bank' } })
  expect(screen.getByRole('button', { name: 'Continuă' })).toHaveAttribute('aria-disabled', 'true')
  for (const [label, value] of [
    ['Județ | Sector', 'Sector 2'],
    ['Oraș', 'Bucharest'],
    ['Strada', 'Iancului'],
    ['Număr', '41'],
    ['Cod Postal', '021918'],
  ])
    fireEvent.change(screen.getByRole('textbox', { name: label }), { target: { value } })
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Continuă' })).not.toHaveAttribute('aria-disabled', 'true'),
  )
})

it('keeps an expired code blocked until a resend and shows the separate verified-phone screen', async () => {
  mount('RO', 'phone-expired')
  await screen.findByText('Cod expirat')
  const first = screen.getByRole('textbox', { name: 'Cod de verificare digit 1 of 6' })
  fireEvent.change(first, { target: { value: '124610' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continuă' }))
  expect(screen.getByText('Cod expirat')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'RETRIMITE CODUL' }))
  await screen.findByText('Loading…')
  await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())
  fireEvent.change(first, { target: { value: '124610' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continuă' }))
  await screen.findByText('Numărul de telefon a fost validat cu succes')
  expect(screen.queryByRole('button', { name: 'RETRIMITE CODUL' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Continuă' }))
  await screen.findByRole('textbox', { name: 'Adresa ta de e-mail' })
})

it('requires an abandonment reason and the free text for the other-reason branch', async () => {
  mount('RO', 'exit-survey')
  const close = await screen.findByRole('button', { name: 'Închide fluxul' })
  expect(close).toHaveAttribute('aria-disabled', 'true')
  fireEvent.click(screen.getByRole('radio', { name: 'ALT MOTIV' }))
  const reason = await screen.findByRole('textbox', { name: 'Introdu motivul tau' })
  expect(close).toHaveAttribute('aria-disabled', 'true')
  fireEvent.change(reason, { target: { value: 'I will be back' } })
  await waitFor(() => expect(close).not.toHaveAttribute('aria-disabled', 'true'))
  fireEvent.click(close)
  await screen.findByRole('button', { name: /OTHER|ALTELE/i })
})

it('opens the source step details inline and includes the sixth stage in the progress menu', async () => {
  mount('RO', 'steps')
  fireEvent.click(await screen.findByRole('button', { name: 'Mai multe detalii' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Date de contact' }))
  await screen.findByText(/We provide you consultation before you decide/)
  fireEvent.click(screen.getByRole('button', { name: 'Incepe procesul' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Pașii procesului' }))
  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText('Activarea Mobile Banking')).toBeInTheDocument()
  fireEvent.click(within(dialog).getByRole('button', { name: 'Ok, I got it' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})

it('opens the editable document viewer and gates agreement on reading without fabricating legal copy', async () => {
  mount('RO', 'privacy')
  fireEvent.click(
    await screen.findByRole('button', { name: 'NOTĂ DE INFORMARE PRIVIND PRELUCRAREA DATELOR CU CARACTER PERSONAL' }),
  )
  const content = await screen.findByLabelText('Document content')
  const agree = screen.getByRole('button', { name: 'Am citit si sunt de acord' })
  expect(agree).toHaveAttribute('aria-disabled', 'true')
  expect(screen.getByRole('button', { name: 'Descarcă' })).toBeInTheDocument()
  Object.defineProperties(content, {
    offsetHeight: { value: 306 },
    scrollHeight: { value: 520 },
    scrollTop: { value: 214 },
  })
  fireEvent.scroll(content)
  await waitFor(() => expect(agree).not.toHaveAttribute('aria-disabled', 'true'))
  fireEvent.click(agree)
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})

it('invalidates email verification when the applicant goes back and edits the address', async () => {
  mount('RO', 'email-verified')
  fireEvent.click(await screen.findByRole('button', { name: 'Back' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Back' }))
  fireEvent.change(await screen.findByRole('textbox', { name: 'Adresa ta de e-mail' }), {
    target: { value: 'changed@example.com' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Închide' }))
  await screen.findByRole('button', { name: 'Închide Fluxul' })
  expect(screen.queryByLabelText('Seteazǎ parola pentru a putea relua fluxul')).not.toBeInTheDocument()
})

it('uses the map pin to open a branch and completes selection without an inert overlay', async () => {
  mount('RO', 'branch-map')
  fireEvent.click(await screen.findByRole('button', { name: 'Sucursala Bucuresti pe hartă' }))
  await screen.findByText('BULEVARDUL EXPOZITIEI NR. 1 F')
  fireEvent.click(screen.getByRole('button', { name: 'Alege Sucursala' }))
  await screen.findByText('MARKETING PENTRU PRODUSELE UNICREDIT')
})

it('allows blocking and retrying the simulated source camera permission without opening a device camera', async () => {
  mount('RO', 'camera-permission')
  fireEvent.click(await screen.findByRole('button', { name: 'Block' }))
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  fireEvent.click(screen.getByRole('button', { name: 'Continuă' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Allow' }))
  await screen.findByRole('button', { name: 'Scanează documentul' })
})

it('preserves failed scan attempts through retries and reaches the terminal source outcome', async () => {
  mount('RO', 'scan-error')
  for (let retry = 0; retry < 2; retry += 1) {
    fireEvent.click(await screen.findByRole('button', { name: 'Refă o nouă poză' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Scanează documentul' }))
  }
  await screen.findByRole('heading', { name: 'Nu mai poți continua' })
  expect(screen.queryByRole('button', { name: 'Scanează documentul' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Gǎsește o sucursalǎ' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Sucursala Bucuresti pe hartă' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Alege Sucursala' }))
  await screen.findByRole('button', { name: /OTHER|ALTELE/i })
  expect(screen.queryByText('MARKETING PENTRU PRODUSELE UNICREDIT')).not.toBeInTheDocument()
})

it.each([
  ['phone', 'Numarul de telefon mobil', '7200200233333', '720020020'],
  ['email', 'Adresa ta de e-mail', 'abc@gmai', 'demo@example.com'],
])(
  'validates the complete %s input without silently truncating it into a valid value',
  async (step, label, invalid, valid) => {
    mount('RO', step)
    const input = await screen.findByRole('textbox', { name: label })
    fireEvent.change(input, { target: { value: invalid } })
    const next = screen.getByRole('button', { name: 'Continuă' })
    await waitFor(() => expect(next).not.toHaveAttribute('aria-disabled', 'true'))
    fireEvent.click(next)
    await screen.findByText('Numărul nu este valid, te rugăm să reîncerci')
    expect(input).toHaveValue(invalid)
    fireEvent.change(input, { target: { value: valid } })
    fireEvent.click(next)
    await screen.findByRole('textbox', { name: 'Cod de verificare digit 1 of 6' })
  },
)

it('preserves the selected Prime tiers through both source detail screens and the recap', async () => {
  mount('RO', 'card-types-prime')
  fireEvent.click(await screen.findByRole('checkbox', { name: 'CARD FIZIC MASTERCARD PLATINUM' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'CARD FIZIC MASTERCARD STANDARD' }))
  const next = screen.getByRole('button', { name: 'Continuă' })
  await waitFor(() => expect(next).not.toHaveAttribute('aria-disabled', 'true'))
  fireEvent.click(next)
  await screen.findByText('Mastercard Platinum')
  fireEvent.click(screen.getByRole('button', { name: 'Aleg Mastercard Standard' }))
  await screen.findByText('Mastercard Standard')
  fireEvent.click(screen.getByRole('button', { name: 'Aleg Mastercard Standard' }))
  await screen.findByText('Here is a recap of your choices, if you want a different selection you need to go back.')
  expect(screen.getByText('Mastercard Platinum')).toBeInTheDocument()
  expect(screen.getByText('Mastercard Standard')).toBeInTheDocument()
})

it('opens all editable source benefit details from the CR cost variant and returns to its selection', async () => {
  mount('RO', 'card-costs')
  await screen.findByText('Cost information 1')
  fireEvent.click(screen.getByRole('button', { name: 'More details' }))
  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText('Asigurare aparate electronice si electrocasnice')).toBeInTheDocument()
  expect(within(dialog).getAllByRole('link')).toHaveLength(5)
  fireEvent.click(within(dialog).getByRole('button', { name: 'Ok, Am inteles' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(screen.getByRole('button', { name: 'Aleg Virtual Mastercard Standard' })).toBeInTheDocument()
})

const allReviewScreens = [
  ...new Set(
    RO_ONBOARDING_FLOW.scenarios.flatMap((scenario) =>
      scenario.steps.map((step) => step.screen.replace('ro-onboarding-', '')),
    ),
  ),
]
it.each(allReviewScreens)('mounts the registered onboarding review screen %s in the real native host', async (step) => {
  const { container } = mount('RO', step)
  await waitFor(() =>
    expect(container.querySelector('[data-native-screen-preview]')).toHaveAttribute(
      'data-native-screen-preview',
      'ready',
    ),
  )
  expect(screen.queryByText('Native preview unavailable.')).not.toBeInTheDocument()
  expect(container.querySelector('[data-native-current-host]')?.textContent?.trim().length).toBeGreaterThan(10)
})

it('shows the address recap before leaving a changed residence and lets the applicant edit it again', async () => {
  mount('RO', 'address-different')
  const next = await screen.findByRole('button', { name: 'Continuă' })
  fireEvent.click(next)
  await screen.findByRole('button', { name: 'Modifică adresele' })
  expect(screen.queryByRole('textbox', { name: 'Strada' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Modifică adresele' }))
  expect(await screen.findByRole('textbox', { name: 'Strada' })).toHaveValue('Sos Iancului')
})
