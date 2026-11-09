import React from 'react';
import type { MessageMailbox } from '@/app/config/messagesConfig';
import { BaselineMailboxTabs } from '../../../../universal/BaselineMailboxTabs';
import { useCurrentTokens } from './Primitives';

/** Thin adapter over the canonical Design System tabs; the call site and its props are unchanged. */
export function MailboxTabs({
  value,
  onChange,
  inbox,
  outbox,
}: {
  value: MessageMailbox;
  onChange: (value: MessageMailbox) => void;
  inbox: string;
  outbox: string;
}) {
  const tokens = useCurrentTokens();
  return (
    <BaselineMailboxTabs
      tabs={[
        { id: 'inbox', label: inbox, hasNewItems: true },
        { id: 'outbox', label: outbox },
      ]}
      activeTabId={value}
      onChange={id => onChange(id as MessageMailbox)}
      dark={tokens.text.toLowerCase() !== '#262626'}
    />
  );
}
