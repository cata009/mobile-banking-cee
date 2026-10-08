import { useReducer } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import PrimaryButton from '@/app/components/PrimaryButton'
import { AppIcon } from '@/app/components/icons'
import { Calendar } from '@/app/components/ui/calendar'
import { formatScheduleDate, SCHEDULE_REPEAT_OPTIONS, toIsoDateOnly } from '@/app/utils/scheduleFormatting'
import type { ScheduleConfig, ScheduleEnd, ScheduleRepeat } from '@/app/screens/kids/hu/types'
import { createHuScheduleState, huScheduleReducer } from '@/app/screens/kids/hu/huScheduleState'

export function ScheduleSheet({
  initialSchedule,
  onClose,
  onConfirm,
  onReset,
}: {
  initialSchedule?: ScheduleConfig | null
  onClose: () => void
  onConfirm: (config: ScheduleConfig) => void
  onReset?: () => void
}) {
  const todayIso = toIsoDateOnly(new Date())
  const [scheduleState, dispatchSchedule] = useReducer(
    huScheduleReducer,
    createHuScheduleState(todayIso, initialSchedule),
  )
  const { startDate, repeat, endsOn, datePickerTarget, repeatPickerOpen, endsPickerOpen } = scheduleState
  const setRepeat = (value: ScheduleRepeat) => dispatchSchedule({ type: 'set-field', field: 'repeat', value })
  const setEndsOn = (value: ScheduleEnd) => dispatchSchedule({ type: 'set-field', field: 'endsOn', value })
  const setDatePickerTarget = (value: null | 'start' | 'end') =>
    dispatchSchedule({ type: 'set-field', field: 'datePickerTarget', value })
  const setRepeatPickerOpen = (value: boolean) =>
    dispatchSchedule({ type: 'set-field', field: 'repeatPickerOpen', value })
  const setEndsPickerOpen = (value: boolean) => dispatchSchedule({ type: 'set-field', field: 'endsPickerOpen', value })

  const handleConfirm = () => {
    onConfirm({ startDate, repeat, endsOn })
    onClose()
  }

  const repeatLabel = SCHEDULE_REPEAT_OPTIONS.find((opt) => opt.id === repeat)?.label ?? 'Never'

  return (
    <>
      <BottomSheet title="Schedule" onClose={onClose} closeLabel="Close schedule" fillHeight>
        <div className="flex h-full flex-col gap-[16px] pb-[24px]">
          {/* Start date */}
          <div>
            <p className="mb-[6px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
              Start date
            </p>
            <button
              type="button"
              onClick={() => setDatePickerTarget('start')}
              className="flex h-[48px] w-full items-center justify-between rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px]"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                {formatScheduleDate(startDate)}
              </span>
              <AppIcon name="chevron-down" size={18} color="var(--uc-text-muted)" />
            </button>
          </div>

          {/* Repeat */}
          <div>
            <p className="mb-[6px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
              Repeat
            </p>
            <button
              type="button"
              onClick={() => setRepeatPickerOpen(true)}
              className="flex h-[48px] w-full items-center justify-between rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px]"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                {repeatLabel}
              </span>
              <AppIcon name="chevron-down" size={18} color="var(--uc-text-muted)" />
            </button>
          </div>

          {/* Ends on — only relevant when repeating */}
          {repeat !== 'never' ? (
            <div>
              <p className="mb-[6px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
                Ends on
              </p>
              <button
                type="button"
                onClick={() => setEndsPickerOpen(true)}
                className="flex h-[48px] w-full items-center justify-between rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px]"
              >
                <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                  {endsOn.type === 'on-date' ? formatScheduleDate(endsOn.date) : 'Never'}
                </span>
                <AppIcon name="chevron-down" size={18} color="var(--uc-text-muted)" />
              </button>
            </div>
          ) : null}

          {/* Reset (only when a schedule is already set) + Confirm, anchored
              to the bottom of the sheet via mt-auto. */}
          <div className="mt-auto flex flex-col gap-[8px] pt-[16px]">
            {initialSchedule && onReset ? (
              <button
                type="button"
                onClick={() => {
                  onReset()
                  onClose()
                }}
                className="h-[44px] w-full rounded-[12px] bg-transparent uc-type-n5-strong leading-[18px] text-[var(--uc-status-red)]"
              >
                Reset schedule
              </button>
            ) : null}
            <PrimaryButton className="!h-[48px] !w-full" onClick={handleConfirm}>
              Confirm
            </PrimaryButton>
          </div>
        </div>
      </BottomSheet>

      {/* Calendar as a mini bottom sheet layered over the schedule sheet.
          Rendered as a sibling (not a child) so its overlay anchors to the
          phone frame, not to the schedule sheet body. */}
      {datePickerTarget ? (
        <BottomSheet
          title={datePickerTarget === 'start' ? 'Select start date' : 'Select end date'}
          onClose={() => setDatePickerTarget(null)}
          closeLabel="Close calendar"
        >
          <div className="w-full pb-[8px]">
            <Calendar
              className="w-full"
              mode="single"
              disabled={{ before: new Date() }}
              selected={
                new Date(
                  `${datePickerTarget === 'start' ? startDate : endsOn.type === 'on-date' ? endsOn.date : todayIso}T00:00:00`,
                )
              }
              onSelect={(date) => {
                if (!date) return
                const iso = toIsoDateOnly(date)
                dispatchSchedule({ type: 'select-date', date: iso })
              }}
            />
          </div>
        </BottomSheet>
      ) : null}

      {/* Repeat picker as a mini bottom sheet layered over the schedule sheet. */}
      {repeatPickerOpen ? (
        <BottomSheet title="Repeat" onClose={() => setRepeatPickerOpen(false)} closeLabel="Close repeat picker">
          <div className="flex flex-col">
            {SCHEDULE_REPEAT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setRepeat(opt.id)
                  setRepeatPickerOpen(false)
                }}
                className="flex w-full items-center justify-between border-b border-[var(--uc-border-muted)] py-[14px] text-left last:border-b-0"
              >
                <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                  {opt.label}
                </span>
                {repeat === opt.id ? <AppIcon name="radio-selected" size={20} color="var(--uc-action)" /> : null}
              </button>
            ))}
          </div>
        </BottomSheet>
      ) : null}

      {/* Ends-on picker as a mini bottom sheet. "On a date" opens the calendar. */}
      {endsPickerOpen ? (
        <BottomSheet title="Ends on" onClose={() => setEndsPickerOpen(false)} closeLabel="Close ends-on picker">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => {
                setEndsOn({ type: 'never' })
                setEndsPickerOpen(false)
              }}
              className="flex w-full items-center justify-between border-b border-[var(--uc-border-muted)] py-[14px] text-left"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">Never</span>
              {endsOn.type === 'never' ? <AppIcon name="radio-selected" size={20} color="var(--uc-action)" /> : null}
            </button>
            <button
              type="button"
              onClick={() => {
                dispatchSchedule({ type: 'open-end-date', fallbackDate: todayIso })
              }}
              className="flex w-full items-center justify-between py-[14px] text-left"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                {endsOn.type === 'on-date' ? formatScheduleDate(endsOn.date) : 'On a date'}
              </span>
              {endsOn.type === 'on-date' ? <AppIcon name="radio-selected" size={20} color="var(--uc-action)" /> : null}
            </button>
          </div>
        </BottomSheet>
      ) : null}
    </>
  )
}
