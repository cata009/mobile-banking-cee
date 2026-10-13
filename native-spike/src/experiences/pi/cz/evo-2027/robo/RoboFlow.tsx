import React, { useEffect, useReducer, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { investmentAssets } from '../investments/assets';
import { useInvestmentBack } from '../investments/Runtime';
import {
  createRoboState,
  getRoboFlowView,
  roboReducer,
  type RoboEvent,
} from '@/features/investments/robo/flowState';
import {
  getRoboAdvisorBackStep,
  getPreviousManagementMode,
} from '@/features/investments/robo/legacyFlowState';
import {
  getCurrentRoboDemoClock,
  type RoboDemoClock,
} from '@/features/investments/robo/demoClock';
import { buildInitialRoboGoal } from '@/features/investments/robo/goalModel';
import { formatCzkInteger } from '@/features/investments/robo/model';
import {
  formatRoboGoalDate,
  parseRoboCalendarDate,
  getRoboGoalEndDateFromStart,
} from '@/features/investments/robo/goalPositions';
import { DEFAULT_ROBO_CASH_ACCOUNT } from '@/features/investments/robo/presentationData';
import { createRoboTradeEventId } from '@/features/investments/robo/operationContext';
import { hydrateRoboGoal } from '@/features/investments/robo/goalHydration';
import type {
  RoboExistingGoal,
  RoboInvestorProfileStatus,
} from '@/features/investments/robo/types';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import type { CurrentAccount } from '@/data/products';
import { Signing } from '../investments/Signing';
import { Button, Copy, Loading, Page, ui } from '../investments/Primitives';
import { CreationScreens } from './CreationScreens';
import { GoalDetail } from './GoalDetail';
import { Management } from './Management';
import { FundingSetup } from './FundingSetup';
import { Projection } from './Projection';

export interface CzRoboFlowProps {
  onBack: () => void;
  onExit: () => void;
  initialGoal?: RoboExistingGoal;
  onGoalUpdated?: (goal: RoboExistingGoal) => void;
  onGoalClosed?: (id: string) => void;
  currentAccounts?: readonly CurrentAccount[];
  securityCatalog?: readonly InvestmentCatalogSecurity[];
  demoClock?: RoboDemoClock;
  profileStatus?: RoboInvestorProfileStatus;
  availableStrategyCount?: 1 | 2 | 3;
  amountsHidden?: boolean;
  onOpenSecurity?: (security: InvestmentCatalogSecurity) => void;
  /** Canonical event replay for Source alternate/dormant state characterization; normal entry is intro. */
  initialEvents?: readonly RoboEvent[];
}
export function CzRoboFlow({
  onBack,
  onExit,
  initialGoal,
  onGoalUpdated,
  onGoalClosed,
  currentAccounts = [DEFAULT_ROBO_CASH_ACCOUNT],
  securityCatalog = [],
  demoClock,
  profileStatus = 'valid',
  availableStrategyCount = 3,
  amountsHidden = false,
  onOpenSecurity,
  initialEvents = [],
}: CzRoboFlowProps) {
  const [clock] = useState(() => demoClock ?? getCurrentRoboDemoClock());
  const [state, dispatch] = useReducer(roboReducer, initialGoal, goal =>
    initialEvents.reduce(roboReducer, createRoboState(goal, clock)),
  );
  const view = getRoboFlowView(state);
  const hydrated = useRef(new Set<string>());
  const goal = state.kind === 'creation' ? state.publishedGoal : state.goal;
  const publish = (next: RoboExistingGoal) => {
    dispatch({ type: 'goal-updated', goal: next });
    onGoalUpdated?.(next);
  };
  useEffect(() => {
    if (initialGoal)
      dispatch({ type: 'incoming-goal-changed', goal: initialGoal });
  }, [initialGoal]);
  useEffect(() => {
    if (
      !goal ||
      !view.selectedPortfolio?.basketFund ||
      hydrated.current.has(goal.id)
    )
      return;
    hydrated.current.add(goal.id);
    const next = hydrateRoboGoal(
      goal,
      view.selectedPortfolio.basketFund,
      'CZ',
      securityCatalog,
    );
    if (next !== goal) {
      dispatch({ type: 'goal-updated', goal: next });
      onGoalUpdated?.(next);
    }
  }, [goal, view.selectedPortfolio, securityCatalog, onGoalUpdated]);
  useEffect(() => {
    if (state.kind !== 'processing') return;
    const timer = setTimeout(
      () => dispatch({ type: 'processing-completed' }),
      900,
    );
    return () => clearTimeout(timer);
  }, [state.kind]);
  const back = () => {
    if (state.kind === 'creation' && state.quitOpen) {
      dispatch({ type: 'quit-resumed' });
      return;
    }
    if (state.kind === 'management')
      dispatch({
        type: 'management-opened',
        mode: getPreviousManagementMode(state.management),
      });
    else if (state.kind === 'detail') onBack();
    else {
      const to = getRoboAdvisorBackStep(view, true);
      if (to) dispatch({ type: 'navigate', to });
      else onBack();
    }
  };
  useInvestmentBack(() => {
    back();
    return true;
  });
  const exit = () => {
    if (goal) onExit();
    else dispatch({ type: 'quit-requested' });
  };
  if (state.kind === 'creation' && state.quitOpen)
    return (
      <Page
        kind="quit"
        title="Are you sure you want to quit?"
        onBack={() => dispatch({ type: 'quit-resumed' })}
        footer={
          <>
            <Button
              label="Continue"
              onPress={() => dispatch({ type: 'quit-resumed' })}
            />
            <Button label="Close the flow" secondary onPress={onExit} />
          </>
        }
      >
        <View style={roboStyles.quitArtwork}>
          <AssetGlyph asset={investmentAssets.quit} size={100} />
        </View>
        <Copy style={roboStyles.quitCopy}>
          If you leave now, your progress will be lost and you’ll need to start
          again.
        </Copy>
      </Page>
    );
  if (view.step === 'sign')
    return (
      <Signing
        title="Sign goal"
        pinLabel="Security code"
        pinHelper="Confirm securely to open your goal. You can place the first basket top-up after the goal is ready."
        actionLabel="Sign goal"
        onBack={back}
        onExit={exit}
        onSigned={() => {
          const portfolio = view.selectedPortfolio;
          if (!portfolio?.basketFund) return;
          const start = formatRoboGoalDate(
            parseRoboCalendarDate(view.startDate),
          );
          const next = buildInitialRoboGoal(
            portfolio,
            {
              id: `goal-${createRoboTradeEventId()}`,
              name: view.goalName.trim() || portfolio.name,
              purpose: view.goalType || 'General build-up wealth',
              currentInteger: '0',
              currentDecimals: ',00 CZK',
              returnLabel: '0 total return',
              returnTone: 'neutral',
              targetInteger: formatCzkInteger(view.targetAmount || '0'),
              targetDecimals: ',00 CZK',
              horizonYears: view.horizonYears || Number(view.manualHorizon),
              startDate: start,
              endDate: getRoboGoalEndDateFromStart(
                start,
                view.horizonYears || Number(view.manualHorizon),
              ),
            },
            0,
            'CZ',
            securityCatalog,
            { date: new Date().toISOString() },
          );
          publish(next);
          dispatch({ type: 'navigate', to: 'processing' });
        }}
      />
    );
  if (state.kind === 'processing')
    return (
      <View style={ui.page} testID="cz-processing">
        <Loading text="We’re setting up your goal" />
      </View>
    );
  if (state.kind === 'success')
    return (
      <Page
        kind="success"
        title="Your goal is ready"
        onBack={onBack}
        footer={
          <>
            <Button
              label="Add money"
              onPress={() => {
                dispatch({ type: 'navigate', to: 'goal-detail' });
                dispatch({ type: 'management-opened', mode: 'add-money' });
              }}
            />
            <Button
              label="View goal"
              secondary
              onPress={() => dispatch({ type: 'navigate', to: 'goal-detail' })}
            />
          </>
        }
      >
        <Copy strong>Give your goal a head start</Copy>
        <Copy>
          Start investing towards {state.goal.name} with a one-off contribution
          or a monthly plan that fits your life.
        </Copy>
        <Copy>You’ll review the amount before confirming.</Copy>
      </Page>
    );
  if ((state.kind === 'detail' || state.kind === 'management') && goal) {
    if (state.kind === 'management')
      return (
        <Management
          goal={goal}
          portfolio={state.portfolio}
          mode={state.management}
          onMode={mode => dispatch({ type: 'management-opened', mode })}
          onBack={back}
          onExit={onExit}
          onGoalUpdated={publish}
          onGoalClosed={onGoalClosed}
          currentAccounts={currentAccounts}
          securityCatalog={securityCatalog}
          clock={clock}
          amountsHidden={amountsHidden}
          onOpenSecurity={onOpenSecurity}
        />
      );
    return (
      <GoalDetail
        goal={goal}
        portfolio={state.portfolio}
        onBack={onBack}
        onExit={onExit}
        onAction={mode => dispatch({ type: 'management-opened', mode })}
        securityCatalog={securityCatalog}
        clock={clock}
        amountsHidden={amountsHidden}
        onOpenSecurity={onOpenSecurity}
      />
    );
  }
  if (view.step === 'funding-setup')
    return (
      <FundingSetup
        view={view}
        dispatch={dispatch}
        onBack={back}
        onExit={exit}
        accounts={currentAccounts}
        clock={clock}
        hidden={amountsHidden}
      />
    );
  if (view.step === 'projection')
    return (
      <Projection view={view} dispatch={dispatch} onBack={back} onExit={exit} />
    );
  return (
    <CreationScreens
      view={view}
      dispatch={dispatch}
      onBack={back}
      onExit={exit}
      profileStatus={profileStatus}
      availableStrategyCount={availableStrategyCount}
      securityCatalog={securityCatalog}
    />
  );
}
const roboStyles = StyleSheet.create({
  quitArtwork: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  quitCopy: { fontSize: 18, lineHeight: 24, letterSpacing: 0.3 },
});
