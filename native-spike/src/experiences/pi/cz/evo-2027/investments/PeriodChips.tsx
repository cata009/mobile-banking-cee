import React from 'react';
import { StyleSheet } from 'react-native';
import type {
  InvestmentPeriodId,
  InvestmentPeriodOption,
} from '@/app/config/investmentsPortfolioConfig';
import { BaselineInvestmentPeriodChips } from '../../../../../universal/BaselineInvestmentPeriodChips';

export function PeriodChips({
  items,
  value,
  onChange,
  comfortable = false,
}: {
  items: readonly InvestmentPeriodOption[];
  value: InvestmentPeriodId;
  onChange: (value: InvestmentPeriodId) => void;
  comfortable?: boolean;
}) {
  return (
    <BaselineInvestmentPeriodChips
      periods={items}
      selectedPeriodId={value}
      onChange={onChange}
      comfortableTouchTargets={comfortable}
      wrapInk
      style={styles.rail}
      targetStyle={styles.target}
    />
  );
}

const styles = StyleSheet.create({
  rail: { marginTop: 12 },
  target: { borderRadius: 0 },
});
