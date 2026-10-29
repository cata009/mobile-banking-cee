import { useEffect, useState } from 'react'
import type { PhoneChromeVariant } from '@/app/components/StatusBar'
import svgPaths from '@/imports/svg-2hn0mpby87'

/** Illustrative system chrome. Geometry is sourced from ASEE; this does not emulate iOS. */
export function DuoSystemStrip({ variant, cover }: { variant: PhoneChromeVariant; cover: boolean }) {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div
      data-duo-system-strip
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 z-50 flex w-[84px] flex-col items-center gap-3 pt-5"
      style={{
        color:
          variant === 'light'
            ? 'var(--uc-text)'
            : variant === 'theme'
              ? 'var(--uc-phone-status-fg, var(--uc-text))'
              : 'white',
      }}
    >
      {cover && (
        <div
          data-duo-cover-camera
          className="mb-1 grid size-[26px] place-items-center rounded-full bg-black shadow-[inset_0_0_0_2px_#303234]"
        >
          <div className="size-[10px] rounded-full bg-[#0c1421] shadow-[inset_0_0_3px_#325071]" />
        </div>
      )}
      <span className="font-sans text-[16px] font-semibold tabular-nums">
        {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
      </span>
      <svg width="40" height="44" viewBox="0 0 40 44" fill="none">
        <path d="M6 29a17 17 0 1 1 28 0" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <g transform="translate(11.4 14)" fill="currentColor">
          <path d={svgPaths.p18b35300} />
        </g>
        {[11, 17, 23, 29].map((cx, index) => (
          <circle
            key={cx}
            cx={cx}
            cy={index === 0 || index === 3 ? 36 : 39}
            r="1.7"
            fill="currentColor"
            opacity={1 - index * 0.16}
          />
        ))}
      </svg>
    </div>
  )
}
