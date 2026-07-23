/**
 * useDragCarousel
 *
 * Shared pointer + mouse drag machinery for horizontally-scrollable carousels
 * (card carousel, product offers, analytics period panels, investment basket
 * shelf, etc.). Before this hook the exact same ~90-line gesture model was
 * copy-pasted into six screens; the only per-screen differences were the
 * snap-target policy and an optional "single item" guard, both of which stay in
 * the calling screen. This hook owns purely the gesture plumbing:
 *
 *  - press-and-drag with a 4px movement threshold before it counts as a drag;
 *  - unified pointer and mouse (with document-level mousemove/mouseup) paths;
 *  - a post-drag click-suppression window so a drag never also triggers a tap;
 *  - `isDragging` for grab/grabbing cursor styling.
 *
 * The screen keeps ownership of: the scroll container ref, the snap-to-nearest
 * logic (passed as `onSettle`), any scroll-idle snap timer, and the
 * indicator/keyboard handlers.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DragEvent as ReactDragEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";

/** Movement, in px, before a press is treated as a drag rather than a tap. */
const DRAG_MOVE_THRESHOLD_PX = 4;

/** Default click-suppression window after a drag settles, in ms. */
const DEFAULT_SUPPRESS_CLICK_MS = 80;

type DragInput = "mouse" | "pointer";

interface DragState {
  didMove: boolean;
  input: DragInput | null;
  pointerId: number | null;
  startScrollLeft: number;
  startX: number;
}

function createIdleDragState(): DragState {
  return { didMove: false, input: null, pointerId: null, startScrollLeft: 0, startX: 0 };
}

export interface UseDragCarouselOptions {
  /** The horizontally-scrollable element being dragged. */
  carouselRef: RefObject<HTMLElement | null>;
  /**
   * Called once, on drag end, only when the pointer actually moved past the
   * threshold. Put your snap-to-nearest logic here.
   */
  onSettle?: () => void;
  /**
   * When false a drag never begins (e.g. single-item carousels). Read fresh on
   * every press, so it can depend on current state. Defaults to true.
   */
  enabled?: boolean;
  /** How long clicks stay suppressed after a drag, in ms. Defaults to 80. */
  suppressClickMs?: number;
}

export interface DragCarouselHandlers {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  onMouseDown: (event: ReactMouseEvent<HTMLElement>) => void;
  onClickCapture: (event: ReactMouseEvent<HTMLElement>) => void;
  onDragStart: (event: ReactDragEvent<HTMLElement>) => void;
}

export interface UseDragCarouselResult {
  /** True while a drag is actively moving (for grab/grabbing cursor styling). */
  isDragging: boolean;
  /**
   * Live ref, true from press until release, regardless of whether movement
   * passed the threshold. Read it (not `isDragging`) inside a scroll handler to
   * suppress an idle snap-timer while a drag is in progress — it stays current
   * within the same tick, before React re-renders.
   */
  isPressActiveRef: RefObject<boolean>;
  /**
   * Spread onto the scroll container. The same handlers can also be spread onto
   * inner clickable items so a drag can start from an item; a second begin is a
   * no-op while a drag is already in progress.
   */
  dragHandlers: DragCarouselHandlers;
}

export function useDragCarousel({
  carouselRef,
  onSettle,
  enabled = true,
  suppressClickMs = DEFAULT_SUPPRESS_CLICK_MS,
}: UseDragCarouselOptions): UseDragCarouselResult {
  const [isDragging, setIsDragging] = useState(false);

  const dragStateRef = useRef<DragState>(createIdleDragState());
  const mouseDragCleanupRef = useRef<(() => void) | null>(null);
  const suppressClickRef = useRef(false);
  // Mirrors `dragStateRef.current.input !== null`: true from press to release,
  // exposed so scroll handlers can gate their idle snap-timer on live state.
  const isPressActiveRef = useRef(false);

  // Read the latest policy inside stable callbacks without re-creating them.
  const onSettleRef = useRef(onSettle);
  onSettleRef.current = onSettle;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const suppressClickMsRef = useRef(suppressClickMs);
  suppressClickMsRef.current = suppressClickMs;

  const removeMouseDragListeners = useCallback(() => {
    mouseDragCleanupRef.current?.();
    mouseDragCleanupRef.current = null;
  }, []);

  const resetDrag = useCallback(() => {
    removeMouseDragListeners();
    dragStateRef.current = createIdleDragState();
    isPressActiveRef.current = false;
    setIsDragging(false);
  }, [removeMouseDragListeners]);

  const beginDrag = useCallback(
    (clientX: number, input: DragInput, pointerId: number | null = null) => {
      const carousel = carouselRef.current;
      if (!carousel || !enabledRef.current || dragStateRef.current.input) return false;

      dragStateRef.current = {
        didMove: false,
        input,
        pointerId,
        startScrollLeft: carousel.scrollLeft,
        startX: clientX,
      };
      isPressActiveRef.current = true;
      return true;
    },
    [carouselRef],
  );

  const moveDrag = useCallback(
    (clientX: number) => {
      const carousel = carouselRef.current;
      const dragState = dragStateRef.current;
      if (!carousel || !dragState.input) return false;

      const deltaX = clientX - dragState.startX;
      if (!dragState.didMove && Math.abs(deltaX) < DRAG_MOVE_THRESHOLD_PX) return false;

      dragState.didMove = true;
      suppressClickRef.current = true;
      setIsDragging(true);
      carousel.scrollLeft = dragState.startScrollLeft - deltaX;
      return true;
    },
    [carouselRef],
  );

  const finishDrag = useCallback(() => {
    if (dragStateRef.current.didMove) {
      onSettleRef.current?.();
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, suppressClickMsRef.current);
    }
    resetDrag();
  }, [resetDrag]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (beginDrag(event.clientX, "pointer", event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    },
    [beginDrag],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const dragState = dragStateRef.current;
      if (dragState.input !== "pointer" || dragState.pointerId !== event.pointerId) return;
      if (moveDrag(event.clientX)) event.preventDefault();
    },
    [moveDrag],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const dragState = dragStateRef.current;
      if (dragState.input !== "pointer" || dragState.pointerId !== event.pointerId) return;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      finishDrag();
    },
    [finishDrag],
  );

  const onPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const dragState = dragStateRef.current;
      if (dragState.input !== "pointer" || dragState.pointerId !== event.pointerId) return;
      resetDrag();
      suppressClickRef.current = false;
    },
    [resetDrag],
  );

  const onMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if (event.button !== 0 || !beginDrag(event.clientX, "mouse")) return;

      const handleMouseMove = (mouseEvent: globalThis.MouseEvent) => {
        if (dragStateRef.current.input !== "mouse") return;
        if (mouseEvent.buttons !== 1) {
          finishDrag();
          return;
        }
        if (moveDrag(mouseEvent.clientX)) mouseEvent.preventDefault();
      };

      const handleMouseUp = () => {
        if (dragStateRef.current.input === "mouse") finishDrag();
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      mouseDragCleanupRef.current = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    },
    [beginDrag, finishDrag, moveDrag],
  );

  const onClickCapture = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const onDragStart = useCallback((event: ReactDragEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  useEffect(() => removeMouseDragListeners, [removeMouseDragListeners]);

  return {
    isDragging,
    isPressActiveRef,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onMouseDown,
      onClickCapture,
      onDragStart,
    },
  };
}
