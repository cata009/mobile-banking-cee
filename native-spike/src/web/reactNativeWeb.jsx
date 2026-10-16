import React, { forwardRef, useContext } from 'react';
import {
  View as WebView,
  Pressable as WebPressable,
  ScrollView as WebScrollView,
  Text as WebText,
  TextInput as WebTextInput,
  Image as WebImage,
  Switch as WebSwitch,
  PixelRatio,
} from 'react-native-web';
import { getAssetByID } from 'react-native-web/dist/modules/AssetRegistry/index.js';
import { PiWebAccessibilityContext, nativeWebAccessibilityProps } from '../platform/webAccessibility';
import { registeredWebAssetSource } from '../platform/webAssetSource';

export * from 'react-native-web';

function stateCompatible(Component, name) {
  const Wrapped = forwardRef(function NativeStateCompatible(props, ref) {
    const enabled = useContext(PiWebAccessibilityContext);
    return <Component {...(enabled ? nativeWebAccessibilityProps(props) : props)} ref={ref} />;
  });
  Wrapped.displayName = name;
  // Preserve RN Web's public static APIs (Image.getSize/prefetch, TextInput.State).
  for (const key of Object.keys(Component)) {
    if (!['$$typeof', 'render', 'displayName'].includes(key)) Wrapped[key] = Component[key];
  }
  return Wrapped;
}

export const View = stateCompatible(WebView, 'View');
export const Pressable = stateCompatible(WebPressable, 'Pressable');
export const ScrollView = stateCompatible(WebScrollView, 'ScrollView');
export const Text = stateCompatible(WebText, 'Text');
export const TextInput = stateCompatible(WebTextInput, 'TextInput');
export const Image = stateCompatible(WebImage, 'Image');
Image.resolveAssetSource = source => typeof source === 'number'
  ? registeredWebAssetSource(getAssetByID(source), PixelRatio.get())
  : typeof source === 'string' ? { uri: source } : source ?? null;
export const Switch = stateCompatible(WebSwitch, 'Switch');
