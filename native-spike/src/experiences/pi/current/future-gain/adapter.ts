import type { CurrentAdapter } from '../contracts';
import { SmartInvestment } from './SmartInvestment';
import { PeerInsights } from './PeerInsights';
import { futureGainEnabled } from './model';
export const CURRENT_FUTURE_GAIN_ADAPTER: CurrentAdapter = {
  id: 'pi-rs-future-gain',
  screens: {
    'smart-investment': SmartInvestment,
    'peer-insights': PeerInsights,
  },
  searchEntries: context =>
    futureGainEnabled(context)
      ? [
          {
            id: 'future-gain-smart-investment',
            label: 'Smart investment',
            keywords: ['simulator', 'term deposit', 'funds', 'stocks'],
            target: { screen: 'smart-investment' },
          },
          {
            id: 'future-gain-peer-insights',
            label: 'Achieve your life goals',
            keywords: ['peer insights', 'goals', 'home', 'car', 'saving'],
            target: { screen: 'peer-insights' },
          },
        ]
      : [],
};
