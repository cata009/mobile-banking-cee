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
import {
  Button as InvestmentButton,
  Copy,
  Loading,
  Page,
  ui,
} from '../investments/Primitives';
import { CreationScreens } from './CreationScreens';
import { GoalDetail } from './GoalDetail';
import { Management } from './Management';
import { FundingSetup } from './FundingSetup';
import { Projection } from './Projection';

function Button(props: React.ComponentProps<typeof InvestmentButton>) {
  return <InvestmentButton {...props} canonical />;
}

function RoboSurface({
  children,
  screenTopInset,
  backgroundColor,
}: {
  children: React.ReactNode;
  screenTopInset: number;
  backgroundColor: string;
}) {
  return (
    <View
      testID="cz-robo-surface"
      style={[
        roboStyles.surface,
        {
          marginTop: -screenTopInset,
          paddingTop: screenTopInset,
          backgroundColor,
        },
      ]}
    >
      {children}
    </View>
  );
}

export interface CzRoboFlowProps {
  onBack: () => void;
  onExit: () => void;
  initialGoal?: RoboExistingGoal;
  onGoalUpdated?: (goal: RoboExistingGoal) => void;
  onCreateGoal?: (goal: RoboExistingGoal) => void | Promise<void>;
  onProfile?: () => void;
  onGoalClosed?: (id: string) => void;
  currentAccounts?: readonly CurrentAccount[];
  securityCatalog?: readonly InvestmentCatalogSecurity[];
  demoClock?: RoboDemoClock;
  profileStatus?: RoboInvestorProfileStatus;
  availableStrategyCount?: 1 | 2 | 3;
  amountsHidden?: boolean;
  screenTopInset?: number;
  onOpenSecurity?: (security: InvestmentCatalogSecurity) => void;
  /** Canonical event replay for Source alternate/dormant state characterization; normal entry is intro. */
  initialEvents?: readonly RoboEvent[];
}
export function CzRoboFlow({
  onBack,
  onExit,
  initialGoal,
  onGoalUpdated,
  onCreateGoal,
  onProfile,
  onGoalClosed,
  currentAccounts = [DEFAULT_ROBO_CASH_ACCOUNT],
  securityCatalog = [],
  demoClock,
  profileStatus = 'valid',
  availableStrategyCount = 3,
  amountsHidden = false,
  screenTopInset = 0,
  onOpenSecurity,
  initialEvents = [],
}: CzRoboFlowProps) {
  const [clock] = useState(() => demoClock ?? getCurrentRoboDemoClock());
  const [basketDetailsOpen, setBasketDetailsOpen] = useState(false);
  const [state, dispatch] = useReducer(roboReducer, initialGoal, goal =>
    initialEvents.reduce(roboReducer, createRoboState(goal, clock)),
  );
  const createGoalHandler = useRef(onCreateGoal ?? onGoalUpdated);
  createGoalHandler.current = onCreateGoal ?? onGoalUpdated;
  const view = getRoboFlowView(state);
  const hydrated = useRef(new Set<string>());
  const goal = state.kind === 'creation' ? state.publishedGoal : state.goal;
  const processingGoal = state.kind === 'processing' ? state.goal : null;
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
    if (!processingGoal) return;
    let active = true;
    const timer = setTimeout(() => {
      Promise.resolve()
        .then(() => createGoalHandler.current?.(processingGoal))
        .then(() => {
          if (active) dispatch({ type: 'processing-completed' });
        })
        .catch(() => {
          if (active) dispatch({ type: 'processing-failed' });
        });
    }, 900);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [processingGoal]);
  const back = () => {
    if (state.kind === 'failure') {
      dispatch({ type: 'retry-creation' });
      return;
    }
    if (basketDetailsOpen) {
      setBasketDetailsOpen(false);
      return;
    }
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
      <RoboSurface screenTopInset={screenTopInset} backgroundColor="#FFFFFF">
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
            If you leave now, your progress will be lost and you’ll need to
            start again.
          </Copy>
        </Page>
      </RoboSurface>
    );
  if (view.step === 'sign')
    return (
      <RoboSurface screenTopInset={screenTopInset} backgroundColor="#FFFFFF">
        <Signing
          title="Sign"
          pinLabel="Enter pin code"
          pinHelper="Be sure that nobody is watching you"
          actionLabel="Sign"
          pinTopSpacing={132}
          pinFocused
          demoPresentation="face-id"
          canonicalControls
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
            dispatch({ type: 'creation-submitted', goal: next });
          }}
        />
      </RoboSurface>
    );
  if (state.kind === 'processing')
    return (
      <RoboSurface screenTopInset={screenTopInset} backgroundColor="#FFFFFF">
        <View style={[ui.page, roboStyles.processing]} testID="cz-processing">
          <Loading
            text="We’re setting up your goal"
            size={100}
            indicatorAsset={investmentAssets.goalProgress}
            labelStyle={roboStyles.processingTitle}
            containerStyle={roboStyles.processingIndicator}
          />
          <Copy style={roboStyles.processingCopy}>
            We’re opening the investment account and sending your portfolio
            orders.
          </Copy>
          <Copy style={roboStyles.processingCopy}>
            Please keep the app open.
          </Copy>
        </View>
      </RoboSurface>
    );
  if (state.kind === 'failure')
    return (
      <RoboSurface screenTopInset={screenTopInset} backgroundColor="#FFFFFF">
        <Page
          kind="creation-failed"
          title="We couldn’t finish setting up your goal"
          onBack={back}
          showBack={false}
          contentTop={0}
          footer={<Button label="Review and try again" onPress={back} />}
        >
          <View style={roboStyles.failureArtwork}>
            <AssetGlyph
              asset={investmentAssets.goalCreationFailure}
              width={120}
              height={120}
            />
          </View>
          <Copy style={roboStyles.successCopy}>
            Your goal could not be created please restart the process
          </Copy>
        </Page>
      </RoboSurface>
    );
  if (state.kind === 'success')
    return (
      <RoboSurface screenTopInset={screenTopInset} backgroundColor="#FFFFFF">
        <Page
          kind="success"
          title="Your goal is ready"
          contentTop={24}
          onBack={onBack}
          showBack={false}
          footer={
            <View style={roboStyles.successFooter}>
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
                onPress={() =>
                  dispatch({ type: 'navigate', to: 'goal-detail' })
                }
              />
            </View>
          }
        >
          <View style={roboStyles.successContent}>
            <View style={roboStyles.successArtwork}>
              <AssetGlyph
                asset={investmentAssets.goalCreated}
                width={343}
                height={160}
              />
            </View>
            <Copy style={roboStyles.successCopy}>
              Give your goal a head start
            </Copy>
            <Copy style={roboStyles.successCopy}>
              Start investing towards{' '}
              <Copy strong style={roboStyles.successCopy}>
                {state.goal.name}
              </Copy>{' '}
              with a one-off contribution or a monthly plan that fits your life.
            </Copy>
            <Copy style={roboStyles.successCopy}>
              You’ll review the amount before confirming.
            </Copy>
          </View>
        </Page>
      </RoboSurface>
    );
  if ((state.kind === 'detail' || state.kind === 'management') && goal) {
    if (state.kind === 'management') {
      const management = (
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
        <RoboSurface screenTopInset={screenTopInset} backgroundColor="#FFFFFF">
          {management}
        </RoboSurface>
      );
    }
    return (
      <RoboSurface screenTopInset={screenTopInset} backgroundColor="#FFFFFF">
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
      </RoboSurface>
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
    <RoboSurface
      screenTopInset={screenTopInset}
      backgroundColor={view.step === 'contact' ? '#F5F5F5' : '#FFFFFF'}
    >
      <CreationScreens
        view={view}
        dispatch={dispatch}
        onBack={back}
        onExit={exit}
        profileStatus={profileStatus}
        availableStrategyCount={availableStrategyCount}
        securityCatalog={securityCatalog}
        onProfile={onProfile}
        screenTopInset={screenTopInset}
        basketDetailsOpen={basketDetailsOpen}
        onBasketDetailsOpen={() => setBasketDetailsOpen(true)}
        onBasketDetailsClose={() => setBasketDetailsOpen(false)}
      />
    </RoboSurface>
  );
}
const roboStyles = StyleSheet.create({
  surface: { flex: 1 },
  quitArtwork: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  quitCopy: { fontSize: 18, lineHeight: 24, letterSpacing: 0.3 },
  processing: { paddingTop: 112, gap: 24 },
  processingIndicator: { padding: 0, gap: 24 },
  processingTitle: {
    fontSize: 28,
    lineHeight: 31,
    textAlign: 'center',
    paddingHorizontal: 24,
    letterSpacing: 0.3,
  },
  processingCopy: {
    fontSize: 18,
    lineHeight: 24,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  successContent: { gap: 24 },
  successFooter: { gap: 8 },
  successCopy: { fontSize: 18, lineHeight: 21 },
  successArtwork: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failureArtwork: {
    height: 160,
    marginTop: -12,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
