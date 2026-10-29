import { useCallback, useEffect, useState } from 'react'
import { platformErrorMessage, platformRequest, type Discussion, type FlowCatalog, type FlowPermissions } from './api'
import { usePlatform } from './PlatformContext'
import { Action, Choice, Multiline, panelClass } from './controls'
import { useRetainedDraft } from './drafts'

interface MessageDraft {
  message: string
  kind: string
  anchorId: string
  quote: string
  sourceSnapshot: string
}
interface Props {
  flowId: string
  suggestedAnchor?: string
  suggestedQuote?: string
}
export function DiscussionPanel(props: Props) {
  const { user, unavailable } = usePlatform()
  return (
    <section aria-label="Team discussions" className={panelClass}>
      <h2 className="uc-type-h2">Discussions and decisions</h2>
      {!user ? (
        <p className="mt-[12px]">
          {unavailable
            ? 'Collaboration is currently unavailable. You can continue reading.'
            : 'Sign in personally to read team discussions and see your flow permissions.'}
        </p>
      ) : user.mustChangePassword ? (
        <p>Change your temporary password above before taking part.</p>
      ) : (
        <TeamDiscussion key={`${user.id}:${props.flowId}:${user.role}`} {...props} userId={user.id} />
      )}
    </section>
  )
}

function TeamDiscussion({ flowId, suggestedAnchor, suggestedQuote, userId }: Props & { userId: string }) {
  const base = `/flows/${flowId}`
  const [data, setData] = useState<{
    permissions: FlowPermissions
    catalog: FlowCatalog
    threads: Discussion[]
    nextCursor: string | null
  } | null>(null)
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('all')
  const draftKey = `${userId}:${flowId}`
  const [draft, setDraft, clearDraft] = useRetainedDraft<MessageDraft>(`message:${draftKey}`, () => ({
    message: '',
    kind: 'comment',
    anchorId: suggestedAnchor ?? '',
    quote: suggestedQuote ?? '',
    sourceSnapshot: '',
  }))
  const { message, kind, anchorId, quote } = draft
  const [people, setPeople] = useState<Array<{ id: string; name: string }>>([])
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const [permissions, catalog, discussions] = await Promise.all([
        platformRequest<FlowPermissions>(`${base}/permissions`, undefined, 'GET', signal),
        platformRequest<FlowCatalog>(`${base}/catalog`, undefined, 'GET', signal),
        platformRequest<{ threads: Discussion[]; nextCursor: string | null }>(
          `${base}/threads`,
          undefined,
          'GET',
          signal,
        ),
      ])
      if (signal?.aborted) return
      setData({ permissions, catalog, ...discussions })
      setError('')
      if (permissions.canEdit) {
        const members = await platformRequest<{ users: Array<{ id: string; name: string }> }>(
          `${base}/collaborators`,
          undefined,
          'GET',
          signal,
        )
        if (!signal?.aborted) setPeople(members.users)
      }
    },
    [base],
  )
  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal).catch((e) => {
      if (!controller.signal.aborted) setError(platformErrorMessage(e))
    })
    return () => controller.abort()
  }, [load])
  const anchor = data?.catalog.anchors.find((a) => a.id === anchorId) ?? data?.catalog.anchors[0]
  const patchDraft = (change: Partial<MessageDraft>) =>
    setDraft((current) => ({
      ...current,
      anchorId: current.anchorId || anchor?.id || '',
      quote: current.quote || anchor?.text.slice(0, 2000) || '',
      sourceSnapshot: current.sourceSnapshot || data?.catalog.sourceSnapshot || '',
      ...change,
    }))
  useEffect(() => {
    if (suggestedAnchor)
      setDraft((current) =>
        current.message
          ? current
          : { ...current, anchorId: suggestedAnchor, quote: suggestedQuote ?? '', sourceSnapshot: '' },
      )
  }, [suggestedAnchor, suggestedQuote, setDraft])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (message.trim()) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [message])
  const create = async () => {
    if (!data || !anchor) return
    setBusy(true)
    setError('')
    try {
      const thread = await platformRequest<Discussion>(`${base}/threads`, {
        kind,
        anchorId: draft.anchorId || anchor.id,
        quote: quote || anchor.text.slice(0, 2000),
        sourceSnapshot: draft.sourceSnapshot || data.catalog.sourceSnapshot,
        text: message,
      })
      setData((current) => (current ? { ...current, threads: [thread, ...current.threads] } : current))
      clearDraft()
    } catch (failure) {
      setError(platformErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  const updated = (thread: Discussion) =>
    setData((current) =>
      current ? { ...current, threads: current.threads.map((t) => (t.id === thread.id ? thread : t)) } : current,
    )
  return (
    <div className="mt-[16px] grid gap-[16px]">
      <Action secondary onClick={() => void load().catch((failure) => setError(platformErrorMessage(failure)))}>
        Refresh discussions
      </Action>
      {error && <p role="alert">{error}</p>}
      {!data && !error && <p role="status">Loading discussions…</p>}
      {data && (
        <>
          <p>You have {data.permissions.canEdit ? 'Edit' : 'View'} access to this flow.</p>
          {draft.sourceSnapshot && draft.sourceSnapshot !== data.catalog.sourceSnapshot && (
            <div role="status">
              <p>Your unsent draft refers to an older specification. Its passage and text have been kept.</p>
              <Action
                secondary
                disabled={!anchor || !anchor.text.includes(quote)}
                onClick={() => patchDraft({ sourceSnapshot: data.catalog.sourceSnapshot })}
              >
                Use current context for this draft
              </Action>
            </div>
          )}
          {data.permissions.canComment && anchor && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void create()
              }}
              className="grid gap-[12px]"
            >
              <Choice label="Discussion type" value={kind} onChange={(e) => patchDraft({ kind: e.target.value })}>
                <option value="comment">Comment</option>
                <option value="question">Question to decide</option>
              </Choice>
              <Choice
                label="Passage or step"
                value={draft.anchorId || anchor.id}
                onChange={(e) => {
                  const selected = data.catalog.anchors.find((a) => a.id === e.target.value)!
                  patchDraft({
                    anchorId: selected.id,
                    quote: selected.text.slice(0, 2000),
                    sourceSnapshot: data.catalog.sourceSnapshot,
                  })
                }}
              >
                {draft.anchorId && !data.catalog.anchors.some((a) => a.id === draft.anchorId) && (
                  <option value={draft.anchorId}>Original passage (not in current context)</option>
                )}
                {data.catalog.anchors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} — {a.text.slice(0, 80)}
                  </option>
                ))}
              </Choice>
              <Multiline
                label="Quoted passage"
                value={quote || anchor.text.slice(0, 2000)}
                maxLength={2000}
                onChange={(e) => patchDraft({ quote: e.target.value })}
              />
              <Multiline
                label="New message"
                value={message}
                required
                maxLength={8000}
                onChange={(e) => {
                  patchDraft({ message: e.target.value })
                }}
              />
              <Action type="submit" disabled={busy || !message.trim()}>
                {busy ? 'Posting…' : `Post ${kind}`}
              </Action>
            </form>
          )}
          <Choice label="Discussion status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All discussions</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </Choice>
          {data.threads
            .filter((t) => status === 'all' || t.status === status)
            .map((thread) => (
              <ThreadView
                key={`${userId}:${thread.id}`}
                flowId={flowId}
                userId={userId}
                thread={thread}
                canComment={data.permissions.canComment}
                canEdit={data.permissions.canEdit}
                people={people}
                onUpdated={updated}
              />
            ))}
          {!data.threads.length && <p>No discussions yet.</p>}
          {data.nextCursor && (
            <Action
              secondary
              onClick={() => {
                void platformRequest<{ threads: Discussion[]; nextCursor: string | null }>(
                  `${base}/threads?cursor=${encodeURIComponent(data.nextCursor!)}`,
                )
                  .then((page) =>
                    setData((current) =>
                      current
                        ? {
                            ...current,
                            threads: [
                              ...current.threads,
                              ...page.threads.filter((t) => !current.threads.some((existing) => existing.id === t.id)),
                            ],
                            nextCursor: page.nextCursor,
                          }
                        : current,
                    ),
                  )
                  .catch((failure) => setError(platformErrorMessage(failure)))
              }}
            >
              Load older discussions
            </Action>
          )}
        </>
      )}
    </div>
  )
}

function ThreadView({
  flowId,
  userId,
  thread,
  canComment,
  canEdit,
  people,
  onUpdated,
}: {
  flowId: string
  userId: string
  thread: Discussion
  canComment: boolean
  canEdit: boolean
  people: Array<{ id: string; name: string }>
  onUpdated: (thread: Discussion) => void
}) {
  const key = `${userId}:${flowId}:${thread.id}`
  const [replyDraft, setReplyDraft, clearReply] = useRetainedDraft(`reply:${key}`, () => ({
    text: '',
    baseVersion: thread.version,
  }))
  const [editDraft, setEditDraft] = useRetainedDraft(`decision:${key}`, () => ({
    decision: thread.decision,
    ownerId: thread.owner?.id ?? '',
    baseVersion: thread.version,
    dirty: false,
  }))
  const decision = editDraft.dirty ? editDraft.decision : thread.decision
  const ownerId = editDraft.dirty ? editDraft.ownerId : (thread.owner?.id ?? '')
  const reply = replyDraft.text
  useEffect(() => {
    setEditDraft((current) =>
      current.dirty
        ? current
        : { decision: thread.decision, ownerId: thread.owner?.id ?? '', baseVersion: thread.version, dirty: false },
    )
  }, [thread.decision, thread.owner?.id, thread.version, setEditDraft])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (replyDraft.text || editDraft.dirty) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [replyDraft.text, editDraft.dirty])
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  const mutate = async (body: unknown, replies = false) => {
    setBusy(true)
    setError('')
    try {
      const result = await platformRequest<Discussion>(
        `/flows/${flowId}/threads/${thread.id}${replies ? '/replies' : ''}`,
        {
          expectedVersion: replies ? replyDraft.baseVersion : editDraft.dirty ? editDraft.baseVersion : thread.version,
          ...(body as object),
        },
        replies ? 'POST' : 'PATCH',
      )
      onUpdated(result)
      if (replies) clearReply()
      else
        setEditDraft({
          decision: result.decision,
          ownerId: result.owner?.id ?? '',
          baseVersion: result.version,
          dirty: false,
        })
    } catch (failure) {
      setError(platformErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  const question = thread.kind === 'question'
  return (
    <article
      aria-label={`${question ? 'Question' : 'Comment'}: ${thread.messages[0]?.text ?? ''}`}
      className="grid gap-[12px] rounded border border-[var(--uc-border)] p-[16px]"
    >
      <div className="flex flex-wrap justify-between gap-[8px]">
        <h3 className="font-bold">{question ? 'Question' : 'Comment'}</h3>
        <span>{thread.status === 'open' ? 'Open' : 'Resolved'}</span>
      </div>
      <blockquote className="whitespace-pre-wrap border-l-2 border-[var(--uc-border)] pl-[12px]">
        {thread.quote}
      </blockquote>
      {thread.stale && (
        <p role="status">This discussion refers to an older specification context. The original quote is retained.</p>
      )}
      {thread.owner && <p>Responsible: {thread.owner.name}</p>}
      {thread.messages.map((message) => (
        <div key={message.id}>
          <p className="text-sm">
            {message.author.name} ·{' '}
            <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString()}</time>
          </p>
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        </div>
      ))}
      {thread.decision && (
        <div>
          <p className="font-bold">Recorded decision</p>
          <p className="whitespace-pre-wrap">{thread.decision}</p>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {editDraft.dirty && editDraft.baseVersion !== thread.version && (
        <div role="status">
          <p>A newer decision or assignment is shown above. Compare it with your retained draft before reapplying.</p>
          <Action secondary onClick={() => setEditDraft((current) => ({ ...current, baseVersion: thread.version }))}>
            Reapply my draft to current version
          </Action>
        </div>
      )}
      {replyDraft.text && replyDraft.baseVersion !== thread.version && (
        <div role="status">
          <p>Your reply was drafted before the latest change.</p>
          <Action secondary onClick={() => setReplyDraft((current) => ({ ...current, baseVersion: thread.version }))}>
            Reapply reply to current version
          </Action>
        </div>
      )}
      {canComment && thread.status === 'open' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void mutate({ text: reply }, true)
          }}
          className="grid gap-[8px]"
        >
          <Multiline
            label="Reply"
            value={reply}
            required
            maxLength={8000}
            onChange={(e) =>
              setReplyDraft((current) => ({
                text: e.target.value,
                baseVersion: current.text ? current.baseVersion : thread.version,
              }))
            }
          />
          <Action type="submit" disabled={busy || !reply.trim()}>
            Post reply
          </Action>
        </form>
      )}
      {canEdit && (
        <div className="grid gap-[12px]">
          {question && (
            <>
              <Choice
                label="Responsible person"
                value={ownerId}
                onChange={(e) => setEditDraft((current) => ({ ...current, ownerId: e.target.value, dirty: true }))}
              >
                {!people.some((p) => p.id === ownerId) && (
                  <option value={ownerId}>{thread.owner?.name ?? 'Choose a person'}</option>
                )}
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Choice>
              <Multiline
                label="Final decision"
                value={decision}
                maxLength={8000}
                onChange={(e) => setEditDraft((current) => ({ ...current, decision: e.target.value, dirty: true }))}
              />
              <Action
                secondary
                disabled={busy || !ownerId}
                onClick={() => void mutate({ ownerId, ...(decision.trim() ? { decision } : {}) })}
              >
                Save owner and decision
              </Action>
            </>
          )}
          <Action
            secondary
            disabled={busy || (thread.status === 'open' && question && !decision.trim())}
            onClick={() =>
              void mutate({
                status: thread.status === 'open' ? 'resolved' : 'open',
                ...(question && decision.trim() ? { decision } : {}),
              })
            }
          >
            {thread.status === 'resolved' ? 'Reopen discussion' : question ? 'Resolve question' : 'Resolve discussion'}
          </Action>
        </div>
      )}
    </article>
  )
}
