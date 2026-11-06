import React from 'react';
import type { CoAppingInvestmentBuyDraft } from '@/features/investments/orders/buyOrder';
import BaselineInvestmentsController, {
  type BaselineInvestmentDetailRendererProps,
} from '../../../current/investments/baseline/Controller';
import { InvestmentMarket } from '../../../current/investments/Market';
import type { CurrentScreenProps } from '../../../current/contracts';
import { InvestmentRuntime } from './Runtime';
import { InvestmentInstrument } from './Instrument';
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
  const evoInstrumentRenderer =
    currentHost.release === 'release-future-evo-2027'
      ? ({
          security,
          onBack,
          onHistory,
          onBuy,
          onSell,
          hidden,
          transactions,
        }: BaselineInvestmentDetailRendererProps) => (
          <InvestmentInstrument
            security={security}
            onBack={onBack}
            onHistory={() => onHistory(security.title)}
            onBuy={onBuy}
            onSell={onSell}
            hidden={hidden}
            transactions={transactions}
          />
        )
      : undefined;
  return (
    <InvestmentMarket country={currentHost.country}>
      <InvestmentRuntime active={currentHost.isActive}>
        <BaselineInvestmentsController
          host={currentHost}
          renderInstrument={evoInstrumentRenderer}
          initialDraft={
            initialDraft ?? readCzechInvestmentBuyDraft(host.route.params)
          }
        />
      </InvestmentRuntime>
    </InvestmentMarket>
  );
}
