// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CoAppingChatAssistant } from '../../package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant'

type Deferred<T> = {
  promise: Promise<T>
  resolve: (value: T) => void
}

function deferred<T>(): Deferred<T> {
  let resolver: ((value: T) => void) | undefined
  const promise = new Promise<T>((nextResolve) => {
    resolver = nextResolve
  })
  return {
    promise,
    resolve(value: T) {
      if (!resolver) throw new Error('Deferred resolver was not initialized')
      resolver(value)
    },
  }
}

function getFirstButton(name: string) {
  const button = screen.getAllByRole('button', { name })[0]
  if (!button) throw new Error(`Expected a button named "${name}"`)
  return button
}

function setMediaDevices(getUserMedia?: () => Promise<MediaStream>) {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: getUserMedia ? { getUserMedia } : undefined,
  })
}

class FakeMediaRecorder {
  state: RecordingState = 'inactive'
  ondataavailable: ((event: BlobEvent) => void) | null = null
  onstop: (() => void) | null = null

  constructor(_stream: MediaStream) {}

  start() {
    this.state = 'recording'
  }

  stop() {
    this.state = 'inactive'
    this.onstop?.()
  }
}

type RecognitionResultHandler = (event: {
  resultIndex: number
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>
}) => void

class FakeSpeechRecognition {
  static latest: FakeSpeechRecognition | null = null

  continuous = false
  interimResults = false
  lang = ''
  onresult: RecognitionResultHandler | null = null
  onerror: ((event: { error: string }) => void) | null = null
  onend: (() => void) | null = null
  start = vi.fn()
  abort = vi.fn()
  stop = vi.fn(() => this.onend?.())

  constructor() {
    FakeSpeechRecognition.latest = this
  }
}

function installSpeechRecognition() {
  Object.defineProperty(window, 'webkitSpeechRecognition', {
    configurable: true,
    value: FakeSpeechRecognition,
  })
}

function removeSpeechRecognition() {
  Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: undefined })
  Object.defineProperty(window, 'webkitSpeechRecognition', { configurable: true, value: undefined })
  FakeSpeechRecognition.latest = null
}

function makeStream(stop = vi.fn()) {
  return {
    stream: { getTracks: () => [{ stop }] } as unknown as MediaStream,
    stop,
  }
}

beforeEach(() => {
  removeSpeechRecognition()
  setMediaDevices()
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
  Object.defineProperty(globalThis, 'MediaRecorder', {
    configurable: true,
    value: FakeMediaRecorder,
  })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  removeSpeechRecognition()
  setMediaDevices()
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo')
})

describe('CZ Chat voice capture', () => {
  it('reports unsupported voice capture honestly', async () => {
    render(<CoAppingChatAssistant onClose={() => undefined} />)

    fireEvent.click(screen.getByRole('button', { name: 'Record voice message' }))

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Ask me anything' })).toHaveValue(
        'Voice recording is not supported in this browser.',
      )
    })
  })

  it('keeps the existing empty-transcript fallback', async () => {
    const { stream } = makeStream()
    setMediaDevices(() => Promise.resolve(stream))
    installSpeechRecognition()
    render(<CoAppingChatAssistant onClose={() => undefined} />)

    fireEvent.click(screen.getByRole('button', { name: 'Record voice message' }))
    await waitFor(() => expect(FakeSpeechRecognition.latest).not.toBeNull())
    fireEvent.click(getFirstButton('Finish voice message'))

    expect(screen.getByRole('textbox', { name: 'Ask me anything' })).toHaveValue(
      'Voice recorded, but I could not transcribe it. Try again in English.',
    )
  })

  it('skips sparse speech results and still sends the valid final transcript', async () => {
    installSpeechRecognition()
    render(<CoAppingChatAssistant onClose={() => undefined} typingDelayMs={60_000} />)

    fireEvent.click(screen.getByRole('button', { name: 'Record voice message' }))
    await waitFor(() => expect(FakeSpeechRecognition.latest).not.toBeNull())

    const results = new Array(2) as Array<ArrayLike<{ transcript: string }> & { isFinal: boolean }>
    results[1] = Object.assign([{ transcript: 'Show my latest transactions' }], { isFinal: true })

    act(() => {
      FakeSpeechRecognition.latest?.onresult?.({ resultIndex: 0, results })
    })
    fireEvent.click(getFirstButton('Finish voice message'))

    expect(screen.getByText('Show my latest transactions')).toBeInTheDocument()
  })

  it('stops a media stream whose permission resolves after unmount', async () => {
    const permission = deferred<MediaStream>()
    const { stream, stop } = makeStream()
    setMediaDevices(() => permission.promise)
    const view = render(<CoAppingChatAssistant onClose={() => undefined} />)

    fireEvent.click(screen.getByRole('button', { name: 'Record voice message' }))
    view.unmount()
    await act(async () => {
      permission.resolve(stream)
      await permission.promise
      await Promise.resolve()
    })

    expect(stop).toHaveBeenCalledTimes(1)
  })
})

describe('CZ Chat async lifecycle', () => {
  it('drops a stale async reply after the entry context changes', async () => {
    vi.useFakeTimers()
    const reply = deferred<string>()
    const resolveReply = vi.fn(() => reply.promise)
    const view = render(
      <CoAppingChatAssistant
        entryContext={{ id: 'account-a', title: 'Account A' }}
        onClose={() => undefined}
        resolveReply={resolveReply}
        typingDelayMs={1}
      />,
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Ask me anything' }), {
      target: { value: 'Review this account' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(resolveReply).toHaveBeenCalledTimes(1)

    view.rerender(
      <CoAppingChatAssistant
        entryContext={{ id: 'account-b', title: 'Account B' }}
        onClose={() => undefined}
        resolveReply={resolveReply}
        typingDelayMs={1}
      />,
    )
    await act(async () => {
      reply.resolve('STALE_REPLY_SHOULD_NOT_RENDER')
      await Promise.resolve()
      await vi.runAllTimersAsync()
    })

    expect(screen.queryByText('STALE_REPLY_SHOULD_NOT_RENDER')).not.toBeInTheDocument()
  })

  it('clears the delayed close callback on unmount', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const view = render(<CoAppingChatAssistant onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Close assistant' }))
    view.unmount()
    act(() => vi.advanceTimersByTime(1_000))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('keeps an empty current conversation out of history and derives populated history from its last message', async () => {
    vi.useFakeTimers()
    render(
      <CoAppingChatAssistant
        onClose={() => undefined}
        resolveReply={() => 'Latest assistant reply'}
        typingDelayMs={1}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open conversations' }))
    expect(screen.queryByText('Current conversation')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Start new conversation' }))
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    fireEvent.change(screen.getByRole('textbox', { name: 'Ask me anything' }), {
      target: { value: 'Current question' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Back to conversations' }))
    const currentConversation = screen.getByRole('button', { name: /Current question/ })
    expect(currentConversation).toHaveTextContent('Current question')
    expect(currentConversation).not.toHaveTextContent('No messages yet')
  })
})
