import type { ButtonHTMLAttributes, ReactNode } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

type LinkButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  iconName?: IconName;
  iconSize?: number;
};

export default function LinkButton({
  children,
  className,
  iconName = "chevron-link",
  iconSize = 24,
  type = "button",
  ...props
}: LinkButtonProps) {
  return (
    <button
      className={cn(
        "flex w-fit items-center justify-center gap-0 whitespace-nowrap text-[13px] font-bold uppercase leading-[16px] tracking-[0] text-[var(--uc-action)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)] disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      type={type}
      {...props}
    >
      <span>{children}</span>
      <AppIcon name={iconName} size={iconSize} />
    </button>
  );
}
