// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PlatformProvider } from '@/features/flow-collaboration/PlatformContext'
import { AccountBar } from '@/features/flow-collaboration/AccountBar'
import { setup, registeredFlow, adminPassword, members } from '../../server/tests/helpers'
import { Blob, File } from 'node:buffer'
import { installPlatformTransport } from '../helpers/flowPlatformTransport'
import { usePlatform } from '@/features/flow-collaboration/PlatformContext'
import { platformRequest } from '@/features/flow-collaboration/api'
import { act } from '@testing-library/react'
import { PersonalAccessBoundary } from '@/features/flow-collaboration/PersonalAccessBoundary'
import { DemoTopBar } from '@/app/components/demo/DemoTopBar'
import { NavigationProvider, useNavigationContext } from '@/app/contexts/NavigationContext'
import { DemoProvider } from '@/app/state/demoStore'
import { usePersonalSpecAccess } from '@/features/flow-spec/personalAccess'
import type { FlowPreviewId } from '@/app/registry/flowPreviewRegistry'
import { resolveInitialNavigation } from '@/app/navigation/initialNavigation'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('a personal account can enter directly without the shared password and logout returns to the access screen', async () => {
  vi.stubGlobal('Blob', Blob); vi.stubGlobal('File', File)
  const h = await setup('memory://', [], [registeredFlow])
  let settle = async () => {}
  try {
    await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
    let cookie = ''
    settle = installPlatformTransport(h.app.handle, () => cookie, { received: (received) => { if (received.length) cookie = received.map((value) => value.split(';')[0]).join('; ') } })
    render(<PlatformProvider><PersonalAccessBoundary><p>Platform content</p><AccountBar /></PersonalAccessBoundary></PlatformProvider>)
    fireEvent.click(await screen.findByRole('button', { name: 'Personal sign in' }))
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'owner' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: adminPassword } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Platform content')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(await screen.findByRole('button', { name: 'Personal sign in' })).toBeVisible()
    expect(screen.queryByText('Platform content')).not.toBeInTheDocument()
  } finally { cleanup(); await settle(); await h.close() }
})

it('a delayed old session cannot restore an identity after logout and a different sign-in', async () => {
  vi.stubGlobal('Blob', Blob); vi.stubGlobal('File', File)
  const h = await setup('memory://', [], [registeredFlow])
  let settle = async () => {}, release!: () => void, reached!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve }), held = new Promise<void>((resolve) => { reached = resolve })
  try {
    const { admin, viewer } = await members(h)
    let cookie = admin.cookie, holdNext = false
    settle = installPlatformTransport(h.app.handle, () => cookie, { hold: async (url) => { if (url.endsWith('/session') && holdNext) { holdNext = false; reached(); await gate } } })
    function SessionProbe() {
      const { user, refresh } = usePlatform()
      return <div><p>{user?.username ?? 'Guest'}</p><button onClick={() => void refresh()}>Refresh session</button><button onClick={() => void platformRequest('/logout', {}).then(refresh)}>End session</button></div>
    }
    render(<PlatformProvider><SessionProbe /></PlatformProvider>)
    expect(await screen.findByText('owner')).toBeVisible()
    holdNext = true; fireEvent.click(screen.getByText('Refresh session')); await held
    fireEvent.click(screen.getByText('End session'))
    expect(await screen.findByText('Guest')).toBeVisible()
    cookie = viewer.cookie; fireEvent.click(screen.getByText('Refresh session'))
    expect(await screen.findByText('viewer')).toBeVisible()
    await act(async () => { release(); await settle() })
    expect(screen.getByText('viewer')).toBeVisible()
    expect(screen.queryByText('owner')).not.toBeInTheDocument()
  } finally { release(); cleanup(); await settle(); await h.close() }
})

it('signs in through the real API, rejects a wrong password and logs out without storing credentials', async () => {
  vi.stubGlobal('Blob', Blob); vi.stubGlobal('File', File)
  const h = await setup('memory://', [], [registeredFlow])
  let settle = async () => {}
  try {
    await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
    let cookie = ''
    settle = installPlatformTransport(h.app.handle, () => cookie, { received: (received) => { if (received.length) cookie = received.map((value) => value.split(';')[0]).join('; ') } })
    render(<PlatformProvider><AccountBar flowId={registeredFlow.flowId} /></PlatformProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Personal sign in' }))
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'owner' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'incorrect-password!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('incorrect')
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: adminPassword } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('button', { name: 'Manage users and access' })).toBeVisible()
    const stored = Array.from({ length: localStorage.length }, (_, index) => localStorage.getItem(localStorage.key(index)!)).join(' ')
    expect(stored).not.toContain(adminPassword)
    expect(stored).not.toContain(cookie.split('=')[1])
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Personal sign in' })).toBeVisible())
  } finally { cleanup(); await settle(); await h.close() }
})

it('Admin creates an account, grants View plus comments on this flow, and dismisses the one-time password', async () => {
  vi.stubGlobal('Blob', Blob); vi.stubGlobal('File', File)
  const h = await setup('memory://', [], [registeredFlow])
  let settle = async () => {}
  try {
    const { admin } = await members(h)
    settle = installPlatformTransport(h.app.handle, () => admin.cookie)
    render(<PlatformProvider><AccountBar flowId={registeredFlow.flowId} /></PlatformProvider>)
    fireEvent.click(await screen.findByRole('button', { name: 'Manage users and access' }))
    fireEvent.change(await screen.findByLabelText('New username'), { target: { value: 'colleague' } })
    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Colleague' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText(/Temporary password, shown once/)).toBeVisible()
    const row = await screen.findByRole('article', { name: 'Manage colleague' })
    await waitFor(() => expect(within(row).getByRole('button', { name: 'Save flow access' })).toBeEnabled())
    fireEvent.change(within(row).getByLabelText('Flow role for colleague'), { target: { value: 'viewer' } })
    fireEvent.click(within(row).getByLabelText('Allow colleague to comment'))
    fireEvent.click(within(row).getByRole('button', { name: 'Save flow access' }))
    await waitFor(async () => {
      const result = await (await h.request(`/flows/${registeredFlow.flowId}/access`, undefined, admin.cookie)).json()
      expect(result.grants.some((g: { role: string; canComment: boolean }) => g.role === 'viewer' && g.canComment)).toBe(true)
    })
    expect(screen.queryByText(/Temporary password, shown once/)).not.toBeInTheDocument()
  } finally { cleanup(); await settle(); await h.close() }
})

it('a temporary-password user is required to change it and then signs in again', async () => {
  vi.stubGlobal('Blob', Blob); vi.stubGlobal('File', File)
  const h = await setup('memory://', [], [registeredFlow])
  let settle = async () => {}
  try {
    const { admin } = await members(h)
    const created = await (await h.request('/users', { username: 'new-person', name: 'New person', role: 'editor' }, admin.cookie)).json()
    const first = await h.login('new-person', created.temporaryPassword)
    settle = installPlatformTransport(h.app.handle, () => first.cookie)
    render(<PlatformProvider><AccountBar flowId={registeredFlow.flowId} /></PlatformProvider>)
    fireEvent.change(await screen.findByLabelText('Temporary password'), { target: { value: created.temporaryPassword } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'New-person-password-24!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Change password' }))
    expect(await screen.findByText('Password changed. Sign in with your new password.')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Manage users and access' })).not.toBeInTheDocument()
    expect((await h.login('new-person', 'New-person-password-24!')).response.status).toBe(200)
    expect((await h.login('new-person', created.temporaryPassword)).response.status).toBe(401)
  } finally { cleanup(); await settle(); await h.close() }
})

const PROFILE_FLOW_ID: FlowPreviewId = 'mobile-pi-ethoca'

function ProfileAccessProbe() {
  const { canEdit } = usePersonalSpecAccess(PROFILE_FLOW_ID)
  const { currentRoute } = useNavigationContext()
  const routeLabel = currentRoute.screen === 'flow-library'
    ? `${currentRoute.screen}:${currentRoute.flowId}:${currentRoute.view}`
    : currentRoute.screen
  return <><p>{canEdit ? 'Edit access available' : 'View access only'}</p><p data-testid="current-route">{routeLabel}</p></>
}

it('profile dialog shows account availability and returns focus to IM on Escape', async () => {
  render(
    <DemoProvider initialState={{ product: 'PI', country: 'RO', scenario: 'active' }}>
      <NavigationProvider initialScreen="flow-library">
        <DemoTopBar />
      </NavigationProvider>
    </DemoProvider>,
  )

  const trigger = screen.getByRole('button', { name: 'Profile IM' })
  fireEvent.click(trigger)
  const dialog = await screen.findByRole('dialog', { name: 'Profile' })
  expect(within(dialog).getByRole('status')).toHaveTextContent('Personal accounts are currently unavailable')
  expect(within(dialog).getByRole('button', { name: 'Personal sign in' })).toBeVisible()

  fireEvent.keyDown(dialog, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(trigger).toHaveFocus()
})

it('profile dialog signs in and loads current-flow edit access without navigating away', async () => {
  vi.stubGlobal('Blob', Blob); vi.stubGlobal('File', File)
  const h = await setup('memory://', [], [registeredFlow])
  let settle = async () => {}
  try {
    await members(h)
    let cookie = ''
    settle = installPlatformTransport(h.app.handle, () => cookie, {
      received: (received) => { if (received.length) cookie = received.map((value) => value.split(';')[0]).join('; ') },
    })
    const initialRoute = resolveInitialNavigation({
      parsedDeepLink: { screen: 'flow-library', flowId: PROFILE_FLOW_ID },
      scenario: 'active',
      hashSection: '',
    }).initialRoute
    render(
      <PlatformProvider>
        <DemoProvider initialState={{ product: 'PI', country: 'RO', scenario: 'active' }}>
          <NavigationProvider initialRoute={initialRoute}>
            <DemoTopBar />
            <ProfileAccessProbe />
          </NavigationProvider>
        </DemoProvider>
      </PlatformProvider>,
    )

    expect(await screen.findByText('View access only')).toBeVisible()
    expect(registeredFlow.flowId).toBe(PROFILE_FLOW_ID)
    expect(screen.getByTestId('current-route')).toHaveTextContent(`flow-library:${PROFILE_FLOW_ID}:detail`)
    fireEvent.click(screen.getByRole('button', { name: 'Profile IM' }))
    const dialog = await screen.findByRole('dialog', { name: 'Profile' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Personal sign in' }))
    fireEvent.change(within(dialog).getByLabelText('Username'), { target: { value: 'owner' } })
    fireEvent.change(within(dialog).getByLabelText('Password'), { target: { value: adminPassword } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Edit access available')).toBeVisible()
    expect(screen.getByTestId('current-route')).toHaveTextContent(`flow-library:${PROFILE_FLOW_ID}:detail`)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Manage users and access' }))
    expect(await within(dialog).findByRole('combobox', { name: 'Flow role for viewer' })).toBeVisible()
  } finally { cleanup(); await settle(); await h.close() }
})
