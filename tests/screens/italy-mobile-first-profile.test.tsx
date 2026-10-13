// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstProfile from '@/experiences/pi/it/mobile-first/MobileFirstProfile'
import { ProfileField, ProfilePage } from '@/experiences/pi/it/mobile-first/MobileFirstProfilePrimitives'
import MobileFirstProfileLogin from '@/experiences/pi/it/mobile-first/MobileFirstProfileLogin'
import { authorizeProfileChange, profileSettingsStore } from '@/features/profile/mobileFirstProfileSettings'
import { profileServicesStore } from '@/features/profile/mobileFirstProfileServices'
import { profileHubStore } from '@/features/profile/mobileFirstProfile'
import MobileFirstPfm from '@/experiences/pi/it/mobile-first/MobileFirstPfm'

afterEach(cleanup)
beforeEach(() => {
  profileSettingsStore.reset()
  profileServicesStore.reset()
  profileHubStore.reset()
})
function Preview() {
  const [open, setOpen] = useState(true)
  return (
    <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
      {open ? <MobileFirstProfile onClose={() => setOpen(false)} /> : <h1>Home</h1>}
    </DemoProvider>
  )
}
describe('Italy Profile hub', () => {
  it('blocks biometric access after canonical lock even on a fresh authorization view', () => {
    profileSettingsStore.update({ biometric: true })
    for (let i = 0; i < 3; i++) authorizeProfileChange('99999999')
    render(<Preview />)
    fireEvent.click(screen.getByRole('button', { name: 'Mobile Token' }))
    expect(screen.getByRole('button', { name: 'Accesso biometrico' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('temporaneamente bloccata')
  })
  it('completes enabled biometric token access and uses the chosen default brand on login', () => {
    profileSettingsStore.update({ biometric: true, preferredProfile: 'buddy' })
    const login = vi.fn()
    const mounted = render(
      <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
        <MobileFirstProfileLogin onLogin={login} />
      </DemoProvider>,
    )
    expect(screen.getByRole('img', { name: 'buddy' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Accedi' }))
    fireEvent.click(screen.getByRole('button', { name: 'Accesso biometrico' }))
    expect(login).toHaveBeenCalledOnce()
    expect(profileHubStore.getSnapshot().persona).toBe('buddy-personal')
    mounted.unmount()
    render(<Preview />)
    fireEvent.click(screen.getByRole('button', { name: 'Mobile Token' }))
    fireEvent.click(screen.getByRole('button', { name: 'Accesso biometrico' }))
    expect(screen.getByText('12345678')).toBeVisible()
  })
  it('reflects document reads, archived messages and practice status from the same session', () => {
    render(<Preview />)
    expect(screen.getByLabelText('2 documenti da leggere')).toBeVisible()
    act(() => profileServicesStore.update('documents', (items) => items.map((item) => ({ ...item, read: true }))))
    expect(screen.queryByLabelText('2 documenti da leggere')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'Messaggi' }))
    act(() => profileServicesStore.update('messages', (items) => items.map((item) => ({ ...item, archived: true }))))
    expect(screen.getByText('Nessun messaggio disponibile')).toBeVisible()
    fireEvent.click(screen.getByRole('tab', { name: 'Pratiche' }))
    act(() =>
      profileServicesStore.update('practices', (items) =>
        items.map((item) => (item.id === 'overdraft' ? { ...item, status: 'Completata' } : item)),
      ),
    )
    expect(screen.getByRole('button', { name: /Scoperto facile/ })).toHaveTextContent('Completata')
  })
  it('marks hub notices read and exposes secondary device authorization via the complete list', async () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('button', { name: /Pagamenti con carta di debito/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
    expect(screen.getByLabelText('2 notifiche da leggere')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: /VEDI TUTTE LE NOTIFICHE/ }))
    fireEvent.click(await screen.findByRole('button', { name: /Autorizza Bonifico Sepa da dispositivo secondario/ }))
    expect(screen.getByText('Umberto Ronzoni')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Autorizza' })).toBeVisible()
  })
  it('opens the Croatian message without substituting the tax transfer message', async () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('tab', { name: 'Messaggi' }))
    fireEvent.click(screen.getByRole('button', { name: /Cessazione della prestazione/ }))
    expect(await screen.findByRole('heading', { name: /Cessazione della prestazione/ })).toBeVisible()
    expect(screen.queryByText(/Agevolazioni fiscali/)).not.toBeInTheDocument()
    expect(profileServicesStore.getSnapshot().messages.find((item) => item.id === 'message-croatia')?.read).toBe(true)
  })
  it('keeps the authorization lock across close and reentry', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('button', { name: 'Mobile Token' }))
    for (let i = 0; i < 3; i++) {
      fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '99999999' } })
      fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mobile Token' }))
    expect(screen.getByLabelText('Mobile Code')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('temporaneamente bloccata')
    expect(screen.queryByText('Password da inserire per confermare l’operazione')).not.toBeInTheDocument()
  })
  it('shows the transfer receipt and returns to Conti', () => {
    const navigate = vi.fn()
    render(
      <MobileFirstProfile
        onClose={vi.fn()}
        onNavigate={navigate}
        initialNavigation={{ area: 'notification', id: 'transfer-info' }}
      />,
    )
    expect(screen.getByText(/c\/c n.xx0123 bonifico/)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Vai a Conti' }))
    expect(navigate).toHaveBeenCalledWith('accounts', undefined)
  })
  it('waits for the principal device rather than offering approval on the secondary device', () => {
    render(<MobileFirstProfile onClose={vi.fn()} initialNavigation={{ area: 'notification', id: 'slave' }} />)
    expect(screen.getByRole('heading', { name: 'Notifica inviata' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Autorizza' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Annulla operazione' }))
    expect(profileHubStore.getSnapshot().decisions.slave).toBe('declined')
  })
  it('confirms entry into buddy and cancels without changing the selected persona', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('button', { name: 'Seleziona profilo' }))
    fireEvent.click(screen.getByRole('button', { name: /Andrea Rossini.*buddy/ }))
    expect(screen.getByRole('dialog')).toHaveTextContent('entrerai nel tuo profilo buddy')
    fireEvent.click(screen.getByRole('button', { name: 'Annulla' }))
    expect(profileHubStore.getSnapshot().persona).toBe('uci-personal')
  })
  it('closes only the invitation sheet on Escape and preserves opt out after logout', async () => {
    const logout = vi.fn()
    render(<MobileFirstProfile onClose={vi.fn()} onLogout={logout} initialEntry="promotions" />)
    fireEvent.click(await screen.findByRole('button', { name: /Il tuo codice invito/ }))
    fireEvent.click(screen.getByRole('button', { name: 'CONDIVIDI' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Il tuo codice invito/ })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Non desidero partecipare a questa promo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Si, procedi' }))
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Logout' })[0]!)
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Esci' }))
    expect(logout).toHaveBeenCalledOnce()
    expect(profileHubStore.getSnapshot().invitationActive).toBe(false)
  })
  it('opens the complete profile from the PFM avatar', async () => {
    render(
      <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
        <MobileFirstPfm onClose={vi.fn()} />
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Profilo' }))
    expect(await screen.findByRole('button', { name: /^Documenti/ })).toBeVisible()
    expect(screen.getByRole('button', { name: 'I tuoi dati' })).toBeVisible()
  })
  it('requires the current PIN before returning from the logged-out scene', () => {
    profileSettingsStore.reset()
    function LoginPreview() {
      const [loggedIn, setLoggedIn] = useState(false)
      return (
        <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
          {loggedIn ? <h1>Home</h1> : <MobileFirstProfileLogin onLogin={() => setLoggedIn(true)} />}
        </DemoProvider>
      )
    }
    render(<LoginPreview />)
    fireEvent.click(screen.getByRole('button', { name: 'Accedi' }))
    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '11111111' } })
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(screen.queryByRole('heading', { name: 'Home' })).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeVisible()
    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '87263915' } })
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(screen.getByRole('heading', { name: 'Home' })).toBeVisible()
  })
  it('keeps focus on a field while the page rerenders during typing', () => {
    function Form() {
      const [value, setValue] = useState('')
      return (
        <ProfilePage title="Dati" onBack={() => undefined} onClose={() => undefined}>
          <ProfileField label="Nome" value={value} onChange={(event) => setValue(event.target.value)} />
        </ProfilePage>
      )
    }
    render(<Form />)
    const input = screen.getByRole('textbox', { name: 'Nome' })
    input.focus()
    fireEvent.change(input, { target: { value: 'Andrea' } })
    expect(input).toHaveFocus()
  })
  it('opens each profile area and returns to the hub before closing to Home', () => {
    render(<Preview />)
    expect(screen.getByRole('heading', { name: 'Comunicazioni e attività' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'My Apps' }))
    expect(screen.getByRole('heading', { name: 'My Apps' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
    expect(screen.getByRole('button', { name: 'I tuoi dati' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi profilo' }))
    expect(screen.getByRole('heading', { name: 'Home' })).toBeVisible()
  })
  it('switches communication tabs and shows the selected content', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('tab', { name: /Messaggi/ }))
    expect(screen.getByRole('tab', { name: /Messaggi/ })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('tab', { name: /Pratiche/ }))
    expect(screen.getByRole('tab', { name: /Pratiche/ })).toHaveAttribute('aria-selected', 'true')
  })
})
