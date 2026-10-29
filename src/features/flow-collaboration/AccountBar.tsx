import { useState, type FormEvent } from 'react'
import { platformErrorMessage, platformRequest } from './api'
import { usePlatform } from './PlatformContext'
import { Action, Field, panelClass } from './controls'
import { UserAdministration } from './UserAdministration'

export function AccountBar({ flowId, entry = false }: { flowId?: string; entry?: boolean }) {
  const { user, unavailable, refresh } = usePlatform()
  const [open, setOpen] = useState(false),
    [admin, setAdmin] = useState(false)
  const [username, setUsername] = useState(''),
    [password, setPassword] = useState(''),
    [replacement, setReplacement] = useState('')
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (user?.mustChangePassword) {
        await platformRequest('/password', { currentPassword: password, newPassword: replacement })
        setNotice('Password changed. Sign in with your new password.')
      } else await platformRequest('/login', { username, password })
      setPassword('')
      setReplacement('')
      setOpen(false)
      await refresh()
    } catch (failure) {
      setError(platformErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  const logout = async () => {
    setBusy(true)
    setError('')
    try {
      await platformRequest('/logout', {})
      setAdmin(false)
      setOpen(false)
      await refresh()
    } catch (failure) {
      setError(platformErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className={panelClass} aria-label="Personal account">
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <p>
          {user
            ? `${user.name} · ${user.role === 'admin' ? 'Admin' : user.role === 'editor' ? 'Edit' : 'View'}`
            : entry
              ? 'Personal account'
              : 'View · Shared reading access'}
        </p>
        <div className="flex flex-wrap gap-[8px]">
          {!user && (
            <Action secondary onClick={() => setOpen(!open)}>
              Personal sign in
            </Action>
          )}
          {user?.role === 'admin' && !user.mustChangePassword && (
            <Action secondary onClick={() => setAdmin(!admin)}>
              Manage users and access
            </Action>
          )}
          {user && (
            <Action secondary disabled={busy} onClick={() => void logout()}>
              Sign out
            </Action>
          )}
        </div>
      </div>
      {unavailable && (
        <p role="status" className="mt-[12px] text-sm">
          Personal accounts are currently unavailable. Reading and search remain available.
        </p>
      )}
      {notice && (
        <p role="status" className="mt-[12px]">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-[12px] text-[var(--uc-red-main)]">
          {error}
        </p>
      )}
      {(open || user?.mustChangePassword) && (
        <form onSubmit={(event) => void submit(event)} className="mt-[16px] grid max-w-[480px] gap-[12px]">
          <h2 className="uc-type-h2">
            {user?.mustChangePassword ? 'Choose your personal password' : 'Personal sign in'}
          </h2>
          {!user && (
            <Field
              label="Username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              maxLength={40}
            />
          )}
          <Field
            label={user?.mustChangePassword ? 'Temporary password' : 'Password'}
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            maxLength={128}
          />
          {user?.mustChangePassword && (
            <Field
              label="New password"
              type="password"
              autoComplete="new-password"
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
              required
              minLength={12}
              maxLength={128}
            />
          )}
          <Action type="submit" disabled={busy}>
            {busy ? 'Please wait…' : user?.mustChangePassword ? 'Change password' : 'Sign in'}
          </Action>
        </form>
      )}
      {admin && user?.role === 'admin' && !user.mustChangePassword && (
        <UserAdministration key={flowId ?? 'all'} flowId={flowId} />
      )}
    </section>
  )
}
