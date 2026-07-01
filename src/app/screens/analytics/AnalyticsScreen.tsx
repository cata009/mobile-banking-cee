import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, MouseEvent, PointerEvent, UIEvent } from "react";
import BottomNavigation from "@/app/components/BottomNavigation";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import { AppIcon } from "@/app/components/icons";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useDemo } from "@/app/state/demoStore";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import {
  createSpendingAnalyticsTimeline,
  type SpendingAnalyticsPeriod,
  type SpendingAnalyticsSummary,
} from "@/data/spendingAnalytics";
import { useProducts } from "@/hooks/useProducts";

type NavItem = "home" | "analytics" | "payments" | "products" | "more";
const HERO_PANEL_WIDTH = 375;

type HeroCarouselDragState = {
  didMove: boolean;
  input: "mouse" | "pointer" | null;
  pointerId: number | null;
  startScrollLeft: number;
  startX: number;
};

interface AnalyticsScreenProps {
  onHomeClick?: () => void;
  onMessagesClick?: () => void;
  onPaymentsClick?: () => void;
  onProductsClick?: () => void;
  onMoreClick?: () => void;
}

function getCategoryDisplayLabel(category: string, t: (key: string, fallback?: string) => string) {
  const labels: Record<string, string> = {
    Finance: "FINANCIAL",
    Shopping: "SHOPPING",
    Healthcare: "HEALTH & BEAUTY",
    Uncategorized: "UNCATEGORIZED EXPENSES",
    Home: "HOUSEHOLD",
    Groceries: "GROCERIES",
    Transportation: "CARS & TRANSPORTATION",
    "Leisure time": "LEISURE",
    "Taxes and Penalties": "TAXES & FINES",
    Income: "INCOME",
    Utilities: "UTILITIES",
    Insurance: "INSURANCE",
    Education: "SCHOOL & EDUCATION",
    Children: "CHILDREN",
    Wallet: "WALLET",
    Transfers: "TRANSFERS",
    Investments: "INVESTMENTS",
    ATM: "ATM",
    FX: "EXCHANGE",
    "Exclude from budget": "EXCLUDED",
  };

  return t(`runtime.analytics.categories.${category}`, labels[category] ?? category.toUpperCase());
}

function buildCenteredIndicator(periods: SpendingAnalyticsPeriod[], activeIndex: number) {
  if (periods.length <= 5) {
    return periods.map((period) => period.key);
  }

  let start = Math.max(0, activeIndex - 2);
  let end = Math.min(periods.length, start + 5);

  if (end - start < 5) {
    start = Math.max(0, end - 5);
  }

  return periods.slice(start, end).map((period) => period.key);
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
  const handleAction = (action: string) => {
    console.log(`Analytics ${action} clicked`);
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
      <AnalyticsSummaryBars country={country} summary={summary} />
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
  const dragStateRef = useRef<HeroCarouselDragState>({
    didMove: false,
    input: null,
    pointerId: null,
    startScrollLeft: 0,
    startX: 0,
  });
  const mouseDragCleanupRef = useRef<(() => void) | null>(null);
  const scrollSnapTimeoutRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

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
    scrollToPeriod(nextIndex);
    onPeriodChange(periods[nextIndex].key);
  };

  const removeMouseDragListeners = () => {
    mouseDragCleanupRef.current?.();
    mouseDragCleanupRef.current = null;
  };

  const clearScrollSnapTimeout = () => {
    if (scrollSnapTimeoutRef.current === null) return;
    window.clearTimeout(scrollSnapTimeoutRef.current);
    scrollSnapTimeoutRef.current = null;
  };

  const resetCarouselDrag = () => {
    removeMouseDragListeners();
    dragStateRef.current = {
      didMove: false,
      input: null,
      pointerId: null,
      startScrollLeft: 0,
      startX: 0,
    };
    setIsDragging(false);
  };

  const beginCarouselDrag = (
    clientX: number,
    input: HeroCarouselDragState["input"],
    pointerId: number | null = null,
  ) => {
    const carousel = carouselRef.current;
    if (!carousel || periods.length <= 1 || dragStateRef.current.input) return false;

    dragStateRef.current = {
      didMove: false,
      input,
      pointerId,
      startScrollLeft: carousel.scrollLeft,
      startX: clientX,
    };

    return true;
  };

  const moveCarouselDrag = (clientX: number) => {
    const carousel = carouselRef.current;
    const dragState = dragStateRef.current;
    if (!carousel || !dragState.input) return false;

    const deltaX = clientX - dragState.startX;
    if (!dragState.didMove && Math.abs(deltaX) < 4) return false;

    dragState.didMove = true;
    suppressClickRef.current = true;
    setIsDragging(true);
    carousel.scrollLeft = dragState.startScrollLeft - deltaX;
    return true;
  };

  const finishCarouselDrag = () => {
    const didMove = dragStateRef.current.didMove;

    if (didMove) {
      snapCarouselToNearestPeriod();
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 80);
    }

    resetCarouselDrag();
  };

  const handleCarouselScroll = (_event: UIEvent<HTMLDivElement>) => {
    if (dragStateRef.current.input) return;
    clearScrollSnapTimeout();
    scrollSnapTimeoutRef.current = window.setTimeout(snapCarouselToNearestPeriod, 120);
  };

  const handleCarouselPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    if (beginCarouselDrag(event.clientX, "pointer", event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handleCarouselPointerMove = (event: PointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current;
    if (dragState.input !== "pointer" || dragState.pointerId !== event.pointerId) return;

    if (moveCarouselDrag(event.clientX)) {
      event.preventDefault();
    }
  };

  const handleCarouselPointerUp = (event: PointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current;
    if (dragState.input !== "pointer" || dragState.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    finishCarouselDrag();
  };

  const handleCarouselPointerCancel = (event: PointerEvent<HTMLElement>) => {
    if (dragStateRef.current.input !== "pointer" || dragStateRef.current.pointerId !== event.pointerId) return;
    resetCarouselDrag();
    suppressClickRef.current = false;
  };

  const handleCarouselMouseDown = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0 || !beginCarouselDrag(event.clientX, "mouse")) return;

    const handleMouseMove = (mouseEvent: globalThis.MouseEvent) => {
      if (dragStateRef.current.input !== "mouse") return;

      if (mouseEvent.buttons !== 1) {
        finishCarouselDrag();
        return;
      }

      if (moveCarouselDrag(mouseEvent.clientX)) {
        mouseEvent.preventDefault();
      }
    };

    const handleMouseUp = () => {
      if (dragStateRef.current.input === "mouse") {
        finishCarouselDrag();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    mouseDragCleanupRef.current = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  };

  const handleCarouselClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleCarouselDragStart = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    const activeIndex = periods.findIndex((period) => period.key === activePeriodKey);
    if (activeIndex < 0) return;
    scrollToPeriod(activeIndex, "auto");
  }, [activePeriodKey, periods]);

  useEffect(() => () => {
    removeMouseDragListeners();
    clearScrollSnapTimeout();
  }, []);

  return (
    <div
      ref={carouselRef}
      onScroll={handleCarouselScroll}
      onPointerDown={handleCarouselPointerDown}
      onPointerMove={handleCarouselPointerMove}
      onPointerUp={handleCarouselPointerUp}
      onPointerCancel={handleCarouselPointerCancel}
      onMouseDown={handleCarouselMouseDown}
      onClickCapture={handleCarouselClickCapture}
      className={`overflow-x-auto overflow-y-hidden scrollbar-hide select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
      }}
    >
        <div className="flex">
          {periods.map((period, index) => {
            const summary = summariesByPeriodKey[period.key];

            return (
              <div
              key={period.key}
              className="w-[375px] shrink-0"
              onClickCapture={handleCarouselClickCapture}
              onDragStart={handleCarouselDragStart}
              onMouseDown={handleCarouselMouseDown}
              onPointerCancel={handleCarouselPointerCancel}
              onPointerDown={handleCarouselPointerDown}
              onPointerMove={handleCarouselPointerMove}
              onPointerUp={handleCarouselPointerUp}
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

function AnalyticsPeriodIndicator({
  activePeriodKey,
  periodKeys,
}: {
  activePeriodKey: string;
  periodKeys: string[];
}) {
  return (
    <div className="flex justify-center pb-[14px] pt-[7px]">
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

function AnalyticsSummaryBars({
  country,
  summary,
}: {
  country: CountryId;
  summary: SpendingAnalyticsSummary;
}) {
  const { t } = useLanguage();
  const maxTotal = Math.max(summary.incomeTotal, summary.spendingTotal, 1);
  const incomeHeight = Math.max(18, Math.round((summary.incomeTotal / maxTotal) * 104));
  const spendingHeight = Math.max(18, Math.round((summary.spendingTotal / maxTotal) * 104));
  const baselineTop = 120;

  return (
    <section className="relative h-[172px] px-[24px] pt-[18px]">
      <div className="absolute left-[24px] right-[24px] top-[120px] border-t border-dashed border-[var(--uc-border)]" />

      <div className="absolute left-[52px] top-[58px] w-[92px] font-['UniCredit',sans-serif]">
        <p className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">{t("runtime.analytics.inflow", "Inflow")}</p>
        <p className="uc-type-n5-strong mt-[6px] text-[var(--uc-text)]">
          {formatMoneyNumber(summary.incomeTotal, country)}
        </p>
        <p className="uc-type-n5-strong text-[var(--uc-text)]">{summary.currency}</p>
      </div>

      <div
        className="absolute left-[154px] w-[16px] rounded-t-full bg-[var(--uc-action)]"
        style={{ height: `${incomeHeight}px`, top: `${baselineTop - incomeHeight}px` }}
      />

      <div
        className="absolute left-[184px] w-[16px] rounded-t-full bg-[var(--uc-text)]"
        style={{ height: `${spendingHeight}px`, top: `${baselineTop - spendingHeight}px` }}
      />

      <div className="absolute left-[214px] top-[74px] w-[132px] font-['UniCredit',sans-serif]">
        <p className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">{t("runtime.analytics.outflow", "Outflow")}</p>
        <p className="uc-type-n5-strong mt-[4px] text-[var(--uc-text)]">
          {formatMoneyNumber(summary.spendingTotal, country)} {summary.currency}
        </p>
      </div>

      <div className="uc-type-n5-strong absolute left-[104px] top-[136px] w-[68px] text-right uppercase text-[var(--uc-text)]">
        {t("runtime.analytics.incomes", "Incomes")}
      </div>
      <div className="uc-type-n5-strong absolute left-[182px] top-[136px] text-left uppercase text-[var(--uc-text)]">
        {t("runtime.analytics.spendings", "Spendings")}
      </div>
    </section>
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
}: {
  title: string;
  categories: SpendingAnalyticsSummary["moneyOutCategories"];
  country: CountryId;
  currency: string;
  direction: "out" | "in";
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
              <div
                key={`${direction}-${category.category}`}
                className="relative min-h-[92px] pl-[44px]"
                data-pfm-category-row={category.category}
                data-pfm-category-total={category.total}
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
                      {getCategoryDisplayLabel(category.category, t)}
                    </p>
                    <CategoryAmount
                      amount={category.total}
                      country={country}
                      currency={currency}
                      direction={direction}
                    />
                  </div>
                </div>
              </div>
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
}: AnalyticsScreenProps) {
  const { country } = useDemo();
  const { t } = useLanguage();
  const { categories } = useProducts();
  const products = useMemo(() => categories.flatMap((category) => category.products), [categories]);
  const timeline = useMemo(() => createSpendingAnalyticsTimeline(country, products), [country, products]);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(timeline.activePeriodKey);

  useEffect(() => {
    setSelectedPeriodKey(timeline.activePeriodKey);
  }, [timeline.activePeriodKey]);

  const activePeriodIndex = Math.max(timeline.periods.findIndex((period) => period.key === selectedPeriodKey), 0);
  const indicatorKeys = buildCenteredIndicator(timeline.periods as SpendingAnalyticsPeriod[], activePeriodIndex);
  const summary =
    timeline.summariesByPeriodKey[selectedPeriodKey] ??
    timeline.summariesByPeriodKey[timeline.activePeriodKey];

  const handleTabChange = (tab: NavItem) => {
    if (tab === "home") onHomeClick?.();
    if (tab === "payments") onPaymentsClick?.();
    if (tab === "products") onProductsClick?.();
    if (tab === "more") onMoreClick?.();
  };

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
          />
          <MoneyCategorySection
            title={t("runtime.analytics.moneyIn", "Money in")}
            categories={summary.moneyInCategories}
            country={country}
            currency={summary.currency}
            direction="in"
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
        <BottomNavigation activeTab="analytics" onTabChange={handleTabChange} />
      </div>
    </div>
  );
}
