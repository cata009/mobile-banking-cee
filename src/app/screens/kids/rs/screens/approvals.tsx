/**
 * RS Teens Approvals inbox — the loop-closer. Lists pending/approved/declined
 * items and exposes a "simulate Tata's decision" control so a demo can prove
 * the money actually moves when a parent approves (instant payment on approve,
 * balance credit on approved request/top-up/task).
 */
import { useState } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import { ListCard, StatusPill } from "../ui";
import { formatRsdSigned } from "../money";
import type { RsApproval, RsApprovalKind, RsApprovalStatus } from "../types";

const KIND_ICON: Record<RsApprovalKind, IconName> = {
  payment: "receipt-text",
  request: "circle-dollar-sign",
  topup: "add-money",
  task: "clipboard-check",
  "learn-reward": "hu-kids-learn",
};

const STATUS_LABEL: Record<RsApprovalStatus, string> = {
  pending: "Na čekanju",
  approved: "Odobreno",
  declined: "Odbijeno",
  completed: "Završeno",
};

type Filter = "pending" | "all";

export function RsApprovalsScreen({
  approvals,
  onBack,
  onDecision,
}: {
  approvals: RsApproval[];
  onBack: () => void;
  onDecision: (id: string, status: "approved" | "declined") => void;
}) {
  const [filter, setFilter] = useState<Filter>("pending");
  const shown = filter === "pending" ? approvals.filter((a) => a.status === "pending") : approvals;
  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[54px] flex-shrink-0 items-center gap-2 px-[16px]">
        <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5" aria-label="Nazad">
          <AppIcon name="chevron-left" size={22} />
        </button>
        <h1 className="text-[18px] font-bold">Odobrenja</h1>
        {pendingCount > 0 && <StatusPill tone="pending">{pendingCount}</StatusPill>}
      </div>

      <div className="flex gap-2 px-[20px] pb-2">
        {(["pending", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn("rounded-full px-4 py-1.5 text-[13px] font-semibold transition")}
            style={{
              background: filter === f ? "var(--uc-product-blue)" : "var(--hu-theme-card-bg)",
              color: filter === f ? "#fff" : "var(--uc-text-muted)",
            }}
          >
            {f === "pending" ? "Na čekanju" : "Sve"}
          </button>
        ))}
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[40px]">
        {shown.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "color-mix(in srgb, var(--uc-green-main) 14%, transparent)", color: "var(--uc-green-deep)" }}
            >
              <AppIcon name="check" size={32} />
            </span>
            <p className="text-[15px] font-semibold" style={{ color: "var(--uc-text)" }}>
              Sve na čekanju je rešeno.
            </p>
            <p className="text-[13px]" style={{ color: "var(--uc-text-muted)" }}>
              Nova odobrenja će se pojaviti ovde.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {shown.map((a) => (
              <ApprovalRow key={a.id} approval={a} onDecision={onDecision} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovalRow({
  approval,
  onDecision,
}: {
  approval: RsApproval;
  onDecision: (id: string, status: "approved" | "declined") => void;
}) {
  const isPending = approval.status === "pending";
  const toneKey =
    approval.status === "approved" || approval.status === "completed"
      ? "approved"
      : approval.status === "declined"
        ? "declined"
        : "pending";

  return (
    <ListCard className="!p-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: `color-mix(in srgb, ${approval.accent} 16%, transparent)`, color: approval.accent }}
        >
          <AppIcon name={KIND_ICON[approval.kind]} size={20} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold" style={{ color: "var(--uc-text)" }}>
            {approval.title}
          </span>
          <span className="truncate text-[12px]" style={{ color: "var(--uc-text-muted)" }}>
            {approval.counterparty}
            {approval.note ? ` · ${approval.note}` : ""}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[15px] font-bold" style={{ color: approval.amount >= 0 ? "var(--uc-green-deep)" : "var(--uc-text)" }}>
            {formatRsdSigned(approval.amount)}
          </span>
          <StatusPill tone={toneKey}>{STATUS_LABEL[approval.status]}</StatusPill>
        </div>
      </div>

      {isPending && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-[12px] p-2" style={{ background: "color-mix(in srgb, var(--uc-product-slate) 12%, transparent)" }}>
          <span className="px-2 text-[11px] font-medium" style={{ color: "var(--uc-text-muted)" }}>
            Simuliraj Tatinu odluku
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDecision(approval.id, "declined")}
              className="rounded-full px-3 py-1.5 text-[12px] font-bold"
              style={{ background: "color-mix(in srgb, var(--uc-red-main) 14%, transparent)", color: "var(--uc-red-deep)" }}
            >
              Odbij
            </button>
            <button
              type="button"
              onClick={() => onDecision(approval.id, "approved")}
              className="rounded-full px-3 py-1.5 text-[12px] font-bold text-white"
              style={{ background: "var(--uc-green-main)" }}
            >
              Odobri
            </button>
          </div>
        </div>
      )}
    </ListCard>
  );
}
