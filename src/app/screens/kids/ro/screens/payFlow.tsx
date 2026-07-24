/**
 * RO Teens pay flow — the payments centrepiece.
 *
 * A curated-payee, parent-approval payment in three steps:
 *   pick payee → enter amount (live decision) → instant / pending result.
 * There is no free IBAN entry: teens only ever pay someone already on the list.
 */
import { useMemo, useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AppIcon } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import { formatRon } from "../money";
import { RO_PAYEE_CATEGORY_LABEL, RO_PAYEES, decidePayment } from "../payees";
import { RoAmountField, RoCard, RoDecisionBanner, RoPayeeAvatar } from "../ui";
import type { PaymentDecision, RoPayee, RoPayeeCategory } from "../types";

export type RoPayResult = {
  payee: RoPayee;
  amount: number;
  note: string;
  decision: PaymentDecision;
};

const CATEGORY_ORDER: RoPayeeCategory[] = ["family", "friend", "merchant", "subscription"];

export function RoPayFlow({
  title = "Plătește",
  headerVariant = "transparent",
  categories,
  initialPayeeId,
  weeklyRemaining,
  onBack,
  onSubmit,
}: {
  title?: string;
  headerVariant?: "transparent" | "dark";
  /** Restrict the picker (e.g. only family+friends for "Trimite"). */
  categories?: RoPayeeCategory[];
  initialPayeeId?: string;
  weeklyRemaining: number;
  onBack: () => void;
  /** Persist the movement in app state; returns nothing. */
  onSubmit: (result: RoPayResult) => void;
}) {
  const allowedCategories = categories ?? CATEGORY_ORDER;
  const payees = useMemo(
    () => RO_PAYEES.filter((payee) => allowedCategories.includes(payee.category)),
    [allowedCategories],
  );

  const [step, setStep] = useState<"pick" | "amount" | "result">(initialPayeeId ? "amount" : "pick");
  const [payeeId, setPayeeId] = useState<string>(initialPayeeId ?? payees[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState<RoPayResult | null>(null);

  const payee = payees.find((item) => item.id === payeeId) ?? payees[0] ?? RO_PAYEES[0];
  const parsedAmount = Number(amount || 0);
  const decision = useMemo(
    () => decidePayment({ amount: parsedAmount, payee, weeklyRemaining }),
    [parsedAmount, payee, weeklyRemaining],
  );

  const handlePick = (id: string) => {
    setPayeeId(id);
    setStep("amount");
  };

  const handleConfirm = () => {
    if (decision.status === "blocked") return;
    const result: RoPayResult = { payee, amount: parsedAmount, note: note.trim(), decision };
    onSubmit(result);
    setSubmitted(result);
    setStep("result");
  };

  const confirmLabel =
    decision.status === "instant"
      ? `Trimite ${formatRon(parsedAmount)}`
      : decision.status === "needs-approval"
        ? "Trimite Mamei spre aprobare"
        : "Alege o sumă validă";

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <PageHeader
        compact
        includeSafeArea
        collapsedTitleProgress={1}
        showHelp={false}
        variant={headerVariant}
        title={step === "pick" ? title : step === "amount" ? `Către ${payee.name}` : "Gata"}
        onBack={step === "amount" && !initialPayeeId ? () => setStep("pick") : onBack}
      />

      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[36px] pt-[10px]">
        {step === "pick" ? <PickStep payees={payees} onPick={handlePick} /> : null}

        {step === "amount" ? (
          <AmountStep
            payee={payee}
            amount={amount}
            note={note}
            decision={decision}
            confirmLabel={confirmLabel}
            onAmount={setAmount}
            onNote={setNote}
            onConfirm={handleConfirm}
          />
        ) : null}

        {step === "result" && submitted ? <ResultStep result={submitted} onDone={onBack} /> : null}
      </main>
    </div>
  );
}

function PickStep({ payees, onPick }: { payees: RoPayee[]; onPick: (id: string) => void }) {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: payees.filter((payee) => payee.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-[22px]">
      <p className="text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
        Alege pe cine plătești. Toți sunt pe lista aprobată de Mama — fără IBAN-uri de scris.
      </p>
      {grouped.map((group) => (
        <section key={group.category}>
          <h2 className="mb-[10px] text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
            {RO_PAYEE_CATEGORY_LABEL[group.category]}
          </h2>
          <RoCard padded={false} className="overflow-hidden">
            {group.items.map((payee, index) => (
              <button
                key={payee.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-[14px] px-[16px] py-[13px] text-left transition active:bg-[var(--hu-theme-control-bg)]",
                  index > 0 ? "border-t border-[var(--uc-border-muted)]" : undefined,
                )}
                onClick={() => onPick(payee.id)}
              >
                <RoPayeeAvatar payee={payee} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">
                    {payee.name}
                  </span>
                  <span className="block truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
                    {payee.note ?? payee.handle}
                  </span>
                </span>
                {payee.alwaysNeedsApproval || !payee.trusted ? (
                  <AppIcon name="shield-check" size={18} />
                ) : (
                  <AppIcon name="arrow-right" size={18} />
                )}
              </button>
            ))}
          </RoCard>
        </section>
      ))}
    </div>
  );
}

function AmountStep({
  payee,
  amount,
  note,
  decision,
  confirmLabel,
  onAmount,
  onNote,
  onConfirm,
}: {
  payee: RoPayee;
  amount: string;
  note: string;
  decision: PaymentDecision;
  confirmLabel: string;
  onAmount: (next: string) => void;
  onNote: (next: string) => void;
  onConfirm: () => void;
}) {
  const hasAmount = Number(amount || 0) > 0;

  return (
    <div className="space-y-[16px]">
      <RoCard className="flex items-center gap-[14px]">
        <RoPayeeAvatar payee={payee} size={48} />
        <div className="min-w-0">
          <p className="truncate text-[17px] font-bold leading-[21px] text-[var(--uc-text)]">{payee.name}</p>
          <p className="truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
            Limită {formatRon(payee.perPaymentLimit)} / plată
          </p>
        </div>
      </RoCard>

      <RoCard className="space-y-[16px]">
        <RoAmountField value={amount} onChange={onAmount} chips={[10, 20, 50]} />
        <div>
          <label className="mb-[8px] block text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
            Mențiune
          </label>
          <input
            className="h-[46px] w-full rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] text-[15px] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)] focus:ring-2 focus:ring-[var(--hu-theme-accent-strong)]"
            placeholder="Ex: partea la pizza"
            value={note}
            onChange={(event) => onNote(event.target.value)}
          />
        </div>
      </RoCard>

      {hasAmount ? <RoDecisionBanner decision={decision} /> : null}

      <PrimaryButton
        className="!w-full"
        disabled={decision.status === "blocked"}
        onClick={onConfirm}
      >
        {confirmLabel}
      </PrimaryButton>
    </div>
  );
}

function ResultStep({ result, onDone }: { result: RoPayResult; onDone: () => void }) {
  const instant = result.decision.status === "instant";

  return (
    <div className="flex min-h-[440px] flex-col items-center justify-center px-[8px] text-center">
      <span
        className="grid size-[92px] place-items-center rounded-full"
        style={{
          background: instant
            ? "color-mix(in srgb, var(--uc-green-success) 18%, var(--uc-surface))"
            : "color-mix(in srgb, var(--uc-yellow-gold) 20%, var(--uc-surface))",
          color: instant ? "var(--uc-green-success)" : "color-mix(in srgb, var(--uc-yellow-gold) 74%, var(--uc-text))",
        }}
      >
        <AppIcon name={instant ? "check" : "shield-check"} size={44} />
      </span>

      <h2 className="mt-[22px] text-[24px] font-bold leading-[28px] text-[var(--uc-text)]">
        {instant ? "Trimis!" : "Trimis Mamei"}
      </h2>
      <p className="mt-[8px] max-w-[280px] text-[15px] leading-[20px] text-[var(--uc-text-muted)]">
        {instant
          ? `Ai plătit ${formatRon(result.amount)} către ${result.payee.name}.`
          : `${formatRon(result.amount)} către ${result.payee.name} așteaptă acum aprobarea Mamei. Primești o notificare când e gata.`}
      </p>

      <div className="mt-[24px] w-full max-w-[320px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[16px] text-left shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-[var(--uc-text-muted)]">Sumă</span>
          <span className="text-[15px] font-bold text-[var(--uc-text)]">{formatRon(result.amount)}</span>
        </div>
        <div className="mt-[10px] flex items-center justify-between">
          <span className="text-[14px] text-[var(--uc-text-muted)]">Destinatar</span>
          <span className="text-[15px] font-bold text-[var(--uc-text)]">{result.payee.name}</span>
        </div>
        {result.note ? (
          <div className="mt-[10px] flex items-center justify-between gap-[12px]">
            <span className="shrink-0 text-[14px] text-[var(--uc-text-muted)]">Mențiune</span>
            <span className="truncate text-[15px] text-[var(--uc-text)]">{result.note}</span>
          </div>
        ) : null}
      </div>

      <PrimaryButton className="mt-[26px] !w-full max-w-[320px]" onClick={onDone}>
        Gata
      </PrimaryButton>
    </div>
  );
}
