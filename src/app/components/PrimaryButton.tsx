interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "action" | "surface";
  labelSize?: "16" | "18";
}

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = "action",
  labelSize = "16",
}: PrimaryButtonProps) {
  const isAction = variant === "action";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex w-[327px] h-[48px] px-0 py-3
        justify-center items-center gap-4
        rounded
        ${isAction ? "bg-[var(--uc-action)] text-[var(--uc-text-inverse)]" : "bg-[var(--uc-surface)] text-[var(--uc-text)]"}
        ${labelSize === "18" ? "uc-type-h2" : "uc-type-n4-strong"}
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]
        ${disabled ? 'opacity-30 cursor-not-allowed' : `opacity-100 cursor-pointer ${isAction ? "hover:bg-[var(--uc-action-hover)]" : "hover:opacity-90"} active:scale-[0.98]`}
        ${className}
      `}
    >
      <span className="block max-w-full truncate">{children}</span>
    </button>
  );
}
