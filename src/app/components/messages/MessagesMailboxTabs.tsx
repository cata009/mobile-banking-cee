import { useEffect, useRef, type PointerEvent } from "react";

export type MessagesMailboxTabId = string;

export interface MessagesMailboxTab {
  id: MessagesMailboxTabId;
  label: string;
  hasNewItems?: boolean;
}

interface MessagesMailboxTabsProps {
  tabs: readonly MessagesMailboxTab[];
  activeTabId: MessagesMailboxTabId;
  onChange: (tabId: MessagesMailboxTabId) => void;
  layout?: "equal" | "scrollable";
  minTabWidth?: number;
  ariaLabel?: string;
  withTopMargin?: boolean;
  className?: string;
}

export default function MessagesMailboxTabs({
  tabs,
  activeTabId,
  onChange,
  layout = "equal",
  minTabWidth = 0,
  ariaLabel = "Mailbox tabs",
  withTopMargin = true,
  className = "",
}: MessagesMailboxTabsProps) {
  const isScrollable = layout === "scrollable";
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
    pointerId: null as number | null,
  });
  const dragThreshold = 10;

  useEffect(() => {
    if (!isScrollable) return;

    const list = tabListRef.current;
    const tab = activeTabRef.current;
    if (!list || !tab) return;

    // Scroll the tab list's own scrollLeft directly instead of
    // Element.scrollIntoView(), which walks every scrollable ancestor
    // (including ones with overflow:hidden) and can drag unrelated
    // parents sideways if they happen to have stray content overflow.
    const target = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
    const maxScrollLeft = list.scrollWidth - list.clientWidth;
    const clamped = Math.max(0, Math.min(target, maxScrollLeft));
    list.scrollTo({
      left: clamped,
      behavior: "smooth",
    });
  }, [activeTabId, isScrollable]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isScrollable || !tabListRef.current) return;
    if (event.button !== 0) return;

    if (tabListRef.current.scrollWidth <= tabListRef.current.clientWidth) return;

    dragStateRef.current = {
      isDragging: false,
      startX: event.clientX,
      startScrollLeft: tabListRef.current.scrollLeft,
      moved: false,
      pointerId: event.pointerId,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    const tabList = tabListRef.current;

    if (!isScrollable || dragState.pointerId !== event.pointerId || !tabList) return;

    const distance = event.clientX - dragState.startX;
    if (!dragState.isDragging && Math.abs(distance) > dragThreshold) {
      dragState.isDragging = true;
      dragState.moved = true;

      if (!tabList.hasPointerCapture(event.pointerId)) {
        tabList.setPointerCapture(event.pointerId);
      }
    }

    if (dragState.isDragging) {
      tabList.scrollLeft = dragState.startScrollLeft - distance;
      event.preventDefault();
    }
  };

  const finishPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (dragState.pointerId !== event.pointerId) return;

    if (tabListRef.current?.hasPointerCapture(event.pointerId)) {
      tabListRef.current.releasePointerCapture(event.pointerId);
    }

    dragState.isDragging = false;
    dragState.pointerId = null;
  };

  return (
    <div
      ref={tabListRef}
      className={`relative ${withTopMargin ? "mt-[22px]" : "mt-0"} h-[48px] shrink-0 border-b border-[var(--uc-border)] ${
        isScrollable ? "flex cursor-grab touch-pan-x select-none overflow-x-auto overscroll-x-contain scrollbar-hide active:cursor-grabbing" : "grid grid-cols-2"
      } ${className}`}
      role="tablist"
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerDrag}
      onPointerCancel={finishPointerDrag}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <button
            key={tab.id}
            ref={(node) => {
              if (isActive) {
                activeTabRef.current = node;
              }
            }}
            type="button"
            onClick={() => {
              if (dragStateRef.current.moved) {
                dragStateRef.current.moved = false;
                return;
              }
              onChange(tab.id);
            }}
            aria-pressed={isActive}
            role="tab"
            aria-selected={isActive}
            className="uc-type-n4-strong relative flex h-full shrink-0 items-center justify-center px-[16px] text-[var(--uc-text)]"
            style={isScrollable ? { minWidth: minTabWidth } : undefined}
          >
            {tab.hasNewItems ? (
              <span className="mr-[8px] size-[12px] rounded-full bg-[var(--uc-action)]" aria-hidden="true" />
            ) : null}
            <span className={`whitespace-nowrap ${isActive ? "" : "text-[var(--uc-text-muted)]"}`}>{tab.label}</span>
            {isActive ? (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[var(--uc-text)]" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
