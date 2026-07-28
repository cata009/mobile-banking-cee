import { useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
import { useDragCarousel } from "@/hooks/useDragCarousel";
import BottomNavigation from "@/app/components/BottomNavigation";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import CashFlowSummaryBars from "@/app/components/analytics/CashFlowSummaryBars";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry } from "@/app/state/demoStore";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import {
  createSpendingAnalytics,
  createSpendingAnalyticsTimeline,
  type SpendingAnalyticsPeriod,
  type SpendingAnalyticsSummary,
} from "@/data/spendingAnalytics";
import { useProducts } from "@/hooks/useProducts";
import type { PfmCategoryName, PfmCategorySelection } from "@/data/pfmCategories";
import type { SpendingAnalyticsTransaction } from "@/data/spendingAnalytics";
import AnalyticsPeriodIndicator, { buildCenteredPeriodIndicator } from "./AnalyticsPeriodIndicator";
import PfmCategoryDetailScreen from "./PfmCategoryDetailScreen";
import { getAnalyticsCategoryDisplayLabel } from "./analyticsCategoryLabels";

type NavItem = "home" | "analytics" | "payments" | "products" | "more";
const HERO_PANEL_WIDTH = 375;

interface AnalyticsScreenProps {
  onHomeClick?: () => void;
  onMessagesClick?: () => void;
  onPaymentsClick?: () => void;
  onProductsClick?: () => void;
  onMoreClick?: () => void;
  transactionCategoryOverrides?: Readonly<Record<string, PfmCategorySelection>>;
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void;
}

function splitAmount(value: string) {
  const match = value.match(/^(.+?)([,.])(\d{2})$/);

  if (!match) {
    return { integer: value, separator: "", decimals: "" };
  }

  return {
    integer: match[1],
    separator: match[2],
    decimals: match[3],
  };
}

function AnalyticsHeader({ onMessagesClick }: { onMessagesClick?: () => void }) {
  const { t } = useLanguage();
  const handleAction = (_action: string) => {
  };

  return (
    <header className="w-full bg-[var(--uc-app-bg)]">
      <div className="px-[24px] pb-[20px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1
            className="uc-type-h1 min-w-0 flex-1 text-[var(--uc-text)]"
          >
            {t("runtime.analytics.title", "My Spendings")}
          </h1>
          <HeaderActionRail>
            <HeaderActionButton icon="profile" label={t("runtime.actions.profile", "Profile")} onClick={() => handleAction("profile")} />
            <HeaderActionButton icon="messages" label={t("runtime.actions.messages", "Messages")} onClick={onMessagesClick} />
            <HeaderActionButton icon="help" label={t("runtime.actions.help", "Help")} onClick={() => handleAction("help")} />
          </HeaderActionRail>
        </div>
      </div>
    </header>
  );
}

function MonthSelector({
  activePeriodKey,
  summary,
}: {
  activePeriodKey: string;
  summary: SpendingAnalyticsSummary;
}) {
  const { t } = useLanguage();
  const isYear = activePeriodKey.startsWith("year-");
  const leftLabel = isYear ? t("runtime.analytics.yearTotal", "Year total") : summary.periodLabel;
  const rightLabel = summary.yearLabel;

  return (
    <section className="overflow-hidden px-[24px]">
      <p className="uc-type-n4-strong text-[var(--uc-text-muted)]">
        {t("runtime.analytics.dataFor", "Data For")}
      </p>
      <div className="mt-[4px] flex w-[327px] items-baseline gap-[96px]">
        <h2 className="uc-type-h1 shrink-0 text-[var(--uc-text)]">
          {leftLabel}
        </h2>
        <span className="uc-type-h1 shrink-0 text-[var(--uc-text-muted)]">
          {rightLabel}
        </span>
      </div>
    </section>
  );
}

function AnalyticsHeroPanel({
  activePeriodKey,
  summary,
  country,
}: {
  activePeriodKey: string;
  summary: SpendingAnalyticsSummary;
  country: CountryId;
}) {
  return (
    <>
      <MonthSelector activePeriodKey={activePeriodKey} summary={summary} />
      <CashFlowSummaryBars
        country={country}
        currency={summary.currency}
        incomeTotal={summary.incomeTotal}
        spendingTotal={summary.spendingTotal}
      />
    </>
  );
}

function AnalyticsHeroCarousel({
  periods,
  activePeriodKey,
  country,
  summariesByPeriodKey,
  onPeriodChange,
}: {
  periods: readonly SpendingAnalyticsPeriod[];
  activePeriodKey: string;
  country: CountryId;
  summariesByPeriodKey: Record<string, SpendingAnalyticsSummary>;
  onPeriodChange: (periodKey: string) => void;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollSnapTimeoutRef = useRef<number | null>(null);

  const clampPeriodIndex = (index: number) => Math.max(0, Math.min(periods.length - 1, index));

  const getPeriodScrollLeft = (index: number) => {
    const nextIndex = clampPeriodIndex(index);
    return nextIndex * HERO_PANEL_WIDTH;
  };

  const getNearestPeriodIndex = (scrollLeft: number) => {
    if (periods.length <= 1) return 0;
    return clampPeriodIndex(Math.round(scrollLeft / HERO_PANEL_WIDTH));
  };

  const scrollToPeriod = (index: number, behavior: ScrollBehavior = "smooth") => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollTo({
      left: getPeriodScrollLeft(index),
      behavior,
    });
  };

  const snapCarouselToNearestPeriod = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const nextIndex = getNearestPeriodIndex(carousel.scrollLeft);
    const nextPeriod = periods[nextIndex];
    if (!nextPeriod) return;
    scrollToPeriod(nextIndex);
    onPeriodChange(nextPeriod.key);
  };

  const clearScrollSnapTimeout = () => {
    if (scrollSnapTimeoutRef.current === null) return;
    window.clearTimeout(scrollSnapTimeoutRef.current);
    scrollSnapTimeoutRef.current = null;
  };

  const { isDragging, isPressActiveRef, dragHandlers } = useDragCarousel({
    carouselRef,
    onSettle: snapCarouselToNearestPeriod,
    enabled: periods.length > 1,
  });

  const handleCarouselScroll = (_event: UIEvent<HTMLDivElement>) => {
    if (isPressActiveRef.current) return;
    clearScrollSnapTimeout();
    scrollSnapTimeoutRef.current = window.setTimeout(snapCarouselToNearestPeriod, 120);
  };

  useEffect(() => {
    const activeIndex = periods.findIndex((period) => period.key === activePeriodKey);
    if (activeIndex < 0) return;
    scrollToPeriod(activeIndex, "auto");
  }, [activePeriodKey, periods]);

  useEffect(() => () => {
    clearScrollSnapTimeout();
  }, []);

  return (
    <div
      ref={carouselRef}
      onScroll={handleCarouselScroll}
      {...dragHandlers}
      className={`overflow-x-auto overflow-y-hidden scrollbar-hide select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
      }}
    >
        <div className="flex">
          {periods.map((period) => {
            const summary = summariesByPeriodKey[period.key];
            if (!summary) return null;

            return (
              <div
              key={period.key}
              className="w-[375px] shrink-0"
              {...dragHandlers}
            >
                <AnalyticsHeroPanel
                  activePeriodKey={period.key}
                  summary={summary}
                  country={country}
                />
              </div>
            );
        })}
      </div>
    </div>
  );
}

function CardTransactionAction() {
  const { t } = useLanguage();
  return (
    <AccountActionBar
      align="end"
      items={[
        {
          id: "card-transaction",
          iconName: "add-money",
          iconColor: "var(--uc-icon)",
          label: t("runtime.actions.cardTransaction", "Card Transaction").replace(" ", "\n"),
        },
      ]}
      style={{ padding: "0 24px 18px" }}
    />
  );
}

function CategoryAmount({
  amount,
  country,
  currency,
  direction,
}: {
  amount: number;
  country: CountryId;
  currency: string;
  direction: "out" | "in";
}) {
  const amountParts = splitAmount(formatMoneyNumber(amount, country));
  const sign = direction === "out" ? "-" : "";
  const color = direction === "out" ? "var(--uc-text)" : "var(--uc-text)";

  return (
    <p className="uc-type-n2-strong text-right leading-normal" style={{ color }}>
      <span>
        {sign}
        {amountParts.integer}
      </span>
      <span>{amountParts.separator}</span>
      <span className="uc-type-n5 uppercase">
        {amountParts.decimals} {currency}
      </span>
    </p>
  );
}

function MoneyCategorySection({
  title,
  categories,
  country,
  currency,
  direction,
  onCategoryClick,
}: {
  title: string;
  categories: SpendingAnalyticsSummary["moneyOutCategories"];
  country: CountryId;
  currency: string;
  direction: "out" | "in";
  onCategoryClick: (category: PfmCategoryName, direction: "out" | "in") => void;
}) {
  const { t } = useLanguage();
  const maxCategoryTotal = Math.max(...categories.map((category) => category.total), 1);

  return (
    <section className="pt-[20px]" data-money-section={direction}>
      <h2 className="px-[24px] text-[32px] font-bold leading-normal text-[var(--uc-text)]">
        {title}
      </h2>

      {categories.length > 0 ? (
        <div className="mt-[12px] flex flex-col gap-[14px] px-[16px]">
          {categories.map((category) => {
            const ratio = Math.max(0.24, category.total / maxCategoryTotal);
            const pillWidth = Math.round(104 + ratio * 178);

            return (
              <button
                type="button"
                key={`${direction}-${category.category}`}
                className="relative min-h-[92px] w-full pl-[44px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
                data-pfm-category-row={category.category}
                data-pfm-category-total={category.total}
                aria-label={`${t("runtime.analytics.openCategoryDetails", "Open category details")}: ${getAnalyticsCategoryDisplayLabel(category.category, t)}`}
                onClick={() => onCategoryClick(category.category, direction)}
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                  <PfmCategoryIcon category={category.category} size={32} />
                </div>

                <div className="relative flex min-h-[92px] items-center justify-end">
                  <div
                    className="absolute right-[-18px] top-1/2 -translate-y-1/2 rounded-[28px]"
                    style={{
                      width: `${pillWidth}px`,
                      height: "78px",
                      background: `color-mix(in srgb, var(${category.colorVar}) 16%, var(--uc-surface))`,
                    }}
                  />

                  <div className="relative z-[1] max-w-[255px] py-[8px] text-right">
                    <p className="uc-type-n5-strong uppercase leading-normal tracking-[0.4px] text-[var(--uc-text-muted)]">
                      {getAnalyticsCategoryDisplayLabel(category.category, t)}
                    </p>
                    <CategoryAmount
                      amount={category.total}
                      country={country}
                      currency={currency}
                      direction={direction}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="uc-type-n5 px-[24px] pt-[20px] text-[var(--uc-text-muted)]">
          {t("runtime.analytics.noTransactionsForPeriod", "No transactions for this period")}
        </p>
      )}
    </section>
  );
}

export default function AnalyticsScreen({
  onHomeClick,
  onMessagesClick,
  onPaymentsClick,
  onProductsClick,
  onMoreClick,
  transactionCategoryOverrides = {},
  onTransactionClick,
}: AnalyticsScreenProps) {
  const country = useCountry();
  const { t } = useLanguage();
  const { categories } = useProducts();
  const products = useMemo(() => categories.flatMap((category) => category.products), [categories]);
  const timeline = useMemo(
    () => createSpendingAnalyticsTimeline(country, products, transactionCategoryOverrides),
    [country, products, transactionCategoryOverrides],
  );
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(timeline.activePeriodKey);
  const [selectedCategory, setSelectedCategory] = useState<{
    category: PfmCategoryName;
    direction: "out" | "in";
  } | null>(null);

  useEffect(() => {
    setSelectedPeriodKey(timeline.activePeriodKey);
  }, [timeline.activePeriodKey]);

  const activePeriodIndex = Math.max(timeline.periods.findIndex((period) => period.key === selectedPeriodKey), 0);
  const indicatorKeys = buildCenteredPeriodIndicator(
    timeline.periods.map((period) => period.key),
    activePeriodIndex,
  );
  const firstPeriod = timeline.periods[0];
  const summary =
    timeline.summariesByPeriodKey[selectedPeriodKey] ??
    timeline.summariesByPeriodKey[timeline.activePeriodKey] ??
    (firstPeriod ? timeline.summariesByPeriodKey[firstPeriod.key] : undefined) ??
    createSpendingAnalytics(country, products);

  const handleTabChange = (tab: NavItem) => {
    if (tab === "home") onHomeClick?.();
    if (tab === "payments") onPaymentsClick?.();
    if (tab === "products") onProductsClick?.();
    if (tab === "more") onMoreClick?.();
  };

  if (selectedCategory) {
    return (
      <PfmCategoryDetailScreen
        category={selectedCategory.category}
        direction={selectedCategory.direction}
        timeline={timeline}
        activePeriodKey={selectedPeriodKey}
        onPeriodChange={setSelectedPeriodKey}
        onBack={() => setSelectedCategory(null)}
        onTransactionClick={onTransactionClick}
      />
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-app-bg)]" />
      <AnalyticsHeader onMessagesClick={onMessagesClick} />

      <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-hide pb-[80px]">
        <div>
          <AnalyticsHeroCarousel
            periods={timeline.periods}
            activePeriodKey={selectedPeriodKey}
            country={country}
            summariesByPeriodKey={timeline.summariesByPeriodKey}
            onPeriodChange={setSelectedPeriodKey}
          />
          <AnalyticsPeriodIndicator activePeriodKey={selectedPeriodKey} periodKeys={indicatorKeys} />
        </div>

        <CardTransactionAction />

        <div className="bg-[var(--uc-app-bg)]">
          <MoneyCategorySection
            title={t("runtime.analytics.moneyOut", "Money out")}
            categories={summary.moneyOutCategories}
            country={country}
            currency={summary.currency}
            direction="out"
            onCategoryClick={(category, direction) => setSelectedCategory({ category, direction })}
          />
          <MoneyCategorySection
            title={t("runtime.analytics.moneyIn", "Money in")}
            categories={summary.moneyInCategories}
            country={country}
            currency={summary.currency}
            direction="in"
            onCategoryClick={(category, direction) => setSelectedCategory({ category, direction })}
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
        <BottomNavigation activeTab="analytics" onTabChange={handleTabChange} />
      </div>
    </div>
  );
}
