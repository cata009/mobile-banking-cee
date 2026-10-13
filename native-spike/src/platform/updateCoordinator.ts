export type UpdateState = {
  phase: 'idle' | 'checking' | 'downloading' | 'ready' | 'applying' | 'error';
  updateId?: string;
  error?: string;
};
export interface UpdatePort {
  check: () => Promise<{
    id: string;
    download: () => Promise<boolean>;
    requiresRestart?: boolean;
    deferUntilSafe?: boolean;
  } | null>;
  reload: () => Promise<void>;
  flush: () => Promise<void>;
}
/** Staging is safe while editing. Only an explicitly safe navigation point may restart. */
export function createUpdateCoordinator(port: UpdatePort) {
  let state: UpdateState = { phase: 'idle' };
  let checking: Promise<void> | undefined;
  let applying: Promise<boolean> | undefined;
  let pendingCommit: (() => Promise<boolean>) | undefined;
  const listeners = new Set<() => void>();
  const publish = (next: UpdateState) => {
    state = next;
    listeners.forEach(listener => listener());
  };
  const coordinator = {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    check(): Promise<void> {
      if (checking) return checking;
      if (state.phase === 'ready' || state.phase === 'applying')
        return Promise.resolve();
      checking = (async () => {
        publish({ phase: 'checking' });
        try {
          const update = await port.check();
          if (!update) {
            publish({ phase: 'idle' });
            return;
          }
          if (update.deferUntilSafe) {
            pendingCommit = update.download;
            publish({ phase: 'ready', updateId: update.id });
            return;
          }
          publish({ phase: 'downloading', updateId: update.id });
          if (!(await update.download()))
            throw new Error('Aggiornamento non scaricato');
          publish(
            update.requiresRestart === false
              ? { phase: 'idle' }
              : { phase: 'ready', updateId: update.id },
          );
        } catch (error) {
          publish({
            phase: 'error',
            error:
              error instanceof Error
                ? error.message
                : 'Aggiornamento non disponibile',
          });
        }
      })().finally(() => {
        checking = undefined;
      });
      return checking;
    },
    applyIfSafe(isSafe: () => boolean): Promise<boolean> {
      if (applying)
        return applying.then(applied => {
          // A remounted owner must not inherit the old owner's cancelled predicate.
          if (applied || state.phase !== 'ready' || state.error || !isSafe())
            return applied;
          return coordinator.applyIfSafe(isSafe);
        });
      if (state.phase !== 'ready' || !isSafe()) return Promise.resolve(false);
      const updateId = state.updateId;
      applying = (async () => {
        try {
          await port.flush();
          // Navigation can change while persistence flushes: check again before restarting.
          if (!isSafe()) return false;
          publish({ phase: 'applying', updateId });
          if (pendingCommit) {
            if (!(await pendingCommit()))
              throw new Error('Ripristino non applicato');
            pendingCommit = undefined;
          }
          // A builtin commit is asynchronous too. Keep its successful result,
          // but defer reload if ownership/foreground changed while it ran.
          if (!isSafe()) {
            publish({ phase: 'ready', updateId });
            return false;
          }
          await port.reload();
          return true;
        } catch (error) {
          publish({
            phase: 'ready',
            updateId,
            error:
              error instanceof Error
                ? error.message
                : 'Aggiornamento non applicato',
          });
          return false;
        }
      })().finally(() => {
        applying = undefined;
      });
      return applying;
    },
  };
  return coordinator;
}
