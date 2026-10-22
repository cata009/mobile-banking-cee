import React from 'react';
import type { AppLanguage } from '@/app/registry/languageByCountry';
import { Copy, Button, Frame } from './controls';
import RomanianKids from './ro/App';
import HungarianKids from './hu/App';
import SlovakKids from './sk/App';
export interface NativeKidsProps {
  country: 'RO' | 'SK' | 'HU';
  scenario: 'active' | 'inactive';
  onExit?: () => void;
  screenTopInset?: number;
  bottomInset?: number;
  language?: AppLanguage;
}
/** Source Kids defines active market compositions, with no child activation flow. */
export default function NativeKidsApp(props: NativeKidsProps) {
  if (props.scenario === 'inactive')
    return (
      <Frame
        title="Kids · inactive"
        top={props.screenTopInset}
        bottom={props.bottomInset}
        onBack={props.onExit}
      >
        <Copy>The Kids demo is unavailable in inactive mode.</Copy>
        <Button label="Demo selector" onPress={props.onExit} />
      </Frame>
    );
  const Screen = { RO: RomanianKids, HU: HungarianKids, SK: SlovakKids }[
    props.country
  ];
  if (!Screen)
    return (
      <Frame
        title="Kids demo unavailable"
        top={props.screenTopInset}
        bottom={props.bottomInset}
        onBack={props.onExit}
      >
        <Button label="Demo selector" onPress={props.onExit} />
      </Frame>
    );
  return <Screen key={props.country} {...props} />;
}
