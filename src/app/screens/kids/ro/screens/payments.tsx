/**
 * RO Teens Payments hub — the app's hero surface.
 *
 * One-tap curated payees, the four money actions, saved subscriptions, and a
 * plain-language explainer of the parent-approval rule.
 */
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import { formatRon } from "../money";
import { RO_INSTANT_THRESHOLD, getRoQuickPayees } from "../payees";
import { RoCard, RoPayeeAvatar } from "../ui";

type PayAction = { id: string; label: string; caption: string; icon: IconName; onClick: () => void };

const SUBSCRIPTIONS: { id: string; name: string; amount: number; next: string; accent: string }[] = [
  { id: "sub-spotify", name: "Spotify", amount: 27.99, next: "1 aug", accent: "var(--uc-green-success)" },
  { id: "sub-netflix", name: "Netflix", amount: 34.99, next: "5 aug", accent: "var(--uc-red-main)" },
];

export function RoPaymentsScreen({
  weeklyRemaining,
  onPayPayee,
  onPayAll,
  onSend,
  onRequest,
  onTopUp,
}: {
  weeklyRemaining: number;
  onPayPayee: (payeeId: string) => void;
  onPayAll: () => void;
  onSend: () => void;
  onRequest: () => void;
  onTopUp: () => void;
}) {
  const quickPayees = getRoQuickPayees();

  const actions: PayAction[] = [
    { id: "pay", label: "Plătește", caption: "din listă", icon: "nav-payments", onClick: onPayAll },
    { id: "send", label: "Trimite", caption: "prieteni & familie", icon: "send", onClick: onSend },
    { id: "request", label: "Cere bani", caption: "de la Mama", icon: "circle-dollar-sign", onClick: onRequest },
    { id: "topup", label: "Reîncarcă", caption: "cere top-up", icon: "wallet-cards", onClick: onTopUp },
  ];

  return (
    <main className="mt-[8px] px-[20px] pb-[8px]">
      {/* Available-to-spend banner */}
      <RoCard className="flex items-center justify-between">
        <div>
          <p className="text-[13px] leading-[17px] text-[var(--uc-text-muted)]">Poți plăti azi până la</p>
          <p className="mt-[2px] text-[24px] font-bold leading-[28px] text-[var(--uc-text)]">
            {formatRon(weeklyRemaining)}
          </p>
        </div>
        <span className="grid size-[46px] place-items-center rounded-full bg-[color-mix(in_srgb,var(--hu-theme-accent-strong)_16%,var(--uc-surface))] text-[var(--hu-theme-accent-strong)]">
          <AppIcon name="shield-check" size={24} />
        </span>
      </RoCard>

      {/* Money actions */}
      <div className="mt-[16px] grid grid-cols-2 gap-[12px]">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="flex items-center gap-[12px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[14px] text-left shadow-sm transition active:scale-[0.99]"
            onClick={action.onClick}
          >
            <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--hu-theme-accent-strong)_14%,var(--uc-surface))] text-[var(--hu-theme-accent-strong)]">
              <AppIcon name={action.icon} size={22} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">
                {action.label}
              </span>
              <span className="block truncate text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
                {action.caption}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Quick pay */}
      <section className="mt-[24px]">
        <h2 className="mb-[12px] text-[17px] font-bold leading-[21px] text-[var(--hu-theme-hero-fg)]">
          Plătește rapid
        </h2>
        <div className="grid grid-cols-3 gap-[12px]">
          {quickPayees.map((payee) => {
            const guarded = payee.alwaysNeedsApproval || !payee.trusted;
            return (
              <button
                key={payee.id}
                type="button"
                className="flex flex-col items-center gap-[8px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[12px] shadow-sm transition active:scale-[0.97]"
                onClick={() => onPayPayee(payee.id)}
              >
                <span className="relative">
                  <RoPayeeAvatar payee={payee} size={52} />
                  {guarded ? (
                    <span className="absolute -bottom-[2px] -right-[2px] grid size-[20px] place-items-center rounded-full bg-[var(--uc-surface)] text-[color-mix(in_srgb,var(--uc-yellow-gold)_74%,var(--uc-text))] shadow-sm">
                      <AppIcon name="shield-check" size={12} />
                    </span>
                  ) : null}
                </span>
                <span className="max-w-full truncate text-[13px] font-bold leading-[16px] text-[var(--uc-text)]">
                  {payee.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Subscriptions */}
      <section className="mt-[24px]">
        <h2 className="mb-[12px] text-[17px] font-bold leading-[21px] text-[var(--hu-theme-hero-fg)]">
          Abonamentele tale
        </h2>
        <RoCard padded={false} className="px-[16px]">
          {SUBSCRIPTIONS.map((sub, index) => (
            <button
              key={sub.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-[13px] py-[13px] text-left transition active:opacity-70",
                index > 0 ? "border-t border-[var(--uc-border-muted)]" : undefined,
              )}
              onClick={() => onPayPayee(`payee-${sub.name.toLowerCase()}`)}
            >
              <span
                className="grid size-[42px] shrink-0 place-items-center rounded-full"
                style={{
                  background: `color-mix(in srgb, ${sub.accent} 16%, var(--uc-surface))`,
                  color: sub.accent,
                }}
              >
                <AppIcon name="receipt-text" size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">
                  {sub.name}
                </span>
                <span className="block truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
                  Reînnoire {sub.next}
                </span>
              </span>
              <span className="shrink-0 text-[15px] font-bold text-[var(--uc-text)]">{formatRon(sub.amount)}</span>
            </button>
          ))}
        </RoCard>
      </section>

      {/* How approval works */}
      <RoCard className="mt-[24px] flex items-start gap-[13px]">
        <span className="grid size-[40px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--hu-theme-accent-strong)_14%,var(--uc-surface))] text-[var(--hu-theme-accent-strong)]">
          <AppIcon name="shield-check" size={22} />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">Cum merg aprobările</p>
          <p className="mt-[5px] text-[13px] leading-[18px] text-[var(--uc-text-muted)]">
            Plățile sub {formatRon(RO_INSTANT_THRESHOLD)} către persoane de încredere pleacă instant. Peste atât — sau
            către destinatari cu scutul <AppIcon name="shield-check" size={12} /> — Mama confirmă întâi.
          </p>
        </div>
      </RoCard>
    </main>
  );
}
