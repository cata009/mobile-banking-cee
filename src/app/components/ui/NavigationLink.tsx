import ChevronIcon from "@/app/components/ui/ChevronIcon";

interface NavigationLinkProps {
  text: string;
  onClick?: () => void;
}

export default function NavigationLink({ text, onClick }: NavigationLinkProps) {
  const handleClick = () => {
    console.log("🟡 NavigationLink clicked:", text);
    if (onClick) {
      console.log("🟡 Calling onClick handler for:", text);
      onClick();
    } else {
      console.log("🟡 No onClick handler for:", text);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-[1px] cursor-pointer hover:opacity-80 transition-opacity"
      type="button"
    >
      <p className="text-[var(--uc-static-white)] font-['UniCredit'] text-[14px] font-bold leading-[normal] whitespace-nowrap">
        {text}
      </p>
      <ChevronIcon />
    </button>
  );
}