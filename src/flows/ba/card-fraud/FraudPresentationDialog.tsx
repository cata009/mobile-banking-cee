import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowLeft, ArrowRight, Copy, Maximize2, RotateCcw, X } from 'lucide-react'
import UniCreditLogo from '@/app/components/UniCreditLogo'
import MiniPhone from '@/app/screens/flow-library/components/MiniPhone'
import { FRAUD_CHAPTERS } from './screenContracts'
import { FraudJourney } from './FraudJourney'
import type { FraudScreen } from '@/features/cards/fraud/model'
import './presentation.css'

function PresentationPhone({
  initialScreen,
  currentScreen,
  parameters,
  onScreenChange,
}: {
  initialScreen: FraudScreen
  currentScreen: FraudScreen
  parameters: Record<string, string>
  onScreenChange: (screen: FraudScreen) => void
}) {
  const stage = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.68)
  useLayoutEffect(() => {
    const element = stage.current
    if (!element) return
    const measure = () => {
      const bounds = element.getBoundingClientRect()
      if (bounds.width && bounds.height) setScale(Math.max(0.1, Math.min(1, bounds.width / 399, bounds.height / 836)))
    }
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(element)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])
  return (
    <div ref={stage} className="fraud-presentation-phone" data-fraud-presentation-phone>
      <MiniPhone
        device
        scrollable
        scale={scale}
        statusBarVariant={currentScreen === 'fraud-push' || currentScreen === 'fraud-authenticate' ? 'dark' : 'light'}
      >
        <FraudJourney initialScreen={initialScreen} parameters={parameters} onScreenChange={onScreenChange} />
      </MiniPhone>
    </div>
  )
}

function FraudPresentation({ onClose, presentationUrl }: { onClose: () => void; presentationUrl: string }) {
  const [chapterIndex, setChapterIndex] = useState(0)
  const [initialScreen, setInitialScreen] = useState<FraudScreen>('fraud-push')
  const [currentScreen, setCurrentScreen] = useState<FraudScreen>('fraud-push')
  const [fixture, setFixture] = useState(0)
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [copyStatus, setCopyStatus] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const current = FRAUD_CHAPTERS[chapterIndex]!
  const changeChapter = (index: number) => {
    const chapter = FRAUD_CHAPTERS[index]
    if (!chapter) return
    setChapterIndex(index)
    setInitialScreen(chapter.screen)
    setCurrentScreen(chapter.screen)
    setParameters({})
    setFixture((value) => value + 1)
  }
  const showFixture = (values: Record<string, string>) => {
    setParameters(values)
    setInitialScreen(current.screen)
    setFixture((value) => value + 1)
  }
  const screenChanged = (screen: FraudScreen) => {
    setCurrentScreen(screen)
    const index = FRAUD_CHAPTERS.findIndex((chapter) => chapter.screens.includes(screen))
    if (index >= 0) setChapterIndex(index)
  }
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === root.current)
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])
  useEffect(() => {
    if (!copyStatus) return
    const timer = window.setTimeout(() => setCopyStatus(''), 3000)
    return () => window.clearTimeout(timer)
  }, [copyStatus])
  const close = async () => {
    if (document.fullscreenElement === root.current) await document.exitFullscreen().catch(() => undefined)
    onClose()
  }
  const copy = async () => {
    try {
      const url = new URL(presentationUrl)
      await navigator.clipboard.writeText(url.href)
      setCopyStatus('Link copied')
    } catch {
      setCopyStatus('Copy unavailable')
    }
  }
  return (
    <div ref={root} className="fraud-presentation">
      <header className="fraud-presentation-header">
        <div className="fraud-presentation-brand">
          <UniCreditLogo textColor="var(--uc-text)" />
          <span>Card guard</span>
        </div>
        <div className="fraud-presentation-tools">
          <button type="button" aria-label="Copy presentation link" onClick={() => void copy()}>
            <Copy size={18} />
          </button>
          {typeof document !== 'undefined' && document.fullscreenEnabled ? (
            <button
              type="button"
              aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
              onClick={() => {
                if (fullscreen) void document.exitFullscreen()
                else void root.current?.requestFullscreen().catch(() => undefined)
              }}
            >
              <Maximize2 size={18} />
            </button>
          ) : null}
          <button type="button" aria-label="Restart demo" onClick={() => changeChapter(0)}>
            <RotateCcw size={18} />
          </button>
          <button type="button" aria-label="Close card guard presentation" onClick={() => void close()}>
            <X size={22} />
          </button>
        </div>
      </header>
      <div className="fraud-presentation-main">
        <section className="fraud-presentation-story" aria-live="polite">
          <span className="fraud-presentation-kicker">Card protection, with you in control</span>
          <p className="fraud-presentation-chapter">
            {chapterIndex + 1} / {FRAUD_CHAPTERS.length} · {current.label}
          </p>
          <h2>{current.headline}</h2>
          <p className="fraud-presentation-intro">{current.description}</p>
          <div className="fraud-presentation-principle">
            <span aria-hidden="true">→</span>
            <p>
              {chapterIndex === 0
                ? 'Review each activity separately. Your decision applies only to that item.'
                : chapterIndex === 1
                  ? 'Review and sign first. Your card is frozen after successful submission.'
                  : chapterIndex === 2
                    ? 'See the current status, next steps and expected updates.'
                    : 'Manage card permissions and replacement in one place.'}
            </p>
          </div>
          <div className="fraud-presenter-controls">
            {chapterIndex === 2 ? (
              <label>
                Presenter case status
                <select
                  value={parameters.caseStatus ?? 'submitted'}
                  onChange={(event) => showFixture({ caseStatus: event.target.value })}
                >
                  <option value="submitted">Submitted</option>
                  <option value="in-review">Under review</option>
                  <option value="needs-information">Information needed</option>
                  <option value="resolved">Resolved · outcome available</option>
                  <option value="declined">Closed · response available</option>
                </select>
              </label>
            ) : null}
            {chapterIndex === 3 ? (
              <label>
                Presenter location
                <select
                  value={parameters.location ?? 'fresh'}
                  onChange={(event) => {
                    setParameters({ location: event.target.value })
                    setInitialScreen('fraud-card-security')
                    setFixture((value) => value + 1)
                  }}
                >
                  <option value="fresh">Fresh phone-country signal</option>
                  <option value="unavailable">Location unavailable</option>
                  <option value="stale">Location out of date</option>
                </select>
              </label>
            ) : null}
          </div>
        </section>
        <div className="fraud-presentation-device">
          <PresentationPhone
            key={fixture}
            initialScreen={initialScreen}
            currentScreen={currentScreen}
            parameters={parameters}
            onScreenChange={screenChanged}
          />
        </div>
      </div>
      <footer className="fraud-presentation-footer">
        <nav aria-label="Experience chapters">
          {FRAUD_CHAPTERS.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              aria-current={chapterIndex === index ? 'step' : undefined}
              onClick={() => changeChapter(index)}
            >
              <span>{index + 1}</span>
              {chapter.label}
            </button>
          ))}
        </nav>
        <div className="fraud-presentation-arrows">
          <button
            type="button"
            aria-label="Previous chapter"
            disabled={chapterIndex === 0}
            onClick={() => changeChapter(chapterIndex - 1)}
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next chapter"
            disabled={chapterIndex === FRAUD_CHAPTERS.length - 1}
            onClick={() => changeChapter(chapterIndex + 1)}
          >
            <ArrowRight size={20} />
          </button>
        </div>
        <p className="fraud-presentation-disclaimer" role="status">
          {copyStatus}
        </p>
      </footer>
    </div>
  )
}

export function FraudPresentationDialog({
  open,
  onClose,
  presentationUrl,
  returnFocusRef,
  mode = 'modal',
}: {
  open: boolean
  onClose: () => void
  presentationUrl: string
  returnFocusRef?: { readonly current: HTMLElement | null }
  mode?: 'modal' | 'page'
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fraud-presentation-overlay" />
        <Dialog.Content
          ref={contentRef}
          className="fraud-presentation-dialog"
          data-mode={mode}
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => {
            if (contentRef.current?.querySelector('[role="dialog"][aria-modal="true"]')) event.preventDefault()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            returnFocusRef?.current?.focus()
          }}
        >
          <Dialog.Title className="sr-only">Card guard experience</Dialog.Title>
          <Dialog.Description className="sr-only">
            Explore suspicious activity, disputes, case tracking and card protection using the interactive phone.
          </Dialog.Description>
          <FraudPresentation onClose={onClose} presentationUrl={presentationUrl} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
