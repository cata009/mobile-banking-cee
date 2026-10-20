import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Copy, Maximize2, Minimize2, RotateCcw, X } from 'lucide-react'
import UniCreditLogo from '@/app/components/UniCreditLogo'
import { PrimeDiamondMark } from '@/app/components/prime/PrimeDiamondMark'
import digitalPhoto from '@/assets/app2027/uc-prime/digitalni-reseni-wide-v2.png'
import officePhoto from '@/assets/app2027/uc-prime/Prime-Office-banner-wide-v2.png'
import sailingPhoto from '@/assets/app2027/uc-prime/Prime-Sailing-banner-wide-v2.png'
import { PrimePresentationController } from './PrimePresentationController'
import type { PrimePresentationModel, PrimePresentationMoment, PrimePresentationProps } from './contracts'
import './PrimePresentation.css'

const moments: Array<{
  id: PrimePresentationMoment
  title: string
  description: string
  headline: readonly [string, string]
  introduction: string
}> = [
  {
    id: 'discover',
    title: 'Discover',
    description: 'A more personal beginning',
    headline: ['Human.', 'By design.'],
    introduction: 'One familiar homepage. A more personal relationship with your bank.',
  },
  {
    id: 'connect',
    title: 'Connect',
    description: 'Care, within reach',
    headline: ['Care.', 'A call away.'],
    introduction: 'A conversation can make all the difference. Discover the human side of PRIME.',
  },
  {
    id: 'benefits',
    title: 'Benefits',
    description: 'More room for life',
    headline: ['For banking.', 'And beyond.'],
    introduction: 'Personal attention and additional benefits, with more of your life in mind.',
  },
]

function PresentationStage({
  model,
  mode,
  onClose,
  presentationUrl,
}: PrimePresentationProps & { model: PrimePresentationModel }) {
  const root = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)
  const copyRequest = useRef(0)
  const closing = useRef(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'unavailable'>('idle')
  const [canFullscreen, setCanFullscreen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const currentMoment = moments.find((moment) => moment.id === model.moment) ?? moments[0]!
  const momentIndex = moments.indexOf(currentMoment)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    setCanFullscreen(document.fullscreenEnabled === true)
    const update = () => setFullscreen(document.fullscreenElement === root.current)
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = window.setTimeout(() => setCopyState('idle'), 2600)
    return () => window.clearTimeout(timer)
  }, [copyState])

  const copyLink = async () => {
    const request = ++copyRequest.current
    try {
      await navigator.clipboard.writeText(presentationUrl)
      if (mounted.current && copyRequest.current === request) setCopyState('copied')
    } catch {
      if (mounted.current && copyRequest.current === request) setCopyState('unavailable')
    }
  }

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === root.current) await document.exitFullscreen()
      else await root.current?.requestFullscreen()
    } catch {
      if (mounted.current) setFullscreen(false)
    }
  }

  const closePresentation = () => {
    if (closing.current) return
    closing.current = true
    if (document.fullscreenElement === root.current) {
      void document
        .exitFullscreen()
        .catch(() => undefined)
        .then(() => {
          if (mounted.current) onClose()
        })
    } else onClose()
  }

  useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      const target = event.target
      if (
        !(target instanceof HTMLElement) ||
        target.closest(
          '[data-prime-presentation-phone], input, textarea, select, [contenteditable="true"], [role="radio"], [role="slider"], [role="combobox"], [role="listbox"]',
        )
      )
        return
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
      event.preventDefault()
      event.stopPropagation()
      if (event.key === 'ArrowRight') model.nextMoment()
      else model.previousMoment()
    }
    document.addEventListener('keydown', handleKeys)
    return () => document.removeEventListener('keydown', handleKeys)
  }, [model])

  return (
    <div
      ref={root}
      className={`prime-presentation${model.isCalling ? ' prime-presentation--calling' : ''}`}
      data-mode={mode}
      data-moment={model.moment}
    >
      <header className="prime-presentation-header">
        <div className="prime-presentation-brand" role="img" aria-label="Prime by UniCredit Bank">
          <div className="prime-presentation-brand-artwork" aria-hidden="true">
            <div className="prime-presentation-brand-row">
              <span className="prime-presentation-brand-prime">Prime</span>
              <PrimeDiamondMark className="prime-presentation-brand-diamond" size={15} />
              <span className="prime-presentation-brand-by">by</span>
            </div>
            <div data-prime-brand-bank>
              <UniCreditLogo className="prime-presentation-logo" textColor="#222222" />
            </div>
          </div>
        </div>
        <div className="prime-presentation-moment-cue" role="status" aria-live="polite" aria-atomic="true">
          <span key={model.moment} className="prime-presentation-cue-title">
            {currentMoment.title}
          </span>
          <span className="prime-presentation-cue-position">
            {momentIndex + 1} / {moments.length}
          </span>
          <span className="prime-presentation-cue-track" aria-hidden="true">
            <span
              className="prime-presentation-cue-marker"
              style={{ transform: `translateX(${momentIndex * 100}%)` }}
            />
          </span>
        </div>
        <div className="prime-presentation-tools">
          <button
            type="button"
            className="prime-presentation-copy"
            onClick={() => void copyLink()}
            aria-label={copyState === 'copied' ? 'Presentation link copied' : 'Copy presentation link'}
          >
            {copyState === 'copied' ? <Check size={16} strokeWidth={1.7} /> : <Copy size={16} strokeWidth={1.7} />}
            <span aria-live="polite">
              {copyState === 'copied' ? 'Link copied' : copyState === 'unavailable' ? 'Copy unavailable' : 'Copy link'}
            </span>
          </button>
          {canFullscreen ? (
            <button
              type="button"
              className="prime-presentation-icon-button prime-presentation-fullscreen"
              aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              onClick={() => void toggleFullscreen()}
            >
              {fullscreen ? <Minimize2 size={19} strokeWidth={1.6} /> : <Maximize2 size={19} strokeWidth={1.6} />}
            </button>
          ) : null}
          <button
            type="button"
            className="prime-presentation-icon-button prime-presentation-close"
            aria-label="Close presentation"
            onClick={closePresentation}
          >
            <X size={21} strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <main className="prime-presentation-stage">
        <section className="prime-presentation-narrative" aria-label="The PRIME experience">
          <div key={model.moment} className="prime-presentation-story">
            {model.moment === 'discover' ? (
              <p className="prime-presentation-service-label">Personal banking with Prime</p>
            ) : null}
            <h1 className="prime-presentation-headline">
              <span>{currentMoment.headline[0]}</span>
              <span>{currentMoment.headline[1]}</span>
            </h1>
            <p className="prime-presentation-introduction">{currentMoment.introduction}</p>
          </div>
          <div className="prime-presentation-photograph">
            <div className="prime-presentation-photo-content">
              <img
                src={digitalPhoto}
                alt="A customer using mobile banking in a warm architectural setting"
                className="prime-presentation-photo-image prime-presentation-photo-image--discover"
                data-active={model.moment === 'discover'}
                aria-hidden={model.moment !== 'discover'}
                decoding="async"
              />
              <img
                src={officePhoto}
                alt="An advisor and client discussing their plans together"
                className="prime-presentation-photo-image"
                data-active={model.moment === 'connect'}
                aria-hidden={model.moment !== 'connect'}
                decoding="async"
              />
              <img
                src={sailingPhoto}
                alt="A couple enjoying the evening aboard a sailing boat"
                className="prime-presentation-photo-image"
                data-active={model.moment === 'benefits'}
                aria-hidden={model.moment !== 'benefits'}
                decoding="async"
              />
            </div>
          </div>
        </section>

        <div className="prime-presentation-phone-column">
          <div className="prime-presentation-phone-stage" data-prime-presentation-phone>
            {model.phone}
          </div>
        </div>

        <aside className="prime-presentation-context" aria-label="Choose the customer experience">
          <fieldset className="prime-presentation-fieldset">
            <legend>Choose a client</legend>
            <div className="prime-presentation-segments">
              {(['standard', 'prime', 'private'] as const).map((segment) => (
                <label key={segment} className="prime-presentation-choice">
                  <input
                    type="radio"
                    name="prime-presentation-segment"
                    value={segment}
                    checked={model.segment === segment}
                    onChange={() => model.selectSegment(segment)}
                  />
                  <span className="prime-presentation-choice-mark" aria-hidden="true" />
                  <span>{segment === 'standard' ? 'Standard' : segment === 'prime' ? 'Prime' : 'Private'}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {model.segment === 'standard' ? (
            <fieldset className="prime-presentation-fieldset prime-presentation-service">
              <legend>Advisor service</legend>
              <div className="prime-presentation-service-choices">
                {[
                  { active: false, label: 'Not activated' },
                  { active: true, label: 'Already active' },
                ].map((service) => (
                  <label
                    key={String(service.active)}
                    className="prime-presentation-choice prime-presentation-choice--small"
                  >
                    <input
                      type="radio"
                      name="prime-presentation-service"
                      checked={model.serviceActive === service.active}
                      onChange={() => model.setStandardServiceActive(service.active)}
                    />
                    <span className="prime-presentation-choice-mark" aria-hidden="true" />
                    <span>{service.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          <div className="prime-presentation-context-footer">
            <p className="prime-presentation-context-note">
              {model.segment === 'private'
                ? 'A dedicated Private & Wealth experience.'
                : model.segment === 'prime' || model.serviceActive
                  ? 'Personal care, already part of your day.'
                  : 'Discover what a more personal banking relationship could look like.'}
            </p>
            <button type="button" className="prime-presentation-restart" onClick={model.restart}>
              <RotateCcw size={15} strokeWidth={1.7} />
              Start again
            </button>
          </div>
        </aside>
      </main>

      <footer className="prime-presentation-footer">
        <nav className="prime-presentation-moments" aria-label="Presentation moments">
          {moments.map((moment, index) => (
            <button
              type="button"
              key={moment.id}
              className="prime-presentation-moment"
              aria-label={moment.title}
              aria-pressed={model.moment === moment.id}
              onClick={() => model.selectMoment(moment.id)}
            >
              <span className="prime-presentation-moment-number" aria-hidden="true">
                {index + 1}
              </span>
              <span className="prime-presentation-moment-copy">
                <span className="prime-presentation-moment-title">{moment.title}</span>
                <span className="prime-presentation-moment-description">{moment.description}</span>
              </span>
            </button>
          ))}
        </nav>
        <div className="prime-presentation-step-controls" aria-label="Move through the presentation">
          <button
            type="button"
            className="prime-presentation-icon-button"
            aria-label="Previous moment"
            onClick={model.previousMoment}
          >
            <ArrowLeft size={19} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            className="prime-presentation-icon-button prime-presentation-next"
            aria-label="Next moment"
            onClick={model.nextMoment}
          >
            <ArrowRight size={19} strokeWidth={1.6} />
          </button>
        </div>
      </footer>
    </div>
  )
}

export default function PrimePresentation(props: PrimePresentationProps) {
  return (
    <PrimePresentationController>
      {(model) => <PresentationStage {...props} model={model} />}
    </PrimePresentationController>
  )
}
