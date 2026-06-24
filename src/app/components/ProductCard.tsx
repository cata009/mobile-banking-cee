import { ReactNode } from 'react';

export const PRODUCT_CARD_EVOLUTION_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  figmaComponentName: "Product card - evolution",
  sourceNodeId: "8724:1885",
  originalRequestedNodeId: "9201:7443",
  sourceNodeIds: {
    piDefault: "8724:1898",
    piAccordion: "8724:1908",
    piOpen: "8724:1886",
    smeDefault: "8724:1923",
    smeAccordion: "8724:1933",
    smeOpen: "8724:1948",
  },
  width: 327,
  variants: 6,
} as const;

interface ProductCardProps {
  icon: ReactNode;
  title: string;
  accountNumber: string;
  amount: string;
  decimals: string;
  currency: string;
  thirdLine?: string;
  variant?: 'legacy' | 'evolution';
  productStyle?: 'pi' | 'sme';
  stackRole?: 'single' | 'first' | 'middle' | 'last';
  onClick?: () => void;
}

export default function ProductCard({
  icon,
  title,
  accountNumber,
  amount,
  decimals,
  currency,
  thirdLine,
  variant = 'legacy',
  productStyle = 'pi',
  stackRole = 'single',
  onClick
}: ProductCardProps) {
  if (variant === 'evolution') {
    const isSme = productStyle === 'sme';
    const radiusClass =
      stackRole === 'first'
        ? 'rounded-t-[4px]'
        : stackRole === 'last'
          ? 'rounded-b-[4px]'
          : stackRole === 'middle'
            ? 'rounded-none'
            : 'rounded-[4px]';

    return (
      <div
        className={`flex w-[327px] flex-col items-end gap-[8px] bg-[var(--uc-surface-raised)] p-[16px] text-[var(--uc-text)] transition-opacity ${radiusClass} ${onClick ? "cursor-pointer hover:opacity-90" : ""}`}
        data-product-card-evolution
        data-product-style={productStyle}
        onClick={onClick}
        style={{
          background: isSme ? "var(--uc-neutral-200)" : "var(--uc-surface-raised)",
        }}
      >
        <div className="flex w-full items-start gap-[16px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
            <p className="text-[18px] font-bold leading-[20px] tracking-[0] text-[var(--uc-primary-k0,var(--uc-text))]">
              {title}
            </p>
            <p className="text-[14px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text)]">
              {accountNumber}
            </p>
            {thirdLine ? (
              <p className="text-[14px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text)]">
                {thirdLine}
              </p>
            ) : null}
          </div>
          <div className="flex size-[32px] shrink-0 items-center justify-center text-[var(--uc-action)]">
            {icon}
          </div>
        </div>

        <div className="flex w-full items-baseline justify-end text-right text-[var(--uc-text)]">
          <span className="text-[24px] font-bold leading-[28px] tracking-[0]">
            {amount}
          </span>
          <span className="text-[14px] font-normal leading-[16px] tracking-[0]">
            {decimals} {currency}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col items-start gap-[4px] self-stretch rounded-[4px] bg-[var(--uc-surface-raised)] transition-opacity ${onClick ? "cursor-pointer hover:opacity-90" : ""}`}
      style={{
        padding: '16px'
      }}
      onClick={onClick}
    >
      {/* Top Container: Icon + Title & Account Number */}
      <div className="flex items-start gap-[16px] self-stretch">
        {/* Icon */}
        <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0 text-[var(--uc-action)]">
          {icon}
        </div>
        
        {/* Title & Account Number */}
        <div className="flex flex-col gap-0 flex-1">
          {/* Title */}
          <p className="uc-type-p1 text-[var(--uc-text)]">
            {title}
          </p>
          
          {/* Account Number */}
          <p className="uc-type-n5-strong text-[var(--uc-text)]">
            {accountNumber}
          </p>
        </div>
      </div>

      {/* Balance Container */}
      <div className="flex justify-end items-baseline self-stretch">
        {/* Amount */}
        <span className="uc-type-n2-strong text-right text-[var(--uc-text)]">
          {amount}
        </span>
        
        {/* Decimals + Currency (no gap) */}
        <span className="uc-type-n5 text-right text-[var(--uc-text)]">
          {decimals} {currency}
        </span>
      </div>
    </div>
  );
}
