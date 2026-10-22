import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { getProductBannerTone } from '@/app/config/productBannerVariants';
import { BaselineBanner } from '../../universal/BaselineBanner';
import { BaselineToast } from '../../universal/BaselineToast';
import { BaselineMailboxTabs } from '../../universal/BaselineMailboxTabs';
import { BaselineMoreCard } from '../../universal/BaselineMoreCard';
import { BaselineProductOfferCard } from '../../universal/BaselineProductOfferCard';
import { BaselineCardComponent } from '../../universal/BaselineCardComponent';
import { sourceColor } from '../../universal/sourceColor';

const noop = () => undefined;
const styles = StyleSheet.create({
  phone: { width: 375 },
  toast: { padding: 16 },
  moreGrid: { width: 344, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
});
const information = {
  title: 'We are completing your investment account opening.',
  description:
    'It can take up to one business day. Come back again to start investing and grow your money.',
};

function MailboxStory({ state, dark }: { state: string; dark: boolean }) {
  const [selected, setSelected] = useState(
    state === 'outbox' ? 'outbox' : 'inbox',
  );
  return (
    <View style={styles.phone}>
      <BaselineMailboxTabs
        dark={dark}
        withTopMargin={false}
        includeBorderInHeight
        tabs={[
          { id: 'inbox', label: 'Inbox', hasNewItems: state === 'inbox-new' },
          { id: 'outbox', label: 'Outbox' },
        ]}
        activeTabId={selected}
        onChange={setSelected}
      />
    </View>
  );
}

/** Registry fixtures only. Unsupported IDs/states remain unsupported, with no substitute renderer. */
export function ComponentsDesignSystemPreview({
  componentId,
  variantId,
  dark,
}: {
  componentId: string;
  variantId?: string;
  dark: boolean;
}): React.ReactElement | null {
  if (componentId === 'messages.mailbox-tabs') {
    const state = variantId ?? 'inbox-new';
    if (!['inbox-new', 'inbox', 'outbox'].includes(state)) return null;
    return <MailboxStory key={state} state={state} dark={dark} />;
  }
  if (componentId === 'ui.toast-message') {
    const state = variantId ?? 'action-required';
    if (
      state !== 'action-required' &&
      state !== 'aware' &&
      state !== 'google-pay'
    )
      return null;
    const surface = {
      backgroundColor:
        state === 'action-required'
          ? sourceColor('var(--uc-surface)', dark)
          : '#000000',
    };
    return (
      <View style={[styles.toast, surface]}>
        <BaselineToast variant={state} themeDark={dark} />
      </View>
    );
  }
  if (componentId === 'cards.helper-card') {
    const state = variantId ?? 'with-link';
    if (state !== 'with-link' && state !== 'plain') return null;
    return (
      <BaselineBanner
        variant="helper"
        title="Details"
        description="Use Details to view more information."
        actionLabel={state === 'with-link' ? 'SEE DETAILS' : undefined}
        onActionPress={noop}
        dark={dark}
      />
    );
  }
  if (componentId === 'cards.ghost-banner') {
    const state = variantId ?? 'title-and-description';
    if (
      !['title-and-description', 'title-only', 'long-description'].includes(
        state,
      )
    )
      return null;
    return (
      <BaselineBanner
        variant="ghost"
        title={
          state === 'long-description'
            ? 'Open a savings account'
            : 'Apply for a loan'
        }
        description={
          state === 'title-only'
            ? undefined
            : state === 'long-description'
            ? 'Set money aside automatically and earn interest with no monthly fees or hidden costs.'
            : 'Check out our best loan offers with\nfixed and variable interest rate'
        }
        onPress={noop}
        dark={dark}
      />
    );
  }
  if (componentId === 'cards.info-banner') {
    const state = variantId ?? 'with-action';
    if (!['with-action', 'no-action', 'title-only'].includes(state))
      return null;
    return (
      <BaselineBanner
        variant="info"
        title={
          state === 'title-only'
            ? 'Your statement is ready to download.'
            : information.title
        }
        description={
          state === 'title-only' ? undefined : information.description
        }
        actionLabel={
          state === 'no-action'
            ? undefined
            : state === 'title-only'
            ? 'VIEW'
            : 'EDIT'
        }
        onActionPress={noop}
        dark={dark}
      />
    );
  }
  if (componentId === 'cards.user-event-card') {
    const state = variantId ?? 'link-and-options';
    if (state !== 'link-and-options' && state !== 'plain') return null;
    return (
      <BaselineBanner
        variant="user-event"
        title="Expenses higher than usual"
        description={
          'Track your spending and try to get\nthe most our of your money.'
        }
        iconName={state === 'plain' ? 'user-event-refresh' : 'user-event-badge'}
        actionLabel={state === 'link-and-options' ? 'FIND OUT MORE' : undefined}
        showOptions={state === 'link-and-options'}
        onActionPress={noop}
        onOptionsPress={noop}
        dark={dark}
      />
    );
  }
  if (componentId === 'cards.pending-action-card') {
    const state = variantId ?? 'with-tag';
    if (state !== 'with-tag' && state !== 'no-tag') return null;
    return (
      <BaselineBanner
        variant="pending"
        title="Pending Action"
        description="You have to reject or confirm a pending payment"
        tagLabel={state === 'with-tag' ? 'Expiring on 12.04.25' : undefined}
        onPress={noop}
        dark={dark}
      />
    );
  }
  if (componentId === 'products.offer-card') {
    const state = variantId ?? 'standard-normal';
    if (
      !['standard-normal', 'compact-normal', 'standard-light'].includes(state)
    )
      return null;
    const light = state === 'standard-light';
    return (
      <BaselineProductOfferCard
        dark={dark}
        variant={state === 'compact-normal' ? 'compact' : 'standard'}
        tone={getProductBannerTone(light ? 'blue' : 'green', light)}
        onPress={noop}
        offer={{
          id: `ds-${state}`,
          title: light
            ? 'Open a savings\naccount'
            : 'Premium current\naccount offer',
          description: light
            ? 'Set money aside automatically\nand earn interest.'
            : 'Enjoy zero monthly fee\nand smart everyday\nbanking benefits.',
          caption:
            state === 'compact-normal'
              ? 'Limited-time offer, terms apply'
              : undefined,
        }}
      />
    );
  }
  if (componentId === 'more.card-grid') {
    if (variantId !== undefined) return null;
    const cards = [
      ['contacts', 'Contacts'],
      ['documents', 'Documents'],
      ['settings', 'Settings'],
      ['gdpr-consent', 'GDPR Consent'],
      ['third-party-consent', 'Third party consent'],
      ['digital-activities', 'Digital activities'],
      ['my-requests', 'My requests'],
      ['tutorial', 'Tutorial'],
    ] as const;
    return (
      <View style={styles.moreGrid}>
        {cards.map(([variant, title]) => (
          <BaselineMoreCard
            key={variant}
            variant={variant}
            title={title}
            width={164}
            badgeCount={variant === 'documents' ? 3 : undefined}
            onPress={noop}
            dark={dark}
          />
        ))}
      </View>
    );
  }
  if (componentId === 'cards.card-component') {
    if (variantId !== undefined && variantId !== 'default') return null;
    return (
      <View style={styles.phone}>
        <BaselineCardComponent />
      </View>
    );
  }
  return null;
}
