import type { InvestmentChartPoint } from "@/app/config/investmentsPortfolioConfig";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The mock series only dates its anchors; interpolate dates between them. */
export function buildInvestmentTimeline(points: readonly InvestmentChartPoint[]): number[] {
  const anchors = points.flatMap((point, index) => {
    const [day, month] = point.dateLabel.split(" ");
    const monthIndex = MONTHS.indexOf(month ?? "");
    return monthIndex >= 0 && point.yearLabel
      ? [{ index, time: Date.UTC(Number(point.yearLabel), monthIndex, Number(day)) }]
      : [];
  });
  return points.map((_, index) => {
    const right = anchors.find((anchor) => anchor.index >= index) ?? anchors.at(-1);
    const left = [...anchors].reverse().find((anchor) => anchor.index <= index) ?? anchors[0];
    if (!left || !right) return index;
    const fraction = right.index === left.index ? 0 : (index - left.index) / (right.index - left.index);
    return left.time + (right.time - left.time) * fraction;
  });
}

export function formatInvestmentTimelineTick(time: number): { dateLabel: string; yearLabel: string } {
  const date = new Date(time);
  return {
    dateLabel: `${String(date.getUTCDate()).padStart(2, "0")} ${MONTHS[date.getUTCMonth()]}`,
    yearLabel: String(date.getUTCFullYear()),
  };
}
