import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BaselineBottomSheet } from '../../../../universal/BaselineBottomSheet';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { sourceColor } from '../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../contracts';

export function BankingButton({
  host,
  label,
  onPress,
  disabled = false,
  size = 16,
}: {
  host: CurrentScreenProps;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  size?: 16 | 18;
}) {
  // The Design System primary button: 48 high, radius 4, action-strong fill, 0.3 opacity and an
  // 18px label when disabled, 0.98 press scale. Same behaviour, now from the one definition.
  return (
    <PrimaryButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      labelSize={size === 18 ? '18' : '16'}
      dark={host.mode === 'dark'}
    />
  );
}
export function SelectedMark({ host }: { host: CurrentScreenProps }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5807 4.89436C12.6165 3.92323 14.2954 3.92323 15.3312 4.89436L6.85434 12.8327L0.664551 7.04003C1.69993 6.06934 3.37926 6.06934 4.41509 7.04003L6.85434 9.31606L11.5807 4.89436Z"
        fill={sourceColor('var(--uc-action-strong)', host.mode === 'dark')}
      />
    </Svg>
  );
}
/** Source BottomSheet's normal, non-animated presentation and input boundaries. */
export function BankingSheet({
  host,
  title,
  visible,
  onClose,
  children,
  footer,
  closeLabel = 'Close',
  offset = 54,
  fillHeight = false,
}: {
  host: CurrentScreenProps;
  title: string;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeLabel?: string;
  offset?: number;
  fillHeight?: boolean;
}) {
  const { width, height } = useDemoViewport();
  return (
    <ModalPortal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Canonical Design System bottom sheet; this wrapper keeps the banking call sites unchanged. */}
      <BaselineBottomSheet
        title={title}
        onClose={onClose}
        footer={footer}
        closeLabel={closeLabel}
        width={width}
        height={height}
        maxHeightOffsetPx={offset}
        fillHeight={fillHeight}
        // Banking forms are laid out for the original 16px inset; keep it until they are reviewed.
        padding={16}
        dark={host.mode === 'dark'}
      >
        {children}
      </BaselineBottomSheet>
    </ModalPortal>
  );
}
