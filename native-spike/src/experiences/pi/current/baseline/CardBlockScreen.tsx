import React from 'react';
import { View } from 'react-native';
import info from '@/assets/investments/robo-quit-info-large.svg';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../contracts';

export function CardBlockScreen({
  host,
  blocked,
  onBack,
  onConfirm,
}: {
  host: CurrentScreenProps;
  blocked: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const dark = host.tokens.background === '#121212';
  const title = blocked ? 'Unblock your card' : 'Block your card';
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: sourceColor('var(--uc-surface)', dark),
      }}
    >
      <BaselinePageHeader
        title={title}
        onBack={onBack}
        renderLargeTitle={false}
        showHelp={false}
        includeSafeArea
        safeAreaReserve={host.screenTopInset}
        dark={dark}
      />
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: 'UniCredit-bold',
          fontSize: 28,
          color: host.tokens.text,
          marginHorizontal: 24,
          marginTop: 10,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          height: 160,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 10,
        }}
      >
        <AssetGlyph
          asset={info}
          width={100}
          height={100}
          tintColor={host.tokens.text}
        />
      </View>
      <Text
        style={{
          fontSize: 18,
          color: host.tokens.text,
          marginHorizontal: 24,
          marginTop: 24,
        }}
      >
        {blocked
          ? 'Unblock your card in seconds, right from your app.'
          : 'Lost or misplaced your card? Block it instantly from the app.'}
      </Text>
      <View style={{ marginTop: 'auto', padding: 24 }}>
        <PrimaryButton
          label={blocked ? 'UNBLOCK' : 'BLOCK'}
          dark={dark}
          onPress={onConfirm}
        />
      </View>
    </View>
  );
}
export function BlockedCardOverlay() {
  return (
    <View
      pointerEvents="none"
      accessibilityLabel="Blocked"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 6,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        padding: 8,
      }}
    >
      <Text
        style={{
          backgroundColor: '#666666',
          color: '#ffffff',
          fontFamily: 'UniCredit-bold',
          fontSize: 14,
          overflow: 'hidden',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 4,
        }}
      >
        BLOCKED
      </Text>
    </View>
  );
}
