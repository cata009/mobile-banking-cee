interface SectionHeadingDividerProps {
  title: string;
  count?: number;
  className?: string;
}

export default function SectionHeadingDivider({
  title,
  count,
  className,
}: SectionHeadingDividerProps) {
  return (
    <div className={className} data-ds-label="SectionHeadingDivider">
      <div className="flex items-center gap-[8px]">
        <h2 className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">
          {title}
        </h2>
        {typeof count === "number" && (
          <span className="uc-type-n5-strong text-[var(--uc-text-muted)]" aria-label={`${title} count ${count}`}>
            {count}
          </span>
        )}
      </div>
      <div className="mt-[8px] h-px w-full bg-[var(--uc-border)]" />
    </div>
  );
}
