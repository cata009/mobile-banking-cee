/**
 * HU Kids request-money and send-money flows.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx.
 */
import { useState } from "react";
import { AppIcon } from "@/app/components/icons";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import { cn } from "@/app/components/ui/utils";
import { type HuThemePreset } from "../theme";
import { HU_MONEY_REASONS, HU_SEND_APPROVAL_THRESHOLD, HU_SEND_CONTACTS } from "../data";
import { formatHuKidsAmount } from "../money";
import type { HuMoneyReason, HuSendContact } from "../types";

export function HuRequestMoneyScreen({
  onBack,
  onSubmit,
  theme,
}: {
  onBack: () => void;
  onSubmit: (amount: number, reason: HuMoneyReason, note: string) => void;
  theme: HuThemePreset;
}) {
  const [amount, setAmount] = useState("3000");
  const [reason, setReason] = useState<HuMoneyReason>("Food");
  const [note, setNote] = useState("");
  const parsedAmount = Number(amount.replace(/[^\d]/g, ""));
  const canSubmit = parsedAmount > 0;
  const headerVariant = theme.id === "nordlys" || theme.id === "blue-lines" ? "dark" : "transparent";

  const submitRequest = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit(parsedAmount, reason, note);
    setNote("");
  };

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <PageHeader
          compact
          includeSafeArea
          onBack={onBack}
          showHelp={false}
          title="Request money"
          variant={headerVariant}
          collapsedTitleProgress={1}
        />

        <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[24px] pb-[36px] pt-[18px]">
          <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
            <p className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">
              Ask your parent for money
            </p>
            <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
              Your request will show as a pending action until it is approved.
            </p>

            <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              Amount
            </label>
            <div className="mt-[8px] flex h-[58px] items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] focus-within:ring-2 focus-within:ring-[var(--uc-action)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--uc-app-bg)]">
              <input
                className="min-w-0 flex-1 bg-transparent text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)] outline-none"
                inputMode="numeric"
                onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))}
                value={amount}
              />
              <span className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF</span>
            </div>

            <div className="mt-[18px]">
              <p className="text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
                Reason
              </p>
              <div className="mt-[10px] flex flex-wrap gap-[8px]">
                {HU_MONEY_REASONS.map((item) => {
                  const selected = item === reason;

                  return (
                    <button
                      key={item}
                      className={cn(
                        "h-[36px] rounded-full px-[14px] text-[13px] font-bold leading-[16px] tracking-[0] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
                        selected
                          ? "bg-[var(--hu-theme-accent-strong)] text-[var(--uc-text-inverse)]"
                          : "bg-[var(--hu-theme-control-bg)] text-[var(--uc-text)]"
                      )}
                      onClick={() => setReason(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              Note
            </label>
            <textarea
              className="mt-[8px] h-[92px] w-full resize-none rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] py-[12px] text-[15px] font-normal leading-[19px] tracking-[0] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
              onChange={(event) => setNote(event.target.value)}
              placeholder="Example: lunch after school"
              value={note}
            />

            <PrimaryButton className="mt-[18px] !w-full" disabled={!canSubmit} onClick={submitRequest}>
              Send request
            </PrimaryButton>
          </section>
        </main>
    </div>
  );
}

export function HuSendMoneyScreen({
  onBack,
  onSubmit,
  theme,
}: {
  onBack: () => void;
  onSubmit: (contactName: HuSendContact, amount: number, note: string) => void;
  theme: HuThemePreset;
}) {
  const [contactName, setContactName] = useState<HuSendContact>("Anna");
  const [amount, setAmount] = useState("1200");
  const [note, setNote] = useState("Class project tickets");
  const parsedAmount = Number(amount.replace(/[^\d]/g, ""));
  const canSubmit = parsedAmount > 0;
  const needsApproval = parsedAmount > HU_SEND_APPROVAL_THRESHOLD;
  const headerVariant = theme.id === "nordlys" || theme.id === "blue-lines" ? "dark" : "transparent";

  const submitTransfer = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit(contactName, parsedAmount, note);
  };

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <PageHeader
          collapsedTitleProgress={1}
          compact
          includeSafeArea
          onBack={onBack}
          showHelp={false}
          title="Send money"
          variant={headerVariant}
        />

        <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[24px] pb-[36px] pt-[18px]">
          <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
            <div className="flex items-start gap-[12px]">
              <span
                className={cn(
                  "grid size-[44px] shrink-0 place-items-center rounded-full",
                  needsApproval
                    ? "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_22%,var(--hu-theme-card-bg))] text-[color-mix(in_srgb,var(--uc-yellow-gold)_78%,var(--uc-text))]"
                    : "bg-[color-mix(in_srgb,var(--hu-theme-accent)_14%,var(--hu-theme-card-bg))] text-[var(--hu-theme-accent-strong)]",
                )}
              >
                <AppIcon name={needsApproval ? "shield-check" : "send"} size={24} />
              </span>
              <div className="min-w-0">
                <p className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">
                  {needsApproval ? "This transfer needs approval" : "Ready to send"}
                </p>
                <p className="mt-[6px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                  {needsApproval
                    ? `Above ${formatHuKidsAmount(HU_SEND_APPROVAL_THRESHOLD)}, so Mom approves first.`
                    : "Small transfers can finish right away."}
                </p>
              </div>
            </div>

            <div className="mt-[18px]">
              <p className="text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
                Person
              </p>
              <div className="mt-[10px] grid grid-cols-3 gap-[8px]">
                {HU_SEND_CONTACTS.map((contact) => {
                  const selected = contact === contactName;

                  return (
                    <button
                      key={contact}
                      aria-pressed={selected}
                      className={cn(
                        "h-[36px] rounded-full px-[12px] text-[13px] font-bold leading-[16px] tracking-[0] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
                        selected
                          ? "bg-[var(--hu-theme-accent-strong)] text-[var(--uc-text-inverse)]"
                          : "bg-[var(--hu-theme-control-bg)] text-[var(--uc-text)]",
                      )}
                      onClick={() => setContactName(contact)}
                      type="button"
                    >
                      {contact}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              Amount
            </label>
            <div className="mt-[8px] flex h-[58px] items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] focus-within:ring-2 focus-within:ring-[var(--uc-action)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--uc-app-bg)]">
              <input
                className="min-w-0 flex-1 bg-transparent text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)] outline-none"
                inputMode="numeric"
                onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))}
                value={amount}
              />
              <span className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF</span>
            </div>

            <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              Note
            </label>
            <textarea
              className="mt-[8px] h-[92px] w-full resize-none rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] py-[12px] text-[15px] font-normal leading-[19px] tracking-[0] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
              value={note}
            />

            <PrimaryButton className="mt-[18px] !w-full" disabled={!canSubmit} onClick={submitTransfer}>
              {needsApproval ? "Ask Mom to approve" : "Send money"}
            </PrimaryButton>
          </section>

        </main>
    </div>
  );
}
