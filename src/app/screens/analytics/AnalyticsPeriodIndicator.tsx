interface AnalyticsPeriodIndicatorProps {
  activePeriodKey: string;
  periodKeys: readonly string[];
}

export { buildCenteredPeriodIndicator } from '@/app/components/contracts/analyticsIndicator';
import { resolveAnalyticsIndicator } from '@/app/components/contracts/analyticsIndicator';

export default function AnalyticsPeriodIndicator({
  activePeriodKey,
  periodKeys,
}: AnalyticsPeriodIndicatorProps) {
  const contract = resolveAnalyticsIndicator({ periodKeys, activePeriodKey });
  return (
    <div className="flex justify-center pb-[14px] pt-[7px]" aria-hidden="true">
      <div className="flex items-center gap-[10px]">
        {periodKeys.map((periodKey) =>
          periodKey === activePeriodKey ? (
            <span key={periodKey} className={contract.activeClass} />
          ) : (
            <span key={periodKey} className={contract.inactiveClass} />
          ),
        )}
      </div>
    </div>
  );
}
