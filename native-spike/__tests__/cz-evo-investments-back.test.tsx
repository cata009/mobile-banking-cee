import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { BackHandler } from 'react-native';
import { InvestmentRuntime } from '../src/experiences/pi/cz/evo-2027/investments/Runtime';
import { CzRoboFlow } from '../src/experiences/pi/cz/evo-2027/robo';
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures';

function press(tree: Renderer.ReactTestRenderer, label: string) {
  const node = tree.root.findAll(
    item =>
      item.props.accessibilityLabel === label &&
      typeof item.props.onPress === 'function',
  )[0]!;
  expect(node).toBeDefined();
  act(() => node.props.onPress());
}
describe('native investment hardware Back ownership', () => {
  let callbacks: Set<Parameters<typeof BackHandler.addEventListener>[1]>;
  let listener: jest.SpyInstance;
  beforeEach(() => {
    callbacks = new Set();
    listener = jest
      .spyOn(BackHandler, 'addEventListener')
      .mockImplementation((_event, callback) => {
        callbacks.add(callback);
        return {
          remove: () => {
            callbacks.delete(callback);
          },
        };
      });
  });
  afterEach(() => listener.mockRestore());
  function back() {
    let handled = false;
    act(() => {
      for (const callback of [...callbacks].reverse()) {
        if (callback({ type: 'hardwareBackPress', timeStamp: Date.now() })) {
          handled = true;
          break;
        }
      }
    });
    expect(handled).toBe(true);
  }
  it('resumes the quit confirmation instead of discarding the creation flow', () => {
    const exit = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<CzRoboFlow onBack={jest.fn()} onExit={exit} />);
    });
    press(tree, 'Create Goal');
    press(tree, 'Close');
    back();
    expect(
      tree.root.findAll(
        node => node.props.testID === 'cz-personal-data-confirmation',
      ).length,
    ).toBeGreaterThan(0);
    expect(exit).not.toHaveBeenCalled();
    act(() => tree.unmount());
    expect(callbacks.size).toBe(0);
  });
  it('removes hidden retained screens from the device Back handler set', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <InvestmentRuntime active>
          <CzRoboFlow onBack={jest.fn()} onExit={jest.fn()} />
        </InvestmentRuntime>,
      );
    });
    expect(callbacks.size).toBeGreaterThan(0);
    act(() =>
      tree.update(
        <InvestmentRuntime active={false}>
          <CzRoboFlow onBack={jest.fn()} onExit={jest.fn()} />
        </InvestmentRuntime>,
      ),
    );
    expect(callbacks.size).toBe(0);
    act(() => tree.unmount());
  });
  it('returns a top-up recap to its draft when device Back is pressed', () => {
    const goal = INITIAL_CZ_ROBO_GOALS.find(
      item => item.currentInteger === '0',
    )!;
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <CzRoboFlow initialGoal={goal} onBack={jest.fn()} onExit={jest.fn()} />,
      );
    });
    press(tree, 'Add money');
    press(tree, 'Review investment');
    back();
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-add-money').length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
});
