import { createUpdateCoordinator } from '../src/platform/updateCoordinator';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(complete => {
    resolve = complete;
  });
  return { promise, resolve };
}

test('unsafe after builtin commit stays ready and retries reload without committing twice', async () => {
  const pending = deferred<boolean>(),
    started = deferred<void>();
  let safe = true;
  const commit = jest.fn(() => {
    started.resolve();
    return pending.promise;
  });
  const reload = jest.fn(async () => {}),
    flush = jest.fn(async () => {});
  const coordinator = createUpdateCoordinator({
    check: async () => ({
      id: 'builtin',
      download: commit,
      deferUntilSafe: true,
    }),
    flush,
    reload,
  });
  await coordinator.check();
  const applying = coordinator.applyIfSafe(() => safe);
  await started.promise;
  safe = false;
  pending.resolve(true);
  expect(await applying).toBe(false);
  expect(reload).not.toHaveBeenCalled();
  expect(coordinator.getSnapshot()).toEqual({
    phase: 'ready',
    updateId: 'builtin',
  });
  safe = true;
  expect(await coordinator.applyIfSafe(() => safe)).toBe(true);
  expect(commit).toHaveBeenCalledTimes(1);
  expect(flush).toHaveBeenCalledTimes(2);
  expect(reload).toHaveBeenCalledTimes(1);
});

test('a fresh safe owner can resume after joining an invalidated in-flight owner', async () => {
  const pending = deferred<void>();
  let oldOwnerAlive = true;
  const flush = jest
    .fn()
    .mockImplementationOnce(() => pending.promise)
    .mockResolvedValue(undefined);
  const reload = jest.fn(async () => {});
  const coordinator = createUpdateCoordinator({
    check: async () => ({ id: 'candidate', download: async () => true }),
    flush,
    reload,
  });
  await coordinator.check();
  const oldAttempt = coordinator.applyIfSafe(() => oldOwnerAlive);
  oldOwnerAlive = false;
  const newAttempt = coordinator.applyIfSafe(() => true);
  pending.resolve();
  expect(await oldAttempt).toBe(false);
  expect(await newAttempt).toBe(true);
  expect(flush).toHaveBeenCalledTimes(2);
  expect(reload).toHaveBeenCalledTimes(1);
});

test('a successful builtin commit is not repeated after reload failure', async () => {
  const commit = jest.fn(async () => true);
  const reload = jest
    .fn()
    .mockRejectedValueOnce(new Error('reload unavailable'))
    .mockResolvedValue(undefined);
  const coordinator = createUpdateCoordinator({
    check: async () => ({
      id: 'builtin',
      download: commit,
      deferUntilSafe: true,
    }),
    flush: async () => {},
    reload,
  });
  await coordinator.check();
  expect(await coordinator.applyIfSafe(() => true)).toBe(false);
  expect(coordinator.getSnapshot()).toEqual({
    phase: 'ready',
    updateId: 'builtin',
    error: 'reload unavailable',
  });
  expect(await coordinator.applyIfSafe(() => true)).toBe(true);
  expect(commit).toHaveBeenCalledTimes(1);
  expect(reload).toHaveBeenCalledTimes(2);
});

test('a failed builtin commit stays pending and concurrent owners do not automatically retry its error', async () => {
  const pending = deferred<boolean>(),
    started = deferred<void>();
  const commit = jest
    .fn()
    .mockImplementationOnce(() => {
      started.resolve();
      return pending.promise;
    })
    .mockResolvedValue(true);
  const reload = jest.fn(async () => {});
  const coordinator = createUpdateCoordinator({
    check: async () => ({
      id: 'builtin',
      download: commit,
      deferUntilSafe: true,
    }),
    flush: async () => {},
    reload,
  });
  await coordinator.check();
  const first = coordinator.applyIfSafe(() => true);
  await started.promise;
  const joining = coordinator.applyIfSafe(() => true);
  pending.resolve(false);
  expect(await first).toBe(false);
  expect(await joining).toBe(false);
  expect(commit).toHaveBeenCalledTimes(1);
  expect(reload).not.toHaveBeenCalled();
  expect(await coordinator.applyIfSafe(() => true)).toBe(true);
  expect(commit).toHaveBeenCalledTimes(2);
});
