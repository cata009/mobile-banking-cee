import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { platformErrorMessage, platformRequest, type PersonalUser } from './api'
import { usePlatform } from './PlatformContext'
import { Action, Choice, Field } from './controls'

interface ManagedUser extends PersonalUser {
  disabled: boolean
}
interface Grant {
  userId: string
  role: 'viewer' | 'editor'
  canComment: boolean
}
export function UserAdministration({ flowId }: { flowId?: string }) {
  const { refresh } = usePlatform()
  const [users, setUsers] = useState<ManagedUser[]>([]),
    [grants, setGrants] = useState<Grant[]>([])
  const [username, setUsername] = useState(''),
    [name, setName] = useState(''),
    [role, setRole] = useState('viewer')
  const [temporary, setTemporary] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const [members, access] = await Promise.all([
        platformRequest<{ users: ManagedUser[] }>('/users', undefined, 'GET', signal),
        flowId
          ? platformRequest<{ grants: Grant[] }>(`/flows/${flowId}/access`, undefined, 'GET', signal)
          : Promise.resolve({ grants: [] }),
      ])
      if (!signal?.aborted) {
        setUsers(members.users)
        setGrants(access.grants)
      }
    },
    [flowId],
  )
  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal).catch((e) => {
      if (!controller.signal.aborted) setError(platformErrorMessage(e))
    })
    return () => controller.abort()
  }, [load])
  const run = async (operation: () => Promise<void>) => {
    setBusy(true)
    setError('')
    setTemporary('')
    try {
      await operation()
      await load()
    } catch (failure) {
      setError(platformErrorMessage(failure))
    } finally {
      await refresh()
      setBusy(false)
    }
  }
  const create = (event: FormEvent) => {
    event.preventDefault()
    void run(async () => {
      const result = await platformRequest<{ temporaryPassword: string }>('/users', { username, name, role })
      setTemporary(`${username}: ${result.temporaryPassword}`)
      setUsername('')
      setName('')
    })
  }
  return (
    <div className="mt-[20px] grid gap-[16px] border-t border-[var(--uc-border)] pt-[20px]">
      <h2 className="uc-type-h2">Users and flow access</h2>
      <p className="text-sm">
        Global roles provide defaults. A flow override changes View/Edit for this flow; Admin always retains full
        access.
      </p>
      {error && <p role="alert">{error}</p>}
      {temporary && (
        <div role="status" className="break-all rounded border border-[var(--uc-border)] p-[12px]">
          Temporary password, shown once: <code>{temporary}</code>
          <p>Deliver it privately. The user must change it at first sign-in.</p>
          <Action secondary onClick={() => setTemporary('')}>
            Dismiss password
          </Action>
        </div>
      )}
      <form onSubmit={create} className="grid gap-[12px] sm:grid-cols-2">
        <Field
          label="New username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          pattern="[a-zA-Z0-9_.-]{3,40}"
          maxLength={40}
        />
        <Field label="Display name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
        <Choice label="Default role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="viewer">View</option>
          <option value="editor">Edit</option>
          <option value="admin">Admin</option>
        </Choice>
        <Action type="submit" disabled={busy}>
          Create account
        </Action>
      </form>
      {users.map((user) => (
        <UserRow
          key={`${user.id}-${user.role}-${user.disabled}-${JSON.stringify(grants.find((g) => g.userId === user.id))}`}
          user={user}
          grant={grants.find((g) => g.userId === user.id)}
          flowId={flowId}
          busy={busy}
          run={run}
          showPassword={setTemporary}
        />
      ))}
    </div>
  )
}

function UserRow({
  user,
  grant,
  flowId,
  busy,
  run,
  showPassword,
}: {
  user: ManagedUser
  grant?: Grant
  flowId?: string
  busy: boolean
  run: (fn: () => Promise<void>) => Promise<void>
  showPassword: (value: string) => void
}) {
  const [globalRole, setGlobalRole] = useState(user.role),
    [disabled, setDisabled] = useState(user.disabled)
  const [flowRole, setFlowRole] = useState(grant?.role ?? 'default'),
    [comment, setComment] = useState(grant?.canComment ?? false)
  return (
    <article
      className="grid gap-[12px] rounded border border-[var(--uc-border)] p-[16px]"
      aria-label={`Manage ${user.username}`}
    >
      <h3 className="font-bold">
        {user.name} · {user.username}
        {user.disabled ? ' · Disabled' : ''}
      </h3>
      <div className="grid items-end gap-[12px] sm:grid-cols-3">
        <Choice
          label={`Global role for ${user.username}`}
          value={globalRole}
          onChange={(e) => setGlobalRole(e.target.value as PersonalUser['role'])}
        >
          <option value="viewer">View</option>
          <option value="editor">Edit</option>
          <option value="admin">Admin</option>
        </Choice>
        <label className="flex min-h-[44px] items-center gap-[8px]">
          <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
          Disable {user.username}
        </label>
        <Action
          secondary
          disabled={busy}
          onClick={() =>
            void run(async () => {
              await platformRequest(`/users/${user.id}`, { role: globalRole, disabled }, 'PATCH')
            })
          }
        >
          Save account
        </Action>
      </div>
      {flowId && user.role !== 'admin' && (
        <div className="grid items-end gap-[12px] sm:grid-cols-3">
          <Choice
            label={`Flow role for ${user.username}`}
            value={flowRole}
            onChange={(e) => setFlowRole(e.target.value)}
          >
            <option value="default">Use default</option>
            <option value="viewer">View this flow</option>
            <option value="editor">Edit this flow</option>
          </Choice>
          <label className="flex min-h-[44px] items-center gap-[8px]">
            <input
              type="checkbox"
              checked={comment || flowRole === 'editor'}
              disabled={flowRole === 'default' || flowRole === 'editor'}
              onChange={(e) => setComment(e.target.checked)}
            />
            Allow {user.username} to comment
          </label>
          <Action
            secondary
            disabled={busy}
            onClick={() =>
              void run(async () => {
                await platformRequest(
                  `/flows/${flowId}/access`,
                  flowRole === 'default'
                    ? { userId: user.id }
                    : { userId: user.id, role: flowRole, canComment: comment || flowRole === 'editor' },
                  flowRole === 'default' ? 'DELETE' : 'PUT',
                )
              })
            }
          >
            Save flow access
          </Action>
        </div>
      )}
      <Action
        secondary
        disabled={busy}
        onClick={() =>
          void run(async () => {
            const result = await platformRequest<{ temporaryPassword: string }>(`/users/${user.id}/reset-password`, {})
            showPassword(`${user.username}: ${result.temporaryPassword}`)
          })
        }
      >
        Reset password for {user.username}
      </Action>
    </article>
  )
}
