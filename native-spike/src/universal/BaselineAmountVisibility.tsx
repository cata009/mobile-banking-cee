import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { resolveAmountVisibility } from '@/app/components/contracts/amountVisibility';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';
export function BaselineAmountVisibility({
  hidden,
  onToggle,
  dark = false,
}: {
  hidden: boolean;
  onToggle: () => void;
  dark?: boolean;
}) {
  const state = resolveAmountVisibility(hidden),
    [hovered, setHovered] = useState(false),
    style = {
      width: state.slotSize,
      height: state.slotSize,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      opacity: hovered ? state.hoverOpacity : 1,
    };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={state.label}
      aria-pressed={hidden}
      accessibilityState={{ checked: hidden }}
      onPress={onToggle}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={style}
    >
      <SourceCustomIcon
        name={state.icon}
        size={20}
        color={sourceColor(`var(${state.iconToken})`, dark)}
      />
    </Pressable>
  );
}
