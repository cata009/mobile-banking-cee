import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import {
  ACCOUNT_STATEMENTS,
  filterAccountStatements,
  formatAccountStatementPeriod,
  isValidAccountStatementEmail,
  isValidAccountStatementRange,
} from '@/features/accounts-payments/accountStatements';
import type { CurrentScreenProps } from '../contracts';
import { BaselineBottomSheet } from '../../../../universal/BaselineBottomSheet';
import { BaselineCheckbox } from '../../../../universal/BaselineCheckbox';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { BaselineSearchBar } from '../../../../universal/BaselineSearchBar';
import { BaselineSectionDivider } from '../../../../universal/BaselineSectionDivider';
import { BaselineTextField } from '../../../../universal/BaselineTextField';
import { DateField } from '../../../../universal/DateField';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';

const DEFAULT_FROM = '2025-11-03';
const DEFAULT_TO = '2026-11-03';
const DEFAULT_EMAIL = 'mihaicatalin.iacob@gmail.com';

function statementDateParts(iso: string) {
  const date = new Date(`${iso}T12:00:00Z`);
  return {
    day: String(date.getUTCDate()).padStart(2, '0'),
    month: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      timeZone: 'UTC',
    })
      .format(date)
      .toUpperCase(),
    year: date.getUTCFullYear(),
  };
}

function statementDateLabel(iso: string) {
  const { day, month, year } = statementDateParts(iso);
  return `${day} ${month} ${year}`;
}

export function AccountStatementFlow({
  host,
  onClose,
}: {
  host: CurrentScreenProps;
  onClose: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [query, setQuery] = useState('');
  const [appliedFrom, setAppliedFrom] = useState(DEFAULT_FROM);
  const [appliedTo, setAppliedTo] = useState(DEFAULT_TO);
  const [draftFrom, setDraftFrom] = useState(DEFAULT_FROM);
  const [draftTo, setDraftTo] = useState(DEFAULT_TO);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestFrom, setRequestFrom] = useState(DEFAULT_FROM);
  const [requestTo, setRequestTo] = useState(DEFAULT_TO);
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState('');
  const viewport = useDemoViewport();
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const surface = sourceColor('var(--uc-surface)', dark);
  const statements = filterAccountStatements({
    query,
    from: appliedFrom,
    to: appliedTo,
  });
  const visibleIds = statements.map(statement => statement.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
  const selectedStatements = ACCOUNT_STATEMENTS.filter(statement =>
    selectedIds.includes(statement.id),
  );
  const canSendOnDemand =
    isValidAccountStatementEmail(email) &&
    isValidAccountStatementRange(requestFrom, requestTo);

  const toggleStatement = (id: string) => {
    setSelectedIds(current =>
      current.includes(id)
        ? current.filter(selected => selected !== id)
        : [...current, id],
    );
  };
  const toggleVisibleStatements = () => {
    setSelectedIds(current =>
      allVisibleSelected
        ? current.filter(id => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  };
  const openAdvancedSearch = () => {
    setDraftFrom(appliedFrom);
    setDraftTo(appliedTo);
    setAdvancedOpen(true);
  };
  const openOnDemand = () => {
    setRequestFrom(appliedFrom);
    setRequestTo(appliedTo);
    setRequestOpen(true);
  };
  const shareStatements = async () => {
    if (!selectedStatements.length) return;
    const message = selectedStatements
      .map(
        statement =>
          `Statement number ${statement.statementNumber} · ${statementDateLabel(
            statement.date,
          )}`,
      )
      .join('\n');
    setNotice('');
    try {
      await Share.share({ title: 'Account statement', message });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      if (
        Platform.OS === 'web' &&
        typeof navigator !== 'undefined' &&
        navigator.clipboard?.writeText
      ) {
        try {
          await navigator.clipboard.writeText(message);
          setNotice('Sharing is unavailable here. Statement details copied.');
        } catch {
          setNotice('Could not share the selected statements.');
        }
      } else {
        setNotice('Could not share the selected statements.');
      }
    }
  };
  const sendOnDemandRequest = () => {
    if (!canSendOnDemand) return;
    setRequestOpen(false);
    setSent(true);
  };
  if (sent) {
    return (
      <View style={[styles.successRoot, { backgroundColor: surface }]}>
        <View style={styles.successHeading}>
          <Text
            accessibilityRole="header"
            style={[styles.successTitle, { color: host.tokens.text }]}
          >
            Success!
          </Text>
        </View>
        <View style={styles.successBody}>
          <View
            style={[
              styles.successCheck,
              { borderColor: sourceColor('var(--uc-green-olive)', dark) },
            ]}
          >
            <SourceCustomIcon
              name="prime-check"
              size={64}
              color={sourceColor('var(--uc-green-olive)', dark)}
            />
          </View>
          <Text style={[styles.successMessage, { color: host.tokens.text }]}>
            The statement will be soon sent to the indicated e-mail address.
          </Text>
        </View>
        <View style={styles.successFooter}>
          <PrimaryButton
            label="Ok, got it"
            labelSize="18"
            onPress={() => setSent(false)}
            dark={dark}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: surface }]}>
      <ScrollView
        testID="ro-account-statement-page"
        stickyHeaderIndices={[0]}
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
          )
        }
      >
        <BaselinePageHeader
          title="Account statement"
          onBack={onClose}
          showHelp={false}
          renderLargeTitle={false}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          collapsedTitleProgress={progress}
          dark={dark}
        />
        <View style={[styles.titleFrame, { opacity: 1 - progress }]}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: host.tokens.text }]}
          >
            Account statement
          </Text>
        </View>
        <View style={styles.content}>
          <BaselineSearchBar
            value={query}
            placeholder="Search"
            accessibilityLabel="Search statements"
            trailingLabel="Advanced search"
            trailingIcon="filters"
            fieldSurface="muted"
            onValueChange={setQuery}
            onFilterClick={openAdvancedSearch}
            onClearClick={() => setQuery('')}
            dark={dark}
          />
          <View style={styles.selectionHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select all statements"
              onPress={toggleVisibleStatements}
              disabled={!visibleIds.length}
            >
              <Text
                style={[
                  styles.selectAll,
                  { color: sourceColor('var(--uc-action)', dark) },
                  !visibleIds.length && styles.disabledText,
                ]}
              >
                {allVisibleSelected ? 'DESELECT ALL' : 'SELECT ALL'}
              </Text>
            </Pressable>
            <Text style={[styles.period, { color: host.tokens.text }]}>
              {formatAccountStatementPeriod(appliedFrom, appliedTo)}
            </Text>
          </View>
          <View
            style={[styles.rule, { backgroundColor: host.tokens.border }]}
          />
          <View style={styles.statementRows}>
            {statements.map(statement => {
              const date = statementDateParts(statement.date);
              const selected = selectedIds.includes(statement.id);
              const label = `Statement number ${statement.statementNumber}, ${date.day} ${date.month} ${date.year}`;
              return (
                <Pressable
                  key={statement.id}
                  accessibilityRole="checkbox"
                  accessibilityLabel={label}
                  accessibilityState={{ checked: selected }}
                  aria-checked={selected}
                  onPress={() => toggleStatement(statement.id)}
                  style={styles.statementRow}
                >
                  <View style={styles.dateColumn}>
                    <Text style={[styles.day, { color: host.tokens.text }]}>
                      {date.day}
                    </Text>
                    <Text style={[styles.month, { color: host.tokens.muted }]}>
                      {date.month}
                    </Text>
                  </View>
                  <View
                    pointerEvents="none"
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={styles.checkbox}
                  >
                    <BaselineCheckbox
                      checked={selected}
                      presentation="canonical"
                      dark={dark}
                    />
                  </View>
                  <View style={styles.statementLabel}>
                    <Text
                      style={[
                        styles.statementType,
                        { color: host.tokens.muted },
                      ]}
                    >
                      STATEMENT NUMBER
                    </Text>
                    <Text
                      style={[
                        styles.statementNumber,
                        { color: host.tokens.text },
                      ]}
                    >
                      {statement.statementNumber}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
            {!statements.length ? (
              <Text style={[styles.empty, { color: host.tokens.muted }]}>
                No statements found.
              </Text>
            ) : null}
          </View>
          <Text style={[styles.helper, { color: host.tokens.muted }]}>
            You can change the period using the button found inside the search
            box, or you can receive a statement directly via e-mail by tapping
            the button below.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Generate statement"
            onPress={openOnDemand}
            style={styles.generate}
          >
            <Text
              style={[
                styles.generateLabel,
                { color: sourceColor('var(--uc-action)', dark) },
              ]}
            >
              GENERATE STATEMENT
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {notice ? (
          <Text style={[styles.notice, { color: host.tokens.muted }]}>
            {notice}
          </Text>
        ) : null}
        <PrimaryButton
          label="Share"
          labelSize="18"
          disabled={!selectedStatements.length}
          onPress={shareStatements}
          dark={dark}
        />
      </View>
      {advancedOpen ? (
        <ModalPortal
          visible
          transparent
          animationType="none"
          onRequestClose={() => setAdvancedOpen(false)}
        >
          <BaselineBottomSheet
            title="Advanced search"
            onClose={() => setAdvancedOpen(false)}
            width={viewport.width}
            height={viewport.height}
            fillHeight
            dark={dark}
            footer={
              <View style={styles.sheetFooter}>
                <PrimaryButton
                  label="Apply"
                  labelSize="18"
                  disabled={!isValidAccountStatementRange(draftFrom, draftTo)}
                  onPress={() => {
                    setAppliedFrom(draftFrom);
                    setAppliedTo(draftTo);
                    setAdvancedOpen(false);
                  }}
                  dark={dark}
                />
              </View>
            }
          >
            <BaselineSectionDivider title="Filter by date" dark={dark} />
            <View style={styles.filterDates}>
              <DateField
                tokens={host.tokens}
                label="FROM"
                value={draftFrom}
                onChange={setDraftFrom}
                locale="en-GB"
                displayFormat="long-month"
                calendarIcon={
                  <SourceCustomIcon
                    name="calendar-days"
                    size={24}
                    color={host.tokens.text}
                  />
                }
                labelStyle={{ transform: [{ translateY: 8 }] }}
                min="1900-01-01"
                max={draftTo}
                inputProps={{ accessibilityLabel: 'From date' }}
              />
              <DateField
                tokens={host.tokens}
                label="TO"
                value={draftTo}
                onChange={setDraftTo}
                locale="en-GB"
                displayFormat="long-month"
                calendarIcon={
                  <SourceCustomIcon
                    name="calendar-days"
                    size={24}
                    color={host.tokens.text}
                  />
                }
                labelStyle={{ transform: [{ translateY: 8 }] }}
                min={draftFrom}
                max="2099-12-31"
                inputProps={{ accessibilityLabel: 'To date' }}
              />
            </View>
          </BaselineBottomSheet>
        </ModalPortal>
      ) : null}
      {requestOpen ? (
        <ModalPortal
          visible
          transparent
          animationType="none"
          onRequestClose={() => setRequestOpen(false)}
        >
          <BaselineBottomSheet
            title="Account statement"
            onClose={() => setRequestOpen(false)}
            width={viewport.width}
            height={viewport.height}
            fillHeight
            dark={dark}
            footer={
              <View style={styles.sheetFooter}>
                <PrimaryButton
                  label="Send"
                  labelSize="18"
                  disabled={!canSendOnDemand}
                  onPress={sendOnDemandRequest}
                  dark={dark}
                />
              </View>
            }
          >
            <Text style={[styles.onDemand, { color: host.tokens.text }]}>
              On demand
            </Text>
            <BaselineSectionDivider title="PERIOD" dark={dark} />
            <View style={styles.requestDates}>
              <DateField
                tokens={host.tokens}
                label="FROM"
                value={requestFrom}
                onChange={setRequestFrom}
                locale="en-GB"
                displayFormat="long-month"
                calendarIcon={
                  <SourceCustomIcon
                    name="calendar-days"
                    size={24}
                    color={host.tokens.text}
                  />
                }
                labelStyle={{ transform: [{ translateY: 8 }] }}
                min="1900-01-01"
                max={requestTo}
                inputProps={{ accessibilityLabel: 'Request from date' }}
              />
              <DateField
                tokens={host.tokens}
                label="TO"
                value={requestTo}
                onChange={setRequestTo}
                locale="en-GB"
                displayFormat="long-month"
                calendarIcon={
                  <SourceCustomIcon
                    name="calendar-days"
                    size={24}
                    color={host.tokens.text}
                  />
                }
                labelStyle={{ transform: [{ translateY: 8 }] }}
                min={requestFrom}
                max="2099-12-31"
                inputProps={{ accessibilityLabel: 'Request to date' }}
              />
            </View>
            <View style={styles.emailDivider}>
              <BaselineSectionDivider title="E-MAIL ADDRESS" dark={dark} />
            </View>
            <BaselineTextField
              label="E-MAIL"
              ariaLabel="Statement email"
              value={email}
              onChange={setEmail}
              inputMode="email"
              dark={dark}
            />
            <View style={styles.disclaimers}>
              <Text style={[styles.disclaimer, { color: host.tokens.text }]}>
                The password for accessing the account statement requested by
                email is the last 6 digits of your CNP.
              </Text>
              <Text style={[styles.disclaimer, { color: host.tokens.text }]}>
                I declare that the email address is known and correct, therefore
                there is no risk. UniCredit Bank is exempted from liability in
                this regard.
              </Text>
            </View>
          </BaselineBottomSheet>
        </ModalPortal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webScroll: { transform: 'none' },
  titleFrame: { paddingHorizontal: 20, paddingVertical: 8 },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 32 },
  content: { paddingHorizontal: 14, paddingTop: 20, paddingBottom: 20 },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  selectAll: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 18 },
  disabledText: { opacity: 0.45 },
  period: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'right',
  },
  rule: { height: 1 },
  statementRows: { paddingTop: 8 },
  statementRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  dateColumn: { width: 32 },
  day: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 16 },
  month: { fontFamily: 'UniCredit-bold', fontSize: 12, lineHeight: 15 },
  checkbox: { width: 40, alignItems: 'center' },
  statementLabel: { flex: 1, alignItems: 'flex-end' },
  statementType: {
    fontFamily: 'UniCredit-regular',
    fontSize: 13,
    lineHeight: 18,
  },
  statementNumber: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 18,
  },
  empty: { textAlign: 'center', paddingVertical: 28, fontSize: 16 },
  helper: {
    textAlign: 'center',
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 20,
  },
  generate: { alignSelf: 'center', paddingVertical: 20, paddingHorizontal: 12 },
  generateLabel: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 18 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  successFooter: { paddingHorizontal: 24, paddingBottom: 42 },
  notice: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  sheetFooter: { paddingTop: 8, paddingBottom: 8 },
  filterDates: { paddingTop: 24, gap: 28 },
  onDemand: { fontFamily: 'UniCredit-bold', fontSize: 18, marginBottom: 18 },
  requestDates: { paddingTop: 20, gap: 22 },
  emailDivider: { marginTop: 32, marginBottom: 20 },
  disclaimers: { gap: 18, paddingTop: 34, paddingBottom: 24 },
  disclaimer: { fontFamily: 'UniCredit-regular', fontSize: 15, lineHeight: 20 },
  successRoot: { flex: 1 },
  successHeading: { paddingHorizontal: 24, paddingTop: 84 },
  successTitle: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 34 },
  successBody: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 24,
  },
  successCheck: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 58,
  },
  successMessage: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    paddingTop: 58,
  },
});
