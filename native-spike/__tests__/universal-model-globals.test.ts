import {
  ModelTextEncoder,
  cloneModelData,
  installModelGlobals,
} from '../src/platform/modelGlobals';
test.each(['Italia €', 'România', '😀', '\ud800'])(
  'document UTF8 matches the standard encoder for %s',
  text => {
    expect(new ModelTextEncoder().encode(text)).toEqual(
      new TextEncoder().encode(text),
    );
  },
);
test('bounded UTF8 encodeInto does not cut emoji bytes or advance partial codepoints', () => {
  const encoder = new ModelTextEncoder(),
    target = new Uint8Array(3);
  expect(encoder.encodeInto('😀a', target)).toEqual({ read: 0, written: 0 });
  expect(encoder.encodeInto('€a', target)).toEqual({ read: 1, written: 3 });
});

test('native source clones preserve cycles, shared references, dates, map/set and undefined without aliasing originals', () => {
  const child = { name: 'Italia', optional: undefined },
    source = {
      first: child,
      second: child,
      date: new Date('2025-02-28'),
      map: new Map([['balance', 53550.27]]),
      set: new Set(['Conti']),
      bytes: new Uint8Array([1, 2]),
      nan: NaN,
      cycle: null as unknown,
    };
  source.cycle = source;
  const clone = cloneModelData(source);
  expect(clone.first).not.toBe(source.first);
  expect(clone.second).toBe(clone.first);
  expect(clone.cycle).toBe(clone);
  expect(Object.hasOwn(clone.first, 'optional')).toBe(true);
  expect(clone.date).toEqual(source.date);
  expect(clone.date).not.toBe(source.date);
  expect(clone.map.get('balance')).toBe(53550.27);
  expect(clone.set.has('Conti')).toBe(true);
  expect(clone.bytes).toEqual(source.bytes);
  expect(clone.bytes).not.toBe(source.bytes);
  expect(clone.nan).toBeNaN();
});
test('without browser structuredClone the actual source profile service model initializes before navigation', () => {
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    'structuredClone',
  );
  try {
    Object.defineProperty(globalThis, 'structuredClone', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    installModelGlobals();
    jest.isolateModules(() => {
      const {
        initializeProfileComposition,
      } = require('@/experiences/pi/it/mobile-first/profileComposition');
      initializeProfileComposition();
      const {
        profileServicesStore,
      } = require('@/features/profile/mobileFirstProfileServices');
      expect(
        profileServicesStore.getSnapshot().documents.length,
      ).toBeGreaterThan(0);
    });
  } finally {
    if (descriptor)
      Object.defineProperty(globalThis, 'structuredClone', descriptor);
  }
});
test('existing platform structuredClone remains authoritative and uncloneable functions stay rejected', () => {
  const native = globalThis.structuredClone;
  installModelGlobals();
  expect(globalThis.structuredClone).toBe(native);
  expect(() => cloneModelData({ handler: () => {} })).toThrow();
});
