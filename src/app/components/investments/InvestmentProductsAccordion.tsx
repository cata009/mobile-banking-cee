import { useState, type ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";

interface InvestmentProductsAccordionProps {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function InvestmentProductsAccordion({
  title,
  count,
  defaultOpen = true,
  children,
}: InvestmentProductsAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="flex flex-col" data-ds-label="Investments products accordion">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-[56px] items-center justify-between px-[16px]"
        aria-expanded={isOpen}
      >
        <span className="uc-type-n4-strong text-left text-[var(--uc-text)]">
          {title} ({count})
        </span>
        <span
          className="grid size-[32px] place-items-center transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <AppIcon name="chevron-down-wide" color="var(--uc-icon)" />
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: isOpen ? 1200 : 0, opacity: isOpen ? 1 : 0 }}
        aria-hidden={!isOpen}
      >
        {children}
      </div>
    </section>
  );
}
