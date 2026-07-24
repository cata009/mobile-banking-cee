/**
 * RO Teens activity: day-grouped transaction list + a themed transaction detail.
 * Reused by Home (recent) and the Card surface (full history).
 */
import PageHeader from "@/app/components/PageHeader";
import { AppIcon } from "@/app/components/icons";
import { formatRonSigned } from "../money";
import { RoCard } from "../ui";
import type { RoTransaction, RoTransactionDayGroup } from "../types";

export function groupRoTransactionsByDay(transactions: RoTransaction[]): RoTransactionDayGroup[] {
  const groups = new Map<string, RoTransactionDayGroup>();

  transactions.forEach((transaction) => {
    const existing = groups.get(transaction.dateKey);
    if (existing) {
      existing.transactions.push(transaction);
      existing.total += transaction.amount;
      return;
    }
    groups.set(transaction.dateKey, {
      key: transaction.dateKey,
      title: transaction.dayLabel,
      transactions: [transaction],
      total: transaction.amount,
    });
  });

  return Array.from(groups.values()).sort((a, b) => b.key.localeCompare(a.key));
}

export function RoTransactionRow({
  transaction,
  showAmounts,
  onClick,
}: {
  transaction: RoTransaction;
  showAmounts: boolean;
  onClick?: (transaction: RoTransaction) => void;
}) {
  const positive = transaction.amount >= 0;
  return (
    <button
      type="button"
      className="flex w-full items-center gap-[13px] py-[11px] text-left transition active:opacity-70 disabled:active:opacity-100"
      disabled={!onClick}
      onClick={() => onClick?.(transaction)}
    >
      <span
        className="grid size-[42px] shrink-0 place-items-center rounded-full"
        style={{
          background: `color-mix(in srgb, ${transaction.accent} 16%, var(--uc-surface))`,
          color: transaction.accent,
        }}
      >
        <AppIcon name={transaction.icon} size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">
          {transaction.merchant}
        </span>
        <span className="block truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
          {transaction.subtitle}
          {transaction.status === "În așteptare" ? " · în așteptare" : ""}
        </span>
      </span>
      <span
        className="shrink-0 text-[15px] font-bold leading-[19px]"
        style={{ color: positive ? "var(--uc-green-success)" : "var(--uc-text)" }}
      >
        {formatRonSigned(transaction.amount, showAmounts)}
      </span>
    </button>
  );
}

export function RoActivityList({
  transactions,
  showAmounts,
  onTransactionClick,
}: {
  transactions: RoTransaction[];
  showAmounts: boolean;
  onTransactionClick?: (transaction: RoTransaction) => void;
}) {
  const groups = groupRoTransactionsByDay(transactions);

  return (
    <div className="space-y-[16px]">
      {groups.map((group) => (
        <div key={group.key}>
          <p className="mb-[2px] text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
            {group.title}
          </p>
          <RoCard padded={false} className="px-[16px]">
            {group.transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={index > 0 ? "border-t border-[var(--uc-border-muted)]" : undefined}
              >
                <RoTransactionRow
                  transaction={transaction}
                  showAmounts={showAmounts}
                  onClick={onTransactionClick}
                />
              </div>
            ))}
          </RoCard>
        </div>
      ))}
    </div>
  );
}

export function RoTransactionDetail({
  transaction,
  showAmounts,
  onBack,
}: {
  transaction: RoTransaction;
  showAmounts: boolean;
  onBack: () => void;
}) {
  const positive = transaction.amount >= 0;

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <PageHeader
        compact
        includeSafeArea
        collapsedTitleProgress={1}
        showHelp={false}
        variant="transparent"
        title="Detalii tranzacție"
        onBack={onBack}
      />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[36px] pt-[10px]">
        <div className="flex flex-col items-center py-[16px] text-center">
          <span
            className="grid size-[72px] place-items-center rounded-full"
            style={{
              background: `color-mix(in srgb, ${transaction.accent} 16%, var(--uc-surface))`,
              color: transaction.accent,
            }}
          >
            <AppIcon name={transaction.icon} size={34} />
          </span>
          <p className="mt-[14px] text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">
            {transaction.merchant}
          </p>
          <p
            className="mt-[6px] text-[30px] font-bold leading-[34px]"
            style={{ color: positive ? "var(--uc-green-success)" : "var(--uc-text)" }}
          >
            {formatRonSigned(transaction.amount, showAmounts)}
          </p>
        </div>

        <RoCard padded={false} className="px-[16px]">
          {[
            { label: "Categorie", value: transaction.category },
            { label: "Când", value: `${transaction.dayLabel}, ${transaction.time}` },
            { label: "Stare", value: transaction.status },
            { label: "Detalii", value: transaction.subtitle },
          ].map((row, index) => (
            <div
              key={row.label}
              className={`flex items-center justify-between gap-[12px] py-[13px] ${
                index > 0 ? "border-t border-[var(--uc-border-muted)]" : ""
              }`}
            >
              <span className="text-[14px] text-[var(--uc-text-muted)]">{row.label}</span>
              <span className="truncate text-[15px] font-medium text-[var(--uc-text)]">{row.value}</span>
            </div>
          ))}
        </RoCard>
      </main>
    </div>
  );
}
