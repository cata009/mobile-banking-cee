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
    <div className={`${className} rounded-[4px] bg-[var(--uc-action)] p-[16px] text-[var(--uc-text-inverse)]`}>
      <div className="grid grid-cols-[32px_1fr_32px] items-start gap-[14px]">
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
          aria-label="Dismiss payment help"
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
