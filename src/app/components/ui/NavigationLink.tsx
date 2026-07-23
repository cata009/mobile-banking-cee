import ChevronIcon from "@/app/components/ui/ChevronIcon";

interface NavigationLinkProps {
  text: string;
  onClick?: () => void;
}

export default function NavigationLink({ text, onClick }: NavigationLinkProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-[1px] cursor-pointer hover:opacity-80 transition-opacity"
      type="button"
    >
      <p className="uc-type-n5-strong whitespace-nowrap text-[var(--uc-static-white)]">
        {text}
      </p>
      <ChevronIcon />
    </button>
  );
}
