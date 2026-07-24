/**
 * RO Teens "ask a parent" flows: request money and request a top-up.
 * Both always create a pending approval addressed to a parent.
 */
import { useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import { cn } from "@/app/components/ui/utils";
import { RO_TEEN_PROFILE } from "../data";
import { RoAmountField, RoCard } from "../ui";

export type RoRequestReason = "Mâncare" | "Școală" | "Transport" | "Distracție" | "Altele";

const REASONS: RoRequestReason[] = ["Mâncare", "Școală", "Transport", "Distracție", "Altele"];

export function RoRequestScreen({
  mode = "request",
  onBack,
  onSubmit,
}: {
  mode?: "request" | "topup";
  onBack: () => void;
  onSubmit: (amount: number, reason: RoRequestReason, note: string) => void;
}) {
  const [amount, setAmount] = useState(mode === "topup" ? "50" : "30");
  const [reason, setReason] = useState<RoRequestReason>(mode === "topup" ? "Altele" : "Mâncare");
  const [note, setNote] = useState("");
  const parsed = Number(amount || 0);
  const canSubmit = parsed > 0;

  const title = mode === "topup" ? "Reîncarcă" : "Cere bani";
  const heading = mode === "topup" ? `Cere-i ${RO_TEEN_PROFILE.parentName} un top-up` : `Cere-i bani ${RO_TEEN_PROFILE.parentName}`;
  const helper =
    mode === "topup"
      ? "Cererea de reîncărcare apare la Mama și banii ajung pe card după ce aprobă."
      : "Cererea ta apare ca „în așteptare” până când Mama o aprobă sau o refuză.";

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <PageHeader
        compact
        includeSafeArea
        collapsedTitleProgress={1}
        showHelp={false}
        variant="transparent"
        title={title}
        onBack={onBack}
      />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[36px] pt-[10px]">
        <RoCard className="space-y-[18px]">
          <div>
            <p className="text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">{heading}</p>
            <p className="mt-[6px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{helper}</p>
          </div>

          <RoAmountField value={amount} onChange={setAmount} chips={[20, 50, 100]} />

          <div>
            <p className="mb-[10px] text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
              Motiv
            </p>
            <div className="flex flex-wrap gap-[8px]">
              {REASONS.map((item) => {
                const selected = item === reason;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={selected}
                    className={cn(
                      "h-[36px] rounded-full px-[14px] text-[13px] font-bold transition",
                      selected
                        ? "bg-[var(--hu-theme-accent-strong)] text-[var(--uc-text-inverse)]"
                        : "bg-[var(--hu-theme-control-bg)] text-[var(--uc-text)]",
                    )}
                    onClick={() => setReason(item)}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-[8px] block text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
              Mesaj pentru Mama
            </label>
            <textarea
              className="h-[88px] w-full resize-none rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] py-[12px] text-[15px] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)] focus:ring-2 focus:ring-[var(--hu-theme-accent-strong)]"
              placeholder="Ex: pentru excursia de vineri"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <PrimaryButton
            className="!w-full"
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return;
              onSubmit(parsed, reason, note.trim());
            }}
          >
            Trimite cererea
          </PrimaryButton>
        </RoCard>
      </main>
    </div>
  );
}
