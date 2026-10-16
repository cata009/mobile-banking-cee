import React from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { SlotExpansion } from '../src/experiences/pi/current/baseline/more/appointment/SlotExpansion';
import Appointment from '../src/experiences/pi/current/baseline/more/Appointment';
import CallRequest from '../src/experiences/pi/current/baseline/more/CallRequest';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  createDemoAppointments,
  APPOINTMENT_REASON_OPTIONS,
  APPOINTMENT_DETAIL_OPTIONS,
  fromAppointmentDateKey,
} from '@/app/screens/appointments/appointmentModel';
import { loadAppointments } from '../src/experiences/pi/current/profile/appointmentStorage';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { SvgXml } from 'react-native-svg';
import { sourceColor } from '../src/universal/sourceColor';

function host(screen: 'appointments' | 'call-request'): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: {
      accounts: 2,
      debitCards: 2,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 1,
      investments: 1,
    },
    route: { screen },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
    onBackHandlerChange: jest.fn(),
  };
}
const trees: Renderer.ReactTestRenderer[] = [];
beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 14, 10, 0));
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
});

it('animates measured extra slots, reverses from the current extent and stops on unmount', () => {
  const timing = Animated.timing;
  const animations: Array<{ stop: jest.Mock }> = [];
  const timingSpy = jest
    .spyOn(Animated, 'timing')
    .mockImplementation((...args) => {
      const animation = timing(...args);
      const tracked = { ...animation, stop: jest.fn(() => animation.stop()) };
      animations.push(tracked);
      return tracked;
    });
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <SlotExpansion expanded={false}>
        <View />
      </SlotExpansion>,
    );
  });
  const inner = () =>
    tree.root
      .findAllByType(View)
      .find(node => node.props.testID === 'ro-slot-expansion-content')!;
  const frame = () =>
    tree.root
      .findAllByType(View)
      .find(node => node.props.testID === 'ro-slot-expansion')!;
  const values = () => StyleSheet.flatten(frame().props.style);
  act(() =>
    inner().props.onLayout({ nativeEvent: { layout: { height: 120 } } }),
  );
  expect(values()).toMatchObject({ height: 0, opacity: 0, overflow: 'hidden' });
  act(() =>
    tree.update(
      <SlotExpansion expanded>
        <View />
      </SlotExpansion>,
    ),
  );
  act(() => jest.advanceTimersByTime(150));
  expect(values().height).toBeGreaterThan(0);
  expect(values().height).toBeLessThan(120);
  expect(values().opacity).toBeGreaterThan(0);
  expect(values().opacity).toBeLessThan(1);
  act(() => jest.advanceTimersByTime(170));
  expect(values()).toMatchObject({ height: 120, opacity: 1 });
  act(() =>
    tree.update(
      <SlotExpansion expanded={false}>
        <View />
      </SlotExpansion>,
    ),
  );
  expect(frame().props.accessibilityElementsHidden).toBe(true);
  act(() => jest.advanceTimersByTime(100));
  const closingHeight = values().height;
  const closingOpacity = values().opacity;
  act(() =>
    tree.update(
      <SlotExpansion expanded>
        <View />
      </SlotExpansion>,
    ),
  );
  expect(values().height).toBe(closingHeight);
  const reversal = timingSpy.mock.calls.at(-1)![1];
  expect(reversal.duration).toBe(300 * (1 - closingOpacity));
  expect(reversal.easing!(0.5)).toBe(Easing.bezier(0.4, 0, 0.2, 1)(0.5));
  act(() => jest.advanceTimersByTime(320));
  expect(values()).toMatchObject({ height: 120, opacity: 1 });
  act(() =>
    tree.update(
      <SlotExpansion expanded={false}>
        <View />
      </SlotExpansion>,
    ),
  );
  act(() => jest.advanceTimersByTime(100));
  act(() => tree.unmount());
  expect(animations.at(-1)!.stop).toHaveBeenCalledTimes(1);
  timingSpy.mockRestore();
});

it('cancels uncommitted selection, restricts calendar dates and uses Source fallback availability', () => {
  const tree = mount(Appointment, host('appointments'));
  press(tree, 'Book an appointment');
  press(tree, 'Open What do you want to talk about?');
  press(tree, APPOINTMENT_REASON_OPTIONS[0].title);
  press(tree, 'Close');
  expect(control(tree, 'Continue').props.disabled).toBe(true);
  selectReason(tree);
  press(tree, 'Branch meeting');
  press(tree, 'Open Appointment date');
  const fullDate = (key: string) =>
    new Intl.DateTimeFormat('en-RO', { dateStyle: 'full' }).format(
      fromAppointmentDateKey(key),
    );
  expect(control(tree, fullDate('2026-10-17')).props.disabled).toBe(true);
  expect(control(tree, fullDate('2026-10-13')).props.disabled).toBe(true);
  press(tree, 'Next month');
  press(tree, fullDate('2026-11-03'));
  expect(control(tree, 'Next month')).toBeUndefined();
  press(tree, 'Continue');
  expect(content(tree)).toContain('No available time slots for');
  expect(content(tree)).toContain('04 November');
  expect(control(tree, '16:30').props.disabled).toBe(true);
  press(tree, 'See more slots');
  expect(control(tree, '16:30')).toBeDefined();
  expect(control(tree, '16:30').props.disabled).toBe(false);
  press(tree, 'See less slots');
  expect(control(tree, '16:30').props.disabled).toBe(true);
  press(tree, 'See more slots');
  press(tree, '16:30');
  press(tree, 'Next day');
  expect(control(tree, 'Continue').props.disabled).toBe(true);
});

it('consumes host Back within the flow before leaving the appointments route', () => {
  const h = host('appointments'),
    tree = mount(Appointment, h);
  press(tree, 'Book an appointment');
  selectReason(tree);
  press(tree, 'Online meeting');
  press(tree, 'Continue');
  press(tree, '10:00');
  press(tree, 'Continue');
  const registered = (h.onBackHandlerChange as jest.Mock).mock.calls.at(
    -1,
  )?.[0] as () => boolean;
  act(() => {
    expect(registered()).toBe(true);
  });
  expect(content(tree)).toContain('Select available interval');
  expect(h.onBack).not.toHaveBeenCalled();
});

it.each([
  ['appointments', Appointment],
  ['call-request', CallRequest],
] as const)(
  '%s returns unconsumed Back at the route entry and lets the host pop exactly once',
  (screen, Component) => {
    const h = host(screen),
      tree = mount(Component, h);
    const registered = () =>
      (h.onBackHandlerChange as jest.Mock).mock.calls.at(
        -1,
      )?.[0] as () => boolean;
    act(() => {
      expect(registered()()).toBe(false);
    });
    expect(h.onBack).not.toHaveBeenCalled();
    if (screen === 'appointments') {
      press(tree, 'Book an appointment');
      act(() => {
        expect(registered()()).toBe(false);
      });
      expect(h.onBack).not.toHaveBeenCalled();
    }
    const pop = jest.fn();
    (h.onBack as jest.Mock).mockImplementation(() => {
      if (!registered()()) pop();
    });
    press(tree, 'Back');
    expect(h.onBack).toHaveBeenCalledTimes(1);
    expect(pop).toHaveBeenCalledTimes(1);
  },
);

it('callback host Back closes internal notes before returning control at the form', () => {
  const h = host('call-request'),
    tree = mount(CallRequest, h);
  selectReason(tree);
  press(tree, 'Open Give us more details about your request');
  press(tree, APPOINTMENT_DETAIL_OPTIONS[0]);
  press(tree, 'Select');
  press(tree, 'Open Contact me during');
  press(tree, '09:00 - 11:00');
  press(tree, 'Select');
  press(tree, 'Continue');
  const registered = () =>
    (h.onBackHandlerChange as jest.Mock).mock.calls.at(
      -1,
    )?.[0] as () => boolean;
  act(() => {
    expect(registered()()).toBe(true);
  });
  expect(control(tree, 'Open What do you want to talk about?')).toBeDefined();
  expect(h.onBack).not.toHaveBeenCalled();
  act(() => {
    expect(registered()()).toBe(false);
  });
  expect(h.onBack).not.toHaveBeenCalled();
});
afterEach(() => {
  act(() => trees.splice(0).forEach(tree => tree.unmount()));
  jest.useRealTimers();
});
function mount(
  Component: React.ComponentType<CurrentScreenProps>,
  h: CurrentScreenProps,
) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Component {...h} />);
  });
  trees.push(tree);
  return tree;
}
function control(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0];
}
function press(tree: Renderer.ReactTestRenderer, label: string) {
  const node = control(tree, label);
  expect(node).toBeDefined();
  act(() => node.props.onPress({ stopPropagation: jest.fn() }));
}
function content(tree: Renderer.ReactTestRenderer) {
  const visible = (
    node:
      | Renderer.ReactTestRendererJSON
      | Renderer.ReactTestRendererJSON[]
      | string
      | null,
  ): string =>
    typeof node === 'string'
      ? node
      : Array.isArray(node)
      ? node.map(visible).join('')
      : node?.children?.map(visible).join('') ?? '';
  return JSON.stringify(tree.toJSON()) + '\n' + visible(tree.toJSON());
}
function selectReason(tree: Renderer.ReactTestRenderer) {
  press(tree, 'Open What do you want to talk about?');
  press(tree, APPOINTMENT_REASON_OPTIONS[0].title);
  press(tree, 'Select');
}

it('renders Source appointment rows with short date, meeting/reason/advisor and fixed tabs', () => {
  const tree = mount(Appointment, host('appointments'));
  expect(content(tree)).toContain('Branch Meeting - 12:30');
  expect(content(tree)).toContain('Product related info');
  expect(content(tree)).toContain('DAVID NOVAK');
  expect(content(tree)).toContain('OCT');
  expect(content(tree)).not.toContain('David Novak · confirmed');
  expect(tree.root.findByType(BaselinePageHeader).props.showHelp).toBe(false);
  press(tree, 'Past meetings');
  expect(content(tree)).toContain('Branch Meeting - 10:30');
});

it('uses the actual dark page surface inside both unselected meeting radios', () => {
  const h = host('appointments');
  h.tokens = currentTokens(true);
  h.mode = 'dark';
  const tree = mount(Appointment, h);
  press(tree, 'Book an appointment');
  const radios = tree.root
    .findAllByType(SourceCustomIcon)
    .filter(icon => icon.props.name === 'radio-unselected');
  expect(radios).toHaveLength(2);
  for (const radio of radios)
    expect(radio.findByType(SvgXml).props.xml).toContain(
      `fill="${sourceColor('var(--uc-surface)', true)}"`,
    );
});

it('books an appointment through required selections, slot, notes and validated email', () => {
  const h = host('appointments'),
    tree = mount(Appointment, h);
  press(tree, 'Book an appointment');
  expect(control(tree, 'Continue').props.disabled).toBe(true);
  selectReason(tree);
  press(tree, 'Branch meeting');
  press(tree, 'Continue');
  expect(content(tree)).toContain('Select available interval');
  expect(control(tree, 'Continue').props.disabled).toBe(true);
  press(tree, '10:00');
  press(tree, 'Continue');
  press(tree, 'Continue without any notes');
  expect(content(tree)).toContain('Appointment review');
  const email = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === 'Your email address' &&
      typeof n.props.onChangeText === 'function',
  )[0];
  act(() => email.props.onChangeText('invalid'));
  expect(control(tree, 'Confirm').props.disabled).toBe(true);
  act(() => email.props.onChangeText('client@example.com'));
  press(tree, 'Confirm');
  expect(content(tree)).toContain('Appointment request was successfully sent');
  const saved = loadAppointments('RO').find(
    item => item.email === 'client@example.com',
  );
  expect(saved).toMatchObject({
    selectedTime: '10:00',
    status: 'pending',
    meetingType: 'branch',
  });
  press(tree, 'Ok, got it');
  expect(content(tree)).toContain('My appointments');
});

it('opens Source appointment detail and map, cancels then confirms deletion', () => {
  const tree = mount(Appointment, host('appointments'));
  const record = createDemoAppointments().find(
    item => item.status === 'confirmed' && item.meetingType === 'branch',
  )!;
  press(tree, `Open appointment ${record.id}`);
  expect(content(tree)).toContain('CONFIRMED - BRANCH MEETING');
  press(tree, 'See location on the map');
  expect(content(tree)).toContain('60m');
  expect(content(tree)).not.toContain('Demo branch map');
  press(tree, 'Close map');
  press(tree, 'Delete meeting');
  press(tree, 'Cancel');
  expect(loadAppointments('RO').some(item => item.id === record.id)).toBe(true);
  press(tree, 'Delete meeting');
  press(tree, 'OK');
  expect(loadAppointments('RO').some(item => item.id === record.id)).toBe(
    false,
  );
});

it('requires nested low-rating feedback and returns to Source list after saving', () => {
  const tree = mount(Appointment, host('appointments'));
  press(tree, 'Past meetings');
  const record = createDemoAppointments().find(
    item => item.status === 'completed' && !item.feedback,
  )!;
  press(tree, `Open appointment ${record.id}`);
  press(tree, '1 stars');
  expect(control(tree, 'Submit').props.disabled).toBe(true);
  press(tree, 'There was a problem related with the organized meeting');
  expect(control(tree, 'Submit').props.disabled).toBe(true);
  press(tree, 'Technical issues with the meeting');
  press(tree, 'Submit');
  expect(
    loadAppointments('RO').find(item => item.id === record.id)?.feedback,
  ).toMatchObject({
    rating: 1,
    reason: 'organizedMeeting',
    reasonDetail: 'technicalIssues',
  });
  expect(content(tree)).toContain('Your feedback was successfully sent');
  press(tree, 'Ok, got it');
  expect(content(tree)).toContain('My appointments');
});

it('preserves RO callback identity and requires committed selections before notes/review/success', () => {
  const h = host('call-request'),
    tree = mount(CallRequest, h);
  expect(content(tree)).toContain('+40');
  expect(content(tree)).toContain('721234567');
  expect(control(tree, 'Continue').props.disabled).toBe(true);
  selectReason(tree);
  press(tree, 'Open Give us more details about your request');
  press(tree, APPOINTMENT_DETAIL_OPTIONS[0]);
  press(tree, 'Select');
  press(tree, 'Open Contact me during');
  press(tree, '09:00 - 11:00');
  press(tree, 'Select');
  press(tree, 'Continue');
  press(tree, 'Continue without any notes');
  expect(content(tree)).toContain('Request a call review');
  expect(content(tree)).toContain('+40 721234567');
  press(tree, 'Confirm');
  expect(content(tree)).toContain('Request a call successfully confirmed');
  const registered = (h.onBackHandlerChange as jest.Mock).mock.calls.at(
    -1,
  )?.[0] as () => boolean;
  act(() => {
    expect(registered()).toBe(false);
  });
  expect(h.onBack).not.toHaveBeenCalled();
  const pop = jest.fn();
  (h.onBack as jest.Mock).mockImplementation(() => {
    if (!registered()) pop();
  });
  press(tree, 'Ok, got it');
  expect(h.onBack).toHaveBeenCalledTimes(1);
  expect(pop).toHaveBeenCalledTimes(1);
});
