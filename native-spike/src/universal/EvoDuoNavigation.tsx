import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
} from 'react';

type Action = () => void;
type Registry = {
  enabled: boolean;
  closeEnabled: boolean;
  register: (id: symbol, action: Action) => () => void;
  registerClose: (id: symbol, action: Action) => () => void;
};
const NavigationContext = createContext<Registry | null>(null);
const ScopeContext = createContext(true);

/** Opt-in preview bridge: the screen keeps ownership of its actual Back action. */
export function EvoDuoNavigationProvider({
  enabled,
  onActionChange,
  onCloseChange,
  children,
}: {
  enabled: boolean;
  onActionChange: (action: Action | null) => void;
  onCloseChange?: (action: Action | null) => void;
  children: React.ReactNode;
}) {
  const actions = useRef(new Map<symbol, Action>());
  const closeActions = useRef(new Map<symbol, Action>());
  const callback = useRef(onActionChange);
  callback.current = onActionChange;
  const closeCallback = useRef(onCloseChange);
  closeCallback.current = onCloseChange;
  const registry = useRef<Registry>({
    enabled,
    closeEnabled: !!onCloseChange,
    register: (id, action) => {
      actions.current.delete(id);
      actions.current.set(id, action);
      callback.current(action);
      return () => {
        actions.current.delete(id);
        const remaining = Array.from(actions.current.values());
        callback.current(remaining[remaining.length - 1] ?? null);
      };
    },
    registerClose: (id, action) => {
      closeActions.current.delete(id);
      closeActions.current.set(id, action);
      closeCallback.current?.(action);
      return () => {
        closeActions.current.delete(id);
        const remaining = Array.from(closeActions.current.values());
        closeCallback.current?.(remaining[remaining.length - 1] ?? null);
      };
    },
  });
  registry.current.enabled = enabled;
  registry.current.closeEnabled = !!onCloseChange;
  return (
    <NavigationContext.Provider value={registry.current}>
      {children}
    </NavigationContext.Provider>
  );
}

/** Inactive retained routes must never own the visible navigation control. */
export function EvoDuoNavigationScope({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <ScopeContext.Provider value={active}>{children}</ScopeContext.Provider>
  );
}

export function useEvoDuoBackAction(action: Action, active = true) {
  const registry = useContext(NavigationContext);
  const scopeActive = useContext(ScopeContext);
  const id = useRef(Symbol('duo-back'));
  const latest = useRef(action);
  latest.current = action;
  const enabled = !!registry?.enabled && scopeActive && active;
  useLayoutEffect(() => {
    if (!enabled || !registry) return;
    return registry.register(id.current, () => latest.current());
  }, [enabled, registry]);
  return enabled;
}

/** Close and Back can coexist and always keep their distinct callbacks. */
export function useEvoDuoCloseAction(action?: Action, active = true) {
  const registry = useContext(NavigationContext);
  const scopeActive = useContext(ScopeContext);
  const id = useRef(Symbol('duo-close'));
  const latest = useRef(action);
  latest.current = action;
  const enabled =
    !!registry?.enabled &&
    registry.closeEnabled &&
    scopeActive &&
    active &&
    !!action;
  useLayoutEffect(() => {
    if (!enabled || !registry) return;
    return registry.registerClose(id.current, () => latest.current?.());
  }, [enabled, registry]);
  return enabled;
}
