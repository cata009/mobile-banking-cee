import { useEffect, useRef } from "react";
import type { InvestmentPortfolioTabOption, InvestmentPortfolioTabId } from "@/app/config/investmentsPortfolioConfig";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";
import { useDragCarousel } from "@/hooks/useDragCarousel";

interface InvestmentPortfolioTabsProps {
  tabs: readonly InvestmentPortfolioTabOption[];
  selectedTabId: InvestmentPortfolioTabId;
  onChange: (tabId: InvestmentPortfolioTabId) => void;
  variant?: "underline" | "chips";
}

export default function InvestmentPortfolioTabs({
  tabs,
  selectedTabId,
  onChange,
  variant = "underline",
}: InvestmentPortfolioTabsProps) {
  const chipRailRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef(new Map<InvestmentPortfolioTabId, HTMLButtonElement>());
  const hasSettledChipRailRef = useRef(false);
  const { dragHandlers, isDragging } = useDragCarousel({ carouselRef: chipRailRef });

  useEffect(() => {
    if (variant !== "chips") return;

    const rail = chipRailRef.current;
    const selectedChip = chipRefs.current.get(selectedTabId);
    if (!rail || !selectedChip) return;

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const centeredScroll = selectedChip.offsetLeft - (rail.clientWidth - selectedChip.offsetWidth) / 2;
    const nextScrollLeft = Math.min(Math.max(centeredScroll, 0), maxScroll);
    if (Math.abs(nextScrollLeft - rail.scrollLeft) < 1) {
      hasSettledChipRailRef.current = true;
      return;
    }

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const behavior: ScrollBehavior = hasSettledChipRailRef.current && !reduceMotion ? "smooth" : "auto";
    hasSettledChipRailRef.current = true;
    if (typeof rail.scrollTo === "function") rail.scrollTo({ left: nextScrollLeft, behavior });
    else rail.scrollLeft = nextScrollLeft;
  }, [selectedTabId, tabs, variant]);

  if (variant === "chips") {
    return (
      <div
        ref={chipRailRef}
        {...dragHandlers}
        className={`flex h-[48px] items-center gap-[8px] overflow-x-auto overscroll-x-contain px-[16px] scrollbar-hide select-none touch-pan-y ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
        role="tablist"
        aria-label="Investments allocation by"
        aria-orientation="horizontal"
      >
        {tabs.map((tab) => {
          const selected = tab.id === selectedTabId;
          return (
            <button
              key={tab.id}
              type="button"
              ref={(node) => {
                if (node) chipRefs.current.set(tab.id, node);
                else chipRefs.current.delete(tab.id);
              }}
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.id)}
              className={`h-[34px] shrink-0 whitespace-nowrap rounded-[4px] border px-[12px] text-[14px] font-bold leading-[18px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] ${
                selected
                  ? "border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                  : "border-transparent bg-[var(--uc-neutral-100)] text-[var(--uc-text)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <MessagesMailboxTabs
      tabs={tabs}
      activeTabId={selectedTabId}
      onChange={(tabId) => onChange(tabId as InvestmentPortfolioTabId)}
      layout="scrollable"
      minTabWidth={150}
      ariaLabel="Investments portfolio tabs"
      withTopMargin={false}
      className="bg-[var(--uc-surface)]"
    />
  );
}
