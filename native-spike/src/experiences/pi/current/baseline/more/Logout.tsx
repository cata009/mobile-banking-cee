import React from 'react';
import { StyleSheet } from 'react-native';
import type { CurrentScreenProps } from '../../contracts';
import { BaselineDialog } from '../../../../../universal/BaselineDialog';
import { sourceColor } from '../../../../../universal/sourceColor';

/** BaselineDialog preserves Source's synchronous close-before-confirm contract. */
export default function Logout({
  host,
  onClose,
  onConfirm,
}: {
  host: CurrentScreenProps;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const backdropStyle = {
    backgroundColor: sourceColor('rgb(var(--uc-static-black-rgb)/0.4)', dark),
  };
  return (
    <BaselineDialog
      kind="logout"
      title={host.t(
        'runtime.dialogs.logoutMessage',
        'Are you sure you want to leave Mobile Banking?',
      )}
      cancelLabel={host.t('runtime.dialogs.cancel', 'Cancel')}
      confirmLabel={host.t('runtime.actions.okGotIt', 'OK')}
      onCancel={onClose}
      onConfirm={onConfirm}
      dark={dark}
      backdropStyle={backdropStyle}
      titleTextStyle={styles.title}
      boxStyle={styles.box}
      cancelTextStyle={styles.cancel}
      separateActionDivider
    />
  );
}

const styles = StyleSheet.create({
  cancel: { fontWeight: '500' },
  title: { marginBottom: 2 },
  box: {
    boxShadow:
      '0px 0px 1px rgba(0,0,0,0.04), 0px 2px 6px rgba(0,0,0,0.04), 0px 16px 24px rgba(0,0,0,0.06)',
  },
});
