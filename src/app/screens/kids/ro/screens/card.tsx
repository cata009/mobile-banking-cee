/**
 * RO Teens Card surface + card controls.
 * Card control state (freeze / online / contactless / ATM) is owned by the shell
 * so a freeze persists while the teen moves around the app.
 */
import type { CSSProperties } from "react";
import PageHeader from "@/app/components/PageHeader";
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import { formatRon } from "../money";
import { RO_DEFAULT_CARD } from "../cards";
import { RO_INSTANT_THRESHOLD, RO_WEEKLY_LIMIT } from "../payees";
import { RoCard } from "../ui";
import { RoActivityList } from "./activity";
import type { RoTransaction } from "../types";

export type RoCardControlId = "frozen" | "online" | "contactless" | "atm";
export type RoCardControls = Record<RoCardControlId, boolean>;

export const RO_DEFAULT_CARD_CONTROLS: RoCardControls = {
  frozen: false,
  online: true,
  contactless: true,
  atm: false,
};

const CONTROL_META: { id: RoCardControlId; label: string; caption: string; icon: IconName }[] = [
  { id: "online", label: "Plăți online", caption: "eMAG, Steam, abonamente", icon: "shopping-bag" },
  { id: "contactless", label: "Contactless", caption: "Plată din telefon/card", icon: "credit-card" },
  { id: "atm", label: "Retrageri ATM", caption: "Scoatere numerar", icon: "landmark" },
];

function CardVisual({ frozen }: { frozen: boolean }) {
  const style = {
    background:
      "linear-gradient(135deg, var(--hu-theme-accent-strong) 0%, color-mix(in srgb, var(--hu-theme-accent-strong) 55%, var(--uc-static-black)) 100%)",
  } as CSSProperties;

  return (
    <div
      className="relative aspect-[1.586] w-full overflow-hidden rounded-[20px] p-[20px] text-[var(--uc-static-white)] shadow-lg"
      style={style}
      role="img"
      aria-label={`Mastercard Teen se termină în ${RO_DEFAULT_CARD.lastDigits}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[15px] font-bold tracking-[0.02em]">{RO_DEFAULT_CARD.title}</span>
        <AppIcon name="wallet-cards" size={26} />
      </div>
      <p className="absolute bottom-[54px] left-[20px] text-[19px] font-medium tracking-[0.14em]">
        •••• •••• •••• {RO_DEFAULT_CARD.lastDigits}
      </p>
      <div className="absolute bottom-[18px] left-[20px] right-[20px] flex items-end justify-between">
        <span className="text-[13px] font-bold uppercase tracking-[0.06em]">{RO_DEFAULT_CARD.holderName}</span>
        <span className="text-[13px] font-medium">{RO_DEFAULT_CARD.expiry}</span>
      </div>
      {frozen ? (
        <div className="absolute inset-0 grid place-items-center bg-[color-mix(in_srgb,var(--uc-static-black)_58%,transparent)] backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-[6px]">
            <AppIcon name="lock" size={30} />
            <span className="text-[14px] font-bold">Card blocat</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ControlToggle({
  active,
  onToggle,
  label,
  caption,
  icon,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
  caption: string;
  icon: IconName;
}) {
  return (
    <div className="flex items-center gap-[13px] py-[13px]">
      <span className="grid size-[40px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
        <AppIcon name={icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">{label}</p>
        <p className="truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">{caption}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={label}
        className={cn(
          "relative h-[28px] w-[48px] shrink-0 rounded-full transition-colors",
          active ? "bg-[var(--hu-theme-accent-strong)]" : "bg-[var(--uc-border)]",
        )}
        onClick={onToggle}
      >
        <span
          className={cn(
            "absolute top-[3px] size-[22px] rounded-full bg-[var(--uc-static-white)] shadow transition-[left]",
            active ? "left-[23px]" : "left-[3px]",
          )}
        />
      </button>
    </div>
  );
}

export function RoCardScreen({
  controls,
  onToggle,
  showAmounts,
  transactions,
  onOpenSettings,
  onTransactionClick,
}: {
  controls: RoCardControls;
  onToggle: (id: RoCardControlId) => void;
  showAmounts: boolean;
  transactions: RoTransaction[];
  onOpenSettings: () => void;
  onTransactionClick: (transaction: RoTransaction) => void;
}) {
  const cardSpends = transactions.filter((transaction) => transaction.amount < 0).slice(0, 6);

  return (
    <main className="mt-[8px] px-[20px] pb-[8px]">
      <CardVisual frozen={controls.frozen} />

      {/* Freeze + settings */}
      <div className="mt-[16px] grid grid-cols-2 gap-[12px]">
        <button
          type="button"
          className={cn(
            "flex items-center gap-[10px] rounded-[16px] p-[14px] text-left shadow-sm transition active:scale-[0.99]",
            controls.frozen
              ? "bg-[color-mix(in_srgb,var(--uc-product-blue)_16%,var(--uc-surface))]"
              : "bg-[var(--hu-theme-card-bg)]",
          )}
          onClick={() => onToggle("frozen")}
        >
          <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-product-blue)_16%,var(--uc-surface))] text-[var(--uc-product-blue)]">
            <AppIcon name="lock" size={22} />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">
              {controls.frozen ? "Deblochează" : "Blochează"}
            </span>
            <span className="block truncate text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
              {controls.frozen ? "Card oprit acum" : "Oprește instant cardul"}
            </span>
          </span>
        </button>
        <button
          type="button"
          className="flex items-center gap-[10px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[14px] text-left shadow-sm transition active:scale-[0.99]"
          onClick={onOpenSettings}
        >
          <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
            <AppIcon name="sliders-horizontal" size={22} />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">Limite</span>
            <span className="block truncate text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
              Setează plafoane
            </span>
          </span>
        </button>
      </div>

      {/* Controls */}
      <RoCard padded={false} className="mt-[16px] px-[16px]">
        {CONTROL_META.map((meta, index) => (
          <div
            key={meta.id}
            className={index > 0 ? "border-t border-[var(--uc-border-muted)]" : undefined}
          >
            <ControlToggle
              active={controls[meta.id]}
              onToggle={() => onToggle(meta.id)}
              label={meta.label}
              caption={meta.caption}
              icon={meta.icon}
            />
          </div>
        ))}
      </RoCard>

      {/* Card activity */}
      <section className="mt-[22px]">
        <h2 className="mb-[10px] text-[17px] font-bold leading-[21px] text-[var(--hu-theme-hero-fg)]">
          Plăți cu cardul
        </h2>
        <RoActivityList
          transactions={cardSpends}
          showAmounts={showAmounts}
          onTransactionClick={onTransactionClick}
        />
      </section>
    </main>
  );
}

export function RoCardSettingsScreen({
  controls,
  onToggle,
  onBack,
}: {
  controls: RoCardControls;
  onToggle: (id: RoCardControlId) => void;
  onBack: () => void;
}) {
  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <PageHeader
        compact
        includeSafeArea
        collapsedTitleProgress={1}
        showHelp={false}
        variant="transparent"
        title="Limite & control"
        onBack={onBack}
      />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[36px] pt-[10px]">
        <RoCard padded={false} className="px-[16px]">
          {CONTROL_META.map((meta, index) => (
            <div key={meta.id} className={index > 0 ? "border-t border-[var(--uc-border-muted)]" : undefined}>
              <ControlToggle
                active={controls[meta.id]}
                onToggle={() => onToggle(meta.id)}
                label={meta.label}
                caption={meta.caption}
                icon={meta.icon}
              />
            </div>
          ))}
        </RoCard>

        <h2 className="mb-[10px] mt-[22px] text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
          Plafoane setate de Mama
        </h2>
        <RoCard padded={false} className="px-[16px]">
          {[
            { label: "Plată instant fără aprobare", value: `${formatRon(RO_INSTANT_THRESHOLD)}` },
            { label: "Limită săptămânală", value: `${formatRon(RO_WEEKLY_LIMIT)}` },
          ].map((row, index) => (
            <div
              key={row.label}
              className={`flex items-center justify-between gap-[12px] py-[14px] ${
                index > 0 ? "border-t border-[var(--uc-border-muted)]" : ""
              }`}
            >
              <span className="text-[14px] text-[var(--uc-text)]">{row.label}</span>
              <span className="text-[15px] font-bold text-[var(--uc-text)]">{row.value}</span>
            </div>
          ))}
        </RoCard>
        <p className="mt-[12px] px-[4px] text-[13px] leading-[18px] text-[var(--uc-text-muted)]">
          Plafoanele sunt setate împreună cu părintele. Poți cere o mărire din profil.
        </p>
      </main>
    </div>
  );
}
