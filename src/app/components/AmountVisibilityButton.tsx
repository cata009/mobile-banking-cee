import { AppIcon } from "@/app/components/icons";
import { resolveAmountVisibility } from '@/app/components/contracts/amountVisibility';

interface AmountVisibilityButtonProps {
  hidden: boolean;
  onToggle: () => void;
}

export default function AmountVisibilityButton({ hidden, onToggle }: AmountVisibilityButtonProps) {
  const state = resolveAmountVisibility(hidden);
  return (
    <button
      type="button"
      className="flex h-[32px] w-[32px] items-center justify-center cursor-pointer hover:opacity-70"
      onClick={onToggle}
      aria-pressed={hidden}
      aria-label={state.label}
    >
      {hidden ? (
        <AppIcon name={state.icon} color="var(--uc-icon)" />
      ) : (
        <AppIcon name={state.icon} color="var(--uc-icon)" />
      )}
    </button>
  );
}
