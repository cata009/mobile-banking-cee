import type { Currency } from "@/data/products";

interface CurrencyFlagProps {
  currency: Currency;
}

function FlagArtwork({ currency }: CurrencyFlagProps) {
  switch (currency) {
    case "RON":
      return <><rect width="12" height="24" fill="#002B7F" /><rect x="12" width="12" height="24" fill="#FCD116" /><rect x="24" width="12" height="24" fill="#CE1126" /></>;
    case "EUR":
      return <><rect width="36" height="24" fill="#003399" />{Array.from({ length: 12 }, (_, index) => {
        const angle = (index * Math.PI) / 6;
        return <circle key={index} cx={18 + Math.sin(angle) * 7} cy={12 - Math.cos(angle) * 7} r="0.9" fill="#FFCC00" />;
      })}</>;
    case "USD":
      return <><rect width="36" height="24" fill="#FFF" />{Array.from({ length: 7 }, (_, index) => <rect key={index} y={index * 24 / 7} width="36" height={24 / 14} fill="#B22234" />)}<rect width="16" height="13" fill="#3C3B6E" />{Array.from({ length: 12 }, (_, index) => <circle key={index} cx={2.2 + (index % 4) * 3.6} cy={2.2 + Math.floor(index / 4) * 3.5} r="0.55" fill="#FFF" />)}</>;
    case "GBP":
      return <><rect width="36" height="24" fill="#012169" /><path d="M0 0 36 24M36 0 0 24" stroke="#FFF" strokeWidth="6" /><path d="M0 0 36 24M36 0 0 24" stroke="#C8102E" strokeWidth="2.5" /><path d="M18 0v24M0 12h36" stroke="#FFF" strokeWidth="8" /><path d="M18 0v24M0 12h36" stroke="#C8102E" strokeWidth="4" /></>;
    case "CZK":
      return <><rect width="36" height="12" fill="#FFF" /><rect y="12" width="36" height="12" fill="#D7141A" /><path d="M0 0 16 12 0 24Z" fill="#11457E" /></>;
    case "HUF":
      return <><rect width="36" height="8" fill="#CE2939" /><rect y="8" width="36" height="8" fill="#FFF" /><rect y="16" width="36" height="8" fill="#477050" /></>;
    case "RSD":
      return <><rect width="36" height="8" fill="#C6363C" /><rect y="8" width="36" height="8" fill="#0C4076" /><rect y="16" width="36" height="8" fill="#FFF" /><path d="M9 5h6v10l-3 3-3-3Z" fill="#C6363C" stroke="#F4C430" strokeWidth="0.7" /><path d="M10.5 9h3M12 7.5v4" stroke="#FFF" strokeWidth="0.8" /></>;
    case "BAM":
      return <><rect width="36" height="24" fill="#002395" /><path d="M9 0h18v24Z" fill="#FECB00" />{Array.from({ length: 6 }, (_, index) => <circle key={index} cx={7 + index * 4.6} cy={2 + index * 3.8} r="1.15" fill="#FFF" />)}</>;
  }
}

export default function CurrencyFlag({ currency }: CurrencyFlagProps) {
  return (
    <span className="inline-flex h-[24px] w-[36px] shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10">
      <svg
        data-currency-flag={currency}
        viewBox="0 0 36 24"
        width="36"
        height="24"
        aria-hidden="true"
        focusable="false"
      >
        <FlagArtwork currency={currency} />
      </svg>
    </span>
  );
}
