import { ReactNode, type MouseEvent } from 'react';

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
  leadingVisual?: 'currency' | 'card';
  actions?: readonly ProductCardAction[];
  footer?: ReactNode;
  onClick?: () => void;
}

export interface ProductCardAction {
  id: string;
  icon: ReactNode;
  label: string;
  ariaLabel?: string;
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
  leadingVisual = 'currency',
  actions,
  footer,
  onClick
}: ProductCardProps) {
  if (variant === 'evolution') {
    const isSme = productStyle === 'sme';
    const visibleActions = actions?.slice(0, 4) ?? [];
    const radiusClass =
      stackRole === 'first'
        ? 'rounded-t-[8px]'
        : stackRole === 'last'
          ? 'rounded-b-[8px]'
          : stackRole === 'middle'
            ? 'rounded-none'
          : 'rounded-[8px]';
    const hasSeparator = stackRole === 'middle' || stackRole === 'last';

    return (
      <div
        className={`flex w-full max-w-full min-w-0 flex-col items-end bg-[var(--uc-surface-raised)] p-[16px] text-[var(--uc-text)] transition-opacity ${visibleActions.length > 0 ? "gap-[32px]" : footer ? "gap-[16px]" : "gap-[8px]"} ${hasSeparator ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''} ${stackRole === 'single' ? 'relative z-10' : ''} ${radiusClass} ${onClick ? "cursor-pointer hover:opacity-90" : ""}`}
        data-product-card-evolution
        data-product-card-separator={hasSeparator ? 'true' : undefined}
        data-product-style={productStyle}
        onClick={onClick}
        style={{
          background: isSme ? "var(--uc-neutral-200)" : "var(--uc-surface-raised)",
        }}
      >
        <div className="flex w-full flex-col gap-[8px]">
          <div className="flex w-full items-start gap-[16px]">
            <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
              <p className="text-[16px] font-bold leading-[18px] tracking-[0] text-[var(--uc-primary-k0,var(--uc-text))]">
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
            <div
              data-product-card-leading-visual={leadingVisual}
              className={`flex shrink-0 items-center justify-center text-[var(--uc-action)] ${leadingVisual === 'card' ? 'h-[40px] w-[64px]' : 'size-[40px]'}`}
            >
              {icon}
            </div>
          </div>

          <div
            className="flex w-full items-baseline justify-start text-left text-[var(--uc-text)]"
            data-product-card-amount
          >
            <span className="text-[24px] font-bold leading-[28px] tracking-[0]">
              {amount}
            </span>
            <span className="text-[14px] font-normal leading-[16px] tracking-[0]">
              {decimals} {currency}
            </span>
          </div>
        </div>

        {visibleActions.length > 0 ? (
          <div className="flex w-full items-start gap-[8px]" data-product-card-actions>
            {visibleActions.map((action) => {
              const handleActionClick = (event: MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                action.onClick?.();
              };

              return (
                <button
                  key={action.id}
                  type="button"
                  aria-label={action.ariaLabel ?? action.label.replace(/\s+/g, ' ').trim()}
                  className="flex min-w-0 flex-1 flex-col items-center gap-[6px] text-[var(--uc-text)]"
                  onClick={handleActionClick}
                >
                  <span className="grid size-[48px] place-items-center rounded-full bg-[var(--uc-surface-muted)]">
                    <span className="grid size-[24px] place-items-center">
                      {action.icon}
                    </span>
                  </span>
                  <span className="text-center text-[14px] font-normal leading-[16px] whitespace-pre-line">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
        {footer ? <div className="w-full" data-product-card-footer>{footer}</div> : null}
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col items-start gap-[4px] self-stretch rounded-[8px] bg-[var(--uc-surface-raised)] transition-opacity ${onClick ? "cursor-pointer hover:opacity-90" : ""}`}
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
