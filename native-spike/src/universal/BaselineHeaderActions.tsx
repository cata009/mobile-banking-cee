import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  resolveHeaderAction,
  HEADER_ACTIONS_CONTRACT,
  type HeaderActionIconName,
} from '@/app/components/contracts/headerActions';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';
import { BaselineTag } from './BaselineTag';

export function BaselineHeaderActionRail({
  children,
}: {
  children: React.ReactNode;
}) {
  const railStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    height: HEADER_ACTIONS_CONTRACT.railHeight,
    gap: HEADER_ACTIONS_CONTRACT.railGap,
    flexShrink: 0,
  };
  return <View style={railStyle}>{children}</View>;
}
export function BaselineHeaderActionButton({
  icon,
  label,
  onPress,
  badgeCount = 0,
  dark = false,
}: {
  icon: HeaderActionIconName;
  label: string;
  onPress?: () => void;
  badgeCount?: number;
  dark?: boolean;
}) {
  const contract = resolveHeaderAction(icon, badgeCount);
  const [hovered, setHovered] = useState(false);
  const actionStyle = {
    width: contract.size,
    height: contract.size,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: hovered ? contract.hoverOpacity : 1,
  };
  const badgeStyle = {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: contract.badgeSize,
    height: contract.badgeSize,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: sourceColor(`var(${contract.badgeBackgroundToken})`, dark),
  };
  const textStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: contract.badgeFontSize,
    lineHeight: contract.badgeFontSize,
    letterSpacing: contract.badgeLetterSpacing,
    color: sourceColor(`var(${contract.badgeTextToken})`, dark),
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={actionStyle}
    >
      <SourceCustomIcon
        name={contract.icon}
        size={20}
        color={sourceColor(`var(${contract.iconToken})`, dark)}
      />
      {contract.badgeText !== null && (
        <BaselineTag
          kind="notification"
          label={String(contract.badgeText)}
          style={[badgeStyle, { paddingHorizontal: 0, paddingVertical: 0 }]}
          labelStyle={textStyle}
        />
      )}
    </Pressable>
  );
}
