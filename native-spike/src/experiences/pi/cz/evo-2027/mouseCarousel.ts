import { useCallback, useEffect, useMemo, useRef } from 'react';
import { PanResponder, Platform, ScrollView, View } from 'react-native';
import type React from 'react';
import { useDemoCanvas } from '../../../../universal/DemoViewport';

/** Native touch scrolling and actual mouse dragging in the scaled web preview. */
export function useMouseCarousel({
  rail,
  offsets,
  onSelect,
}: {
  rail: React.RefObject<React.ComponentRef<typeof ScrollView> | null>;
  offsets: readonly number[];
  onSelect?: (index: number) => void;
}) {
  const scale = useDemoCanvas()?.scale ?? 1;
  const latest = useRef({ rail, offsets, onSelect, scale });
  latest.current = { rail, offsets, onSelect, scale };
  const containerRef = useRef<React.ComponentRef<typeof View>>(null);
  const current = useRef(0),
    startOffset = useRef(0),
    startX = useRef(0),
    mouseActive = useRef(false);
  const dragScale = useRef(scale);
  const controller = useMemo(() => {
    const move = (x: number) => {
      const { offsets: points, rail: target } = latest.current;
      const maximum = points[points.length - 1] ?? 0;
      current.current = Math.max(
        0,
        Math.min(
          maximum,
          startOffset.current - (x - startX.current) / (dragScale.current || 1),
        ),
      );
      target.current?.scrollTo({ x: current.current, y: 0, animated: false });
    };
    const finish = (animated = true) => {
      const {
        offsets: points,
        onSelect: select,
        rail: target,
      } = latest.current;
      if (!points.length) return;
      const index = points.reduce(
        (best, point, i) =>
          Math.abs(point - current.current) <
          Math.abs((points[best] ?? 0) - current.current)
            ? i
            : best,
        0,
      );
      current.current = points[index] ?? 0;
      select?.(index);
      target.current?.scrollTo({ x: current.current, y: 0, animated });
    };
    const drag = PanResponder.create({
      onStartShouldSetPanResponderCapture: event => {
        if (!mouseActive.current) {
          startOffset.current = current.current;
          startX.current = event.nativeEvent.pageX;
          dragScale.current = latest.current.scale;
        }
        return false;
      },
      onMoveShouldSetPanResponderCapture: (_event, gesture) =>
        Platform.OS === 'web' &&
        !mouseActive.current &&
        latest.current.offsets.length > 1 &&
        Math.abs(gesture.dx) > 8 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: () => {},
      onPanResponderMove: (_event, gesture) => move(gesture.moveX),
      onPanResponderRelease: (_event, gesture) => {
        move(gesture.moveX);
        finish();
      },
      onPanResponderTerminate: () => finish(),
    });
    return { drag, move, finish };
  }, []);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    let dragging = false,
      suppressClick = false,
      startY = 0;
    const containsTarget = (target: EventTarget | null) => {
      const node = containerRef.current as unknown as HTMLElement | null;
      return Boolean(node && target instanceof Node && node.contains(target));
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onMove = (event: MouseEvent) => {
      if (!mouseActive.current) return;
      const dx = event.clientX - startX.current,
        dy = event.clientY - startY;
      if (!dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy))
        dragging = true;
      if (dragging) {
        event.preventDefault();
        controller.move(event.clientX);
      }
    };
    const onUp = (event: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp, true);
      mouseActive.current = false;
      if (dragging) {
        event.preventDefault();
        event.stopPropagation();
        controller.move(event.clientX);
        controller.finish(false);
        suppressClick = true;
        timer = setTimeout(() => {
          suppressClick = false;
        }, 100);
      }
      dragging = false;
    };
    const onDown = (event: MouseEvent) => {
      if (!containsTarget(event.target)) return;
      if (event.button !== 0 || latest.current.offsets.length < 2) return;
      mouseActive.current = true;
      dragging = false;
      startX.current = event.clientX;
      startY = event.clientY;
      const railRef = latest.current.rail.current as unknown as
        | (HTMLElement & { getScrollableNode?: () => HTMLElement | null })
        | null;
      const scrollNode = railRef?.getScrollableNode?.() ?? railRef;
      const measuredScale = scrollNode?.clientWidth
        ? scrollNode.getBoundingClientRect().width / scrollNode.clientWidth
        : 0;
      dragScale.current =
        measuredScale > 0 ? measuredScale : latest.current.scale;
      const actualOffset = scrollNode?.scrollLeft;
      startOffset.current = Number.isFinite(actualOffset)
        ? actualOffset!
        : current.current;
      current.current = startOffset.current;
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp, true);
    };
    const onClick = (event: MouseEvent) => {
      if (suppressClick && containsTarget(event.target)) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      }
    };
    window.addEventListener('mousedown', onDown, true);
    window.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('mousedown', onDown, true);
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp, true);
      if (timer) clearTimeout(timer);
      mouseActive.current = false;
    };
  }, [controller]);
  const trackOffset = useCallback((x: number) => {
    current.current = x;
  }, []);
  return {
    containerRef,
    panHandlers: controller.drag.panHandlers,
    trackOffset,
  };
}
