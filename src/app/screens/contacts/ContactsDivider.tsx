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
      <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-[#262626] leading-normal">
        {text}
      </p>
      
      {/* Bottom Line */}
      <div className="absolute left-0 top-[31px] w-full h-px">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
          <path d="M0 0.5H375" stroke="#999999" strokeWidth="0.25" strokeLinecap="square" />
        </svg>
      </div>
    </div>
  );
}
