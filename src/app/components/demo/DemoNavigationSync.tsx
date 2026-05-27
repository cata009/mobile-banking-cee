/**
 * DemoNavigationSync Component
 * Automatically resets app navigation whenever demo context changes.
 */

import { useEffect, useRef } from "react";
import { useDemo } from "@/app/state/demoStore";
import { useNavigationContext } from "@/app/contexts/NavigationContext";

export function DemoNavigationSync() {
  const { product, country, scenario, designSystem, baseline, release, flagsByContext } = useDemo();
  const { navigateToAndReset, setCoAppingActive } = useNavigationContext();

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
      navigateToAndReset("prelogin-inactive");
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
      navigateToAndReset("prelogin-inactive");
    }
  }, [
    product,
    country,
    scenario,
    designSystem,
    baseline,
    release,
    flagsByContext,
    navigateToAndReset,
    setCoAppingActive,
  ]);

  return null;
}
