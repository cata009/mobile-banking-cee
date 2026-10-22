import { useId, useRef, useState, type Dispatch } from 'react'
import TextField from '@/app/components/TextField'
import TextAreaField from '@/app/components/TextAreaField'
import RadioButton from '@/app/components/common/RadioButton'
import PrimaryButton from '@/app/components/PrimaryButton'
import { BottomSheet } from '@/app/components/BottomSheet'
import {
  FRAUD_REASONS,
  selectedFraudTransaction,
  type FraudAction,
  type FraudReason,
  type FraudSession,
} from '@/features/cards/fraud/model'

/** Uses the existing field + trailing camera contract; never impersonates an implemented Dropdown. */
export function FraudEvidenceFields({ state, dispatch }: { state: FraudSession; dispatch: Dispatch<FraudAction> }) {
  const [reasonsOpen, setReasonsOpen] = useState(false)
  const [pendingReason, setPendingReason] = useState<FraudReason>(state.draft.reason)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const detailsId = useId()
  const isDispute = selectedFraudTransaction(state).status === 'booked'
  const reasonLabel = isDispute ? 'Reason for dispute' : 'Reason for report'
  const openReasons = () => {
    setPendingReason(state.draft.reason)
    setReasonsOpen(true)
  }
  const readFile = (file: File | undefined) => {
    setError('')
    if (!file) return
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size === 0 ||
      file.size > 5 * 1024 * 1024
    ) {
      setError('Choose a JPEG or PNG photo up to 5 MB.')
      return
    }
    if (state.draft.attachments.length >= 3) {
      setError('You can attach up to 3 photos.')
      return
    }
    if (state.draft.attachments.some((item) => item.name === file.name)) {
      setError('This photo is already attached.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string')
        dispatch({
          type: 'attach',
          transactionId: state.selectedId,
          attachment: { name: file.name, size: file.size, type: file.type, dataUrl: reader.result },
        })
    }
    reader.onerror = () => setError('The photo could not be opened. Please choose it again.')
    reader.readAsDataURL(file)
  }
  return (
    <>
      <TextField
        label={reasonLabel}
        value={FRAUD_REASONS[state.draft.reason]}
        onChange={() => undefined}
        readOnly
        onActivate={openReasons}
        trailingIconName="chevron-down"
        trailingIconAction={{
          ariaLabel: isDispute ? 'Choose dispute reason' : 'Choose report reason',
          onClick: openReasons,
        }}
      />
      <TextAreaField
        id={detailsId}
        label="What happened? (optional)"
        value={state.draft.note}
        onChange={(note) => dispatch({ type: 'draft', note })}
        maxLength={1000}
        helperText="Up to 1000 characters. Do not include your PIN or full card number."
      />
      <TextField
        label="Supporting photos (optional)"
        value={
          state.draft.attachments.length
            ? `${state.draft.attachments.length} photo${state.draft.attachments.length === 1 ? '' : 's'} attached`
            : ''
        }
        placeholder="Take or attach a photo"
        onChange={() => undefined}
        readOnly
        onActivate={() => input.current?.click()}
        trailingIconName="payment-photo-camera"
        trailingIconAction={{ ariaLabel: 'Take or attach a supporting photo', onClick: () => input.current?.click() }}
        helperText="JPEG or PNG · up to 3 photos · 5 MB each"
      />
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        aria-label="Supporting photo file"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          readFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      {error ? (
        <p role="alert" className="fraud-error">
          {error}
        </p>
      ) : null}
      {state.draft.attachments.map((file) => (
        <div className="fraud-attachment" key={file.name}>
          <img src={file.dataUrl} alt={`Supporting photo: ${file.name}`} />
          <div>
            <strong>{file.name}</strong>
            <span>{Math.ceil(file.size / 1024)} KB · Attached locally</span>
            <button type="button" onClick={() => dispatch({ type: 'remove-attachment', name: file.name })}>
              Remove photo
            </button>
          </div>
        </div>
      ))}
      {reasonsOpen ? (
        <BottomSheet
          title={reasonLabel}
          onClose={() => setReasonsOpen(false)}
          className="px-[24px] pb-[24px]"
          footer={
            <div className="pt-[16px]">
              <PrimaryButton
                onClick={() => {
                  dispatch({ type: 'draft', reason: pendingReason })
                  setReasonsOpen(false)
                }}
              >
                OK
              </PrimaryButton>
            </div>
          }
        >
          <div role="radiogroup" aria-label={reasonLabel}>
            {(Object.entries(FRAUD_REASONS) as [FraudReason, string][]).map(([reason, label]) => (
              <RadioButton
                key={reason}
                label={label}
                selected={pendingReason === reason}
                onClick={() => setPendingReason(reason)}
                className="fraud-reason-option"
              />
            ))}
          </div>
        </BottomSheet>
      ) : null}
    </>
  )
}
