/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import {
  initializeNativeDemoStorage,
  flushNativeDemoStorage,
} from '../src/platform/nativeStorage';
import { loadApplication } from '../src/app/loadApplication';
import { loadItaly } from '../src/app/loadNativeExperiences';

const mounted: ReactTestRenderer.ReactTestRenderer[] = [];

beforeAll(async () => {
  // Load the real composition after storage hydration, outside React's deferred
  // Suspense retry. Cold module transformation must finish before a UI action.
  await initializeNativeDemoStorage();
  await loadApplication();
  await loadItaly();
});

afterEach(async () => {
  await ReactTestRenderer.act(async () => {
    mounted.splice(0).forEach(tree => tree.unmount());
    await flushNativeDemoStorage();
  });
});

async function renderApp(props: React.ComponentProps<typeof App> = {}) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App {...props} />);
    mounted.push(tree);
    await initializeNativeDemoStorage();
    await loadApplication();
  });
  return tree;
}

test('renders correctly', async () => {
  const tree = await renderApp();
  expect(
    tree.root.findAll(node => node.props.testID === 'demo-choice-italy').length,
  ).toBeGreaterThan(0);
});

test('cold native entry opens the global selector without a portal password', async () => {
  const tree = await renderApp();
  expect(
    tree.root.findAll(node => node.props?.testID === 'demo-choice-italy')
      .length,
  ).toBeGreaterThan(0);
  expect(
    tree.root.findAll(
      node =>
        typeof node.props?.accessibilityLabel === 'string' &&
        /password|parola/i.test(node.props.accessibilityLabel),
    ),
  ).toHaveLength(0);
});

test('the global selector still opens the frozen Italy composition on its real axes', async () => {
  const tree = await renderApp({ showSelectorControl: true });
  const press = async (label: string) => {
    await ReactTestRenderer.act(async () => {
      tree.root
        .findAll(
          node =>
            node.props.accessibilityLabel === label &&
            typeof node.props.onPress === 'function',
        )[0]
        .props.onPress();
    });
  };
  await press('Italia, Mobile First');
  await press('Deschide demo');
  expect(
    tree.root.findAll(node => node.props.accessibilityLabel === 'Cerca').length,
  ).toBeGreaterThan(0);
  await press('Demo selector');
  expect(
    tree.root.findAll(node => node.props.testID === 'demo-choice-italy').length,
  ).toBeGreaterThan(0);
});
