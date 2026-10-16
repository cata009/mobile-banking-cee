import React from 'react';
import { View, type ViewStyle, type TextStyle } from 'react-native';
import {
  resolveL1Header,
  type L1HeaderVariant,
} from '@/app/components/contracts/l1Header';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

/** Isolated L1 shell; the owning feature supplies its original action/Prime/privacy slots. */
export function BaselineL1Header({
  variant,
  title,
  actions,
  showActions = true,
  showTitle = true,
  gutter,
  dark = false,
}: {
  variant: L1HeaderVariant;
  title: string;
  actions?: React.ReactNode;
  showActions?: boolean;
  showTitle?: boolean;
  gutter?: number;
  dark?: boolean;
}) {
  const contract = resolveL1Header(variant);
  const rootStyle: ViewStyle = {
    width: '100%',
    backgroundColor: contract.backgroundToken
      ? sourceColor(`var(${contract.backgroundToken})`, dark)
      : undefined,
  };
  const contentStyle: ViewStyle = {
    paddingHorizontal: gutter ?? contract.gutter,
    paddingBottom: contract.paddingBottom,
  };
  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: contract.rowMinHeight,
    gap: contract.rowGap,
  };
  const actionStyle: ViewStyle = {
    height: contract.actionsHeight,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: contract.gutter,
    paddingBottom: contract.paddingBottom,
  };
  const titleStyle: TextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: contract.titleFontSize,
    lineHeight:
      typeof contract.lineHeight === 'number' ? contract.lineHeight : undefined,
    color: sourceColor(`var(${contract.titleToken})`, dark),
    flex: contract.splitActionsAndTitle ? undefined : 1,
    minWidth: contract.splitActionsAndTitle ? undefined : 0,
  };
  const titleNode = (
    <Text accessibilityRole="header" style={titleStyle}>
      {title}
    </Text>
  );
  return (
    <View style={rootStyle}>
      {contract.splitActionsAndTitle ? (
        <>
          {showActions && <View style={actionStyle}>{actions}</View>}
          {showTitle && <View style={contentStyle}>{titleNode}</View>}
        </>
      ) : (
        <View style={contentStyle}>
          <View style={rowStyle}>
            {titleNode}
            {actions}
          </View>
        </View>
      )}
    </View>
  );
}
