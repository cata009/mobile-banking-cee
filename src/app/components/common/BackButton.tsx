import { AppIcon } from "@/app/components/icons";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export default function BackButton({ onClick, className = '' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-[32px] h-[32px] flex items-center justify-center cursor-pointer ${className}`}
      aria-label="Go back"
    >
      <AppIcon name="back-line" className="h-full w-full" />
    </button>
  );
}
