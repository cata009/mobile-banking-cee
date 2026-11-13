import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { DateField, CalendarPanel } from '../src/universal/DateField';
import { SourceCustomIcon, sourceCustomIconXml } from '../src/universal/SourceCustomIcon';
import { mobileFirstTokens as tokens } from '../src/universal/tokens';

it('opens a calendar from the date and uses the baseline close control', () => {
  expect(sourceCustomIconXml('insurance-calendar')).toContain('M25.125 14.125V23.5');
  let tree!: Renderer.ReactTestRenderer;
  act(() => { tree = Renderer.create(<DateField tokens={tokens} label="PAYMENT DATE" value="2026-11-13" onChange={() => {}} openCalendarOnFieldPress />); });
  act(() => tree.root.findByProps({ accessibilityLabel: 'Open calendar for PAYMENT DATE' }).props.onPress());
  expect(tree.root.findByType(CalendarPanel).findAllByType(SourceCustomIcon).find(icon => icon.props.name === 'close-x')?.props.size).toBe(32);
});
