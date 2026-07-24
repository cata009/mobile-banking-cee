/**
 * RS Teens Activity — full day-grouped transaction list + transaction detail.
 */
import { AppIcon } from "@/app/components/icons";
import { ListCard, StatusPill } from "../ui";
import { MerchantLogoMark } from "../ui/merchantLogos";
import { formatRsdFull, formatRsdSigned } from "../money";
import { groupRsTransactionsByDay } from "../data";
import type { RsTransaction } from "../types";
import { TxRow } from "./home";

export function RsActivityScreen({
  transactions,
  showAmounts,
  onBack,
  onTransactionClick,
}: {
  transactions: RsTransaction[];
  showAmounts: boolean;
  onBack: () => void;
  onTransactionClick: (tx: RsTransaction) => void;
}) {
  const groups = groupRsTransactionsByDay(transactions);
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[54px] flex-shrink-0 items-center gap-2 px-[16px]">
        <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5" aria-label="Nazad">
          <AppIcon name="chevron-left" size={22} />
        </button>
        <h1 className="text-[18px] font-bold">Aktivnost</h1>
      </div>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[40px]">
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <ListCard key={group.key} className="!p-0">
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="text-[13px] font-bold" style={{ color: "var(--uc-text-muted)" }}>{group.title}</span>
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
    </div>
  );
}

export function RsTransactionDetail({
  transaction,
  showAmounts,
  onBack,
}: {
  transaction: RsTransaction;
  showAmounts: boolean;
  onBack: () => void;
}) {
  const positive = transaction.amount >= 0;
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[54px] flex-shrink-0 items-center gap-2 px-[16px]">
        <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5" aria-label="Nazad">
          <AppIcon name="chevron-left" size={22} />
        </button>
        <h1 className="text-[18px] font-bold">Detalji transakcije</h1>
      </div>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[40px]">
        <div className="flex flex-col items-center gap-3 py-8">
          {transaction.merchantLogo ? (
            <MerchantLogoMark logo={transaction.merchantLogo} />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${transaction.accent} 16%, transparent)`, color: transaction.accent }}>
              <AppIcon name={transaction.icon} size={24} />
            </span>
          )}
          <span className="text-[28px] font-bold" style={{ color: positive ? "var(--uc-green-deep)" : "var(--uc-text)" }}>
            {formatRsdSigned(transaction.amount, showAmounts)}
          </span>
          <span className="text-[15px] font-semibold" style={{ color: "var(--uc-text)" }}>{transaction.merchant}</span>
          {transaction.status === "Na čekanju" && <StatusPill tone="pending">Na čekanju</StatusPill>}
        </div>
        <ListCard className="!p-4">
          <Row label="Iznos" value={showAmounts ? formatRsdFull(Math.abs(transaction.amount)) : "•••• RSD"} />
          <Row label="Kategorija" value={transaction.category} />
          <Row label="Datum" value={`${transaction.dayLabel} · ${transaction.time}`} />
          <Row label="Opis" value={transaction.subtitle} last />
        </ListCard>
      </div>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={last ? "flex justify-between py-2" : "flex justify-between border-b border-[color-mix(in_srgb,var(--uc-border)_60%,transparent)] py-3"}>
      <span className="text-[14px]" style={{ color: "var(--uc-text-muted)" }}>{label}</span>
      <span className="text-[14px] font-semibold" style={{ color: "var(--uc-text)" }}>{value}</span>
    </div>
  );
}
