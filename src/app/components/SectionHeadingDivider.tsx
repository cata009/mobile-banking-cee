interface SectionHeadingDividerProps {
  title: string;
  className?: string;
}

export default function SectionHeadingDivider({
  title,
  className,
}: SectionHeadingDividerProps) {
  return (
    <div className={className} data-ds-label="SectionHeadingDivider">
      <h2 className="font-['UniCredit',sans-serif] text-[14px] font-bold uppercase leading-[normal] text-[var(--uc-text-muted)]">
        {title}
      </h2>
      <div className="mt-[8px] h-px w-full bg-[var(--uc-border)]" />
    </div>
  );
}
