import React from 'react';
import { DesignSystemPreview } from './designSystemPreviews';
import { BaselineDetailToolbar } from '../universal/BaselineDetailToolbar';
import { BaselineNavigationRow } from '../universal/BaselineNavigationRow';
import { BaselineHomeHeader } from '../experiences/pi/current/baseline/Header';
import {
  NativeMoreHeader,
  RoMoreCard,
} from '../experiences/pi/current/baseline/more/More';
import { BaselineInvestmentDocumentsPreview } from '../experiences/pi/current/investments/baseline/flows/Documents';
import { BaselineSpendingHeader } from '../experiences/pi/current/baseline/spending/Overview';
import { InternalTransfer } from '../experiences/pi/current/banking/InternalTransfer';
import { PrimeReferencePreview } from './PrimeReferencePreview';
import type {
  CurrentAdapter,
  CurrentScreenProps,
} from '../experiences/pi/current/contracts';

function ComponentPreview(host: CurrentScreenProps) {
  const preview = host.componentPreview;
  if (!preview) return null;
  if (preview.kind === 'prime-reference')
    return <PrimeReferencePreview host={host} screen={preview.screen} segment={preview.segment} serviceActive={preview.serviceActive} playCallAudio={preview.playCallAudio} />;
  if (preview.kind === 'design-system')
    return (
      <DesignSystemPreview
        componentId={preview.componentId}
        variantId={preview.variantId}
        dark={preview.dark}
      />
    );
  if (preview.kind === 'internal-transfer')
    return (
      <InternalTransfer
        host={host}
        initialDraft={preview.initialDraft}
        initialSchedule={preview.initialSchedule}
        requireSchedule={preview.requireSchedule}
        isEditing={preview.isEditing}
        submitLabel={preview.submitLabel}
        onBack={draft => {
          if (host.onInternalTransferEvent)
            host.onInternalTransferEvent({ type: 'back', draft });
          else host.onBack();
        }}
        onDone={
          preview.onDoneAvailable
            ? () => {
                if (host.onInternalTransferEvent)
                  host.onInternalTransferEvent({ type: 'done' });
                else host.onBack();
              }
            : undefined
        }
        onEditSchedule={
          preview.onEditScheduleAvailable && host.onInternalTransferEvent
            ? draft =>
                host.onInternalTransferEvent?.({ type: 'edit-schedule', draft })
            : undefined
        }
        onComplete={
          host.onInternalTransferEvent
            ? receipt =>
                host.onInternalTransferEvent?.({ type: 'complete', receipt })
            : undefined
        }
      />
    );
  if (preview.kind === 'analytics-header')
    return <BaselineSpendingHeader host={host} />;
  if (preview.kind === 'home-header')
    return (
      <BaselineHomeHeader
        host={host}
        title={preview.title}
        showActions={preview.showActions}
        showTitle={preview.showTitle}
      />
    );
  if (preview.kind === 'more-header')
    return (
      <NativeMoreHeader
        host={host}
        actionVariant={preview.actionVariant}
        messageCount={preview.messageCount}
      />
    );
  if (preview.kind === 'more-card')
    return (
      <RoMoreCard
        card={preview.card}
        title={preview.title}
        width={preview.width}
        dark={host.tokens.background === '#121212'}
        badgeCount={preview.badgeCount}
        onPress={() => undefined}
      />
    );
  if (preview.kind === 'investment-documents')
    return (
      <BaselineInvestmentDocumentsPreview
        host={host}
        currency={preview.currency}
        initialOpenSection={preview.initialOpenSection}
      />
    );
  if (preview.kind === 'contacts-navigation-card')
    return (
      <BaselineNavigationRow
        title={preview.title}
        leadingIconName={`contact-${preview.icon}`}
        linkLabel={preview.value}
        description={preview.subtitle}
        trailingAccessory={preview.hasChevron ? 'chevron' : 'none'}
        onPress={
          preview.icon === 'prime'
            ? () => host.onNavigate({ screen: 'prime' })
            : undefined
        }
        dark={host.tokens.background === '#121212'}
      />
    );
  return (
    <BaselineDetailToolbar
      variant={preview.variant}
      title={preview.title}
      progress={preview.progress}
      onBack={host.onBack}
      onHelpPress={host.onHelpRequest}
      safeAreaReserve={host.screenTopInset}
      dark={host.tokens.background === '#121212'}
    />
  );
}

/** Isolated component previews reuse the same Native leaf as their customer screens. */
export const NATIVE_COMPONENT_PREVIEW_ADAPTER: CurrentAdapter = {
  id: 'pi-native-component-previews',
  screens: {
    home: ComponentPreview,
    account: ComponentPreview,
    card: ComponentPreview,
    pfm: ComponentPreview,
    investments: ComponentPreview,
    payments: ComponentPreview,
  },
};
