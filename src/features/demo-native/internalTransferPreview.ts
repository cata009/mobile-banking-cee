import type { Currency } from '@/data/products'
import type { ScheduleConfig } from '@/data/schedule'
import type { InternalTransferDraft } from '@/app/screens/payments/internalTransferState'

/** Serialized Source-owned internal-transfer draft; no UI or account objects cross the preview boundary. */
export type NativeInternalTransferDraft = InternalTransferDraft

export interface NativeInternalTransferReceipt {
  sourceAccountId: string
  destinationAccountId: string
  sourceAccountName: string
  destinationAccountName: string
  amount: number
  currency: Currency
  note: string
  schedule: ScheduleConfig | null
}

/** Fullscreen Native composition of the Source internal-transfer flow. */
export interface NativeInternalTransferPreview {
  kind: 'internal-transfer'
  initialDraft?: NativeInternalTransferDraft
  initialSchedule?: ScheduleConfig | null
  requireSchedule?: boolean
  isEditing?: boolean
  submitLabel?: string
  onDoneAvailable?: boolean
  onEditScheduleAvailable?: boolean
}

export type NativeInternalTransferEvent =
  | { type: 'back'; draft?: NativeInternalTransferDraft }
  | { type: 'done' }
  | { type: 'edit-schedule'; draft: NativeInternalTransferDraft }
  | { type: 'complete'; receipt: NativeInternalTransferReceipt }
