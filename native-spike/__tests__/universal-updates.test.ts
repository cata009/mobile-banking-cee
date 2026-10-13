import { createUpdateCoordinator } from '../src/platform/updateCoordinator';
test('rollback cannot remove current OTA assets before a safe flushed restart', async () => {
  const sequence: string[] = [];
  const commit = jest.fn(async () => {
    sequence.push('commit');
    return true;
  });
  const coordinator = createUpdateCoordinator({
    check: async () => ({
      id: 'builtin',
      download: commit,
      deferUntilSafe: true,
    }),
    flush: async () => {
      sequence.push('flush');
    },
    reload: async () => {
      sequence.push('reload');
    },
  });
  await coordinator.check();
  expect(commit).not.toHaveBeenCalled();
  await coordinator.applyIfSafe(() => false);
  expect(commit).not.toHaveBeenCalled();
  await coordinator.applyIfSafe(() => true);
  expect(sequence).toEqual(['flush', 'commit', 'reload']);
});
test('release metadata adoption commits without restarting the same running bundle', async () => {
  const download = jest.fn(async () => true),
    reload = jest.fn(async () => {});
  const coordinator = createUpdateCoordinator({
    check: async () => ({
      id: 'adopted-release',
      download,
      requiresRestart: false,
    }),
    reload,
    flush: async () => {},
  });
  await coordinator.check();
  expect(download).toHaveBeenCalledTimes(1);
  expect(coordinator.getSnapshot().phase).toBe('idle');
  expect(await coordinator.applyIfSafe(() => true)).toBe(false);
  expect(reload).not.toHaveBeenCalled();
});
test('compatible downloads stage while a form is open and never restart it', async () => {
  const reload = jest.fn(async () => {}),
    flush = jest.fn(async () => {});
  const download = jest.fn(async () => true);
  const coordinator = createUpdateCoordinator({
    check: async () => ({ id: 'candidate-1', download }),
    reload,
    flush,
  });
  await coordinator.check();
  expect(coordinator.getSnapshot()).toEqual({
    phase: 'ready',
    updateId: 'candidate-1',
  });
  expect(await coordinator.applyIfSafe(() => false)).toBe(false);
  expect(reload).not.toHaveBeenCalled();
  expect(flush).not.toHaveBeenCalled();
  expect(await coordinator.applyIfSafe(() => true)).toBe(true);
  expect(flush).toHaveBeenCalledTimes(1);
  expect(reload).toHaveBeenCalledTimes(1);
});
test('navigation changes during flush keep the staged update and the active draft', async () => {
  let safe = true;
  const reload = jest.fn(async () => {});
  const coordinator = createUpdateCoordinator({
    check: async () => ({ id: 'candidate', download: async () => true }),
    reload,
    flush: async () => {
      safe = false;
    },
  });
  await coordinator.check();
  expect(await coordinator.applyIfSafe(() => safe)).toBe(false);
  expect(coordinator.getSnapshot().phase).toBe('ready');
  expect(reload).not.toHaveBeenCalled();
});
test('offline and failed downloads leave the installed bundle running', async () => {
  const reload = jest.fn(async () => {});
  const offline = createUpdateCoordinator({
    check: async () => {
      throw new Error('offline');
    },
    reload,
    flush: async () => {},
  });
  await offline.check();
  expect(offline.getSnapshot().phase).toBe('error');
  expect(await offline.applyIfSafe(() => true)).toBe(false);
  const invalid = createUpdateCoordinator({
    check: async () => ({ id: 'invalid', download: async () => false }),
    reload,
    flush: async () => {},
  });
  await invalid.check();
  expect(invalid.getSnapshot().phase).toBe('error');
  expect(reload).not.toHaveBeenCalled();
});
test('concurrent checks share one download and reload failures leave a retryable ready state', async () => {
  const check = jest.fn(async () => ({
    id: 'candidate',
    download: async () => true,
  }));
  const coordinator = createUpdateCoordinator({
    check,
    flush: async () => {},
    reload: async () => {
      throw new Error('not ready');
    },
  });
  await Promise.all([coordinator.check(), coordinator.check()]);
  expect(check).toHaveBeenCalledTimes(1);
  expect(await coordinator.applyIfSafe(() => true)).toBe(false);
  expect(coordinator.getSnapshot().phase).toBe('ready');
});
