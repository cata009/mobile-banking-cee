import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import { NATIVE_COMPONENT_PREVIEW_ADAPTER } from '../src/app/componentPreviewAdapter';
import { BaselineDetailToolbar } from '../src/universal/BaselineDetailToolbar';
import { BaselineBottomNavigation } from '../src/universal/BaselineBottomNavigation';
import type { NativeDemoControl } from '@/features/demo-native/contracts';

test('a detail-header fragment reuses the customer toolbar and never adds a complete page or navigation dock', () => {
  const events = {
    onRouteChange: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onAmountsHiddenChange: jest.fn(),
    onExit: jest.fn(),
    onHelpRequest: jest.fn(),
  };
  const control: NativeDemoControl = {
    route: { screen: 'account' },
    language: 'en',
    mode: 'light',
    amountsHidden: false,
    events,
    componentPreview: {
      kind: 'detail-header',
      variant: 'account',
      title: 'Source account',
      progress: 0.4,
    },
  };
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <NativeCurrentApp
        country="RO"
        release="release-current"
        adapters={[NATIVE_COMPONENT_PREVIEW_ADAPTER]}
        control={control}
        screenTopInset={12}
        onExit={events.onExit}
      />,
    );
  });
  try {
    const toolbar = tree.root.findByType(BaselineDetailToolbar);
    expect(toolbar.props).toMatchObject({
      title: 'Source account',
      variant: 'account',
      progress: 0.4,
      safeAreaReserve: 12,
    });
    expect(tree.root.findAllByType(BaselineBottomNavigation)).toHaveLength(0);
    act(() => toolbar.props.onHelpPress());
    act(() => toolbar.props.onBack());
    expect(events.onHelpRequest).toHaveBeenCalledTimes(1);
    expect(events.onExit).toHaveBeenCalledTimes(1);
  } finally {
    act(() => tree.unmount());
  }
});
