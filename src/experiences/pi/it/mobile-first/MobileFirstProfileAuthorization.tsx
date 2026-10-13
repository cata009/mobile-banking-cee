import { useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  authorizeProfileChange,
  authorizeProfilePin,
  isProfileAuthorizationLocked,
  profileSettingsStore,
} from '@/features/profile/mobileFirstProfileSettings'
import { ProfileChromeContext, ProfileButton } from './MobileFirstProfilePrimitives'
import { profileAssets as a } from './profileAssets'

export default function MobileFirstProfileAuthorization({
  onSuccess,
  onCancel,
  onForgot,
  onBiometric,
  credential = 'mobile',
}: {
  onSuccess: () => void
  onCancel: () => void
  onForgot: () => void
  onBiometric?: () => void
  credential?: 'mobile' | 'pin'
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(() =>
    isProfileAuthorizationLocked(credential) ? 'Autorizzazione temporaneamente bloccata.' : null,
  )
  const [locked, setLocked] = useState(() => isProfileAuthorizationLocked(credential))
  const settings = useSyncExternalStore(profileSettingsStore.subscribe, profileSettingsStore.getSnapshot)
  const inputRef = useRef<HTMLInputElement>(null)
  const chrome = useContext(ProfileChromeContext)
  useEffect(() => {
    chrome?.('dark')
    inputRef.current?.focus()
    return () => chrome?.('light')
  }, [chrome])
  const confirm = () => {
    const result = credential === 'pin' ? authorizeProfilePin(code) : authorizeProfileChange(code)
    if (result.valid) onSuccess()
    else {
      setError(result.error)
      setLocked(result.locked)
      setCode('')
      inputRef.current?.focus()
    }
  }
  const type = (digit: string) => {
    setCode((current) =>
      (digit === 'Delete' ? current.slice(0, -1) : current + digit).slice(0, credential === 'pin' ? 8 : 10),
    )
    setError(null)
    inputRef.current?.focus()
  }
  return (
    <main
      className="mf-home mf-profile-auth"
      lang="it"
      aria-label={credential === 'pin' ? 'Conferma PIN' : 'Conferma Mobile Code'}
    >
      <button type="button" className="mf-profile-auth-close" aria-label="Chiudi" onClick={onCancel}>
        <img src={a.auth.imgClose} alt="" />
      </button>
      <div className="mf-profile-auth-body">
        <h1>
          Inserisci il tuo
          <br />
          {credential === 'pin' ? 'PIN' : 'Mobile Code'}
        </h1>
        <input
          ref={inputRef}
          aria-label={credential === 'pin' ? 'PIN' : 'Mobile Code'}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={credential === 'pin' ? 8 : 10}
          value={code}
          disabled={locked}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !locked && code) confirm()
            if (event.key === 'Escape') onCancel()
          }}
        />
        {error && <p role="alert">{error}</p>}
        <div className="mf-profile-keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              type="button"
              key={digit}
              aria-label={`Tasto ${digit}`}
              disabled={locked}
              onClick={() => type(digit)}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            aria-label="Accesso biometrico"
            disabled={locked || !settings.biometric}
            onClick={() => {
              if (isProfileAuthorizationLocked(credential)) {
                setLocked(true)
                setError('Autorizzazione temporaneamente bloccata.')
                return
              }
              if (profileSettingsStore.getSnapshot().biometric) (onBiometric ?? onSuccess)()
            }}
          >
            <img src={a.auth.imgPath} alt="" />
          </button>
          <button type="button" aria-label="Tasto 0" disabled={locked} onClick={() => type('0')}>
            0
          </button>
          <button type="button" aria-label="Elimina cifra" disabled={locked || !code} onClick={() => type('Delete')}>
            <img src={a.auth.imgNavigationAndActionDeleteMcodeT2} alt="" />
          </button>
        </div>
        <button type="button" className="mf-profile-forgot" onClick={onForgot}>
          HO DIMENTICATO IL MOBILE CODE <img src={a.auth.imgNavigationAndActionForthK10} alt="" />
        </button>
      </div>
      <div className="mf-profile-auth-footer">
        <ProfileButton secondary disabled={locked || !code} onClick={confirm}>
          Conferma
        </ProfileButton>
      </div>
    </main>
  )
}

export function ProfileRequestResult({
  approved,
  onClose,
  login = false,
}: {
  approved: boolean
  onClose: () => void
  login?: boolean
}) {
  const chrome = useContext(ProfileChromeContext)
  useEffect(() => {
    chrome?.(approved ? 'dark' : 'light')
    return () => chrome?.('light')
  }, [approved, chrome])
  return (
    <main
      className={`mf-home mf-profile-result${approved ? '' : ' is-warning'}`}
      lang="it"
      aria-label={approved ? 'Richiesta autorizzata' : 'Richiesta non autorizzata'}
    >
      <div>
        <img
          src={
            approved
              ? a.success.imgNavigationAndActionSuccessLargeTkyPage
              : a.warning.imgNavigationAndActionFailLargeTkyPage
          }
          alt=""
        />
        <h1>{approved ? 'Richiesta autorizzata' : 'Richiesta non autorizzata'}</h1>
        <p>
          {approved
            ? login
              ? 'Verifica ora l’accesso alla tua Banca via Internet.'
              : 'Hai confermato l’operazione, verifica lo stato sulla tua Banca Via Internet.'
            : 'Non hai confermato l’operazione, verifica lo stato sulla tua Banca via Internet e segui le istruzioni indicate.'}
        </p>
      </div>
      <footer>
        <ProfileButton secondary onClick={onClose}>
          Chiudi
        </ProfileButton>
      </footer>
    </main>
  )
}
