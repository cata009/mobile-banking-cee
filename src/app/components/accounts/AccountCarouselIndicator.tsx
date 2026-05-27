interface AccountCarouselIndicatorProps {
  count: number;
  activeIndex: number;
  onSelect?: (index: number) => void;
}

type IndicatorItem =
  | { type: "item"; index: number }
  | { type: "mini"; key: string };

function getIndicatorItems(count: number, activeIndex: number): IndicatorItem[] {
  if (count <= 4) {
    return Array.from({ length: count }, (_, index) => ({ type: "item", index }));
  }

  if (activeIndex <= 1) {
    return [
      ...Array.from({ length: 4 }, (_, index) => ({ type: "item" as const, index })),
      { type: "mini", key: "end" },
    ];
  }

  if (activeIndex >= count - 2) {
    return [
      { type: "mini", key: "start" },
      ...Array.from({ length: 4 }, (_, index) => ({
        type: "item" as const,
        index: count - 4 + index,
      })),
    ];
  }

  return [
    { type: "mini", key: "start" },
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
  onSelect,
}: AccountCarouselIndicatorProps) {
  const items = getIndicatorItems(count, activeIndex);

  return (
    <div
      className="flex h-[32px] items-center justify-center"
      data-ds-label="AccountCarouselIndicator 32px"
      style={{ backdropFilter: "blur(13.591408729553223px)" }}
    >
      <div className="inline-flex items-center gap-[6px]" data-ds-label="Carousel dots gap 6px">
        {items.map((item) => {
          if (item.type === "mini") {
            return (
              <span
                key={item.key}
                className="h-[4px] w-[4px] rounded-full bg-[#666666]"
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
              className={`rounded-full ${isActive ? "h-[6px] w-[30px] bg-[#007A91]" : "h-[6px] w-[6px] bg-[#666666]"}`}
              aria-label={`Go to account ${item.index + 1}`}
              aria-current={isActive ? "true" : undefined}
              data-ds-label={isActive ? "Active rectangle 30x6" : "Inactive dot 6x6"}
            />
          );
        })}
      </div>
    </div>
  );
}
