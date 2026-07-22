import { useState, type ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";
import NavigationRow from "@/app/components/NavigationRow";
import { cn } from "@/app/components/ui/utils";
import { ProductEvaluationBullet } from "./InvestmentBuyOrderFlow";

/** Shared 5-tone palette, reused from the portfolio distribution donut for visual consistency. */
const CHART_COLORS = ["#00A3E0", "#5BC199", "#074861", "#885BC1", "#535453"] as const;
const POSITIVE_SCENARIO_COLOR = "#D6579C";

type ScenarioEmphasis = "value" | "percent";

interface CostSummaryRowProps {
  label: string;
  percent: string;
  amount: string;
  emphasize?: ScenarioEmphasis;
}

/** "ON-GOING / ENTRY / TOTAL"-style row: label on the left, percent + amount stacked on the right.
 *  No horizontal padding here — the parent wrapper supplies the 24px inset so
 *  the separator line and the row content stay aligned to the same edge. */
function CostSummaryRow({ label, percent, amount, emphasize = "value" }: CostSummaryRowProps) {
  return (
    <div className="flex items-start justify-between py-[10px]">
      <p className="uc-type-n4-strong uppercase text-[var(--uc-text)]">{label}</p>
      <div className="text-right">
        {emphasize === "value" ? (
          <>
            <p className="uc-type-n5-strong text-[var(--uc-green-olive)]">{percent}</p>
            <p className="uc-type-n4-strong mt-[2px] text-[var(--uc-text)]">{amount}</p>
          </>
        ) : (
          <>
            <p className="uc-type-n4-strong text-[var(--uc-green-olive)]">{percent}</p>
            <p className="uc-type-n5 mt-[2px] text-[var(--uc-text-muted)]">{amount}</p>
          </>
        )}
      </div>
    </div>
  );
}

interface CostSubFeeRowProps {
  label: string;
  amount: string;
  percentLabel: string;
  percent: string;
}

/** Indented "TRANSACTION FEE / (P)"-style sub-row under a CostSummaryRow.
 *  16px left indent relative to the parent's 24px inset = 40px visual indent.
 *  Labels stay muted+bold; the values (amount + percent) are black+bold so
 *  the numbers stand out from their descriptive labels. */
function CostSubFeeRow({ label, amount, percentLabel, percent }: CostSubFeeRowProps) {
  return (
    <div className="pl-[16px]">
      <div className="flex items-center justify-between py-[3px]">
        <p className="uc-type-n5-strong text-[var(--uc-text-muted)]">{label}</p>
        <p className="uc-type-n5-strong text-[var(--uc-text)]">{amount}</p>
      </div>
      <div className="flex items-center justify-between py-[3px]">
        <p className="uc-type-n5-strong text-[var(--uc-text-muted)]">{percentLabel}</p>
        <p className="uc-type-n5-strong text-[var(--uc-text)]">{percent}</p>
      </div>
    </div>
  );
}

/** Shared ON-GOING / ENTRY / TOTAL cost breakdown, reused by both the Ex-Ante and Disclaimer sections. */
function CostBreakdownBlock({ currency, emphasize }: { currency: string; emphasize?: ScenarioEmphasis }) {
  return (
    <div className="flex flex-col">
      <div className="px-[24px]">
        <CostSummaryRow label="ON-GOING" percent="9,30%" amount={`1 000,00 ${currency}`} emphasize={emphasize} />
        <CostSubFeeRow label="TRANSACTION FEE" amount={`500,00 ${currency}`} percentLabel="(P)" percent="4,15%" />
        <CostSubFeeRow label="BANK FEE" amount={`500,00 ${currency}`} percentLabel="(P)" percent="4,15%" />
      </div>

      <div className="px-[24px]">
        <CostSummaryRow label="ENTRY" percent="9,30%" amount={`1 000,00 ${currency}`} emphasize={emphasize} />
        <CostSubFeeRow label="TRANSACTION FEE" amount={`500,00 ${currency}`} percentLabel="(P)" percent="4,15%" />
      </div>

      <div className="px-[24px]">
        <CostSummaryRow label="TOTAL" percent="9,30%" amount={`1 000,00 ${currency}`} emphasize={emphasize} />
      </div>
    </div>
  );
}

interface DocumentsAccordionSectionProps {
  iconName: Parameters<typeof AppIcon>[0]["name"];
  /** Square icon size — used for default square glyphs. */
  iconSize?: number;
  /** Non-square icon dimensions — used for glyphs like ex-ante (15×20) so they
   *  keep their native aspect ratio instead of being squashed to a square. */
  iconWidth?: number;
  iconHeight?: number;
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/**
 * One collapsible row: icon + title + subtitle + chevron header (styled after
 * NewPaymentActionListItem), expanding to reveal arbitrary content below.
 * The header text and chevron switch to the action/teal tone while open.
 */
function DocumentsAccordionSection({
  iconName,
  iconSize,
  iconWidth,
  iconHeight,
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}: DocumentsAccordionSectionProps) {
  return (
    <div data-ds-label="Investment documents accordion section">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="grid h-[80px] w-full grid-cols-[32px_1fr_32px] items-center gap-[16px] px-[24px] text-left"
      >
        <span className="flex size-[32px] shrink-0 items-center justify-center">
          <AppIcon
            name={iconName}
            size={iconSize}
            width={iconWidth}
            height={iconHeight}
            color={isOpen ? "var(--uc-action)" : "var(--uc-text)"}
          />
        </span>
        <span className="min-w-0">
          <span
            className={cn("uc-type-n4-strong block", isOpen ? "text-[var(--uc-action)]" : "text-[var(--uc-text)]")}
            style={{ fontFeatureSettings: "'liga' off, 'clig' off", letterSpacing: "0.3px" }}
          >
            {title}
          </span>
          <span
            className={cn(
              "uc-type-n5 mt-[2px] block",
              isOpen ? "text-[var(--uc-action)]" : "text-[var(--uc-text-muted)]",
            )}
          >
            {subtitle}
          </span>
        </span>
        <span
          className="grid size-[24px] shrink-0 place-items-center transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <AppIcon name="chevron-down" size={16} color={isOpen ? "var(--uc-action)" : "var(--uc-icon)"} />
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: isOpen ? 2400 : 0, opacity: isOpen ? 1 : 0 }}
        aria-hidden={!isOpen}
      >
        <div className="pb-[24px]">{children}</div>
      </div>
      {/* Row separator matches the "DOCUMENTS AND TERMS" section heading
          separator: inset 24px on both sides, not edge-to-edge. Rendered
          after the expanded content so it sits at the bottom of the row when
          open, not between the header and the expanded body. */}
      <div className="mx-[24px] h-px w-auto bg-[var(--uc-border)]" />
    </div>
  );
}

interface ProductDocumentEntry {
  id: string;
  title: string;
  description: string;
}

const PRODUCT_DOCUMENTS: readonly ProductDocumentEntry[] = [
  {
    id: "kid",
    title: "Key Information Document (KID)",
    description: "Standardised risks, costs and performance profile",
  },
  {
    id: "prospectus",
    title: "Prospectus",
    description: "Official fund objectives, terms and conditions",
  },
  {
    id: "advisory-report",
    title: "Investment Advisory Report",
    description: "Personalised recommendation and rationale",
  },
];

function ProductDocumentsContent() {
  return (
    <div className="flex flex-col">
      {PRODUCT_DOCUMENTS.map((document) => (
        <NavigationRow
          key={document.id}
          title={document.title}
          description={document.description}
          trailingAccessory="chevron"
          rowHeight={80}
        />
      ))}
    </div>
  );
}

interface SuitabilityCharacteristic {
  label: string;
  limitUtilisation: string;
}

const SUITABILITY_CHARACTERISTICS: readonly SuitabilityCharacteristic[] = [
  { label: "Alternatives", limitUtilisation: "14,47%" },
  { label: "Total portfolio risk", limitUtilisation: "58,87%" },
  { label: "Concentration risk", limitUtilisation: "0,47%" },
];

function SuitabilityTable() {
  return (
    <div className="mt-[16px] px-[24px]">
      <div className="grid grid-cols-[1fr_64px_104px] gap-[8px] border-b border-[var(--uc-border)] pb-[8px]">
        <p className="uc-type-n5-strong text-[var(--uc-text)]">Characteristics</p>
        <p className="uc-type-n5-strong text-[var(--uc-text)]">Result</p>
        <p className="uc-type-n5-strong text-right text-[var(--uc-text)]">Limit utilisation</p>
      </div>
      {SUITABILITY_CHARACTERISTICS.map((row, index) => (
        <div
          key={row.label}
          className={cn(
            "grid grid-cols-[1fr_64px_104px] items-center gap-[8px] py-[12px]",
            index < SUITABILITY_CHARACTERISTICS.length - 1 ? "border-b border-[var(--uc-border)]" : null,
          )}
        >
          <p className="uc-type-n4 text-[var(--uc-text)]">{row.label}</p>
          <AppIcon name="check" color="var(--uc-green-olive)" />
          <p className="uc-type-n4-strong text-right text-[var(--uc-text)]">{row.limitUtilisation}</p>
        </div>
      ))}
    </div>
  );
}

function EvaluationStatement({
  title,
  statement,
  description,
  showTable = false,
}: {
  title: string;
  statement: string;
  description: string;
  showTable?: boolean;
}) {
  return (
    <section className="px-[24px] pt-[20px] first:pt-0">
      <h3 className="uc-type-h2 text-[var(--uc-text)]">{title}</h3>
      <div className="mt-[12px] flex items-center gap-[10px]">
        <ProductEvaluationBullet />
        <p className="uc-type-n4-strong text-[var(--uc-text)]">{statement}</p>
      </div>
      <p className="uc-type-n4 mt-[8px] text-[var(--uc-text)]">{description}</p>
      {showTable ? <SuitabilityTable /> : null}
    </section>
  );
}

function ImportantInformationContent() {
  return (
    <div className="flex flex-col gap-[24px]">
      <EvaluationStatement
        title="Suitability"
        statement="Product is suitable"
        description="The Bank hereby informs the client, that the financial instrument that is subject matter of the order is suitable for him."
        showTable
      />
      <EvaluationStatement
        title="Appropriateness Evaluation"
        statement="Product is appropriate"
        description="The bank hereby informs the client, that the financial instrument concerned resp, the providing of such investment service is appropriate for him"
      />
      <EvaluationStatement
        title="Target Market"
        statement="Product is in the client's Target Market"
        description="The Bank has determined a target market for the financial instrument that is subject matter of the order, and, has determined the financial instrument compatibility with the needs, characteristics and goals of its clients. Following to an assessment of information provided by you the Bank hereby informs that the financial instrument that is the subject matter of the order has been assessed as compatible with your needs, characteristics and goals and, as such, it matches your needs, characteristics and goals."
      />
    </div>
  );
}

function ScenarioViewToggle({
  value,
  onChange,
}: {
  value: ScenarioEmphasis;
  onChange: (value: ScenarioEmphasis) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-[24px]" role="tablist" aria-label="Performance scenario view">
      {(["percent", "value"] as const).map((id) => {
        const active = id === value;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className="relative pb-[8px]"
          >
            <span
              className={cn(
                "uc-type-n4-strong uppercase",
                active ? "text-[var(--uc-text)]" : "text-[var(--uc-text-muted)]",
              )}
            >
              {id}
            </span>
            {active ? (
              <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[var(--uc-text)]" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

const CHART_GRID_LABELS_PERCENT = ["113%", "56,50%", "0", "-56,50%"] as const;
/** Base amount used to derive currency axis values from the percentage grid. */
const CHART_VALUE_BASE = 10000;

/** Compact K-suffixed currency formatting for the chart axis:
 *  11300 -> "11.3K", 110000 -> "110K", 5650 -> "5.7K", 0 -> "0". Keeps axis
 *  labels short so they don't crowd the plot area. */
function formatAxisValueK(amount: number): string {
  if (amount === 0) return "0";
  const thousands = amount / 1000;
  // Trim trailing .0 so round thousands render as "110K" not "110.0K".
  const suffix = Number.isInteger(thousands) ? thousands.toString() : thousands.toFixed(1);
  return `${suffix}K`;
}

const CHART_GRID_LABELS_VALUE = (currency: string): readonly string[] => [
  `${formatAxisValueK(CHART_VALUE_BASE * 1.13)} ${currency}`,
  `${formatAxisValueK(CHART_VALUE_BASE * 0.565)} ${currency}`,
  `0 ${currency}`,
  `-${formatAxisValueK(CHART_VALUE_BASE * 0.565)} ${currency}`,
];
const CHART_ROW_GAP = 56;
const CHART_PLOT_HEIGHT = CHART_ROW_GAP * (CHART_GRID_LABELS_PERCENT.length - 1);
const CHART_BASELINE_TOP = CHART_ROW_GAP * 2; // the "0" gridline is the 3rd label

interface ScenarioBar {
  id: string;
  label: string;
  /** Bar height as a fraction of CHART_BASELINE_TOP (the positive axis range). */
  heightFraction: number;
  segments: readonly number[];
  segmentColor: (index: number) => string;
  segmentOpacity: number;
}

const SCENARIO_BARS: readonly ScenarioBar[] = [
  {
    id: "negative",
    label: "NEGATIVE",
    heightFraction: 1,
    segments: [0.3, 0.25, 0.2, 0.15, 0.1],
    segmentColor: (index) => CHART_COLORS[index % CHART_COLORS.length] ?? CHART_COLORS[0],
    segmentOpacity: 1,
  },
  {
    id: "neutral",
    label: "NEUTRAL",
    heightFraction: 0.5,
    segments: [0.4, 0.35, 0.25],
    segmentColor: (index) => CHART_COLORS[index % CHART_COLORS.length] ?? CHART_COLORS[0],
    segmentOpacity: 0.4,
  },
  {
    id: "positive",
    label: "POSITIVE",
    heightFraction: 0.35,
    segments: [1],
    segmentColor: () => POSITIVE_SCENARIO_COLOR,
    segmentOpacity: 1,
  },
];

const SCENARIO_CHART_LEGEND = [
  { label: "Stress scenario", color: CHART_COLORS[0] },
  { label: "Unfavourable", color: CHART_COLORS[1] },
  { label: "Moderate", color: CHART_COLORS[2] },
  { label: "Favourable", color: CHART_COLORS[3] },
  { label: "Optimistic", color: CHART_COLORS[4] },
] as const;

/**
 * Illustrative PRIIPs-style performance-scenario chart: three stacked bars
 * (negative / neutral / positive) growing upward from the "0" gridline
 * against a 113% .. -56,50% grid. When `view` is "value" the left axis shows
 * currency amounts derived from CHART_VALUE_BASE; when "percent" it shows the
 * raw percentages. Segment weights are representative example proportions,
 * not computed figures.
 */
function PerformanceScenarioChart({
  view,
  currency,
  periodIndex,
  onPeriodChange,
}: {
  view: ScenarioEmphasis;
  currency: string;
  periodIndex: number;
  onPeriodChange: (index: number) => void;
}) {
  const gridLabels =
    view === "percent" ? CHART_GRID_LABELS_PERCENT : CHART_GRID_LABELS_VALUE(currency);
  // Percent labels are short ("113%"); value labels are K-suffixed ("11.3K USD").
  // Both fit comfortably in 72px, keeping the plot area wide.
  const axisLabelWidth = 72;
  const barsInset = axisLabelWidth + 8;
  const barWidth = 56;

  return (
    <div className="mt-[20px] px-[24px]">
      <div className="relative" style={{ height: CHART_PLOT_HEIGHT }}>
        {gridLabels.map((label, index) => (
          <div
            key={index}
            className="absolute inset-x-0 flex items-center gap-[8px]"
            style={{ top: index * CHART_ROW_GAP }}
          >
            <span
              className="shrink-0 uc-type-n5 text-[var(--uc-text-muted)]"
              style={{ width: `${axisLabelWidth}px` }}
            >
              {label}
            </span>
            <span className="h-px flex-1 bg-[var(--uc-border-muted)]" aria-hidden="true" />
          </div>
        ))}

        {/* Bars grow upward from the "0" gridline. The container spans the
            positive axis range (top 0 .. CHART_BASELINE_TOP) and uses
            items-end so each bar's base sits exactly on the "0" gridline
            (top: CHART_BASELINE_TOP), with no gap. */}
        <div
          className="absolute flex items-end justify-between"
          style={{ left: barsInset, right: 8, top: 0, height: CHART_BASELINE_TOP }}
        >
          {SCENARIO_BARS.map((bar) => {
            const barHeight = Math.round(bar.heightFraction * CHART_BASELINE_TOP);
            return (
              <div key={bar.id} className="flex flex-col items-center">
                <div
                  className="flex flex-col overflow-hidden rounded-t-[2px]"
                  style={{ height: barHeight, width: barWidth }}
                >
                  {bar.segments.map((fraction, segmentIndex) => (
                    <div
                      key={segmentIndex}
                      aria-hidden="true"
                      style={{
                        height: `${fraction * 100}%`,
                        backgroundColor: bar.segmentColor(segmentIndex),
                        opacity: bar.segmentOpacity,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenario labels, placed under the whole plot (below the last gridline),
          aligned to the same edges as the bars above. All labels use the same
          text color so the three scenarios read as a neutral legend, not as
          color-coded categories. */}
      <div
        className="mt-[20px] flex justify-between"
        style={{ marginLeft: barsInset, marginRight: 8 }}
      >
        {SCENARIO_BARS.map((bar) => (
          <span
            key={bar.id}
            className="uc-type-n5-strong text-center text-[var(--uc-text)]"
            style={{ width: barWidth }}
          >
            {bar.label}
          </span>
        ))}
      </div>

      {/* Period selector sits above the legend so the user picks the horizon
          before reading the scenario legend below. */}
      <ScenarioPeriodChips selectedIndex={periodIndex} onSelect={onPeriodChange} />

      <div className="mt-[32px] grid grid-cols-2 gap-x-[16px] gap-y-[10px]">
        {SCENARIO_CHART_LEGEND.map((item, index) => (
          <div key={index} className="flex items-center gap-[8px]">
            <span
              className="size-[8px] shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <p className="uc-type-n5 text-[var(--uc-text)]">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const SCENARIO_PERIODS = ["0Y", "1Y", "3Y", "5Y", "7Y", "10Y"] as const;

function ScenarioPeriodChips({
  selectedIndex,
  onSelect,
}: {
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="mt-[20px] flex items-center justify-center gap-[8px]">
      {SCENARIO_PERIODS.map((label, index) => {
        const selected = index === selectedIndex;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            aria-pressed={selected}
            className={cn(
              "inline-flex h-[21px] min-w-[35px] items-center justify-center whitespace-nowrap rounded-[3.5px] px-[8px] text-center text-[14px] font-bold leading-[15px]",
              selected
                ? "border border-transparent bg-[var(--uc-action)] text-[var(--uc-text-inverse)]"
                : "border border-[var(--uc-text)] bg-transparent text-[var(--uc-text)]",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function InvestmentDisclaimerContent({ currency }: { currency: string }) {
  const [scenarioView, setScenarioView] = useState<ScenarioEmphasis>("value");
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(SCENARIO_PERIODS.length - 1);

  return (
    <div>
      <div className="px-[24px]">
        <ScenarioViewToggle value={scenarioView} onChange={setScenarioView} />
      </div>
      <PerformanceScenarioChart
        view={scenarioView}
        currency={currency}
        periodIndex={selectedPeriodIndex}
        onPeriodChange={setSelectedPeriodIndex}
      />

      <div className="mt-[20px]">
        <CostBreakdownBlock currency={currency} emphasize={scenarioView} />
      </div>

      <div className="px-[24px]">
        <CostSummaryRow label="NET INVESTMENT AMOUNT" percent="9,30%" amount={`1 000,00 ${currency}`} emphasize={scenarioView} />
        <CostSummaryRow label="NET RETURN" percent="9,30%" amount={`1 000,00 ${currency}`} emphasize={scenarioView} />
      </div>

      <div className="px-[24px]">
        <CostSummaryRow label="TOTAL" percent="9,30%" amount={`1 000,00 ${currency}`} emphasize={scenarioView} />
      </div>
    </div>
  );
}

type DocumentsAccordionSectionId = "ex-ante" | "documents" | "important-information" | "disclaimer";

export interface InvestmentOrderDocumentsAccordionProps {
  currency: string;
}

/**
 * "DOCUMENTS AND TERMS" accordion for the investment buy-order review step:
 * Ex-Ante cost information, Product documents, Important information and
 * Investment disclaimer, each collapsible with its own detail content.
 * Only one section is open at a time.
 */
export default function InvestmentOrderDocumentsAccordion({ currency }: InvestmentOrderDocumentsAccordionProps) {
  const [openSection, setOpenSection] = useState<DocumentsAccordionSectionId | null>(null);

  const toggleSection = (id: DocumentsAccordionSectionId) => {
    setOpenSection((current) => (current === id ? null : id));
  };

  return (
    <div className="flex flex-col" data-ds-label="Investment documents and terms accordion">
      <DocumentsAccordionSection
        iconName="investment-ex-ante"
        iconWidth={18}
        iconHeight={24}
        title="Ex-Ante cost information"
        subtitle="Estimated costs for this order"
        isOpen={openSection === "ex-ante"}
        onToggle={() => toggleSection("ex-ante")}
      >
        <CostBreakdownBlock currency={currency} />
      </DocumentsAccordionSection>

      <DocumentsAccordionSection
        iconName="investment-documents"
        title="Product documents"
        subtitle="Key information and fund documents"
        isOpen={openSection === "documents"}
        onToggle={() => toggleSection("documents")}
      >
        <ProductDocumentsContent />
      </DocumentsAccordionSection>

      <DocumentsAccordionSection
        iconName="investment-important-info"
        title="Important information"
        subtitle="Suitability and appropriateness check"
        isOpen={openSection === "important-information"}
        onToggle={() => toggleSection("important-information")}
      >
        <ImportantInformationContent />
      </DocumentsAccordionSection>

      <DocumentsAccordionSection
        iconName="investment-disclaimer"
        title="Investment disclaimer"
        subtitle="Performance scenarios and risks"
        isOpen={openSection === "disclaimer"}
        onToggle={() => toggleSection("disclaimer")}
      >
        <InvestmentDisclaimerContent currency={currency} />
      </DocumentsAccordionSection>
    </div>
  );
}
