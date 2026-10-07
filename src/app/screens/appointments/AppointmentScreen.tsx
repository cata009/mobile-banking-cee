import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import TextField from "@/app/components/TextField";
import TextAreaField from "@/app/components/TextAreaField";
import AutoGrowTextArea from "@/app/components/AutoGrowTextArea";
import { AppIcon, type IconName } from "@/app/components/icons";
import { BottomSheet } from "@/app/components/BottomSheet";
import { useLanguage } from "@/app/contexts/LanguageContext";
import type { CountryId } from "@/app/state/demoTypes";
import advisorImage from "figma:asset/e693dd6eed452da6c4cda0e69dbdd3f45039c9f2.png";
import {
  APPOINTMENT_DETAIL_OPTIONS,
  APPOINTMENT_REASON_OPTIONS,
  DEFAULT_CLIENT_EMAIL,
  addAppointmentDays,
  createAppointmentId,
  formatAppointmentDate,
  formatAppointmentDateShort,
  formatAppointmentMonth,
  fromAppointmentDateKey,
  getAppointmentDateLocale,
  getAppointmentSlots,
  getInitialAppointmentDate,
  getNextAppointmentDateWithSlots,
  isAppointmentWeekend,
  loadAppointments,
  saveAppointments,
  sortAppointments,
  toAppointmentDateKey,
  type AppointmentDraft,
  type AppointmentMeetingType,
  type AppointmentRecord,
} from "./appointmentModel";

interface AppointmentScreenProps {
  country: CountryId;
  onBack: () => void;
}

type AppointmentView = "booking" | "slots" | "notes" | "review" | "success" | "list" | "detail" | "map" | "feedback" | "feedback-success";
export type SelectionSheetKind = "reason" | "detail";
type FeedbackIssue = "organizedMeeting" | "advisor" | "expectedOutcome" | "otherReason";

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

function BranchMeetingIcon() {
  return (
    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M17.25 9.75C17.25 9.06 16.69 8.5 16 8.5C15.31 8.5 14.75 9.06 14.75 9.75C14.75 10.44 15.31 11 16 11C16.69 11 17.25 10.44 17.25 9.75ZM9.125 12.875H8.5C7.11937 12.875 6 11.7556 6 10.375L16 6L26 10.375C26 11.7556 24.8806 12.875 23.5 12.875H22.875V21.625H20.375V12.875H17.25V21.625H14.75V12.875H11.625V21.625H9.125V12.875ZM20.375 22.875H22.875H23.5H25.375V25.375H6.625V22.875H8.5H9.125H11.625H14.75H17.25H20.375Z" fill="#262626" />
    </svg>
  );
}

function OnlineMeetingIcon() {
  return (
    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M17.875 2.0625V6.1875H15.8125V4.125H2.0625V13.75H13.0625V16.5H0V4.125C0 2.98581 0.923313 2.0625 2.0625 2.0625H17.875ZM18.4552 19.3751C17.9891 19.3751 17.611 18.997 17.611 18.5309C17.611 18.0654 17.9891 17.688 18.4552 17.688C18.9214 17.688 19.2988 18.0654 19.2988 18.5309C19.2988 18.997 18.9214 19.3751 18.4552 19.3751ZM15.95 7.5625C15.1147 7.5625 14.4375 8.25481 14.4375 9.10938V19.9375H20.4875C21.3235 19.9375 22 19.2445 22 18.3906V7.5625H15.95ZM8.9375 17.875C7.39819 17.875 5.98263 18.2868 4.8125 18.9722V19.9375H13.0625V18.9722C11.8938 18.2868 10.4768 17.875 8.9375 17.875Z" fill="#262626" />
    </svg>
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

function AppointmentMap({
  branchName,
  branchAddress,
  onSelect,
  onBack,
  readonly = false,
}: {
  branchName: string;
  branchAddress: string;
  onSelect: () => void;
  onBack: () => void;
  readonly?: boolean;
}) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="absolute inset-x-0 top-0 z-10">
        <PageHeader title="" onBack={onBack} variant="light" showHelp={false} includeSafeArea renderLargeTitle={false} />
      </div>
      <div
        className="relative min-h-0 flex-1 overflow-hidden bg-[#f3f4f2]"
        aria-label="Map preview"
        style={{
          backgroundImage: "linear-gradient(28deg, transparent 47%, #fff 47.5%, #fff 49%, transparent 49.5%), linear-gradient(104deg, transparent 38%, #fff 38.5%, #fff 40%, transparent 40.5%), linear-gradient(160deg, transparent 70%, #fff 70.5%, #fff 72%, transparent 72.5%), linear-gradient(8deg, transparent 22%, #e6ece7 22.5%, #e6ece7 26%, transparent 26.5%), repeating-linear-gradient(0deg, transparent 0 54px, rgb(219 225 221 / 55%) 55px 57px), repeating-linear-gradient(90deg, transparent 0 72px, rgb(219 225 221 / 45%) 73px 75px)",
        }}
      >
        <div className="absolute left-[18%] top-[35%] grid size-[42px] place-items-center rounded-full border-[5px] border-white bg-[var(--uc-action-strong)] text-white shadow-lg">
          <AppIcon name="landmark" size={22} color="var(--uc-static-white)" />
        </div>
        <div className="absolute right-[20%] top-[23%] grid size-[38px] place-items-center rounded-full border-[4px] border-white bg-[var(--uc-brand)] text-white shadow-md">
          <AppIcon name="landmark" size={18} color="var(--uc-static-white)" />
        </div>
        <div className="absolute right-[30%] top-[58%] grid size-[38px] place-items-center rounded-full border-[4px] border-white bg-[var(--uc-brand)] text-white shadow-md">
          <AppIcon name="landmark" size={18} color="var(--uc-static-white)" />
        </div>
      </div>
      <section className="relative z-10 -mt-[16px] shrink-0 rounded-t-[12px] bg-[var(--uc-surface)] px-[24px] pb-[24px] pt-[24px] shadow-[0_-8px_24px_rgb(var(--uc-shadow-rgb)_/_0.18)]">
        <div className="mx-auto mb-[16px] h-[4px] w-[32px] rounded-full bg-[var(--uc-border)]" />
        <div className="mb-[6px] flex items-start justify-between gap-[12px]">
          <h1 className="uc-type-h2 text-[var(--uc-text)]">{branchName}</h1>
          <span className="shrink-0 pt-[4px] uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">Open</span>
        </div>
        <p className="uc-type-n5 text-[var(--uc-text-muted)]">{branchAddress}</p>
        <p className="mt-[12px] uc-type-n4-strong text-[var(--uc-text)]">60m</p>
        <div className="mt-[24px]">
          <PrimaryButton labelSize="18" onClick={onSelect}>{readonly ? "Close map" : "Take me there"}</PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function createDraft(branchName: string, branchAddress: string): AppointmentDraft {
  const initialDate = getInitialAppointmentDate();
  return {
    reasons: [],
    details: [],
    appointmentDate: initialDate,
    meetingType: null,
    branchName,
    branchAddress,
    selectedTime: "",
    selectedSlotDate: initialDate,
    notes: "",
    email: DEFAULT_CLIENT_EMAIL,
  };
}

function isPastAppointment(appointment: AppointmentRecord): boolean {
  if (appointment.status === "cancelled" || appointment.status === "completed") return true;
  const now = new Date();
  const date = fromAppointmentDateKey(appointment.appointmentDate);
  if (date.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) return true;
  if (toAppointmentDateKey(date) !== toAppointmentDateKey(now)) return false;
  const [hours = 0, minutes = 0] = appointment.selectedTime.split(":").map(Number);
  return hours * 60 + minutes < now.getHours() * 60 + now.getMinutes();
}

function getPreviousSelectableAppointmentDate(dateKey: string): string | null {
  const todayKey = toAppointmentDateKey(new Date());
  let date = addAppointmentDays(fromAppointmentDateKey(dateKey), -1);
  while (isAppointmentWeekend(date)) date = addAppointmentDays(date, -1);
  const previousDateKey = toAppointmentDateKey(date);
  return previousDateKey >= todayKey ? previousDateKey : null;
}

function statusLabel(appointment: AppointmentRecord, text: (key: string, fallback: string) => string): string {
  if (appointment.status === "cancelled") return text("cancelled", "Cancelled");
  if (isPastAppointment(appointment)) return appointment.meetingType === "branch" ? "BRANCH MEETING" : "ONLINE MEETING";
  const status = appointment.status === "confirmed"
    ? text("confirmed", "CONFIRMED")
    : text("waiting", "WAITING FOR CONFIRMATION");
  const type = appointment.meetingType === "branch" ? "BRANCH MEETING" : "ONLINE MEETING";
  return `${status} - ${type}`;
}

function feedbackReasonText(reason: string, text: (key: string, fallback: string) => string): string {
  const reasonLabels: Record<FeedbackIssue, [string, string]> = {
    organizedMeeting: ["feedbackIssueMeeting", "There was a problem related with the organized meeting"],
    advisor: ["feedbackIssueAdvisor", "There was a problem with the advisor"],
    expectedOutcome: ["feedbackIssueOutcome", "There was a problem related to the expected outcome of the meeting"],
    otherReason: ["feedbackIssueOther", "Other reason"],
  };
  const entry = reasonLabels[reason as FeedbackIssue];
  return entry ? text(entry[0], entry[1]) : reason;
}

function feedbackIssueDetailText(detail: string, text: (key: string, fallback: string) => string): string {
  const detailLabels: Record<string, [string, string]> = {
    waitingTime: ["feedbackIssueWaitingTime", "The waiting time was not respected and I had to wait"],
    bureaucracy: ["feedbackIssueBureaucracy", "Too much bureaucracy"],
    technicalIssues: ["feedbackIssueTechnical", "Technical issues with the meeting"],
    privacy: ["feedbackIssuePrivacy", "There was no privacy for the meeting"],
  };
  const entry = detailLabels[detail];
  return entry ? text(entry[0], entry[1]) : detail;
}

export default function AppointmentScreen({ country, onBack }: AppointmentScreenProps) {
  const { t, language } = useLanguage();
  const text = (key: string, fallback: string) => t(`appointments.${key}`, fallback);
  const locale = getAppointmentDateLocale(country, language);
  const advisorName = t("prime.advisor.name", "David Novak");
  const advisorPhone = t("prime.advisor.phone", "+420 602 123 456");
  const branchName = t("prime.advisor.branch", "UniCredit Branch 34");
  const branchAddress = t("prime.advisor.address", "Želetavská 1525/1, 140 92, Praha 4");
  const [recordState, setRecordState] = useState(() => ({ country, appointments: loadAppointments(country) }));
  const appointments = recordState.country === country ? recordState.appointments : loadAppointments(country);
  const [view, setView] = useState<AppointmentView>(() => (loadAppointments(country).length > 0 ? "list" : "booking"));
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [draft, setDraft] = useState(() => createDraft(branchName, branchAddress));
  const [selectionSheet, setSelectionSheet] = useState<SelectionSheetKind | null>(null);
  const [selectionDraft, setSelectionDraft] = useState<string[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showMoreSlots, setShowMoreSlots] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackReason, setFeedbackReason] = useState<FeedbackIssue | "">("");
  const [feedbackReasonDetail, setFeedbackReasonDetail] = useState("");
  const [mapReturnView, setMapReturnView] = useState<"booking" | "detail" | "review">("booking");
  const [mapReadonly, setMapReadonly] = useState(false);
  const selectedAppointment = appointments.find(({ id }) => id === selectedAppointmentId) ?? null;
  const initializedCountryRef = useRef<CountryId | null>(null);

  useEffect(() => {
    if (initializedCountryRef.current === country) return;
    initializedCountryRef.current = country;
    setRecordState((current) => current.country === country
      ? current
      : { country, appointments: loadAppointments(country) });
    setDraft(createDraft(branchName, branchAddress));
    setView(loadAppointments(country).length > 0 ? "list" : "booking");
    setActiveTab("active");
  }, [country, branchName, branchAddress]);

  const updateAppointments = (nextAppointments: AppointmentRecord[]) => {
    saveAppointments(country, nextAppointments);
    setRecordState({ country, appointments: nextAppointments });
  };

  const updateDraft = (changes: Partial<AppointmentDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
  };

  const selectedDate = useMemo(() => fromAppointmentDateKey(draft.appointmentDate), [draft.appointmentDate]);
  const directSlots = useMemo(() => getAppointmentSlots(draft.appointmentDate), [draft.appointmentDate]);
  const availableSlotDate = directSlots.length > 0
    ? draft.appointmentDate
    : getNextAppointmentDateWithSlots(draft.appointmentDate);
  const availableSlots = useMemo(() => getAppointmentSlots(availableSlotDate), [availableSlotDate]);

  const handleBack = () => {
    if (view === "booking") { onBack(); return; }
    if (view === "slots") { setView("booking"); return; }
    if (view === "notes") { setView("slots"); return; }
    if (view === "review") { setView("notes"); return; }
    if (view === "success") { setView("list"); return; }
    if (view === "list") { onBack(); return; }
    if (view === "detail") { setView("list"); return; }
    if (view === "map") { setView(mapReturnView); return; }
    if (view === "feedback") { setView("detail"); return; }
    if (view === "feedback-success") { setView("detail"); }
  };

  const openNewBooking = () => {
    setDraft(createDraft(branchName, branchAddress));
    setView("booking");
  };

  const openCalendar = () => {
    setCalendarOpen(true);
  };

  const confirmCalendarDate = (dateKey: string) => {
    updateDraft({ appointmentDate: dateKey, selectedTime: "", selectedSlotDate: dateKey });
  };

  const shiftAppointmentDate = (days: number) => {
    let date = addAppointmentDays(selectedDate, days);
    while (isAppointmentWeekend(date)) date = addAppointmentDays(date, days);
    if (toAppointmentDateKey(date) < toAppointmentDateKey(new Date())) return;
    updateDraft({ appointmentDate: toAppointmentDateKey(date), selectedTime: "", selectedSlotDate: toAppointmentDateKey(date) });
  };

  const openSelection = (kind: SelectionSheetKind) => {
    setSelectionDraft(kind === "reason" ? draft.reasons : draft.details);
    setSelectionSheet(kind);
  };

  const toggleSelection = (value: string) => {
    setSelectionDraft((current) => current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]);
  };

  const confirmSelection = () => {
    if (selectionSheet === "reason") updateDraft({ reasons: selectionDraft });
    if (selectionSheet === "detail") updateDraft({ details: selectionDraft });
    setSelectionSheet(null);
  };

  const openMap = (returnView: "booking" | "detail" | "review", readonly = false) => {
    setMapReturnView(returnView);
    setMapReadonly(readonly);
    setView("map");
  };

  const handleSubmitAppointment = () => {
    if (!draft.meetingType || !draft.selectedTime) return;
    const appointment: AppointmentRecord = {
      id: createAppointmentId(),
      reasons: draft.reasons,
      details: draft.details,
      appointmentDate: draft.selectedSlotDate || availableSlotDate,
      meetingType: draft.meetingType,
      branchName: draft.branchName,
      branchAddress: draft.branchAddress,
      selectedTime: draft.selectedTime,
      notes: draft.notes.trim(),
      email: draft.email.trim(),
      advisorName,
      status: "pending",
      createdAt: Date.now(),
    };
    updateAppointments([appointment, ...appointments]);
    setSelectedAppointmentId(appointment.id);
    setView("success");
  };

  const saveFeedback = () => {
    if (!selectedAppointment || feedbackRating === 0) return;
    const feedback = {
      rating: feedbackRating,
      comment: feedbackComment.trim(),
      ...(feedbackRating <= 2 && feedbackReason ? { reason: feedbackReason } : {}),
      ...(feedbackRating <= 2 && feedbackReasonDetail ? { reasonDetail: feedbackReasonDetail } : {}),
    };
    updateAppointments(appointments.map((appointment) => appointment.id === selectedAppointment.id
      ? { ...appointment, status: "completed", feedback }
      : appointment));
    setView("feedback-success");
  };

  const deleteMeeting = () => {
    if (!selectedAppointment) return;
    updateAppointments(appointments.filter((appointment) => appointment.id !== selectedAppointment.id));
    setShowDeleteConfirmation(false);
    setSelectedAppointmentId(null);
    setView("list");
  };

  if (view === "map") {
    return (
      <AppointmentMap
        branchName={selectedAppointment?.branchName ?? draft.branchName}
        branchAddress={selectedAppointment?.branchAddress ?? draft.branchAddress}
        readonly={mapReadonly}
        onBack={handleBack}
        onSelect={() => setView(mapReturnView)}
      />
    );
  }

  if (view === "booking") {
    const reasonsLabel = draft.reasons.join(", ");
    const detailsLabel = draft.details.join(", ");
    const canContinue = draft.reasons.length > 0 && draft.meetingType !== null && draft.appointmentDate !== ""
      && (draft.meetingType !== "branch" || (draft.branchName.trim() !== "" && draft.branchAddress.trim() !== ""));

    return (
      <AppointmentPage
        title={text("bookingTitle", "Select the location and date of the appointment")}
        onBack={handleBack}
        footer={<PrimaryButton labelSize="18" disabled={!canContinue} onClick={() => { setShowMoreSlots(false); updateDraft({ selectedTime: "" }); setView("slots"); }}>{text("continue", "Continue")}</PrimaryButton>}
        overlays={(
          <>
            {selectionSheet ? (
              <AppointmentSelectionSheet
                kind={selectionSheet}
                selected={selectionDraft}
                onToggle={toggleSelection}
                onClose={() => setSelectionSheet(null)}
                onConfirm={confirmSelection}
                text={text}
              />
            ) : null}
            <AppointmentCalendarSheet
              open={calendarOpen}
              selectedDate={draft.appointmentDate}
              locale={locale}
              autoSelectOnDayPress
              showTodayAction
              showYearNavigation={false}
              compactMonthLabel
              onClose={() => setCalendarOpen(false)}
              onConfirm={confirmCalendarDate}
            />
          </>
        )}
      >
        <div className="px-[24px] pb-[24px] pt-[20px]">
          <SectionHeading>{text("reasonSection", "Appointment reason")}</SectionHeading>
          <div className="mb-[20px]">
            <FieldValue
              label={text("reasonPrompt", "What do you want to talk about?")}
              value={reasonsLabel}
              helper={text("reasonHelper", "This will help the advisor to be prepared for the meeting")}
              onClick={() => openSelection("reason")}
            />
          </div>
          <div className="mb-[28px]">
            <FieldValue
              label={text("detailPrompt", "Give us more details about your request")}
              value={detailsLabel}
              helper={text("detailHelper", "This will help the advisor to be prepared with everything that is required")}
              onClick={() => openSelection("detail")}
            />
          </div>

          <SectionHeading>{text("appointmentDetails", "Appointment details")}</SectionHeading>
          <div className="mb-[28px]">
            <FieldValue
              label={text("appointmentDate", "Appointment date")}
              value={formatAppointmentDate(draft.appointmentDate, locale)}
              helper={text("dateHelper", "Tell us when you would prefer to discuss")}
              trailingIconName="insurance-calendar"
              onClick={openCalendar}
            />
          </div>

          <div className="flex flex-col gap-[20px]">
            <MeetingTypeChoice
              selected={draft.meetingType === "branch"}
              type="branch"
              title={text("branchMeeting", "Branch meeting")}
              description={draft.branchName}
              detail={draft.branchAddress}
              onSelect={() => updateDraft({ meetingType: "branch" })}
            />
            {draft.meetingType === "branch" ? (
              <button type="button" onClick={() => openMap("booking")} className="ml-[57px] mt-[-12px] w-fit uc-type-n5-strong uppercase text-[var(--uc-action)]">
                {text("seeLocation", "See location on the map")}
              </button>
            ) : null}
            <MeetingTypeChoice
              selected={draft.meetingType === "online"}
              type="online"
              title={text("onlineMeeting", "Online meeting")}
              description={text("onlineMeetingDescription", "We will send you a link to join an online meeting")}
              onSelect={() => updateDraft({ meetingType: "online" })}
            />
          </div>
        </div>

      </AppointmentPage>
    );
  }

  if (view === "slots") {
    const noSlotsOnSelectedDay = directSlots.length === 0;
    const primarySlots = availableSlots.slice(0, 8);
    const extraSlots = availableSlots.slice(8);
    const primarySlotRows = Array.from({ length: Math.ceil(primarySlots.length / 4) }, (_, row) => primarySlots.slice(row * 4, row * 4 + 4));
    const previousAppointmentDate = getPreviousSelectableAppointmentDate(draft.appointmentDate);
    return (
      <AppointmentPage
        title={text("slotsTitle", "Select available interval")}
        onBack={handleBack}
        footer={<PrimaryButton labelSize="18" disabled={!draft.selectedTime} onClick={() => setView("notes")}>{text("continue", "Continue")}</PrimaryButton>}
        overlays={(
          <AppointmentCalendarSheet
            open={calendarOpen}
            selectedDate={draft.appointmentDate}
            locale={locale}
            autoSelectOnDayPress
            showTodayAction
            showYearNavigation={false}
            compactMonthLabel
            onClose={() => setCalendarOpen(false)}
            onConfirm={confirmCalendarDate}
          />
        )}
        topContent={(
          <div className="flex items-center justify-between px-[24px] pb-[8px] pt-[8px]">
            {previousAppointmentDate ? (
              <button type="button" aria-label={text("previousDay", "Previous day")} onClick={() => shiftAppointmentDate(-1)} className="grid size-[32px] place-items-center">
                <AppIcon name="chevron-left" size={24} color="var(--uc-text)" />
              </button>
            ) : <span aria-hidden="true" className="size-[32px] shrink-0" />}
            <button type="button" onClick={openCalendar} className="flex items-center gap-[10px] uc-type-n4-strong text-[var(--uc-text)]">
              {new Intl.DateTimeFormat(locale, { weekday: "short", day: "2-digit", month: "short" }).format(selectedDate)}
              <AppIcon name="chevron-down" size={20} color="var(--uc-text)" />
            </button>
            <button type="button" aria-label={text("nextDay", "Next day")} onClick={() => shiftAppointmentDate(1)} className="grid size-[32px] place-items-center">
              <AppIcon name="chevron-right" size={24} color="var(--uc-text)" />
            </button>
          </div>
        )}
      >
        <div className="px-[24px] pb-[24px] pt-[8px]">
          {noSlotsOnSelectedDay ? (
            <div className="mb-[22px] rounded-[8px] border border-[var(--uc-border)] p-[16px]">
              <div className="flex items-start gap-[12px]">
                <AppIcon name="info-circle" size={24} color="var(--uc-text)" />
                <div>
                  <p className="uc-type-n4-strong text-[var(--uc-text)]">{text("noSlotsTitle", "No available time slots for")} {formatAppointmentDate(draft.appointmentDate, locale)}</p>
                  <p className="mt-[4px] uc-type-n5 text-[var(--uc-text-muted)]">{text("noSlotsBody", "Here are the first available time slots for your advisor. If the date does not work for you, feel free to pick a different date.")}</p>
                  <p className="mt-[16px] uc-type-n5 text-[var(--uc-text-muted)]">{text("phoneHelp", "If you need to get in touch, you can call the Infoline service")}</p>
                  <a className="mt-[8px] block uc-type-n4-strong text-[var(--uc-action)]" href={`tel:${advisorPhone.replace(/[^+\d]/g, "")}`}>{advisorPhone}</a>
                </div>
              </div>
            </div>
          ) : null}

          <p className="mb-[28px] mt-[18px] uc-type-p1 text-[var(--uc-text)]">
            {text("slotInstruction", "Just tap on one of the available time slots from your advisor to pick a time that works for you!")}
          </p>
          <p className="mb-[8px] uc-type-n4-strong text-[var(--uc-text)]">
            {text("availableSlots", "Available slots")} ({new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long" }).format(fromAppointmentDateKey(availableSlotDate))})
          </p>
          <div className="mb-[18px] h-[1px] w-full bg-[var(--uc-border-muted)]" />
          <div className="rounded-[8px] bg-[#f5f5f5] p-[16px]">
            <AdvisorSummary advisorName={advisorName} />
            <div className="my-[16px] h-[1px] w-full bg-[var(--uc-border-muted)]" />
            <p className="mb-[12px] uc-type-n5 text-[var(--uc-text)]">{text("selectSlot", "Select from available slots")}</p>
            <div className="grid grid-cols-4 gap-x-[8px] gap-y-[12px]">
              {primarySlotRows.flat().map((slot) => (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={draft.selectedTime === slot && draft.selectedSlotDate === availableSlotDate}
                  onClick={() => updateDraft({ selectedTime: slot, selectedSlotDate: availableSlotDate })}
                  className={`h-[48px] rounded-[4px] border uc-type-n4-strong transition-colors ${
                    draft.selectedTime === slot && draft.selectedSlotDate === availableSlotDate
                      ? "border-[var(--uc-action-strong)] bg-[var(--uc-action-strong)] text-white"
                      : "border-[var(--uc-text)] bg-white text-[var(--uc-text)] hover:border-[var(--uc-action)]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            {extraSlots.length > 0 ? (
              <div
                id="additional-appointment-slots"
                aria-hidden={!showMoreSlots}
                className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out ${showMoreSlots ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="grid grid-cols-4 gap-x-[8px] gap-y-[12px] pt-[12px]">
                    {extraSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed={draft.selectedTime === slot && draft.selectedSlotDate === availableSlotDate}
                        tabIndex={showMoreSlots ? 0 : -1}
                        disabled={!showMoreSlots}
                        onClick={() => updateDraft({ selectedTime: slot, selectedSlotDate: availableSlotDate })}
                        className={`h-[48px] rounded-[4px] border uc-type-n4-strong transition-colors ${
                          draft.selectedTime === slot && draft.selectedSlotDate === availableSlotDate
                            ? "border-[var(--uc-action-strong)] bg-[var(--uc-action-strong)] text-white"
                            : "border-[var(--uc-text)] bg-white text-[var(--uc-text)] hover:border-[var(--uc-action)]"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
            {availableSlots.length > 8 ? (
              <button
                type="button"
                aria-expanded={showMoreSlots}
                aria-controls="additional-appointment-slots"
                onClick={() => setShowMoreSlots((current) => !current)}
                className="mt-[18px] w-full uc-type-n5-strong uppercase text-[var(--uc-action)]"
              >
                {showMoreSlots ? text("seeLess", "See less slots") : text("seeMore", "See more slots")}
              </button>
            ) : null}
          </div>
        </div>
      </AppointmentPage>
    );
  }

  if (view === "notes") {
    return (
      <AppointmentPage
        title={text("notesTitle", "Do you want to send a specific message?")}
        onBack={handleBack}
        footer={(
          <AppointmentFooter secondary={(
            <button type="button" onClick={() => { updateDraft({ notes: "" }); setView("review"); }} className="uc-type-n4-strong text-[var(--uc-action)]">
              {text("skipNotes", "Continue without any notes")}
            </button>
          )}>
            <PrimaryButton labelSize="18" disabled={draft.notes.trim().length === 0} onClick={() => setView("review")}>
              {text("continue", "Continue")}
            </PrimaryButton>
          </AppointmentFooter>
        )}
      >
        <div className="px-[24px] pt-[24px]">
          <label htmlFor="appointment-notes" className="block uc-type-n4 text-[var(--uc-text)]">{text("additionalNotes", "Additional notes")}</label>
          <AutoGrowTextArea
            id="appointment-notes"
            value={draft.notes}
            onChange={(notes) => updateDraft({ notes })}
            maxLength={500}
            className="mt-[4px] w-full resize-none border-0 border-b border-[var(--uc-border)] bg-transparent px-0 py-[4px] uc-type-n4 leading-[20px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
          />
          <p className="mt-[6px] uc-type-n5 text-[var(--uc-text-muted)]">{text("notesHelper", "Our colleagues will take care of your notes and get prepared with all the requested answers")}</p>
        </div>
      </AppointmentPage>
    );
  }

  if (view === "review") {
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim());
    return (
      <AppointmentPage
        title={text("reviewTitle", "Appointment review")}
        onBack={handleBack}
        footer={<PrimaryButton labelSize="18" disabled={!validEmail} onClick={handleSubmitAppointment}>{text("confirm", "Confirm")}</PrimaryButton>}
      >
        <div className="px-[24px] pb-[24px] pt-[8px]">
          <p className="mb-[24px] uc-type-n5 text-[var(--uc-text-muted)]">{text("reviewIntro", "Review the details of the appointment before confirming")}</p>
          <ReviewSection title={text("reasonSection", "Appointment reason")}>
            <ReviewValue label={text("category", "Category")} value={draft.reasons.join(", ")} />
            {draft.details.length > 0 ? <ReviewValue label={text("subcategory", "Subcategory")} value={draft.details.join(", ")} /> : null}
            {draft.notes.trim() ? <ReviewValue label={text("reviewNotes", "Additional notes")} value={draft.notes.trim()} /> : null}
          </ReviewSection>
          <ReviewSection title={text("locationSection", "Appointment location")}>
            <ReviewValue label={text("meetingType", "Type of meeting")} value={draft.meetingType === "branch" ? text("branchMeeting", "Branch Meeting") : text("onlineMeeting", "Online Meeting")} />
            {draft.meetingType === "branch" ? (
              <>
                <ReviewValue label={text("branchName", "Branch name")} value={draft.branchName} />
                <ReviewValue label={text("branchAddress", "Branch address")}>
                  <div>
                    <p className="mt-[2px] uc-type-n4-strong text-[var(--uc-text)]">{draft.branchAddress}</p>
                    <button type="button" onClick={() => openMap("review", true)} className="mt-[8px] uc-type-n5-strong uppercase text-[var(--uc-action)]">{text("seeLocation", "See location on the map")}</button>
                  </div>
                </ReviewValue>
              </>
            ) : (
              <>
                <ReviewValue label={text("onlinePlatform", "Online platform")} value="Microsoft Teams" />
                <ReviewValue label={text("invitationAddress", "Your address where we send the invitation")} value={draft.email} />
              </>
            )}
            <ReviewValue label={text("requestedSlot", "Requested slot")} value={`${formatAppointmentDate(draft.selectedSlotDate || availableSlotDate, locale)} - ${draft.selectedTime}`} />
          </ReviewSection>
          <ReviewSection title={text("deliverySection", "Appointment confirmation delivery")}>
            <ReviewValue label={text("emailAddress", "Your email address")}>
              <div>
                <input
                  aria-label={text("emailAddress", "Your email address")}
                  type="email"
                  value={draft.email}
                  placeholder="name@example.com"
                  onChange={(event) => updateDraft({ email: event.target.value })}
                  className="w-full border-0 border-b border-[var(--uc-border)] bg-transparent px-0 py-[4px] uc-type-n4 text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
                />
                <p className="mt-[6px] uc-type-n5 text-[var(--uc-text-muted)]">{text("emailHelper", "You will receive an invitation on your email address for the meeting")}</p>
              </div>
            </ReviewValue>
          </ReviewSection>
        </div>
      </AppointmentPage>
    );
  }

  if (view === "success") {
    return (
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]">
        <main className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[24px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ paddingTop: "calc(var(--uc-phone-top-reserve, 54px) + 16px)" }}>
          <h1 className="uc-type-h1 text-[var(--uc-text)]">{text("successTitle", "Appointment request was successfully sent")}</h1>
          <div className="my-[52px] flex justify-center">
            <div className="grid size-[96px] place-items-center rounded-full border-[6px] border-[#43854f] text-[#43854f]">
              <AppIcon name="check" size={56} color="#43854f" />
            </div>
          </div>
          <p className="mb-[18px] uc-type-n4-strong text-[var(--uc-text)]">{text("successThanks", "Thank you for requesting this appointment with us")}</p>
          <p className="mb-[18px] uc-type-p1 text-[var(--uc-text)]">{text("successConfirmation", "Our advisor will confirm this appointment and you will receive an email and/or push notification.")}</p>
          <p className="uc-type-p1 text-[var(--uc-text)]">{text("successCancel", "After the meeting is confirmed, if you cannot make it, you can always cancel the meeting from the app and reschedule a new one.")}</p>
        </main>
        <footer className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[20px] pt-[12px]">
          <PrimaryButton labelSize="18" onClick={() => { setActiveTab("active"); setView("list"); }}>{text("okGotIt", "Ok, got it")}</PrimaryButton>
        </footer>
      </div>
    );
  }

  if (view === "list") {
    const activeAppointments = sortAppointments(appointments.filter((appointment) => !isPastAppointment(appointment)));
    const pastAppointments = sortAppointments(appointments.filter(isPastAppointment)).reverse();
    const visibleAppointments = activeTab === "active" ? activeAppointments : pastAppointments;
    return (
      <AppointmentPage
        title={text("listTitle", "My appointments")}
        onBack={handleBack}
        footer={<PrimaryButton labelSize="18" onClick={openNewBooking}>{text("bookAppointment", "Book an appointment")}</PrimaryButton>}
        topContent={(
          <div className="grid grid-cols-2 border-b border-[var(--uc-border)]">
            <button type="button" onClick={() => setActiveTab("active")} className={`h-[48px] border-b-[2px] uc-type-n4-strong ${activeTab === "active" ? "border-[var(--uc-text)] text-[var(--uc-text)]" : "border-transparent text-[var(--uc-text-muted)]"}`}>
              {text("activeMeetings", "Active meetings")}
            </button>
            <button type="button" onClick={() => setActiveTab("past")} className={`h-[48px] border-b-[2px] uc-type-n4-strong ${activeTab === "past" ? "border-[var(--uc-text)] text-[var(--uc-text)]" : "border-transparent text-[var(--uc-text-muted)]"}`}>
              {text("pastMeetings", "Past meetings")}
            </button>
          </div>
        )}
      >
        <div className="px-[16px] pb-[24px] pt-[12px]">
          {visibleAppointments.length === 0 ? (
            <p className="uc-type-n5 text-[var(--uc-text-muted)]">{text("noMeetings", "You have no meetings")}</p>
          ) : (
            <div className="flex flex-col">
              {visibleAppointments.map((appointment) => (
                <AppointmentListRow
                  key={appointment.id}
                  appointment={appointment}
                  locale={locale}
                  onClick={() => {
                    setSelectedAppointmentId(appointment.id);
                    if (appointment.status === "completed" && !appointment.feedback) {
                      setFeedbackRating(0);
                      setFeedbackComment("");
                      setFeedbackReason("");
                      setFeedbackReasonDetail("");
                      setView("feedback");
                    } else {
                      setView("detail");
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </AppointmentPage>
    );
  }

  if (view === "detail" && selectedAppointment) {
    const past = isPastAppointment(selectedAppointment);
    const canRequestFeedback = selectedAppointment.status === "completed" && !selectedAppointment.feedback;
    const isWaiting = selectedAppointment.status === "pending" && !past;
    return (
      <AppointmentPage
        title=""
        onBack={handleBack}
        showLargeTitle={false}
        headerVariant="gray"
        footer={canRequestFeedback ? (
          <PrimaryButton labelSize="18" onClick={() => { setFeedbackRating(0); setFeedbackComment(""); setFeedbackReason(""); setFeedbackReasonDetail(""); setView("feedback"); }}>{text("rateExperience", "Rate your experience")}</PrimaryButton>
        ) : undefined}
      >
        <div className="bg-[var(--uc-app-bg)] px-[24px] pb-[24px] pt-[24px] text-center">
          <img src={advisorImage} alt={selectedAppointment.advisorName} className="mx-auto size-[64px] rounded-full object-cover" />
          <h1 className="mt-[12px] uc-type-h2 text-[var(--uc-text)]">{selectedAppointment.advisorName}</h1>
          <p className={`mx-auto mt-[12px] w-fit rounded-[4px] px-[8px] py-[4px] uc-type-n6-strong !text-[12px] !font-bold leading-[16px] uppercase text-white ${isWaiting ? "bg-[#ef7a00]" : "bg-[#43854f]"}`}>
            {statusLabel(selectedAppointment, text)}
          </p>
          <p className="mt-[10px] uc-type-n5 text-[var(--uc-text)]">{formatAppointmentDate(selectedAppointment.appointmentDate, locale)} - {selectedAppointment.selectedTime}</p>
          {!past ? (
            <button type="button" onClick={() => setShowDeleteConfirmation(true)} className="mx-auto mt-[24px] flex w-[72px] flex-col items-center gap-[2px] text-center uc-type-n5 leading-[18px] text-[var(--uc-text)]">
              <AppIcon name="trash-2" size={24} color="var(--uc-text)" />
              <span className="w-full">{text("deleteMeeting", "Delete meeting")}</span>
            </button>
          ) : null}
        </div>
        <div className="px-[24px] pb-[32px] pt-[20px]">
          <h2 className="uc-type-h2 text-[var(--uc-text)]">{text("meetingDetails", "Meeting details")}</h2>
          <div className="mt-[20px] flex flex-col gap-[24px]">
            {selectedAppointment.meetingType === "branch" ? (
              <>
                <ReviewValue label={text("branchName", "Branch name")} value={selectedAppointment.branchName} />
                <ReviewValue label={text("branchAddress", "Branch address")}>
                  <div>
                    <p className="mt-[2px] uc-type-n4-strong text-[var(--uc-text)]">{selectedAppointment.branchAddress}</p>
                    <button type="button" onClick={() => openMap("detail", true)} className="mt-[8px] uc-type-n5-strong uppercase text-[var(--uc-action)]">{text("seeLocation", "See location on the map")}</button>
                  </div>
                </ReviewValue>
                <ReviewValue label={text("invitationAddress", "Your address where we send the invitation")} value={selectedAppointment.email || text("noClientEmail", "No client email provided")} />
              </>
            ) : (
              <>
                <ReviewValue label={text("onlinePlatform", "Platform meeting")} value="Microsoft Teams" />
                <ReviewValue label={text("invitationAddress", "Your address where we send the invitation")} value={selectedAppointment.email || text("noClientEmail", "No client email provided")} />
              </>
            )}
          </div>
          <h2 className="mb-[20px] mt-[36px] uc-type-h2 text-[var(--uc-text)]">{text("reasonSection", "Appointment reason")}</h2>
          <div className="flex flex-col gap-[24px]">
            <ReviewValue label={text("category", "Category")} value={selectedAppointment.reasons.join(", ")} />
            {selectedAppointment.details.length > 0 ? <ReviewValue label={text("subcategory", "Subcategory")} value={selectedAppointment.details.join(", ")} /> : null}
            {selectedAppointment.notes ? <ReviewValue label={text("additionalNotes", "Additional notes")} value={selectedAppointment.notes} /> : null}
            {selectedAppointment.feedback ? <ReviewValue label={text("yourRating", "Your rating")} value={`${"★".repeat(selectedAppointment.feedback.rating)}${"☆".repeat(5 - selectedAppointment.feedback.rating)}`} /> : null}
            {selectedAppointment.feedback?.reason ? <ReviewValue label={text("feedbackIssueTitle", "What went wrong today?")} value={feedbackReasonText(selectedAppointment.feedback.reason, text)} /> : null}
            {selectedAppointment.feedback?.reasonDetail ? <ReviewValue label={text("feedbackIssueDetail", "Meeting issue") } value={feedbackIssueDetailText(selectedAppointment.feedback.reasonDetail, text)} /> : null}
            {selectedAppointment.feedback?.comment ? <ReviewValue label={text("feedbackComment", "Your comment on the experience")} value={selectedAppointment.feedback.comment} /> : null}
          </div>
        </div>
        {showDeleteConfirmation ? (
          <DeleteMeetingDialog
            onCancel={() => setShowDeleteConfirmation(false)}
            onConfirm={deleteMeeting}
            text={text}
          />
        ) : null}
      </AppointmentPage>
    );
  }

  if (view === "feedback" && selectedAppointment) {
    const isLowRating = feedbackRating === 1 || feedbackRating === 2;
    const feedbackComplete = feedbackRating > 0
      && (!isLowRating || (feedbackReason !== "" && (feedbackReason !== "organizedMeeting" || feedbackReasonDetail !== "")));
    const mainReasons: Array<{ id: FeedbackIssue; label: string }> = [
      { id: "organizedMeeting", label: text("feedbackIssueMeeting", "There was a problem related with the organized meeting") },
      { id: "advisor", label: text("feedbackIssueAdvisor", "There was a problem with the advisor") },
      { id: "expectedOutcome", label: text("feedbackIssueOutcome", "There was a problem related to the expected outcome of the meeting") },
      { id: "otherReason", label: text("feedbackIssueOther", "Other reason") },
    ];
    const meetingIssueDetails = [
      { id: "waitingTime", label: text("feedbackIssueWaitingTime", "The waiting time was not respected and I had to wait") },
      { id: "bureaucracy", label: text("feedbackIssueBureaucracy", "Too much bureaucracy") },
      { id: "technicalIssues", label: text("feedbackIssueTechnical", "Technical issues with the meeting") },
      { id: "privacy", label: text("feedbackIssuePrivacy", "There was no privacy for the meeting") },
    ];
    return (
      <AppointmentPage
        title={text("feedbackTitle", "Your feedback matters")}
        onBack={handleBack}
        footer={<PrimaryButton labelSize="18" disabled={!feedbackComplete} onClick={saveFeedback}>{text("submit", "Submit")}</PrimaryButton>}
      >
        <div className="px-[24px] pb-[32px] pt-[8px]">
          <p className="uc-type-p1 text-[var(--uc-text)]">{text("feedbackIntro", "Help us become better and rate the appointment you just had.")}</p>
          <p className="mb-[16px] mt-[24px] uc-type-n4-strong text-[var(--uc-text)]">{text("ratePrompt", "Rate your appointment experience.")}</p>
          <div className="flex gap-[8px]" role="radiogroup" aria-label={text("ratePrompt", "Rate your appointment experience.")}>
            {Array.from({ length: 5 }, (_, index) => {
              const rating = index + 1;
              const selected = feedbackRating >= rating;
              return (
                <button key={rating} type="button" role="radio" aria-checked={feedbackRating === rating} aria-label={`${rating} ${text("stars", "stars")}`} onClick={() => {
                  setFeedbackRating(rating);
                  if (rating > 2) {
                    setFeedbackReason("");
                    setFeedbackReasonDetail("");
                  }
                }} className="grid size-[40px] shrink-0 place-items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
                    <path d="M18.5068 0.5L18.6152 0.852539L21.7383 11.002L29.082 10.9307H29.126C31.113 10.9307 32.8648 12.2434 33.4766 14.168L33.585 14.5088L33.2969 14.7217L24.876 20.9307L27.2148 28.1299C27.8414 30.0632 27.1791 32.1957 25.5674 33.4004L25.2656 33.626L24.9658 33.3984L16.667 27.1006L10.4648 32.5518L10.4521 32.5635L10.4375 32.5732C9.62789 33.1908 8.6684 33.4999 7.70703 33.5C6.76311 33.5 5.81922 33.2017 5.01855 32.6055L4.73242 32.3916L4.8418 32.0508L8.41309 20.9375L2.41016 16.5293C0.788007 15.3378 0.110591 13.2102 0.722656 11.2725L0.833984 10.9199L1.20312 10.9229L11.5488 11.002L13.7725 3.7793V3.77832C14.3718 1.83434 16.1326 0.500044 18.1377 0.5H18.5068Z" fill={selected ? "#007A91" : "none"} stroke={selected ? "#007A91" : "#626262"} />
                  </svg>
                </button>
              );
            })}
          </div>
          <div className="mt-[24px]">
            <TextAreaField
              id="appointment-feedback"
              label={text("feedbackComment", "Your comment on the experience.")}
              value={feedbackComment}
              onChange={setFeedbackComment}
              maxLength={500}
              helperText={text("feedbackHelper", "We may send you a more detailed email regarding this (to which you can respond only if you wish) as part of the same effort to measure customer satisfaction.")}
            />
          </div>
          {isLowRating ? (
            <section className="mt-[28px]" aria-labelledby="feedback-issue-title">
              <h2 id="feedback-issue-title" className="uc-type-n4-strong text-[var(--uc-text)]">{text("feedbackIssueTitle", "What went wrong today?")}</h2>
              <div className="mt-[14px]" role="radiogroup" aria-labelledby="feedback-issue-title">
                {mainReasons.map((reason) => (
                  <div key={reason.id}>
                    <FeedbackReasonOption
                      selected={feedbackReason === reason.id}
                      label={reason.label}
                      onSelect={() => {
                        setFeedbackReason(reason.id);
                        if (reason.id !== "organizedMeeting") setFeedbackReasonDetail("");
                      }}
                    />
                    {reason.id === "organizedMeeting" && feedbackReason === "organizedMeeting" ? (
                      <div className="ml-[28px] border-l border-[var(--uc-border-muted)] pl-[12px]" role="radiogroup" aria-label={text("feedbackIssueMeeting", "Organized meeting issue")}>
                        {meetingIssueDetails.map((detail) => (
                          <FeedbackReasonOption
                            key={detail.id}
                            selected={feedbackReasonDetail === detail.id}
                            label={detail.label}
                            onSelect={() => setFeedbackReasonDetail(detail.id)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </AppointmentPage>
    );
  }

  if (view === "feedback-success") {
    return (
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]">
        <main className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[24px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ paddingTop: "calc(var(--uc-phone-top-reserve, 54px) + 16px)" }}>
          <h1 className="uc-type-h1 text-[var(--uc-text)]">{text("feedbackSuccessTitle", "Your feedback was successfully sent")}</h1>
          <div className="my-[52px] flex justify-center"><div className="grid size-[96px] place-items-center rounded-full border-[6px] border-[#43854f] text-[#43854f]"><AppIcon name="check" size={56} color="#43854f" /></div></div>
          <p className="uc-type-n4-strong text-[var(--uc-text)]">{text("feedbackThanks", "Thank you for letting us know")}</p>
          <p className="mt-[4px] uc-type-p1 text-[var(--uc-text)]">{text("feedbackNext", "We are collecting all the feedback and we are making it better for your next meeting.")}</p>
        </main>
        <footer className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[20px] pt-[12px]">
          <PrimaryButton labelSize="18" onClick={() => setView("list")}>{text("okGotIt", "Ok, got it")}</PrimaryButton>
        </footer>
      </div>
    );
  }

  return <div className="h-full w-full bg-[var(--uc-surface)]" />;
}

function MeetingTypeChoice({ selected, type, title, description, detail, onSelect }: {
  selected: boolean;
  type: AppointmentMeetingType;
  title: string;
  description: string;
  detail?: string;
  onSelect: () => void;
}) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className="flex w-full items-center gap-[16px] text-left">
      <span className="grid size-[32px] shrink-0 place-items-center">
        {type === "branch" ? <BranchMeetingIcon /> : <OnlineMeetingIcon />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block uc-type-n5-strong uppercase text-[var(--uc-text)]">{title}</span>
        <span className="mt-[3px] block uc-type-n5 text-[var(--uc-text)]">{description}</span>
        {detail ? <span className="mt-[2px] block uc-type-n5 text-[var(--uc-text)]">{detail}</span> : null}
      </span>
      <AppIcon name={selected ? "radio-selected" : "radio-unselected"} size={24} color={selected ? "var(--uc-action)" : "var(--uc-text)"} />
    </button>
  );
}

function AdvisorSummary({ advisorName }: { advisorName: string }) {
  return (
    <div className="flex items-center gap-[16px]">
      <img src={advisorImage} alt={advisorName} className="size-[64px] rounded-full object-cover" />
      <div>
        <p className="uc-type-n5-strong uppercase text-[var(--uc-text)]">Your advisor</p>
        <p className="mt-[2px] uc-type-n5 text-[var(--uc-text)]">{advisorName}</p>
      </div>
    </div>
  );
}

function FeedbackReasonOption({ selected, label, onSelect }: {
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className="flex min-h-[48px] w-full items-center gap-[16px] py-[8px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
      <span className="grid size-[24px] shrink-0 place-items-center rounded-full border border-[#262626] bg-[var(--uc-surface)]">
        {selected ? <span className="size-[10px] rounded-full bg-[#007A91]" /> : null}
      </span>
      <span className="min-w-0 flex-1 uc-type-p1 text-[var(--uc-text)]">{label}</span>
    </button>
  );
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

function AppointmentListRow({ appointment, locale, onClick }: {
  appointment: AppointmentRecord;
  locale: string;
  onClick: () => void;
}) {
  const date = formatAppointmentDateShort(appointment.appointmentDate, locale);
  const type = appointment.meetingType === "branch" ? "Branch Meeting" : "Online Meeting";
  return (
    <button type="button" onClick={onClick} className="flex min-h-[80px] w-full items-center gap-[16px] py-[12px] text-left">
      <span className="w-[28px] shrink-0 text-center">
        <span className="block uc-type-n4-strong text-[var(--uc-text)]">{date.day}</span>
        <span className="block uc-type-n6-strong text-[var(--uc-text-muted)]">{date.month}</span>
      </span>
      <span className="grid size-[32px] shrink-0 place-items-center">
        {appointment.meetingType === "branch" ? <BranchMeetingIcon /> : <OnlineMeetingIcon />}
      </span>
      <span className="min-w-0 flex-1 text-right">
        <span className="block uc-type-n5 text-[var(--uc-text)]">{type} - {appointment.selectedTime}</span>
        <span className="mt-[2px] block truncate uc-type-n4-strong text-[var(--uc-text)]">{appointment.reasons.join(", ")}</span>
        <span className="mt-[2px] block truncate uc-type-n6-strong uppercase text-[var(--uc-text-muted)]">{appointment.advisorName}</span>
      </span>
    </button>
  );
}

function DeleteMeetingDialog({ onCancel, onConfirm, text }: {
  onCancel: () => void;
  onConfirm: () => void;
  text: (key: string, fallback: string) => string;
}) {
  return (
    <div className="absolute inset-0 z-[60] grid place-items-center bg-[rgb(0_0_0_/_0.52)] px-[52px]" role="presentation">
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-meeting-title" className="w-full overflow-hidden rounded-[14px] bg-white text-center shadow-xl">
        <div className="px-[20px] pb-[20px] pt-[22px]">
          <h2 id="delete-meeting-title" className="uc-type-n4-strong text-[var(--uc-text)]">{text("deleteConfirmTitle", "Are you sure you want to delete the meeting?")}</h2>
          <p className="mt-[8px] uc-type-n6 text-[var(--uc-text)]">{text("deleteConfirmBody", "You will have to reschedule a new one")}</p>
        </div>
        <div className="grid grid-cols-2 border-t border-[var(--uc-border-muted)]">
          <button type="button" onClick={onConfirm} className="h-[44px] border-r border-[var(--uc-border-muted)] uc-type-n4 text-[#1685d9]">{text("ok", "OK")}</button>
          <button type="button" onClick={onCancel} className="h-[44px] uc-type-n4 text-[#1685d9]">{text("cancel", "Cancel")}</button>
        </div>
      </section>
    </div>
  );
}
