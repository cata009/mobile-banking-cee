import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures';
import {
  readCzRoboGoals,
  saveCzRoboGoal,
  resetCzRoboSession,
  reloadCzRoboSession,
  CZ_ROBO_STORAGE_KEY,
} from '../src/experiences/pi/cz/evo-2027/robo/session';

describe('CZ Robo goal persistence through the native storage port', () => {
  let saved: Record<string, string>;
  beforeEach(() => {
    saved = {};
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => saved[key] ?? null,
        setItem: (key: string, value: string) => {
          saved[key] = value;
        },
      },
    });
    resetCzRoboSession();
  });
  afterEach(() => {
    resetCzRoboSession();
  });
  it('retains Source IDs, ledger fields and renamed goals after reloading', () => {
    const goal = { ...INITIAL_CZ_ROBO_GOALS[0]!, name: 'My future' };
    saveCzRoboGoal(goal);
    expect(JSON.parse(saved[CZ_ROBO_STORAGE_KEY]!).goals[0].name).toBe(
      'My future',
    );
    reloadCzRoboSession();
    expect(readCzRoboGoals()[0]).toEqual(goal);
  });
  it('restores Source fixtures when persisted data is malformed without overwriting the payload', () => {
    saved[CZ_ROBO_STORAGE_KEY] = '{not json';
    reloadCzRoboSession();
    expect(readCzRoboGoals()).toEqual(INITIAL_CZ_ROBO_GOALS);
    expect(saved[CZ_ROBO_STORAGE_KEY]).toBe('{not json');
  });
  it('rejects goals with missing portfolio identity in persisted input', () => {
    saved[CZ_ROBO_STORAGE_KEY] = JSON.stringify({
      version: 1,
      goals: [{ id: 'fake', name: 'Fake' }],
    });
    reloadCzRoboSession();
    expect(readCzRoboGoals()).toEqual(INITIAL_CZ_ROBO_GOALS);
  });
});
