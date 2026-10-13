import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { BottomSheet } from '@/app/components/BottomSheet'
import { cardCapabilities } from '@/features/cards/mobileFirstCards'
import { cardsAssets as a } from './cardsAssets'
import { CARD_STATUS_LABELS, type ItalyCard } from './cardsContent'
import MobileFirstDetailHeader from './MobileFirstDetailHeader'

const Profile = lazy(() => import('./MobileFirstProfile'))

export function CardAmount({
  value,
  hidden = false,
  signed = false,
}: {
  value: number
  hidden?: boolean
  signed?: boolean
}) {
  const [integer, decimals] = new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: 'always',
    signDisplay: signed ? 'always' : 'auto',
  })
    .format(value)
    .split(',')
  return (
    <span className="mfc-amount">
      <strong>{hidden ? '••••' : integer}</strong>
      {!hidden && <span>,{decimals} €</span>}
    </span>
  )
}
export function CardArt({
  card,
  hidden = false,
  mini = false,
  onOpen,
  onPin,
}: {
  card: ItalyCard
  hidden?: boolean
  mini?: boolean
  onOpen?: () => void
  onPin?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(mini ? 212 / 361 : 1)
  useEffect(() => {
    const node = ref.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(entry.contentRect.width / 361)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const debit = card.kind === 'debit',
    prepaid = card.kind === 'prepaid'
  return (
    <div
      ref={ref}
      className={`mfc-art${debit ? ' mfc-art-debit' : ''}${prepaid ? ' mfc-art-prepaid' : ''}${mini ? ' mfc-art-mini' : ''}`}
    >
      <div className="mfc-art-canvas" style={{ transform: `scale(${scale})` }}>
        <div className="mfc-art-background" aria-hidden="true">
          <img src={prepaid ? a.prepaidSkin : debit ? a.imgSkin1 : a.imgSkin} alt="" />
          {prepaid && (
            <>
              <img className="mfc-prepaid-painting" src={a.prepaidPainting} alt="" />
              <span className="mfc-prepaid-shade" />
            </>
          )}
          {!prepaid && (
            <>
              <div className="mfc-art-pattern" style={{ maskImage: `url("${a.imgArrows}")` }}>
                <img src={a.imgArrows1} alt="" />
              </div>
              <img
                className="mfc-art-arrow"
                src={
                  (card.settings?.image?.[0] ??
                    (card.id === 'etica' ? 'UniCredit Flexia Etica' : 'UniCredit Flexia Classic')) ===
                  'UniCredit Flexia Etica'
                    ? a.eticaArrow
                    : debit
                      ? a.imgArrow1
                      : a.imgArrow
                }
                alt=""
              />
              <span className="mfc-art-shade" />
            </>
          )}
        </div>
        {onOpen && (
          <button type="button" className="mfc-art-open" aria-label={`Apri carta ${card.name}`} onClick={onOpen} />
        )}
        {!mini && (
          <>
            <span className="mfc-art-holder">
              <b>{card.nickname ?? card.holder}</b>
              <b>{hidden ? '•••• ••••' : `**** ${card.lastFour}`}</b>
            </span>
            {card.status !== 'active' && <span className="mfc-art-status">{CARD_STATUS_LABELS[card.status]}</span>}
            <div className="mfc-art-amounts">
              <span>
                <CardAmount value={prepaid ? card.available : card.spending} hidden={hidden} />
                <small>
                  {prepaid ? 'Saldo disponibile' : 'Spese del mese'}
                  {card.kind === 'credit' && <img src={a.imgNavigationAndActionInfoSmallK10} alt="" />}
                </small>
              </span>
              {!debit && (
                <span>
                  <CardAmount value={prepaid ? (card.balance ?? card.available) : card.available} hidden={hidden} />
                  <small>{prepaid ? 'Saldo contabile' : 'Disponibilità residua'}</small>
                </span>
              )}
            </div>
          </>
        )}
        <div className="mfc-art-brand" aria-hidden="true">
          <img src={debit ? a.imgUniCreditLogo1 : a.imgUniCreditLogo} alt="" />
          <span className="mfc-art-network">
            <img src={a.imgGroup} alt="" />
          </span>
          <span>{prepaid ? 'Prepaid' : debit ? 'Debit' : 'Credit'}</span>
        </div>
        <strong className="mfc-art-name">
          {card.premium && (
            <span>
              Linea Premium
              <br />
            </span>
          )}
          {card.name}
        </strong>
        {!mini && onPin && cardCapabilities(card.kind, card.status).reveal && (
          <button type="button" className="mfc-art-pin" aria-label={`PIN ${card.name}`} onClick={onPin}>
            PIN <img src={debit ? a.whiteEye : a.imgNavigationAndActionShowK10} alt="" />
          </button>
        )}
      </div>
    </div>
  )
}
export function CardsPage({
  title,
  onBack,
  onClose,
  children,
  footer,
  hidden,
  onPrivacy,
  profile = false,
  onProfile,
  blocked = false,
}: {
  title?: string
  onBack: () => void
  onClose?: () => void
  children: ReactNode
  footer?: ReactNode
  hidden?: boolean
  onPrivacy?: () => void
  profile?: boolean
  onProfile?: () => void
  blocked?: boolean
}) {
  const [helpOpen, setHelpOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  if (profileOpen)
    return (
      <Suspense fallback={null}>
        <Profile onClose={() => setProfileOpen(false)} onLogout={onClose ?? onBack} />
      </Suspense>
    )
  return (
    <main className="mf-home mf-cards" aria-label={title ?? 'Dettaglio carta'} aria-hidden={blocked || undefined}>
      <MobileFirstDetailHeader
        className="mfc-header"
        onBack={onBack}
        onHelp={!profile ? () => setHelpOpen(true) : undefined}
        onPrivacy={onPrivacy}
        amountsHidden={hidden}
        onClose={!profile ? onClose : undefined}
        onProfile={profile ? (onProfile ?? (() => setProfileOpen(true))) : undefined}
      />
      <ScrollableRegion className="mfc-scroll" aria-label={title ?? 'Carta e movimenti'} key={title ?? 'detail'}>
        {title && <h1>{title}</h1>}
        {children}
      </ScrollableRegion>
      {footer && <footer className="mfc-footer">{footer}</footer>}
      {helpOpen && (
        <BottomSheet title="Aiuto" closeLabel="Chiudi aiuto" onClose={() => setHelpOpen(false)} className="mfc-sheet">
          <p>
            Consulta i dati e le operazioni della tua carta. Per sospendere, bloccare o richiedere assistenza, apri
            “Problemi Carta” dal dettaglio.
          </p>
          <CardButton onClick={() => setHelpOpen(false)}>Ok</CardButton>
        </BottomSheet>
      )}
    </main>
  )
}
export function CardButton({
  children,
  onClick,
  secondary = false,
  disabled = false,
}: {
  children: ReactNode
  onClick: () => void
  secondary?: boolean
  disabled?: boolean
}) {
  return (
    <button type="button" className={secondary ? 'mfc-secondary' : 'mfc-primary'} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
export function CardRow({
  label,
  value,
  action = 'VISUALIZZA',
  onClick,
  ariaLabel,
}: {
  label: string
  value?: ReactNode
  action?: string
  onClick?: () => void
  ariaLabel?: string
}) {
  return (
    <div className="mfc-row">
      <span>
        {label}
        {value !== undefined && <b>{value}</b>}
      </span>
      {onClick && (
        <button type="button" className="mf-text-link" onClick={onClick} aria-label={ariaLabel ?? `${action} ${label}`}>
          {action}
          <img src={a.imgNavigationAndActionForthT2} alt="" />
        </button>
      )}
    </div>
  )
}
export function CardField({
  label,
  value,
  onChange,
  type = 'text',
  maxLength,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  maxLength?: number
  placeholder?: string
}) {
  return (
    <label className="mfc-field">
      <span>{label}</span>
      <input
        aria-label={label}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
      />
    </label>
  )
}
export function CardQuickAction({ label, src, onClick }: { label: string; src: string; onClick: () => void }) {
  return (
    <button type="button" className="mfc-quick" onClick={onClick} aria-label={label}>
      <span>
        <img src={src} alt="" />
      </span>
      <small>{label}</small>
    </button>
  )
}
