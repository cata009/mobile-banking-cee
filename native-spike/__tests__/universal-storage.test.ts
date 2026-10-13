import { createDemoStorage } from '../src/platform/demoStorage';

test('hydrates model keys before reads and serializes durable mutations', async () => {
  const writes: string[] = [];
  const bridge = createDemoStorage({
    getItem: async () =>
      JSON.stringify({ version: 1, values: { financial: 'old' } }),
    setItem: async (_key, value) => {
      writes.push(value);
    },
  });
  await bridge.hydrate();
  expect(bridge.storage.getItem('financial')).toBe('old');
  bridge.storage.setItem('financial', 'revision-1');
  bridge.storage.setItem('financial', 'revision-2');
  bridge.storage.setItem('budget', '100');
  bridge.storage.removeItem('budget');
  await bridge.flush();
  expect(writes.map(value => JSON.parse(value).values.financial)).toEqual([
    'revision-1',
    'revision-2',
    'revision-2',
    'revision-2',
  ]);
  expect(JSON.parse(writes[3]!).values).toEqual({ financial: 'revision-2' });
});
test('does not block future writes after an asynchronous persistence failure', async () => {
  const setItem = jest
    .fn()
    .mockRejectedValueOnce(new Error('disk'))
    .mockResolvedValue(undefined);
  const bridge = createDemoStorage({ getItem: async () => null, setItem });
  await bridge.hydrate();
  bridge.storage.setItem('draft', 'one');
  await expect(bridge.flush()).rejects.toThrow('disk');
  expect(bridge.storage.getItem('draft')).toBe('one');
  bridge.storage.setItem('draft', 'two');
  await expect(bridge.flush()).resolves.toBeUndefined();
  expect(JSON.parse(setItem.mock.calls[1][1]).values.draft).toBe('two');
});
test.each([
  'not json',
  '{"version":1,"values":[]}',
  '{"version":2,"values":{"financial":"old"}}',
])('rejects invalid or incompatible envelopes: %s', async raw => {
  const bridge = createDemoStorage({
    getItem: async () => raw,
    setItem: async () => {},
  });
  await bridge.hydrate();
  expect(bridge.storage.length).toBe(0);
});
