import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { getProfileIconRoute } from '../src/experiences/pi/current/profile/profileNavigation';
import Home from '../src/experiences/pi/current/Home';
import { CURRENT_PROFILE_ADAPTER } from '../src/experiences/pi/current/profile/adapter';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { mobileFirstTokens } from '../src/universal/tokens';
import {
  getRomanianProfileSnapshot,
  resetRomanianProfile,
} from '@/features/profile/roPersonalProfile';

function createHost(): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    tokens: mobileFirstTokens,
    productCounts: {
      accounts: 1,
      debitCards: 1,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 0,
      investments: 1,
    },
    route: { screen: 'profile', params: { area: 'my-data' } },
    amountsHidden: false,
    screenTopInset: 0,
    isActive: true,
    t: (_key, fallback) => fallback ?? _key,
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
  };
}

function press(tree: Renderer.ReactTestRenderer, label: string) {
  const button = tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )
    .at(-1);
  if (!button) throw new Error(`Missing pressable control: ${label}`);
  act(() => button.props.onPress());
}

function type(tree: Renderer.ReactTestRenderer, label: string, value: string) {
  const input = tree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === label);
  if (!input) throw new Error(`Missing text input: ${label}`);
  act(() => input.props.onChangeText(value));
}

function renderProfile(host: CurrentScreenProps) {
  const Profile = CURRENT_PROFILE_ADAPTER.screens.profile!;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Profile {...host} />);
  });
  return tree;
}

describe('Romanian Personal Profile', () => {
  beforeEach(() => resetRomanianProfile());

  it('opens My data from the RO Profile icon while other markets keep More', () => {
    expect(getProfileIconRoute('RO')).toEqual({
      screen: 'profile',
      params: { area: 'my-data' },
    });
    expect(getProfileIconRoute('CZ')).toEqual({ screen: 'profile' });
  });

  it('wires the RO homepage Profile control to the supplied profile action', () => {
    const host = createHost();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<Home {...host} />);
    });
    try {
      press(tree, 'Profile');
      expect(host.onProfile).toHaveBeenCalledTimes(1);
    } finally {
      act(() => tree.unmount());
    }
  });

  it('routes RO Profile to My data and keeps More on the bottom navigation route', () => {
    const personal = createHost();
    const personalTree = renderProfile(personal);
    try {
      expect(JSON.stringify(personalTree.toJSON())).toContain('My data');
    } finally {
      act(() => personalTree.unmount());
    }

    const more = createHost();
    more.route = { screen: 'profile' };
    const moreTree = renderProfile(more);
    try {
      expect(JSON.stringify(moreTree.toJSON())).toContain('More');
      expect(JSON.stringify(moreTree.toJSON())).not.toContain('My data');
    } finally {
      act(() => moreTree.unmount());
    }
  });

  it('shows Figma profile data and saves a verified contact change end to end', () => {
    const host = createHost();
    const tree = renderProfile(host);
    try {
      expect(JSON.stringify(tree.toJSON())).toContain('Mihai Catalin Iacob');
      expect(JSON.stringify(tree.toJSON())).toContain('Personal data');

      press(tree, 'Contact data');
      press(tree, 'Edit contact data');
      press(
        tree,
        'I agree that my personal data will be managed and updated by UniCredit Bank.',
      );
      press(tree, 'Start');
      type(tree, 'Phone number', '+40721234567');
      press(tree, 'Continue');
      type(tree, 'Verification code', '123456');
      press(tree, 'Verify');

      expect(getRomanianProfileSnapshot().phone).toBe('+40721234567');
      expect(JSON.stringify(tree.toJSON())).toContain(
        'Your data has been updated',
      );
    } finally {
      act(() => tree.unmount());
    }
  });

  it('verifies and saves an email address through the contact tabs', () => {
    const host = createHost();
    const tree = renderProfile(host);
    try {
      press(tree, 'Contact data');
      press(tree, 'Edit contact data');
      press(
        tree,
        'I agree that my personal data will be managed and updated by UniCredit Bank.',
      );
      press(tree, 'Start');
      press(tree, 'Email address');
      type(tree, 'Email address', 'mihai@example.com');
      press(tree, 'Continue');
      type(tree, 'Verification code', '123456');
      press(tree, 'Verify');

      expect(getRomanianProfileSnapshot().email).toBe('mihai@example.com');
      expect(getRomanianProfileSnapshot().verifiedEmail).toBe(true);
      expect(JSON.stringify(tree.toJSON())).toContain(
        'Your data has been updated',
      );
    } finally {
      act(() => tree.unmount());
    }
  });

  it('updates an address after authorization and sends an identity scan for review', () => {
    const host = createHost();
    const tree = renderProfile(host);
    try {
      press(tree, 'Contact data');
      press(tree, 'Edit addresses');
      press(
        tree,
        'I agree that my personal data will be managed and updated by UniCredit Bank.',
      );
      press(tree, 'Start');
      press(tree, 'Select a new address');
      type(tree, 'Country', 'Romania');
      type(tree, 'County / Sector', 'Sector 3');
      type(tree, 'City', 'Bucuresti');
      type(tree, 'Street name', 'Unirii');
      type(tree, 'Street number', '10');
      type(tree, 'Building', 'A');
      type(tree, 'Staircase', '1');
      type(tree, 'Floor', '4');
      type(tree, 'Apartment', '12');
      type(tree, 'Postal code', '030167');
      press(tree, 'Continue');
      type(tree, 'Verification code', '123456');
      press(tree, 'Verify');
      expect(getRomanianProfileSnapshot().residenceAddress.city).toBe(
        'Bucuresti',
      );
      expect(getRomanianProfileSnapshot().residenceAddress.street).toBe(
        'Unirii',
      );

      press(tree, 'Back to My data');
      press(tree, 'Edit personal data');
      press(
        tree,
        'I agree that my personal data will be managed and updated by UniCredit Bank.',
      );
      press(tree, 'Start');
      press(tree, 'Capture document');
      press(tree, 'Send for review');
      expect(getRomanianProfileSnapshot().identityReviewPending).toBe(true);
      expect(JSON.stringify(tree.toJSON())).toContain(
        'Your document was sent for review',
      );
    } finally {
      act(() => tree.unmount());
    }
  });
});
