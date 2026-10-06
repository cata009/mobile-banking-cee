import { useEffect, useState } from "react";
import PrimaryButton from "@/app/components/PrimaryButton";
import AutoGrowTextArea from "@/app/components/AutoGrowTextArea";
import { AppIcon } from "@/app/components/icons";
import { BottomSheet } from "@/app/components/BottomSheet";
import { useLanguage } from "@/app/contexts/LanguageContext";
import type { CountryId } from "@/app/state/demoTypes";
import {
  AppointmentCalendarSheet,
  AppointmentFooter,
  AppointmentPage,
  AppointmentSelectionSheet,
  FieldValue,
  FormCheckbox,
  ReviewSection,
  ReviewValue,
  SectionHeading,
  type SelectionSheetKind,
} from "./AppointmentScreen";
import {
  formatAppointmentDate,
  getAppointmentDateLocale,
  getInitialAppointmentDate,
} from "./appointmentModel";

interface RequestCallScreenProps {
  country: CountryId;
  onBack: () => void;
}

type RequestCallView = "form" | "notes" | "review" | "success";

interface RequestCallDraft {
  reasons: string[];
  details: string[];
  callbackDate: string;
  intervals: string[];
  countryCode: string;
  phoneNumber: string;
  notes: string;
}

const CONTACT_INTERVALS = ["09:00 - 11:00", "11:00 - 13:00", "13:00 - 15:00", "15:00 - 17:00"] as const;

const CALL_NUMBER_BY_COUNTRY: Record<CountryId, { countryCode: string; mobileNumber: string }> = {
  CZ: { countryCode: "+420", mobileNumber: "602123456" },
  SK: { countryCode: "+421", mobileNumber: "901234567" },
  RO: { countryCode: "+40", mobileNumber: "721234567" },
  RS: { countryCode: "+381", mobileNumber: "641234567" },
  HU: { countryCode: "+36", mobileNumber: "301234567" },
  BA: { countryCode: "+387", mobileNumber: "61123456" },
  BA_BL: { countryCode: "+387", mobileNumber: "61123456" },
  SI: { countryCode: "+386", mobileNumber: "401234567" },
};

function createCallDraft(country: CountryId): RequestCallDraft {
  const phone = CALL_NUMBER_BY_COUNTRY[country];
  return {
    reasons: [],
    details: [],
    callbackDate: getInitialAppointmentDate(),
    intervals: [],
    countryCode: phone.countryCode,
    phoneNumber: phone.mobileNumber,
    notes: "",
  };
}

function validPhone(phoneNumber: string): boolean {
  const digits = phoneNumber.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export default function RequestCallScreen({ country, onBack }: RequestCallScreenProps) {
  const { t, language } = useLanguage();
  const text = (key: string, fallback: string) => t(`requestCall.${key}`, fallback);
  const locale = getAppointmentDateLocale(country, language);
  const [view, setView] = useState<RequestCallView>("form");
  const [draft, setDraft] = useState(() => createCallDraft(country));
  const [selectionSheet, setSelectionSheet] = useState<SelectionSheetKind | null>(null);
  const [selectionDraft, setSelectionDraft] = useState<string[]>([]);
  const [intervalSheetOpen, setIntervalSheetOpen] = useState(false);
  const [intervalSelection, setIntervalSelection] = useState<string[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    setDraft(createCallDraft(country));
    setView("form");
  }, [country]);

  const updateDraft = (changes: Partial<RequestCallDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
  };

  const openSelection = (kind: SelectionSheetKind) => {
    setSelectionDraft(kind === "reason" ? draft.reasons : draft.details);
    setSelectionSheet(kind);
  };

  const toggleSelection = (value: string) => {
    setSelectionDraft((current) => current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]);
  };

  const confirmSelection = () => {
    if (selectionSheet === "reason") updateDraft({ reasons: selectionDraft, details: [] });
    if (selectionSheet === "detail") updateDraft({ details: selectionDraft });
    setSelectionSheet(null);
  };

  const openIntervals = () => {
    setIntervalSelection(draft.intervals);
    setIntervalSheetOpen(true);
  };

  const toggleInterval = (value: string) => {
    setIntervalSelection((current) => current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]);
  };

  const confirmIntervals = () => {
    updateDraft({ intervals: intervalSelection });
    setIntervalSheetOpen(false);
  };

  const handleBack = () => {
    if (view === "form") { onBack(); return; }
    if (view === "notes") { setView("form"); return; }
    if (view === "review") { setView("notes"); return; }
    onBack();
  };

  if (view === "form") {
    const reasonValue = draft.reasons.join(", ");
    const detailsValue = draft.details.join(", ");
    const canContinue = draft.reasons.length > 0
      && draft.details.length > 0
      && draft.callbackDate.length > 0
      && draft.intervals.length > 0
      && validPhone(draft.phoneNumber);

    return (
      <AppointmentPage
        title={text("title", "Request a call")}
        onBack={handleBack}
        footer={<PrimaryButton labelSize="18" disabled={!canContinue} onClick={() => setView("notes")}>{text("continue", "Continue")}</PrimaryButton>}
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
            {intervalSheetOpen ? (
              <BottomSheet
                title={text("contactIntervalsTitle", "Contact me during")}
                onClose={() => setIntervalSheetOpen(false)}
                className="px-[24px] pb-[20px]"
                headerClassName="mb-[12px]"
                footer={<PrimaryButton labelSize="18" onClick={confirmIntervals}>{text("select", "Select")}</PrimaryButton>}
              >
                <div className="pb-[8px]">
                  <p className="mb-[8px] uc-type-n5-strong uppercase text-[var(--uc-text)]">{text("selectIntervals", "Select one or more intervals")}</p>
                  {CONTACT_INTERVALS.map((interval) => (
                    <FormCheckbox key={interval} label={interval} checked={intervalSelection.includes(interval)} onChange={() => toggleInterval(interval)} />
                  ))}
                </div>
              </BottomSheet>
            ) : null}
            <AppointmentCalendarSheet
              open={calendarOpen}
              selectedDate={draft.callbackDate}
              locale={locale}
              title={text("preferredDate", "Preferred callback date")}
              autoSelectOnDayPress
              showTodayAction
              todayLabel={text("today", "Today")}
              showYearNavigation={false}
              compactMonthLabel
              onClose={() => setCalendarOpen(false)}
              onConfirm={(callbackDate) => updateDraft({ callbackDate })}
            />
          </>
        )}
      >
        <div className="px-[24px] pb-[24px] pt-[20px]">
          <SectionHeading>{text("reasonSection", "Contact reason")}</SectionHeading>
          <div className="mb-[28px]">
            <FieldValue
              label={text("reasonPrompt", "What do you want to talk about?")}
              value={reasonValue}
              helper={text("reasonHelper", "This will help the advisor to be prepared for the meeting")}
              onClick={() => openSelection("reason")}
            />
            {draft.reasons.length > 0 ? (
              <div className="mt-[16px]">
                <FieldValue
                  label={text("detailPrompt", "Give us more details about your request")}
                  value={detailsValue}
                  helper={text("detailHelper", "This will help the advisor to be prepared with everything that is required")}
                  onClick={() => openSelection("detail")}
                />
              </div>
            ) : null}
          </div>

          <SectionHeading>{text("preferredMoment", "Preferred contact moment")}</SectionHeading>
          <div className="mb-[24px]">
            <FieldValue
              label={text("preferredDate", "Preferred callback date")}
              value={formatAppointmentDate(draft.callbackDate, locale)}
              helper={text("dateHelper", "We’ll try to call you on the date you choose, but we cannot guarantee it. We’re closed on Bank Holidays")}
              trailingIconName="insurance-calendar"
              onClick={() => setCalendarOpen(true)}
            />
          </div>
          <div className="mb-[28px]">
            <FieldValue
              label={text("contactMeDuring", "Contact me during")}
              value={draft.intervals.join(", ")}
              helper={text("intervalHelper", "We’ll try to call you during the time you select.")}
              onClick={openIntervals}
            />
          </div>

          <SectionHeading>{text("yourContactNumber", "Your contact number")}</SectionHeading>
          <div className="grid grid-cols-[72px_1fr] gap-[16px]">
            <label className="border-b border-[var(--uc-border)] py-[6px]">
              <span className="block uc-type-n5 text-[var(--uc-text-muted)]">{text("country", "Country")}</span>
              <span className="mt-[2px] block uc-type-n4 text-[var(--uc-text)]">{draft.countryCode}</span>
            </label>
            <label className="border-b border-[var(--uc-border)] py-[6px]">
              <span className="block uc-type-n5 text-[var(--uc-text-muted)]">{text("mobileNumber", "Mobile number")}</span>
              <input
                type="tel"
                inputMode="tel"
                value={draft.phoneNumber}
                onChange={(event) => updateDraft({ phoneNumber: event.target.value })}
                className="mt-[2px] w-full border-0 bg-transparent p-0 uc-type-n4 text-[var(--uc-text)] outline-none"
                aria-label={text("mobileNumber", "Mobile number")}
              />
            </label>
          </div>
          <p className="mt-[6px] uc-type-n5 text-[var(--uc-text-muted)]">{text("phoneHelper", "We will call you on the number you provide")}</p>
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
            <PrimaryButton labelSize="18" disabled={draft.notes.trim().length === 0} onClick={() => setView("review")}>{text("continue", "Continue")}</PrimaryButton>
          </AppointmentFooter>
        )}
      >
        <div className="px-[24px] pt-[24px]">
          <label htmlFor="call-request-notes" className="block uc-type-n4 text-[var(--uc-text)]">{text("additionalNotes", "Additional notes")}</label>
          <AutoGrowTextArea id="call-request-notes" value={draft.notes} onChange={(notes) => updateDraft({ notes })} maxLength={500} className="mt-[4px] w-full resize-none border-0 border-b border-[var(--uc-border)] bg-transparent px-0 py-[4px] uc-type-n4 leading-[20px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]" />
          <p className="mt-[6px] uc-type-n5 text-[var(--uc-text-muted)]">{text("notesHelper", "Our colleagues will take care of your notes and get prepared with all the requested answers")}</p>
        </div>
      </AppointmentPage>
    );
  }

  if (view === "review") {
    return (
      <AppointmentPage
        title={text("reviewTitle", "Request a call review")}
        onBack={handleBack}
        footer={<PrimaryButton labelSize="18" onClick={() => setView("success")}>{text("confirm", "Confirm")}</PrimaryButton>}
      >
        <div className="px-[24px] pb-[24px] pt-[8px]">
          <p className="mb-[24px] uc-type-n5 text-[var(--uc-text-muted)]">{text("reviewIntro", "Review the details of the appointment before confirming")}</p>
          <ReviewSection title={text("reasonSection", "Contact reason")}>
            <ReviewValue label={text("category", "Category")} value={draft.reasons.join(", ")} />
            <ReviewValue label={text("subcategory", "Subcategory")} value={draft.details.join(", ")} />
            {draft.notes.trim() ? <ReviewValue label={text("reviewNotes", "Additional notes")} value={draft.notes.trim()} /> : null}
          </ReviewSection>
          <ReviewSection title={text("contactDetails", "Your contact details")}>
            <ReviewValue label={text("yourPhoneNumber", "Your phone number")} value={`${draft.countryCode} ${draft.phoneNumber}`} />
            <ReviewValue label={text("preferredDate", "Preferred callback date")} value={formatAppointmentDate(draft.callbackDate, locale)} />
            <ReviewValue label={text("contactMeDuring", "Contact me during")} value={draft.intervals.join(", ")} />
          </ReviewSection>
        </div>
      </AppointmentPage>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <main className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[24px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ paddingTop: "calc(var(--uc-phone-top-reserve, 54px) + 16px)" }}>
        <h1 className="uc-type-h1 text-[var(--uc-text)]">{text("successTitle", "Request a call successfully confirmed")}</h1>
        <div className="my-[52px] flex justify-center"><div className="grid size-[96px] place-items-center rounded-full border-[6px] border-[#43854f] text-[#43854f]"><AppIcon name="check" size={56} color="#43854f" /></div></div>
        <p className="mb-[18px] uc-type-n4-strong text-[var(--uc-text)]">{text("successThanks", "Thank you for requesting this contact with us")}</p>
        <p className="uc-type-p1 text-[var(--uc-text)]">{text("successBody", "Our advisor will try to contact you in the specified interval. If there is no answer, the advisor will call again the following day in the same interval.")}</p>
      </main>
      <footer className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[20px] pt-[12px]">
        <PrimaryButton labelSize="18" onClick={onBack}>{text("okGotIt", "Ok, got it")}</PrimaryButton>
      </footer>
    </div>
  );
}
