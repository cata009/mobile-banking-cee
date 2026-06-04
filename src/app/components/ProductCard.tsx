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
      className={`flex flex-col items-start gap-[4px] self-stretch rounded-[4px] bg-[var(--uc-surface-raised)] transition-opacity ${onClick ? "cursor-pointer hover:opacity-90" : ""}`}
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
