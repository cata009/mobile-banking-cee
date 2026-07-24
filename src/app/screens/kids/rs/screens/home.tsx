/**
 * RS Teens Home — the alive-from-boot hero surface.
 *
 * Key improvements over RO's Home (RO flaw #2: dead gray hero + centered text):
 *  - A real themed-gradient HeroCard carries the balance, greeting, and a quick
 *    action rail, so the hero looks great even before the user picks a theme.
 *  - The weekly-limit SpendRing uses the animated atom (not a static SVG).
 *  - A pending-approval rail surfaces what's waiting on Tata.
 */
import { AppIcon, type IconName } from "@/app/components/icons";
import { HeroCard, ListCard, SpendRing, StatusPill, SectionLabel } from "../ui";
import { RS_TEEN_PROFILE, getRsTeenSpendModel } from "../data";
import { formatRsd, getRsdParts, formatRsdSigned } from "../money";
import { groupRsTransactionsByDay } from "../data";
import type { RsApproval, RsTransaction } from "../types";
import { MerchantLogoMark } from "../ui/merchantLogos";

export function RsHomeScreen({
  showAmounts,
  balance,
  approvals,
  transactions,
  onPay,
  onSend,
  onRequest,
  onCard,
  onOpenApprovals,
  onTransactionClick,
}: {
  showAmounts: boolean;
  balance: number;
  approvals: RsApproval[];
  transactions: RsTransaction[];
  onPay: () => void;
  onSend: () => void;
  onRequest: () => void;
  onCard: () => void;
  onOpenApprovals: () => void;
  onTransactionClick: (tx: RsTransaction) => void;
}) {
  const model = getRsTeenSpendModel();
  const parts = getRsdParts(balance);
  const pending = approvals.filter((a) => a.status === "pending");
  const firstPending = pending[0];
  const recent = transactions.slice(0, 5);
  const dayGroups = groupRsTransactionsByDay(recent);

  return (
    <div className="flex flex-col gap-4 px-[20px] pt-2">
      {/* Hero — alive from boot: themed gradient + decorative glow + balance + ring */}
      <HeroCard className="overflow-hidden">
        {/* Decorative ambient glow — gives the hero depth, not just flat color */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-50 blur-2xl"
          style={{ background: "color-mix(in srgb, var(--uc-static-white) 28%, transparent)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--hu-theme-accent-3)" }}
        />
        <div className="relative">
          {/* Greeting row */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium" style={{ color: "var(--hu-theme-hero-muted)" }}>
                {RS_TEEN_PROFILE.greeting}, {RS_TEEN_PROFILE.name} 👋
              </span>
              <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--hu-theme-hero-muted)" }}>
                Dostupno
              </span>
            </div>
            <SpendRing
              progress={model.spentProgress}
              size={88}
              stroke={7}
              label={`${model.spentProgress}%`}
              sublabel="trošak"
              showAmounts={showAmounts}
              accent="var(--uc-static-white)"
            />
          </div>
          {/* Balance — big number with clear hierarchy */}
          <div className="mt-2 flex items-end gap-1.5">
            {showAmounts ? (
              <>
                <span className="text-[42px] font-bold leading-none tracking-tight">{parts.integer}</span>
                <span className="mb-0.5 text-[22px] font-semibold leading-none opacity-80">{parts.decimal}</span>
                <span className="mb-1 ml-0.5 text-[15px] font-semibold opacity-80">RSD</span>
              </>
            ) : (
              <span className="text-[42px] font-bold leading-none">••••</span>
            )}
          </div>
          {/* Quick actions inside hero — each with distinct identity */}
          <div className="mt-5 flex items-center justify-between gap-1">
            <QuickActionTileWhite icon="send" label="Pošalji" onClick={onSend} />
            <QuickActionTileWhite icon="circle-dollar-sign" label="Traži" onClick={onRequest} />
            <QuickActionTileWhite icon="wallet-cards" label="Kartica" onClick={onCard} />
            <QuickActionTileWhite icon="receipt-text" label="Plati" onClick={onPay} />
          </div>
        </div>
      </HeroCard>

      {/* Pending approval rail */}
      {pending.length > 0 && (
        <button
          type="button"
          onClick={onOpenApprovals}
          className="flex items-center gap-3 rounded-[16px] p-3 text-left active:scale-[0.99]"
          style={{
            background: "color-mix(in srgb, var(--uc-product-blue) 10%, var(--hu-theme-card-bg))",
            border: "1px solid color-mix(in srgb, var(--uc-product-blue) 24%, transparent)",
          }}
        >
          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
            style={{ background: "color-mix(in srgb, var(--uc-product-blue) 18%, transparent)", color: "var(--uc-product-blue-deep)" }}
          >
            <AppIcon name="shield-check" size={20} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-[14px] font-bold" style={{ color: "var(--uc-text)" }}>
              {pending.length} na čekanju kod Tate
            </span>
            <span className="truncate text-[12px]" style={{ color: "var(--uc-text-muted)" }}>
              {firstPending?.title} · {firstPending ? formatRsd(firstPending.amount) : ""}
            </span>
          </div>
          <AppIcon name="chevron-link" size={18} className="opacity-50" />
        </button>
      )}

      {/* Weekly stats */}
      <div className="flex gap-3">
        <ListCard className="flex-1 !p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase" style={{ color: "var(--uc-text-muted)" }}>
              Nedeljni limit
            </span>
            <AppIcon name="wallet-cards" size={14} className="opacity-60" />
          </div>
          <span className="mt-1 block text-[18px] font-bold" style={{ color: "var(--uc-text)" }}>
            {showAmounts ? formatRsd(model.weeklyRemaining) : "••••"}
          </span>
          <span className="text-[11px]" style={{ color: "var(--uc-text-muted)" }}>
            od {formatRsd(model.weeklyLimit)}
          </span>
        </ListCard>
        <ListCard className="flex-1 !p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase" style={{ color: "var(--uc-text-muted)" }}>
              Ovog meseca
            </span>
            <AppIcon name="receipt-text" size={14} className="opacity-60" />
          </div>
          <span className="mt-1 block text-[18px] font-bold" style={{ color: "var(--uc-text)" }}>
            {showAmounts ? formatRsd(model.weeklySpent) : "••••"}
          </span>
          <span className="text-[11px]" style={{ color: "var(--uc-text-muted)" }}>
            još {model.daysLeft} dana
          </span>
        </ListCard>
      </div>

      {/* Recent activity */}
      <SectionLabel>Poslednja aktivnost</SectionLabel>
      <div className="flex flex-col gap-3 px-[20px]">
        {dayGroups.map((group) => (
          <ListCard key={group.key} className="!p-0">
            <div className="flex items-center justify-between px-4 pt-3">
              <span className="text-[13px] font-bold" style={{ color: "var(--uc-text-muted)" }}>
                {group.title}
              </span>
              <span className="text-[12px] font-semibold" style={{ color: group.total >= 0 ? "var(--uc-green-deep)" : "var(--uc-red-deep)" }}>
                {formatRsdSigned(group.total, showAmounts)}
              </span>
            </div>
            <div className="mt-1 flex flex-col">
              {group.transactions.map((tx) => (
                <TxRow key={tx.id} tx={tx} showAmounts={showAmounts} onClick={() => onTransactionClick(tx)} />
              ))}
            </div>
          </ListCard>
        ))}
      </div>
    </div>
  );
}

function QuickActionTileWhite({
  icon,
  label,
  onClick,
}: {
  icon: IconName;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5 active:scale-95">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full transition"
        style={{
          background: "color-mix(in srgb, var(--uc-static-white) 22%, transparent)",
          color: "var(--hu-theme-hero-fg)",
          border: "1px solid color-mix(in srgb, var(--uc-static-white) 30%, transparent)",
        }}
      >
        <AppIcon name={icon} size={20} />
      </span>
      <span className="text-[11px] font-semibold" style={{ color: "var(--hu-theme-hero-fg)" }}>
        {label}
      </span>
    </button>
  );
}

export function TxRow({
  tx,
  showAmounts,
  onClick,
}: {
  tx: RsTransaction;
  showAmounts: boolean;
  onClick?: () => void;
}) {
  const positive = tx.amount >= 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-left transition active:bg-black/5"
    >
      <span className="flex-shrink-0">
        {tx.merchantLogo ? (
          <MerchantLogoMark logo={tx.merchantLogo} />
        ) : (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: `color-mix(in srgb, ${tx.accent} 16%, transparent)`, color: tx.accent }}
          >
            <AppIcon name={tx.icon} size={17} />
          </span>
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[14px] font-semibold" style={{ color: "var(--uc-text)" }}>
          {tx.merchant}
        </span>
        <span className="truncate text-[12px]" style={{ color: "var(--uc-text-muted)" }}>
          {tx.subtitle} · {tx.time}
        </span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span
          className="text-[14px] font-bold"
          style={{ color: positive ? "var(--uc-green-deep)" : "var(--uc-text)" }}
        >
          {formatRsdSigned(tx.amount, showAmounts)}
        </span>
        {tx.status === "Na čekanju" && <StatusPill tone="pending">Na čekanju</StatusPill>}
      </div>
    </button>
  );
}
