import React from 'react';
import type { CoAppingInvestmentBuyDraft } from '@/features/investments/orders/buyOrder';
import BaselineInvestmentsController from '../../../current/investments/baseline/Controller';
import { InvestmentMarket } from '../../../current/investments/Market';
import type { CurrentScreenProps } from '../../../current/contracts';
import { InvestmentRuntime } from './Runtime';
import type { CzechNativeScreenProps } from '../contracts';
import {
  readCzechInvestmentBuyDraft,
  useCurrentInvestmentHost,
} from './hostAdapter';

/** Runs the shared Source Baseline investment controller inside the CZ Evo host. */
export function ClassicPortfolio({
  host,
  initialDraft,
  release,
}: {
  host: CzechNativeScreenProps;
  initialDraft?: CoAppingInvestmentBuyDraft | null;
  release?: CurrentScreenProps['release'];
}) {
  const currentHost = useCurrentInvestmentHost(host, release);
  return (
    <InvestmentMarket country={currentHost.country}>
      <InvestmentRuntime active={currentHost.isActive}>
        <BaselineInvestmentsController
          host={currentHost}
          initialDraft={
            initialDraft ?? readCzechInvestmentBuyDraft(host.route.params)
          }
        />
      </InvestmentRuntime>
    </InvestmentMarket>
  );
}
