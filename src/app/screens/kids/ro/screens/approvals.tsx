/**
 * RO Teens approvals inbox — the parent-approval loop made visible.
 *
 * Pending items carry a demo control to simulate the parent's decision so the
 * full round-trip (teen requests → parent approves/declines → status updates)
 * can be shown end-to-end to stakeholders.
 */
import PageHeader from "@/app/components/PageHeader";
import { AppIcon } from "@/app/components/icons";
import { formatRon } from "../money";
import { RO_TEEN_PROFILE } from "../data";
import { RoCard, RoStatusPill } from "../ui";
import type { RoApproval, RoApprovalStatus } from "../types";

export function RoApprovalsScreen({
  approvals,
  onBack,
  onDecision,
}: {
  approvals: RoApproval[];
  onBack: () => void;
  onDecision: (id: string, status: Extract<RoApprovalStatus, "approved" | "declined">) => void;
}) {
  const pending = approvals.filter((approval) => approval.status === "pending");
  const history = approvals.filter((approval) => approval.status !== "pending");

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <PageHeader
        compact
        includeSafeArea
        collapsedTitleProgress={1}
        showHelp={false}
        variant="transparent"
        title="Cereri & aprobări"
        onBack={onBack}
      />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[36px] pt-[10px]">
        {pending.length === 0 && history.length === 0 ? (
          <div className="grid min-h-[320px] place-items-center text-center">
            <div>
              <span className="mx-auto grid size-[64px] place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
                <AppIcon name="check" size={30} />
              </span>
              <p className="mt-[14px] text-[16px] font-bold text-[var(--uc-text)]">Nimic de aprobat</p>
              <p className="mt-[4px] text-[14px] text-[var(--uc-text-muted)]">Ești la zi. 🎉</p>
            </div>
          </div>
        ) : null}

        {pending.length > 0 ? (
          <section>
            <h2 className="mb-[10px] text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
              În așteptare
            </h2>
            <div className="space-y-[12px]">
              {pending.map((approval) => (
                <RoCard key={approval.id}>
                  <div className="flex items-start gap-[13px]">
                    <span
                      className="grid size-[42px] shrink-0 place-items-center rounded-full"
                      style={{
                        background: `color-mix(in srgb, ${approval.accent} 16%, var(--uc-surface))`,
                        color: approval.accent,
                      }}
                    >
                      <AppIcon name={approval.icon} size={21} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-[8px]">
                        <p className="truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">
                          {approval.title}
                        </p>
                        <RoStatusPill status={approval.status} />
                      </div>
                      <p className="mt-[3px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                        {formatRon(approval.amount)} · {approval.note ?? approval.counterparty}
                      </p>
                      <p className="mt-[2px] text-[12px] text-[var(--uc-text-muted)]">{approval.createdAt}</p>
                    </div>
                  </div>

                  {/* Demo control: play the parent side of the loop */}
                  <div className="mt-[14px] rounded-[12px] bg-[var(--hu-theme-control-bg)] p-[10px]">
                    <p className="mb-[8px] text-[12px] font-bold text-[var(--uc-text-muted)]">
                      Simulează răspunsul {RO_TEEN_PROFILE.parentName} (demo)
                    </p>
                    <div className="flex gap-[8px]">
                      <button
                        type="button"
                        className="h-[40px] flex-1 rounded-[10px] bg-[var(--uc-green-success)] text-[14px] font-bold text-[var(--uc-static-white)] active:scale-[0.98]"
                        onClick={() => onDecision(approval.id, "approved")}
                      >
                        Aprobă
                      </button>
                      <button
                        type="button"
                        className="h-[40px] flex-1 rounded-[10px] bg-[color-mix(in_srgb,var(--uc-red-main)_16%,var(--uc-surface))] text-[14px] font-bold text-[var(--uc-red-main)] active:scale-[0.98]"
                        onClick={() => onDecision(approval.id, "declined")}
                      >
                        Refuză
                      </button>
                    </div>
                  </div>
                </RoCard>
              ))}
            </div>
          </section>
        ) : null}

        {history.length > 0 ? (
          <section className="mt-[22px]">
            <h2 className="mb-[10px] text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
              Istoric
            </h2>
            <RoCard padded={false} className="px-[16px]">
              {history.map((approval, index) => (
                <div
                  key={approval.id}
                  className={`flex items-center gap-[12px] py-[13px] ${
                    index > 0 ? "border-t border-[var(--uc-border-muted)]" : ""
                  }`}
                >
                  <span
                    className="grid size-[38px] shrink-0 place-items-center rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${approval.accent} 16%, var(--uc-surface))`,
                      color: approval.accent,
                    }}
                  >
                    <AppIcon name={approval.icon} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">
                      {approval.title}
                    </p>
                    <p className="truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
                      {formatRon(approval.amount)} · {approval.counterparty}
                    </p>
                  </div>
                  <RoStatusPill status={approval.status} />
                </div>
              ))}
            </RoCard>
          </section>
        ) : null}
      </main>
    </div>
  );
}
