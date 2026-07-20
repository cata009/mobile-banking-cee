import { AppIcon } from "@/app/components/icons";
import type { PaymentTemplateSelection } from "@/data/paymentTemplates";

interface PaymentTemplateListItemProps {
  item: PaymentTemplateSelection;
  onSelect: (item: PaymentTemplateSelection) => void;
  selectLabel: string;
  forLabel: string;
}

export default function PaymentTemplateListItem({
  item,
  onSelect,
  selectLabel,
  forLabel,
}: PaymentTemplateListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="grid w-full grid-cols-[40px_minmax(0,1fr)_32px] items-center gap-[8px] px-[8px] py-[10px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]"
      aria-label={`${selectLabel} ${item.title} ${forLabel} ${item.beneficiaryName}`}
    >
      <span className="grid size-[40px] place-items-center" aria-hidden="true">
        <AppIcon name="payment-templates" color="var(--uc-icon)" />
      </span>
      <span className="min-w-0">
        <span className="uc-type-n4-strong block truncate text-[var(--uc-text)]">{item.title}</span>
        {item.kind === "template" ? (
          <span className="uc-type-n5-strong block truncate text-[var(--uc-text)]">{item.beneficiaryName}</span>
        ) : null}
        <span className="uc-type-n5 block truncate text-[var(--uc-text-muted)]">{item.accountNumber}</span>
        {item.kind === "template" ? (
          <span className="uc-type-n4-strong block text-[var(--uc-text)]">
            {item.amount} {item.currency}
          </span>
        ) : null}
      </span>
      <span className="grid size-[32px] place-items-center" aria-hidden="true">
        <AppIcon name="more-horizontal" className="rotate-90" color="var(--uc-icon)" />
      </span>
    </button>
  );
}
