import type { PaymentOtherIcon, PaymentOtherItem } from "@/app/config/paymentsMenuConfig";
import { AppIcon, type IconName } from "@/app/components/icons";

const paymentOtherIconName: Record<PaymentOtherIcon, IconName> = {
  qr: "payment-create-qr",
  templates: "payment-templates",
  card: "payment-card-repayment",
  standing: "payment-templates",
  foreign: "payment-exchange-rates",
  exchange: "payment-exchange-rates",
};

const paymentOtherLabelClass =
  "uc-type-n5-strong block w-full overflow-hidden text-center";

function PaymentOtherShortcutIcon({ icon }: { icon: PaymentOtherIcon }) {
  return <AppIcon name={paymentOtherIconName[icon]} color="var(--uc-text-inverse)" />;
}

export function PaymentOtherShortcutIconBubble({ icon }: { icon: PaymentOtherIcon }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center gap-[10px] rounded-full bg-[var(--uc-action)] p-[8px]"
      data-ds-label="PaymentOtherShortcutIconBubble"
    >
      <span className="flex size-[32px] shrink-0 items-center justify-center">
        <PaymentOtherShortcutIcon icon={icon} />
      </span>
    </span>
  );
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
      <PaymentOtherShortcutIconBubble icon={item.icon} />
      <span
        className={paymentOtherLabelClass}
        style={{
          color: "var(--Primary-K1, #262626)",
          fontFeatureSettings: "'liga' off, 'clig' off",
          fontStyle: "normal",
          lineHeight: "normal",
        }}
      >
        <span
          className="block whitespace-pre-line [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
          style={{ lineHeight: "normal" }}
        >
          {item.label}
        </span>
      </span>
    </button>
  );
}
