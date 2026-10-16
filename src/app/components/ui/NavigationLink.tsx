import ChevronIcon from "@/app/components/ui/ChevronIcon";
import { NAVIGATION_LINK } from "@/app/components/contracts/navigationLink";

interface NavigationLinkProps {
  text: string;
  onClick?: () => void;
}

export default function NavigationLink({ text, onClick }: NavigationLinkProps) {
  return (
    <button
      onClick={onClick}
      className={NAVIGATION_LINK.rootClass}
      type="button"
    >
      <p className={NAVIGATION_LINK.labelClass}>
        {text}
      </p>
      <ChevronIcon />
    </button>
  );
}
