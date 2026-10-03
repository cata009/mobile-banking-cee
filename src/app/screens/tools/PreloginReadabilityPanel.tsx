import { useEffect, useState, type RefObject } from 'react'
import { scanPreloginReadability, type PreviewCheck } from './preloginReadability'
import type { PreloginTextField } from './preloginTextFields'

export function usePreloginReadability(
  host: RefObject<HTMLDivElement>,
  fields: readonly PreloginTextField[],
  fingerprint: string,
  enabled: boolean,
) {
  const [checks, setChecks] = useState<PreviewCheck[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let timer: number | undefined
    const measure = () => {
      if (cancelled || !host.current) return
      try {
        setChecks(scanPreloginReadability(host.current, fields))
        setError(null)
      } catch {
        setError('Background checks are unavailable. Review text readability in the preview.')
        setChecks([])
      }
    }
    const schedule = () => {
      if (cancelled) return
      window.clearTimeout(timer)
      timer = window.setTimeout(measure, 420)
    }
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null
    if (host.current) observer?.observe(host.current)
    const images = host.current?.querySelectorAll('img[alt="Background"]') ?? []
    for (const image of images) image.addEventListener('load', schedule)
    document.fonts?.ready.then(schedule)
    schedule()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      observer?.disconnect()
      for (const image of images) image.removeEventListener('load', schedule)
    }
  }, [host, fields, fingerprint, enabled])
  return { checks, error }
}

export function PreloginReadabilityPanel({ checks, error }: { checks: readonly PreviewCheck[]; error: string | null }) {
  const warnings = checks.filter((check) => check.lowContrast || check.overflow)
  return (
    <div className="mt-[14px]">
      <h3 className="text-[14px] font-bold text-[var(--uc-text)]">Readability and fit</h3>
      <p className="mt-[8px] text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
        Background samples include the app gradients. Outlines mark areas to review; text fit is measured on this
        device.
      </p>
      <p role="status" className="mt-[12px] text-[13px] font-bold text-[var(--uc-text)]">
        {error ||
          (checks.length ? `${warnings.length} areas to review · ${checks.length} checked` : 'Measuring the preview…')}
      </p>
      <div className="mt-[12px] max-h-[460px] space-y-[10px] overflow-y-auto">
        {checks.map((check, index) => (
          <div key={`${check.screen}-${index}`} className="border-b border-[var(--uc-border)] pb-[8px]">
            <p className="text-[12px] font-bold text-[var(--uc-text)]">
              {check.screen === 'active' ? 'Active' : 'Inactive'} · {check.label}
            </p>
            <p
              className={`mt-[2px] text-[11px] leading-[16px] ${check.lowContrast || check.overflow ? 'text-[var(--uc-orange-main)]' : 'text-[var(--uc-text-muted)]'}`}
            >
              {check.ratio === null ? '' : `${check.ratio.toFixed(2)}:1 sampled contrast`}{' '}
              {check.lowContrast ? '· Review contrast' : '· Contrast looks sufficient'}
              {check.overflow ? ' · Text may be clipped' : ''}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-[12px] text-[11px] leading-[16px] text-[var(--uc-text-muted)]">
        Indicative samples, not an accessibility certification. Logo checks are visual guidance. Text thresholds follow{' '}
        <a
          href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          WCAG contrast guidance
        </a>
        .
      </p>
    </div>
  )
}

export function PreloginReadabilityOverlay({ checks }: { checks: readonly PreviewCheck[] }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[35] overflow-hidden">
      {checks
        .filter((check) => check.lowContrast || check.overflow)
        .map((check, index) => (
          <div
            key={index}
            title={check.label}
            className="absolute rounded-[3px] border-2 border-[#d97706] bg-[#d97706]/10"
            style={{
              left: `${check.rect.left}%`,
              top: `${check.rect.top}%`,
              width: `${check.rect.width}%`,
              height: `${check.rect.height}%`,
            }}
          />
        ))}
    </div>
  )
}
