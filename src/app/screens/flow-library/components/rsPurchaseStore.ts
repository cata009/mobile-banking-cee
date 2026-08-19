import { useCallback, useSyncExternalStore } from "react";
import { FLOW_DEMO } from "../flows/demoData";

const RS = FLOW_DEMO.rsPropertyInsurance;

export type RsPackageId = "A" | "B" | "C";
export type RsDurationId = "3m" | "6m" | "12m";
export type RsAddOnPackageId = "A" | "B";

export interface RsPurchaseState {
  packageId: RsPackageId;
  durationId: RsDurationId;
  addOn: boolean;
  addOnPackageId: RsAddOnPackageId;
}

/**
 * The choices the customer makes on step 1, kept outside React.
 *
 * Every preview is mounted by the dispatcher on its own, and moving between
 * screens unmounts the one behind — so component state cannot carry a decision
 * forward. The reviewer picking Package A and then reading Package B on the next
 * screen is not a cosmetic problem: the whole point of the flow is that the
 * package, the term and the add-on decide the premium, the cover period and the
 * amount that ends up on the payment order.
 *
 * A module-level store survives those remounts. It is written only from real
 * interactions, never from a mount, so the Journey filmstrip — which renders
 * every screen at once — cannot have one snapshot overwrite the others.
 */
const DEFAULT_STATE: RsPurchaseState = {
  packageId: RS.selection.packageId as RsPackageId,
  durationId: "6m",
  addOn: false,
  addOnPackageId: RS.emergencyAddOn.defaultPackageId as RsAddOnPackageId,
};

let state: RsPurchaseState = { ...DEFAULT_STATE };
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

export function setRsPurchase(patch: Partial<RsPurchaseState>) {
  const next = { ...state, ...patch };
  if (
    next.packageId === state.packageId &&
    next.durationId === state.durationId &&
    next.addOn === state.addOn &&
    next.addOnPackageId === state.addOnPackageId
  ) {
    return;
  }
  state = next;
  emit();
}

/** Back to a clean purchase: the flow's own Restart, and the first screen of the flow. */
export function resetRsPurchase() {
  setRsPurchase(DEFAULT_STATE);
}

export function useRsPurchase(): RsPurchaseState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Everything downstream of step 1 reads its figures from here, so the package on
 * the summary card, the sums in the data check and the amount on the payment
 * order can only ever tell the same story.
 */
export function useRsSelection(overrides?: Partial<RsPurchaseState>) {
  const stored = useRsPurchase();
  const current = { ...stored, ...overrides };
  const pkg = RS.packages.find((entry) => entry.id === current.packageId) ?? RS.packages[1];
  const duration = RS.durations.find((entry) => entry.id === current.durationId) ?? RS.durations[1];
  const addOnPackage =
    RS.emergencyAddOn.packages.find((entry) => entry.id === current.addOnPackageId) ?? RS.emergencyAddOn.packages[0];

  const premium = pkg.premiums[current.durationId];
  const addOnPremium = addOnPackage.premiums[current.durationId];

  return { ...current, pkg, duration, addOnPackage, premium, addOnPremium };
}

export function useRsPurchaseActions() {
  return useCallback(setRsPurchase, []);
}
