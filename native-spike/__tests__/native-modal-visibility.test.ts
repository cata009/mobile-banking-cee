import { createNativeModalVisibility } from '../src/platform/nativeModalVisibility';

test('overlapping native windows retain the update block until the final window closes', () => {
  const registry = createNativeModalVisibility();
  const observed: number[] = [];
  const unsubscribe = registry.subscribe(() =>
    observed.push(registry.getSnapshot()),
  );
  const closeFirst = registry.open();
  const closeSecond = registry.open();
  closeFirst();
  closeFirst();
  expect(registry.getSnapshot()).toBe(1);
  closeSecond();
  expect(registry.getSnapshot()).toBe(0);
  expect(observed).toEqual([1, 2, 1, 0]);
  unsubscribe();
  const closeAfterUnsubscribe = registry.open();
  closeAfterUnsubscribe();
  expect(observed).toEqual([1, 2, 1, 0]);
});
