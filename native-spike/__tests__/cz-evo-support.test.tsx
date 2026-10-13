import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { CZECH_PROFILE_ADAPTER } from '../src/experiences/pi/cz/evo-2027/profile/adapter';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { getTutorialsForCountry } from '@/app/config/tutorialsConfig';
import {
  getInitialAppointmentDate,
  formatAppointmentDate,
} from '@/app/screens/appointments/appointmentModel';
import { translateCzech } from '../src/experiences/pi/cz/evo-2027/profile/features/preferences';
const mounted: Renderer.ReactTestRenderer[] = [];
const control = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )
    .at(-1)!;
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(async () => {
    control(tree, label).props.onPress();
  });
}
async function type(
  tree: Renderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  await act(async () => {
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!
      .props.onChangeText(value);
  });
}
async function render(
  screen: 'support' | 'call-request',
  params?: Record<string, string>,
) {
  const props: CzechNativeScreenProps = {
    route: { screen, params },
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
  const Screen = CZECH_PROFILE_ADAPTER.screens[screen]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Screen {...props} />);
  });
  mounted.push(tree);
  return { tree, props };
}
afterEach(async () => {
  await act(async () => mounted.splice(0).forEach(tree => tree.unmount()));
});
test('callback sheets cancel drafts and changing confirmed reason clears the previous detail', async () => {
  const { tree } = await render('call-request');
  expect(control(tree, 'Continue').props.disabled).toBe(true);
  await press(tree, 'What do you want to talk about?');
  await press(tree, 'Product related info');
  await press(tree, 'Close');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Product related info');
  await press(tree, 'What do you want to talk about?');
  await press(tree, 'Product related info');
  await press(tree, 'Select');
  await press(tree, 'Give us more details about your request');
  await press(tree, 'Accounts & cards');
  await press(tree, 'Select');
  await press(tree, 'What do you want to talk about?');
  await press(tree, 'I want to invest');
  await press(tree, 'Select');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Accounts & cards');
});
test('callback requires phone/date/interval and preserves notes through review Back', async () => {
  const { tree } = await render('call-request');
  await press(tree, 'What do you want to talk about?');
  await press(tree, 'Product related info');
  await press(tree, 'Select');
  await press(tree, 'Give us more details about your request');
  await press(tree, 'Accounts & cards');
  await press(tree, 'Select');
  await press(tree, 'Contact me during');
  await press(tree, '09:00 - 11:00');
  await press(tree, 'Select');
  await type(tree, 'Mobile number', '1');
  expect(control(tree, 'Continue').props.disabled).toBe(true);
  await type(tree, 'Mobile number', '602123456');
  expect(control(tree, 'Continue').props.disabled).toBe(false);
  await press(tree, 'Continue');
  await type(tree, 'Additional notes', 'Please call after ten');
  await press(tree, 'Continue');
  await press(tree, 'Back');
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Additional notes')!.props
      .value,
  ).toBe('Please call after ten');
  await press(tree, 'Continue');
  await press(tree, 'Confirm');
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Request a call successfully confirmed',
  );
});
test('tutorial retains canonical order and bounded step navigation', async () => {
  const { tree, props } = await render('support', { area: 'tutorials' });
  const tutorial = getTutorialsForCountry('CZ')[0];
  await press(tree, `Open tutorial: ${tutorial.title}`);
  expect(JSON.stringify(tree.toJSON())).toContain(tutorial.slides[0].title);
  expect(control(tree, 'Previous tutorial step').props.disabled).toBe(true);
  for (let i = 1; i < tutorial.slides.length; i++) await press(tree, 'NEXT');
  expect(JSON.stringify(tree.toJSON())).toContain(
    tutorial.slides.at(-1)!.title,
  );
  await press(tree, 'DONE');
  expect(props.onBack).toHaveBeenCalledTimes(1);
});
test('advisor email is a local demo and Back to chooser preserves the subject/body draft', async () => {
  const { tree } = await render('support', { area: 'advisor' });
  await press(tree, translateCzech('prime.advisor.sendEmail', 'Send email'));
  await press(tree, 'Gmail');
  await type(tree, 'Subject', 'Help');
  await type(tree, 'Message', 'A local demo draft');
  await press(tree, 'Back');
  await press(tree, 'Gmail');
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Subject')!.props.value,
  ).toBe('Help');
  await press(tree, 'Send');
  expect(JSON.stringify(tree.toJSON())).toContain('Demo message');
});
test('callback preserves Source static country and rejects weekend selection without changing its date', async () => {
  const { tree } = await render('call-request');
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Country code' &&
        typeof node.props.onPress === 'function',
    ),
  ).toHaveLength(0);
  const original = formatAppointmentDate(getInitialAppointmentDate(), 'en-CZ');
  await press(tree, 'Preferred callback date');
  const saturday = new Date();
  saturday.setDate(saturday.getDate() + ((6 - saturday.getDay() + 7) % 7 || 7));
  const label = new Intl.DateTimeFormat('en-CZ', { dateStyle: 'long' }).format(
    saturday,
  );
  await press(tree, label);
  expect(JSON.stringify(tree.toJSON())).toContain('Choose a weekday.');
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(
        node => node.props.accessibilityLabel === 'Preferred callback date',
      )!.props.value,
  ).toBe(original);
  await press(tree, 'Close');
});
test('a new advisor message starts blank after a completed demo message closes', async () => {
  const { tree } = await render('support', { area: 'advisor' });
  await press(tree, translateCzech('prime.advisor.sendEmail', 'Send email'));
  await press(tree, 'Gmail');
  await type(tree, 'Subject', 'Already sent');
  await type(tree, 'Message', 'Private previous body');
  await press(tree, 'Send');
  await press(tree, 'Done');
  await press(tree, translateCzech('prime.advisor.sendEmail', 'Send email'));
  await press(tree, 'Gmail');
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Subject')!.props.value,
  ).toBe('');
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Message')!.props.value,
  ).toBe('');
});
