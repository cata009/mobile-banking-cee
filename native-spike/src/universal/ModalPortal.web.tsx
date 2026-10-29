import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { ModalProps } from 'react-native';
import { nativeModalVisibility } from '../platform/nativeModalVisibility';
import { useDemoViewport } from './DemoViewport';
import { useDuoPreview } from './DuoPreview';
import {
  resolveDuoContent,
  resolveDuoOverlayInsets,
} from '@/features/demo-native/duoPreview';

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
  manageFocus = true,
}: ModalProps & { manageFocus?: boolean }) {
  const host = useContext(PortalContext);
  const viewport = useDemoViewport();
  const duo = useDuoPreview();
  const frame = duo ? resolveDuoContent(duo, 'home') : undefined;
  const systemInsets = duo ? resolveDuoOverlayInsets(duo) : undefined;
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!visible) return;
    const closeVisibility = nativeModalVisibility.open();
    if (!manageFocus) return closeVisibility;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusable = () =>
      Array.from(
        dialog.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter(el => el.getAttribute('aria-hidden') !== 'true');
    const focusTimer = window.setTimeout(
      () => (focusable()[0] ?? dialog.current)?.focus(),
      0,
    );
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onRequestClose?.(event as never);
      } else if (event.key === 'Tab') {
        const elements = focusable();
        const first = elements[0],
          last = elements.at(-1);
        if (!first || !last) {
          event.preventDefault();
          dialog.current?.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handle);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handle);
      closeVisibility();
      previous?.focus();
    };
  }, [visible, onRequestClose, manageFocus]);
  if (!visible) return null;
  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      style={{
        ...styles.dialog,
        ...(systemInsets
          ? {
              clipPath: `inset(${systemInsets.top}px ${systemInsets.right}px 0 0)`,
            }
          : {}),
      }}
    >
      {frame && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: frame.left,
              pointerEvents: 'none',
              background: 'var(--uc-overlay, rgba(0,0,0,0.4))',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: frame.left + frame.width,
              right: 0,
              pointerEvents: 'none',
              background: 'var(--uc-overlay, rgba(0,0,0,0.4))',
            }}
          />
        </>
      )}
      <div
        style={{
          ...exactSourceStyles.inline1,
          width: viewport.width,
          height: viewport.height,
          ...(frame
            ? {
                left: frame.left,
                top: frame.top,
                width: frame.width,
                height: frame.height,
              }
            : {}),
          transform: `scale(${viewport.scale ?? 1})`,
        }}
      >
        {children}
      </div>
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

const exactSourceStyles: Record<string, React.CSSProperties> = {
  inline1: {
    position: 'absolute',
    left: 0,
    top: 0,
    transformOrigin: 'top left',
    display: 'flex',
    flexDirection: 'column',
  },
};
