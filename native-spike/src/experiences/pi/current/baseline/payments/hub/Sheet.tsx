import React from 'react';
import { BaselineBottomSheet } from '../../../../../../universal/BaselineBottomSheet';
import { ModalPortal } from '../../../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../../../universal/DemoViewport';
import { useDuoPreview } from '../../../../../../universal/DuoPreview';
import { resolveDuoContent } from '@/features/demo-native/duoPreview';

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
  const viewport = useDemoViewport();
  const duo = useDuoPreview();
  const { width, height } = duo ? resolveDuoContent(duo, 'home') : viewport;
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
