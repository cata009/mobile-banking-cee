import { useId, useState } from "react";

import { BottomSheet } from "@/app/components/BottomSheet";
import PrimaryButton from "@/app/components/PrimaryButton";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatAmount } from "@/data/products";
import { MY_BANKER_RM } from "@/data/myBankerCore";
import type { MyBankerRequestContext } from "@/app/screens/my-banker/MyBankerProductCard";

interface MyBankerRequestSheetProps {
  request: MyBankerRequestContext;
  onCancel: () => void;
  onSubmit: (message: string) => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-[8px] py-[6px]">
      <span className="uc-type-n5 text-[var(--uc-text-muted)]">{label}</span>
      <span className="uc-type-n5-strong text-right text-[var(--uc-text)]">{value}</span>
    </div>
  );
}

/**
 * Inquiry pop-up for one product. It opens pre-filled with the product context
 * — and with the simulated amount and term when the client actually ran the
 * simulation — plus a free-text field. Cancelling returns to the card with the
 * simulation untouched, because the card owns that state, not this sheet.
 */
export default function MyBankerRequestSheet({ request, onCancel, onSubmit }: MyBankerRequestSheetProps) {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const messageId = useId();

  const amountParts = formatAmount(request.amount, request.currency as never);

  return (
    <BottomSheet
      title={t("runtime.myBanker.request.sheetTitle", "Send request")}
      subtitle={t("runtime.myBanker.request.sheetIntro", "Your request goes to {name}.").replace(
        "{name}",
        MY_BANKER_RM.name,
      )}
      onClose={onCancel}
      closeLabel={t("runtime.myBanker.request.cancel", "Cancel")}
      footer={
        <div className="flex flex-col gap-[8px]">
          <PrimaryButton onClick={() => onSubmit(message.trim())}>
            {t("runtime.myBanker.request.send", "Send request")}
          </PrimaryButton>
          <PrimaryButton variant="surface" onClick={onCancel}>
            {t("runtime.myBanker.request.cancel", "Cancel")}
          </PrimaryButton>
        </div>
      }
    >
      <div className="divide-y divide-[var(--uc-border-muted)]">
        <SummaryRow
          label={t("runtime.myBanker.request.product", "Product")}
          value={request.productName}
        />
        <SummaryRow
          label={t("runtime.myBanker.request.amount", "Amount")}
          value={`${amountParts.integer} ${request.currency}`}
        />
        {request.termMonths !== null && (
          <SummaryRow
            label={t("runtime.myBanker.request.term", "Duration")}
            value={`${request.termMonths} ${t("runtime.myBanker.simulation.months", "months")}`}
          />
        )}
        {request.ratePercent !== null && (
          <SummaryRow
            label={t("runtime.myBanker.simulation.applicableRate", "Applicable rate")}
            value={`${request.ratePercent}% ${t("runtime.myBanker.card.perYear", "p.a.")}`}
          />
        )}
      </div>

      {/* The control is both nested in its label and bound by id, so the
          message field is reachable however the client's assistive tech
          resolves it. */}
      <label className="mt-[16px] block" htmlFor={messageId}>
        <span className="uc-type-n5 block text-[var(--uc-text-muted)]">
          {t("runtime.myBanker.request.message", "Message")}
        </span>
        <textarea
          id={messageId}
          aria-label={t("runtime.myBanker.request.message", "Message")}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder={t("runtime.myBanker.request.messagePlaceholder", "")}
          className="mt-[4px] w-full resize-none border-b-[0.5px] border-[var(--uc-text-subtle)] bg-transparent pb-[3px] uc-type-p1 text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-subtle)] focus:border-[var(--uc-action)]"
        />
      </label>
    </BottomSheet>
  );
}
