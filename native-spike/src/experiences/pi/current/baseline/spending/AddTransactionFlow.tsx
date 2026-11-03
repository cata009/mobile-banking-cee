import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { resolveDuoContent } from '@/features/demo-native/duoPreview';
import {
  MANUAL_CASH_TRANSACTION_CATEGORIES,
  createInitialManualCashTransactionDraft,
  isValidManualCashTransactionDate,
  isValidManualCashTransactionDraft,
  parseManualCashTransactionAmount,
  type ManualCashTransactionDraft,
} from '@/features/analytics/manualCashTransaction';
import type { CurrentScreenProps } from '../../contracts';
import { BaselineAccountInfoField } from '../../../../../universal/BaselineAccountInfoField';
import { BaselineBottomSheet } from '../../../../../universal/BaselineBottomSheet';
import { BaselineDropdownField } from '../../../../../universal/BaselineDropdownField';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { DateField } from '../../../../../universal/DateField';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { RadioButton } from '../../../../../universal/RadioButton';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { useDuoPreview } from '../../../../../universal/DuoPreview';
import { sourceColor } from '../../../../../universal/sourceColor';

export interface AddTransactionFlowProps {
  host: CurrentScreenProps;
  currency: string;
  onClose: () => void;
  onSubmit: (draft: ManualCashTransactionDraft) => void;
}

export default function AddTransactionFlow({
  host,
  currency,
  onClose,
  onSubmit,
}: AddTransactionFlowProps) {
  const viewport = useDemoViewport();
  const duo = useDuoPreview();
  const { width, height } = duo ? resolveDuoContent(duo, 'home') : viewport;
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const [view, setView] = useState<'form' | 'category'>('form');
  const [draft, setDraft] = useState(createInitialManualCashTransactionDraft);
  const [submitted, setSubmitted] = useState(false);
  const categories = MANUAL_CASH_TRANSACTION_CATEGORIES.map(category => ({
    ...category,
    label: host.t(
      `runtime.analytics.cashTransactionCategories.${category.id}`,
      category.label,
    ),
  }));
  const copy = (key: string, fallback: string) => host.t(key, fallback);
  const updateDraft = <K extends keyof ManualCashTransactionDraft>(
    key: K,
    value: ManualCashTransactionDraft[K],
  ) => setDraft(current => ({ ...current, [key]: value }));
  const amount = parseManualCashTransactionAmount(draft.amount);
  const dateValid = isValidManualCashTransactionDate(draft.date);
  const categoryValid = categories.some(
    category => category.id === draft.categoryId,
  );
  const close = () => {
    if (view === 'category') setView('form');
    else onClose();
  };
  const submit = () => {
    setSubmitted(true);
    if (!isValidManualCashTransactionDraft(draft)) return;
    onSubmit(draft);
  };

  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={close}
    >
      <View testID="ro-add-cash-transaction-flow">
        <BaselineBottomSheet
          title={
            view === 'category'
              ? copy(
                  'runtime.analytics.cashTransactionCategory',
                  'Choose category',
                )
              : copy(
                  'runtime.analytics.cashTransactionTitle',
                  'Add cash transaction to spending overview',
                )
          }
          onClose={close}
          width={width}
          height={height}
          fillHeight
          maxHeightOffsetPx={Math.max(64, host.screenTopInset + 8)}
          contentBleed
          padding={24}
          dark={dark}
          closeLabel={copy('runtime.actions.close', 'Close')}
          footer={
            view === 'form' ? (
              <PrimaryButton
                label={copy(
                  'runtime.analytics.addTransaction',
                  'Add Transaction',
                ).toLocaleUpperCase(host.language)}
                onPress={submit}
                dark={dark}
              />
            ) : (
              <PrimaryButton
                label={copy('runtime.analytics.cashTransactionOk', 'OK')}
                onPress={() => setView('form')}
                disabled={!categoryValid}
                dark={dark}
              />
            )
          }
        >
          {view === 'form' ? (
            <View style={styles.formContent}>
              <View style={styles.amountRow}>
                <View style={styles.amountField}>
                  <BaselineTextField
                    label={copy(
                      'runtime.analytics.cashTransactionAmount',
                      'Amount',
                    )}
                    value={draft.amount}
                    onChange={value => updateDraft('amount', value)}
                    placeholder="0,00"
                    inputMode="decimal"
                    errorText={
                      submitted && !amount
                        ? copy(
                            draft.amount.trim()
                              ? 'runtime.analytics.cashTransactionInvalidAmount'
                              : 'runtime.analytics.cashTransactionRequired',
                            draft.amount.trim()
                              ? 'Enter a valid amount'
                              : 'Required',
                          )
                        : undefined
                    }
                    dark={dark}
                  />
                </View>
                <View style={styles.currencyField}>
                  <BaselineAccountInfoField
                    title={copy(
                      'runtime.analytics.cashTransactionCurrency',
                      'Currency',
                    )}
                    subtitle={currency}
                    dark={dark}
                  />
                </View>
              </View>

              <View style={styles.dateField}>
                <DateField
                  tokens={host.tokens}
                  label={copy(
                    'runtime.analytics.cashTransactionDate',
                    'CHOOSE DATE',
                  )}
                  value={draft.date}
                  onChange={value => updateDraft('date', value)}
                  displayFormat="long-month"
                  locale={host.language === 'ro' ? 'ro-RO' : 'en-GB'}
                  labelStyle={styles.dateLabel}
                  calendarIcon={
                    <SourceCustomIcon
                      name="calendar-days"
                      size={32}
                      color={sourceColor('var(--uc-text)', dark)}
                    />
                  }
                  error={
                    submitted && !dateValid
                      ? copy(
                          'runtime.analytics.cashTransactionRequired',
                          'Required',
                        )
                      : undefined
                  }
                  inputProps={{
                    editable: false,
                    maxLength: 32,
                    placeholder: '03-November-2026',
                  }}
                />
              </View>

              <View style={styles.descriptionField}>
                <BaselineTextField
                  label={copy(
                    'runtime.analytics.cashTransactionDescription',
                    'Description',
                  )}
                  value={draft.description}
                  onChange={value => updateDraft('description', value)}
                  maxLength={80}
                  dark={dark}
                />
              </View>

              <BaselineSectionDivider
                title={copy(
                  'runtime.analytics.allCategories',
                  'ALL CATEGORIES',
                )}
                variant="section"
                dark={dark}
              />
              <BaselineDropdownField
                label={copy(
                  'runtime.analytics.cashTransactionCategory',
                  'Choose category',
                )}
                value={draft.categoryId}
                options={categories.map(category => ({
                  value: category.id,
                  label: category.label,
                }))}
                onChange={value => updateDraft('categoryId', value)}
                onOpen={() => setView('category')}
                errorText={
                  submitted && !categoryValid
                    ? copy(
                        'runtime.analytics.cashTransactionRequired',
                        'Required',
                      )
                    : undefined
                }
                fillWidth
                dark={dark}
              />
            </View>
          ) : (
            <View testID="ro-add-cash-transaction-categories">
              {categories.map(category => (
                <RadioButton
                  key={category.id}
                  label={category.label}
                  selected={draft.categoryId === category.id}
                  onPress={() => updateDraft('categoryId', category.id)}
                  dark={dark}
                />
              ))}
            </View>
          )}
        </BaselineBottomSheet>
      </View>
    </ModalPortal>
  );
}

const styles = StyleSheet.create({
  formContent: { paddingTop: 64, paddingBottom: 24, gap: 64 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 32,
    paddingHorizontal: 24,
  },
  amountField: { flex: 1, minWidth: 0 },
  currencyField: { width: 80, paddingBottom: 8 },
  dateField: { marginTop: 16, paddingHorizontal: 24 },
  dateLabel: { textTransform: 'uppercase' },
  descriptionField: { marginTop: 12, paddingHorizontal: 24 },
});
