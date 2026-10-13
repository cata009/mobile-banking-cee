import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures';
import { getRoboPortfolioForGoal } from '@/features/investments/robo/model';
import type { RoboExistingGoal } from '@/features/investments/robo/types';

/** Host hydrates this synchronous port via initializeNativeDemoStorage before loading models. */
export const CZ_ROBO_STORAGE_KEY =
  'pi-cz-current-release-future-evo-2027-robo-goals-v1';
let goals: readonly RoboExistingGoal[] | undefined;
let persistenceError = '';
const listeners = new Set<() => void>();
function validGoal(value: unknown): value is RoboExistingGoal {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  for (const key of [
    'id',
    'name',
    'purpose',
    'currentInteger',
    'currentDecimals',
    'returnLabel',
    'targetInteger',
    'targetDecimals',
    'endDate',
    'portfolioId',
  ])
    if (typeof item[key] !== 'string') return false;
  if (
    !['positive', 'negative', 'neutral'].includes(String(item.returnTone)) ||
    !Number.isInteger(item.horizonYears)
  )
    return false;
  if (
    !getRoboPortfolioForGoal({
      portfolioId: String(item.portfolioId),
      basketId: typeof item.basketId === 'string' ? item.basketId : undefined,
      basketKey:
        typeof item.basketKey === 'string' ? item.basketKey : undefined,
    })
  )
    return false;
  if (
    item.positions !== undefined &&
    (!Array.isArray(item.positions) ||
      item.positions.some(
        position =>
          !position ||
          typeof position.id !== 'string' ||
          !Number.isFinite(position.localValue) ||
          !Number.isFinite(position.quantity),
      ))
  )
    return false;
  for (const field of ['transactions', 'orders'])
    if (
      item[field] !== undefined &&
      (!Array.isArray(item[field]) ||
        (item[field] as unknown[]).some(
          row =>
            !row ||
            typeof row !== 'object' ||
            typeof (row as Record<string, unknown>).id !== 'string' ||
            typeof (row as Record<string, unknown>).date !== 'string' ||
            !Number.isFinite((row as Record<string, unknown>).amount),
        ))
    )
      return false;
  return true;
}
export function readCzRoboGoals(): readonly RoboExistingGoal[] {
  if (goals) return goals;
  goals = INITIAL_CZ_ROBO_GOALS;
  try {
    const raw = globalThis.localStorage?.getItem(CZ_ROBO_STORAGE_KEY);
    if (!raw) return goals;
    const stored: unknown = JSON.parse(raw);
    if (!stored || typeof stored !== 'object')
      throw new Error('Invalid goal state');
    const payload = stored as { version?: unknown; goals?: unknown };
    if (
      payload.version !== 1 ||
      !Array.isArray(payload.goals) ||
      !payload.goals.every(validGoal)
    )
      throw new Error('Invalid goal state');
    goals = payload.goals;
  } catch {
    persistenceError = 'Saved goals could not be loaded. Demo goals are shown.';
  }
  return goals;
}
export function saveCzRoboGoal(goal: RoboExistingGoal) {
  const current = readCzRoboGoals();
  goals = current.some(item => item.id === goal.id)
    ? current.map(item => (item.id === goal.id ? goal : item))
    : [goal, ...current];
  try {
    if (typeof globalThis.localStorage === 'undefined')
      throw new Error('Storage unavailable');
    globalThis.localStorage.setItem(
      CZ_ROBO_STORAGE_KEY,
      JSON.stringify({ version: 1, goals }),
    );
    persistenceError = '';
  } catch {
    persistenceError =
      'Changes are kept for this session. Persistent storage is unavailable.';
  }
  listeners.forEach(listener => listener());
}
export function getCzRoboPersistenceError() {
  return persistenceError;
}
export function subscribeCzRoboGoals(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function resetCzRoboSession() {
  goals = undefined;
  persistenceError = '';
}
export function reloadCzRoboSession() {
  resetCzRoboSession();
  readCzRoboGoals();
  listeners.forEach(listener => listener());
}
