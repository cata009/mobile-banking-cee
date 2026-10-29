import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  getPaymentTemplates,
  getSavedBeneficiaries,
  type PaymentTemplateSelection,
} from '@/data/paymentTemplates';
import type { CurrentScreenProps } from '../../../contracts';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { BaselineSearchBar } from '../../../../../../universal/BaselineSearchBar';
import { BaselineSectionDivider } from '../../../../../../universal/BaselineSectionDivider';
import { PaymentIcon } from './Icon';
import { DuoReadable } from '../../../../../../universal/DuoPreview';
import { Text } from '../../../../../../universal/Typography';
import { sourceColor } from '../../../../../../universal/sourceColor';

export function RoBaselinePaymentTemplates({
  host,
  onBack,
  onSelect,
}: {
  host: CurrentScreenProps;
  onBack: () => void;
  onSelect: (selection: PaymentTemplateSelection) => void;
}) {
  const [search, setSearch] = useState('');
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const t = host.t;
  const normalized = search.trim().toLocaleLowerCase();
  const matches = (item: PaymentTemplateSelection) =>
    [item.title, item.beneficiaryName, item.accountNumber].some(value =>
      value.toLocaleLowerCase().includes(normalized),
    );
  const templates = getPaymentTemplates(host.country).filter(matches);
  const beneficiaries = getSavedBeneficiaries(host.country, false).filter(
    matches,
  );
  const row = (item: PaymentTemplateSelection) => (
    <Pressable
      key={item.id}
      accessibilityRole="button"
      accessibilityLabel={`${t(
        item.kind === 'template'
          ? 'runtime.payments.templates.useTemplate'
          : 'runtime.payments.templates.useBeneficiary',
        item.kind === 'template' ? 'Use template' : 'Use beneficiary',
      )} ${item.title} ${t(
        'runtime.payments.templates.forBeneficiary',
        'for',
      )} ${item.beneficiaryName}`}
      onPress={() => onSelect(item)}
      style={s.row}
    >
      <View style={s.icon}>
        <PaymentIcon name="payment-templates" color={color('--uc-icon')} />
      </View>
      <View style={s.copy}>
        <Text
          numberOfLines={1}
          style={[s.title, { color: color('--uc-text') }]}
        >
          {item.title}
        </Text>
        {item.kind === 'template' ? (
          <Text
            numberOfLines={1}
            style={[s.beneficiary, { color: color('--uc-text') }]}
          >
            {item.beneficiaryName}
          </Text>
        ) : null}
        <Text
          numberOfLines={1}
          style={[s.account, { color: color('--uc-text-muted') }]}
        >
          {item.accountNumber}
        </Text>
        {item.kind === 'template' ? (
          <Text style={[s.title, { color: color('--uc-text') }]}>
            {item.amount} {item.currency}
          </Text>
        ) : null}
      </View>
      <View style={[s.more, s.rotate]}>
        <PaymentIcon name="more-horizontal" color={color('--uc-icon')} />
      </View>
    </Pressable>
  );
  return (
    <DuoReadable>
      <View style={[s.page, { backgroundColor: color('--uc-surface') }]}>
        <ScrollView
          style={Platform.OS === 'web' ? s.webScroll : undefined}
          showsVerticalScrollIndicator={false}
        >
          <BaselinePageHeader
            title={t('runtime.payments.templates.title', 'Templates')}
            onBack={onBack}
            includeSafeArea
            safeAreaReserve={host.screenTopInset}
            dark={dark}
          />
          <View style={s.search}>
            <BaselineSearchBar
              value={search}
              onValueChange={setSearch}
              showTrailingAction={false}
              placeholder={t('runtime.actions.search', 'Search')}
              dark={dark}
            />
          </View>
          {!templates.length && !beneficiaries.length ? (
            <Text style={[s.empty, { color: color('--uc-text-muted') }]}>
              {t(
                'runtime.payments.templates.noResults',
                'No templates or beneficiaries found',
              )}
            </Text>
          ) : (
            <View style={s.list}>
              {templates.length ? (
                <View>
                  <View style={s.heading}>
                    <BaselineSectionDivider
                      title={t(
                        'runtime.payments.templates.selectTemplate',
                        'SELECT A TEMPLATE',
                      )}
                      variant="light-title"
                      dark={dark}
                    />
                  </View>
                  <View style={s.rows}>{templates.map(row)}</View>
                </View>
              ) : null}
              {beneficiaries.length ? (
                <View style={templates.length ? s.beneficiaries : undefined}>
                  <View style={s.heading}>
                    <BaselineSectionDivider
                      title={t(
                        'runtime.payments.templates.chooseBeneficiary',
                        'OR CHOOSE A BENEFICIARY',
                      )}
                      variant="light-title"
                      dark={dark}
                    />
                  </View>
                  <View style={s.rows}>{beneficiaries.map(row)}</View>
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>
      </View>
    </DuoReadable>
  );
}
const s = StyleSheet.create({
  page: { flex: 1 },
  webScroll: { transform: 'none' },
  search: { paddingHorizontal: 16, paddingTop: 18 },
  heading: { paddingHorizontal: 16 },
  rows: { paddingHorizontal: 16, paddingTop: 12 },
  list: { paddingTop: 24, paddingBottom: 24 },
  beneficiaries: { paddingTop: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, minWidth: 0 },
  more: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotate: { transform: [{ rotate: '90deg' }] },
  title: { fontFamily: 'UniCredit-bold', fontSize: 16 },
  beneficiary: { fontFamily: 'UniCredit-bold', fontSize: 14 },
  account: { fontFamily: 'UniCredit-regular', fontSize: 14 },
  empty: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    paddingHorizontal: 24,
    paddingVertical: 40,
    textAlign: 'center',
  },
});
