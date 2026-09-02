import type { PaymentOtherIcon, PaymentOtherItem } from "@/app/config/paymentsMenuConfig";
import ActionIconBubble from "@/app/components/ActionIconBubble";
import { AppIcon, type IconName } from "@/app/components/icons";

const paymentOtherIconName: Record<PaymentOtherIcon, IconName> = {
  qr: "payment-create-qr",
  templates: "payment-templates",
  card: "payment-card-repayment",
  standing: "payment-templates",
  foreign: "payment-exchange-rates",
  exchange: "payment-exchange-rates",
};

/**
 * `baseline` is the original shortcut: a brand-coloured roundel with the glyph
 * knocked out of it. `evo-2027` is the neutral 48px mark the account actions
 * adopted with Evo 2027. Themes that recolour the roundel (HU Kids) reach both
 * through the `--pi-shortcut-icon-*` custom properties.
 */
export type PaymentOtherShortcutTreatment = "baseline" | "evo-2027";

const paymentOtherLabelClass: Record<PaymentOtherShortcutTreatment, string> = {
  baseline: "uc-type-n5-strong block w-full overflow-hidden text-center",
  "evo-2027": "block w-full overflow-hidden text-center text-[14px] font-normal leading-[16px]",
};

export function PaymentOtherShortcutIconBubble({
  icon,
  treatment = "evo-2027",
}: {
  icon: PaymentOtherIcon;
  treatment?: PaymentOtherShortcutTreatment;
}) {
  if (treatment === "baseline") {
    return (
      <span
        className="flex shrink-0 items-center justify-center gap-[10px] rounded-full p-[8px]"
        data-ds-label="PaymentOtherShortcutIconBubble"
        style={{ background: "var(--pi-shortcut-icon-bg, var(--uc-action))" }}
      >
        <span className="flex size-[32px] shrink-0 items-center justify-center">
          <AppIcon
            name={paymentOtherIconName[icon]}
            color="var(--pi-shortcut-icon-fg, var(--uc-text-inverse))"
          />
        </span>
      </span>
    );
  }

  return (
    <ActionIconBubble
      iconName={paymentOtherIconName[icon]}
      dataDsLabel="PaymentOtherShortcutIconBubble"
    />
  );
}

export default function PaymentOtherShortcut({
  item,
  treatment = "evo-2027",
  onClick,
}: {
  item: PaymentOtherItem;
  treatment?: PaymentOtherShortcutTreatment;
  onClick?: (item: PaymentOtherItem) => void;
}) {
  const isBaseline = treatment === "baseline";

  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      className={`flex w-[74px] shrink-0 cursor-pointer flex-col items-center rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)] ${isBaseline ? "gap-[10px]" : "gap-[6px] text-[var(--uc-text)]"}`}
      aria-label={item.label.replace(/\n/g, " ")}
    >
      <PaymentOtherShortcutIconBubble icon={item.icon} treatment={treatment} />
      <span
        className={paymentOtherLabelClass[treatment]}
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
