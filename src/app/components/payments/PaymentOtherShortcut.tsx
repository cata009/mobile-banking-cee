import type { PaymentOtherIcon, PaymentOtherItem } from "@/app/config/paymentsMenuConfig";
import ActionIconBubble from "@/app/components/ActionIconBubble";
import type { IconName } from "@/app/components/icons";

const paymentOtherIconName: Record<PaymentOtherIcon, IconName> = {
  qr: "payment-create-qr",
  templates: "payment-templates",
  card: "payment-card-repayment",
  standing: "payment-templates",
  foreign: "payment-exchange-rates",
  exchange: "payment-exchange-rates",
};

/**
 * Same mark as the account actions on the product cards: a 48px neutral roundel
 * with the icon in text tone, and a 14px sentence-case label under it. Themes
 * that recolour the roundel (HU Kids) still get their accent through the custom
 * properties.
 */
const paymentOtherLabelClass =
  "block w-full overflow-hidden text-center text-[14px] font-normal leading-[16px]";

export function PaymentOtherShortcutIconBubble({ icon }: { icon: PaymentOtherIcon }) {
  return (
    <ActionIconBubble
      iconName={paymentOtherIconName[icon]}
      dataDsLabel="PaymentOtherShortcutIconBubble"
    />
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
      className="flex w-[74px] shrink-0 cursor-pointer flex-col items-center gap-[6px] rounded-[8px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
      aria-label={item.label.replace(/\n/g, " ")}
    >
      <PaymentOtherShortcutIconBubble icon={item.icon} />
      <span
        className={paymentOtherLabelClass}
        style={{
          color: "var(--uc-text)",
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
