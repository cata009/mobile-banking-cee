interface AmountParts {
  integer: string;
  decimals: string;
  currency: string;
}

function getDecimalSeparator(value?: string): string {
  const firstCharacter = value?.trim().charAt(0);
  return firstCharacter === "." || firstCharacter === "," ? firstCharacter : ",";
}

export function maskAmountParts<T extends AmountParts>(amount: T, hidden: boolean): T {
  if (!hidden) return amount;

  return {
    ...amount,
    integer: "****",
    decimals: `${getDecimalSeparator(amount.decimals)}**`,
  };
}

export function maskFormattedAmount(value: string, hidden: boolean): string {
  if (!hidden) return value;

  const separator = value.match(/[,.]\d{2}/)?.[0].charAt(0) ?? ",";
  return `****${separator}**`;
}
