import { Check, Circle, CircleAlert, Loader2 } from 'lucide-react'
import type { SpecWorkspace } from '@/features/flow-spec/useSpecWorkspace'

export function saveStatusLabel(w: SpecWorkspace) {
  if (w.assetPending) return 'Uploading images…'
  if (w.status === 'saved' && w.imageError) return 'Saved · images unavailable'
  if (w.status === 'saved') return w.revision ? 'All changes saved' : 'Original specification'
  return {
    loading: 'Loading document…',
    dirty: 'Unsaved changes',
    saving: 'Saving…',
    error: 'Changes need attention',
    conflict: 'Newer version available',
  }[w.status]
}

export default function SpecSaveStatus({ workspace: w }: { workspace: SpecWorkspace }) {
  const busy = w.assetPending > 0 || w.status === 'saving' || w.status === 'loading'
  const warning = Boolean(w.imageError) || w.status === 'error' || w.status === 'conflict'
  const saved = w.status === 'saved' && w.revision > 0 && !warning
  const Icon = busy ? Loader2 : warning ? CircleAlert : saved ? Check : Circle
  const lastSaved = w.history[0]?.at
  return (
    <span
      className="spec-save-indicator"
      data-state={warning ? 'warning' : saved ? 'saved' : 'pending'}
      role="status"
      aria-live="polite"
      title={lastSaved ? `Last saved ${new Date(lastSaved).toLocaleString('en-GB')}` : undefined}
    >
      <Icon size={14} className={busy ? 'spec-status-spinner' : undefined} aria-hidden="true" />
      {saveStatusLabel(w)}
    </span>
  )
}
