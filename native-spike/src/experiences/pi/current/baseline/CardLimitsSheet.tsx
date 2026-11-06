import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  cardLimitDefaults,
  isValidCardLimit,
  restoreExpiredLimits,
  saveCardLimit,
  type CardLimits,
  type LimitKind,
} from '@/features/cards/card-limits/model';
import { BaselineBottomSheet } from '../../../../universal/BaselineBottomSheet';
import { BaselineNavigationRow } from '../../../../universal/BaselineNavigationRow';
import { BaselineSectionDivider } from '../../../../universal/BaselineSectionDivider';
import { BaselineTextField } from '../../../../universal/BaselineTextField';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { ToggleButton } from '../../../../universal/ToggleButton';
import { Text } from '../../../../universal/Typography';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { sourceColor } from '../../../../universal/sourceColor';

const saved = new Map<string, CardLimits>();
const labels: Record<LimitKind, string> = {
  atm: 'ATM amount limit',
  pos: 'POS amount limit',
  online: 'Online amount limit',
  posCount: 'Max POS transactions',
};

export default function CardLimitsSheet({
  country,
  cardId,
  available,
  dark,
  onClose,
}: {
  country: string;
  cardId: string;
  available?: number;
  dark: boolean;
  onClose: () => void;
}) {
  const scope = `${country}:${cardId}`;
  const viewport = useDemoViewport();
  const [limits, setLimits] = useState(() =>
    restoreExpiredLimits(saved.get(scope) ?? cardLimitDefaults(country)),
  );
  const [screen, setScreen] = useState<LimitKind | null>(null);
  const [draft, setDraft] = useState('');
  const [temporary, setTemporary] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  useEffect(() => {
    saved.set(scope, limits);
    const timer = setInterval(
      () => setLimits(current => restoreExpiredLimits(current)),
      60000,
    );
    return () => clearInterval(timer);
  }, [limits, scope]);
  const text = sourceColor('var(--uc-text)', dark);
  const muted = sourceColor('var(--uc-text-muted)', dark);
  const format = (value: number) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  const open = (kind: LimitKind) => {
    setDraft(String(limits[kind]));
    setTemporary(true);
    setScreen(kind);
  };
  const section = (title: string) => (
    <View style={{ marginTop: 24, marginBottom: 8 }}>
      <BaselineSectionDivider title={title} dark={dark} />
    </View>
  );
  const toggle = (
    title: string,
    description: string,
    key: 'atmEnabled' | 'posEnabled' | 'onlineEnabled',
  ) => (
    <BaselineNavigationRow
      title={title}
      description={description}
      rowHeight={80}
      dark={dark}
      style={styles.inlineRow}
      trailing={
        <ToggleButton
          ariaLabel={title}
          checked={limits[key]}
          onToggle={value =>
            setLimits(current => ({ ...current, [key]: value }))
          }
          dark={dark}
        />
      }
    />
  );
  const row = (kind: LimitKind) => (
    <BaselineNavigationRow
      title={labels[kind].toUpperCase()}
      ariaLabel={labels[kind]}
      description={
        kind === 'posCount'
          ? String(limits[kind])
          : `${format(limits[kind])} ${limits.currency}`
      }
      rowHeight={80}
      style={styles.inlineRow}
      trailingAccessory="chevron"
      onPress={() => open(kind)}
      dark={dark}
    />
  );
  const changed = screen !== null && Number(draft) !== limits[screen];
  const valid = screen !== null && isValidCardLimit(draft, screen, limits);
  const close = () => (screen ? setScreen(null) : onClose());
  return (
    <ModalPortal visible transparent onRequestClose={close}>
      <BaselineBottomSheet
        title={screen ? labels[screen] : 'Card Limits'}
        onClose={close}
        width={viewport.width}
        height={viewport.height}
        fillHeight
        dark={dark}
        footer={
          screen ? (
            <PrimaryButton
              label="SAVE"
              disabled={!changed || !valid}
              dark={dark}
              onPress={() => {
                if (valid && changed) {
                  setLimits(current =>
                    saveCardLimit(current, screen, Number(draft), temporary),
                  );
                  setScreen(null);
                }
              }}
            />
          ) : undefined
        }
      >
        {screen ? (
          <>
            {section(
              screen === 'posCount'
                ? 'SET DAILY TRANSACTION LIMIT'
                : 'SET DAILY AMOUNT LIMIT',
            )}
            <View
              style={{
                marginTop: 18,
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 20,
              }}
            >
              <View style={{ flex: 1 }}>
                <BaselineTextField
                  label={screen === 'posCount' ? 'TRANSACTIONS' : 'AMOUNT'}
                  value={draft}
                  onChange={setDraft}
                  inputMode="decimal"
                  ariaLabel={labels[screen]}
                  dark={dark}
                />
              </View>
              {screen !== 'posCount' && (
                <View style={{ width: 70, paddingBottom: 5 }}>
                  <Text
                    style={[styles.regular, { color: muted, fontSize: 12 }]}
                  >
                    CURRENCY
                  </Text>
                  <Text
                    style={[
                      styles.regular,
                      { color: text, fontSize: 16, marginTop: 4 },
                    ]}
                  >
                    {limits.currency}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.regular, { color: muted, marginTop: 6 }]}>
              Maximum limit:{' '}
              {screen === 'posCount'
                ? '100'
                : `${format(limits[`${screen}Max`])} ${limits.currency}`}
            </Text>
            {screen !== 'posCount' && available !== undefined && (
              <Text style={[styles.regular, { color: muted }]}>
                Free to spend {format(available)} {limits.currency}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reset default limit"
              onPress={() =>
                setDraft(String(screen === 'posCount' ? 10 : limits.amount))
              }
              style={{ alignItems: 'center', padding: 22 }}
            >
              <Text
                style={{
                  color: sourceColor('var(--uc-teal-main)', dark),
                  fontFamily: 'UniCredit-bold',
                }}
              >
                RESET DEFAULT LIMIT
              </Text>
            </Pressable>
            {section('SET LIMIT VALIDITY')}
            <BaselineNavigationRow
              title="SET FOR THE REST OF THE DAY"
              description="After midnight the previous limit will be restored"
              rowHeight={80}
              dark={dark}
              style={styles.inlineRow}
              trailing={
                <ToggleButton
                  ariaLabel="Set for the rest of the day"
                  checked={temporary}
                  onToggle={setTemporary}
                  dark={dark}
                />
              }
            />
          </>
        ) : (
          <>
            <Text style={[styles.regular, { color: text, marginBottom: 8 }]}>
              Set your daily card limits or temporarily disable card payments
              and withdrawals.{' '}
              <Text
                accessibilityRole="button"
                onPress={() => setDetailsOpen(!detailsOpen)}
                style={{
                  color: sourceColor('var(--uc-teal-main)', dark),
                  fontFamily: 'UniCredit-bold',
                }}
              >
                Read more details
              </Text>
            </Text>
            {detailsOpen && (
              <Text style={[styles.regular, { color: muted }]}>
                Changes apply to this card. You can also set a limit until the
                end of the day.
              </Text>
            )}
            {section('ATM DAILY LIMITS')}
            {toggle(
              'ATM WITHDRAWALS',
              'Enable/Disable ATM Withdrawals',
              'atmEnabled',
            )}
            {row('atm')}
            {section('POS DAILY LIMITS')}
            {toggle(
              'POS PAYMENTS',
              'Enable/Disable POS Payments',
              'posEnabled',
            )}
            {row('pos')}
            {row('posCount')}
            {section('ONLINE PAYMENTS DAILY LIMITS')}
            {toggle(
              'ONLINE PAYMENTS',
              'Enable/Disable Online Payments',
              'onlineEnabled',
            )}
            {row('online')}
          </>
        )}
      </BaselineBottomSheet>
    </ModalPortal>
  );
}

const styles = StyleSheet.create({
  inlineRow: { paddingLeft: 0, paddingRight: 0 },
  regular: { fontFamily: 'UniCredit-regular' },
});
