// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { PrimePreview } from '@/flows/shared/prime/preview'
import { FlowNavProvider } from '@/app/screens/flow-library/components/prototypeNav'
import { renderBankingScreen } from '../helpers/coverageProviders'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'
import { isPrimeReferenceScreen, type PrimeReferenceScreen } from '@/features/prime/reference'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => ({
  loadNativeDemoModule: (await import('../helpers/nativeWebRenderer')).loadNativeDemoModuleForWebTest,
}))

function StandardAdvisorFixture() {
  const [activeScreen, setScreen] = useState<PrimeReferenceScreen>('prime-advisor')
  return (
    <FlowNavProvider
      value={{
        active: true,
        canClose: false,
        go: (target) => {
          if (isPrimeReferenceScreen(target)) setScreen(target)
        },
        primary: () => {},
        secondary: () => {},
        back: () => {},
        close: () => {},
      }}
    >
      <PrimePreview screen={activeScreen} parameters={{ segment: 'standard', service: 'active' }} />
    </FlowNavProvider>
  )
}

function AdvisorProfileSwitcher() {
  const [segment, setSegment] = useState<'prime' | 'private'>('prime')
  return (
    <>
      <button type="button" onClick={() => setSegment('private')}>
        Switch call to Private customer
      </button>
      <FlowNavProvider
        value={{
          active: true,
          canClose: false,
          go: () => {},
          primary: () => {},
          secondary: () => {},
          back: () => {},
          close: () => {},
        }}
      >
        <PrimePreview screen="prime-call-active" parameters={{ segment, service: 'active' }} />
      </FlowNavProvider>
    </>
  )
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-20T12:00:00Z'))
})
afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it('synchronizes calling and answer to playback even after blocked autoplay, and stops audio when leaving', async () => {
  const play = vi
    .spyOn(HTMLMediaElement.prototype, 'play')
    .mockRejectedValueOnce(new DOMException('User gesture required', 'NotAllowedError'))
    .mockResolvedValue(undefined)
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
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
      <PrimePreview screen="prime-upgrade-call" parameters={{ segment: 'standard', service: 'inactive' }} />
    </FlowNavProvider>,
    { country: 'CZ' },
  )
  await asyncNativeReady(rendered.container)
  const audio = (await screen.findByTestId('prime-call-audio')) as HTMLAudioElement
  expect(audio.src).toContain('/audio/prime-upgrade-call.mp3')
  await screen.findByRole('button', { name: 'Play call audio' })
  vi.setSystemTime(new Date('2026-10-20T12:00:20Z'))
  expect(screen.getByText('Calling…')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Play call audio' }))
  expect(play).toHaveBeenCalledTimes(2)
  fireEvent.timeUpdate(audio, { target: { currentTime: 2.999 } })
  expect(screen.getByText('Calling…')).toBeInTheDocument()
  fireEvent.timeUpdate(audio, { target: { currentTime: 3 } })
  await screen.findByText('00:00')
  fireEvent.timeUpdate(audio, { target: { currentTime: 6 } })
  await screen.findByText('00:03')
  fireEvent.click(screen.getByRole('button', { name: 'Speaker' }))
  await waitFor(() => expect(audio.volume).toBe(1))
  fireEvent.ended(audio, { target: { currentTime: 18 } })
  await screen.findByText('Call ended')
  expect(go).not.toHaveBeenCalled()
  await waitFor(() => expect(go).toHaveBeenCalledWith('prime-upgrade'), { timeout: 2500 })
  rendered.unmount()
  expect(pause).toHaveBeenCalledOnce()
  expect(audio.currentTime).toBe(0)
})

it('keeps Journey and export call fixtures silent', async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  const rendered = renderBankingScreen(<PrimePreview screen="prime-upgrade-call" />, { country: 'CZ' })
  await asyncNativeReady(rendered.container)
  expect(screen.queryByTestId('prime-call-audio')).not.toBeInTheDocument()
  expect(play).not.toHaveBeenCalled()
})

it.each([
  { segment: 'prime' as const, name: 'Iacob Mihai', client: 'Marco', file: 'prime-advisor-iacob-call.mp3' },
  { segment: 'private' as const, name: 'Anna Dvořáková', client: 'Mihaela', file: 'prime-private-anna-call.mp3' },
  { segment: 'standard' as const, name: 'David Novak', client: 'Marco', file: 'prime-advisor-david-call.mp3' },
])(
  'answers $segment advisor calls with the matching recording and client completion',
  async ({ segment, name, client, file }) => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
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
        <PrimePreview screen="prime-call-active" parameters={{ segment, service: 'active' }} />
      </FlowNavProvider>,
      { country: 'CZ' },
    )
    await asyncNativeReady(rendered.container)
    const audio = (await screen.findByTestId('prime-call-audio')) as HTMLAudioElement
    expect(audio.src).toContain(`/audio/${file}`)
    expect(screen.getByText(name)).toBeInTheDocument()
    expect(screen.getByText('+420 602 123 456')).toBeInTheDocument()
    expect(screen.queryByText('+420 221 210 031')).not.toBeInTheDocument()
    expect(screen.getByText('Calling…')).toBeInTheDocument()
    fireEvent.timeUpdate(audio, { target: { currentTime: 2.999 } })
    expect(screen.getByText('Calling…')).toBeInTheDocument()
    fireEvent.timeUpdate(audio, { target: { currentTime: 3 } })
    await screen.findByText('00:00')
    fireEvent.ended(audio, { target: { currentTime: 17 } })
    await screen.findByText(`Demo complete · Thank you, ${client}`)
    await waitFor(() => expect(go).toHaveBeenCalledWith('prime-advisor'), { timeout: 2500 })
    rendered.unmount()
    expect(pause).toHaveBeenCalledOnce()
    expect(audio.currentTime).toBe(0)
  },
)

it('keeps advisor call Journey fixtures silent and uses the selected advisor identity', async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  const rendered = renderBankingScreen(
    <PrimePreview screen="prime-call-active" parameters={{ segment: 'private' }} />,
    { country: 'CZ' },
  )
  await asyncNativeReady(rendered.container)
  expect(screen.getByText('Anna Dvořáková')).toBeInTheDocument()
  expect(screen.queryByText('David Novak')).not.toBeInTheDocument()
  expect(screen.queryByTestId('prime-call-audio')).not.toBeInTheDocument()
  expect(play).not.toHaveBeenCalled()
})

it('confirms the Standard advisor identity and stops its recording on a manual early end', async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  const rendered = renderBankingScreen(<StandardAdvisorFixture />, { country: 'CZ' })
  await asyncNativeReady(rendered.container)
  await screen.findByText('David Novak')
  fireEvent.click(screen.getByRole('button', { name: 'Call now' }))
  await screen.findByText('Call David Novak?')
  expect(play).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  await screen.findByText('David Novak')
  fireEvent.click(screen.getByRole('button', { name: 'Call now' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Call' }))
  const audio = (await screen.findByTestId('prime-call-audio')) as HTMLAudioElement
  expect(audio.src).toContain('/audio/prime-advisor-david-call.mp3')
  expect(screen.getByText('David Novak')).toBeInTheDocument()
  expect(screen.getByText('Calling…')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'End call' }))
  await screen.findByRole('button', { name: 'Book an appointment' })
  expect(screen.queryByTestId('prime-call-audio')).not.toBeInTheDocument()
  expect(pause).toHaveBeenCalledOnce()
  expect(audio.currentTime).toBe(0)
})

it('stops the prior advisor voice and resets call state when the selected customer profile changes', async () => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  const rendered = renderBankingScreen(<AdvisorProfileSwitcher />, { country: 'CZ' })
  await asyncNativeReady(rendered.container)
  const original = (await screen.findByTestId('prime-call-audio')) as HTMLAudioElement
  expect(original.src).toContain('/audio/prime-advisor-iacob-call.mp3')
  fireEvent.timeUpdate(original, { target: { currentTime: 6 } })
  await screen.findByText('00:03')
  fireEvent.click(screen.getByRole('button', { name: 'Switch call to Private customer' }))
  await screen.findByText('Anna Dvořáková')
  const replacement = screen.getByTestId('prime-call-audio') as HTMLAudioElement
  expect(replacement).not.toBe(original)
  expect(replacement.src).toContain('/audio/prime-private-anna-call.mp3')
  expect(screen.getByText('Calling…')).toBeInTheDocument()
  expect(original.currentTime).toBe(0)
  expect(pause).toHaveBeenCalledOnce()
  rendered.unmount()
  expect(pause).toHaveBeenCalledTimes(2)
})
