interface SectionHeadingDividerProps {
  title: string;
  count?: number;
  countAlign?: "inline" | "end";
  className?: string;
}

export default function SectionHeadingDivider({
  title,
  count,
  countAlign = "inline",
  className,
}: SectionHeadingDividerProps) {
  const alignCountToEnd = countAlign === "end";

  return (
    <div className={className} data-ds-label="SectionHeadingDivider">
      {alignCountToEnd && typeof count === "number" ? (
        <>
          <div className="flex items-center justify-between gap-[8px]">
            <h2 className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">
              {title}
            </h2>
            <span className="uc-type-n5-strong text-[var(--uc-text-muted)]" aria-label={`${title} count ${count}`}>
              {count}
            </span>
          </div>
          <div className="mt-[8px] h-px w-full bg-[var(--uc-border)]" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-[8px]">
            <h2 className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">
              {title}
            </h2>
            {typeof count === "number" ? (
              <span className="uc-type-n5-strong text-[var(--uc-text-muted)]" aria-label={`${title} count ${count}`}>
                {count}
              </span>
            ) : null}
          </div>
          <div className="mt-[8px] h-px w-full bg-[var(--uc-border)]" />
        </>
      )}
    </div>
  );
}
