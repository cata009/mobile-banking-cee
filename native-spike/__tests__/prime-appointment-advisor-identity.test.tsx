import React from 'react';
import { Image, type ImageSourcePropType } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import Appointment from '../src/experiences/pi/current/baseline/more/Appointment';
import { AppointmentHost } from '../src/experiences/pi/current/baseline/more/appointment/Ui';
import {
  MeetingDetail,
  AppointmentReview,
  Slots,
} from '../src/experiences/pi/current/baseline/more/appointment/MeetingViews';
import { advisorPhoto as sourceAdvisorPhoto } from '../src/experiences/pi/current/profile/assets';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  APPOINTMENT_REASON_OPTIONS,
  DEFAULT_CLIENT_EMAIL,
  createDemoAppointments,
} from '@/app/screens/appointments/appointmentModel';
import { createAppointmentDraft } from '@/features/profile/evoAppointments';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';

const host: CurrentScreenProps = {
  country: 'CZ',
  release: 'release-current',
  scenario: 'active',
  language: 'en',
  productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
  route: { screen: 'appointments' },
  tokens: currentTokens(),
  t: createCurrentTranslator('CZ', 'en'),
  amountsHidden: false,
  screenTopInset: 44,
  isActive: true,
  mode: 'light',
  onNavigate: jest.fn(),
  onBack: jest.fn(),
  onProfile: jest.fn(),
  onSearch: jest.fn(),
  onAmountsToggle: jest.fn(),
  onChanged: jest.fn(),
  onLanguageChange: jest.fn(),
  onModeChange: jest.fn(),
};
const text = (_key: string, fallback: string) => fallback;

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 7, 9));
});

it.each([undefined, 'marco.rossi@example.com', 'mihaela.popescu@example.com'])(
  'uses the optional client receipt email %s without changing the Source default',
  async clientEmail => {
    let tree!: Renderer.ReactTestRenderer;
    await act(async () => {
      tree = Renderer.create(
        <Appointment
          {...host}
          clientEmail={clientEmail}
          appointmentStore={{ load: () => [], save: jest.fn() }}
        />,
      );
    });
    const press = (label: string) => {
      const control = tree.root.findAll(
        node =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onPress === 'function',
      )[0];
      expect(control).toBeDefined();
      act(() => control!.props.onPress({ stopPropagation: jest.fn() }));
    };
    press('Open What do you want to talk about?');
    press(APPOINTMENT_REASON_OPTIONS[0]!.title);
    press('Select');
    press('Branch meeting');
    press('Continue');
    act(() => tree.root.findByType(Slots).props.onSelect('10:00'));
    press('Continue');
    press('Continue without any notes');
    expect(tree.root.findByType(AppointmentReview).props.draft.email).toBe(
      clientEmail ?? DEFAULT_CLIENT_EMAIL,
    );
    await act(async () => tree.unmount());
  },
);
afterEach(() => {
  jest.useRealTimers();
});

it.each([
  {
    label: 'Prime',
    name: 'Iacob Mihai',
    photo: { uri: 'test://iacob-portrait' } as ImageSourcePropType,
  },
  {
    label: 'Private',
    name: 'Anna Dvořáková',
    photo: { uri: 'test://anna-portrait' } as ImageSourcePropType,
  },
  { label: 'Default Source', name: 'David Novak', photo: undefined },
])(
  'keeps the $label portrait aligned with identity in interval selection and managed meeting detail',
  async ({ name, photo }) => {
    const draft = createAppointmentDraft('Branch', 'Address');
    const record = { ...createDemoAppointments()[0]!, advisorName: name };
    let tree!: Renderer.ReactTestRenderer;
    await act(async () => {
      tree = Renderer.create(
        <AppointmentHost host={host} advisorPhoto={photo}>
          <Slots
            draft={draft}
            slotDate={draft.appointmentDate}
            slots={['10:00']}
            directSlots={['10:00']}
            locale="en-GB"
            advisor={name}
            advisorPhone="+420 602 123 456"
            more={false}
            onMore={jest.fn()}
            onSelect={jest.fn()}
            text={text}
          />
          <MeetingDetail
            record={record}
            locale="en-GB"
            onBack={jest.fn()}
            onMap={jest.fn()}
            onDelete={jest.fn()}
            onFeedback={jest.fn()}
            text={text}
            feedbackLabel={value => value}
          />
        </AppointmentHost>,
      );
    });
    const portraits = tree.root
      .findAllByType(Image)
      .filter(image => image.props.accessibilityLabel === name);
    expect(portraits).toHaveLength(2);
    for (const portrait of portraits)
      expect(portrait.props.source).toEqual(photo ?? sourceAdvisorPhoto);
    await act(async () => tree.unmount());
  },
);

it('carries the optional portrait from the complete Appointment entry into its interval screen', async () => {
  const photo = { uri: 'test://iacob-entry-portrait' };
  const entryHost = {
    ...host,
    t: (key: string, fallback?: string) =>
      key === 'prime.advisor.name' ? 'Iacob Mihai' : host.t(key, fallback),
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <Appointment
        {...entryHost}
        advisorPhoto={photo}
        appointmentStore={{ load: () => [], save: jest.fn() }}
      />,
    );
  });
  const press = (label: string) => {
    const control = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )[0];
    expect(control).toBeDefined();
    act(() => control!.props.onPress({ stopPropagation: jest.fn() }));
  };
  press('Open What do you want to talk about?');
  press(APPOINTMENT_REASON_OPTIONS[0]!.title);
  press('Select');
  press('Branch meeting');
  press('Continue');
  const portrait = tree.root
    .findAllByType(Image)
    .find(image => image.props.accessibilityLabel === 'Iacob Mihai');
  expect(portrait?.props.source).toEqual(photo);
  await act(async () => tree.unmount());
});
