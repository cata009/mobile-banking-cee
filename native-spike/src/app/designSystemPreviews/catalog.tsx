import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { BaselineAmountField } from '../../universal/BaselineAmountField';
import { Select } from '../../universal/Select';
import { mobileFirstTokens } from '../../universal/tokens';
import { BaselineTag } from '../../universal/BaselineTag';
import { BaselineCheckbox } from '../../universal/BaselineCheckbox';
import { BaselineDropdownField } from '../../universal/BaselineDropdownField';
import { BaselinePill } from '../../universal/BaselinePill';
import { BaselineNavigationLink } from '../../universal/BaselineNavigationLink';
import { BaselineSectionDivider } from '../../universal/BaselineSectionDivider';
import { BaselinePanelMenuSheet } from '../../universal/BaselinePanelMenuSheet';
import { BaselineCardArt } from '../../universal/BaselineCardArt';
import { BaselinePaymentImage } from '../../universal/BaselinePaymentImage';
import { getArtworkAsset } from '../../universal/images/artworkAssets';
import {
  CARD_ARTWORK_IMAGES,
  PAYMENT_IMAGE_ARTWORK,
  type CardArtVariant,
  type PaymentImageVariant,
} from '@/app/components/contracts/imageArtwork';
import type { TextFieldVisualState } from '@/app/components/contracts/textField';
import { Text } from '../../universal/Typography';
import type { DesignSystemPreviewProps } from './core';

export const CATALOG_PREVIEW_IDS = [
  'ui.checkbox',
  'ui.new-tag',
  'ui.positive-balance-tag',
  'ui.status-label',
  'ui.category-tag',
  'ui.success-status',
  'ui.notification-counter',
  'ui.navigation-chip',
  'ui.text-button-primary',
  'ui.divider-hairline',
  'products.selection-panel',
  'ui.dropdown-field',
  'images.card-art',
  'images.payment-art',
] as const;

/** Fixture data only. Shared primitives retain rendering, selection and panel behaviour. */
export function CatalogDesignSystemPreview({
  componentId,
  variantId,
  dark,
}: DesignSystemPreviewProps) {
  const [value, setValue] = useState(
    variantId?.includes('filled') || variantId === 'on-focus' ? 'main' : '',
  );
  const [amountValue, setAmountValue] = useState(
    variantId?.includes('filled') || variantId === 'amount-on-focus'
      ? '500.00'
      : '',
  );
  const [currency, setCurrency] = useState('EUR');
  const [multipleValues, setMultipleValues] = useState<readonly string[]>([
    'main',
    'other',
  ]);
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState(variantId === 'selected');
  if (componentId === 'ui.checkbox')
    return (
      <BaselineCheckbox
        presentation="canonical"
        ariaLabel="Include this item"
        checked={checked}
        onCheckedChange={next => setChecked(next === true)}
        dark={dark}
      />
    );
  if (componentId === 'ui.new-tag')
    return <BaselineTag kind="new" label="NEW" />;
  if (componentId === 'ui.positive-balance-tag')
    return <BaselineTag kind="positive" label="Sufficient balance" />;
  if (componentId === 'ui.status-label')
    return (
      <BaselineTag
        kind="status"
        label="Until 01.01.2027"
        small={variantId?.includes('small')}
        notification={variantId?.includes('notification')}
        dark={dark || variantId?.endsWith('dark')}
      />
    );
  if (componentId === 'ui.category-tag')
    return <BaselineTag kind="category" label="Shop" />;
  if (componentId === 'ui.success-status')
    return <BaselineTag kind="successful" label="Paid" />;
  if (componentId === 'ui.notification-counter')
    return (
      <BaselineTag
        kind="notification"
        label={variantId === 'double-digit' ? '12' : '3'}
      />
    );
  if (componentId === 'ui.navigation-chip')
    return (
      <BaselinePill
        presentation="navigation"
        label="All"
        selected
        onPress={() => {}}
        dark={dark}
      />
    );
  if (componentId === 'ui.text-button-primary')
    return (
      <BaselineNavigationLink
        text="VIEW"
        presentation="primary"
        onPress={() => {}}
        dark={dark}
      />
    );
  if (componentId === 'ui.divider-hairline')
    return <BaselineSectionDivider title="" ruleOnly />;
  if (componentId === 'images.card-art') {
    const selected = variantId ?? 'Credit red arrow gold';
    return selected in CARD_ARTWORK_IMAGES ? (
      <BaselineCardArt
        variant={selected as CardArtVariant}
        ariaLabel={selected}
      />
    ) : null;
  }
  if (componentId === 'images.payment-art') {
    const selected = variantId ?? 'MakePayment';
    if (!(selected in PAYMENT_IMAGE_ARTWORK)) return null;
    const source = PAYMENT_IMAGE_ARTWORK[selected as PaymentImageVariant];
    return (
      <BaselinePaymentImage
        variant={selected as PaymentImageVariant}
        asset={getArtworkAsset(source.nodeId)}
        ariaLabel={selected}
      />
    );
  }
  if (componentId === 'ui.dropdown-field') {
    const amount = variantId?.startsWith('amount-');
    const state = (variantId
      ?.replace(/^amount-/, '')
      .replace('on-focus-empty', 'on-focus')
      .replace('filled-with-cta', 'filled') ?? 'empty') as TextFieldVisualState;
    if (amount)
      return (
        <Select
          tokens={mobileFirstTokens}
          label="Currency"
          value={currency}
          items={[
            { value: 'EUR', label: 'EUR' },
            { value: 'RON', label: 'RON' },
            { value: 'CZK', label: 'CZK' },
          ]}
          onChange={setCurrency}
          renderTrigger={({ open }) => (
            <View
              style={{
                width: 375,
                minHeight: variantId === 'amount-filled-with-cta' ? 116 : 96,
                paddingTop: 8,
                paddingBottom: 5,
                paddingLeft: 24,
                paddingRight: 12,
              }}
            >
              <BaselineAmountField
                label="Amount"
                value={amountValue}
                onChange={setAmountValue}
                inputMode="decimal"
                currency={currency}
                currencyIconSize={32}
                onCurrencyClick={open}
                visualState={
                  state === 'empty' || state === 'filled' ? undefined : state
                }
                helperText="Choose an amount."
                helperText2="Available in the selected currency."
                errorText={
                  state.startsWith('error')
                    ? 'Enter an available amount.'
                    : undefined
                }
                dark={dark}
              />
              {variantId === 'amount-filled-with-cta' ? (
                <BaselineNavigationLink
                  text="Use available balance"
                  presentation="primary"
                  onPress={() => setAmountValue('1250.00')}
                  dark={dark}
                />
              ) : null}
            </View>
          )}
        />
      );
    return (
      <BaselineDropdownField
        label="Account"
        value={value}
        options={[
          { value: 'main', label: 'Main account' },
          { value: 'other', label: 'Savings account' },
        ]}
        onChange={setValue}
        multipleValues={
          variantId === 'multiple-filled' ? multipleValues : undefined
        }
        onMultipleChange={
          variantId === 'multiple-filled' ? setMultipleValues : undefined
        }
        visualState={
          state === 'empty' || state === 'filled' ? undefined : state
        }
        helperText="Choose the account to use."
        errorText={
          state.startsWith('error') ? 'Choose an available option.' : undefined
        }
        dark={dark}
      />
    );
  }
  if (componentId === 'products.selection-panel')
    return open ? (
      <BaselinePanelMenuSheet
        aboutSmartBanking=""
        exchangeRates=""
        findAtmBranches=""
        title="Choose a product"
        height={667}
        onClose={() => setOpen(false)}
        dark={dark}
        items={[
          {
            id: 'accounts',
            title: 'Accounts',
            description: 'Manage your everyday banking.',
          },
          {
            id: 'cards',
            title: 'Cards',
            description: 'Find the right card for you.',
          },
          {
            id: 'savings',
            title: 'Savings',
            description: 'Build towards your next goal.',
          },
          {
            id: 'loans',
            title: 'Loans',
            description: 'Explore financing options.',
          },
          {
            id: 'insurance',
            title: 'Insurance',
            description: 'Protect what matters to you.',
          },
          {
            id: 'investments',
            title: 'Investments',
            description: 'Plan for your future.',
          },
        ].map(item => ({ ...item, onPress: () => setOpen(false) }))}
      />
    ) : (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open product selection"
        onPress={() => setOpen(true)}
      >
        <Text>Choose a product</Text>
      </Pressable>
    );
  return null;
}
