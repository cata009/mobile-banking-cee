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
        className="font-['UniCredit',sans-serif] font-normal"
        style={{
          color: '#000',
          fontSize: '18px',
          lineHeight: 'normal'
        }}
      >
        Total
      </span>

      {/* Amount - using exact same layout as ProductCard */}
      <div className="flex items-baseline">
        {/* Integer part */}
        <span 
          className="font-['UniCredit',sans-serif] font-bold text-right"
          style={{
            color: '#262626',
            fontSize: '20px',
            lineHeight: 'normal'
          }}
        >
          {integer}
        </span>
        
        {/* Decimals + Currency (no gap, same as ProductCard) */}
        <span 
          className="font-['UniCredit',sans-serif] font-normal text-right"
          style={{
            color: '#262626',
            fontSize: '14px',
            lineHeight: 'normal'
          }}
        >
          {decimals} {currency}
        </span>
      </div>
    </div>
  );
}
