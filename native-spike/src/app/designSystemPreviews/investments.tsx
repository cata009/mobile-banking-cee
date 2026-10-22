import React, { useState } from 'react';
import {
  INVESTMENT_PERIODS,
  INVESTMENT_SORT_OPTIONS,
  type InvestmentPeriodId,
  type InvestmentSortId,
} from '@/app/config/investmentsPortfolioConfig';
import { BaselineInvestmentPeriodChips } from '../../universal/BaselineInvestmentPeriodChips';
import { BaselineInvestmentFilterChips } from '../../universal/BaselineInvestmentFilterChips';

function DateFilterPreview({
  type,
  dark,
}: {
  type: 'five' | 'four';
  dark: boolean;
}) {
  const [selected, setSelected] = useState('3');
  const labels =
    type === 'four'
      ? ['0 Y', '1 Y', '3 Y', '3 Y']
      : ['1 M', '3 M', '1 Y', '3 Y', 'MAX'];
  return (
    <BaselineInvestmentPeriodChips
      preset="figma"
      periods={labels.map((label, index) => ({ id: String(index), label }))}
      selectedPeriodId={selected}
      onChange={setSelected}
      ariaLabel="Date filter"
      dark={dark}
    />
  );
}

function PeriodPreview({ dark }: { dark: boolean }) {
  const [period, setPeriod] = useState<InvestmentPeriodId>('max');
  return (
    <BaselineInvestmentPeriodChips
      preset="experience"
      periods={INVESTMENT_PERIODS}
      selectedPeriodId={period}
      onChange={setPeriod}
      dark={dark}
    />
  );
}

function SortingPreview({ dark }: { dark: boolean }) {
  const [sort, setSort] = useState<InvestmentSortId>('max-value');
  return (
    <BaselineInvestmentFilterChips
      options={INVESTMENT_SORT_OPTIONS}
      selectedOptionId={sort}
      onChange={setSort}
      dark={dark}
    />
  );
}

/** Fixtures and controlled state only; all pixels and interactions use the canonical RN DS. */
export function InvestmentsDesignSystemPreview({
  componentId,
  variantId,
  dark,
}: {
  componentId: string;
  variantId?: string;
  dark: boolean;
}): React.ReactElement | null {
  if (componentId === 'ui.date-filter') {
    if (variantId === 'four' || variantId === 'four-item')
      return <DateFilterPreview key="four" type="four" dark={dark} />;
    if (
      variantId === undefined ||
      variantId === 'five' ||
      variantId === 'five-item' ||
      variantId === 'default'
    )
      return <DateFilterPreview key="five" type="five" dark={dark} />;
    return null;
  }
  if (variantId !== undefined && variantId !== 'default') return null;
  if (componentId === 'investments.period-chips')
    return <PeriodPreview dark={dark} />;
  if (componentId === 'investments.filter-chips')
    return <SortingPreview dark={dark} />;
  return null;
}
