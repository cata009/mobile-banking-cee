import { useSyncExternalStore } from 'react';
import type { CurrentContext } from '../contracts';
import { isCoAppingAvailable } from '@/app/utils/coAppingAvailability';
type Session = { active: boolean };
const records = new Map<string, Session>();
const listeners = new Set<() => void>();
const key = (context: CurrentContext) =>
  `${context.country}:${context.release}`;
function snapshot(context: CurrentContext) {
  const id = key(context);
  if (!records.has(id)) records.set(id, { active: false });
  return records.get(id)!;
}
function write(context: CurrentContext, active: boolean) {
  records.set(key(context), { active });
  listeners.forEach(listener => listener());
}
export const coappingSessions = {
  getSnapshot: snapshot,
  start: (context: CurrentContext) => {
    if (isCoAppingAvailable(context.country)) write(context, true);
  },
  end: (context: CurrentContext) => write(context, false),
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  reset: () => {
    records.clear();
    listeners.forEach(listener => listener());
  },
};
export function useCoappingSession(context: CurrentContext) {
  return useSyncExternalStore(
    coappingSessions.subscribe,
    () => snapshot(context),
    () => snapshot(context),
  );
}
