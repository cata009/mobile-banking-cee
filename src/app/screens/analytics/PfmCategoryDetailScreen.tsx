import { useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
import { useDragCarousel } from "@/hooks/useDragCarousel";
import PageHeader from "@/app/components/PageHeader";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import HelperCard from "@/app/components/cards/HelperCard";
import PfmCategoryBubbleChart from "@/app/components/pfm/PfmCategoryBubbleChart";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import { useCountry } from "@/app/state/demoStore";
import { getPfmCategory, type PfmCategoryName } from "@/data/pfmCategories";
import {
  createSpendingCategoryDetail,
  type SpendingAnalyticsPeriod,
  type SpendingAnalyticsTimeline,
  type SpendingAnalyticsTransaction,
} from "@/data/spendingAnalytics";
import AnalyticsPeriodIndicator, { buildCenteredPeriodIndicator } from "./AnalyticsPeriodIndicator";
import { getAnalyticsCategoryDisplayLabel } from "./analyticsCategoryLabels";

interface PfmCategoryDetailScreenProps {
  category: PfmCategoryName;
  direction: "out" | "in";
  timeline: SpendingAnalyticsTimeline;
  activePeriodKey: string;
  onPeriodChange: (periodKey: string) => void;
  onBack: () => void;
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void;
}

const PANEL_WIDTH = 375;

function formatPeriodTitle(period: SpendingAnalyticsPeriod) {
  if (period.kind === "year") return period.year;
  const month = period.label.toLocaleLowerCase();
  return `${month.charAt(0).toLocaleUpperCase()}${month.slice(1)} ${period.year}`;
}

export default function PfmCategoryDetailScreen({
  category,
  direction,
  timeline,
  activePeriodKey,
  onPeriodChange,
  onBack,
  onTransactionClick,
}: PfmCategoryDetailScreenProps) {
  const country = useCountry();
  const { t } = useLanguage();
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const [showUncategorizedTip, setShowUncategorizedTip] = useState(true);
  const [excludedSubcategories, setExcludedSubcategories] = useState<ReadonlySet<string>>(() => new Set());
  const categoryDefinition = getPfmCategory(category);
  const categoryLabel = getAnalyticsCategoryDisplayLabel(category, t);
  const activeIndex = Math.max(timeline.periods.findIndex((period) => period.key === activePeriodKey), 0);
  const indicatorKeys = useMemo(
    () => buildCenteredPeriodIndicator(timeline.periods.map((period) => period.key), activeIndex),
    [activeIndex, timeline.periods],
  );

  useEffect(() => {
    carouselRef.current?.scrollTo({ left: activeIndex * PANEL_WIDTH, behavior: "auto" });
  }, [activeIndex]);

  useEffect(() => {
    setExcludedSubcategories(new Set());
  }, [activePeriodKey, category, direction]);

  const handleToggleSubcategory = (subcategoryLabel: string) => {
    setExcludedSubcategories((current) => {
      const next = new Set(current);
      if (next.has(subcategoryLabel)) next.delete(subcategoryLabel);
      else next.add(subcategoryLabel);
      return next;
    });
  };

  const clampPeriodIndex = (index: number) => Math.max(0, Math.min(timeline.periods.length - 1, index));

  const getNearestPeriodIndex = (scrollLeft: number) => {
    if (timeline.periods.length <= 1) return 0;
    return clampPeriodIndex(Math.round(scrollLeft / PANEL_WIDTH));
  };

  const scrollToPeriod = (index: number, behavior: ScrollBehavior = "smooth") => {
    carouselRef.current?.scrollTo({
      left: clampPeriodIndex(index) * PANEL_WIDTH,
      behavior,
    });
  };

  const snapCarouselToNearestPeriod = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const nextIndex = getNearestPeriodIndex(carousel.scrollLeft);
    const nextPeriod = timeline.periods[nextIndex];
    if (!nextPeriod) return;
    scrollToPeriod(nextIndex);
    if (nextPeriod.key !== activePeriodKey) onPeriodChange(nextPeriod.key);
  };

  const clearScrollTimer = () => {
    if (scrollTimerRef.current === null) return;
    window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = null;
  };

  const { isDragging, isPressActiveRef, dragHandlers } = useDragCarousel({
    carouselRef,
    onSettle: snapCarouselToNearestPeriod,
    enabled: timeline.periods.length > 1,
  });

  const handleScroll = (_event: UIEvent<HTMLDivElement>) => {
    if (isPressActiveRef.current) return;
    clearScrollTimer();
    scrollTimerRef.current = window.setTimeout(snapCarouselToNearestPeriod, 120);
  };

  useEffect(() => () => {
    clearScrollTimer();
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <PageHeader
        title={categoryLabel}
        onBack={onBack}
        includeSafeArea
        showHelp={false}
        variant="gray"
        largeTitleColor={`var(${categoryDefinition.colorVar})`}
      />

      <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-hide">
        <div
          ref={carouselRef}
          data-pfm-period-carousel
          className={`flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-hide select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onScroll={handleScroll}
          {...dragHandlers}
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
        >
          {timeline.periods.map((period) => {
            const summary = timeline.summariesByPeriodKey[period.key];
            if (!summary) return null;
            const detail = createSpendingCategoryDetail(
              summary,
              category,
              direction,
              excludedSubcategories,
            );
            const completeDetail = createSpendingCategoryDetail(summary, category, direction);

            return (
              <section
                key={period.key}
                className="w-[375px] shrink-0 snap-start"
                data-category-period={period.key}
                aria-hidden={period.key !== activePeriodKey}
              >
                <div className="px-[24px] pt-[6px]">
                  <p className="uc-type-n4-strong text-[var(--uc-text-muted)]">
                    {t("runtime.analytics.showingDataFor", "Showing data for")}
                  </p>
                  <h2 className="uc-type-h1 mt-[2px] text-[var(--uc-text)]">{formatPeriodTitle(period)}</h2>
                  <p className="uc-type-h2 mt-[2px] text-[var(--uc-text)]" aria-live="polite">
                    {formatMoneyNumber(detail.total, country)} {summary.currency}
                  </p>
                </div>

                <PfmCategoryBubbleChart
                  subcategories={completeDetail.subcategories}
                  colorVar={categoryDefinition.colorVar}
                  country={country}
                  currency={summary.currency}
                  ariaLabel={t("runtime.analytics.subcategoryBreakdown", "Subcategory breakdown")}
                  excludeAriaLabel={t("runtime.analytics.filterOutSubcategory", "Filter out subcategory")}
                  includeAriaLabel={t("runtime.analytics.includeSubcategory", "Include subcategory")}
                  inactiveSubcategories={excludedSubcategories}
                  onToggle={handleToggleSubcategory}
                />
              </section>
            );
          })}
        </div>

        <AnalyticsPeriodIndicator activePeriodKey={activePeriodKey} periodKeys={indicatorKeys} />

        <AccountActionBar
          align="end"
          items={[{
            id: "add-transaction",
            iconName: "add-money",
            label: t("runtime.analytics.addTransaction", "Add Transaction"),
          }]}
          style={{ padding: "0 16px 8px" }}
        />

        {(() => {
          const activeSummary = timeline.summariesByPeriodKey[activePeriodKey];
          if (!activeSummary) return null;
          const detail = createSpendingCategoryDetail(
            activeSummary,
            category,
            direction,
            excludedSubcategories,
          );
          const signedTotal = direction === "out" ? -detail.total : detail.total;
          const activePeriod = timeline.periods.find((period) => period.key === activePeriodKey);

          return (
            <div className="bg-[var(--uc-surface)] pb-[24px]">
              <AccountTransactionMonthDivider
                title={activePeriod?.kind === "year" ? activePeriod.year : (activePeriod?.label ?? activeSummary.periodLabel)}
                total={formatMoneyNumber(signedTotal, country)}
                currency={activeSummary.currency}
              />

              {detail.transactions.length > 0 ? detail.transactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <AccountTransactionRow
                    transaction={transaction}
                    formattedAmount={formatMoneyNumber(Math.abs(transaction.amount), country)}
                    currency={activeSummary.currency}
                    onClick={(selectedTransaction) => onTransactionClick?.(
                      selectedTransaction as SpendingAnalyticsTransaction,
                    )}
                  />
                  {category === "Uncategorized" && index === 0 && showUncategorizedTip ? (
                    <div className="px-[16px] py-[8px]">
                      <HelperCard
                        title={t("runtime.analytics.uncategorizedTransaction", "Uncategorized transaction")}
                        description={t(
                          "runtime.analytics.uncategorizedTransactionDescription",
                          "Choose a category for this transaction and the app will remember it in the future.",
                        )}
                        dismissible
                        closeAriaLabel={t(
                          "runtime.analytics.dismissUncategorizedTip",
                          "Dismiss uncategorized transaction tip",
                        )}
                        onClose={() => setShowUncategorizedTip(false)}
                      />
                    </div>
                  ) : null}
                </div>
              )) : (
                <p className="uc-type-n5 px-[24px] py-[20px] text-[var(--uc-text-muted)]">
                  {t("runtime.analytics.noTransactionsForPeriod", "No transactions for this period")}
                </p>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
