interface TotalRowProps {
  integer: string;
  decimals: string;
  currency: string;
}

export default function TotalRow({ integer, decimals, currency }: TotalRowProps) {
  return (
    <div className="flex justify-between items-baseline self-stretch">
      {/* Label "Total" */}
      <span
        className="uc-type-p1"
        style={{
          color: 'var(--uc-text)',
        }}
      >
        Total
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
