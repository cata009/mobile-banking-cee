import React, { useMemo, useSyncExternalStore } from 'react';
import type { CzechNativeAdapter, CzechNativeScreenProps } from '../contracts';
import {
  getCzRoboPersistenceError,
  readCzRoboGoals,
  saveCzRoboGoal,
  subscribeCzRoboGoals,
} from '../robo/session';
import { CzInvestmentsScreen } from './InvestmentsScreen';
import { createCzInvestmentSnapshot } from './model';
import { InvestmentRuntime } from './Runtime';

function InvestmentsAdapterScreen(props: CzechNativeScreenProps) {
  const snapshot = useMemo(
    () => createCzInvestmentSnapshot(props.productCounts),
    [props.productCounts],
  );
  const goals = useSyncExternalStore(subscribeCzRoboGoals, readCzRoboGoals);
  const initialGoal = props.route.params?.goalId
    ? goals.find(goal => goal.id === props.route.params!.goalId)
    : undefined;
  return (
    <InvestmentRuntime active={props.isActive ?? true}>
      <CzInvestmentsScreen
        key={`${props.route.screen}-${
          props.route.params?.securityId ??
          props.route.params?.goalId ??
          props.route.params?.view ??
          ''
        }`}
        snapshot={snapshot}
        onBack={props.onBack}
        amountsHidden={props.amountsHidden}
        goals={goals}
        persistenceMessage={getCzRoboPersistenceError()}
        initialSecurityId={
          props.route.screen === 'investment-detail'
            ? props.route.params?.securityId
            : undefined
        }
        initialGoal={initialGoal}
        initialView={
          props.route.screen === 'investment-history'
            ? props.route.params?.view === 'bulk-approval'
              ? 'bulk-approval'
              : props.route.params?.view === 'approvals'
              ? 'approvals'
              : 'history'
            : props.route.screen === 'robo'
            ? props.route.params?.view === 'create'
              ? 'create'
              : 'goals'
            : 'portfolio'
        }
        onGoalUpdated={goal => {
          saveCzRoboGoal(goal);
          props.onChanged();
        }}
      />
    </InvestmentRuntime>
  );
}
export const CZECH_INVESTMENTS_ADAPTER: CzechNativeAdapter = {
  id: 'cz-evo-investments-robo',
  screens: {
    investments: InvestmentsAdapterScreen,
    'investment-history': InvestmentsAdapterScreen,
    'investment-detail': InvestmentsAdapterScreen,
    robo: InvestmentsAdapterScreen,
  },
  searchEntries: ({ productCounts }) => [
    {
      id: 'cz-investments',
      label: 'Investments',
      keywords: ['portfolio', 'investments'],
      target: { screen: 'investments' },
    },
    {
      id: 'cz-investment-history',
      label: 'Investment history',
      keywords: ['transactions', 'orders', 'investment'],
      target: { screen: 'investment-history' },
    },
    {
      id: 'cz-investment-goals',
      label: 'Your investment goals',
      keywords: ['robo', 'goals', 'investments'],
      target: { screen: 'robo' },
    },
    ...createCzInvestmentSnapshot(productCounts).catalog.map(security => ({
      id: `cz-investment-${security.id}`,
      label: security.title,
      subtitle: security.productId,
      keywords: [
        security.productType,
        security.assetClass,
        security.instrumentCurrency,
        'investment',
      ],
      target: {
        screen: 'investment-detail' as const,
        params: { securityId: security.id },
      },
    })),
  ],
};
