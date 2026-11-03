import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BaselineNavigationRow } from '../../../../universal/BaselineNavigationRow';
import { BaselineSectionDivider } from '../../../../universal/BaselineSectionDivider';
import { Text } from '../../../../universal/Typography';
import { ToggleButton } from '../../../../universal/ToggleButton';
import { sourceColor } from '../../../../universal/sourceColor';
import type { NativeCardSecurityChannel } from '@/features/demo-native/bankingPresentation';
import type { CurrentScreenProps } from '../contracts';
import { RoBaselineCardPage } from './CardInfo';

const channels: readonly {
  id: NativeCardSecurityChannel;
  title: string;
  description: string;
}[] = [
  { id: 'atm', title: 'ATM withdrawals', description: 'Cash withdrawals at an ATM' },
  { id: 'internet', title: 'Internet payments', description: 'Online card purchases' },
  { id: 'pos', title: 'In-store payments', description: 'Physical card at a POS terminal' },
];

export default function CardSecurity({ host }: { host: CurrentScreenProps }) {
  const security = host.bankingPresentation?.cardSecurityPreview ?? {
    channels: { atm: true, internet: true, pos: true },
    countryProtectionEnabled: false,
    cardStatus: 'active' as const,
    location: 'fresh' as const,
  };
  const dark = host.tokens.background === '#121212';
  const disabled = security.cardStatus === 'closed';
  const change = host.onCardSecuritySettingChange;
  const paragraph = {
    color: sourceColor('var(--uc-text-muted)', dark),
    fontSize: 13,
    lineHeight: 19.5,
  } as const;

  return (
    <RoBaselineCardPage host={host} title="Card security" showHelp={false}>
      <View testID="card-security-preview" style={styles.content}>
        {security.cardStatus === 'frozen' ? (
          <Text style={[styles.frozen, paragraph]}>
            Your card is temporarily frozen. These settings apply when the card is active.
          </Text>
        ) : null}
        <View style={styles.section}>
          <View style={styles.divider}>
            <BaselineSectionDivider title="PAYMENT CONTROLS" dark={dark} />
          </View>
          <View style={styles.rows}>
            {channels.map(channel => (
              <BaselineNavigationRow
                key={channel.id}
                title={channel.title}
                description={channel.description}
                trailing={
                  <ToggleButton
                    ariaLabel={`Allow ${channel.title}`}
                    checked={security.channels[channel.id]}
                    disabled={disabled}
                    onToggle={enabled => change?.({ kind: 'channel', channel: channel.id, enabled })}
                    dark={dark}
                  />
                }
                rowHeight={80}
                dark={dark}
              />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.divider}>
            <BaselineSectionDivider title="COUNTRY PROTECTION" dark={dark} />
          </View>
          <View style={styles.rows}>
            <BaselineNavigationRow
              title="Limit physical payments to my country"
              description="Applies to ATM and in-store POS only"
              trailing={
                <ToggleButton
                  ariaLabel="Limit physical payments to my country"
                  checked={security.countryProtectionEnabled}
                  disabled={disabled || (!security.countryProtectionEnabled && security.location !== 'fresh')}
                  onToggle={enabled => change?.({ kind: 'country-protection', enabled })}
                  dark={dark}
                />
              }
              rowHeight={80}
              dark={dark}
            />
          </View>
          <Text style={[styles.explanation, paragraph]}>
            When enabled, ATM withdrawals and in-store payments are limited to the country reported by your phone’s
            latest location signal. Internet payments are not affected.
          </Text>
          {security.location !== 'fresh' ? (
            <Text style={[styles.location, paragraph]}>
              {security.countryProtectionEnabled
                ? 'A fresh location signal is needed to refresh this protection.'
                : 'A fresh location signal is needed to enable this protection.'}
            </Text>
          ) : null}
        </View>
      </View>
    </RoBaselineCardPage>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  frozen: { paddingHorizontal: 24, paddingTop: 20 },
  section: { marginTop: 16 },
  divider: { paddingHorizontal: 24 },
  rows: { paddingTop: 16 },
  explanation: { paddingHorizontal: 24, paddingTop: 16 },
  location: { paddingHorizontal: 24, paddingTop: 12 },
});
