interface TotalRowProps {
  integer: string;
  decimals: string;
  currency: string;
  variant?: 'legacy' | 'evolution';
  productStyle?: 'pi' | 'sme';
  className?: string;
  label?: string;
}

export default function TotalRow({
  integer,
  decimals,
  currency,
  variant = 'legacy',
  productStyle = 'pi',
  className = '',
  label = 'Total',
}: TotalRowProps) {
  if (variant === 'evolution') {
    return (
      <div
        className={`flex w-[327px] flex-col items-end gap-[4px] rounded-b-[4px] p-[16px] text-[var(--uc-text)] ${className}`}
        data-total-row-evolution
        data-product-style={productStyle}
        style={{
          background: productStyle === 'sme' ? "var(--uc-neutral-200)" : "var(--uc-surface-raised)",
        }}
      >
        <div className="flex w-full flex-col items-start justify-center gap-[4px]">
          <span className="text-[18px] font-normal leading-[20px] tracking-[0] text-[var(--uc-primary-k0,var(--uc-text))]">
            {label}
          </span>
          <div className="flex h-[20px] w-full items-end justify-end text-right text-[var(--uc-text)]">
            <span className="text-[20px] font-bold leading-[20px] tracking-[0]">
              {integer}
            </span>
            <span className="text-[14px] font-normal leading-[16px] tracking-[0]">
              {decimals} {currency}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-baseline self-stretch">
      {/* Label "Total" */}
      <span
        className="uc-type-p1"
        style={{
          color: 'var(--uc-text)',
        }}
      >
        {label}
      </span>

      {/* Amount - using exact same layout as ProductCard */}
      <div className="flex items-baseline">
        {/* Integer part */}
        <span 
          className="uc-type-n2-strong text-right"
          style={{
            color: 'var(--uc-text)',
          }}
        >
          {integer}
        </span>
        
        {/* Decimals + Currency (no gap, same as ProductCard) */}
        <span 
          className="uc-type-n5 text-right"
          style={{
            color: 'var(--uc-text)',
          }}
        >
          {decimals} {currency}
        </span>
      </div>
    </div>
  );
}
