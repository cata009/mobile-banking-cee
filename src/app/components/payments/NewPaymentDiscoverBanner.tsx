import { PAYMENT_DISCOVER_CONTRACT } from "../contracts/paymentDiscover";
import { useState } from "react";
import { AppIcon } from "@/app/components/icons";

export default function NewPaymentDiscoverBanner({
  title,
  description,
  className = "mt-[24px]",
}: {
  title: string;
  description: string;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={`${className} rounded-[4px] bg-[var(--uc-action-strong)] p-[16px] text-[var(--uc-static-white)]`}>
      <div className={PAYMENT_DISCOVER_CONTRACT.gridClass}>
        <span className="mt-[4px] flex h-[32px] w-[32px] shrink-0 items-center justify-center">
          <AppIcon name="info-circle" color="var(--uc-text-inverse)" />
        </span>
        <div className="min-w-0">
          <p className="uc-type-h2 text-[var(--uc-text-inverse)]">
            {title}
          </p>
          <p className="uc-type-p1 mt-[4px] text-[var(--uc-text-inverse)]">
            {description}
          </p>
        </div>
        <button
          aria-label={PAYMENT_DISCOVER_CONTRACT.closeLabel}
          className="grid h-[32px] w-[32px] shrink-0 place-items-center"
          onClick={() => setIsVisible(false)}
          type="button"
        >
          <AppIcon name="close-x" color="var(--uc-text-inverse)" />
        </button>
      </div>
    </div>
  );
}
