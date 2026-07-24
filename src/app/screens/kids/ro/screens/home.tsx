/**
 * RO Teens Home surface: hero balance, quick actions, the parent-approval rail,
 * the weekly spend ring, and recent activity.
 */
import { AppIcon, type IconName } from "@/app/components/icons";
import { formatRon, formatRonFull, getRonParts, RO_MASKED_INTEGER, RO_MASKED_DECIMALS } from "../money";
import { RO_TEEN_PROFILE } from "../data";
import { RO_WEEKLY_LIMIT } from "../payees";
import { RoCard, RoSpendRing, RoStatusPill } from "../ui";
import { RoActivityList } from "./activity";
import type { RoApproval, RoTransaction } from "../types";

type QuickAction = { id: string; label: string; icon: IconName; onClick: () => void };

export function RoHomeScreen({
  showAmounts,
  balance,
  weeklySpent,
  allowanceNext,
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
  weeklySpent: number;
  allowanceNext: string;
  approvals: RoApproval[];
  transactions: RoTransaction[];
  onPay: () => void;
  onSend: () => void;
  onRequest: () => void;
  onCard: () => void;
  onOpenApprovals: () => void;
  onTransactionClick: (transaction: RoTransaction) => void;
}) {
  const parts = getRonParts(balance);
  const pending = approvals.filter((approval) => approval.status === "pending");
  const remaining = Math.max(RO_WEEKLY_LIMIT - weeklySpent, 0);
  const recent = transactions.slice(0, 5);

  const actions: QuickAction[] = [
    { id: "pay", label: "Plătește", icon: "nav-payments", onClick: onPay },
    { id: "send", label: "Trimite", icon: "send", onClick: onSend },
    { id: "request", label: "Cere bani", icon: "circle-dollar-sign", onClick: onRequest },
    { id: "card", label: "Card", icon: "credit-card", onClick: onCard },
  ];

  return (
    <main className="pb-[8px]">
      {/* Hero balance */}
      <section className="mt-[52px] px-[24px] text-center">
        <p className="text-[17px] font-normal leading-[21px] text-[var(--hu-theme-hero-muted)]">
          Salut, {RO_TEEN_PROFILE.name} 👋
        </p>
        <div className="mt-[10px] flex items-baseline justify-center gap-[6px] text-[var(--hu-theme-hero-fg)]">
          {showAmounts ? (
            <>
              <span className="text-[46px] font-bold leading-[48px]">{parts.integer}</span>
              <span className="text-[28px] font-normal leading-[32px]">{parts.decimal} RON</span>
            </>
          ) : (
            <>
              <span className="text-[46px] font-bold leading-[48px]">{RO_MASKED_INTEGER}</span>
              <span className="text-[28px] font-normal leading-[32px]">{RO_MASKED_DECIMALS} RON</span>
            </>
          )}
        </div>
        <p className="mt-[8px] text-[14px] leading-[18px] text-[var(--hu-theme-hero-muted)]">
          disponibili acum pentru tine
        </p>
      </section>

      {/* Quick actions */}
      <section className="mt-[30px] px-[24px]">
        <div className="grid grid-cols-4 gap-[14px]">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              aria-label={action.label}
              className="flex min-w-0 flex-col items-center gap-[9px]"
              onClick={action.onClick}
            >
              <span className="grid size-[62px] place-items-center rounded-full border border-[var(--hu-theme-hero-control-border)] bg-[var(--hu-theme-hero-control-bg)] text-[var(--hu-theme-hero-control-fg)] shadow-sm backdrop-blur-[10px]">
                <AppIcon name={action.icon} size={24} />
              </span>
              <span className="text-center text-[13px] font-medium leading-[15px] text-[var(--hu-theme-hero-muted)]">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Parent-approval rail */}
      {pending.length > 0 ? (
        <section className="mt-[26px]">
          <div className="mb-[10px] flex items-center justify-between px-[24px]">
            <h2 className="text-[16px] font-bold leading-[20px] text-[var(--hu-theme-hero-fg)]">
              La Mama spre aprobare
            </h2>
            <button
              type="button"
              className="text-[13px] font-bold text-[var(--hu-theme-hero-muted)]"
              onClick={onOpenApprovals}
            >
              Vezi tot
            </button>
          </div>
          <div className="scrollbar-hide flex gap-[12px] overflow-x-auto px-[24px] pb-[4px]">
            {pending.map((approval) => (
              <button
                key={approval.id}
                type="button"
                className="flex w-[228px] shrink-0 flex-col rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[16px] text-left shadow-sm transition active:scale-[0.99]"
                onClick={onOpenApprovals}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="grid size-[38px] place-items-center rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${approval.accent} 16%, var(--uc-surface))`,
                      color: approval.accent,
                    }}
                  >
                    <AppIcon name={approval.icon} size={19} />
                  </span>
                  <RoStatusPill status={approval.status} />
                </div>
                <p className="mt-[12px] truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">
                  {approval.title}
                </p>
                <p className="mt-[3px] truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
                  {formatRon(approval.amount)} · {approval.note ?? approval.counterparty}
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-[26px] space-y-[22px] px-[24px]">
        {/* Weekly spend ring */}
        <RoCard>
          <div className="flex items-center gap-[18px]">
            <RoSpendRing spent={weeklySpent} limit={RO_WEEKLY_LIMIT} size={112} stroke={12}>
              <div>
                <p className="text-[20px] font-bold leading-[22px] text-[var(--uc-text)]">
                  {showAmounts ? formatRon(remaining) : `${RO_MASKED_INTEGER} RON`}
                </p>
                <p className="text-[11px] leading-[13px] text-[var(--uc-text-muted)]">rămași</p>
              </div>
            </RoSpendRing>
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-bold leading-[21px] text-[var(--uc-text)]">Limita ta săptămânală</h2>
              <p className="mt-[6px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                Ai cheltuit {showAmounts ? formatRonFull(weeklySpent) : `${RO_MASKED_INTEGER} RON`} din{" "}
                {formatRon(RO_WEEKLY_LIMIT)}.
              </p>
              <p className="mt-[8px] inline-flex items-center gap-[6px] rounded-full bg-[var(--hu-theme-control-bg)] px-[10px] py-[5px] text-[12px] font-bold text-[var(--uc-text)]">
                <AppIcon name="piggy-bank" size={14} />
                Alocație în {allowanceNext}
              </p>
            </div>
          </div>
        </RoCard>

        {/* Recent activity */}
        <div>
          <h2 className="mb-[10px] text-[17px] font-bold leading-[21px] text-[var(--hu-theme-hero-fg)]">
            Activitate recentă
          </h2>
          <RoActivityList
            transactions={recent}
            showAmounts={showAmounts}
            onTransactionClick={onTransactionClick}
          />
        </div>
      </div>
    </main>
  );
}
