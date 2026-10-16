import React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import {
  resolveDetailToolbar,
  type DetailToolbarVariant,
} from '@/app/components/contracts/detailToolbar';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
import { SourceCustomIcon } from './SourceCustomIcon';

/** Local Account/Card geometry; scroll progress and native sticky/safe-area hosting stay external. */
export function BaselineDetailToolbar({
  variant,
  title,
  progress,
  onBack,
  onHelpPress,
  safeAreaReserve,
  dark = false,
}: {
  variant: DetailToolbarVariant;
  title: string;
  progress: number;
  onBack: () => void;
  onHelpPress?: () => void;
  safeAreaReserve?: number;
  dark?: boolean;
}) {
  const contract = resolveDetailToolbar({
    variant,
    progress,
    hasHelpCallback: Boolean(onHelpPress),
  });
  const color = sourceColor(`var(${contract.textToken})`, dark);
  const rootStyle: ViewStyle = {
    paddingTop: safeAreaReserve ?? contract.safeAreaFallback,
    zIndex: contract.zIndex,
    backgroundColor: sourceColor(`var(${contract.backgroundToken})`, dark),
  };
  const rowStyle: ViewStyle = {
    height: contract.toolbarHeight,
    paddingHorizontal: contract.paddingHorizontal,
    paddingTop: contract.paddingTop,
    flexDirection: 'row',
    alignItems: 'center',
  };
  const actionStyle: ViewStyle = {
    width: contract.actionSize,
    height: contract.actionSize,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const titleStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: contract.titleFontSize,
    color,
    textAlign: 'center' as const,
    flex: 1,
    minWidth: 0,
    opacity: contract.progress,
    transform: [{ translateY: contract.translateY }],
  };
  return (
    <View style={rootStyle}>
      <View style={rowStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={contract.backLabel}
          onPress={onBack}
          style={actionStyle}
        >
          <SourceCustomIcon
            name={contract.backIcon}
            size={contract.glyphSize}
            color={color}
          />
        </Pressable>
        <Text
          accessibilityRole="header"
          pointerEvents="none"
          numberOfLines={1}
          style={titleStyle}
        >
          {title}
        </Text>
        {contract.showHelp ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={contract.helpLabel}
            onPress={onHelpPress}
            style={actionStyle}
          >
            <SourceCustomIcon
              name={contract.helpIcon}
              size={contract.glyphSize}
              color={color}
            />
          </Pressable>
        ) : (
          <View style={actionStyle} />
        )}
      </View>
    </View>
  );
}
