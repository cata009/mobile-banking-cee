import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useInvestmentBack } from '../investments/Runtime';
import { ScrollView } from 'react-native';
import {
  createRoboManagementState,
  roboManagementReducer,
} from '@/features/investments/robo/managementState';
import {
  getRoboInitialStartDate,
  isRoboFundingDateAllowed,
  parseRoboFundingDate,
  type RoboDemoClock,
} from '@/features/investments/robo/demoClock';
import { canReviewRoboTopUp } from '@/features/investments/robo/flowSelectors';
import {
  getFundingFieldVisibility,
  formatCzkInput,
  formatCzkInteger,
} from '@/features/investments/robo/model';
import {
  ROBO_FUNDING_OPTIONS,
  displayRoboAccountNumber,
} from '@/features/investments/robo/presentationData';
import {
  applyRoboTopUp,
  applyRoboSale,
} from '@/features/investments/robo/goalActions';
import { createRoboTradeEventId } from '@/features/investments/robo/operationContext';
import {
  getRoboGoalCurrentValue,
  getRoboWithdrawalProducts,
} from '@/features/investments/robo/goalModel';
import {
  getRoboGoalEndDate,
  localizeRoboBasketInstrument,
} from '@/features/investments/robo/goalPositions';
import type { InvestmentBasketFundHolding } from '@/app/config/investmentBasketFundsConfig';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import { HoldingDetails } from './HoldingDetails';
import {
  createRoboState,
  getRoboFlowView,
  roboReducer,
} from '@/features/investments/robo/flowState';
import { isValidRoboHorizon } from '@/features/investments/robo/validation';
import type { RoboAdvisorManagementMode } from '@/features/investments/robo/legacyFlowState';
import type {
  RoboExistingGoal,
  RoboPortfolio,
} from '@/features/investments/robo/types';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import type { CurrentAccount } from '@/data/products';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { FormField } from '../../../../../universal/FormField';
import { Select } from '../../../../../universal/Select';
import { DateField } from '../../../../../universal/DateField';
import {
  Button,
  Choice,
  Copy,
  Notice,
  Page,
  Row,
  czInvestmentTokens,
  ui,
} from '../investments/Primitives';
import { SellOrder } from '../investments/SellOrder';
import { Signing } from '../investments/Signing';
import { InvestmentHistory } from '../investments/History';
import { PlanFields } from './CreationScreens';

export function Management({
  goal,
  portfolio,
  mode,
  onMode,
  onBack,
  onExit,
  onGoalUpdated,
  currentAccounts,
  securityCatalog,
  clock,
  amountsHidden,
}: {
  goal: RoboExistingGoal;
  portfolio: RoboPortfolio;
  mode: Exclude<RoboAdvisorManagementMode, 'menu'>;
  onMode: (mode: RoboAdvisorManagementMode) => void;
  onBack: () => void;
  onExit: () => void;
  onGoalUpdated: (goal: RoboExistingGoal) => void;
  onGoalClosed?: (id: string) => void;
  currentAccounts: readonly CurrentAccount[];
  securityCatalog: readonly InvestmentCatalogSecurity[];
  clock: RoboDemoClock;
  amountsHidden: boolean;
  onOpenSecurity?: (security: InvestmentCatalogSecurity) => void;
}) {
  const seed = {
    mode,
    name: goal.name,
    date:
      goal.recurringContribution?.startDate &&
      isRoboFundingDateAllowed(goal.recurringContribution.startDate, clock)
        ? goal.recurringContribution.startDate
        : getRoboInitialStartDate(clock),
    goal,
  };
  const [state, dispatch] = useReducer(
    roboManagementReducer,
    seed,
    createRoboManagementState,
  );
  const [planState, dispatchPlan] = useReducer(roboReducer, goal, initial =>
    createRoboState(initial, clock),
  );
  const plan = getRoboFlowView(planState);
  const [accountId, setAccountId] = useState(currentAccounts[0]?.id ?? '');
  const [modelHolding, setModelHolding] =
    useState<InvestmentBasketFundHolding | null>(null);
  const [modelOpen, setModelOpen] = useState(false);
  const modelSecurity = modelHolding
    ? securityCatalog.find(
        candidate =>
          candidate.id === modelHolding.productId ||
          candidate.productId === modelHolding.productId ||
          candidate.title.trim().toLowerCase() ===
            modelHolding.title.trim().toLowerCase(),
      )
    : undefined;
  const selectedAccount =
    currentAccounts.find(account => account.id === accountId) ?? null;
  const currentSeed = useRef(seed);
  currentSeed.current = seed;
  useEffect(() => {
    dispatch({
      type: 'mode-entered',
      seed: currentSeed.current,
    });
  }, [mode]);
  useInvestmentBack(() => {
    if (mode === 'history') return false;
    if (mode === 'settings' && modelOpen) {
      setModelOpen(false);
      return true;
    }
    if (mode === 'add-money') {
      if (state.topUp.kind === 'sign') return false;
      if (state.topUp.kind === 'review') {
        dispatch({ type: 'top-up-back', to: 'amount' });
        return true;
      }
      if (state.topUp.kind === 'success') {
        onMode('menu');
        return true;
      }
    }
    if (mode === 'withdraw' && state.withdrawal.kind === 'selling')
      return false;
    onBack();
    return true;
  });
  const fields = getFundingFieldVisibility(state.topUp.method);
  const initial = fields.initialAmount ? Number(state.topUp.amount) : 0,
    monthly = fields.monthlyContribution
      ? Number(state.topUp.monthlyAmount)
      : 0;
  const canReview = canReviewRoboTopUp(
    state.topUp.method,
    initial,
    monthly,
    state.topUp.date,
    !!selectedAccount,
    clock,
  );
  const iso = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(date.getDate()).padStart(2, '0')}`;
  const fromIso = (value: string) => {
    const date = new Date(`${value}T12:00:00`);
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(date)
      : value;
  };
  const fundingDate = parseRoboFundingDate(state.topUp.date);
  const minimumDate = `${clock.referenceDay.year}-${String(
    clock.referenceDay.month,
  ).padStart(2, '0')}-${String(clock.referenceDay.day).padStart(2, '0')}`;
  const page = { onBack, onClose: onExit };
  if (mode === 'history')
    return (
      <InvestmentHistory
        onBack={onBack}
        transactions={goal.transactions ?? []}
        orders={goal.orders ?? []}
        initialTab={state.historyTab}
        hideCurrencyFilter
        hideAllTimeDateOption
        amountsHidden={amountsHidden}
        onTabChange={tab => dispatch({ type: 'history-tab-changed', tab })}
      />
    );
  if (mode === 'settings' && !modelOpen)
    return (
      <Page
        {...page}
        kind="settings"
        title="Goal settings"
        description="Update how the goal is displayed and tracked. A material change may require a new suitability check."
      >
        <Row
          title="Rename goal"
          subtitle="Change the name shown in Investments."
          onPress={() => onMode('rename')}
        />
        <Row
          title="Change goal plan"
          subtitle="Update your target amount and time horizon."
          onPress={() => onMode('goal-plan')}
        />
        <Row
          title="Model Portfolio"
          subtitle="View your selected basket and its product distribution."
          onPress={() => setModelOpen(true)}
        />
      </Page>
    );
  if (mode === 'rename')
    return (
      <Page
        {...page}
        kind="rename"
        title="Rename goal"
        description="Choose a name that will help you recognize this goal."
        footer={
          <Button
            label="Save name"
            disabled={!state.renameName.trim()}
            onPress={() => {
              onGoalUpdated({ ...goal, name: state.renameName.trim() });
              onMode('menu');
            }}
          />
        }
      >
        <FormField
          tokens={czInvestmentTokens}
          label="Goal name"
          value={state.renameName}
          onChange={value => dispatch({ type: 'rename-changed', value })}
          inputProps={{ maxLength: 100, returnKeyType: 'done' }}
        />
      </Page>
    );
  if (mode === 'goal-plan')
    return (
      <Page
        {...page}
        kind="manage-goal-plan"
        title="Set your goal plan"
        description="Choose a target amount and time horizon to shape your investment recommendation."
        contentTop={20}
        footer={
          <Button
            label="Save changes"
            disabled={
              !Number(plan.targetAmount) ||
              !isValidRoboHorizon(
                String(plan.horizonYears || plan.manualHorizon),
              )
            }
            onPress={() => {
              const years = plan.horizonYears || Number(plan.manualHorizon);
              onGoalUpdated({
                ...goal,
                targetInteger: formatCzkInteger(plan.targetAmount),
                targetDecimals: ',00 CZK',
                horizonYears: years,
                endDate: getRoboGoalEndDate(goal, years),
              });
              onMode('menu');
            }}
          />
        }
      >
        <PlanFields view={plan} dispatch={dispatchPlan} />
      </Page>
    );
  if (mode === 'add-money-basket' || (mode === 'settings' && modelOpen))
    return (
      <Page
        {...page}
        kind="model-portfolio"
        onBack={mode === 'settings' ? () => setModelOpen(false) : onBack}
        title={portfolio.name}
        description={
          portfolio.basketFund?.detailDescription ?? portfolio.description
        }
        footer={
          <Button label="Add money" onPress={() => onMode('add-money')} />
        }
      >
        <Row
          title="Basket ID"
          value={goal.basketId ?? portfolio.basketFund?.marketInfo.basketId}
        />
        <Row
          title="ISIN"
          value={goal.basketIsin ?? portfolio.basketFund?.marketInfo.basketIsin}
        />
        <Copy strong style={ui.section}>
          Portfolio composition
        </Copy>
        {portfolio.basketFund?.holdings.map((holding, index) => (
          <Row
            key={holding.productId ?? index}
            title={holding.title}
            value={`${holding.percent ?? 0}%`}
            label={`Open ${holding.title} product details`}
            onPress={() => setModelHolding(holding)}
          />
        ))}
        <ModalPanel
          tokens={czInvestmentTokens}
          title={modelHolding?.title ?? 'Product details'}
          visible={modelHolding !== null}
          onClose={() => setModelHolding(null)}
          closeLabel="Close holding details"
        >
          {modelHolding ? (
            <HoldingDetails
              holding={modelHolding}
              security={
                modelSecurity
                  ? localizeRoboBasketInstrument(modelSecurity, 'CZ', {
                      title: modelHolding.title,
                      productId: modelHolding.productId,
                    })
                  : null
              }
            />
          ) : null}
        </ModalPanel>
      </Page>
    );
  if (mode === 'close')
    return (
      <Page
        {...page}
        kind="close-goal"
        title="Close this goal?"
        description="Closing removes the goal from your active list, but its documents and history remain available."
        footer={
          <Button label="Close goal" disabled onPress={() => undefined} />
        }
      >
        <Notice text="Withdraw all holdings and wait for the sale orders to complete before closing the goal." />
      </Page>
    );
  if (mode === 'withdraw' && state.withdrawal.kind === 'selling')
    return (
      <SellOrder
        security={state.withdrawal.security}
        accounts={currentAccounts}
        hidden={amountsHidden}
        onBack={() => dispatch({ type: 'sale-cancelled' })}
        onComplete={execution => {
          const updated = applyRoboSale(
            goal,
            portfolio,
            getRoboGoalCurrentValue(goal),
            'CZ',
            securityCatalog,
            state.withdrawal.productId,
            execution,
            { id: createRoboTradeEventId(), date: new Date().toISOString() },
          );
          if (updated !== goal) onGoalUpdated(updated);
          dispatch({ type: 'sale-completed' });
          onMode('menu');
        }}
      />
    );
  if (mode === 'partial-withdrawal')
    return (
      <Page
        {...page}
        kind="partial-withdrawal"
        title="Choose withdrawal amount"
        description="Review the products you selected and choose how much to withdraw."
        footer={<Button label="Review sale orders" onPress={onBack} />}
      >
        <FormField
          tokens={czInvestmentTokens}
          label="Amount to withdraw"
          value={state.topUp.amount}
          onChange={value => dispatch({ type: 'amount-changed', value })}
          inputProps={{ keyboardType: 'number-pad' }}
        />
      </Page>
    );
  if (mode === 'full-withdrawal')
    return (
      <Page
        {...page}
        kind="full-withdrawal"
        title="Review sale orders"
        description="The selected products will be sold. The final amount may be lower than today’s value."
        footer={<Button label="Review sale orders" onPress={onBack} />}
      >
        <Notice text="This is not a guaranteed withdrawal amount." />
        <Row
          title="Estimated selected value"
          value={formatInvestmentMoney(0, 'CZ', 'CZK', amountsHidden)}
        />
      </Page>
    );
  if (mode === 'withdraw') {
    const products = getRoboWithdrawalProducts(
      portfolio,
      getRoboGoalCurrentValue(goal),
      'CZ',
      securityCatalog,
      goal.positions,
    ).filter(product => product.localValue > 0);
    return (
      <Page
        {...page}
        kind={mode}
        title="Withdraw money"
        description="Select an investment to start your sale. Review the quantity, estimated proceeds and order details before signing."
        contentTop={4}
      >
        {products.length ? (
          products.map(product => (
            <Row
              key={product.id}
              title={product.name}
              subtitle={
                product.security
                  ? `${product.security.quantity} PCS`
                  : 'Current quote unavailable'
              }
              value={formatInvestmentMoney(
                product.localValue,
                'CZ',
                'CZK',
                amountsHidden,
              )}
              onPress={
                product.security
                  ? () =>
                      dispatch({
                        type: 'sale-opened',
                        productId: product.id,
                        security: product.security!,
                      })
                  : undefined
              }
            />
          ))
        ) : (
          <Notice text="No investments to withdraw." />
        )}
      </Page>
    );
  }
  if (mode === 'add-money' && state.topUp.kind === 'sign')
    return (
      <Signing
        title="Confirm investment"
        pinLabel="Security code"
        pinHelper="Confirm this investment from your selected cash account. One basket order will be submitted for execution."
        actionLabel="Confirm investment"
        onBack={() => dispatch({ type: 'top-up-back', to: 'review' })}
        onExit={onExit}
        onSigned={() => {
          if (!canReview || !selectedAccount) return;
          onGoalUpdated(
            applyRoboTopUp(
              goal,
              portfolio,
              {
                method: state.topUp.method,
                initialAmount: initial,
                monthlyAmount: monthly,
                startDate: state.topUp.date,
                cashAccountId: selectedAccount.id,
              },
              'CZ',
              securityCatalog,
              { id: createRoboTradeEventId(), date: new Date().toISOString() },
            ),
          );
          dispatch({ type: 'top-up-submitted' });
        }}
      />
    );
  if (mode === 'add-money' && state.topUp.kind === 'success')
    return (
      <Page
        {...page}
        kind="top-up-success"
        title={
          state.topUp.method === 'regular'
            ? 'Monthly investment scheduled'
            : 'Add money request submitted'
        }
        footer={<Button label="Back to goal" onPress={() => onMode('menu')} />}
      >
        <Notice
          text={
            state.topUp.method === 'regular'
              ? 'Your monthly investment is scheduled. The goal value will change after the first basket order is executed.'
              : state.topUp.method === 'combined'
              ? 'Your basket order is pending and your monthly investment is scheduled. The goal value will update after the order is executed.'
              : 'Your basket order is pending. The goal value and positions will update after it is executed. You can follow its status in History.'
          }
        />
      </Page>
    );
  if (mode === 'add-money' && state.topUp.kind === 'review')
    return (
      <Page
        kind="top-up-review"
        title="Review investment"
        onBack={() => dispatch({ type: 'top-up-back', to: 'amount' })}
        onClose={onExit}
        footer={
          <Button
            label="Continue to sign"
            disabled={!canReview}
            onPress={() => dispatch({ type: 'top-up-sign-requested' })}
          />
        }
      >
        <Row title="Goal" subtitle={goal.name} />
        <Row title="Basket fund" subtitle={portfolio.name} />
        {fields.initialAmount ? (
          <Row
            title="Amount to add"
            value={
              amountsHidden ? '•••• CZK' : formatCzkInput(state.topUp.amount)
            }
          />
        ) : null}
        {fields.monthlyContribution ? (
          <>
            <Row
              title="Monthly contribution"
              value={
                amountsHidden
                  ? '•••• CZK'
                  : formatCzkInput(state.topUp.monthlyAmount)
              }
            />
            <Row title="Monthly contribution starts" value={state.topUp.date} />
          </>
        ) : null}
        <Row title="Cash account" subtitle={selectedAccount?.name} />
        <Notice text="The goal value will update after the order is executed." />
      </Page>
    );
  return (
    <Page
      {...page}
      kind={mode}
      title={
        mode === 'monthly'
          ? 'Manage monthly investment'
          : 'Add money to your goal'
      }
      description={
        mode === 'monthly'
          ? 'Change the amount or next date. Stopping monthly investments will not close your goal or sell existing holdings.'
          : 'Choose a one-off or monthly investment in your linked basket.'
      }
      contentTop={16}
      footer={
        <Button
          label={mode === 'monthly' ? 'Review changes' : 'Review investment'}
          disabled={mode === 'add-money' && !canReview}
          onPress={() => {
            if (mode === 'add-money')
              dispatch({ type: 'top-up-reviewed', valid: canReview });
            else onBack();
          }}
        />
      }
    >
      <ScrollView>
        {mode === 'add-money'
          ? ROBO_FUNDING_OPTIONS.map(option => (
              <Choice
                key={option.id}
                title={option.title}
                description={option.description}
                label={`${option.title}. ${option.description}`}
                selected={state.topUp.method === option.id}
                onPress={() =>
                  dispatch({ type: 'method-changed', method: option.id })
                }
              />
            ))
          : null}
        {fields.initialAmount && mode === 'add-money' ? (
          <FormField
            tokens={czInvestmentTokens}
            label={
              state.topUp.method === 'combined'
                ? 'Initial amount to add'
                : 'Amount to add'
            }
            value={state.topUp.amount}
            onChange={value =>
              dispatch({
                type: 'amount-changed',
                value: value.replace(/\D/g, ''),
              })
            }
            inputProps={{ keyboardType: 'number-pad' }}
          />
        ) : null}
        {fields.monthlyContribution || mode === 'monthly' ? (
          <>
            <FormField
              tokens={czInvestmentTokens}
              label="Monthly contribution"
              value={state.topUp.monthlyAmount}
              onChange={value =>
                dispatch({
                  type: 'monthly-amount-changed',
                  value: value.replace(/\D/g, ''),
                })
              }
              inputProps={{ keyboardType: 'number-pad' }}
            />
            <DateField
              tokens={czInvestmentTokens}
              label="Monthly contribution starts"
              value={fundingDate ? iso(fundingDate) : state.topUp.date}
              onChange={value =>
                dispatch({ type: 'date-changed', value: fromIso(value) })
              }
              min={minimumDate}
              locale="en-GB"
              error={
                !isRoboFundingDateAllowed(state.topUp.date, clock)
                  ? 'Choose today or a later date.'
                  : undefined
              }
            />
          </>
        ) : null}
        <Select
          tokens={czInvestmentTokens}
          label="Cash account"
          value={accountId}
          items={currentAccounts.map(account => ({
            value: account.id,
            label: `${account.name} · ${displayRoboAccountNumber(
              account.accountNumber,
              'CZ',
            )} · ${formatInvestmentMoney(
              account.balance,
              'CZ',
              account.currency,
              amountsHidden,
            )}`,
          }))}
          onChange={setAccountId}
          closeLabel="Close cash accounts"
        />
        {!currentAccounts.length ? (
          <Notice error text="No cash account is available." />
        ) : null}
      </ScrollView>
    </Page>
  );
}
