import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { FormField } from '../../../../../universal/FormField';
import { Select } from '../../../../../universal/Select';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import { tokens, Button, Copy } from './Primitives';
import { PFM_CATEGORIES } from '@/data/pfmCategories';
import {
  EMPTY_EVO_TRANSACTION_FILTERS,
  type EvoTransactionFilters,
} from '@/features/accounts-payments/evoTransactionFilters';
export default function Filters({
  filters,
  onApply,
  onClose,
}: {
  filters: EvoTransactionFilters;
  onApply: (value: EvoTransactionFilters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState({
    ...filters,
  });
  const update = (patch: Partial<EvoTransactionFilters>) =>
    setDraft(current => ({
      ...current,
      ...patch,
    }));
  return (
    <ModalPanel tokens={tokens} title="Apply filters" visible onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Copy strong>SEARCH BY TRANSACTION DETAIL</Copy>
        {(['keyword', 'accountNumber', 'variableCode'] as const).map(
          (key, index) => (
            <FormField
              key={key}
              tokens={tokens}
              label={
                [
                  'Search by keyword',
                  'Search by account number',
                  'Search by variable code',
                ][index]!
              }
              value={draft[key]}
              onChange={value =>
                update({
                  [key]: value,
                })
              }
              inputProps={{
                autoCapitalize: 'none',
              }}
            />
          ),
        )}
        <Select
          tokens={tokens}
          label="Period"
          value={draft.datePreset}
          onChange={value =>
            update({
              datePreset: value,
            })
          }
          items={[
            {
              value: 'none',
              label: 'All dates',
            },
            {
              value: 'last-week',
              label: 'LAST WEEK',
            },
            {
              value: 'last-month',
              label: 'LAST MONTH',
            },
            {
              value: 'last-3-months',
              label: 'LAST 3 MONTHS',
            },
            {
              value: 'custom',
              label: 'SELECT CUSTOM PERIOD',
            },
          ]}
        />
        <View style={extractedStyles.item0} />
        {(['amountFrom', 'amountTo'] as const).map((key, index) => (
          <FormField
            key={key}
            tokens={tokens}
            label={index === 0 ? 'Amount from' : 'Amount to'}
            value={draft[key]}
            onChange={value =>
              update({
                [key]: value,
              })
            }
            inputProps={{
              keyboardType: 'decimal-pad',
            }}
          />
        ))}
        <Select
          tokens={tokens}
          label="Status"
          value={draft.status}
          onChange={value =>
            update({
              status: value,
            })
          }
          items={(['All transactions', 'Booked', 'Pending'] as const).map(
            value => ({
              value,
              label: value,
            }),
          )}
        />
        <Select
          tokens={tokens}
          label="Transaction type"
          value={draft.transactionType}
          onChange={value =>
            update({
              transactionType: value,
            })
          }
          items={(['All transactions', 'Incoming', 'Outgoing'] as const).map(
            value => ({
              value,
              label: value,
            }),
          )}
        />
        <Select
          tokens={tokens}
          label="Category"
          value={draft.category}
          onChange={category =>
            update({
              category,
            })
          }
          items={[
            {
              value: 'All categories',
              label: 'All categories',
            },
            ...PFM_CATEGORIES.map(category => ({
              value: category.name,
              label: category.name,
            })),
          ]}
        />
        <Button
          label="Reset filters"
          secondary
          onPress={() =>
            setDraft({
              ...EMPTY_EVO_TRANSACTION_FILTERS,
            })
          }
        />
        <Button label="Apply filters" onPress={() => onApply(draft)} />
      </ScrollView>
    </ModalPanel>
  );
}
const extractedStyles = StyleSheet.create({
  item0: {
    height: 16,
  },
});
