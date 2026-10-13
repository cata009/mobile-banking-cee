import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useDemo } from '@/app/state/demoStore'
import { getProfileDataSnapshot, subscribeProfileData } from '@/features/profile/mobileFirstProfileData'
import { profileSettingsStore } from '@/features/profile/mobileFirstProfileSettings'
import { profileHubStore } from '@/features/profile/mobileFirstProfile'
import { LogosBuddyHorizontal } from './assets'
import { ProfileButton, ProfileChromeContext, ProfileHelpContext } from './MobileFirstProfilePrimitives'
import MobileFirstProfileAuthorization from './MobileFirstProfileAuthorization'
import { profileAssets as a } from './profileAssets'
import './mobile-first-profile.css'

export interface MobileFirstProfileLoginProps {
  onLogin: () => void
  onForgotCode?: () => void
  onToken?: () => void
  onSupport?: () => void
  onPayments?: () => void
  onPhoneChromeChange?: (variant: 'light' | 'dark') => void
}
export default function MobileFirstProfileLogin({
  onLogin,
  onForgotCode,
  onToken,
  onSupport,
  onPayments,
  onPhoneChromeChange,
}: MobileFirstProfileLoginProps) {
  const [authenticate, setAuthenticate] = useState(false)
  const data = useSyncExternalStore(subscribeProfileData, getProfileDataSnapshot)
  const settings = useSyncExternalStore(profileSettingsStore.subscribe, profileSettingsStore.getSnapshot)
  const { amountsHidden, toggleAmountsHidden } = useDemo()
  const english = settings.language === 'English' || settings.language === 'Inglese'
  const callback = useRef(onPhoneChromeChange)
  callback.current = onPhoneChromeChange
  const chrome = useCallback((variant: 'light' | 'dark') => callback.current?.(variant), [])
  useEffect(() => {
    chrome('dark')
    return () => chrome('light')
  }, [chrome])
  const recover = onForgotCode ?? onSupport ?? (() => setAuthenticate(true))
  const login = () => {
    profileHubStore.dispatch({
      type: 'persona',
      id: settings.preferredProfile === 'buddy' ? 'buddy-personal' : 'uci-personal',
    })
    onLogin()
  }
  return (
    <ProfileChromeContext.Provider value={chrome}>
      <ProfileHelpContext.Provider value={onSupport ?? null}>
        {authenticate ? (
          <MobileFirstProfileAuthorization
            credential="pin"
            onSuccess={login}
            onCancel={() => setAuthenticate(false)}
            onForgot={recover}
          />
        ) : (
          <main className="mf-home mf-profile-login" lang={english ? 'en' : 'it'} aria-label="Accesso Mobile First">
            <div className="mf-profile-login-images" aria-hidden="true">
              <img src={a.login.imgLogin} alt="" />
              <img src={a.login.imgLogin1} alt="" />
              <img src={a.login.imgLogin2} alt="" />
            </div>
            <header>
              {settings.preferredProfile === 'buddy' ? (
                <span role="img" aria-label="buddy">
                  <LogosBuddyHorizontal className="mf-profile-login-buddy" />
                </span>
              ) : (
                <img src={a.login.imgZSystemLogoUnicreditBank} alt="UniCredit Bank" />
              )}
              <img className="mf-profile-login-avatar" src={a.login.imgAvatar} alt="" />
            </header>
            <div className="mf-profile-login-languages">
              {['Italiano', 'English'].map((language) => (
                <button
                  type="button"
                  key={language}
                  aria-pressed={settings.language === language}
                  onClick={() => profileSettingsStore.update({ language })}
                >
                  {language === 'Italiano' ? 'IT' : 'EN'}
                </button>
              ))}
            </div>
            <section className="mf-profile-login-panel">
              <h1>
                {english ? 'Welcome back' : 'Bentornato'} {data.firstName}
              </h1>
              <ProfileButton secondary onClick={() => setAuthenticate(true)}>
                {english ? 'Login' : 'Accedi'}
              </ProfileButton>
              <button type="button" className="mf-profile-login-text" onClick={toggleAmountsHidden}>
                {english
                  ? amountsHidden
                    ? 'HIDE “AMOUNTS” ACTIVE'
                    : 'HIDE “AMOUNTS”'
                  : amountsHidden
                    ? 'IMPORTI NASCOSTI'
                    : 'NASCONDI IMPORTI'}
                <img src={a.login.imgNavigationAndActionHideWhite} alt="" />
              </button>
              <button type="button" className="mf-profile-login-text" onClick={recover}>
                {english ? 'DID YOU FORGOT YOUR PASSWORD?' : 'HAI DIMENTICATO IL CODICE?'}
                <img src={a.login.imgNavigationAndActionForthK1} alt="" />
              </button>
              <div className="mf-profile-login-actions">
                <button type="button" onClick={onPayments ?? (() => setAuthenticate(true))}>
                  {english ? 'NEW PAYMENT' : 'PAGA'} ›
                </button>
                <button type="button" onClick={onToken ?? (() => setAuthenticate(true))}>
                  MTOKEN ›
                </button>
                <button type="button" onClick={onSupport ?? recover}>
                  {english ? 'OTHER' : 'ALTRO'} ›
                </button>
              </div>
            </section>
          </main>
        )}
      </ProfileHelpContext.Provider>
    </ProfileChromeContext.Provider>
  )
}
