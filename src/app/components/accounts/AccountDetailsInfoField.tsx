import type { ReactNode } from "react";
import { resolveAccountInfoField } from '@/app/components/contracts/accountInfoField';

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
  const state = resolveAccountInfoField({ hasTrailing: Boolean(trailingIcon) });
  return (
    <div
      className={`h-[80px] w-full items-center ${
        state.layoutClass
      }`}
      data-account-details-info-field
      data-account-details-info-field-variant={state.variant}
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
