import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';

const compactNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumSignificantDigits: 3,
});

export function formatRoboChartNumber(amount: number) {
  return compactNumber.format(amount);
}

export function formatRoboCompactMoney(
  amount: number,
  hidden: boolean,
  signed = false,
) {
  if (hidden) return '••••';
  if (Math.abs(amount) < 1000) {
    return formatInvestmentMoney(amount, 'CZ', 'CZK', false, 0, 2, signed);
  }
  const prefix = amount < 0 ? '−' : signed ? '+' : '';
  return prefix + formatRoboChartNumber(Math.abs(amount)) + ' CZK';
}
