interface PreLoginHeadingProps {
  h1: string;
  h2: string;
  h3: string;
}

export default function PreLoginHeading({ h1, h2, h3 }: PreLoginHeadingProps) {
  return (
    <div className="flex flex-col gap-[16px] w-full">
      {/* Title group - H1 + H2 */}
      <div className="flex flex-col gap-[32px]">
        {/* H1 - Welcome */}
        <h1 className="text-[var(--uc-static-white)] font-['UniCredit'] text-[38px] font-bold leading-[40px] tracking-[0.335px]">
          {h1}
        </h1>
        
        {/* H2 - Accounts */}
        <h2 className="text-[var(--uc-static-white)] font-['UniCredit'] text-[24px] font-bold leading-[normal] tracking-[0.267px]">
          {h2}
        </h2>
      </div>
      
      {/* H3 - Description */}
      <h3 className="text-[var(--uc-static-white)] font-['UniCredit'] text-[18px] font-normal leading-[normal]">
        {h3}
      </h3>
    </div>
  );
}