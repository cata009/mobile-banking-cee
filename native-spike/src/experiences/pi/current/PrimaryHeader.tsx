import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BaselineL1Header } from '../../../universal/BaselineL1Header';
import { IconAction } from './Primitives';
import type { CurrentScreenProps } from './contracts';
/** Products composition; the canonical L1 primitive owns the title and layout. */
export default function PrimaryHeader({
  host,
  title,
}: {
  host: CurrentScreenProps;
  title: string;
}) {
  const bosnia = host.country === 'BA' || host.country === 'BA_BL';
  return (
    <BaselineL1Header
      variant="products"
      title={title}
      topInset={54}
      backgroundColor={host.tokens.background}
      titleColor={host.tokens.text}
      actions={
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
      }
    />
  );
}
const s = StyleSheet.create({
  actions: { flexDirection: 'row', height: 32, gap: 8 },
});
