import React, { createContext, useContext, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

const Context = createContext<{
  width: number;
  height: number;
  scale: number;
} | null>(null);
export function sourceCanvasSize(
  width: number,
  height: number,
  authoringWidth: number,
) {
  const scale = width / authoringWidth;
  return { width: authoringWidth, height: height / scale, scale };
}
/** Measure the app surface itself; the RNWeb browser window includes the surrounding workbench. */
export function DemoViewport({
  children,
  authoringWidth = 375,
  onScale,
  fitContent = false,
}: {
  children: React.ReactNode;
  authoringWidth?: number;
  onScale?: (scale: number) => void;
  /** Component previews participate in the parent's normal layout, without a phone-sized canvas. */
  fitContent?: boolean;
}) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const logical = fitContent
    ? {
        width: size?.width ?? authoringWidth,
        height: size?.height ?? 0,
        scale: 1,
      }
    : size
    ? sourceCanvasSize(size.width, size.height, authoringWidth)
    : {
        width: authoringWidth,
        height: authoringWidth === 393 ? 852 : 812,
        scale: 1,
      };
  return (
    <View
      style={fitContent ? exactSourceStyles.content : exactSourceStyles.inline1}
      onLayout={event => {
        const { width, height } = event.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setSize(previous =>
            previous?.width === width && previous.height === height
              ? previous
              : { width, height },
          );
          onScale?.(fitContent ? 1 : width / authoringWidth);
        }
      }}
    >
      <View
        style={
          fitContent
            ? exactSourceStyles.content
            : logical
            ? [
                exactSourceStyles.canvas,
                {
                  width: logical.width,
                  height: logical.height,
                  transform: [{ scale: logical.scale }],
                },
              ]
            : exactSourceStyles.inline1
        }
      >
        <Context.Provider value={logical}>{children}</Context.Provider>
      </View>
    </View>
  );
}
/** Authored layout geometry only; null outside a DemoViewport provider. */
export function useDemoCanvas() {
  return useContext(Context);
}
export function useDemoViewport() {
  const outer = useWindowDimensions();
  const size = useContext(Context);
  return { ...outer, ...size };
}

const exactSourceStyles = StyleSheet.create({
  content: { width: '100%', flexShrink: 0 },
  inline1: { flex: 1 },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    transformOrigin: 'top left',
  },
});
