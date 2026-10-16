import React from 'react';
import { BaselineBottomSheet } from '../../../../../../universal/BaselineBottomSheet';
import { ModalPortal } from '../../../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../../../universal/DemoViewport';

/** Payments use Source's 16px sheet preset, including its full-height currency chooser. */
export function PaymentsSheet({
  title,
  onClose,
  children,
  dark,
  fillHeight,
  closeLabel,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  dark: boolean;
  fillHeight?: boolean;
  closeLabel?: string;
}) {
  const { width, height } = useDemoViewport();
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BaselineBottomSheet
        title={title}
        onClose={onClose}
        width={width}
        height={height}
        fillHeight={fillHeight}
        closeLabel={closeLabel}
        dark={dark}
      >
        {children}
      </BaselineBottomSheet>
    </ModalPortal>
  );
}
