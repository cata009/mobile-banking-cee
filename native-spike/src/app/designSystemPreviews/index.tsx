import React from 'react';
import { CoreDesignSystemPreview, type DesignSystemPreviewProps } from './core';
import { ButtonsDesignSystemPreview } from './buttons';
import { ImagesDesignSystemPreview } from './images';
import { DividerDesignSystemPreview } from './dividers';
import { NavigationDesignSystemPreview } from './navigation';
import { InvestmentsDesignSystemPreview } from './investments';
import { ComponentsDesignSystemPreview } from './components';
import { HeaderDesignSystemPreview } from './headers';
import { CatalogDesignSystemPreview, CATALOG_PREVIEW_IDS } from './catalog';
import { MobileCodeDesignSystemPreview } from './mobileCode';
import { FeedbackDesignSystemPreview } from './feedback';
import { FEEDBACK_PROGRESS_VARIANTS } from '@/app/components/contracts/feedbackProgress';
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview';
import { CanonicalIconsDesignSystemPreview } from './icons';
import { CANONICAL_ICON_PREVIEW_VARIANTS } from '@/app/components/contracts/canonicalIcons';
import { CATALOG_COMPOSITION_PREVIEW_VARIANTS } from '@/app/components/contracts/catalogCompositions';
import { CatalogCompositionsDesignSystemPreview } from './compositions';

export function DesignSystemPreview(props: DesignSystemPreviewProps) {
  if (!getNativeDesignSystemPreview(props.componentId, props.variantId))
    return null;
  const key = `${props.componentId}:${props.variantId ?? ''}`;
  if (
    Object.prototype.hasOwnProperty.call(
      CATALOG_COMPOSITION_PREVIEW_VARIANTS,
      props.componentId,
    )
  )
    return <CatalogCompositionsDesignSystemPreview key={key} {...props} />;
  if (
    Object.prototype.hasOwnProperty.call(
      CANONICAL_ICON_PREVIEW_VARIANTS,
      props.componentId,
    )
  )
    return <CanonicalIconsDesignSystemPreview key={key} {...props} />;
  if (
    Object.prototype.hasOwnProperty.call(
      FEEDBACK_PROGRESS_VARIANTS,
      props.componentId,
    )
  )
    return <FeedbackDesignSystemPreview key={key} {...props} />;
  if (props.componentId === 'ui.mobile-code')
    return <MobileCodeDesignSystemPreview key={key} {...props} />;
  if ((CATALOG_PREVIEW_IDS as readonly string[]).includes(props.componentId))
    return <CatalogDesignSystemPreview key={key} {...props} />;
  if (['shell.page-header', 'shell.more-header'].includes(props.componentId))
    return <HeaderDesignSystemPreview key={key} {...props} />;
  if (
    [
      'ui.date-filter',
      'investments.period-chips',
      'investments.filter-chips',
    ].includes(props.componentId)
  )
    return <InvestmentsDesignSystemPreview key={key} {...props} />;
  if (
    [
      'messages.mailbox-tabs',
      'ui.toast-message',
      'cards.helper-card',
      'cards.ghost-banner',
      'cards.info-banner',
      'cards.user-event-card',
      'cards.pending-action-card',
      'products.offer-card',
      'cards.card-component',
      'more.card-grid',
    ].includes(props.componentId)
  )
    return <ComponentsDesignSystemPreview key={key} {...props} />;
  if (['ui.navigation-row', 'ui.toggle-button'].includes(props.componentId))
    return <NavigationDesignSystemPreview key={key} {...props} />;
  if (
    ['ui.primary-button', 'ui.pill', 'ui.pill-sorting'].includes(
      props.componentId,
    )
  )
    return <ButtonsDesignSystemPreview key={key} {...props} />;
  if (props.componentId === 'brand.unicredit-logo')
    return <ImagesDesignSystemPreview key={key} {...props} />;
  if (props.componentId === 'ui.section-heading-divider')
    return <DividerDesignSystemPreview key={key} {...props} />;
  return (
    <CoreDesignSystemPreview
      key={`${props.componentId}:${props.variantId ?? ''}`}
      {...props}
    />
  );
}
