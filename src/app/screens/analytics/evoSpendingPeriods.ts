/**
 * The Spending screen's period model.
 *
 * The old model was a single flat array: every month ascending, then the year
 * totals descending. Months and years therefore shared one axis, so pressing
 * "next" on April 2026 landed on "Full year 2026" and pressing it again landed
 * on "Full year 2025" — forward in the control, backwards in time.
 *
 * Granularity and position are separated here. A selection names *which* months
 * it covers and *what kind* of thing it is; stepping only ever moves within the
 * same kind, and switching kind is an explicit choice in the period sheet.
 */

export type SpendingPeriodKind = "month" | "range" | "year";

export interface SpendingPeriodSelection {
  /** Stable id, used as the summary cache key. */
  id: string;
  kind: SpendingPeriodKind;
  /** Months covered, ascending. */
  monthKeys: string[];
  /** Large line in the stepper. */
  title: string;
  /** Small line under it — never empty, so the header height never jumps. */
  subtitle: string;
}

export type SpendingPresetId =
  | "this-month"
  | "last-month"
  | "last-3-months"
  | "last-6-months"
  | "year-to-date"
  | "last-year";

export const SPENDING_PRESET_IDS: readonly SpendingPresetId[] = [
  "this-month",
  "last-month",
  "last-3-months",
  "last-6-months",
  "year-to-date",
  "last-year",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseMonthKey(monthKey: string): { year: number; month: number } | null {
  const [yearPart, monthPart] = monthKey.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  return { year, month };
}

function formatMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** Month name in the app's display language, falling back to the English table. */
export function monthLabel(monthKey: string, locale: string, style: "long" | "short" = "long") {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return monthKey;
  try {
    return new Date(parsed.year, parsed.month - 1, 1)
      .toLocaleDateString(locale, { month: style });
  } catch {
    return MONTH_NAMES[parsed.month - 1] ?? monthKey;
  }
}

export function monthKeyYear(monthKey: string) {
  return monthKey.split("-")[0] ?? "";
}

/** The `count` months ending at `endMonthKey`, ascending. */
function monthsEndingAt(endMonthKey: string, count: number, available: readonly string[]): string[] {
  const parsed = parseMonthKey(endMonthKey);
  if (!parsed) return [endMonthKey];

  const keys: string[] = [];
  let { year, month } = parsed;
  for (let index = 0; index < count; index += 1) {
    keys.unshift(formatMonthKey(year, month));
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
  }
  const availableSet = new Set(available);
  const present = keys.filter((key) => availableSet.has(key));
  // A window with no data at all still names its span, so the empty state can say so.
  return present.length ? present : keys;
}

function shortRangeLabel(monthKeys: readonly string[], locale: string) {
  const first = monthKeys[0];
  const last = monthKeys[monthKeys.length - 1];
  if (!first || !last) return "";
  if (first === last) return `${monthLabel(first, locale, "short")} ${monthKeyYear(first)}`;

  const sameYear = monthKeyYear(first) === monthKeyYear(last);
  const start = sameYear
    ? monthLabel(first, locale, "short")
    : `${monthLabel(first, locale, "short")} ${monthKeyYear(first)}`;
  return `${start} – ${monthLabel(last, locale, "short")} ${monthKeyYear(last)}`;
}

export interface PresetLabels {
  thisMonth: string;
  lastMonth: string;
  last3Months: string;
  last6Months: string;
  yearToDate: string;
  lastYear: string;
}

/**
 * Builds a selection from a preset.
 *
 * `latestMonthKey` is the demo's "now" — the newest month with activity —
 * rather than the reader's clock, so the presets line up with the data.
 */
export function buildPresetSelection(
  preset: SpendingPresetId,
  latestMonthKey: string,
  availableMonthKeys: readonly string[],
  locale: string,
  labels: PresetLabels,
): SpendingPeriodSelection {
  const parsed = parseMonthKey(latestMonthKey);
  const latestYear = parsed?.year ?? new Date(2026, 0, 1).getFullYear();

  switch (preset) {
    case "this-month":
      return {
        id: `month:${latestMonthKey}`,
        kind: "month",
        monthKeys: [latestMonthKey],
        title: monthLabel(latestMonthKey, locale),
        subtitle: monthKeyYear(latestMonthKey),
      };
    case "last-month": {
      const [previous] = monthsEndingAt(latestMonthKey, 2, availableMonthKeys);
      const key = previous ?? latestMonthKey;
      return {
        id: `month:${key}`,
        kind: "month",
        monthKeys: [key],
        title: monthLabel(key, locale),
        subtitle: monthKeyYear(key),
      };
    }
    case "last-3-months":
    case "last-6-months": {
      const count = preset === "last-3-months" ? 3 : 6;
      const monthKeys = monthsEndingAt(latestMonthKey, count, availableMonthKeys);
      return {
        id: `range:${monthKeys[0]}..${monthKeys[monthKeys.length - 1]}`,
        kind: "range",
        monthKeys,
        title: preset === "last-3-months" ? labels.last3Months : labels.last6Months,
        subtitle: shortRangeLabel(monthKeys, locale),
      };
    }
    case "year-to-date": {
      const monthKeys = availableMonthKeys.filter((key) => monthKeyYear(key) === String(latestYear));
      const span = monthKeys.length ? monthKeys : [latestMonthKey];
      return {
        id: `range:ytd-${latestYear}`,
        kind: "range",
        monthKeys: span,
        title: labels.yearToDate,
        subtitle: shortRangeLabel(span, locale),
      };
    }
    case "last-year":
      return buildYearSelection(String(latestYear - 1), availableMonthKeys, labels.lastYear, locale);
  }
}

/** A selection covering one calendar year. */
export function buildYearSelection(
  year: string,
  availableMonthKeys: readonly string[],
  fullYearLabel: string,
  locale = "en-US",
): SpendingPeriodSelection {
  const monthKeys = availableMonthKeys.filter((key) => monthKeyYear(key) === year);
  return {
    id: `year:${year}`,
    kind: "year",
    monthKeys,
    title: year,
    subtitle: yearSubtitle(monthKeys, fullYearLabel, locale),
  };
}

/**
 * What a year selection covers, under its title.
 *
 * A complete year says so. A year the data only partly fills names its months
 * instead — "Feb – Apr" — so it is never mistaken for a full one sitting beside
 * a full one.
 */
function yearSubtitle(monthKeys: readonly string[], fullYearLabel: string, locale: string) {
  if (monthKeys.length >= 12) return fullYearLabel;
  if (!monthKeys.length) return fullYearLabel;

  const first = monthKeys[0]!;
  const last = monthKeys[monthKeys.length - 1]!;
  if (first === last) return monthLabel(first, locale, "short");
  return `${monthLabel(first, locale, "short")} – ${monthLabel(last, locale, "short")}`;
}

/** A selection covering an inclusive span between two month keys. */
export function buildCustomSelection(
  fromMonthKey: string,
  toMonthKey: string,
  availableMonthKeys: readonly string[],
  locale: string,
): SpendingPeriodSelection {
  const [start, end] = fromMonthKey <= toMonthKey ? [fromMonthKey, toMonthKey] : [toMonthKey, fromMonthKey];
  const monthKeys = availableMonthKeys.filter((key) => key >= start && key <= end);
  const span = monthKeys.length ? monthKeys : [start];

  return {
    id: `custom:${start}..${end}`,
    kind: span.length === 1 ? "month" : "range",
    monthKeys: span,
    title: span.length === 1 ? monthLabel(span[0]!, locale) : shortRangeLabel(span, locale),
    subtitle: span.length === 1 ? monthKeyYear(span[0]!) : `${span.length} ${span.length === 1 ? "month" : "months"}`,
  };
}

/** The years the data covers, newest first. */
function descendingYears(availableMonthKeys: readonly string[]): string[] {
  return Array.from(new Set(availableMonthKeys.map(monthKeyYear))).sort().reverse();
}

/**
 * The selection one step earlier or later.
 *
 * Months step months and a multi-month window slides by its own length, so
 * "Last 3 months" goes to the three months before it. Past the newest month the
 * axis hands over to the year totals, newest first — the shape the product asks
 * for: back through the months you lived, forward to the years you closed.
 */
export function stepSelection(
  selection: SpendingPeriodSelection,
  direction: -1 | 1,
  availableMonthKeys: readonly string[],
  locale: string,
  fullYearLabel: string,
): SpendingPeriodSelection | null {
  if (!availableMonthKeys.length) return null;
  const first = availableMonthKeys[0]!;
  const last = availableMonthKeys[availableMonthKeys.length - 1]!;

  if (selection.kind === "month") {
    const index = availableMonthKeys.indexOf(selection.monthKeys[0] ?? "");
    const nextKey = availableMonthKeys[index + direction];
    if (nextKey) {
      return {
        id: `month:${nextKey}`,
        kind: "month",
        monthKeys: [nextKey],
        title: monthLabel(nextKey, locale),
        subtitle: monthKeyYear(nextKey),
      };
    }

    // Off the newest end of the months, the year totals continue the axis.
    if (direction === 1 && index === availableMonthKeys.length - 1) {
      const newestYear = descendingYears(availableMonthKeys)[0];
      return newestYear
        ? buildYearSelection(newestYear, availableMonthKeys, fullYearLabel, locale)
        : null;
    }
    return null;
  }

  if (selection.kind === "year") {
    // The years sit after the months, newest first, so stepping forward walks
    // back through them and stepping back off the front returns to the months.
    const years = descendingYears(availableMonthKeys);
    const index = years.indexOf(selection.title);
    if (index < 0) return null;

    if (index + direction < 0) {
      const newestMonth = availableMonthKeys[availableMonthKeys.length - 1]!;
      return {
        id: `month:${newestMonth}`,
        kind: "month",
        monthKeys: [newestMonth],
        title: monthLabel(newestMonth, locale),
        subtitle: monthKeyYear(newestMonth),
      };
    }

    const nextYear = years[index + direction];
    return nextYear ? buildYearSelection(nextYear, availableMonthKeys, fullYearLabel, locale) : null;
  }

  // A window slides by its own length.
  const length = selection.monthKeys.length || 1;
  const anchorIndex = availableMonthKeys.indexOf(
    direction === -1 ? selection.monthKeys[0]! : selection.monthKeys[selection.monthKeys.length - 1]!,
  );
  if (anchorIndex < 0) return null;

  const nextEndIndex = direction === -1 ? anchorIndex - 1 : anchorIndex + length;
  const clampedEnd = Math.min(availableMonthKeys.length - 1, nextEndIndex);
  const endKey = availableMonthKeys[clampedEnd];
  if (!endKey) return null;

  const monthKeys = monthsEndingAt(endKey, length, availableMonthKeys);
  if (!monthKeys.length) return null;
  // Refuse a step that would not move, or that leaves the available span.
  if (monthKeys[0]! < first && direction === -1) return null;
  if (monthKeys[monthKeys.length - 1]! > last && direction === 1) return null;
  if (monthKeys.join() === selection.monthKeys.join()) return null;

  return {
    ...selection,
    id: `range:${monthKeys[0]}..${monthKeys[monthKeys.length - 1]}`,
    monthKeys,
    subtitle: shortRangeLabel(monthKeys, locale),
  };
}

/** Bar-chart bucketing: weeks inside a single month, months across anything longer. */
export function selectionBucketKind(selection: SpendingPeriodSelection): "week" | "month" {
  return selection.kind === "month" ? "week" : "month";
}

/** How many neighbours the dot rail reaches in each direction. */
const RAIL_REACH = 24;

/**
 * The sequence the dots page through, with the selected period's position in it.
 *
 * Built by stepping, so the rail is exactly what the gesture can reach: the
 * months oldest-first, then the year totals newest-first at the far end.
 */
export function buildPeriodRail(
  selection: SpendingPeriodSelection,
  availableMonthKeys: readonly string[],
  locale: string,
  fullYearLabel: string,
): { items: SpendingPeriodSelection[]; activeIndex: number } {
  const before: SpendingPeriodSelection[] = [];
  let cursor = selection;
  for (let index = 0; index < RAIL_REACH; index += 1) {
    const previous = stepSelection(cursor, -1, availableMonthKeys, locale, fullYearLabel);
    if (!previous) break;
    before.unshift(previous);
    cursor = previous;
  }

  const after: SpendingPeriodSelection[] = [];
  cursor = selection;
  for (let index = 0; index < RAIL_REACH; index += 1) {
    const next = stepSelection(cursor, 1, availableMonthKeys, locale, fullYearLabel);
    if (!next) break;
    after.push(next);
    cursor = next;
  }

  return { items: [...before, selection, ...after], activeIndex: before.length };
}
