interface AnalyticsPeriodIndicatorProps {
  activePeriodKey: string;
  periodKeys: readonly string[];
}

export function buildCenteredPeriodIndicator(periodKeys: readonly string[], activeIndex: number) {
  if (periodKeys.length <= 5) return [...periodKeys];

  let start = Math.max(0, activeIndex - 2);
  const end = Math.min(periodKeys.length, start + 5);

  if (end - start < 5) start = Math.max(0, end - 5);
  return periodKeys.slice(start, end);
}

export default function AnalyticsPeriodIndicator({
  activePeriodKey,
  periodKeys,
}: AnalyticsPeriodIndicatorProps) {
  return (
    <div className="flex justify-center pb-[14px] pt-[7px]" aria-hidden="true">
      <div className="flex items-center gap-[10px]">
        {periodKeys.map((periodKey) =>
          periodKey === activePeriodKey ? (
            <span key={periodKey} className="h-[6px] w-[30px] rounded-full bg-[var(--uc-action)]" />
          ) : (
            <span key={periodKey} className="size-[6px] rounded-full bg-[var(--uc-text-subtle)]" />
          ),
        )}
      </div>
    </div>
  );
}
