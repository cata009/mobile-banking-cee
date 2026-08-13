import { useMemo, useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AppIcon } from "@/app/components/icons";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import type { CurrentAccount, SavingAccount } from "@/data/products";

type RepeatCadence = "weekly" | "monthly" | "quarterly";

interface StandingOrderDraft {
  startDate: string;
  repeat: RepeatCadence;
  endsOn: "never" | "date";
  endDate: string;
}

const PRESET_AMOUNTS = [1_000, 2_500, 5_000] as const;

function isoToday() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${isoDate}T00:00:00`));
}

function repeatLabel(repeat: RepeatCadence) {
  return repeat === "weekly" ? "Weekly" : repeat === "quarterly" ? "Quarterly" : "Monthly";
}

function StandingOrderSheet({ onClose, onConfirm }: { onClose: () => void; onConfirm: (draft: StandingOrderDraft) => void }) {
  const [draft, setDraft] = useState<StandingOrderDraft>({ startDate: isoToday(), repeat: "monthly", endsOn: "never", endDate: "" });

  return (
    <BottomSheet title="Schedule recurring transfer" onClose={onClose} closeLabel="Close schedule">
      <div className="flex flex-col gap-[16px] pb-[24px]">
        <label className="flex flex-col gap-[6px] text-[13px] font-bold leading-[16px] text-[var(--uc-text-muted)]">
          Start date
          <input aria-label="Start date" type="date" value={draft.startDate} min={isoToday()} onChange={(event) => setDraft((value) => ({ ...value, startDate: event.target.value }))} className="h-[48px] rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] text-[15px] font-bold leading-[18px] text-[var(--uc-text)]" />
        </label>
        <label className="flex flex-col gap-[6px] text-[13px] font-bold leading-[16px] text-[var(--uc-text-muted)]">
          Repeat
          <select aria-label="Repeat" value={draft.repeat} onChange={(event) => setDraft((value) => ({ ...value, repeat: event.target.value as RepeatCadence }))} className="h-[48px] rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] text-[15px] font-bold leading-[18px] text-[var(--uc-text)]">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </label>
        <label className="flex flex-col gap-[6px] text-[13px] font-bold leading-[16px] text-[var(--uc-text-muted)]">
          End
          <select aria-label="End" value={draft.endsOn} onChange={(event) => setDraft((value) => ({ ...value, endsOn: event.target.value as StandingOrderDraft["endsOn"] }))} className="h-[48px] rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] text-[15px] font-bold leading-[18px] text-[var(--uc-text)]">
            <option value="never">Never</option>
            <option value="date">On a date</option>
          </select>
        </label>
        {draft.endsOn === "date" ? <label className="flex flex-col gap-[6px] text-[13px] font-bold leading-[16px] text-[var(--uc-text-muted)]">End date<input aria-label="End date" type="date" value={draft.endDate} min={draft.startDate} onChange={(event) => setDraft((value) => ({ ...value, endDate: event.target.value }))} className="h-[48px] rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] text-[15px] font-bold leading-[18px] text-[var(--uc-text)]" /></label> : null}
        <PrimaryButton className="mt-[8px] !h-[48px] !w-full" onClick={() => onConfirm(draft)}>Confirm schedule</PrimaryButton>
      </div>
    </BottomSheet>
  );
}

function CompletionScreen({ title, description, onBack }: { title: string; description: string; onBack: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-[24px] pt-[84px] text-center">
      <span className="mx-auto grid size-[64px] place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-green-success)_16%,var(--uc-surface))] text-[var(--uc-green-success)]"><AppIcon name="check" size={32} /></span>
      <h2 className="mt-[20px] text-[24px] font-bold leading-[28px] text-[var(--uc-text)]">{title}</h2>
      <p className="mt-[8px] text-[15px] leading-[20px] text-[var(--uc-text-muted)]">{description}</p>
      <PrimaryButton className="mt-auto mb-[24px] !h-[48px] !w-full" onClick={onBack}>Back to Saving Account</PrimaryButton>
    </div>
  );
}

export default function SavingAccountAddMoneyFlow({
  savingAccount,
  sourceAccounts,
  country,
  onBack,
}: {
  savingAccount: SavingAccount;
  sourceAccounts: CurrentAccount[];
  country: CountryId;
  onBack: () => void;
}) {
  const [amountText, setAmountText] = useState("");
  const [sourceAccountId, setSourceAccountId] = useState(sourceAccounts[0]?.id ?? "");
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [scheduleSheetOpen, setScheduleSheetOpen] = useState(false);
  const [schedule, setSchedule] = useState<StandingOrderDraft | null>(null);
  const [completion, setCompletion] = useState<"money" | "schedule" | null>(null);
  const selectedSource = sourceAccounts.find((account) => account.id === sourceAccountId) ?? sourceAccounts[0];
  const amount = Number(amountText) || 0;
  const canSubmit = Boolean(selectedSource) && amount > 0 && amount <= (selectedSource?.balance ?? 0);
  const formattedAmount = useMemo(() => formatMoneyNumber(amount, country), [amount, country]);

  const appendDigit = (digit: string) => {
    setAmountText((current) => {
      if (digit === "." && current.includes(".")) return current;
      if (current.replace(/\D/g, "").length >= 10) return current;
      return `${current}${digit}`;
    });
  };

  const finish = () => setCompletion(schedule ? "schedule" : "money");

  return (
    <div data-saving-account-add-money className="absolute inset-0 z-[60] flex min-h-0 flex-col bg-[var(--uc-app-bg)]">
      <PageHeader compact includeSafeArea showHelp={false} title="Add money" onBack={completion ? () => setCompletion(null) : onBack} />
      {completion ? <CompletionScreen title={completion === "schedule" ? "Standing order created" : "Money added"} description={completion === "schedule" ? `${repeatLabel(schedule!.repeat)} transfer of ${formattedAmount} ${savingAccount.currency} starts on ${formatDate(schedule!.startDate)}.` : `${formattedAmount} ${savingAccount.currency} will be added from ${selectedSource?.name ?? "your account"}.`} onBack={onBack} /> : <main className="scrollbar-hide flex min-h-0 flex-1 flex-col px-[24px] pb-[20px]">
        <p className="pt-[6px] text-center text-[13px] leading-[16px] text-[var(--uc-text-muted)]">{savingAccount.name} · {savingAccount.accountNumber}</p>
        <div className="flex items-baseline justify-center gap-[6px] pt-[72px]">
          <p className={`font-bold leading-[52px] tracking-[0] ${amountText ? "text-[var(--uc-text)]" : "text-[var(--uc-text-muted)]"} text-[48px]`}>{amountText || "0"}</p>
          <span className="text-[16px] font-medium leading-[20px] text-[var(--uc-text-muted)]">{savingAccount.currency}</span>
        </div>
        <div className="mt-[16px] flex justify-center">
          <button type="button" aria-label="From account" onClick={() => setSourcePickerOpen(true)} className="flex items-center gap-[6px] rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] py-[8px] text-left">
            <span className="text-[13px] font-bold leading-[16px] text-[var(--uc-text)]">{selectedSource?.name ?? "No eligible account"}</span>
            {selectedSource ? <span className="text-[13px] leading-[16px] text-[var(--uc-text-muted)]">· {formatMoneyNumber(selectedSource.balance, country)} {selectedSource.currency}</span> : null}
            <AppIcon name="chevron-down" size={14} color="var(--uc-text-muted)" />
          </button>
        </div>
        {amount > (selectedSource?.balance ?? 0) ? <p className="mt-[10px] text-center text-[13px] leading-[16px] text-[var(--uc-status-red)]">Amount exceeds the available balance.</p> : null}
        <div className="flex-1" />
        {schedule ? <p className="mb-[12px] text-center text-[13px] leading-[16px] text-[var(--uc-text-muted)]">Standing order: <b className="text-[var(--uc-text)]">{repeatLabel(schedule.repeat)}, from {formatDate(schedule.startDate)}{schedule.endsOn === "date" && schedule.endDate ? ` until ${formatDate(schedule.endDate)}` : ""}</b></p> : null}
        <div className="flex items-center gap-[8px]">
          <button type="button" aria-label="Schedule recurring transfer" onClick={() => setScheduleSheetOpen(true)} className={`grid size-[48px] shrink-0 place-items-center rounded-[12px] border ${schedule ? "border-transparent bg-[var(--uc-action)] text-[var(--uc-text-inverse)]" : "border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[var(--uc-text)]"}`}><AppIcon name="calendar-days" size={22} color="currentColor" /></button>
          <PrimaryButton className="!h-[48px] !flex-1" disabled={!canSubmit} onClick={finish}>{schedule ? "Create standing order" : "Add money"}</PrimaryButton>
        </div>
        <div className="mt-[12px] grid grid-cols-3 gap-[12px]">
          {PRESET_AMOUNTS.map((preset) => <button key={preset} type="button" onClick={() => setAmountText(String(preset))} className="h-[44px] rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[15px] font-bold leading-[18px] text-[var(--uc-text)]">{formatMoneyNumber(preset, country)} {savingAccount.currency}</button>)}
        </div>
        <div className="mt-[12px] grid grid-cols-3 gap-[8px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((digit) => <button key={digit} type="button" onClick={() => appendDigit(digit)} className="flex h-[56px] items-center justify-center rounded-[12px] text-[28px] font-semibold leading-[30px] text-[var(--uc-text)] active:bg-[var(--uc-surface-muted)]">{digit}</button>)}
          {amountText ? <button type="button" aria-label="Delete amount" onClick={() => setAmountText((current) => current.slice(0, -1))} className="flex h-[56px] items-center justify-center rounded-[12px] text-[var(--uc-text)]"><AppIcon name="keypad-backspace" size={28} /></button> : <div aria-hidden="true" className="h-[56px]" />}
        </div>
      </main>}
      {sourcePickerOpen ? <BottomSheet title="From account" onClose={() => setSourcePickerOpen(false)} closeLabel="Close account picker"><div className="flex flex-col gap-[4px]">{sourceAccounts.map((account) => <button key={account.id} type="button" onClick={() => { setSourceAccountId(account.id); setSourcePickerOpen(false); }} className="flex items-center justify-between rounded-[10px] px-[12px] py-[14px] text-left hover:bg-[var(--uc-surface-muted)]"><span><span className="block text-[15px] font-bold leading-[18px] text-[var(--uc-text)]">{account.name}</span><span className="mt-[2px] block text-[13px] leading-[16px] text-[var(--uc-text-muted)]">{formatMoneyNumber(account.balance, country)} {account.currency}</span></span><AppIcon name={account.id === selectedSource?.id ? "radio-selected" : "radio-unselected"} size={24} color="var(--uc-action)" /></button>)}</div></BottomSheet> : null}
      {scheduleSheetOpen ? <StandingOrderSheet onClose={() => setScheduleSheetOpen(false)} onConfirm={(draft) => { setSchedule(draft); setScheduleSheetOpen(false); }} /> : null}
    </div>
  );
}
