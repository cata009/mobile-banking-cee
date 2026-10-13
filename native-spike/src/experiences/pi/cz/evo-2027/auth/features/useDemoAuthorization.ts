import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  authenticateNativeBiometric,
  nativeBiometricAvailable,
} from '../../../../../../platform/biometrics';

/** One lifecycle for internal demo approvals; only authenticated device results or explicit demo consent can complete. */
export function useDemoAuthorization({
  onComplete,
  title,
  isActive = true,
  onCancelled,
}: {
  onComplete: () => void;
  title: string;
  isActive?: boolean;
  onCancelled?: () => void;
}) {
  const [available, setAvailable] = useState<boolean | null>(null),
    [busy, setBusy] = useState(false),
    [demo, setDemo] = useState(false),
    [error, setError] = useState('');
  const request = useRef(0),
    alive = useRef(true),
    completed = useRef(false),
    inFlight = useRef(false);
  const onCancelledRef = useRef(onCancelled);
  useEffect(() => {
    onCancelledRef.current = onCancelled;
  }, [onCancelled]);
  const invalidate = useCallback(() => {
    request.current++;
  }, []);
  const cancel = useCallback(() => {
    request.current++;
    inFlight.current = false;
    setBusy(false);
    setDemo(false);
    setError('');
    onCancelledRef.current?.();
  }, []);
  useEffect(() => {
    alive.current = true;
    nativeBiometricAvailable().then(
      value => {
        if (alive.current) setAvailable(value);
      },
      () => {
        if (alive.current) setAvailable(false);
      },
    );
    return () => {
      alive.current = false;
      invalidate();
    };
  }, [invalidate]);
  useEffect(() => {
    if (!isActive) cancel();
  }, [cancel, isActive]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') cancel();
    });
    return () => subscription.remove();
  }, [cancel]);
  const finish = () => {
    if (completed.current || !alive.current || !isActive) return;
    completed.current = true;
    setDemo(false);
    onComplete();
  };
  const sign = async () => {
    if (
      inFlight.current ||
      completed.current ||
      available === null ||
      !isActive
    )
      return;
    setError('');
    if (!available) {
      setDemo(true);
      return;
    }
    inFlight.current = true;
    setBusy(true);
    const serial = ++request.current;
    try {
      const result = await authenticateNativeBiometric(title);
      if (!alive.current || serial !== request.current) return;
      if (result === 'authenticated') finish();
      else if (result === 'unavailable') {
        setAvailable(false);
        setDemo(true);
      } else
        setError(
          'Authentication cancelled. The operation has not been authorized.',
        );
    } catch {
      if (alive.current && serial === request.current)
        setError('Authentication could not complete. Try again.');
    } finally {
      if (alive.current && serial === request.current) {
        inFlight.current = false;
        setBusy(false);
      }
    }
  };
  return {
    busy,
    available,
    demo,
    error,
    cancel,
    finish,
    sign,
    closeDemo: () => setDemo(false),
    completed: completed.current,
  };
}
