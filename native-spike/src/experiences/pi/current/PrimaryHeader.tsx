import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../universal/Typography';
import { IconAction } from './Primitives';
import type { CurrentScreenProps } from './contracts';
/** Source L1 Products header: title and servicing rail, with no Back action. */
export default function PrimaryHeader({
  host,
  title,
}: {
  host: CurrentScreenProps;
  title: string;
}) {
  const bosnia = host.country === 'BA' || host.country === 'BA_BL';
  return (
    <View style={[s.header, { backgroundColor: host.tokens.background }]}>
      <Text
        accessibilityRole="header"
        style={[s.title, { color: host.tokens.text }]}
      >
        {title}
      </Text>
      <View style={s.actions}>
        <IconAction
          host={host}
          slotSize={32}
          size={20}
          name={bosnia ? 'contact-phone' : 'header-profile'}
          label={
            bosnia
              ? 'Contact phone'
              : host.t('runtime.actions.profile', 'Profile')
          }
          onPress={
            bosnia ? () => host.onNavigate({ screen: 'contacts' }) : undefined
          }
        />
        <IconAction
          host={host}
          slotSize={32}
          size={20}
          name="header-messages"
          label={host.t('runtime.actions.messages', 'Messages')}
          onPress={() => host.onNavigate({ screen: 'messages' })}
        />
        {!bosnia && (
          <IconAction
            host={host}
            slotSize={32}
            size={20}
            name="help-circle"
            label={host.t('runtime.actions.help', 'Help')}
          />
        )}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  header: {
    paddingTop: 54,
    paddingHorizontal: 24,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 36,
    flex: 1,
    minWidth: 0,
  },
  actions: { flexDirection: 'row', height: 32, gap: 8 },
});
