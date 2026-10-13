import React, { useState } from 'react';
import { FormField } from '../../../../../universal/FormField';
import { Select } from '../../../../../universal/Select';
import { DateField } from '../../../../../universal/DateField';
import {
  getFundingFieldVisibility,
  getPortfoliosForStrategy,
} from '@/features/investments/robo/model';
import { canReviewRoboTopUp } from '@/features/investments/robo/flowSelectors';
import {
  parseRoboFundingDate,
  type RoboDemoClock,
} from '@/features/investments/robo/demoClock';
import { formatRoboCalendarDate } from '@/features/investments/robo/goalPositions';
import { ROBO_FUNDING_OPTIONS } from '@/features/investments/robo/presentationData';
import type { RoboAdvisorFlowState } from '@/features/investments/robo/legacyFlowState';
import type { RoboEvent } from '@/features/investments/robo/flowState';
import type { CurrentAccount } from '@/data/products';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import {
  Button,
  Choice,
  Notice,
  Page,
  czInvestmentTokens,
} from '../investments/Primitives';

export function FundingSetup({
  view,
  dispatch,
  accounts,
  clock,
  onBack,
  onExit,
  hidden,
}: {
  view: RoboAdvisorFlowState;
  dispatch: React.Dispatch<RoboEvent>;
  accounts: readonly CurrentAccount[];
  clock: RoboDemoClock;
  onBack: () => void;
  onExit: () => void;
  hidden: boolean;
}) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const account = accounts.find(candidate => candidate.id === accountId);
  const fields = view.fundingMethod
    ? getFundingFieldVisibility(view.fundingMethod)
    : null;
  const date = parseRoboFundingDate(view.startDate),
    min = `${clock.referenceDay.year}-${String(
      clock.referenceDay.month,
    ).padStart(2, '0')}-${String(clock.referenceDay.day).padStart(2, '0')}`;
  const iso = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(date.getDate()).padStart(2, '0')}`
    : '';
  const valid = view.fundingMethod
    ? canReviewRoboTopUp(
        view.fundingMethod,
        Number(view.initialAmount),
        Number(view.monthlyContribution),
        view.startDate,
        !!account,
        clock,
      )
    : false;
  return (
    <Page
      kind="funding-setup"
      title="Set up your investment"
      description={
        !view.fundingMethod
          ? 'Choose a contribution plan. The matching details will appear below.'
          : view.fundingMethod === 'one-off'
          ? 'Choose how much to invest now and which cash account to use.'
          : view.fundingMethod === 'regular'
          ? 'Set your monthly contribution, start date and cash account.'
          : 'Set an initial investment and monthly contributions from one cash account.'
      }
      onBack={onBack}
      onClose={onExit}
      footer={
        <Button
          label="Continue"
          disabled={!valid}
          onPress={() => {
            dispatch({ type: 'open-portfolio', from: 'funding-setup' });
            dispatch({
              type: 'portfolio-selected',
              portfolio:
                getPortfoliosForStrategy(view.selectedStrategyId)[0] ?? null,
            });
          }}
        />
      }
    >
      {ROBO_FUNDING_OPTIONS.map(option => (
        <Choice
          key={option.id}
          title={option.title}
          description={option.description}
          selected={view.fundingMethod === option.id}
          label={`${option.title}. ${option.description}`}
          onPress={() =>
            dispatch({
              type: 'draft-changed',
              field: 'fundingMethod',
              value: option.id,
            })
          }
        />
      ))}
      {fields?.initialAmount ? (
        <FormField
          tokens={czInvestmentTokens}
          label="Amount to invest now"
          value={view.initialAmount}
          onChange={value =>
            dispatch({
              type: 'draft-changed',
              field: 'initialAmount',
              value: value.replace(/\D/g, ''),
            })
          }
          inputProps={{ keyboardType: 'number-pad' }}
        />
      ) : null}
      {fields?.monthlyContribution ? (
        <FormField
          tokens={czInvestmentTokens}
          label="Monthly contribution"
          value={view.monthlyContribution}
          onChange={value =>
            dispatch({
              type: 'draft-changed',
              field: 'monthlyContribution',
              value: value.replace(/\D/g, ''),
            })
          }
          inputProps={{ keyboardType: 'number-pad' }}
        />
      ) : null}
      {fields?.startDate ? (
        <DateField
          tokens={czInvestmentTokens}
          label="Start date"
          value={iso}
          min={min}
          locale="en-GB"
          onChange={value =>
            dispatch({
              type: 'draft-changed',
              field: 'startDate',
              value: formatRoboCalendarDate(new Date(`${value}T12:00:00`)),
            })
          }
        />
      ) : null}
      <Select
        tokens={czInvestmentTokens}
        label="Cash account"
        value={accountId}
        onChange={setAccountId}
        items={accounts.map(candidate => ({
          value: candidate.id,
          label: `${candidate.name} · ${formatInvestmentMoney(
            candidate.balance,
            'CZ',
            candidate.currency,
            hidden,
          )}`,
        }))}
        closeLabel="Close cash accounts"
      />
      {!accounts.length ? (
        <Notice error text="No cash account is available." />
      ) : null}
    </Page>
  );
}
