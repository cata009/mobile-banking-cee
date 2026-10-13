import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ModalProps } from 'react-native';

const PortalContext = createContext<HTMLDivElement | null>(null);
/** Keep native overlay geometry inside the annotated phone viewport on the web. */
export function OverlayHost({ children }: { children: React.ReactNode }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  return (
    <div style={styles.root}>
      <PortalContext.Provider value={host}>{children}</PortalContext.Provider>
      <div ref={setHost} style={styles.host} />
    </div>
  );
}
export function ModalPortal({
  visible = true,
  children,
  onRequestClose,
}: ModalProps) {
  const host = useContext(PortalContext);
  useEffect(() => {
    if (!visible) return;
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onRequestClose?.(event as never);
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [visible, onRequestClose]);
  if (!visible) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" style={styles.dialog}>
      {children}
    </div>,
    host ?? document.body,
  );
}
const styles: Record<'root' | 'host' | 'dialog', React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    flex: 1,
    minHeight: 0,
  },
  host: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 },
  dialog: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'auto',
  },
};
