import type { ReactNode } from "react";

interface AccountDetailsInfoFieldProps {
  title: string;
  subtitle: string;
  trailingIcon?: ReactNode;
}

export default function AccountDetailsInfoField({
  title,
  subtitle,
  trailingIcon,
}: AccountDetailsInfoFieldProps) {
  return (
    <div
      className={`h-[80px] w-full items-center ${
        trailingIcon ? "grid grid-cols-[minmax(0,1fr)_40px] gap-[16px]" : "flex"
      }`}
      data-account-details-info-field
      data-account-details-info-field-variant={trailingIcon ? "with-icon" : "default"}
    >
      <div className="flex min-w-0 flex-col gap-[4px]">
        <p className="uc-type-n4 uppercase text-[var(--uc-text)]">
          {title}
        </p>
        <p className="uc-type-n4-strong break-words text-[var(--uc-text)]">
          {subtitle}
        </p>
      </div>

      {trailingIcon ? (
        <div className="flex h-[40px] w-[40px] items-center justify-center">
          {trailingIcon}
        </div>
      ) : null}
    </div>
  );
}
