import React, { useEffect } from 'react';
import { Modal, type ModalProps } from 'react-native';
import { nativeModalVisibility } from '../platform/nativeModalVisibility';

export function ModalPortal(props: ModalProps) {
  const visible = props.visible !== false;
  useEffect(() => {
    if (visible) return nativeModalVisibility.open();
  }, [visible]);
  return <Modal {...props} />;
}
export function OverlayHost({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
