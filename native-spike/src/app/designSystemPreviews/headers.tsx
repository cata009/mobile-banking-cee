import React from 'react';
import { View } from 'react-native';
import { BaselinePageHeader } from '../../universal/BaselinePageHeader';
import { BaselineL1Header } from '../../universal/BaselineL1Header';
import {
  BaselineHeaderActionButton,
  BaselineHeaderActionRail,
} from '../../universal/BaselineHeaderActions';
import { sourceColor } from '../../universal/sourceColor';

const noop = () => undefined;

export function HeaderDesignSystemPreview({
  componentId,
  variantId,
  dark,
}: {
  componentId: string;
  variantId?: string;
  dark: boolean;
}): React.ReactElement | null {
  if (componentId === 'shell.page-header') {
    let props: Pick<
      React.ComponentProps<typeof BaselinePageHeader>,
      | 'title'
      | 'largeTitleAlign'
      | 'largeTitleColor'
      | 'collapsedTitleProgress'
      | 'largeTitleGutter'
      | 'toolbarLayout'
      | 'rightActions'
    >;
    switch (variantId) {
      case undefined:
      case 'level-1-page':
        props = {
          title: 'Select language',
          largeTitleGutter: 24,
          toolbarLayout: 'source-l2',
          rightActions: (
            <BaselineHeaderActionRail>
              <BaselineHeaderActionButton
                icon="info"
                label="Info"
                onPress={noop}
                dark={dark}
              />
              <BaselineHeaderActionButton
                icon="help"
                label="FAQ"
                onPress={noop}
                dark={dark}
              />
            </BaselineHeaderActionRail>
          ),
        };
        break;
      case 'level-1-center':
        props = { title: 'Account Details', largeTitleAlign: 'center' };
        break;
      case 'level-1-categorized':
        props = {
          title: 'Utility bill',
          largeTitleColor: sourceColor('var(--uc-pfm-utilities)', dark),
        };
        break;
      case 'level-1-uncategorized':
        props = {
          title: 'Uncategorized',
          largeTitleColor: sourceColor('var(--uc-pfm-uncategorized)', dark),
        };
        break;
      case 'collapsed':
        props = { title: 'Account Details', collapsedTitleProgress: 1 };
        break;
      case 'dark':
        props = { title: 'Account Details' };
        break;
      default:
        return null;
    }
    const negative = variantId === 'dark';
    const header = (
      <BaselinePageHeader
        {...props}
        variant={negative ? 'dark' : 'light'}
        dark={dark || negative}
        onBack={noop}
        onHelpPress={noop}
      />
    );
    return negative ? (
      <View style={{ backgroundColor: sourceColor('var(--uc-text)', false) }}>
        {header}
      </View>
    ) : (
      header
    );
  }

  if (componentId === 'shell.more-header') {
    if (
      variantId !== undefined &&
      !['default', 'unread', 'contact-messages'].includes(variantId)
    )
      return null;
    const contact = variantId === 'contact-messages';
    return (
      <BaselineL1Header
        variant="more"
        title="More"
        dark={dark}
        actions={
          <BaselineHeaderActionRail>
            <BaselineHeaderActionButton
              icon={contact ? 'contact-phone' : 'profile'}
              label={contact ? 'Contact phone' : 'Profile'}
              onPress={noop}
              dark={dark}
            />
            <BaselineHeaderActionButton
              icon="messages"
              label="Messages"
              badgeCount={variantId === 'unread' ? 7 : contact ? 2 : 0}
              onPress={noop}
              dark={dark}
            />
            {!contact && (
              <BaselineHeaderActionButton
                icon="logout"
                label="Logout"
                onPress={noop}
                dark={dark}
              />
            )}
          </BaselineHeaderActionRail>
        }
      />
    );
  }
  return null;
}
