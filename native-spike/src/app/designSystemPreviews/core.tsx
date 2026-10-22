import React, { useState } from 'react';
import { View } from 'react-native';
import { BaselineTextField } from '../../universal/BaselineTextField';
import { BaselineAmountField } from '../../universal/BaselineAmountField';
import { BaselineCodeField } from '../../universal/BaselineCodeField';
import { BaselineTransactionRow } from '../../universal/BaselineTransactionRow';
import type { TextFieldVisualState } from '@/app/components/contracts/textField';
import type { CodeFieldVisualState } from '@/app/components/contracts/codeField';
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview';

export interface DesignSystemPreviewProps {
  componentId: string;
  variantId?: string;
  dark: boolean;
}
const fieldContextStyle = {
  minHeight: 96,
  paddingTop: 8,
  paddingLeft: 24,
  paddingRight: 12,
};

/** Fixtures and context only: all visual and interaction logic stays in the canonical primitives. */
export function CoreDesignSystemPreview({
  componentId,
  variantId,
  dark,
}: DesignSystemPreviewProps) {
  const id = variantId ?? 'empty';
  const initialValue =
    componentId === 'ui.code-field'
      ? id === 'filled' || id === 'disabled'
        ? '1234'
        : ''
      : id.includes('filled')
      ? componentId === 'ui.amount-field'
        ? '498.00'
        : 'Invoice 123'
      : '';
  const [value, setValue] = useState(initialValue);
  if (
    ![
      'ui.text-field',
      'ui.amount-field',
      'ui.code-field',
      'accounts.transaction-row',
    ].includes(componentId) ||
    !getNativeDesignSystemPreview(componentId, variantId)
  )
    return null;
  if (componentId === 'ui.code-field') {
    const visualState = id as CodeFieldVisualState;
    return (
      <BaselineCodeField
        value={value}
        onChange={setValue}
        visualState={visualState}
        errorText={id === 'error' ? 'Check the verification code.' : undefined}
        dark={dark}
      />
    );
  }
  if (componentId === 'accounts.transaction-row') {
    return (
      <BaselineTransactionRow
        transaction={{
          id: 'ds-transaction',
          day: '1',
          month: 'OCT',
          monthKey: '2026-10',
          monthTitle: 'October',
          label: 'Transaction details',
          amount: id === 'incoming' ? 498 : -498,
          type: id === 'incoming' ? 'credit' : 'debit',
          category: 'Transfers',
          pfmCategory: 'Transfers',
          pfmSubcategory: 'Transfer',
          status: id === 'pending' ? 'Pending' : 'Booked',
          source: 'account',
        }}
        formattedAmount="498.00"
        currency="EUR"
        dark={dark}
      />
    );
  }
  const visualState = id as TextFieldVisualState;
  const props = {
    label: componentId === 'ui.amount-field' ? 'Amount' : 'Payment reference',
    value,
    onChange: setValue,
    visualState: id === 'empty' || id === 'filled' ? undefined : visualState,
    dark,
    helperText: 'Use the reference provided by the recipient.',
    errorText: id.startsWith('error') ? 'Check the entered value.' : undefined,
    multipleValues:
      id === 'multiple-filled' ? ['Invoice 123', 'Invoice 124'] : undefined,
  };
  return (
    <View style={fieldContextStyle}>
      {componentId === 'ui.amount-field' ? (
        <BaselineAmountField {...props} currency="EUR" />
      ) : (
        <BaselineTextField {...props} />
      )}
    </View>
  );
}
