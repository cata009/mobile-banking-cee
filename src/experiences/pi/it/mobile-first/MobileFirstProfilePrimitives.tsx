import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { pfmAssets } from './pfmAssets'
import './mobile-first.css'
import './mobile-first-profile.css'

export const ProfileHelpContext = createContext<(() => void) | null>(null)
export const ProfileChromeContext = createContext<((variant: 'light' | 'dark') => void) | null>(null)

export function ProfilePage({
  title,
  onBack,
  onClose,
  children,
  footer,
  description,
  help,
  className = '',
  chrome = 'light',
  hero,
  showHelp = true,
}: {
  title: ReactNode
  onBack?: () => void
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  description?: ReactNode
  help?: () => void
  className?: string
  chrome?: 'light' | 'dark'
  hero?: string
  showHelp?: boolean
}) {
  const contextualHelp = useContext(ProfileHelpContext)
  const setChrome = useContext(ProfileChromeContext)
  useEffect(() => {
    setChrome?.(chrome)
    return () => setChrome?.('light')
  }, [chrome, setChrome])
  const titleRef = useRef<HTMLHeadingElement>(null)
  const label = typeof title === 'string' ? title : 'Profilo'
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
  }, [label])
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return
      if (event.key === 'Escape') (onBack ?? onClose)()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onBack, onClose])
  return (
    <main
      className={`mf-home mf-profile-page ${className}`}
      lang="it"
      aria-label={label}
      data-profile-page-chrome={chrome}
    >
      {hero && (
        <div className="mf-profile-receipt-hero" aria-hidden="true">
          <img src={hero} alt="" />
        </div>
      )}
      <header className="mf-profile-page-header">
        {onBack ? (
          <button type="button" aria-label="Indietro" onClick={onBack}>
            <img src={pfmAssets.s.imgBack} alt="" />
          </button>
        ) : (
          <span />
        )}
        <div>
          {showHelp && (help ?? contextualHelp) && (
            <button type="button" aria-label="Aiuto" onClick={help ?? contextualHelp ?? undefined}>
              <img src={pfmAssets.d.imgHelp} alt="" />
            </button>
          )}
          <button type="button" aria-label="Chiudi" onClick={onClose}>
            <img src={pfmAssets.d.imgClose} alt="" />
          </button>
        </div>
      </header>
      <ScrollableRegion
        className={`mf-profile-page-scroll scrollbar-hide${footer ? ' has-footer' : ''}`}
        aria-label={label}
      >
        <h1 ref={titleRef} tabIndex={-1}>
          {title}
        </h1>
        {description && <p className="mf-profile-description">{description}</p>}
        {children}
      </ScrollableRegion>
      {footer && <footer className="mf-profile-page-footer">{footer}</footer>}
    </main>
  )
}

export function ProfileButton({
  children,
  secondary = false,
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return (
    <button type={type} className={`mf-profile-button${secondary ? ' is-secondary' : ''} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function ProfileRow({
  label,
  detail,
  value,
  onClick,
  icon,
}: {
  label: ReactNode
  detail?: ReactNode
  value?: ReactNode
  onClick?: () => void
  icon?: ReactNode
}) {
  const content = (
    <>
      {icon && (
        <span className="mf-profile-row-icon">{typeof icon === 'string' ? <img src={icon} alt="" /> : icon}</span>
      )}
      <span className="mf-profile-row-copy">
        <strong>{label}</strong>
        {detail && <small>{detail}</small>}
      </span>
      {value && <span className="mf-profile-row-value">{value}</span>}
      {onClick && (
        <span aria-hidden="true" className="mf-profile-chevron">
          ›
        </span>
      )}
    </>
  )
  return onClick ? (
    <button type="button" className="mf-profile-row" onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className="mf-profile-row">{content}</div>
  )
}

export function ProfileField({ label, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const generated = useId()
  const inputId = id ?? generated
  return (
    <label htmlFor={inputId} className="mf-profile-field">
      <span>{label}</span>
      <input id={inputId} {...props} />
    </label>
  )
}

export function ProfileTabs({
  labels,
  value,
  onChange,
  label,
}: {
  labels: readonly string[]
  value: string
  onChange: (value: string) => void
  label: string
}) {
  return (
    <div className="mf-profile-tabs scrollbar-hide" role="tablist" aria-label={label}>
      {labels.map((name) => (
        <button
          type="button"
          key={name}
          role="tab"
          aria-selected={value === name}
          tabIndex={value === name ? 0 : -1}
          onClick={() => onChange(name)}
          onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            const index =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? labels.length - 1
                  : (labels.indexOf(name) + (event.key === 'ArrowRight' ? 1 : labels.length - 1)) % labels.length
            onChange(labels[index]!)
            event.currentTarget.parentElement?.querySelectorAll('button')[index]?.focus()
          }}
        >
          {name}
          {name === value && <span className="mf-profile-selected-dot" />}
        </button>
      ))}
    </div>
  )
}
