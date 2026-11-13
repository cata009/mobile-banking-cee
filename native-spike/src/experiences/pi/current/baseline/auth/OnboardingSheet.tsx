import React from 'react';
import { View } from 'react-native';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import { BaselineBottomSheet } from '../../../../../universal/BaselineBottomSheet';
import { useDemoViewport } from '../../../../../universal/DemoViewport';

/** The existing sheet is hosted in the phone portal, outside scrolling page content. */
export function OnboardingSheet({
  title,
  onClose,
  footer,
  children,
  fixedHeight,
  maxHeightOffsetPx,
  background,
}: {
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  fixedHeight?: boolean;
  maxHeightOffsetPx?: number;
  background?: React.ReactNode;
}) {
  const viewport = useDemoViewport();
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {background}
      <BaselineBottomSheet
        title={title}
        onClose={onClose}
        width={viewport.width}
        height={viewport.height}
        padding={24}
        fixedHeight={fixedHeight}
        maxHeightOffsetPx={maxHeightOffsetPx}
        hostedInModal
        showBackdrop={!background}
        footer={
          footer && (
            <View style={{ paddingTop: 24, paddingBottom: 10 }}>{footer}</View>
          )
        }
      >
        {children}
      </BaselineBottomSheet>
    </ModalPortal>
  );
}
