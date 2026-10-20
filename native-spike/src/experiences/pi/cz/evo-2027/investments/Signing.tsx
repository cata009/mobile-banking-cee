import React from 'react';
import { Authorization } from '../auth/Authorization';
import { useInvestmentActive } from './Runtime';

/** Shared CZ demo semantics and real-device authentication lifecycle; no credential rule is introduced. */
export function Signing({
  onBack,
  onSigned,
  title = 'Sign order',
  pinLabel = 'Enter PIN to sign the order',
  pinHelper = 'Authorize your one-off investment order',
  actionLabel = 'Sign order',
  pinTopSpacing,
  pinFocused = false,
  demoPresentation,
  canonicalControls,
}: {
  onBack: () => void;
  onExit: () => void;
  onSigned: () => void;
  title?: string;
  pinLabel?: string;
  pinHelper?: string;
  actionLabel?: string;
  pinTopSpacing?: number;
  pinFocused?: boolean;
  demoPresentation?: 'confirmation' | 'face-id';
  canonicalControls?: boolean;
}) {
  const isActive = useInvestmentActive();
  return (
    <Authorization
      onSign={onSigned}
      onBack={onBack}
      isActive={isActive}
      title={title}
      pinLabel={pinLabel}
      pinHelper={pinHelper}
      actionLabel={actionLabel}
      pinTopSpacing={pinTopSpacing}
      pinFocused={pinFocused}
      demoPresentation={demoPresentation}
      canonicalControls={canonicalControls}
    />
  );
}
