/**
 * RS Teens pay flow — the signature feature.
 *
 * Three steps: pick curated payee → amount (with live parent-approval decision)
 * → result. Uses the balance-aware `decidePayment` engine so the verdict is
 * honest (RO's was balance-blind). Includes a real success moment (scale/glow)
 * on instant settlement — RO flaw #4 (static success).
 *
 * Teens never type an IBAN: they pay only against Tata's approved list.
 */
import { useMemo, useState } from "react";
import { cn } from "@/app/components/ui/utils";
import { AppIcon } from "@/app/components/icons";
import { ListCard, SectionLabel } from "../ui";
import { AmountField, DecisionBadge, PayeeAvatar } from "../ui/atoms";
import { RS_PAYEES, RS_PAYEE_CATEGORY_LABEL, decidePayment, getRsPayee } from "../payees";
import { RS_INSTANT_THRESHOLD } from "../payees";
import { formatRsdFull, formatRsd } from "../money";
import type { PaymentDecision, RsPayee, RsPayeeCategory } from "../types";

export type RsPayResult = {
  payee: RsPayee;
  amount: number;
  note?: string;
  decision: PaymentDecision;
};

const CHIPS = [200, 500, 1000, 2000];

export function RsPayFlow({
  title,
  headerVariant = "transparent",
  categories,
  initialPayeeId,
  weeklyRemaining,
  balance,
  onBack,
  onSubmit,
}: {
  title: string;
  headerVariant?: "transparent" | "dark";
  categories?: RsPayeeCategory[];
  initialPayeeId?: string;
  weeklyRemaining: number;
  balance: number;
  onBack: () => void;
  onSubmit: (result: RsPayResult) => void;
}) {
  const [step, setStep] = useState<"pick" | "amount" | "result">(initialPayeeId ? "amount" : "pick");
  const [selectedPayeeId, setSelectedPayeeId] = useState<string>(initialPayeeId ?? "");
  const [amountText, setAmountText] = useState("");
  const [result, setResult] = useState<RsPayResult | null>(null);

  const payees = useMemo(
    () =>
      categories
        ? RS_PAYEES.filter((p) => categories.includes(p.category))
        : RS_PAYEES,
    [categories],
  );

  const selectedPayee = getRsPayee(selectedPayeeId);
  const amount = Number.parseFloat(amountText) || 0;

  const decision = useMemo<PaymentDecision | null>(() => {
    if (!selectedPayee || amount <= 0) return null;
    return decidePayment({
      amount,
      payee: selectedPayee,
      weeklyRemaining,
      balance,
      instantThreshold: RS_INSTANT_THRESHOLD,
    });
  }, [selectedPayee, amount, weeklyRemaining, balance]);

  const handlePick = (payeeId: string) => {
    setSelectedPayeeId(payeeId);
    setStep("amount");
  };

  const handleSubmit = () => {
    if (!selectedPayee || !decision) return;
    const res: RsPayResult = { payee: selectedPayee, amount, decision };
    setResult(res);
    setStep("result");
  };

  const handleConfirm = () => {
    if (result) onSubmit(result);
  };

  const fgColor = headerVariant === "dark" ? "var(--uc-static-white)" : "var(--uc-text)";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-[54px] flex-shrink-0 items-center gap-2 px-[16px]">
        <button
          type="button"
          onClick={step === "result" ? () => setStep("amount") : onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5"
          aria-label="Nazad"
        >
          <AppIcon name="chevron-left" size={22} style={{ color: fgColor }} />
        </button>
        <h1 className="text-[18px] font-bold" style={{ color: fgColor }}>
          {title}
        </h1>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-[120px]">
        {step === "pick" && (
          <PickPayee payees={payees} onPick={handlePick} categories={categories} />
        )}
        {step === "amount" && selectedPayee && (
          <AmountStep
            payee={selectedPayee}
            amountText={amountText}
            setAmountText={setAmountText}
            decision={decision}
            weeklyRemaining={weeklyRemaining}
            balance={balance}
            onSubmit={handleSubmit}
          />
        )}
        {step === "result" && result && (
          <ResultStep result={result} onDone={handleConfirm} />
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Step 1 — pick payee                                                       */
/* ----------------------------------------------------------------------- */

function PickPayee({
  payees,
  onPick,
  categories,
}: {
  payees: readonly RsPayee[];
  onPick: (id: string) => void;
  categories?: RsPayeeCategory[];
}) {
  // Group by category for a clean, scannable list.
  const groups = useMemo(() => {
    const cats: RsPayeeCategory[] = categories ?? ["family", "friend", "merchant", "subscription"];
    return cats
      .map((cat) => ({ cat, items: payees.filter((p) => p.category === cat) }))
      .filter((g) => g.items.length > 0);
  }, [payees, categories]);

  return (
    <div>
      <div className="px-[20px] pb-2 pt-1">
        <p className="text-[14px] leading-snug" style={{ color: "var(--uc-text-muted)" }}>
          Izaberi kome plaćaš. Svi su na Tatinom odobrenom spisku — bez IBAN-a.
        </p>
      </div>
      {groups.map((group) => (
        <div key={group.cat}>
          <SectionLabel>{RS_PAYEE_CATEGORY_LABEL[group.cat]}</SectionLabel>
          <div className="flex flex-col gap-1.5 px-[20px]">
            {group.items.map((payee) => (
              <ListCard key={payee.id} onClick={() => onPick(payee.id)} className="!p-3">
                <div className="flex items-center gap-3">
                  <PayeeAvatar payee={payee} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px] font-semibold" style={{ color: "var(--uc-text)" }}>
                      {payee.name}
                    </span>
                    <span className="truncate text-[12px]" style={{ color: "var(--uc-text-muted)" }}>
                      {payee.handle}
                    </span>
                  </div>
                  <AppIcon name="chevron-link" size={18} className="opacity-40" />
                </div>
              </ListCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Step 2 — amount + live decision                                          */
/* ----------------------------------------------------------------------- */

function AmountStep({
  payee,
  amountText,
  setAmountText,
  decision,
  weeklyRemaining,
  balance,
  onSubmit,
}: {
  payee: RsPayee;
  amountText: string;
  setAmountText: (next: string) => void;
  decision: PaymentDecision | null;
  weeklyRemaining: number;
  balance: number;
  onSubmit: () => void;
}) {
  const canSubmit = decision?.status === "instant" || decision?.status === "needs-approval";
  return (
    <div className="flex flex-col gap-5 px-[20px] pt-2">
      <div className="flex items-center gap-3 rounded-[16px] p-3" style={{ background: "var(--hu-theme-card-bg)" }}>
        <PayeeAvatar payee={payee} size={40} />
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold" style={{ color: "var(--uc-text)" }}>
            {payee.name}
          </span>
          <span className="text-[12px]" style={{ color: "var(--uc-text-muted)" }}>
            {payee.note ?? payee.handle}
          </span>
        </div>
      </div>

      <AmountField value={amountText} onChange={setAmountText} chips={CHIPS} onChip={(c) => setAmountText(String(c))} />

      {decision ? (
        <DecisionBadge status={decision.status} reason={decision.reason} />
      ) : (
        <div className="rounded-[16px] p-3 text-center text-[13px]" style={{ background: "var(--hu-theme-card-bg)", color: "var(--uc-text-muted)" }}>
          Unesi iznos da vidiš da li ide instant ili na Tatu.
        </div>
      )}

      {/* Context — balance + remaining */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-[14px] p-3" style={{ background: "var(--hu-theme-card-bg)" }}>
          <span className="text-[11px] font-semibold uppercase" style={{ color: "var(--uc-text-muted)" }}>
            Dostupno
          </span>
          <span className="mt-0.5 block text-[15px] font-bold" style={{ color: "var(--uc-text)" }}>
            {formatRsd(balance)}
          </span>
        </div>
        <div className="flex-1 rounded-[14px] p-3" style={{ background: "var(--hu-theme-card-bg)" }}>
          <span className="text-[11px] font-semibold uppercase" style={{ color: "var(--uc-text-muted)" }}>
            Nedelja ostalo
          </span>
          <span className="mt-0.5 block text-[15px] font-bold" style={{ color: "var(--uc-text)" }}>
            {formatRsd(weeklyRemaining)}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={onSubmit}
        className={cn(
          "h-[52px] w-full rounded-2xl text-[16px] font-bold transition active:scale-[0.98]",
          canSubmit ? "text-white" : "cursor-not-allowed opacity-40",
        )}
        style={{
          background: canSubmit
            ? "linear-gradient(145deg, var(--hu-theme-accent-strong), var(--hu-theme-accent))"
            : "var(--hu-theme-card-bg)",
        }}
      >
        {decision?.status === "needs-approval" ? "Pošalji Tati na odobrenje" : "Pošalji"}
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Step 3 — result with success choreography                                */
/* ----------------------------------------------------------------------- */

function ResultStep({ result, onDone }: { result: RsPayResult; onDone: () => void }) {
  const ok = result.decision.status === "instant";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-[40px]">
      <div
        className={cn(
          "flex h-24 w-24 items-center justify-center rounded-full",
          ok ? "rs-success-pop" : "rs-pending-pulse",
        )}
        style={{
          background: ok
            ? "linear-gradient(145deg, var(--uc-green-main), var(--uc-green-deep))"
            : "color-mix(in srgb, var(--uc-product-blue) 18%, transparent)",
          color: ok ? "#fff" : "var(--uc-product-blue-deep)",
          boxShadow: ok
            ? "0 0 36px color-mix(in srgb, var(--uc-green-main) 55%, transparent)"
            : "none",
        }}
      >
        <AppIcon name={ok ? "check" : "shield-check"} size={48} />
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h2 className="text-[22px] font-bold" style={{ color: "var(--uc-text)" }}>
          {ok ? "Poslato!" : "Na Tatinu potvrdu"}
        </h2>
        <p className="text-[15px]" style={{ color: "var(--uc-text-muted)" }}>
          {formatRsdFull(result.amount)} → {result.payee.name}
        </p>
        <p className="mt-1 max-w-[280px] text-[13px]" style={{ color: "var(--uc-text-muted)" }}>
          {result.decision.reason}
        </p>
      </div>
      <button
        type="button"
        onClick={onDone}
        className="mt-2 h-[52px] w-full max-w-[280px] rounded-2xl text-[16px] font-bold text-white transition active:scale-[0.98]"
        style={{ background: "linear-gradient(145deg, var(--hu-theme-accent-strong), var(--hu-theme-accent))" }}
      >
        Gotovo
      </button>
    </div>
  );
}
