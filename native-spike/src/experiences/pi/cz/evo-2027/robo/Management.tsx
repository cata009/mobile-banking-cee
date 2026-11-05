import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useInvestmentBack } from '../investments/Runtime';
import { StyleSheet, View } from 'react-native';
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
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { SourceBottomSheet } from '../../../../../universal/SourceBottomSheet';
import { HoldingDetails } from './HoldingDetails';
import { BasketDetails } from './BasketDetails';
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
import fundingRadioSelected from '@/assets/investments/robo/funding-radio-selected.svg';
import fundingRadioUnselected from '@/assets/investments/robo/funding-radio-unselected.svg';
import fundingChevronDown from '@/assets/investments/robo/funding-chevron-down.svg';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { FormField } from '../../../../../universal/FormField';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { BaselineAmountField } from '../../../../../universal/BaselineAmountField';
import { BaselinePill } from '../../../../../universal/BaselinePill';
import { BaselineBottomSheet } from '../../../../../universal/BaselineBottomSheet';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import {
  CalendarPanel,
  DateField,
  displayIsoDate,
} from '../../../../../universal/DateField';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { BaselineInvestmentHistory } from '../../../current/investments/baseline/flows/History';
import {
  Button,
  Choice,
  Copy,
  Notice,
  Page,
  Row,
  czInvestmentTokens,
} from '../investments/Primitives';
import { SellOrder } from '../investments/SellOrder';
import { Signing } from '../investments/Signing';
import { OrderDocuments } from '../investments/OrderDocuments';
import { useCurrentInvestmentHost } from '../investments/hostAdapter';
import { DEFAULT_CZECH_COUNTS } from '../contracts';
import { PlanFields } from './CreationScreens';
import { BaselineStandardSuccess } from '../../../../../universal/BaselineStandardSuccess';

function FundingAmount({
  label,
  value,
  onChange,
  suggestions,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: readonly string[];
}) {
  return (
    <View style={fundingStyles.amountBlock}>
      <BaselineAmountField
        label={label}
        value={value || '0'}
        onChange={next => onChange(next.replace(/\D/g, ''))}
        currency="CZK"
        currencyPresentation="suffix"
        inputMode="numeric"
      />
      <View style={fundingStyles.suggestions}>
        {suggestions.map(amount => {
          const selected = Number(value) === Number(amount);
          return (
            <BaselinePill
              key={amount}
              label={`${formatCzkInteger(amount)} CZK`}
              presentation="navigation"
              variant={selected ? 'primary' : 'secondary'}
              selected={selected}
              onPress={() => onChange(amount)}
              style={[
                fundingStyles.suggestion,
                selected && fundingStyles.selectedSuggestion,
              ]}
              labelStyle={[
                fundingStyles.suggestionLabel,
                selected && fundingStyles.selectedSuggestionLabel,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

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
  screenTopInset = 0,
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
  screenTopInset?: number;
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
  const [topUpTermsAccepted, setTopUpTermsAccepted] = useState(false);
  const [planState, dispatchPlan] = useReducer(roboReducer, goal, initial =>
    createRoboState(initial, clock),
  );
  const plan = getRoboFlowView(planState);
  const [accountId, setAccountId] = useState(currentAccounts[0]?.id ?? '');
  const [draftAccountId, setDraftAccountId] = useState(accountId);
  const { width, height } = useDemoViewport();
  const closeCashAccounts = useCallback(
    () => dispatch({ type: 'account-sheet-toggled', open: false }),
    [],
  );
  const closeStartDate = useCallback(
    () => dispatch({ type: 'date-picker-toggled', open: false }),
    [],
  );
  const openStartDate = () =>
    dispatch({ type: 'date-picker-toggled', open: true });
  const openCashAccounts = () => {
    setDraftAccountId(accountId);
    dispatch({ type: 'account-sheet-toggled', open: true });
  };
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
  const historyBackHandler = useRef<(() => boolean) | null>(null);
  const registerHistoryBackHandler = useCallback(
    (handler: (() => boolean) | null) => {
      historyBackHandler.current = handler;
    },
    [],
  );
  const historyHost = useCurrentInvestmentHost(
    {
      route: { screen: 'robo' },
      scenario: 'active',
      language: 'en',
      mode: 'light',
      productCounts: DEFAULT_CZECH_COUNTS,
      amountsHidden,
      screenTopInset,
      isActive: true,
      onBack,
      onNavigate: () => undefined,
      onProfile: () => undefined,
      onSearch: () => undefined,
      onAmountsToggle: () => undefined,
      onChanged: () => undefined,
      onBackHandlerChange: registerHistoryBackHandler,
    },
    'release-future-evo-2027',
  );
  const currentSeed = useRef(seed);
  currentSeed.current = seed;
  useEffect(() => {
    dispatch({
      type: 'mode-entered',
      seed: currentSeed.current,
    });
    if (mode === 'add-money') setTopUpTermsAccepted(false);
  }, [mode]);
  useInvestmentBack(() => {
    if (state.recurringDatePickerOpen) {
      closeStartDate();
      return true;
    }
    if (state.cashAccountSheetOpen) {
      closeCashAccounts();
      return true;
    }
    if (mode === 'history') return historyBackHandler.current?.() ?? false;
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
      <BaselineInvestmentHistory
        host={historyHost}
        onBack={onBack}
        transactions={goal.transactions ?? []}
        orders={goal.orders ?? []}
        initialTab={state.historyTab}
        hideCurrencyFilter
        hideAllTimeDateOption
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
        gutter={16}
        descriptionGutter={24}
        contentGutter={24}
        contentTop={0}
      >
        <BaselineNavigationRow
          title="Rename goal"
          description="Change the name shown in Investments."
          rowHeight={80}
          trailingAccessory="chevron"
          chevronIconName="chevron-link"
          style={managementStyles.settingsRow}
          onPress={() => onMode('rename')}
        />
        <BaselineNavigationRow
          title="Change goal plan"
          description="Update your target amount and time horizon."
          rowHeight={80}
          trailingAccessory="chevron"
          chevronIconName="chevron-link"
          style={managementStyles.settingsRow}
          onPress={() => onMode('goal-plan')}
        />
        <BaselineNavigationRow
          title="Model Portfolio"
          description="View your selected basket and its product distribution."
          rowHeight={80}
          trailingAccessory="chevron"
          chevronIconName="chevron-link"
          style={managementStyles.settingsRow}
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
      <BasketDetails
        portfolio={portfolio}
        kind="model-portfolio"
        onBack={mode === 'settings' ? () => setModelOpen(false) : onBack}
        onClose={onExit}
        onOpenHolding={setModelHolding}
        marketInfo={{
          basketId: goal.basketId ?? portfolio.basketFund?.marketInfo.basketId,
          basketIsin:
            goal.basketIsin ?? portfolio.basketFund?.marketInfo.basketIsin,
        }}
        holdingSheet={
          modelHolding ? (
            <SourceBottomSheet
              title={modelHolding.title}
              stickyHeader
              maxHeightOffsetPx={72}
              onClose={() => setModelHolding(null)}
            >
              <HoldingDetails
                key={modelHolding.productId ?? modelHolding.title}
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
            </SourceBottomSheet>
          ) : null
        }
      />
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
        onBack={onBack}
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
          <View testID="cz-withdraw-empty">
            <Copy>No investments to withdraw.</Copy>
          </View>
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
        pinTopSpacing={132}
        pinFocused
        canonicalControls
        demoBypass
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
      <BaselineStandardSuccess
        title={
          state.topUp.method === 'regular'
            ? 'Monthly investment scheduled'
            : 'Add money request submitted'
        }
        message={
          state.topUp.method === 'regular'
            ? 'Your monthly investment is scheduled. The goal value will change after the first basket order is executed.'
            : state.topUp.method === 'combined'
              ? 'Your basket order is pending and your monthly investment is scheduled. The goal value will update after the order is executed.'
              : 'Your basket order is pending. The goal value and positions will update after it is executed. You can follow its status in History.'
        }
        actionLabel="Ok, I got it"
        onDone={() => onMode('menu')}
        testID="cz-top-up-success"
      />
    );
  if (mode === 'add-money' && state.topUp.kind === 'review')
    return (
      <Page
        kind="top-up-review"
        title="Review Data"
        onBack={() => {
          setTopUpTermsAccepted(false);
          dispatch({ type: 'top-up-back', to: 'amount' });
        }}
        onClose={onExit}
        footer={
          <Button
            label={fields.initialAmount ? 'Buy' : 'Set up monthly investment'}
            disabled={!canReview || !topUpTermsAccepted}
            onPress={() => dispatch({ type: 'top-up-sign-requested' })}
          />
        }
      >
        <ReviewSectionHeading title="ORDER SUMMARY" />
        <Row
          title="Product"
          subtitle={portfolio.basketFund?.title ?? portfolio.name}
        />
        <Row
          title="Product ID"
          subtitle={
            portfolio.basketFund?.marketInfo.basketIsin ??
            goal.basketIsin ??
            'Not available'
          }
        />
        <Row
          title="Order type"
          value={fields.initialAmount ? 'One off BUY' : 'Monthly BUY'}
        />
        {fields.initialAmount ? (
          <>
            <Row title="Execution" value="Next available market session" />
            <Row
              title="Estimated amount"
              value={formatInvestmentMoney(initial, 'CZ', 'CZK', amountsHidden)}
            />
          </>
        ) : null}
        {fields.monthlyContribution ? (
          <>
            {!fields.initialAmount ? (
              <Row title="Frequency" value="Monthly" />
            ) : null}
            <Row
              title="Monthly contribution"
              value={formatInvestmentMoney(monthly, 'CZ', 'CZK', amountsHidden)}
            />
            <Row title="Monthly contribution starts" value={state.topUp.date} />
          </>
        ) : null}
        <ReviewSectionHeading title="ACCOUNTS" />
        <Row title="Cash account" subtitle={selectedAccount?.name} />
        <OrderDocuments currency="CZK" />
        <Choice
          title="I have read and accept the terms and conditions."
          label="Accept terms and conditions"
          selected={topUpTermsAccepted}
          onPress={() => setTopUpTermsAccepted(value => !value)}
        />
        <Notice text="The goal value will update after the order is executed." />
      </Page>
    );
  return (
    <>
      <Page
        {...page}
        kind={mode}
        title={
          mode === 'monthly'
            ? 'Manage monthly investment'
            : state.topUp.method === 'one-off'
              ? 'Add money to your goal'
              : 'Choose how to invest'
        }
        description={
          mode === 'monthly'
            ? 'Change the amount or next date. Stopping monthly investments will not close your goal or sell existing holdings.'
            : 'Choose one option. You can invest once, monthly, or combine both.'
        }
        descriptionStyle={
          mode === 'add-money' ? fundingStyles.description : undefined
        }
        contentTop={mode === 'add-money' ? 32 : 16}
        footer={
          <Button
            canonical={mode === 'add-money'}
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
        <View style={mode === 'add-money' ? fundingStyles.form : undefined}>
          {mode === 'add-money' ? (
            <View
              role="radiogroup"
              accessibilityLabel="Contribution plan"
              style={fundingStyles.contributionOptions}
            >
              {ROBO_FUNDING_OPTIONS.map(option => (
                <Choice
                  key={option.id}
                  variant="radio"
                  radioSize={32}
                  radioIcon={
                    <AssetGlyph
                      asset={
                        state.topUp.method === option.id
                          ? fundingRadioSelected
                          : fundingRadioUnselected
                      }
                      size={32}
                    />
                  }
                  title={option.title}
                  description={option.description}
                  label={`${option.title}. ${option.description}`}
                  selected={state.topUp.method === option.id}
                  style={fundingStyles.contributionOption}
                  titleStyle={fundingStyles.contributionTitle}
                  descriptionStyle={fundingStyles.contributionDescription}
                  onPress={() =>
                    dispatch({ type: 'method-changed', method: option.id })
                  }
                />
              ))}
            </View>
          ) : null}
          <View style={mode === 'add-money' ? fundingStyles.fields : undefined}>
            {fields.initialAmount && mode === 'add-money' ? (
              <FundingAmount
                label="Amount to invest now"
                value={state.topUp.amount}
                onChange={value =>
                  dispatch({
                    type: 'amount-changed',
                    value,
                  })
                }
                suggestions={['25000', '35000', '50000']}
              />
            ) : null}
            {fields.monthlyContribution || mode === 'monthly' ? (
              <>
                {mode === 'add-money' ? (
                  <FundingAmount
                    label="Monthly contribution"
                    value={state.topUp.monthlyAmount}
                    onChange={value =>
                      dispatch({ type: 'monthly-amount-changed', value })
                    }
                    suggestions={['500', '1000', '2000']}
                  />
                ) : (
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
                )}
                {mode === 'monthly' ? (
                  <DateField
                    tokens={czInvestmentTokens}
                    label="Monthly contribution starts"
                    value={fundingDate ? iso(fundingDate) : state.topUp.date}
                    calendarIcon={
                      <SourceCustomIcon name="insurance-calendar" size={32} />
                    }
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
                ) : state.topUp.method === 'regular' ? (
                  <View style={fundingStyles.dateField}>
                    <BaselineTextField
                      label="Start date"
                      ariaLabel="Select start date"
                      value={displayIsoDate(
                        fundingDate ? iso(fundingDate) : state.topUp.date,
                      )}
                      onChange={() => undefined}
                      readOnly
                      trailingIconName="prime-book-appointment"
                      trailingIconSize={24}
                      trailingIconLayout="compact"
                      trailingIconAction={{
                        ariaLabel: 'Select start date',
                        onClick: openStartDate,
                      }}
                      onActivate={openStartDate}
                      selectionControl={{
                        expanded: state.recurringDatePickerOpen,
                        onPress: openStartDate,
                      }}
                      errorText={
                        !isRoboFundingDateAllowed(state.topUp.date, clock)
                          ? 'Choose today or a later date.'
                          : undefined
                      }
                    />
                  </View>
                ) : null}
              </>
            ) : null}
            <View>
              {mode === 'add-money' ? (
                <View style={fundingStyles.accountIntroduction}>
                  <Copy strong style={fundingStyles.accountHeading}>
                    Choose the account to use
                  </Copy>
                  <Copy style={fundingStyles.accountExplanation}>
                    We’ll use this account for your first and future
                    investments.
                  </Copy>
                </View>
              ) : null}
              {selectedAccount ? (
                <View
                  style={
                    mode === 'add-money'
                      ? fundingStyles.accountField
                      : undefined
                  }
                >
                  <BaselineTextField
                    label="Cash Account"
                    ariaLabel={`Cash account, ${selectedAccount.name}`}
                    value={displayRoboAccountNumber(
                      selectedAccount.accountNumber,
                      'CZ',
                    )}
                    onChange={() => undefined}
                    readOnly
                    trailingIcon={
                      <AssetGlyph asset={fundingChevronDown} size={32} />
                    }
                    trailingIconSize={32}
                    helperText={selectedAccount.name}
                    helperText2={`Available balance ${formatInvestmentMoney(
                      selectedAccount.balance,
                      'CZ',
                      selectedAccount.currency,
                      amountsHidden,
                    )}`}
                    onActivate={openCashAccounts}
                    selectionControl={{
                      expanded: state.cashAccountSheetOpen,
                      onPress: openCashAccounts,
                    }}
                  />
                </View>
              ) : null}
              {!currentAccounts.length ? (
                <Notice error text="No cash account is available." />
              ) : null}
            </View>
          </View>
        </View>
      </Page>
      {state.recurringDatePickerOpen ? (
        <ModalPortal
          visible
          transparent
          animationType="none"
          onRequestClose={closeStartDate}
        >
          <BaselineBottomSheet
            title="Select start date"
            closeLabel="Close calendar"
            onClose={closeStartDate}
            width={width}
            height={height}
          >
            <CalendarPanel
              tokens={czInvestmentTokens}
              compact
              locale="en-GB"
              value={fundingDate ? iso(fundingDate) : ''}
              min={minimumDate}
              previousIcon={
                <SourceCustomIcon
                  name="chevron-left"
                  size={20}
                  color={czInvestmentTokens.text}
                />
              }
              nextIcon={
                <SourceCustomIcon
                  name="chevron-right"
                  size={20}
                  color={czInvestmentTokens.text}
                />
              }
              onClose={closeStartDate}
              onSelect={value => {
                const date = fromIso(value);
                if (!isRoboFundingDateAllowed(date, clock)) return;
                dispatch({ type: 'date-changed', value: date });
                closeStartDate();
              }}
            />
          </BaselineBottomSheet>
        </ModalPortal>
      ) : null}
      {state.cashAccountSheetOpen ? (
        <ModalPortal
          visible
          transparent
          animationType="none"
          onRequestClose={closeCashAccounts}
        >
          <BaselineBottomSheet
            title="Select cash account"
            closeLabel="Close cash accounts"
            onClose={closeCashAccounts}
            width={width}
            height={height}
            footer={
              <View style={fundingStyles.sheetFooter}>
                <Button
                  canonical
                  label="Select"
                  disabled={
                    !currentAccounts.some(
                      account => account.id === draftAccountId,
                    )
                  }
                  onPress={() => {
                    if (
                      !currentAccounts.some(
                        account => account.id === draftAccountId,
                      )
                    )
                      return;
                    setAccountId(draftAccountId);
                    closeCashAccounts();
                  }}
                />
              </View>
            }
          >
            <View
              role="radiogroup"
              accessibilityLabel="Select cash account"
              style={fundingStyles.accountOptions}
            >
              {currentAccounts.map(account => {
                const detail = displayRoboAccountNumber(
                  account.accountNumber,
                  'CZ',
                );
                const balance = formatInvestmentMoney(
                  account.balance,
                  'CZ',
                  account.currency,
                  amountsHidden,
                );
                return (
                  <View key={account.id} style={fundingStyles.accountOption}>
                    <Choice
                      variant="radio"
                      title={account.name}
                      description={`${detail}\n${balance}`}
                      label={`${account.name}, ${detail}, ${balance}`}
                      selected={draftAccountId === account.id}
                      onPress={() => setDraftAccountId(account.id)}
                      titleStyle={fundingStyles.accountTitle}
                      descriptionStyle={fundingStyles.accountDescription}
                    />
                  </View>
                );
              })}
            </View>
          </BaselineBottomSheet>
        </ModalPortal>
      ) : null}
    </>
  );
}

function ReviewSectionHeading({ title }: { title: string }) {
  return (
    <View style={managementStyles.reviewSectionHeading}>
      <Copy strong style={managementStyles.reviewSectionTitle}>
        {title}
      </Copy>
      <View style={managementStyles.reviewSectionDivider} />
    </View>
  );
}

const managementStyles = StyleSheet.create({
  settingsRow: { paddingLeft: 0, paddingRight: 0 },
  reviewSectionHeading: { paddingTop: 16, marginBottom: 8 },
  reviewSectionTitle: { fontSize: 14, lineHeight: 18 },
  reviewSectionDivider: {
    height: 1,
    marginTop: 8,
    backgroundColor: czInvestmentTokens.border,
  },
});

const fundingStyles = StyleSheet.create({
  description: { fontSize: 18, lineHeight: 24 },
  form: { gap: 32 },
  contributionOptions: { gap: 16 },
  contributionOption: { gap: 8, paddingVertical: 8, paddingHorizontal: 0 },
  contributionTitle: { fontSize: 16, lineHeight: 18 },
  contributionDescription: { fontSize: 16, lineHeight: 18 },
  fields: { gap: 24 },
  amountBlock: { gap: 32 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  suggestion: {
    minHeight: 32,
    paddingLeft: 12,
    paddingRight: 12,
    paddingVertical: 8,
  },
  selectedSuggestion: { backgroundColor: czInvestmentTokens.accent },
  suggestionLabel: { fontSize: 14, lineHeight: 16 },
  selectedSuggestionLabel: { color: czInvestmentTokens.inverse },
  dateField: { minHeight: 80 },
  accountIntroduction: { gap: 16 },
  accountHeading: { fontSize: 18, lineHeight: 21 },
  accountExplanation: { fontSize: 16, lineHeight: 18 },
  accountField: {
    minHeight: 96,
    marginTop: 8,
    marginRight: -12,
    paddingTop: 8,
    paddingBottom: 5,
  },
  sheetFooter: { paddingTop: 8 },
  accountOptions: { gap: 8 },
  accountOption: { minHeight: 80, paddingHorizontal: 8, paddingVertical: 12 },
  accountTitle: { fontSize: 18, lineHeight: 21 },
  accountDescription: { color: czInvestmentTokens.muted },
});
