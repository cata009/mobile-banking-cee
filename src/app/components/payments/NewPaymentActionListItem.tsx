import type { NewPaymentAction, NewPaymentActionIcon } from "@/app/config/paymentsMenuConfig";
import { AppIcon, type IconName } from "@/app/components/icons";

const actionIconName: Record<NewPaymentActionIcon, IconName> = {
  domestic: "new-payment-domestic",
  foreign: "new-payment-foreign",
  templates: "payment-templates",
  qr: "payment-scan-qr",
  slip: "payment-create-qr",
  exchange: "payment-exchange-rates",
};

function NewPaymentActionIconView({ icon }: { icon: NewPaymentActionIcon }) {
  return <AppIcon name={actionIconName[icon]} color="var(--uc-icon)" />;
}

export default function NewPaymentActionListItem({
  action,
  onSelect,
}: {
  action: NewPaymentAction;
  onSelect: (action: NewPaymentAction) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(action)}
      className="grid h-[80px] w-full grid-cols-[32px_1fr_32px] items-center gap-[16px] text-left transition"
    >
      <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center">
        <NewPaymentActionIconView icon={action.icon} />
      </span>
      <span className="min-w-0">
        <span
          className="uc-type-h2 block text-[var(--uc-text)]"
          style={{ fontFeatureSettings: "'liga' off, 'clig' off", letterSpacing: "0.3px" }}
        >
          {action.title}
        </span>
        <span className="uc-type-n5 mt-[2px] block text-[var(--uc-text)]">
          {action.description}
        </span>
      </span>
      <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center">
        <AppIcon name="chevron-link" color="var(--uc-icon)" />
      </span>
    </button>
  );
}
