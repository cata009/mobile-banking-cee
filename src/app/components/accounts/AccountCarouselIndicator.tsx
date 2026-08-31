interface AccountCarouselIndicatorProps {
  count: number;
  activeIndex: number;
  /** What each dot navigates to, used in the dot labels. Defaults to "account". */
  itemLabel?: string;
  /**
   * A name per dot, used instead of the ordinal. "Go to period 3" tells nobody
   * anything; "April 2026" does.
   */
  itemLabels?: readonly string[];
  /**
   * The blur is designed for dots sitting on top of scrolling content. Over a
   * flat dark surface it renders as a visible 32px block behind the dots, so
   * surfaces like the Products hero band turn it off.
   */
  withBackdropBlur?: boolean;
  /** `inverse` makes the inactive dots readable on dark photography. */
  tone?: "default" | "inverse";
  /**
   * How many dots are shown before the rail starts windowing behind mini dots.
   * Six periods of Spending fit across the phone comfortably; four does not
   * suit every rail, and a mini dot next to the real ones only earns its place
   * when there is genuinely more than the row can hold.
   */
  windowSize?: number;
  onSelect?: (index: number) => void;
}

type IndicatorItem =
  | { type: "item"; index: number }
  | { type: "mini"; key: string };

function getIndicatorItems(count: number, activeIndex: number, windowSize: number): IndicatorItem[] {
  if (count <= windowSize) {
    return Array.from({ length: count }, (_, index) => ({ type: "item", index }));
  }

  if (activeIndex <= 1) {
    return [
      ...Array.from({ length: windowSize }, (_, index) => ({ type: "item" as const, index })),
      { type: "mini", key: "end" },
    ];
  }

  if (activeIndex >= count - 2) {
    return [
      { type: "mini", key: "start" },
      ...Array.from({ length: windowSize }, (_, index) => ({
        type: "item" as const,
        index: count - windowSize + index,
      })),
    ];
  }

  return [
    { type: "mini", key: "start" },
    { type: "item", index: activeIndex - 2 },
    { type: "item", index: activeIndex - 1 },
    { type: "item", index: activeIndex },
    { type: "item", index: activeIndex + 1 },
    { type: "item", index: activeIndex + 2 },
    { type: "mini", key: "end" },
  ];
}

export default function AccountCarouselIndicator({
  count,
  activeIndex,
  itemLabel = "account",
  itemLabels,
  withBackdropBlur = true,
  tone = "default",
  windowSize = 4,
  onSelect,
}: AccountCarouselIndicatorProps) {
  const items = getIndicatorItems(count, activeIndex, windowSize);
  const inactiveClass =
    tone === "inverse" ? "bg-[rgb(var(--uc-static-white-rgb)_/_0.55)]" : "bg-[var(--uc-text-muted)]";

  return (
    <div
      className="flex h-[32px] items-center justify-center"
      data-ds-label="AccountCarouselIndicator 32px"
      style={withBackdropBlur ? { backdropFilter: "blur(13.591408729553223px)" } : undefined}
    >
      <div className="inline-flex items-center gap-[6px]" data-ds-label="Carousel dots gap 6px">
        {items.map((item) => {
          if (item.type === "mini") {
            return (
              <span
                key={item.key}
                className={`h-[4px] w-[4px] rounded-full ${inactiveClass}`}
                data-ds-label="Mini dot 4x4"
              />
            );
          }

          const isActive = item.index === activeIndex;

          return (
            <button
              key={item.index}
              type="button"
              onClick={() => onSelect?.(item.index)}
              /* Each button is exactly its own ink, so the rail's 6px gap is the
                 gap you see. A 24px box with -9px inline margins cancelled the
                 slack around a 6px dot, but the active pill is 30px wide and has
                 no slack left to cancel — the margins pulled its neighbours 3px
                 into it and the rhythm collapsed. The 24px target WCAG 2.2
                 SC 2.5.8 asks for is an overlay instead, which costs the layout
                 nothing. */
              className="relative grid h-[6px] shrink-0 place-items-center rounded-full after:absolute after:left-1/2 after:top-1/2 after:h-[24px] after:w-full after:min-w-[24px] after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
              aria-label={itemLabels?.[item.index] ?? `Go to ${itemLabel} ${item.index + 1}`}
              aria-current={isActive ? "true" : undefined}
              data-ds-label={isActive ? "Active rectangle 30x6" : "Inactive dot 6x6"}
            >
              <span
                aria-hidden="true"
                className={`block rounded-full ${isActive ? "h-[6px] w-[30px] bg-[var(--uc-action)]" : `h-[6px] w-[6px] ${inactiveClass}`}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
