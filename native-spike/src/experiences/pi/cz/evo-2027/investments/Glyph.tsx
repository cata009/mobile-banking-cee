import React from 'react';
import { SvgXml } from 'react-native-svg';
import {
  SourceCustomIcon,
  sourceCustomIconXml,
} from '../../../../../universal/SourceCustomIcon';

export type InvestmentGlyphName =
  | 'back-heavy'
  | 'close-flow'
  | 'help-circle'
  | 'radio-selected'
  | 'radio-unselected'
  | 'robo-goal-wealth'
  | 'robo-goal-inflation'
  | 'robo-goal-unforeseen'
  | 'robo-goal-purchase'
  | 'robo-goal-retirement'
  | 'robo-withdraw'
  | 'robo-goal-settings'
  | 'investment-history'
  | 'add-money';
export function InvestmentGlyph({
  name,
  size = 24,
  color = '#262626',
}: {
  name: InvestmentGlyphName;
  size?: number;
  color?: string;
}) {
  if (name !== 'radio-selected' && name !== 'radio-unselected')
    return <SourceCustomIcon name={name} size={size} color={color} />;
  const xml = sourceCustomIconXml(name, color)
    ?.replaceAll('var(--uc-surface)', '#FFFFFF')
    .replaceAll('var(--uc-action)', '#007A91');
  return xml ? <SvgXml xml={xml} width={size} height={size} /> : null;
}
