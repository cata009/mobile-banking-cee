import { createContext, useContext, type ReactNode } from "react";
import type { FlowScreenKind } from "../flows/types";

/**
 * Navigation the previews can call without knowing they are in a prototype.
 *
 * A preview asks for `useFlowNav()` and wires its primary button, its text action
 * and the header back control to these three verbs. Outside the Prototype tab
 * there is no provider, the verbs are no-ops, and the preview stays the static
 * snapshot the Journey tab expects — so one set of screens serves both.
 */
export interface FlowNav {
  primary: () => void;
  secondary: () => void;
  back: () => void;
  /** Jump straight to a named screen, for in-screen shortcuts such as Edit. */
  go: (screen: FlowScreenKind) => void;
  /** Leave the flow from the header X: back to the start, or via a confirmation. */
  close: () => void;
  /** True only where the map declares an exit, so the X appears on those screens alone. */
  canClose: boolean;
  /** True only inside the Prototype tab, for affordances that would mislead elsewhere. */
  active: boolean;
}

const INERT_NAV: FlowNav = {
  primary: () => {},
  secondary: () => {},
  back: () => {},
  go: () => {},
  close: () => {},
  canClose: false,
  active: false,
};

const FlowNavContext = createContext<FlowNav>(INERT_NAV);

export function useFlowNav(): FlowNav {
  return useContext(FlowNavContext);
}

export function FlowNavProvider({ value, children }: { value: FlowNav; children: ReactNode }) {
  return <FlowNavContext.Provider value={value}>{children}</FlowNavContext.Provider>;
}
