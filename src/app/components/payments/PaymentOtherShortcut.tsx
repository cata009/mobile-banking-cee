import type { PaymentOtherIcon, PaymentOtherItem } from "@/app/config/paymentsMenuConfig";
import { AppIcon, type IconName } from "@/app/components/icons";

const paymentOtherIconName: Record<PaymentOtherIcon, IconName> = {
  qr: "payment-create-qr",
  templates: "payment-templates",
  card: "payment-card-repayment",
  exchange: "payment-exchange-rates",
};

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
      className="flex min-w-0 flex-1 flex-col items-center gap-[10px] cursor-pointer"
      aria-label={item.label.replace(/\n/g, " ")}
    >
      <span className="flex size-[58px] items-center justify-center rounded-full bg-[var(--uc-action)]">
        <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center">
          <PaymentOtherShortcutIcon icon={item.icon} />
        </span>
      </span>
      <span
        className="whitespace-pre-line text-center font-['UniCredit',sans-serif] text-[14px] font-bold leading-normal tracking-[1px] text-[var(--uc-text)]"
        style={{ fontFeatureSettings: "'liga' off, 'clig' off" }}
      >
        {item.label}
      </span>
    </button>
  );
}
