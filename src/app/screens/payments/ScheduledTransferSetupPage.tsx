import { useReducer } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AppIcon } from "@/app/components/icons";
import SelectedMark from "@/app/components/payments/SelectedMark";
import { Calendar } from "@/app/components/ui/calendar";
import { formatScheduleDate, SCHEDULE_REPEAT_OPTIONS, toIsoDateOnly } from "@/app/utils/scheduleFormatting";
import { createHuScheduleState, huScheduleReducer } from "@/app/screens/kids/hu/huScheduleState";
import type { ScheduleConfig, ScheduleEnd, ScheduleRepeat } from "@/data/schedule";

interface ScheduledTransferSetupPageProps {
  onBack: () => void;
  onConfirm: (schedule: ScheduleConfig) => void;
  initialSchedule?: ScheduleConfig | null;
  title?: string;
  confirmLabel?: string;
}

export default function ScheduledTransferSetupPage({
  onBack,
  onConfirm,
  initialSchedule,
  title = "Schedule",
  confirmLabel = "Confirm",
}: ScheduledTransferSetupPageProps) {
  const todayIso = toIsoDateOnly(new Date());
  const [scheduleState, dispatchSchedule] = useReducer(
    huScheduleReducer,
    createHuScheduleState(todayIso, initialSchedule),
  );
  const { startDate, repeat, endsOn, datePickerTarget, repeatPickerOpen, endsPickerOpen } = scheduleState;
  const repeatLabel = SCHEDULE_REPEAT_OPTIONS.find((option) => option.id === repeat)?.label ?? "Never";

  const confirm = () => onConfirm({ startDate, repeat, endsOn });

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <PageHeader title={title} onBack={onBack} includeSafeArea showHelp={false} variant="gray" />

        <main className="flex flex-col gap-[16px] px-[16px] pb-[160px] pt-[16px]">
          <div>
            <p className="mb-[6px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
              Start date
            </p>
            <button
              type="button"
              onClick={() => dispatchSchedule({ type: "set-field", field: "datePickerTarget", value: "start" })}
              className="flex h-[52px] w-full items-center justify-between rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px]"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                {formatScheduleDate(startDate)}
              </span>
              <AppIcon name="chevron-down" size={18} color="var(--uc-text-muted)" />
            </button>
          </div>

          <div>
            <p className="mb-[6px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
              Repeat
            </p>
            <button
              type="button"
              onClick={() => dispatchSchedule({ type: "set-field", field: "repeatPickerOpen", value: true })}
              className="flex h-[52px] w-full items-center justify-between rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px]"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                {repeatLabel}
              </span>
              <AppIcon name="chevron-down" size={18} color="var(--uc-text-muted)" />
            </button>
          </div>

          {repeat !== "never" ? (
            <div>
              <p className="mb-[6px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
                Ends on
              </p>
              <button
                type="button"
                onClick={() => dispatchSchedule({ type: "set-field", field: "endsPickerOpen", value: true })}
                className="flex h-[52px] w-full items-center justify-between rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px]"
              >
                <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                  {endsOn.type === "on-date" ? formatScheduleDate(endsOn.date) : "Never"}
                </span>
                <AppIcon name="chevron-down" size={18} color="var(--uc-text-muted)" />
              </button>
            </div>
          ) : null}
        </main>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-[var(--uc-app-bg)] px-[16px] pb-[42px] pt-[16px]">
        <PrimaryButton className="w-full" onClick={confirm}>
          {confirmLabel}
        </PrimaryButton>
      </div>

      {datePickerTarget ? (
        <BottomSheet
          title={datePickerTarget === "start" ? "Select start date" : "Select end date"}
          onClose={() => dispatchSchedule({ type: "set-field", field: "datePickerTarget", value: null })}
          closeLabel="Close calendar"
        >
          <div className="w-full pb-[8px]">
            <Calendar
              className="w-full"
              mode="single"
              disabled={{ before: new Date() }}
              selected={new Date(`${datePickerTarget === "start" ? startDate : endsOn.type === "on-date" ? endsOn.date : todayIso}T00:00:00`)}
              onSelect={(date) => {
                if (date) dispatchSchedule({ type: "select-date", date: toIsoDateOnly(date) });
              }}
            />
          </div>
        </BottomSheet>
      ) : null}

      {repeatPickerOpen ? (
        <BottomSheet
          title="Repeat"
          onClose={() => dispatchSchedule({ type: "set-field", field: "repeatPickerOpen", value: false })}
          closeLabel="Close repeat picker"
        >
          <div className="flex flex-col">
            {SCHEDULE_REPEAT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  dispatchSchedule({ type: "set-field", field: "repeat", value: option.id as ScheduleRepeat });
                  dispatchSchedule({ type: "set-field", field: "repeatPickerOpen", value: false });
                }}
                className="flex w-full items-center justify-between border-b border-[var(--uc-border-muted)] py-[14px] text-left last:border-b-0"
              >
                <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                  {option.label}
                </span>
                {repeat === option.id ? <SelectedMark /> : null}
              </button>
            ))}
          </div>
        </BottomSheet>
      ) : null}

      {endsPickerOpen ? (
        <BottomSheet
          title="Ends on"
          onClose={() => dispatchSchedule({ type: "set-field", field: "endsPickerOpen", value: false })}
          closeLabel="Close ends-on picker"
        >
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => {
                dispatchSchedule({ type: "set-field", field: "endsOn", value: { type: "never" } as ScheduleEnd });
                dispatchSchedule({ type: "set-field", field: "endsPickerOpen", value: false });
              }}
              className="flex w-full items-center justify-between border-b border-[var(--uc-border-muted)] py-[14px] text-left"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">Never</span>
              {endsOn.type === "never" ? <SelectedMark /> : null}
            </button>
            <button
              type="button"
              onClick={() => {
                dispatchSchedule({ type: "open-end-date", fallbackDate: todayIso });
              }}
              className="flex w-full items-center justify-between py-[14px] text-left"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                {endsOn.type === "on-date" ? formatScheduleDate(endsOn.date) : "On a date"}
              </span>
              {endsOn.type === "on-date" ? <SelectedMark /> : null}
            </button>
          </div>
        </BottomSheet>
      ) : null}
    </div>
  );
}
