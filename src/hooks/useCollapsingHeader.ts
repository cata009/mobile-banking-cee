/**
 * useCollapsingHeader
 *
 * The scroll-driven 0→1 progress that every detail/list screen used to collapse
 * its large title into the compact safe-area header. The exact same
 * `Math.min(1, Math.max(0, scrollTop / threshold))` computation plus a
 * `headerProgress` state was inlined in ~20 screens; this centralizes it.
 *
 * Usage — spread `onScroll` onto the scroll container and read `progress`:
 *   const { progress: headerProgress, onScroll } = useCollapsingHeader(64);
 *   <div onScroll={onScroll} ...>
 *   <PageHeader collapsedTitleProgress={headerProgress} />
 *
 * `setProgress` is returned for the rare screen that also resets progress
 * imperatively (e.g. on a tab switch).
 */

import { useCallback, useState } from "react";
import type { UIEvent } from "react";

/** Pixels of scroll over which the header fully collapses (progress reaches 1). */
export function useCollapsingHeader(threshold = 64) {
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(
    (event: UIEvent<HTMLElement>) => {
      setProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / threshold)));
    },
    [threshold],
  );

  return { progress, onScroll, setProgress };
}
