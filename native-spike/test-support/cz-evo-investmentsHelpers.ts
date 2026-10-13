import { act, type ReactTestRenderer } from 'react-test-renderer';
export async function authorizeDemo(tree: ReactTestRenderer, label: string) {
  await act(async () => {
    await Promise.resolve();
  });
  const sign = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0]!;
  if (!sign || sign.props.disabled)
    throw new Error('Demo sign control is not ready: ' + label);
  await act(async () => {
    await sign.props.onPress();
  });
  const confirm = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Continue demo' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  if (!confirm) throw new Error('Explicit demo authorization is required');
  await act(async () => {
    confirm.props.onPress();
  });
}
