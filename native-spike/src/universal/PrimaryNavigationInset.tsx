import { createContext, useContext } from 'react';

/**
 * Space a primary screen must keep free at the bottom for the floating glass
 * navigation. Screens run full height so their content scrolls underneath the
 * glass, and add this to the end of their scroll content so nothing stays hidden.
 */
export const PrimaryNavigationInsetContext = createContext(0);

export function usePrimaryNavigationInset(): number {
  return useContext(PrimaryNavigationInsetContext);
}
