import React from 'react';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import { BaselineDialog } from '../../../../../universal/BaselineDialog';
import { sourceColor } from '../../../../../universal/sourceColor';

/** Source permission state is simulated; this demo never opens the device camera. */
export function OnboardingCameraPermission({
  onAllow,
  onBlock,
}: {
  onAllow: () => void;
  onBlock: () => void;
}) {
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onBlock}
    >
      <BaselineDialog
        kind="logout"
        title="Access your camera"
        body="digitalonboarding.ro wants to access to your camera"
        cancelLabel="Block"
        confirmLabel="Allow"
        onCancel={onBlock}
        onConfirm={onAllow}
        titleTextStyle={{ color: sourceColor('var(--uc-text)') }}
        boxStyle={{
          borderRadius: 8,
          backgroundColor: sourceColor('var(--uc-surface)'),
        }}
      />
    </ModalPortal>
  );
}
