import type { PaymentOtherIcon, PaymentOtherItem } from "@/app/config/paymentsMenuConfig";
import { AppIcon, type IconName } from "@/app/components/icons";

const paymentOtherIconName: Record<PaymentOtherIcon, IconName> = {
  qr: "payment-create-qr",
  templates: "payment-templates",
  card: "payment-card-repayment",
  exchange: "payment-exchange-rates",
};

const paymentOtherLabelClass =
  "overflow-hidden text-center font-['UniCredit',sans-serif] text-[14px] font-bold tracking-[1px] text-[var(--uc-text)]";

function PaymentOtherShortcutIcon({ icon }: { icon: PaymentOtherIcon }) {
  return <AppIcon name={paymentOtherIconName[icon]} color="var(--uc-text-inverse)" />;
}

export default function PaymentOtherShortcut({
  item,
  onClick,
}: {
  item: PaymentOtherItem;
  onClick?: (item: PaymentOtherItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      className="flex w-[74px] shrink-0 flex-col items-center gap-[10px] cursor-pointer"
      aria-label={item.label.replace(/\n/g, " ")}
    >
      <span className="flex size-[58px] items-center justify-center rounded-full bg-[var(--uc-action)]">
        <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center">
          <PaymentOtherShortcutIcon icon={item.icon} />
        </span>
      </span>
      <span
        className={paymentOtherLabelClass}
        style={{ fontFeatureSettings: "'liga' off, 'clig' off" }}
      >
        <span
          className="block whitespace-pre-line [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
          style={{ lineHeight: "15px" }}
        >
          {item.label}
        </span>
      </span>
    </button>
  );
}
