import { useCallback, useEffect, useRef, useState } from "react";
import type { CopyToastState } from "@/app/components/accounts/CopyToast";

/**
 * Copies a value to the clipboard and surfaces a transient toast confirming
 * the action. Falls back gracefully when the browser blocks clipboard access
 * (the toast still confirms the copy intent for demo purposes).
 */
export function useCopyToClipboard() {
  const [toast, setToast] = useState<CopyToastState | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const copy = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard?.writeText(value);
    } catch {
      // The demo still confirms the copy intent when clipboard permissions are unavailable.
    }

    setToast({ message: `${label} successfully copied`, visible: true });

    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      setToast((current) => (current ? { ...current, visible: false } : null));
    }, 1400);
  }, []);

  useEffect(() => () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
  }, []);

  return { toast, copy };
}
