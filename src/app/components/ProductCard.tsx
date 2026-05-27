import { ReactNode } from 'react';

interface ProductCardProps {
  icon: ReactNode;
  title: string;
  accountNumber: string;
  amount: string;
  decimals: string;
  currency: string;
  onClick?: () => void;
}

export default function ProductCard({
  icon,
  title,
  accountNumber,
  amount,
  decimals,
  currency,
  onClick
}: ProductCardProps) {
  return (
    <div 
      className="flex flex-col items-start gap-[4px] self-stretch bg-white rounded-[4px] cursor-pointer hover:opacity-90 transition-opacity"
      style={{
        padding: '16px'
      }}
      onClick={onClick}
    >
      {/* Top Container: Icon + Title & Account Number */}
      <div className="flex items-start gap-[16px] self-stretch">
        {/* Icon */}
        <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        
        {/* Title & Account Number */}
        <div className="flex flex-col gap-0 flex-1">
          {/* Title */}
          <p 
            className="font-['UniCredit',sans-serif] font-normal"
            style={{
              color: '#000',
              fontSize: '18px',
              lineHeight: 'normal'
            }}
          >
            {title}
          </p>
          
          {/* Account Number */}
          <p 
            className="font-['UniCredit',sans-serif] font-bold"
            style={{
              color: '#262626',
              fontSize: '14px',
              lineHeight: 'normal'
            }}
          >
            {accountNumber}
          </p>
        </div>
      </div>

      {/* Balance Container */}
      <div className="flex justify-end items-baseline self-stretch">
        {/* Amount */}
        <span 
          className="font-['UniCredit',sans-serif] font-bold text-right"
          style={{
            color: '#262626',
            fontSize: '20px',
            lineHeight: 'normal'
          }}
        >
          {amount}
        </span>
        
        {/* Decimals + Currency (no gap) */}
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
