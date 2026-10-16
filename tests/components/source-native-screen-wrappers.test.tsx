// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import type { NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import type { NativeDemoRoute } from '@/features/demo-native/contracts'
import PrimeScreen from '@/app/screens/prime/PrimeScreen'
import AppointmentScreen, { AppointmentPage } from '@/app/screens/appointments/AppointmentScreen'
import RequestCallScreen from '@/app/screens/appointments/RequestCallScreen'
import MoreScreen from '@/app/screens/more/MoreScreen'
import SettingsScreen from '@/app/screens/settings/SettingsScreen'
import DocumentsScreen from '@/app/screens/documents/DocumentsScreen'

const preview = vi.hoisted(() => ({ current: null as unknown }))

vi.mock('@/app/components/demo/NativeScreenPreview', () => ({
  NativeScreenPreview: (props: NativeScreenPreviewProps) => {
    preview.current = props
    return <div data-testid="native-screen-preview" data-route={props.route.screen} />
  },
}))

afterEach(() => {
  cleanup()
  preview.current = null
})

function renderSource(
  children: ReactNode,
  product: 'PI' | 'SME' | 'KIDS_PI' = 'PI',
  country: 'RO' | 'RS' | 'HU' | 'BA' | 'BA_BL' | 'SK' | 'SI' | 'CZ' | 'IT' = 'RO',
) {
  return render(
    <DemoProvider initialState={{ product, country }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>,
  )
}

function currentPreview(): NativeScreenPreviewProps {
  if (!preview.current) throw new Error('NativeScreenPreview was not rendered')
  return preview.current as NativeScreenPreviewProps
}

function navigate(route: NativeDemoRoute) {
  return currentPreview().onNavigate?.(route, 'push')
}

describe('Source compatibility wrappers for Native screens', () => {
  it('routes Prime to Native and bridges its appointment callbacks', () => {
    const onBack = vi.fn()
    const onBookAppointment = vi.fn()
    const onRequestCall = vi.fn()
    renderSource(
      <PrimeScreen onBack={onBack} onBookAppointment={onBookAppointment} onRequestCall={onRequestCall} />,
    )

    expect(screen.getByTestId('native-screen-preview')).toHaveAttribute('data-route', 'prime')
    expect(currentPreview().onBack).toBe(onBack)
    expect(navigate({ screen: 'appointments' })).toBe(true)
    expect(navigate({ screen: 'call-request' })).toBe(true)
    expect(onBookAppointment).toHaveBeenCalledTimes(1)
    expect(onRequestCall).toHaveBeenCalledTimes(1)
  })

  it('routes appointment and call-request Source entries to their Native screens', () => {
    const appointmentBack = vi.fn()
    renderSource(<AppointmentScreen country="CZ" onBack={appointmentBack} />)
    expect(screen.getByTestId('native-screen-preview')).toHaveAttribute('data-route', 'appointments')
    expect(currentPreview().onBack).toBe(appointmentBack)
    expect(currentPreview().snapshot?.country).toBe('CZ')
    expect(AppointmentPage).toBeTypeOf('function')

    cleanup()
    preview.current = null
    const callBack = vi.fn()
    renderSource(<RequestCallScreen country="CZ" onBack={callBack} />)
    expect(screen.getByTestId('native-screen-preview')).toHaveAttribute('data-route', 'call-request')
    expect(currentPreview().onBack).toBe(callBack)
    expect(currentPreview().snapshot?.country).toBe('CZ')
  })

  it('bridges each existing More navigation callback and logout action', () => {
    const callbacks = {
      onHomeClick: vi.fn(),
      onAnalyticsClick: vi.fn(),
      onMessagesClick: vi.fn(),
      onPaymentsClick: vi.fn(),
      onProductsClick: vi.fn(),
      onInvestmentsClick: vi.fn(),
      onContactsClick: vi.fn(),
      onDocumentsClick: vi.fn(),
      onSettingsClick: vi.fn(),
      onLogoutConfirm: vi.fn(),
    }
    renderSource(<MoreScreen {...callbacks} />)

    expect(screen.getByTestId('native-screen-preview')).toHaveAttribute('data-route', 'profile')
    const routes: Array<[NativeDemoRoute, keyof typeof callbacks]> = [
      [{ screen: 'home' }, 'onHomeClick'],
      [{ screen: 'pfm' }, 'onAnalyticsClick'],
      [{ screen: 'messages' }, 'onMessagesClick'],
      [{ screen: 'payments' }, 'onPaymentsClick'],
      [{ screen: 'products' }, 'onProductsClick'],
      [{ screen: 'investments' }, 'onInvestmentsClick'],
      [{ screen: 'contacts' }, 'onContactsClick'],
      [{ screen: 'documents' }, 'onDocumentsClick'],
      [{ screen: 'settings' }, 'onSettingsClick'],
      [{ screen: 'login' }, 'onLogoutConfirm'],
    ]

    for (const [route, callback] of routes) {
      expect(navigate(route)).toBe(true)
      expect(callbacks[callback]).toHaveBeenCalledTimes(1)
    }
  })

  it('keeps Source More actions inert when optional callbacks are absent', () => {
    renderSource(<MoreScreen />)
    expect(navigate({ screen: 'home' })).toBe(true)
    expect(navigate({ screen: 'contacts' })).toBe(true)
    expect(navigate({ screen: 'profile' })).toBe(false)
  })

  it('keeps the HU Kids Source Settings screen while PI Settings uses Native', () => {
    renderSource(<SettingsScreen onBack={vi.fn()} />)
    expect(screen.getByTestId('native-screen-preview')).toHaveAttribute('data-route', 'settings')

    cleanup()
    preview.current = null
    renderSource(<SettingsScreen onBack={vi.fn()} />, 'KIDS_PI', 'HU')
    expect(preview.current).toBeNull()
    expect(screen.getByRole('button', { name: 'Appearance' })).toBeInTheDocument()
  })

  it('bridges Documents back and help callbacks through Native events', () => {
    const onBack = vi.fn()
    const onHelpClick = vi.fn()
    renderSource(<DocumentsScreen onBack={onBack} onHelpClick={onHelpClick} />)

    expect(screen.getByTestId('native-screen-preview')).toHaveAttribute('data-route', 'documents')
    expect(currentPreview().onBack).toBe(onBack)
    expect(currentPreview().events?.onHelpRequest).toBe(onHelpClick)
  })
})
