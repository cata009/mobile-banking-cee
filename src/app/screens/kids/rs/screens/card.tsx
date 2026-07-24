/**
 * RS Teens Card surface — two cards (debit + virtual), freeze state with the
 * shared Meniga Card artwork, online/contactless/ATM controls, and limits.
 * Deeper than RO's single-card tab.
 */
import { useState } from "react";
import { cn } from "@/app/components/ui/utils";
import { AppIcon, type IconName } from "@/app/components/icons";
import Card from "@/app/components/cards/Card";
import { ListCard, SectionLabel, StatTile } from "../ui";
import { formatRsd } from "../money";
import { RS_KIDS_CARDS, type RsKidsCard } from "../cards";
import { getRsTeenSpendModel } from "../data";
import { TxRow } from "./home";
import type { RsTransaction } from "../types";

export type RsCardControlId = "online" | "contactless" | "atm";
export type RsCardControls = Record<RsCardControlId, boolean>;

export const RS_DEFAULT_CARD_CONTROLS: RsCardControls = {
  online: true,
  contactless: true,
  atm: false,
};

const CONTROL_LABELS: Record<RsCardControlId, { icon: IconName; title: string; body: string }> = {
  online: { icon: "wallet-cards", title: "Online plaćanja", body: "Kupovina na sajtovima i u aplikacijama" },
  contactless: { icon: "credit-card", title: "Kontaktless", body: "Tap na terminalu" },
  atm: { icon: "wallet-cards", title: "Podizanje gotovine", body: "Bankomat" },
};

export function RsCardScreen({
  controls,
  onToggle,
  showAmounts,
  transactions,
  onOpenSettings,
  onTransactionClick,
}: {
  controls: RsCardControls;
  onToggle: (id: RsCardControlId) => void;
  showAmounts: boolean;
  transactions: RsTransaction[];
  onOpenSettings: () => void;
  onTransactionClick: (tx: RsTransaction) => void;
}) {
  const [frozen, setFrozen] = useState(false);
  const model = getRsTeenSpendModel();
  const recent = transactions.slice(0, 4);

  return (
    <div className="flex flex-col gap-4 px-[20px] pt-2">
      {/* Cards carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {RS_KIDS_CARDS.map((card) => (
          <CardTile key={card.id} card={card} frozen={frozen} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setFrozen((f) => !f)}
          className={cn("flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold transition active:scale-[0.98]")}
          style={{
            background: frozen ? "color-mix(in srgb, var(--uc-red-main) 14%, transparent)" : "var(--hu-theme-card-bg)",
            color: frozen ? "var(--uc-red-deep)" : "var(--uc-text)",
            border: frozen ? "1px solid color-mix(in srgb, var(--uc-red-main) 30%, transparent)" : "none",
          }}
        >
          <AppIcon name="block-card" size={18} />
          {frozen ? "Zaleđeno" : "Zaledi karticu"}
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold"
          style={{ background: "var(--hu-theme-card-bg)", color: "var(--uc-text)" }}
        >
          <AppIcon name="sliders-horizontal" size={18} />
          Podešavanja
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <StatTile icon="wallet-cards" label="Dnevni limit" value={formatRsd(5000)} hint="podiže Tata" accent="var(--uc-product-blue)" />
        <StatTile icon="receipt-text" label="Ove nedelje" value={showAmounts ? formatRsd(model.weeklySpent) : "••••"} hint={`od ${formatRsd(model.weeklyLimit)}`} accent="var(--uc-product-pink)" />
      </div>

      {/* Controls preview */}
      <div>
        <SectionLabel>Kontrole</SectionLabel>
        <ListCard className="!p-0">
          {(Object.keys(CONTROL_LABELS) as RsCardControlId[]).map((id) => (
            <ControlRow key={id} id={id} on={controls[id]} onToggle={() => onToggle(id)} />
          ))}
        </ListCard>
      </div>

      {/* Recent on card */}
      <div>
        <SectionLabel>Poslednje na kartici</SectionLabel>
        <ListCard className="!p-0">
          {recent.map((tx) => (
            <TxRow key={tx.id} tx={tx} showAmounts={showAmounts} onClick={() => onTransactionClick(tx)} />
          ))}
        </ListCard>
      </div>
    </div>
  );
}

function CardTile({ card, frozen }: { card: RsKidsCard; frozen: boolean }) {
  return (
    <div className="relative flex-shrink-0">
      <Card variant={card.variant} size="medium" />
      {frozen && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[20px]" style={{ background: "color-mix(in srgb, #9ec7e8 35%, rgba(255,255,255,0.5))", backdropFilter: "blur(3px)" }}>
          <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-bold" style={{ color: "var(--uc-product-blue-deep)" }}>
            <AppIcon name="lock" size={14} /> Zaleđeno
          </span>
        </div>
      )}
    </div>
  );
}

function ControlRow({ id, on, onToggle }: { id: RsCardControlId; on: boolean; onToggle: () => void }) {
  const meta = CONTROL_LABELS[id];
  return (
    <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-black/5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, var(--uc-product-blue) ${on ? "16" : "8"}%, transparent)`, color: on ? "var(--uc-product-blue-deep)" : "var(--uc-text-muted)" }}>
        <AppIcon name={meta.icon} size={17} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[14px] font-semibold" style={{ color: "var(--uc-text)" }}>{meta.title}</span>
        <span className="text-[12px]" style={{ color: "var(--uc-text-muted)" }}>{meta.body}</span>
      </div>
      <span
        className="relative h-6 w-11 rounded-full transition"
        style={{ background: on ? "var(--uc-green-main)" : "color-mix(in srgb, var(--uc-product-slate) 30%, transparent)" }}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", on ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  );
}

/* ----------------------------------------------------------------------- */
/* Settings sub-page                                                         */
/* ----------------------------------------------------------------------- */

export function RsCardSettingsScreen({
  controls,
  onToggle,
  onBack,
}: {
  controls: RsCardControls;
  onToggle: (id: RsCardControlId) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[54px] flex-shrink-0 items-center gap-2 px-[16px]">
        <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5" aria-label="Nazad">
          <AppIcon name="chevron-left" size={22} />
        </button>
        <h1 className="text-[18px] font-bold">Podešavanja kartice</h1>
      </div>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[40px]">
        <SectionLabel className="!px-0">Dozvoljene transakcije</SectionLabel>
        <ListCard className="!p-0">
          {(Object.keys(CONTROL_LABELS) as RsCardControlId[]).map((id) => (
            <ControlRow key={id} id={id} on={controls[id]} onToggle={() => onToggle(id)} />
          ))}
        </ListCard>
        <p className="mt-4 px-1 text-[12px]" style={{ color: "var(--uc-text-muted)" }}>
          Limiti i kontrole podešava Tata zajedno sa tobom. Promene ovde su privremene, za probu.
        </p>
      </div>
    </div>
  );
}
