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
      <div className="absolute left-0 top-[31px] h-px w-full bg-[var(--uc-text-subtle)] opacity-60" />
    </div>
  );
}
