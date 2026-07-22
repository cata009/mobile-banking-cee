import { type DragEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import type { InvestmentBasketFund } from "@/app/config/investmentBasketFundsConfig";

interface InvestmentBasketFundCardProps {
  basket: InvestmentBasketFund;
  onSelect: () => void;
  // Drag/click handlers are owned by the carousel and forwarded to each card so
  // the pointer capture (and click suppression) work when the gesture starts on
  // the card itself — mirroring the Account/Card carousel model.
  onPointerDown?: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove?: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel?: (event: PointerEvent<HTMLElement>) => void;
  onMouseDown?: (event: MouseEvent<HTMLElement>) => void;
  onClickCapture?: (event: MouseEvent<HTMLElement>) => void;
  onDragStart?: (event: DragEvent<HTMLElement>) => void;
  children?: ReactNode;
}

export default function InvestmentBasketFundCard({
  basket,
  onSelect,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onMouseDown,
  onClickCapture,
  onDragStart,
  children,
}: InvestmentBasketFundCardProps) {
  // role="button" div instead of a native <button>: native buttons capture the
  // pointer for click handling, which blocks the carousel's drag-to-scroll
  // gesture. The carousel sets pointer capture during a drag and suppresses the
  // click after a drag, so this div drives selection via onClick/onKeyDown.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onClickCapture={onClickCapture}
      onKeyDown={handleKeyDown}
      onDragStart={onDragStart}
      onMouseDown={onMouseDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className="flex min-h-[144px] w-[260px] shrink-0 cursor-pointer flex-col items-start gap-[8px] rounded-[4px] border border-[var(--uc-text)] bg-[var(--uc-surface)] p-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
      aria-label={`${basket.title}. ${basket.description}`}
      data-investment-basket-card={basket.id}
    >
      {/* Inner content is pointer-events-none so pointer events bubble to this
          card div (which holds the carousel drag handlers). Without it the logo
          and text would capture the pointer and break the drag gesture. */}
      <div className="pointer-events-none flex w-full flex-col items-start gap-[8px]">
        <BrandLogo logoId={basket.logoId} size={32} />
        <span className="line-clamp-2 text-[18px] font-bold leading-[24px] text-[var(--uc-text)]">{basket.title}</span>
        <span className="line-clamp-2 text-[14px] leading-[20px] text-[var(--uc-text-muted)]">{basket.description}</span>
        {children}
      </div>
    </div>
  );
}
