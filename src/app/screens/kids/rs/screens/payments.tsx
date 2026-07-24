/**
 * RS Teens Payments hub — the hero surface reached from the raised centre nav
 * button. Quick-pay grid, action tiles, subscriptions, and an explainer on how
 * parent approval works.
 */
import { AppIcon } from "@/app/components/icons";
import { ListCard, QuickActionTile, Banner, SectionLabel } from "../ui";
import { PayeeAvatar } from "../ui/atoms";
import { getRsQuickPayees } from "../payees";
import { RS_PAYEES } from "../payees";
import { formatRsd } from "../money";
import type { RsPayee } from "../types";

export function RsPaymentsScreen({
  weeklyRemaining,
  onPayPayee,
  onPayAll,
  onSend,
  onRequest,
  onTopUp,
}: {
  weeklyRemaining: number;
  onPayPayee: (id: string) => void;
  onPayAll: () => void;
  onSend: () => void;
  onRequest: () => void;
  onTopUp: () => void;
}) {
  const quick = getRsQuickPayees();
  const subs = RS_PAYEES.filter((p) => p.category === "subscription");

  return (
    <div className="flex flex-col gap-4 px-[20px] pt-2">
      {/* Hero actions */}
      <div className="grid grid-cols-4 gap-2">
        <QuickActionTile icon="receipt-text" label="Plati" onClick={onPayAll} accent="var(--uc-product-blue)" />
        <QuickActionTile icon="send" label="Pošalji" onClick={onSend} accent="var(--uc-green-main)" />
        <QuickActionTile icon="circle-dollar-sign" label="Traži" onClick={onRequest} accent="var(--uc-product-pink)" />
        <QuickActionTile icon="add-money" label="Dopuni" onClick={onTopUp} accent="var(--uc-product-mauve)" />
      </div>

      {/* Quick pay grid */}
      <div>
        <SectionLabel>Brzo plaćanje</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          {quick.map((payee) => (
            <QuickPayTile key={payee.id} payee={payee} onClick={() => onPayPayee(payee.id)} />
          ))}
        </div>
      </div>

      {/* Weekly remaining banner */}
      <ListCard className="!p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "color-mix(in srgb, var(--uc-product-blue) 16%, transparent)", color: "var(--uc-product-blue-deep)" }}
            >
              <AppIcon name="wallet-cards" size={20} />
            </span>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold" style={{ color: "var(--uc-text)" }}>
                Nedeljni limit
              </span>
              <span className="text-[11px]" style={{ color: "var(--uc-text-muted)" }}>
                još uvek možeš da potrošiš
              </span>
            </div>
          </div>
          <span className="text-[18px] font-bold" style={{ color: "var(--uc-text)" }}>
            {formatRsd(weeklyRemaining)}
          </span>
        </div>
      </ListCard>

      {/* Subscriptions */}
      <div>
        <SectionLabel>Pretplate</SectionLabel>
        <div className="flex flex-col gap-1.5">
          {subs.map((payee) => (
            <ListCard key={payee.id} onClick={() => onPayPayee(payee.id)} className="!p-3">
              <div className="flex items-center gap-3">
                <PayeeAvatar payee={payee} size={40} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-semibold" style={{ color: "var(--uc-text)" }}>
                    {payee.name}
                  </span>
                  <span className="truncate text-[12px]" style={{ color: "var(--uc-text-muted)" }}>
                    {payee.handle}
                  </span>
                </div>
                <span className="text-[13px] font-bold" style={{ color: "var(--uc-text-muted)" }}>
                  do {formatRsd(payee.perPaymentLimit)}
                </span>
              </div>
            </ListCard>
          ))}
        </div>
      </div>

      {/* How approval works */}
      <Banner
        icon="shield-check"
        title="Kako radi odobrenje"
        body="Manji iznosi za odobrene osobe idu odmah. Veći iznosi ili nove osobe idu Tati na potvrdu — dobijaš obaveštenje čim odgovori."
        accent="var(--uc-product-blue)"
      />
    </div>
  );
}

function QuickPayTile({ payee, onClick }: { payee: RsPayee; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-[16px] p-3 transition active:scale-95"
      style={{ background: "var(--hu-theme-card-bg)", boxShadow: "0 1px 2px color-mix(in srgb, var(--uc-shadow) 40%, transparent)" }}
    >
      <PayeeAvatar payee={payee} size={40} />
      <span className="max-w-full truncate text-[12px] font-semibold" style={{ color: "var(--uc-text)" }}>
        {payee.name}
      </span>
    </button>
  );
}
