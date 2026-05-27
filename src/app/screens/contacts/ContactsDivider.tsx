import { AppIcon } from "@/app/components/icons";

/**
 * ContactsDivider Component
 * Section divider with title and bottom line
 */

interface ContactsDividerProps {
  text: string;
}

export function ContactsDivider({ text }: ContactsDividerProps) {
  return (
    <div className="relative w-full h-[32px] flex items-center">
      {/* Text */}
      <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)] leading-normal">
        {text}
      </p>
      
      {/* Bottom Line */}
      <div className="absolute left-0 top-[31px] w-full h-px">
        <AppIcon name="divider-375" className="block size-full" color="var(--uc-text-subtle)" preserveAspectRatio="none" />
      </div>
    </div>
  );
}
