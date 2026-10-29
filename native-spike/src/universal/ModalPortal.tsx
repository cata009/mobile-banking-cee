import React, { useEffect } from 'react';
import {
  StyleSheet,
  Modal,
  View,
  useWindowDimensions,
  type ModalProps,
} from 'react-native';
import { nativeModalVisibility } from '../platform/nativeModalVisibility';
import { useDemoCanvas } from './DemoViewport';
import { useDuoPreview } from './DuoPreview';
import { resolveDuoContent } from '@/features/demo-native/duoPreview';

export function ModalPortal({
  manageFocus: _manageFocus,
  ...props
}: ModalProps & { manageFocus?: boolean }) {
  const visible = props.visible !== false;
  const window = useWindowDimensions();
  const canvas = useDemoCanvas();
  const duo = useDuoPreview();
  const duoFrame = duo ? resolveDuoContent(duo, 'home') : undefined;
  const viewport = duoFrame ?? canvas ?? window;
  const scale = canvas?.scale ?? 1;
  useEffect(() => {
    if (visible) return nativeModalVisibility.open();
  }, [visible]);
  return (
    <Modal {...props}>
      <View
        style={[
          exactSourceStyles.inline1,
          {
            width: viewport.width,
            height: viewport.height,
            ...(duoFrame
              ? { marginLeft: duoFrame.left, marginTop: duoFrame.top }
              : {}),
            transform: [{ scale }],
          },
        ]}
      >
        {props.children}
      </View>
    </Modal>
  );
}
export function OverlayHost({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const exactSourceStyles = StyleSheet.create({
  inline1: { transformOrigin: 'top left' },
});
