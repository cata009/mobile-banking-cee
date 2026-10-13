import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type ComponentProps,
} from 'react'
import {
  downloadProfilePdf,
  profileSettingsStore,
  isProfileAuthorizationLocked,
  canAcceptProfileDocument,
} from '@/features/profile/mobileFirstProfileSettings'
import { ProfileButton, ProfileField, ProfilePage as BaseProfilePage } from './MobileFirstProfilePrimitives'
import { profileSettingsAssets } from './profileSettingsAssets'
import { SETTINGS_RESULTS } from './profileSettingsContent'
import MobileFirstProfileAuthorization from './MobileFirstProfileAuthorization'
export const ProfileSettingsRecoveryContext = createContext<(() => void) | null>(null)

export function SettingsPage({ className = '', ...props }: ComponentProps<typeof BaseProfilePage>) {
  return <BaseProfilePage {...props} className={'mf-settings-page ' + className} />
}
const ProfilePage = SettingsPage

export interface SettingsNavigation {
  onBack: () => void
  onClose: () => void
}
export function useProfileSettings() {
  return useSyncExternalStore(
    profileSettingsStore.subscribe,
    profileSettingsStore.getSnapshot,
    profileSettingsStore.getSnapshot,
  )
}
export function SettingsToggle({
  label,
  checked,
  onChange,
  detail,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  detail?: string
}) {
  return (
    <label className="mf-settings-toggle">
      <span>
        {label}
        {detail && <small>{detail}</small>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="mf-settings-toggle-track" aria-hidden="true" />
    </label>
  )
}
export function SettingsChoice({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="mf-settings-choices">
      <legend>{label}</legend>
      {options.map((option) => (
        <label key={option}>
          <input
            type="radio"
            name={label}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </fieldset>
  )
}
export function SettingsSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="mf-settings-select">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Seleziona</option>
        {options.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </label>
  )
}
export function SettingsError({ error }: { error: string | null }) {
  return error ? (
    <p className="mf-settings-error" role="alert">
      {error}
    </p>
  ) : null
}
export function SettingsSecret({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="mf-settings-secret">
      <ProfileField
        label={label}
        inputMode="numeric"
        autoComplete="off"
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        aria-label={visible ? 'Nascondi ' + label : 'Mostra ' + label}
        onClick={() => setVisible(!visible)}
      >
        <img src={profileSettingsAssets.eye} alt="" />
      </button>
    </div>
  )
}
export function SettingsDocument({
  title,
  body,
  onAccept,
  onBack,
  onClose,
}: { title: string; body: string; onAccept: () => void } & SettingsNavigation) {
  const [open, setOpen] = useState(false),
    [seen, setSeen] = useState(false),
    [accepted, setAccepted] = useState(false)
  const privacyDocument = title === 'Documento Consensi Privacy'
  const certificateDocument = title.includes('certificato') || title.startsWith('Per firmare')
  const paperImage = privacyDocument
    ? profileSettingsAssets.privacyDocument
    : title.toLowerCase().includes('limiti')
      ? profileSettingsAssets.limitsDocument
      : title.includes('collegamento')
        ? profileSettingsAssets.relationshipDocument
        : null
  return (
    <ProfilePage
      title={title}
      onBack={onBack}
      onClose={onClose}
      footer={
        <ProfileButton disabled={!canAcceptProfileDocument({ seen, accepted, certificateDocument })} onClick={onAccept}>
          Accetta e prosegui
        </ProfileButton>
      }
    >
      <p>
        {privacyDocument
          ? 'Dichiaro di aver preso visione dell’Informativa privacy e di confermare la volontà espressa in merito ai consensi al trattamento dei dati personali.'
          : 'Prima di procedere, è necessario prendere visione del documento.'}
      </p>
      <div className="mf-settings-document">
        {paperImage ? (
          <img
            src={paperImage}
            alt={privacyDocument ? 'Facsimile documento consensi privacy' : 'Facsimile documento'}
          />
        ) : (
          <>
            {!certificateDocument && <strong>FACSIMILE</strong>}
            <p>{body}</p>
          </>
        )}
      </div>
      {!certificateDocument && (
        <ProfileButton
          secondary
          onClick={() => {
            setOpen(true)
            setSeen(true)
            if (privacyDocument) setAccepted(true)
          }}
        >
          Visualizza il documento PDF
        </ProfileButton>
      )}
      {open && (
        <section className="mf-settings-document-view" aria-label="Documento PDF">
          <h2>{title}</h2>
          <p>{body}</p>
          <ProfileButton secondary onClick={() => downloadProfilePdf(title, body)}>
            Condividi documento
          </ProfileButton>
          <ProfileButton secondary onClick={() => setOpen(false)}>
            Chiudi documento
          </ProfileButton>
        </section>
      )}
      {!privacyDocument && (
        <SettingsToggle
          label={
            certificateDocument
              ? 'Ho preso visione del Manuale Operativo e richiedo la Firma Digitale'
              : 'Confermo di aver preso visione'
          }
          checked={accepted}
          onChange={setAccepted}
        />
      )}
    </ProfilePage>
  )
}
export function SettingsAuthorization({
  title,
  onSuccess,
  onBack,
  onClose,
  onForgot,
}: { title: string; onSuccess: () => void; onForgot?: () => void } & SettingsNavigation) {
  const recovery = useContext(ProfileSettingsRecoveryContext)
  const [processing, setProcessing] = useState(false)
  useEffect(() => {
    if (!processing) return
    const timer = setTimeout(onSuccess, 350)
    return () => clearTimeout(timer)
  }, [processing, onSuccess])
  if (processing)
    return (
      <ProfilePage title="Elaborazione in corso" onClose={onClose}>
        <div className="mf-settings-progress" role="status">
          <strong>67%</strong>
          <p>L’operazione è in corso, potrebbe richiedere qualche secondo. Non chiudere la pagina!</p>
        </div>
      </ProfilePage>
    )
  return (
    <div className="mf-settings-auth-host" aria-label={title}>
      <MobileFirstProfileAuthorization
        onSuccess={() => setProcessing(true)}
        onCancel={onBack}
        onForgot={onForgot ?? recovery ?? onBack}
        onBiometric={() => {
          if (!isProfileAuthorizationLocked() && profileSettingsStore.getSnapshot().biometric) setProcessing(true)
        }}
      />
    </div>
  )
}
export function SettingsResult({
  title,
  description,
  onDone,
  onClose,
  footer,
}: {
  title: string
  description?: ReactNode
  onDone: () => void
  onClose: () => void
  footer?: ReactNode
}) {
  return (
    <ProfilePage
      title={title}
      onClose={onClose}
      chrome="dark"
      className="mf-settings-result"
      footer={footer ?? <ProfileButton onClick={onDone}>Chiudi</ProfileButton>}
    >
      <img className="mf-settings-success" src={profileSettingsAssets.success} alt="" />
      {(description ?? SETTINGS_RESULTS[title]) && <p>{description ?? SETTINGS_RESULTS[title]}</p>}
    </ProfilePage>
  )
}
