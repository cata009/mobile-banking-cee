import React from 'react';
import {
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import shoppingAsset from '@/assets/design-system/category-shopping.svg';
import notificationAsset from '@/assets/design-system/status-action-required.svg';
import { APPROVED_TAGS } from '@/app/components/contracts/approvedTags';
import { AssetGlyph } from './AssetGlyph';
import { Text } from './Typography';

/** Shared live tag primitive; count/status and accessible host naming stay with the owner. */
export function BaselineTag({
  kind,
  label,
  icon,
  style,
  labelStyle,
  small = false,
  notification = false,
  dark = false,
}: {
  kind: keyof typeof APPROVED_TAGS;
  label: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  small?: boolean;
  notification?: boolean;
  dark?: boolean;
}) {
  const c = APPROVED_TAGS[kind];
  const content = (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: c.background,
          borderRadius: c.radius,
          paddingHorizontal: c.paddingX,
          paddingVertical: c.paddingY,
          gap: kind === 'category' ? APPROVED_TAGS.category.gap : 0,
          minHeight: kind === 'notification' ? 16 : undefined,
        },
        kind === 'status'
          ? {
              width: small ? 120 : 153,
              minHeight: small ? 32 : 38,
              paddingHorizontal: small ? 8 : 16,
              paddingLeft: notification ? (small ? 0 : 4) : undefined,
              paddingRight: notification ? 16 : undefined,
              backgroundColor: dark ? '#333333' : 'transparent',
            }
          : undefined,
        kind === 'new' ? { transform: [{ translateY: -0.19 }] } : undefined,
        style,
      ]}
    >
      {kind === 'category'
        ? (icon ?? <AssetGlyph asset={shoppingAsset} size={15} />)
        : null}
      {kind === 'status' && notification ? (
        <AssetGlyph asset={notificationAsset} size={32} />
      ) : null}
      <Text
        style={[
          {
            color:
              kind === 'new'
                ? '#007a91'
                : kind === 'status' && !dark
                  ? '#262626'
                  : '#ffffff',
            fontFamily:
              kind === 'successful'
                ? 'UniCredit-medium'
                : kind === 'status'
                  ? 'UniCredit-regular'
                  : 'UniCredit-bold',
            fontSize: c.fontSize,
            lineHeight: c.lineHeight,
            letterSpacing: kind === 'new' ? 1 : undefined,
            textTransform:
              kind === 'category' || kind === 'positive'
                ? 'uppercase'
                : undefined,
            flexShrink: kind === 'status' ? 1 : undefined,
          },
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
  return kind === 'new' ? (
    <View
      style={{
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {content}
    </View>
  ) : (
    content
  );
}
