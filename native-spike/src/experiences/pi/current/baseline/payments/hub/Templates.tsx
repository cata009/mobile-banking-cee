import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  deletePaymentTemplateSelection,
  getPaymentTemplates,
  getSavedBeneficiaries,
  type PaymentTemplateSelection,
} from '@/data/paymentTemplates';
import type { CountryId } from '@/app/state/demoTypes';
import type { CurrentScreenProps } from '../../../contracts';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { BaselineSearchBar } from '../../../../../../universal/BaselineSearchBar';
import { BaselineSectionDivider } from '../../../../../../universal/BaselineSectionDivider';
import { BaselineDialog } from '../../../../../../universal/BaselineDialog';
import { DeleteActionReveal } from '../../../../../../universal/DeleteActionReveal';
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
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [deletedIdsByCountry, setDeletedIdsByCountry] = useState<
    Partial<Record<CountryId, ReadonlySet<string>>>
  >({});
  const [pendingDelete, setPendingDelete] = useState<{
    country: CountryId;
    item: PaymentTemplateSelection;
  } | null>(null);
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const t = host.t;
  const normalized = search.trim().toLocaleLowerCase();
  const deletedIds = deletedIdsByCountry[host.country] ?? new Set<string>();
  const matches = (item: PaymentTemplateSelection) =>
    [item.title, item.beneficiaryName, item.accountNumber].some(value =>
      value.toLocaleLowerCase().includes(normalized),
    );
  const templates = getPaymentTemplates(host.country)
    .filter(item => !deletedIds.has(`${item.kind}:${item.id}`))
    .filter(matches);
  const beneficiaries = getSavedBeneficiaries(host.country, false).filter(
    item => !deletedIds.has(`${item.kind}:${item.id}`) && matches(item),
  );
  const cancelDelete = () => {
    setPendingDelete(null);
    setOpenActionId(null);
  };
  const confirmDelete = () => {
    if (!pendingDelete) return;
    deletePaymentTemplateSelection(
      pendingDelete.country,
      pendingDelete.item.id,
    );
    const deletedKey = `${pendingDelete.item.kind}:${pendingDelete.item.id}`;
    setDeletedIdsByCountry(current => {
      const deleted = new Set(current[pendingDelete.country] ?? []);
      deleted.add(deletedKey);
      return { ...current, [pendingDelete.country]: deleted };
    });
    cancelDelete();
  };
  const row = (item: PaymentTemplateSelection) => {
    const itemKey = `${item.kind}:${item.id}`;
    const actionsOpen = openActionId === itemKey;
    const actionTitle =
      item.kind === 'template'
        ? t('runtime.payments.templates.templateActions', 'Template actions')
        : t(
            'runtime.payments.templates.beneficiaryActions',
            'Beneficiary actions',
          );
    const deleteLabel =
      item.kind === 'template'
        ? t('runtime.payments.templates.deleteTemplate', 'Delete template')
        : t(
            'runtime.payments.templates.deleteBeneficiary',
            'Delete beneficiary',
          );
    return (
      <DeleteActionReveal
        key={itemKey}
        actionsOpen={actionsOpen}
        dark={dark}
        deleteActionLabel={t('runtime.messages.deleteAction', 'DELETE')}
        deleteAccessibilityLabel={`${deleteLabel} ${item.title}`}
        onDelete={() => setPendingDelete({ country: host.country, item })}
        testID={`payment-selection-delete-reveal-${itemKey}`}
      >
        <View style={s.row}>
          <Pressable
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
            style={s.selection}
          >
            <View style={s.icon}>
              {item.kind === 'template' ? (
                <PaymentIcon
                  name="payment-templates"
                  color={color('--uc-icon')}
                />
              ) : (
                <PaymentIcon
                  name="header-profile"
                  color={color('--uc-text')}
                />
              )}
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
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${actionTitle} ${item.title}`}
            accessibilityState={{ expanded: actionsOpen }}
            onPress={() =>
              setOpenActionId(current => (current === itemKey ? null : itemKey))
            }
            style={[s.more, s.rotate]}
          >
            <PaymentIcon name="more-horizontal" color={color('--uc-icon')} />
          </Pressable>
        </View>
      </DeleteActionReveal>
    );
  };
  const pendingIsTemplate = pendingDelete?.item.kind === 'template';
  const pendingDeleteBody = pendingDelete
    ? t(
        pendingIsTemplate
          ? 'runtime.payments.templates.deleteDialog.templateBody'
          : 'runtime.payments.templates.deleteDialog.beneficiaryBody',
        pendingIsTemplate
          ? 'Are you sure you want to delete the payment template “{item}”?'
          : 'Are you sure you want to delete the saved beneficiary “{item}”?',
      ).replace(
        '{item}',
        pendingIsTemplate
          ? pendingDelete.item.title
          : pendingDelete.item.beneficiaryName,
      )
    : undefined;
  const overlay = pendingDelete ? (
    <BaselineDialog
      title={t(
        pendingIsTemplate
          ? 'runtime.payments.templates.deleteDialog.templateTitle'
          : 'runtime.payments.templates.deleteDialog.beneficiaryTitle',
        pendingIsTemplate ? 'Delete template?' : 'Delete beneficiary?',
      )}
      body={pendingDeleteBody}
      onCancel={cancelDelete}
      onConfirm={confirmDelete}
      confirmLabel={t('runtime.payments.templates.deleteDialog.confirm', 'Delete')}
      cancelLabel={t('runtime.dialogs.cancel', 'Cancel')}
      dark={dark}
    />
  ) : null;
  return (
    <DuoReadable>
      <View style={[s.page, { backgroundColor: color('--uc-surface') }]}>
        <ScrollView
          stickyHeaderIndices={[1]}
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
          <View style={[s.search, { backgroundColor: color('--uc-surface') }]}>
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
        {overlay}
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
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  selection: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
