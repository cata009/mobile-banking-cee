/**
 * DemoNavigationSync Component
 * Automatically resets app navigation whenever demo context changes.
 */

import { useEffect, useRef } from "react";
import { useDemo } from "@/app/state/demoStore";
import { useNavigationContext } from "@/app/contexts/NavigationContext";

const DESIGN_SYSTEM_HASHES = new Set([
  "overview",
  "countries",
  "headers",
  "navigation",
  "buttons",
  "forms",
  "cards",
  "products",
  "overlays",
  "registry",
  "templates",
  "icons",
  "colors",
  "color-audit",
  "typography",
]);

function hasDesignSystemHash() {
  return DESIGN_SYSTEM_HASHES.has(window.location.hash.replace(/^#/, ""));
}

export function DemoNavigationSync() {
  const { product, country, scenario, designSystem, baseline, release, flagsByContext } = useDemo();
  const { navigateToAndReset, setCoAppingActive } = useNavigationContext();
  const scenarioEntryScreen = scenario === "active" ? "prelogin-active" : "prelogin-inactive";

  const isFirstMount = useRef(true);
  const prevValues = useRef({
    product,
    country,
    scenario,
    designSystem,
    baseline,
    release,
    flagsByContext: JSON.stringify(flagsByContext),
  });

  useEffect(() => {
    const currentFlagsString = JSON.stringify(flagsByContext);

    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevValues.current = {
        product,
        country,
        scenario,
        designSystem,
        baseline,
        release,
        flagsByContext: currentFlagsString,
      };

      setCoAppingActive(false);
      // Do NOT reset navigation on first mount — let the current screen persist
      // (handles Vite HMR updates and page reloads gracefully).
      // Navigation resets only when demo controls change explicitly below.
      return;
    }

    const hasChanged =
      prevValues.current.product !== product ||
      prevValues.current.country !== country ||
      prevValues.current.scenario !== scenario ||
      prevValues.current.designSystem !== designSystem ||
      prevValues.current.baseline !== baseline ||
      prevValues.current.release !== release ||
      prevValues.current.flagsByContext !== currentFlagsString;

    if (hasChanged) {
      prevValues.current = {
        product,
        country,
        scenario,
        designSystem,
        baseline,
        release,
        flagsByContext: currentFlagsString,
      };

      setCoAppingActive(false);
      if (hasDesignSystemHash()) {
        return;
      }

      navigateToAndReset(scenarioEntryScreen);
    }
  }, [
    product,
    country,
    scenario,
    designSystem,
    baseline,
    release,
    flagsByContext,
    scenarioEntryScreen,
    navigateToAndReset,
    setCoAppingActive,
  ]);

  return null;
}
