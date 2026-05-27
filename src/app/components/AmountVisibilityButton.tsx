import { AppIcon } from "@/app/components/icons";

interface AmountVisibilityButtonProps {
  hidden: boolean;
  onToggle: () => void;
}

export default function AmountVisibilityButton({ hidden, onToggle }: AmountVisibilityButtonProps) {
  return (
    <button
      type="button"
      className="flex h-[32px] w-[32px] items-center justify-center cursor-pointer hover:opacity-70"
      onClick={onToggle}
      aria-pressed={hidden}
      aria-label={hidden ? "Show amounts" : "Hide amounts"}
    >
      {hidden ? (
        <AppIcon name="amount-show" color="var(--uc-icon)" />
      ) : (
        <AppIcon name="amount-hide" color="var(--uc-icon)" />
      )}
    </button>
  );
}
