import { createCzRoboSession } from '../../../current/investments/roboSharedSession';
export { createCzRoboSession } from '../../../current/investments/roboSharedSession';

/** Host hydrates this synchronous port via initializeNativeDemoStorage before loading models. */
export const CZ_ROBO_STORAGE_KEY =
  'pi-cz-current-release-future-evo-2027-robo-goals-v1';
const legacyEvoSession = createCzRoboSession(CZ_ROBO_STORAGE_KEY);
export const readCzRoboGoals = legacyEvoSession.readGoals;
export const saveCzRoboGoal = legacyEvoSession.saveGoal;
export const getCzRoboPersistenceError = legacyEvoSession.getPersistenceError;
export const subscribeCzRoboGoals = legacyEvoSession.subscribe;
export const resetCzRoboSession = legacyEvoSession.reset;
export const reloadCzRoboSession = legacyEvoSession.reload;
