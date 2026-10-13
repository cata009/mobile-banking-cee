import React, { createContext, forwardRef, useContext } from 'react';
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type TextProps,
  type TextInputProps,
} from 'react-native';

const TextScale = createContext(1);
const InsideText = createContext(false);

/** Application preference scales typography; Android's own font scaling stays enabled. */
export function TypographyProvider({
  scale,
  children,
}: {
  scale: number;
  children: React.ReactNode;
}) {
  return <TextScale.Provider value={scale}>{children}</TextScale.Provider>;
}

export function scaledTextStyle(
  style: StyleProp<TextStyle>,
  scale: number,
  defaultSize?: number,
): TextStyle {
  const flat = StyleSheet.flatten(style) ?? {};
  const fontSize = flat.fontSize ?? defaultSize;
  return {
    ...(typeof fontSize === 'number' ? { fontSize: fontSize * scale } : {}),
    ...(typeof flat.lineHeight === 'number'
      ? { lineHeight: flat.lineHeight * scale }
      : {}),
  };
}

export const Text = forwardRef<
  React.ComponentRef<typeof NativeText>,
  TextProps
>(function ScaledText({ style, children, ...props }, ref) {
  const scale = useContext(TextScale);
  const nested = useContext(InsideText);
  return (
    <InsideText.Provider value>
      <NativeText
        ref={ref}
        {...props}
        style={[style, scaledTextStyle(style, scale, nested ? undefined : 14)]}
      >
        {children}
      </NativeText>
    </InsideText.Provider>
  );
});

export const TextInput = forwardRef<
  React.ComponentRef<typeof NativeTextInput>,
  TextInputProps
>(function ScaledInput({ style, ...props }, ref) {
  const scale = useContext(TextScale);
  return (
    <NativeTextInput
      ref={ref}
      {...props}
      style={[style, scaledTextStyle(style, scale, 14)]}
    />
  );
});
