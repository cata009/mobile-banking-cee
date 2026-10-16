import { AppIcon } from "@/app/components/icons";
import { BACK_BUTTON_CONTRACT } from "../contracts/backButton";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export default function BackButton({ onClick, className = '' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${BACK_BUTTON_CONTRACT.webClass} ${className}`}
      aria-label={BACK_BUTTON_CONTRACT.label}
    >
      <AppIcon name={BACK_BUTTON_CONTRACT.icon} />
    </button>
  );
}
