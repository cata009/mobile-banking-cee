import React, { createContext, useContext, useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';

const Active = createContext(true);
export function useInvestmentActive() {
  return useContext(Active);
}
export function InvestmentRuntime({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return <Active.Provider value={active}>{children}</Active.Provider>;
}
/** Retained host screens must relinquish device Back; latest local UI handler stays current. */
export function useInvestmentBack(handler: () => boolean) {
  const active = useContext(Active),
    current = useRef(handler);
  current.current = handler;
  useEffect(() => {
    if (!active || Platform.OS === 'web') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () =>
      current.current(),
    );
    return () => subscription.remove();
  }, [active]);
}
