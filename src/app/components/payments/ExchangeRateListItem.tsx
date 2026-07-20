import type { Currency } from "@/data/products";
import type { ExchangeRateRow } from "@/data/exchangeRates";
import CurrencyFlag from "@/app/components/payments/CurrencyFlag";

interface ExchangeRateListItemProps {
  amount: number;
  sourceCurrency: Currency;
  row: ExchangeRateRow;
  onSelect: (currency: Currency) => void;
  equalsLabel: string;
}

function formatRate(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
    useGrouping: false,
  });
}

export default function ExchangeRateListItem({
  amount,
  sourceCurrency,
  row,
  onSelect,
  equalsLabel,
}: ExchangeRateListItemProps) {
  const formattedAmount = String(amount);
  const formattedResult = formatRate(row.convertedAmount);
  const accessibleResult = `${formattedAmount} ${sourceCurrency} ${equalsLabel} ${formattedResult} ${row.currency}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(row.currency)}
      className="grid min-h-[68px] w-full grid-cols-[48px_minmax(0,1fr)_88px] items-center gap-[8px] border-b border-[var(--uc-border)] px-[8px] py-[10px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]"
      aria-label={accessibleResult}
    >
      <span className="grid place-items-center" aria-hidden="true">
        <CurrencyFlag currency={row.currency} />
      </span>
      <span className="min-w-0">
        <span className="uc-type-n4-strong block text-[var(--uc-text)]">{row.currency}</span>
        <span className="uc-type-n5 block truncate text-[var(--uc-text-muted)]">
          1 {row.currency} = {formatRate(row.unitRate)} {sourceCurrency}
        </span>
      </span>
      <span className="uc-type-n3-strong text-right text-[var(--uc-text)]" aria-hidden="true">
        {formattedResult}
      </span>
    </button>
  );
}
