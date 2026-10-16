import { useEffect, useState, type ReactNode } from "react";
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import TextField from "@/app/components/TextField";
import { AppIcon, type IconName } from "@/app/components/icons";
import { BottomSheet } from "@/app/components/BottomSheet";
import type { CountryId } from "@/app/state/demoTypes";
import {
  APPOINTMENT_DETAIL_OPTIONS,
  APPOINTMENT_REASON_OPTIONS,
  addAppointmentDays,
  formatAppointmentMonth,
  fromAppointmentDateKey,
  getInitialAppointmentDate,
  isAppointmentWeekend,
  toAppointmentDateKey,
} from "./appointmentModel";

interface AppointmentScreenProps {
  country: CountryId;
  onBack: () => void;
}

export type SelectionSheetKind = "reason" | "detail";

export interface AppointmentPageProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
  footer?: ReactNode;
  overlays?: ReactNode;
  showLargeTitle?: boolean;
  showBack?: boolean;
  topContent?: ReactNode;
  headerVariant?: "light" | "gray";
}

export function AppointmentPage({
  title,
  onBack,
  children,
  footer,
  overlays,
  showLargeTitle = true,
  showBack = true,
  topContent,
  headerVariant = "light",
}: AppointmentPageProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="shrink-0 bg-[var(--uc-surface)]">
        <PageHeader
          title={title}
          onBack={onBack}
          variant={headerVariant}
          showHelp={false}
          showBack={showBack}
          includeSafeArea
          renderLargeTitle={showLargeTitle}
        />
        {topContent}
      </div>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[12px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{children}</main>
      {footer ? (
        <footer className="z-10 shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[20px] pt-[12px]">
          {footer}
        </footer>
      ) : null}
      {overlays}
    </div>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-[14px] border-b border-[var(--uc-border-muted)] pb-[8px] uc-type-n5-strong uppercase text-[var(--uc-text)]">
      {children}
    </h2>
  );
}

export function FieldValue({ label, value, onClick, helper, trailingIconName = "chevron-down-wide" }: {
  label: string;
  value?: string;
  onClick: () => void;
  helper?: string;
  trailingIconName?: IconName;
}) {
  return (
    <div className="-mr-[12px] min-h-[96px] w-[calc(100%+12px)]">
      <TextField
        label={label}
        value={value ?? ""}
        onChange={() => undefined}
        readOnly
        onActivate={onClick}
        helperText={helper}
        trailingIconName={trailingIconName}
        trailingIconAction={{ ariaLabel: `Open ${label}`, onClick }}
      />
    </div>
  );
}

export function ReviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-[28px]">
      <SectionHeading>{title}</SectionHeading>
      <div className="flex flex-col gap-[20px]">{children}</div>
    </section>
  );
}

export function ReviewValue({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <div>
      <p className="uc-type-n5 text-[var(--uc-text-muted)]">{label}</p>
      {children ?? <p className="mt-[2px] uc-type-n4-strong text-[var(--uc-text)]">{value}</p>}
    </div>
  );
}

export function FormCheckbox({ checked, onChange, label, description }: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center gap-[8px] py-[12px] text-left"
    >
      <span className="grid size-[32px] shrink-0 place-items-center rounded-[4px]">
        <span className="grid size-[22px] place-items-center rounded-[4px] border border-[#262626] bg-white">
          {checked ? (
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M10.7556 3.76108C11.6516 2.82964 13.1039 2.82964 14 3.76108L6.66702 11.375L1.3125 5.81907C2.20816 4.88804 3.66088 4.88804 4.55693 5.81907L6.66702 8.00209L10.7556 3.76108Z" fill="#007A91" />
            </svg>
          ) : null}
        </span>
      </span>
      <span className="flex min-h-[32px] min-w-0 flex-1 flex-col justify-center">
        <span className="block uc-type-n5-strong uppercase leading-[18px] text-[var(--uc-text)]">{label}</span>
        {description ? <span className="mt-[2px] block uc-type-n5 leading-[18px] text-[var(--uc-text-muted)]">{description}</span> : null}
      </span>
    </button>
  );
}

export function AppointmentFooter({ children, secondary }: { children: ReactNode; secondary?: ReactNode }) {
  return (
    <>
      {children}
      {secondary ? <div className="mt-[12px] text-center">{secondary}</div> : null}
    </>
  );
}

export function CalendarGrid({
  month,
  selectedDate,
  locale,
  onSelect,
}: {
  month: Date;
  selectedDate: string;
  locale: string;
  onSelect: (dateKey: string) => void;
}) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  const firstCell = addAppointmentDays(monthStart, -mondayOffset);
  const todayKey = toAppointmentDateKey(new Date());
  const weekDays = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const monday = new Date(2024, 0, 1);
  const dayNames = Array.from({ length: 7 }, (_, index) => weekDays.format(addAppointmentDays(monday, index)));
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const weekCount = Math.ceil((mondayOffset + daysInMonth) / 7);
  const cells = Array.from({ length: weekCount * 7 }, (_, index) => addAppointmentDays(firstCell, index));

  return (
    <div className="grid grid-cols-7 gap-y-[4px]">
      {dayNames.map((day, index) => (
        <div key={`${day}-${index}`} className={`flex h-[28px] items-center justify-center uc-type-n5-strong ${index > 4 ? "text-[var(--uc-text-muted)]" : "text-[var(--uc-text)]"}`}>
          {day}
        </div>
      ))}
      {cells.map((date) => {
        const key = toAppointmentDateKey(date);
        const isCurrentMonth = date.getMonth() === month.getMonth();
        const isDisabled = !isCurrentMonth || key < todayKey || isAppointmentWeekend(date);
        const selected = isCurrentMonth && key === selectedDate;
        return (
          <button
            key={key}
            type="button"
            aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(date)}
            aria-pressed={selected}
            disabled={isDisabled}
            onClick={() => onSelect(key)}
            className={`mx-auto grid size-[40px] place-items-center rounded-full uc-type-n5-strong transition-colors ${
              selected
                ? "bg-[var(--uc-action-strong)] text-white"
                : isDisabled || !isCurrentMonth
                  ? "text-[var(--uc-text-muted)] opacity-45"
                  : "text-[var(--uc-text)] hover:bg-[var(--uc-action-soft)]"
            }`}
          >
            {new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(date)}
          </button>
        );
      })}
    </div>
  );
}

export function AppointmentCalendarSheet({
  open,
  onClose,
  selectedDate,
  locale,
  onConfirm,
  title = "Select date",
  autoSelectOnDayPress = false,
  showTodayAction = false,
  todayLabel = "Today",
  showYearNavigation = true,
  compactMonthLabel = false,
}: {
  open: boolean;
  onClose: () => void;
  selectedDate: string;
  locale: string;
  onConfirm: (dateKey: string) => void;
  title?: string;
  autoSelectOnDayPress?: boolean;
  showTodayAction?: boolean;
  todayLabel?: string;
  showYearNavigation?: boolean;
  compactMonthLabel?: boolean;
}) {
  const [month, setMonth] = useState(() => {
    const date = fromAppointmentDateKey(selectedDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [workingDate, setWorkingDate] = useState(selectedDate);

  useEffect(() => {
    if (!open) return;
    const date = fromAppointmentDateKey(selectedDate);
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setWorkingDate(selectedDate);
  }, [open, selectedDate]);

  if (!open) return null;
  const browserToday = new Date();
  const todayKey = isAppointmentWeekend(browserToday) ? getInitialAppointmentDate(browserToday) : toAppointmentDateKey(browserToday);
  const shiftMonth = (offset: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  const handleDateSelect = (dateKey: string) => {
    setWorkingDate(dateKey);
    if (autoSelectOnDayPress) {
      onConfirm(dateKey);
      onClose();
    }
  };
  const monthLabel = compactMonthLabel
    ? new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(month)
    : formatAppointmentMonth(month, locale);

  return (
    <BottomSheet
      title={title}
      onClose={onClose}
      className="px-[24px] pb-[20px]"
      headerClassName="mb-[12px]"
      bodyClassName="min-h-0"
      footer={autoSelectOnDayPress
        ? showTodayAction ? (
          <div className="flex justify-end">
            <button type="button" onClick={() => { onConfirm(todayKey); onClose(); }} className="rounded-full border border-[var(--uc-border)] px-[20px] py-[8px] uc-type-n5-strong text-[var(--uc-action)]">{todayLabel}</button>
          </div>
        ) : undefined
        : (
          <div className="flex items-center justify-between gap-[16px]">
            <button type="button" onClick={() => setWorkingDate(todayKey)} className="uc-type-n5-strong uppercase text-[var(--uc-action)]">{todayLabel}</button>
            <div className="w-[172px]">
              <PrimaryButton labelSize="18" onClick={() => { onConfirm(workingDate); onClose(); }}>Confirm</PrimaryButton>
            </div>
          </div>
        )}
    >
      <div className="mb-[18px] flex items-center justify-between">
        <div className="flex items-center gap-[4px]">
          {showYearNavigation ? (
            <button type="button" aria-label="Previous year" onClick={() => shiftMonth(-12)} className="grid size-[32px] place-items-center text-[var(--uc-text)]">
              <AppIcon name="chevron-left" size={20} color="var(--uc-text)" />
              <AppIcon name="chevron-left" size={20} color="var(--uc-text)" className="-ml-[12px]" />
            </button>
          ) : null}
          <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)} className="grid size-[32px] place-items-center text-[var(--uc-text)]">
            <AppIcon name="chevron-left" size={20} color="var(--uc-text)" />
          </button>
        </div>
        <p className="uc-type-h2 text-[var(--uc-text)]">{monthLabel}</p>
        <div className="flex items-center gap-[4px]">
          <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)} className="grid size-[32px] place-items-center text-[var(--uc-text)]">
            <AppIcon name="chevron-right" size={20} color="var(--uc-text)" />
          </button>
          {showYearNavigation ? (
            <button type="button" aria-label="Next year" onClick={() => shiftMonth(12)} className="grid size-[32px] place-items-center text-[var(--uc-text)]">
              <AppIcon name="chevron-right" size={20} color="var(--uc-text)" />
              <AppIcon name="chevron-right" size={20} color="var(--uc-text)" className="-ml-[12px]" />
            </button>
          ) : null}
        </div>
      </div>
      <CalendarGrid month={month} selectedDate={workingDate} locale={locale} onSelect={handleDateSelect} />
    </BottomSheet>
  );
}

function handleAppointmentNavigate(action: 'push' | 'back', onBack: () => void): boolean {
  if (action !== 'back') return false
  onBack()
  return true
}

export default function AppointmentScreen({ country, onBack }: AppointmentScreenProps) {
  return (
    <NativeScreenPreview
      route={{ screen: 'appointments' }}
      snapshot={{ country }}
      onBack={onBack}
      onNavigate={(_, action) => handleAppointmentNavigate(action, onBack)}
    />
  )
}

export function AppointmentSelectionSheet({ kind, selected, onToggle, onClose, onConfirm, text }: {
  kind: SelectionSheetKind;
  selected: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  text: (key: string, fallback: string) => string;
}) {
  const reasonMode = kind === "reason";
  const title = reasonMode ? text("reasonSheetTitle", "What do you want to talk about?") : text("detailSheetTitle", "Give us more details about your request");
  const options: Array<{ title: string; description?: string }> = reasonMode
    ? APPOINTMENT_REASON_OPTIONS.map(({ title: optionTitle, description }) => ({ title: optionTitle, description }))
    : APPOINTMENT_DETAIL_OPTIONS.map((optionTitle) => ({ title: optionTitle }));
  return (
    <BottomSheet
      title={title}
      onClose={onClose}
      className="px-[24px] pb-[20px]"
      headerClassName="mb-[20px]"
      footer={<PrimaryButton labelSize="18" onClick={onConfirm}>{text("select", "Select")}</PrimaryButton>}
    >
      <div className="pb-[8px]">
        {options.map((option) => (
          <FormCheckbox key={option.title} label={option.title} description={option.description} checked={selected.includes(option.title)} onChange={() => onToggle(option.title)} />
        ))}
      </div>
    </BottomSheet>
  );
}
