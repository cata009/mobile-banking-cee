import React from 'react';
import type { ScheduleConfig } from '@/data/schedule';
import type { CzechNativeScreenProps } from '../contracts';
import {
  InternalTransfer,
  type TransferReceipt,
} from '../../../current/banking/InternalTransfer';
import { czechBankingHost } from '../../../current/banking/czechHost';
export type CzechTransferReceipt = TransferReceipt;
export default function Transfer(
  props: CzechNativeScreenProps & {
    initialSchedule?: ScheduleConfig | null;
    onDemoTransfer?: (receipt: CzechTransferReceipt) => void;
  },
) {
  return (
    <InternalTransfer
      host={czechBankingHost(props, { screen: 'payments' })}
      initialSchedule={props.initialSchedule}
      onBack={props.onBack}
      onDone={props.onBack}
      onComplete={props.onDemoTransfer}
    />
  );
}
