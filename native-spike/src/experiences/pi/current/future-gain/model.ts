import { isFutureGainAvailable } from '@/features/investments/future-gain/model';
import {
  convertCurrency,
  getCountryCurrency,
  roundMoney,
} from '@/data/exchangeRates';
import type { SimulatorCurrency } from '@/features/investments/future-gain/smartInvestment';
import { createCurrentProducts } from '../context';
import type { CurrentContext } from '../contracts';
export function futureGainEnabled(
  context: Pick<CurrentContext, 'country' | 'release' | 'scenario'>,
) {
  return (
    context.scenario === 'active' &&
    isFutureGainAvailable({
      product: 'PI',
      country: context.country,
      release: context.release,
    })
  );
}
export function futureGainAvailableBalance(
  context: Pick<CurrentContext, 'country' | 'release' | 'productCounts'>,
  currency: SimulatorCurrency,
) {
  return roundMoney(
    convertCurrency(
      createCurrentProducts(context).calculateTotalAvailableAmount(),
      getCountryCurrency(context.country),
      currency,
    ),
  );
}
