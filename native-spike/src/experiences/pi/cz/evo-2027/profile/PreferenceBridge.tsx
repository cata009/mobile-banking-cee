import React, { useEffect } from 'react';
import type { ComponentType } from 'react';
import type { CzechNativeScreenProps } from '../contracts';
import { czechPreferences } from './features/preferences';

export function withCzechPreferences(
  Screen: ComponentType<CzechNativeScreenProps>,
): ComponentType<CzechNativeScreenProps> {
  return function CzechPreferenceScreen(props: CzechNativeScreenProps) {
    const { language, mode, homeTheme, isActive } = props;
    useEffect(() => {
      if (isActive === false) return;
      czechPreferences.synchronize({ language, mode, homeTheme });
    }, [language, mode, homeTheme, isActive]);
    return <Screen {...props} />;
  };
}
