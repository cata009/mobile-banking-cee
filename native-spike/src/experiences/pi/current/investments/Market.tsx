import React, { createContext, useContext } from 'react';
import type { CountryId } from '@/app/state/demoTypes';
import { getCountryCurrency } from '@/data/exchangeRates';
const Market = createContext<CountryId>('CZ');
/** Existing CZ renderers keep CZ by default; reused current controls receive their real market. */
export function InvestmentMarket({
  country,
  children,
}: {
  country: CountryId;
  children: React.ReactNode;
}) {
  return <Market.Provider value={country}>{children}</Market.Provider>;
}
export function useInvestmentMarket() {
  const country = useContext(Market);
  return { country, currency: getCountryCurrency(country) };
}
