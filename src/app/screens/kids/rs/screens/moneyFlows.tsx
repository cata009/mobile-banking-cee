/**
 * RS Teens money flows — "Traži novac" (request from Tata) and "Dopuni"
 * (top-up). Reused for both modes via the `mode` prop.
 */
import { useState } from "react";
import { AppIcon } from "@/app/components/icons";
import { ListCard } from "../ui";
import { formatRsd } from "../money";

export type RsRequestReason = "Štednja" | "Izlazak" | "Škola" | "Ostalo";

const REASONS: RsRequestReason[] = ["Štednja", "Izlazak", "Škola", "Ostalo"];
const CHIPS = [500, 1000, 2000];

export function RsRequestScreen({
  mode,
  onBack,
  onSubmit,
}: {
  mode: "request" | "topup";
  onBack: () => void;
  onSubmit: (amount: number, reason: RsRequestReason, note: string) => void;
}) {
  const [amountText, setAmountText] = useState("");
  const [reason, setReason] = useState<RsRequestReason>("Štednja");
  const [note, setNote] = useState("");
  const amount = Number.parseFloat(amountText) || 0;
  const canSubmit = amount > 0;

  const title = mode === "topup" ? "Traži dopunu" : "Traži novac";
  const cta = mode === "topup" ? "Pošalji Tati" : "Pošalji zahtev";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[54px] flex-shrink-0 items-center gap-2 px-[16px]">
        <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5" aria-label="Nazad">
          <AppIcon name="chevron-left" size={22} />
        </button>
        <h1 className="text-[18px] font-bold">{title}</h1>
      </div>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[120px]">
        <ListCard className="!p-4">
          <span className="text-[12px] font-semibold uppercase" style={{ color: "var(--uc-text-muted)" }}>Iznos (RSD)</span>
          <div className="mt-2 flex items-baseline gap-1">
            <input
              inputMode="decimal"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder="0"
              autoFocus
              className="w-[140px] bg-transparent text-[36px] font-bold outline-none"
              style={{ color: "var(--uc-text)" }}
            />
            <span className="text-[15px] font-semibold" style={{ color: "var(--uc-text-muted)" }}>RSD</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <button key={c} type="button" onClick={() => setAmountText(String(c))} className="rounded-full border px-3 py-1.5 text-[13px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--uc-product-blue) 35%, transparent)", color: "var(--uc-product-blue-deep)" }}>
                {formatRsd(c)}
              </button>
            ))}
          </div>
        </ListCard>

        {mode === "request" && (
          <div className="mt-4">
            <span className="px-1 pb-2 text-[12px] font-semibold uppercase" style={{ color: "var(--uc-text-muted)" }}>Za šta?</span>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className="rounded-full px-4 py-2 text-[13px] font-semibold transition"
                  style={{
                    background: reason === r ? "var(--uc-product-blue)" : "var(--hu-theme-card-bg)",
                    color: reason === r ? "#fff" : "var(--uc-text-muted)",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <span className="px-1 pb-2 text-[12px] font-semibold uppercase" style={{ color: "var(--uc-text-muted)" }}>Napomena (opciono)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="npr. za Exit kartu"
            className="w-full rounded-2xl p-4 text-[15px] outline-none"
            style={{ background: "var(--hu-theme-card-bg)", color: "var(--uc-text)" }}
          />
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSubmit(amount, reason, note)}
          className="mt-6 h-[52px] w-full rounded-2xl text-[16px] font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
          style={{ background: "linear-gradient(145deg, var(--hu-theme-accent-strong), var(--hu-theme-accent))" }}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}
