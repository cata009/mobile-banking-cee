import type { CSSProperties } from 'react'
import type {
  SectionHeadingDividerVariant,
  SectionDividerOptions,
  SectionDividerInteractions,
} from '@/app/components/contracts/sectionDivider'
import { sectionDividerWeb } from '@/app/components/contracts/sectionDividerWeb'
import { DIVIDER_RULE_327, DIVIDER_RULE_343 } from './contracts/dividerArtwork'
import { AppIcon } from './icons/AppIcon'
import './SectionHeadingDivider.css'
export type { SectionHeadingDividerVariant } from '@/app/components/contracts/sectionDivider'

export { SECTION_HEADING_DIVIDER_SOURCE } from '@/app/components/contracts/sectionDivider'

interface SectionHeadingDividerProps extends SectionDividerOptions, SectionDividerInteractions {
  title: string
  secondaryText?: string
  count?: number
  countAlign?: 'inline' | 'end'
  variant?: SectionHeadingDividerVariant
  className?: string
}

export default function SectionHeadingDivider({
  title,
  secondaryText,
  count,
  countAlign = 'inline',
  variant = 'section',
  className,
  ...options
}: SectionHeadingDividerProps) {
  if (variant !== 'section') {
    return (
      <MenigaDivider
        title={title}
        secondaryText={secondaryText}
        count={count}
        variant={variant}
        className={className}
        {...options}
      />
    )
  }

  const { alignCountToEnd } = sectionDividerWeb({ countAlign })

  return (
    <div className={className} data-ds-label="SectionHeadingDivider">
      {alignCountToEnd && typeof count === 'number' ? (
        <>
          <div className="flex items-center justify-between gap-[8px]">
            <h2 className="uc-type-n5-strong line-clamp-2 uppercase text-[var(--uc-text-muted)]">{title}</h2>
            <span className="uc-type-n5-strong text-[var(--uc-text-muted)]" aria-label={`${title} count ${count}`}>
              {count}
            </span>
          </div>
          <div className="mt-[8px] h-px w-full bg-[var(--uc-border)]" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-[8px]">
            <h2 className="uc-type-n5-strong line-clamp-2 uppercase text-[var(--uc-text-muted)]">{title}</h2>
            {typeof count === 'number' ? (
              <span className="uc-type-n5-strong text-[var(--uc-text-muted)]" aria-label={`${title} count ${count}`}>
                {count}
              </span>
            ) : null}
          </div>
          <div className="mt-[8px] h-px w-full bg-[var(--uc-border)]" />
        </>
      )}
    </div>
  )
}

function MenigaDivider({
  title,
  secondaryText,
  count,
  variant,
  className,
  onAction,
  checked = false,
  onCheckedChange,
  disabled = false,
  width,
}: SectionHeadingDividerProps & { variant: Exclude<SectionHeadingDividerVariant, 'section'> }) {
  const state = sectionDividerWeb({ variant, count, secondaryText, width })
  const typography: CSSProperties = {
    fontFamily: '"UniCredit Divider", var(--font-unicredit-stack)',
    fontSize: state.fontSize,
    fontWeight: 700,
    lineHeight: `${state.lineHeight}px`,
    letterSpacing: 0,
    margin: 0,
  }
  const titleStyle: CSSProperties = {
    ...typography,
    flex: '1 1 0%',
    minWidth: state.light || state.large ? 0 : 32,
    color: `var(${state.titleToken})`,
    whiteSpace: 'pre-line',
    overflowWrap: 'anywhere',
  }
  const otherStyle: CSSProperties = {
    ...typography,
    fontSize: 14,
    lineHeight: '15px',
    flexShrink: 0,
    color: `var(${state.secondaryToken})`,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    maxWidth: '100%',
    textAlign: state.secondaryAlign,
    minWidth: state.secondaryMinWidth,
  }
  const actionStyle: CSSProperties = {
    ...typography,
    border: 0,
    background: 'none',
    padding: '8px 0',
    margin: '-8px 0',
    textAlign: 'left',
    cursor: disabled || !onAction ? 'default' : 'pointer',
    color: `var(${state.titleToken})`,
  }
  const Heading = state.titleRole === 'header' ? 'h2' : 'p'
  const titleContent =
    state.large && variant === 'large-two-line-title' && secondaryText ? `${title}\n${secondaryText}` : title
  const primary = state.checkbox ? (
    <label
      className="uc-divider-selection"
      style={{ flex: '1 1 0%', minWidth: 32, display: 'flex', alignItems: 'center', gap: 4 }}
    >
      <span style={{ width: 32, height: 32, flexShrink: 0, position: 'relative' }}>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled || !onCheckedChange}
          onChange={(event) => onCheckedChange?.(event.target.checked)}
          style={{
            appearance: 'none',
            position: 'absolute',
            left: 5,
            top: 5,
            width: 22,
            height: 22,
            margin: 0,
            border: '1px solid var(--uc-text)',
            borderRadius: 4,
            backgroundColor: checked ? 'var(--uc-text)' : 'var(--uc-surface)',
          }}
        />
        {checked ? (
          <span aria-hidden="true" style={{ position: 'absolute', left: 9, top: 9, pointerEvents: 'none' }}>
            <AppIcon name="check" size={14} strokeWidth={2} color="var(--uc-surface)" />
          </span>
        ) : null}
      </span>
      <span data-divider-title style={titleStyle}>
        {title}
      </span>
    </label>
  ) : state.primaryAction ? (
    <button
      type="button"
      className="uc-divider-action"
      disabled={disabled || !onAction}
      onClick={onAction}
      style={{ ...actionStyle, ...titleStyle, padding: '8px 0', margin: '-8px 0' }}
    >
      <span data-divider-title style={{ ...typography, display: 'block', color: 'inherit', overflowWrap: 'anywhere' }}>
        {title}
      </span>
    </button>
  ) : (
    <Heading
      data-divider-title
      style={
        state.light ? { ...titleStyle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : titleStyle
      }
    >
      {titleContent}
    </Heading>
  )
  const secondary =
    state.secondaryAction && state.rightText ? (
      <button
        type="button"
        className="uc-divider-action"
        disabled={disabled || !onAction}
        onClick={onAction}
        style={{ ...actionStyle, ...otherStyle, padding: '8px 0', margin: '-8px 0' }}
      >
        {state.rightText}
      </button>
    ) : state.light ? (
      <>
        {secondaryText ? <span style={otherStyle}>{secondaryText}</span> : null}
        {typeof count === 'number' ? <span style={otherStyle}>{count}</span> : null}
      </>
    ) : !state.large && state.rightText ? (
      <span style={otherStyle}>{state.rightText}</span>
    ) : null
  const rule = state.hasLine ? (
    <div
      data-divider-rule
      aria-hidden="true"
      style={
        state.light
          ? {
              height: 1,
              position: 'absolute',
              bottom: 0,
              left: state.ruleLeft,
              right: state.ruleRight,
              pointerEvents: 'none',
            }
          : { height: 1, flexShrink: 0, width: '100%', pointerEvents: 'none' }
      }
    >
      <img
        alt=""
        draggable={false}
        src={`data:image/svg+xml,${encodeURIComponent(state.light || state.paddingHorizontal === 16 ? DIVIDER_RULE_343 : DIVIDER_RULE_327)}`}
        style={{ display: 'block', width: '100%', height: 1, maxWidth: 'none' }}
      />
    </div>
  ) : null
  return (
    <div className={className} data-ds-label="SectionHeadingDivider" data-divider-variant={variant}>
      <div
        data-divider-geometry
        style={{
          width: state.width,
          maxWidth: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          backgroundColor: state.backgroundToken ? `var(${state.backgroundToken})` : undefined,
          paddingLeft: state.light ? state.outerPaddingLeft : state.paddingHorizontal,
          paddingRight: state.light ? state.outerPaddingRight : state.paddingHorizontal,
          paddingTop: state.paddingVertical,
          paddingBottom: state.paddingVertical,
          minHeight: state.minHeight,
          display: 'flex',
          flexDirection: 'column',
          gap: state.large || state.light ? 0 : state.gap,
        }}
      >
        <div
          data-divider-row
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: state.light || state.large ? 'nowrap' : 'wrap',
            columnGap: state.rowGap,
            rowGap: state.gap,
            minHeight: state.light ? state.height : state.large ? undefined : state.rowMinHeight,
            paddingLeft: state.light ? state.paddingHorizontal : 0,
            paddingRight: state.light ? state.paddingHorizontal : 0,
          }}
        >
          {primary}
          {secondary}
        </div>
        {rule}
      </div>
    </div>
  )
}
