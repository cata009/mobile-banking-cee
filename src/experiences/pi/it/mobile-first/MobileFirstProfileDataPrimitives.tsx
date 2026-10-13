import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type KeyboardEvent } from 'react'
import {
  verifyProfileDataOtp,
  getProfileDataSnapshot,
  subscribeProfileData,
} from '@/features/profile/mobileFirstProfileData'
import { ProfileButton, ProfileField, ProfilePage } from './MobileFirstProfilePrimitives'
import { profileDataAssets } from './profileDataAssets'
import MobileFirstProfileAuthorization from './MobileFirstProfileAuthorization'
export function useProfileData() {
  return useSyncExternalStore(subscribeProfileData, getProfileDataSnapshot, getProfileDataSnapshot)
}
export function DataSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState(value)
  const sheetRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (open) sheetRef.current?.querySelector('input')?.focus()
  }, [open])
  const onEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
    }
  }
  const show = () => {
    setDraft(value)
    setOpen(true)
  }
  return (
    <>
      <label className="mf-profile-field">
        <span>{label}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onMouseDown={(e) => {
            e.preventDefault()
            show()
          }}
          onKeyDown={(e) => {
            if (['Enter', ' '].includes(e.key)) {
              e.preventDefault()
              show()
            }
          }}
        >
          <option value="">Seleziona</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      {open && (
        <div className="mfpd-select-backdrop" role="presentation">
          <section ref={sheetRef} role="dialog" aria-modal="true" aria-label={label} className="mfpd-select-sheet">
            <div className="mfpd-select-grip" />
            <button
              className="mfpd-select-close"
              aria-label="Chiudi selezione"
              onKeyDown={onEscape}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <h2>{label}</h2>
            <div className="mfpd-select-options">
              {options.map((option) => (
                <label className="mfpd-option" key={option}>
                  <input
                    type="radio"
                    name={`choice-${label}`}
                    onKeyDown={onEscape}
                    checked={draft === option}
                    onChange={() => setDraft(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
            <ProfileButton
              onKeyDown={onEscape}
              disabled={!draft}
              onClick={() => {
                onChange(draft)
                setOpen(false)
              }}
            >
              Conferma
            </ProfileButton>
          </section>
        </div>
      )}
    </>
  )
}
export function DataCheck({
  children,
  checked,
  onChange,
}: {
  children: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="mfpd-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  )
}
export function DataAuthorize({
  otp = false,
  onBack,
  onClose,
  onConfirm,
}: {
  otp?: boolean
  onBack: () => void
  onClose: () => void
  onConfirm: () => void
}) {
  const [code, setCode] = useState(''),
    [error, setError] = useState(''),
    [resent, setResent] = useState(false)
  useEffect(() => {
    setCode('')
    setError('')
    setResent(false)
  }, [otp])
  if (!otp) return <MobileFirstProfileAuthorization onSuccess={onConfirm} onCancel={onClose} onForgot={onClose} />
  return (
    <ProfilePage
      title="Inserisci il codice di verifica"
      onBack={onBack}
      onClose={onClose}
      footer={
        <ProfileButton
          disabled={code.length !== 6}
          onClick={() => {
            if (verifyProfileDataOtp(code)) onConfirm()
            else setError('Codice non corretto. Riprova.')
          }}
        >
          Conferma
        </ProfileButton>
      }
    >
      <p>Inserisci il codice di verifica che ti abbiamo inviato via SMS.</p>
      <ProfileField
        label="Codice di verifica"
        value={code}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        onChange={(e) => {
          setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
          setError('')
        }}
      />
      {error && (
        <p role="alert" className="mfpd-error">
          {error}
        </p>
      )}
      <button
        className="mfpd-link"
        onClick={() => {
          setCode('')
          setError('')
          setResent(true)
        }}
      >
        Invia di nuovo
      </button>
      {resent && <p role="status">Codice inviato.</p>}
    </ProfilePage>
  )
}
export function DataSuccess({
  title = 'Modifica effettuata con successo',
  children,
  onContinue,
  onClose,
}: {
  title?: string
  children: ReactNode
  onContinue: () => void
  onClose: () => void
}) {
  return (
    <ProfilePage
      chrome="dark"
      className="mfpd-success-page"
      title={
        <>
          <img src={profileDataAssets.success} alt="" />
          <span>{title}</span>
        </>
      }
      onClose={onClose}
      footer={<ProfileButton onClick={onContinue}>Chiudi</ProfileButton>}
    >
      <p role="status">{children}</p>
    </ProfilePage>
  )
}
