// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CoAppingChatAssistant } from '../../package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant'
import type { CoAppingChatMessage } from '../../package/mobile-pi-coapping-chat-package/src/types'
import InvestmentChatChart from '@/app/components/investments/InvestmentChatChart'

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

class FakeResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class FakePointerEvent extends MouseEvent {
  pointerId: number
  pointerType: string

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.pointerId = init.pointerId ?? 0
    this.pointerType = init.pointerType ?? ''
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
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    value: FakePointerEvent,
  })
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
    configurable: true,
    value: vi.fn(),
  })
  Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
    configurable: true,
    value: vi.fn(() => true),
  })
  Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
    configurable: true,
    value: vi.fn(),
  })
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
  Object.defineProperty(globalThis, 'MediaRecorder', {
    configurable: true,
    value: FakeMediaRecorder,
  })
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: FakeResizeObserver,
  })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  removeSpeechRecognition()
  setMediaDevices()
  Reflect.deleteProperty(window, 'PointerEvent')
  Reflect.deleteProperty(HTMLElement.prototype, 'setPointerCapture')
  Reflect.deleteProperty(HTMLElement.prototype, 'hasPointerCapture')
  Reflect.deleteProperty(HTMLElement.prototype, 'releasePointerCapture')
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo')
  Reflect.deleteProperty(globalThis, 'ResizeObserver')
})

describe('CZ Chat investment product summary', () => {
  const investmentSummaryMessage: CoAppingChatMessage = {
    id: 'investment-summary-message',
    role: 'agent',
    text: 'Product context',
    time: '15:30',
    richBlocks: [
      {
        type: 'investment-summary',
        logoId: 'unicredit',
        title: 'UniCredit Balanced Income Fund',
        body: 'Balanced fund in EUR.',
        metricLayout: 'stack',
        chart: {
          currency: 'EUR',
          defaultPeriod: '3y',
          series: {
            '1m': [
              { label: '01 Jul 2026', dateLabel: '01 Jul', yearLabel: '2026', value: 28.9, showDot: true },
              { label: '21 Jul 2026', dateLabel: '21 Jul', yearLabel: '2026', value: 29.84, showDot: true },
            ],
            '3m': [
              { label: '21 Apr 2026', dateLabel: '21 Apr', yearLabel: '2026', value: 27.4, showDot: true },
              { label: '21 Jul 2026', dateLabel: '21 Jul', yearLabel: '2026', value: 29.84, showDot: true },
            ],
            '1y': [
              { label: '21 Jul 2025', dateLabel: '21 Jul', yearLabel: '2025', value: 25.3, showDot: true },
              { label: '21 Jul 2026', dateLabel: '21 Jul', yearLabel: '2026', value: 29.84, showDot: true },
            ],
            '3y': [
              { label: '21 Jul 2023', dateLabel: '21 Jul', yearLabel: '2023', value: 24.1, showDot: true },
              { label: '21 Jul 2026', dateLabel: '21 Jul', yearLabel: '2026', value: 29.84, showDot: true },
            ],
            max: [
              { label: '19 Jul 2020', dateLabel: '19 Jul', yearLabel: '2020', value: 20.2, showDot: true },
              { label: '21 Jul 2026', dateLabel: '21 Jul', yearLabel: '2026', value: 29.84, showDot: true },
            ],
          },
        },
        metrics: [
          { label: 'Holding value', value: '5 525,00 CZK', helper: '7,625 PCS' },
          { label: 'Performance', value: '+1.80%', helper: 'Current product snapshot' },
          { label: 'Market price', value: '29,84 EUR', helper: 'Updated 19.07.2026' },
        ],
      },
    ],
  }

  async function openInvestmentSummary(
    followUps: NonNullable<CoAppingChatMessage['followUps']> = [],
    resolveReply = vi.fn(async () => ({
      text: 'Ready',
      richBlocks: investmentSummaryMessage.richBlocks,
      followUps,
    })),
    expectedText = 'Ready',
  ) {
    const view = render(
      <CoAppingChatAssistant
        onClose={() => undefined}
        suggestedTopics={[]}
        resolveReply={resolveReply}
        typingDelayMs={0}
        renderInvestmentChart={(chart) => (
          <InvestmentChatChart chart={chart} country="CZ" amountsHidden={false} />
        )}
      />,
    )

    const input = screen.getByRole('textbox', { name: 'Ask me anything' })
    fireEvent.change(input, { target: { value: 'Explain this product' } })
    fireEvent.submit(input.closest('form')!)
    await screen.findByText(expectedText)
    await waitFor(() => expect(view.container.querySelector('.mpc-agent-copy-streaming')).toBeNull())

    return { resolveReply, view }
  }

  it('renders the canonical 32px logo, no eyebrow, and vertically stacked metrics', async () => {
    const { view } = await openInvestmentSummary()

    const summaryCard = view.container.querySelector('.mpc-rich-card-summary')
    const logo = screen.getByRole('img', { name: 'UniCredit' })

    expect(summaryCard).not.toBeNull()
    expect(logo).toHaveStyle({ width: '32px', height: '32px' })
    expect(summaryCard?.querySelector('.mpc-rich-card-head > span')).toBeNull()
    expect(summaryCard?.querySelector('.mpc-rich-metric-grid-stack')).not.toBeNull()
  })

  it('renders all canonical investment periods and switches the selected chart series', async () => {
    const { view } = await openInvestmentSummary()

    expect(view.container.querySelector('[data-ds-label="Investments period chips"]')).not.toBeNull()
    expect(screen.getByRole('button', { name: '3 Y' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByRole('button', { name: /^(1 M|3 M|1 Y|3 Y|ALL)$/ })).toHaveLength(5)

    fireEvent.click(screen.getByRole('button', { name: '1 M' }))

    expect(screen.getByRole('button', { name: '1 M' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '3 Y' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders opted-in rich product context before the interpretation text', async () => {
    const { view } = await openInvestmentSummary(
      [],
      vi.fn(async () => ({
        text: 'Interpretation after card',
        richBlocks: investmentSummaryMessage.richBlocks,
        richBlocksPosition: 'before-text' as const,
        followUps: [],
      })),
      'Interpretation after card',
    )

    const summaryCard = view.container.querySelector('.mpc-rich-card-summary')
    const interpretation = screen.getByText('Interpretation after card').closest('.mpc-agent-copy')

    expect(summaryCard).not.toBeNull()
    expect(interpretation).not.toBeNull()
    expect(summaryCard!.compareDocumentPosition(interpretation!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('keeps the existing interpretation-before-card order by default', async () => {
    const { view } = await openInvestmentSummary()
    const summaryCard = view.container.querySelector('.mpc-rich-card-summary')
    const interpretation = screen.getByText('Ready').closest('.mpc-agent-copy')

    expect(summaryCard).not.toBeNull()
    expect(interpretation).not.toBeNull()
    expect(interpretation!.compareDocumentPosition(summaryCard!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it.each([
    ['How is it doing for me?', 'How is UniCredit Balanced Income Fund doing for me?'],
    ['What could affect my return?', 'What could affect my return from UniCredit Balanced Income Fund?'],
    ['Show me the essentials', 'Show me the essential information I should check for UniCredit Balanced Income Fund.'],
  ])('sends the real product prompt when %s is clicked', async (label, prompt) => {
    const followUps: NonNullable<CoAppingChatMessage['followUps']> = [
      {
        id: `follow-up-${label}`,
        label,
        action: { id: `action-${label}`, label, type: 'send-message', prompt },
      },
    ]
    const resolveReply = vi.fn(async (input: string) =>
      input === 'Explain this product'
        ? { text: 'Ready', richBlocks: investmentSummaryMessage.richBlocks, followUps }
        : { text: `Resolved: ${input}` },
    )

    await openInvestmentSummary(followUps, resolveReply)
    resolveReply.mockClear()

    fireEvent.click(screen.getByRole('button', { name: label }))

    await waitFor(() => expect(resolveReply).toHaveBeenCalledWith(prompt, expect.any(Array)))
  })

  it('consumes selected options globally when a later reply repeats the same action id', async () => {
    const selectedPrompt = 'Review the risk of this product.'
    const repeatedOption: NonNullable<CoAppingChatMessage['followUps']>[number] = {
      id: 'follow-up-review-risk',
      label: 'Review risk',
      action: {
        id: 'action-review-risk',
        label: 'Review risk',
        type: 'send-message',
        prompt: selectedPrompt,
      },
    }
    const nextOption: NonNullable<CoAppingChatMessage['followUps']>[number] = {
      id: 'follow-up-next-step',
      label: 'Next step',
      action: {
        id: 'action-next-step',
        label: 'Next step',
        type: 'send-message',
        prompt: 'Continue to the next step.',
      },
    }
    const resolveReply = vi.fn(async (input: string) =>
      input === 'Explain this product'
        ? { text: 'Ready', richBlocks: investmentSummaryMessage.richBlocks, followUps: [repeatedOption] }
        : { text: 'Risk reviewed', followUps: [repeatedOption, nextOption] },
    )

    const { view } = await openInvestmentSummary([repeatedOption], resolveReply)
    fireEvent.click(screen.getByRole('button', { name: 'Review risk' }))

    await screen.findByText('Risk reviewed')
    await waitFor(() => expect(view.container.querySelector('.mpc-agent-copy-streaming')).toBeNull())
    expect(screen.queryByRole('button', { name: 'Review risk' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next step' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back to conversations' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start new conversation' }))
    const input = await screen.findByRole('textbox', { name: 'Ask me anything' })
    fireEvent.change(input, { target: { value: 'Explain this product' } })
    fireEvent.submit(input.closest('form')!)

    await screen.findByText('Ready')
    await waitFor(() => expect(view.container.querySelector('.mpc-agent-copy-streaming')).toBeNull())
    expect(screen.getByRole('button', { name: 'Review risk' })).toBeInTheDocument()
  })

  it('releases pointer capture after selecting a follow-up chip', async () => {
    const followUps: NonNullable<CoAppingChatMessage['followUps']> = [
      {
        id: 'follow-up-review-risk',
        label: 'Review risk',
        action: {
          id: 'action-review-risk',
          label: 'Review risk',
          type: 'send-message',
          prompt: 'Explain the risk of this product.',
        },
      },
    ]
    const resolveReply = vi.fn(async (input: string) =>
      input === 'Explain this product'
        ? { text: 'Ready', richBlocks: investmentSummaryMessage.richBlocks, followUps }
        : { text: `Resolved: ${input}` },
    )
    const { view } = await openInvestmentSummary(followUps, resolveReply)
    const shelf = view.container.querySelector<HTMLElement>('.mpc-follow-up-shelf')
    const chip = screen.getByRole('button', { name: 'Review risk' })

    expect(shelf).not.toBeNull()
    Object.defineProperty(shelf, 'scrollWidth', { configurable: true, value: 320 })
    Object.defineProperty(shelf, 'clientWidth', { configurable: true, value: 180 })

    fireEvent.pointerDown(chip, { pointerId: 7, pointerType: 'mouse', button: 0, clientX: 120 })
    fireEvent.pointerUp(chip, { pointerId: 7, pointerType: 'mouse', button: 0, clientX: 120 })

    expect(HTMLElement.prototype.setPointerCapture).toHaveBeenCalledWith(7)
    expect(HTMLElement.prototype.releasePointerCapture).toHaveBeenCalledWith(7)
    await waitFor(() => {
      expect(resolveReply).toHaveBeenCalledWith('Explain the risk of this product.', expect.any(Array))
    })
  })

  it('does not select a follow-up chip when pointer release completes a drag', async () => {
    const prompt = 'Review this product in my portfolio.'
    const followUps: NonNullable<CoAppingChatMessage['followUps']> = [
      {
        id: 'follow-up-review-portfolio',
        label: 'Review portfolio',
        action: {
          id: 'action-review-portfolio',
          label: 'Review portfolio',
          type: 'send-message',
          prompt,
        },
      },
    ]
    const resolveReply = vi.fn(async (input: string) =>
      input === 'Explain this product'
        ? { text: 'Ready', richBlocks: investmentSummaryMessage.richBlocks, followUps }
        : { text: `Resolved: ${input}` },
    )
    const { view } = await openInvestmentSummary(followUps, resolveReply)
    const shelf = view.container.querySelector<HTMLElement>('.mpc-follow-up-shelf')
    const chip = screen.getByRole('button', { name: 'Review portfolio' })

    expect(shelf).not.toBeNull()
    Object.defineProperty(shelf, 'scrollWidth', { configurable: true, value: 320 })
    Object.defineProperty(shelf, 'clientWidth', { configurable: true, value: 180 })
    resolveReply.mockClear()

    fireEvent.pointerDown(chip, { pointerId: 9, pointerType: 'mouse', button: 0, clientX: 140 })
    fireEvent.pointerMove(chip, { pointerId: 9, pointerType: 'mouse', button: 0, clientX: 100 })
    fireEvent.pointerUp(chip, { pointerId: 9, pointerType: 'mouse', button: 0, clientX: 100 })
    fireEvent.click(chip)

    expect(shelf).toHaveProperty('scrollLeft', 40)
    expect(screen.queryByText(prompt)).not.toBeInTheDocument()
    expect(resolveReply).not.toHaveBeenCalled()
  })

  it('does not select the chip under pointer release when a drag crosses chips', async () => {
    const firstPrompt = 'Review this product in my portfolio.'
    const secondPrompt = 'Show me the documents that matter.'
    const followUps: NonNullable<CoAppingChatMessage['followUps']> = [
      {
        id: 'follow-up-review-portfolio',
        label: 'Review portfolio',
        action: {
          id: 'action-review-portfolio',
          label: 'Review portfolio',
          type: 'send-message',
          prompt: firstPrompt,
        },
      },
      {
        id: 'follow-up-review-documents',
        label: 'Review documents',
        action: {
          id: 'action-review-documents',
          label: 'Review documents',
          type: 'send-message',
          prompt: secondPrompt,
        },
      },
    ]
    const resolveReply = vi.fn(async (input: string) =>
      input === 'Explain this product'
        ? { text: 'Ready', richBlocks: investmentSummaryMessage.richBlocks, followUps }
        : { text: `Resolved: ${input}` },
    )
    const { view } = await openInvestmentSummary(followUps, resolveReply)
    const shelf = view.container.querySelector<HTMLElement>('.mpc-follow-up-shelf')
    const firstChip = screen.getByRole('button', { name: 'Review portfolio' })
    const releaseChip = screen.getByRole('button', { name: 'Review documents' })

    expect(shelf).not.toBeNull()
    Object.defineProperty(shelf, 'scrollWidth', { configurable: true, value: 360 })
    Object.defineProperty(shelf, 'clientWidth', { configurable: true, value: 180 })
    resolveReply.mockClear()

    fireEvent.pointerDown(firstChip, { pointerId: 10, pointerType: 'mouse', button: 0, clientX: 160 })
    fireEvent.pointerUp(releaseChip, { pointerId: 10, pointerType: 'mouse', button: 0, clientX: 100 })
    fireEvent.click(releaseChip)

    expect(screen.queryByText(firstPrompt)).not.toBeInTheDocument()
    expect(screen.queryByText(secondPrompt)).not.toBeInTheDocument()
    expect(resolveReply).not.toHaveBeenCalled()
  })
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

describe('CoAppingChatAssistant reply feedback', () => {
  afterEach(() => cleanup())

  async function sendAndAwaitReply(onFeedback?: (feedback: { rating: string; messageId: string }) => void) {
    render(
      <CoAppingChatAssistant
        onClose={() => undefined}
        suggestedTopics={[]}
        resolveReply={async () => ({ text: 'Here is a helpful answer.' })}
        typingDelayMs={0}
        onFeedback={onFeedback}
      />,
    )
    const input = screen.getByRole('textbox', { name: 'Ask me anything' })
    fireEvent.change(input, { target: { value: 'How do payments work?' } })
    fireEvent.submit(input.closest('form')!)
    await screen.findByText(/helpful answer/)
    await waitFor(() => expect(document.querySelector('.mpc-agent-copy-streaming')).toBeNull())
  }

  it('records a thumbs-up rating, reflects it visually, and reports it once', async () => {
    const onFeedback = vi.fn()
    await sendAndAwaitReply(onFeedback)

    const goodButton = screen.getByRole('button', { name: 'Good response' })
    expect(goodButton).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(goodButton)
    expect(goodButton).toHaveAttribute('aria-pressed', 'true')
    expect(goodButton.className).toContain('mpc-feedback-button-active')
    expect(onFeedback).toHaveBeenCalledTimes(1)
    expect(onFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 'up', messageId: expect.any(String) }),
    )
  })

  it('switches up→down and toggles off without a duplicate report', async () => {
    const onFeedback = vi.fn()
    await sendAndAwaitReply(onFeedback)

    const goodButton = screen.getByRole('button', { name: 'Good response' })
    const badButton = screen.getByRole('button', { name: 'Bad response' })

    fireEvent.click(goodButton)
    fireEvent.click(badButton)
    expect(goodButton).toHaveAttribute('aria-pressed', 'false')
    expect(badButton).toHaveAttribute('aria-pressed', 'true')

    // Toggling the active rating off is silent (no host report).
    fireEvent.click(badButton)
    expect(badButton).toHaveAttribute('aria-pressed', 'false')
    expect(onFeedback).toHaveBeenCalledTimes(2)
    expect(onFeedback.mock.calls.map((call) => call[0].rating)).toEqual(['up', 'down'])
  })
})
