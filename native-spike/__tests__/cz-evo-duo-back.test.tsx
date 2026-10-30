import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Header } from '../src/universal/Header';
import { mobileFirstTokens } from '../src/universal/tokens';
import { Page as InvestmentPage } from '../src/experiences/pi/cz/evo-2027/investments/Primitives';
import {
  EvoDuoNavigationProvider,
  EvoDuoNavigationScope,
} from '../src/universal/EvoDuoNavigation';

it('moves the current header action only when the Duo vertical preview is enabled', () => {
  const back = jest.fn();
  let railAction: (() => void) | null = null;
  const render = (enabled: boolean) => (
    <EvoDuoNavigationProvider
      enabled={enabled}
      onActionChange={action => {
        railAction = action;
      }}
    >
      <EvoDuoNavigationScope active>
        <Header tokens={mobileFirstTokens} title="Accounts" onBack={back} />
      </EvoDuoNavigationScope>
    </EvoDuoNavigationProvider>
  );
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(render(true));
  });
  expect(tree.root.findAllByProps({ accessibilityLabel: 'Back' })).toHaveLength(
    0,
  );
  act(() => {
    railAction?.();
  });
  expect(back).toHaveBeenCalledTimes(1);
  act(() => {
    tree.update(render(false));
  });
  expect(railAction).toBeNull();
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Back' }).length,
  ).toBeGreaterThan(0);
  act(() => tree.unmount());
});

it('uses the active subview callback instead of a retained inactive header', () => {
  const main = jest.fn();
  const detail = jest.fn();
  let railAction: (() => void) | null = null;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <EvoDuoNavigationProvider
        enabled
        onActionChange={action => {
          railAction = action;
        }}
      >
        <EvoDuoNavigationScope active>
          <Header
            tokens={mobileFirstTokens}
            title="Account"
            onBack={main}
            duoActionActive={false}
          />
          <Header tokens={mobileFirstTokens} title="Details" onBack={detail} />
        </EvoDuoNavigationScope>
      </EvoDuoNavigationProvider>,
    );
  });
  act(() => {
    railAction?.();
  });
  expect(detail).toHaveBeenCalledTimes(1);
  expect(main).not.toHaveBeenCalled();
  act(() => tree.unmount());
});

it('keeps Back and Close separate on an investment screen', () => {
  const back = jest.fn();
  const close = jest.fn();
  let railBack: (() => void) | null = null;
  let railClose: (() => void) | null = null;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <EvoDuoNavigationProvider
        enabled
        onActionChange={action => {
          railBack = action;
        }}
        onCloseChange={action => {
          railClose = action;
        }}
      >
        <EvoDuoNavigationScope active>
          <InvestmentPage
            kind="test"
            title="Investment"
            onBack={back}
            onClose={close}
          >
            <></>
          </InvestmentPage>
        </EvoDuoNavigationScope>
      </EvoDuoNavigationProvider>,
    );
  });
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Close' }),
  ).toHaveLength(0);
  act(() => {
    railBack?.();
    railClose?.();
  });
  expect(back).toHaveBeenCalledTimes(1);
  expect(close).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});
