import type { ReactNode } from 'react'
import { resolveStatusTag, type StatusTagTone } from './contracts/statusTag'

interface StatusTagProps {
  tone?: StatusTagTone
  /** Leading dot in the tone colour. */
  dot?: boolean
  children: ReactNode
  /** Layout only (margins, alignment). Keep visual styling out of here. */
  className?: string
}

/**
 * The Design System status tag. Colours come from the single color source, so a change there reaches it in light
 * and dark. The native counterpart is `BaselineStatusTag`; both read `contracts/statusTag.ts`.
 */
export default function StatusTag({ tone = 'neutral', dot = true, children, className }: StatusTagProps) {
  const tag = resolveStatusTag({ tone, dot })
  const fill =
    tag.tintPercent === 0
      ? `var(${tag.fillToken})`
      : `color-mix(in srgb, var(${tag.fillToken}) ${tag.tintPercent}%, var(${tag.mixInto}))`
  return (
    <span
      data-ds-label="StatusTag"
      data-tone={tone}
      className={`inline-flex items-center rounded-full font-bold ${className ?? ''}`}
      style={{
        gap: tag.gap,
        padding: `${tag.paddingVertical}px ${tag.paddingHorizontal}px`,
        fontSize: tag.fontSize,
        lineHeight: `${tag.lineHeight}px`,
        color: `var(${tag.textToken})`,
        backgroundColor: fill,
      }}
    >
      {tag.showDot ? (
        <span
          aria-hidden="true"
          className="shrink-0 rounded-full"
          style={{ width: tag.dotSize, height: tag.dotSize, backgroundColor: `var(${tag.dotToken})` }}
        />
      ) : null}
      {children}
    </span>
  )
}
