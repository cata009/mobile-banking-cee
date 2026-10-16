import { nativeCreditLimits } from '../src/experiences/pi/current/banking/creditLimitStore';

test('a Native session keeps credit overrides across screens while country and banking-scenario scopes stay isolated', () => {
  const cz = { country: 'CZ', bankingScenario: 'retail-single-account' } as const;
  const ro = { ...cz, country: 'RO' } as const;
  const restricted = { ...cz, bankingScenario: 'retail-payments-restricted' } as const;
  const listener = jest.fn();
  const unsubscribe = nativeCreditLimits.subscribe(listener);
  const initial = nativeCreditLimits.read(cz);
  nativeCreditLimits.record(cz, 'card-1', 15000);
  expect(nativeCreditLimits.read(cz)).toEqual({ 'card-1': 15000 });
  expect(initial).toEqual({});
  expect(nativeCreditLimits.read(ro)).toEqual({});
  expect(nativeCreditLimits.read(restricted)).toEqual({});
  nativeCreditLimits.record(cz, 'card-1', NaN);
  expect(nativeCreditLimits.read(cz)).toEqual({ 'card-1': 15000 });
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
  nativeCreditLimits.record(ro, 'card-1', 20000);
  expect(listener).toHaveBeenCalledTimes(1);
  expect(nativeCreditLimits.read(cz)).toEqual({ 'card-1': 15000 });
});
