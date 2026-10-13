import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { createDemoStorage } from '../src/platform/demoStorage';
import type { AppointmentRecord } from '@/app/screens/appointments/appointmentModel';
import { CZECH_PROFILE_ADAPTER } from '../src/experiences/pi/cz/evo-2027/profile/adapter';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )
    .at(-1)!;
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(async () => {
    button(tree, label).props.onPress();
  });
}
test('appointment booking uses canonical slots, Back preserves draft, confirmation creates a pending demo meeting', async () => {
  const props: CzechNativeScreenProps = {
    route: { screen: 'appointments' },
    scenario: 'active',
    productCounts: DEFAULT_CZECH_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onSearch: jest.fn(),
    onProfile: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
  };
  const Screen = CZECH_PROFILE_ADAPTER.screens.appointments!;
  let tree!: Renderer.ReactTestRenderer;
  try {
    await act(async () => {
      tree = Renderer.create(<Screen {...props} />);
    });
    expect(button(tree, 'Continue').props.disabled).toBe(true);
    await press(tree, 'Contact reason');
    await press(tree, 'Product related info');
    await press(tree, 'Select');
    await press(tree, 'Online meeting');
    await press(tree, 'Continue');
    expect(button(tree, 'Continue').props.disabled).toBe(true);
    await press(tree, '10:00');
    await press(tree, 'Continue');
    await press(tree, 'Continue without any notes');
    await press(tree, 'Back');
    expect(
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Additional notes'),
    ).toBeDefined();
    await press(tree, 'Continue without any notes');
    await press(tree, 'Confirm');
    expect(JSON.stringify(tree.toJSON())).toContain('successfully');
    await press(tree, 'Ok, got it');
    expect(JSON.stringify(tree.toJSON())).toContain('pending');
  } finally {
    if (tree) await act(async () => tree.unmount());
  }
});
const propsForAppointments = (): CzechNativeScreenProps => ({
  route: { screen: 'appointments' },
  scenario: 'active',
  productCounts: DEFAULT_CZECH_COUNTS,
  amountsHidden: false,
  onBack: jest.fn(),
  onNavigate: jest.fn(),
  onSearch: jest.fn(),
  onProfile: jest.fn(),
  onAmountsToggle: jest.fn(),
  onChanged: jest.fn(),
});
async function seeded(
  record: AppointmentRecord,
  run: (tree: Renderer.ReactTestRenderer) => Promise<void>,
) {
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, 'window'),
    oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const storage = createDemoStorage({
    getItem: async () => null,
    setItem: async () => {},
  }).storage;
  storage.setItem('uc-demo-appointments-v2:CZ', JSON.stringify([record]));
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: globalThis,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
  });
  let tree!: Renderer.ReactTestRenderer;
  const Screen = CZECH_PROFILE_ADAPTER.screens.appointments!;
  try {
    await act(async () => {
      tree = Renderer.create(<Screen {...propsForAppointments()} />);
    });
    await run(tree);
  } finally {
    if (tree) await act(async () => tree.unmount());
    if (oldWindow) Object.defineProperty(globalThis, 'window', oldWindow);
    else Reflect.deleteProperty(globalThis, 'window');
    if (oldStorage)
      Object.defineProperty(globalThis, 'localStorage', oldStorage);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
}
const pastRecord: AppointmentRecord = {
  id: 'past-native-review',
  reasons: ['Product related info'],
  details: ['Accounts & cards'],
  appointmentDate: '2026-01-15',
  meetingType: 'online',
  branchName: 'Branch name 36',
  branchAddress: 'Praha',
  selectedTime: '10:00',
  notes: '',
  email: 'demo@example.test',
  advisorName: 'Fixture Advisor',
  status: 'completed',
  createdAt: 0,
};
test('booking from seeded Past meetings returns to Active and shows the new pending meeting', async () => {
  await seeded(pastRecord, async tree => {
    await press(tree, 'Past meetings');
    await press(tree, 'Book an appointment');
    await press(tree, 'Contact reason');
    await press(tree, 'Product related info');
    await press(tree, 'Select');
    await press(tree, 'Online meeting');
    await press(tree, 'Continue');
    await press(tree, '10:00');
    await press(tree, 'Continue');
    await press(tree, 'Continue without any notes');
    await press(tree, 'Confirm');
    await press(tree, 'Ok, got it');
    expect(
      button(tree, 'Active meetings').props.accessibilityState.selected,
    ).toBe(true);
    expect(JSON.stringify(tree.toJSON())).toContain('pending');
  });
});
test('saved feedback uses Source human labels rather than persisted reason IDs', async () => {
  await seeded(
    {
      ...pastRecord,
      feedback: {
        rating: 1,
        comment: 'Demo feedback',
        reason: 'organizedMeeting',
        reasonDetail: 'waitingTime',
      },
    },
    async tree => {
      await press(tree, 'Past meetings');
      const meeting = tree.root
        .findAll(
          node =>
            typeof node.props.onPress === 'function' &&
            node.props.accessibilityLabel?.includes('Fixture Advisor'),
        )
        .at(-1)!;
      await act(async () => meeting.props.onPress());
      const rendered = JSON.stringify(tree.toJSON());
      expect(rendered).toContain(
        'There was a problem related with the organized meeting',
      );
      expect(rendered).toContain(
        'The waiting time was not respected and I had to wait',
      );
      expect(rendered).not.toContain('organizedMeeting');
      expect(rendered).not.toContain('waitingTime');
    },
  );
});
