// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { unzipSync } from 'fflate'
import { PRIME_FLOW } from '@/flows/shared/prime'
import { PrimePreview } from '@/flows/shared/prime/preview'
import { primeEntryScreen, primeReferenceTarget, resolvePrimePrototypeTarget } from '@/features/prime/reference'
import { PRIME_CZ_CONTACT_NUMBER } from '@/features/prime/callAudio'
import { PRIVATE_WEALTH_BENEFITS_COPY } from '@/features/prime/content'
import { FLOW_DEFINITIONS, FLOW_ORDER } from '@/app/screens/flow-library/flows'
import { FlowNavProvider } from '@/app/screens/flow-library/components/prototypeNav'
import { buildFlowReferencePackage } from '@/app/screens/flow-library/handoff/referencePackage'
import { FLOW_SCREEN_SOURCES } from '@/app/screens/flow-library/components/screenSources'
import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'
import { renderBankingScreen } from '../helpers/coverageProviders'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => ({
  loadNativeDemoModule: (await import('../helpers/nativeWebRenderer')).loadNativeDemoModuleForWebTest,
}))

afterEach(() => {
  cleanup()
  localStorage.clear()
  resetNativeWebRendererDiagnostics()
})

describe('PRIME reference in Flows', () => {
  it('registers a documented prototype with alternative paths and complete screen contracts', () => {
    expect(FLOW_DEFINITIONS['pi-prime']).toBe(PRIME_FLOW)
    expect(FLOW_ORDER).toContain('pi-prime')
    expect(PRIME_FLOW.prototype?.start).toBe('prime-home')
    expect(PRIME_FLOW.scenarios.some((scenario) => scenario.kind === 'alternate')).toBe(true)
    expect(PRIME_FLOW.scenarios.some((scenario) => scenario.kind === 'error')).toBe(true)
    for (const scenario of PRIME_FLOW.scenarios) {
      for (const step of scenario.steps) {
        expect(PRIME_FLOW.screenSpecs[step.screen]?.defaultState, step.screen).toBeTruthy()
        expect(PRIME_FLOW.prototype?.nodes[step.screen], step.screen).toBeDefined()
      }
    }
  })

  it('allows homepage and PRIME destinations while containing unrelated app navigation', () => {
    expect(primeReferenceTarget({ screen: 'prime' })).toBe('prime-advisor')
    expect(primeReferenceTarget({ screen: 'products', params: { view: 'prime' } })).toBe('prime-advisor')
    expect(primeReferenceTarget({ screen: 'prime', params: { referenceState: 'prime-benefits' } })).toBe(
      'prime-benefits',
    )
    expect(primeReferenceTarget({ screen: 'prime', params: { referenceState: '__proto__' } })).toBe('prime-advisor')
    expect(primeReferenceTarget({ screen: 'home' })).toBe('prime-home')
    for (const destination of ['accounts', 'payments', 'investments', 'profile', 'messages'] as const) {
      expect(primeReferenceTarget({ screen: destination })).toBeNull()
    }
  })

  it('ships the executable reference and reused native sources in the handoff', async () => {
    const source = FLOW_SCREEN_SOURCES['pi-prime']
    expect(source?.file).toBe('src/flows/shared/prime/preview.tsx')
    expect(source?.dependencies?.some((item) => item.file.endsWith('/more/Advisor.tsx'))).toBe(true)
    expect(source?.dependencies?.some((item) => item.file.endsWith('/more/PrimeContact.tsx'))).toBe(true)
    expect(source?.dependencies?.some((item) => item.file.endsWith('/PrimeUpgradeCall.tsx'))).toBe(true)
    expect(source?.dependencies?.some((item) => item.file.endsWith('/primePrivateFills.ts'))).toBe(true)
    expect(source?.dependencies?.some((item) => item.file.endsWith('/primeStandardFills.ts'))).toBe(true)
    const blob = buildFlowReferencePackage(PRIME_FLOW, source)
    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(blob)
    })
    const files = unzipSync(new Uint8Array(buffer))
    const decode = (file: string) => new TextDecoder().decode(files[file])
    expect(decode('src/flows/shared/prime/definition.ts')).toContain('PRIME_FLOW')
    expect(decode('src/features/prime/callAudio.ts')).toContain('PRIME_CZ_CONTACT_NUMBER')
    expect(decode('src/features/prime/content.ts')).toContain('PRIVATE_WEALTH_BENEFITS_COPY')
    const serviceIconsPath = 'src/app/components/icons/domains/services/custom.tsx'
    expect(decode(serviceIconsPath)).toBe(source?.dependencies?.find((item) => item.file === serviceIconsPath)?.source)
    expect(decode('native-spike/src/app/PrimeUpgrade.tsx')).toContain('M17.3708 7.09252C18.9245 5.63583')
    expect(decode('native-spike/src/app/PrimeUpgradeCall.tsx')).toContain('primeCallTimeline')
    expect(decode('native-spike/src/app/primePrivateFills.ts')).toContain('PRIVATE_PAGE_GRADIENTS')
    expect(decode('native-spike/src/app/primeStandardFills.ts')).toContain('STANDARD_SOURCE_PAINTS')
    expect(decode('native-spike/src/app/PrimeStandardBackground.web.tsx')).toContain('STANDARD_BACKGROUND_LAYERS')
    expect(decode('native-spike/src/experiences/pi/current/baseline/more/Appointment.tsx')).toContain('AppointmentFlow')
    for (const helper of ['Ui', 'MeetingViews']) {
      const file = `native-spike/src/experiences/pi/current/baseline/more/appointment/${helper}.tsx`
      const dependency = source?.dependencies?.find((item) => item.file === file)
      expect(dependency, `Appointment ${helper} must ship with its parent implementation`).toBeDefined()
      expect(decode(file)).toBe(dependency?.source)
    }
    expect(decode('native-spike/src/experiences/pi/current/baseline/more/CallRequest.tsx')).toContain('CallFlow')
    expect(files['handoff/frontend-handoff-manifest.json']).toBeDefined()
  })

  it('reuses the actual native advisor, benefits, call cancellation and email composer without changing Demo storage', async () => {
    const saved = JSON.stringify({ askEveryTime: false, preferredApp: 'mail' })
    localStorage.setItem('uc-prime-mail-preferences-v1', saved)
    const rendered = renderBankingScreen(
      <PrimePreview screen="prime-advisor" parameters={{ segment: 'prime', service: 'active' }} />,
      { country: 'RO' },
    )
    await asyncNativeReady(rendered.container)
    expect(await screen.findByText('Iacob Mihai')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Iacob Mihai' })).toHaveAttribute(
      'src',
      expect.stringContaining('standard-advisor'),
    )
    fireEvent.click(screen.getByRole('tab', { name: /your benefits/i }))
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: /your benefits/i })).toHaveAttribute('aria-selected', 'true'),
    )
    fireEvent.click(screen.getByRole('tab', { name: /your advisor/i }))
    fireEvent.click(await screen.findByRole('button', { name: 'Call now' }))
    await screen.findByTestId('source-prime-call-confirm')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByTestId('source-prime-call-confirm')).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Send an email' }))
    const chooser = await screen.findByTestId('source-prime-email-chooser')
    fireEvent.click(within(chooser).getByRole('button', { name: 'Gmail' }))
    await screen.findByRole('textbox', { name: 'Subject' })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByTestId('source-prime-email-compose')).not.toBeInTheDocument())
    expect(localStorage.getItem('uc-prime-mail-preferences-v1')).toBe(saved)
  })

  it('renders the Czech Baseline homepage and consumes only its PRIME entry', async () => {
    const go = vi.fn()
    const rendered = renderBankingScreen(
      <FlowNavProvider
        value={{
          active: true,
          canClose: false,
          go,
          primary: vi.fn(),
          secondary: vi.fn(),
          back: vi.fn(),
          close: vi.fn(),
        }}
      >
        <PrimePreview screen="prime-home" parameters={{ segment: 'prime' }} />
      </FlowNavProvider>,
      { country: 'CZ' },
    )
    await asyncNativeReady(rendered.container)
    expect(screen.getByRole('heading', { name: 'Your Homepage' })).toBeInTheDocument()
    expect(screen.getByText('Total Owed')).toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: 'Prime' }))
    await waitFor(() => expect(go).toHaveBeenCalledWith('prime-advisor'))
  })

  it('routes Standard by service entitlement and leaves Prime and Private on the existing service', () => {
    expect(primeEntryScreen('standard', false)).toBe('prime-upgrade')
    expect(primeEntryScreen('standard', true)).toBe('prime-advisor')
    expect(primeEntryScreen('prime', false)).toBe('prime-advisor')
    expect(primeEntryScreen('private', false)).toBe('prime-advisor')
    expect(resolvePrimePrototypeTarget('prime-home', 'prime-upgrade', { segment: 'private' })).toBe('prime-advisor')
    expect(
      resolvePrimePrototypeTarget('prime-home', 'prime-upgrade', { segment: 'standard', service: 'inactive' }),
    ).toBe('prime-upgrade')
    expect(resolvePrimePrototypeTarget('prime-home', 'prime-upgrade', { segment: 'standard', service: 'active' })).toBe(
      'prime-upgrade',
    )
  })

  it('opens the Standard My advisor source with David and preserves its Upgrade return path', async () => {
    const rendered = renderBankingScreen(
      <PrimePreview screen="prime-home" parameters={{ segment: 'standard', service: 'active' }} />,
      { country: 'CZ' },
    )
    await asyncNativeReady(rendered.container)
    fireEvent.click(await screen.findByRole('button', { name: 'My advisor' }))
    expect(await screen.findByText('David Novak')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'My advisor' })).toBeVisible()
    expect(screen.getByRole('img', { name: 'David Novak' })).not.toHaveAttribute(
      'src',
      expect.stringContaining('standard-advisor'),
    )
    expect(screen.getByTestId('standard-advisor-background')).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(screen.queryByText('Iacob Mihai')).not.toBeInTheDocument()
    for (const action of ['Call now', 'Send an email', 'Book an appointment', 'Request a call']) {
      expect(screen.getByRole('button', { name: action })).toBeInTheDocument()
    }
    fireEvent.click(screen.getByRole('button', { name: 'Upgrade' }))
    await screen.findByText('Prime is the service for you:')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByText('David Novak')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'My advisor' })).toBeVisible()
    expect(
      PRIME_FLOW.scenarios.find((scenario) => scenario.id === 'standard-active')?.steps.map((step) => step.screen),
    ).toEqual(['prime-home', 'prime-advisor', 'prime-upgrade'])
  })

  it('reproduces upgrade and calls UniCredit rather than the personal advisor', async () => {
    const rendered = renderBankingScreen(
      <PrimePreview screen="prime-home" parameters={{ segment: 'standard', service: 'inactive' }} />,
      { country: 'CZ' },
    )
    await asyncNativeReady(rendered.container)
    fireEvent.click(await screen.findByRole('button', { name: 'Upgrade' }))
    await screen.findByText('Prime is the service for you:')
    expect(screen.getByRole('img', { name: 'UniCredit advisor meeting a customer' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Call us to get it now' }))
    await screen.findByTestId('source-prime-call-active')
    expect(screen.getByText('UniCredit · Czechia')).toBeInTheDocument()
    expect(screen.getByText(PRIME_CZ_CONTACT_NUMBER)).toBeInTheDocument()
    expect(screen.getByText('Calling…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'FaceTime' })).toBeDisabled()
    expect(screen.queryByText('David Novak')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'End call' }))
    await screen.findByText('Prime is the service for you:')
  })

  it('reuses the same Czech homepage for Private and opens its distinct fictional advisor and branding', async () => {
    const rendered = renderBankingScreen(<PrimePreview screen="prime-home" parameters={{ segment: 'private' }} />, {
      country: 'CZ',
    })
    await asyncNativeReady(rendered.container)
    const entry = await screen.findByRole('button', { name: 'Private & Wealth' })
    expect(screen.queryByRole('button', { name: 'Upgrade' })).not.toBeInTheDocument()
    fireEvent.click(entry)
    expect(await screen.findByText('Anna Dvořáková')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Anna Dvořáková' })).toHaveAttribute(
      'src',
      expect.stringContaining('private-advisor'),
    )
    expect(screen.getByText('anna.dvorakova@unicredit.cz')).toBeInTheDocument()
    expect(screen.queryByText('David Novak')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /your advisor/i })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Call now' }))
    expect(await screen.findByTestId('source-prime-call-confirm')).toHaveTextContent('Anna Dvořáková')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByTestId('source-prime-call-confirm')).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('tab', { name: /your benefits/i }))
    expect(await screen.findByText(PRIVATE_WEALTH_BENEFITS_COPY.heading)).toBeInTheDocument()
    for (const benefit of PRIVATE_WEALTH_BENEFITS_COPY.benefits) {
      expect(screen.getByText(benefit.title)).toBeInTheDocument()
      expect(screen.getByText(benefit.description)).toBeInTheDocument()
    }
    expect(
      screen.getByRole('button', { name: PRIVATE_WEALTH_BENEFITS_COPY.termsLabel.toUpperCase() }),
    ).toBeInTheDocument()
  })

  it('collapses the large Upgrade title into the standard centered sticky title while scrolling', async () => {
    const rendered = renderBankingScreen(<PrimePreview screen="prime-upgrade" />, { country: 'RO' })
    await asyncNativeReady(rendered.container)
    const title = await screen.findByRole('heading', { name: 'Prime by UniCredit' })
    expect(title).toBeVisible()
    fireEvent.scroll(screen.getByTestId('prime-upgrade-scroll'), { target: { scrollTop: 96 } })
    await waitFor(() => expect(title.closest('[aria-hidden="true"]')).not.toBeNull())
    const collapsedTitle = screen.getByRole('heading', { name: 'Prime by UniCredit' })
    expect(collapsedTitle).not.toBe(title)
    expect(collapsedTitle).toBeVisible()
  })

  it('adapts the real phone chrome to Upgrade and keeps customer controls outside its white surface', async () => {
    renderBankingScreen(<FlowLibraryScreen initialFlowId="pi-prime" />, { country: 'RO' })
    fireEvent.click(screen.getByRole('tab', { name: 'Prototype' }))
    const phone = screen.getByTestId('flow-prototype-inspect-phone')
    fireEvent.click(await within(phone).findByRole('button', { name: 'Upgrade' }))
    await within(phone).findByText('Prime is the service for you:')
    await waitFor(() =>
      expect(phone.querySelector('[data-name="Time"] p')).toHaveStyle({ color: 'var(--uc-static-white)' }),
    )
    expect(phone.querySelector('[data-flow-screen-capture]')).toHaveStyle({ backgroundColor: 'var(--uc-static-black)' })
    const surface = screen.getByTestId('flow-prototype-surface')
    expect(within(surface).queryByRole('radio', { name: 'Standard' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: 'Prime' }))
    await within(phone).findByRole('button', { name: 'Prime' })
    expect(within(phone).queryByRole('button', { name: 'Upgrade' })).not.toBeInTheDocument()
  })
})
