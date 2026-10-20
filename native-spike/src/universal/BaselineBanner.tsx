import React, { useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  resolveBanner,
  type BannerVariant,
} from '@/app/components/contracts/banner';
import { PAYMENT_DISCOVER_CONTRACT } from '@/app/components/contracts/paymentDiscover';
import { SourceCustomIcon } from './SourceCustomIcon';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

export { BANNER_ORIGINAL_SOURCES } from '@/app/components/contracts/banner';

/** Gallery/auxiliary variants remain distinct; discovery alone owns dismissal. */
export function BaselineBanner({
  variant,
  title,
  description,
  actionLabel,
  onActionPress,
  onPress,
  dismissible = false,
  onClose,
  closeLabel = 'Close',
  iconName,
  iconNode,
  iconColor,
  layout = 'horizontal',
  showOptions = false,
  onOptionsPress,
  optionsIconName = 'more-horizontal',
  optionsLabel = 'More options',
  tagLabel,
  actionIconName,
  actionIconSize = 16,
  dark = false,
  presentation,
}: {
  variant: BannerVariant | 'payment-discover';
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onPress?: () => void;
  dismissible?: boolean;
  onClose?: () => void;
  closeLabel?: string;
  iconName?: string;
  iconNode?: React.ReactNode;
  iconColor?: string;
  layout?: 'horizontal' | 'stacked';
  showOptions?: boolean;
  onOptionsPress?: () => void;
  optionsIconName?: string;
  optionsLabel?: string;
  tagLabel?: string;
  actionIconName?: string;
  actionIconSize?: number;
  dark?: boolean;
  presentation?: {
    width?: ViewStyle['width'];
    bodyLineHeight?: number;
    radius?: number;
    titleFont?: string;
    titleSize?: number;
    titleLineHeight?: number;
    contentWidth?: number;
    contentPaddingRight?: number;
    closeSize?: number;
    closeRight?: number;
    closeTop?: number;
    closeNode?: React.ReactNode;
  };
}) {
  const [visible, setVisible] = useState(true);
  const discover = variant === 'payment-discover',
    contract = resolveBanner({
      variant: discover ? 'helper' : variant,
      interactive: Boolean(onPress),
      layout,
      hasAction: Boolean(actionLabel),
      dismissible,
      showOptions,
    });
  const white = sourceColor('var(--uc-static-white)', dark),
    text = sourceColor('var(--uc-text)', dark),
    action = sourceColor('var(--uc-action)', dark);
  const solid = variant === 'helper' || variant === 'pending' || discover,
    user = variant === 'user-event',
    stacked = variant === 'ghost' && layout === 'stacked';
  const rootStyle: ViewStyle = {
    width: presentation?.width ?? (discover ? '100%' : contract.width),
    maxWidth: '100%',
    height: contract.height,
    padding: contract.padding,
    borderRadius: presentation?.radius ?? contract.radius,
    gap: contract.gap,
    overflow: variant === 'pending' ? 'hidden' : undefined,
    position: 'relative',
    flexDirection: variant === 'pending' || stacked ? 'column' : 'row',
    alignItems: stacked
      ? 'center'
      : discover || contract.align === 'start'
      ? 'flex-start'
      : 'center',
    backgroundColor: discover
      ? sourceColor('var(--uc-action-strong)', dark)
      : variant === 'helper'
      ? action
      : user
      ? sourceColor('var(--uc-surface)', dark)
      : undefined,
    borderWidth: variant === 'ghost' || variant === 'info' ? 1 : 0,
    borderStyle: variant === 'ghost' ? 'dashed' : 'solid',
    borderColor: text,
    boxShadow: user ? '0 4px 16px rgba(0,0,0,.08)' : undefined,
  };
  const titleStyle = {
    fontFamily: presentation?.titleFont ?? 'UniCredit-bold',
    fontSize: presentation?.titleSize ?? contract.titleFontSize,
    lineHeight:
      presentation?.titleLineHeight ??
      (discover ? undefined : contract.titleLineHeight),
    color: discover
      ? sourceColor('var(--uc-text-inverse)', dark)
      : solid
      ? white
      : text,
  };
  const descriptionStyle = {
    fontFamily: 'UniCredit-regular',
    fontSize: contract.bodyFontSize,
    lineHeight:
      presentation?.bodyLineHeight ??
      (discover ? undefined : contract.bodyLineHeight),
    color: discover
      ? sourceColor('var(--uc-text-inverse)', dark)
      : solid
      ? white
      : text,
  };
  const contentStyle: ViewStyle = {
    flex: presentation?.contentWidth === undefined ? 1 : undefined,
    width: presentation?.contentWidth,
    minWidth: 0,
    gap: 8,
    paddingRight:
      presentation?.contentPaddingRight ?? (variant === 'helper' ? 24 : 0),
    alignItems: stacked ? 'center' : undefined,
  };
  const messageStyle: ViewStyle = { gap: contract.messageGap };
  const iconStyle: ViewStyle = {
    width: contract.slotSize,
    height: contract.slotSize,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: user ? 24 : 0,
    backgroundColor: user ? action : undefined,
  };
  const actionStyle: ViewStyle = {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  };
  const actionTextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 15,
    color: variant === 'helper' ? white : action,
  };
  const closeStyle: ViewStyle = {
    position: 'absolute',
    right: presentation?.closeRight ?? 12,
    top: presentation?.closeTop ?? 9,
    width: presentation?.closeSize ?? 24,
    height: presentation?.closeSize ?? 24,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const optionsStyle: ViewStyle = {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const tagStyle: ViewStyle = {
    marginTop: 'auto',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: white,
  };
  const tagTextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: 12,
    lineHeight: 16,
    color: action,
  };
  const backgroundStyle: ViewStyle = { position: 'absolute', inset: 0 };
  const pendingBodyStyle = { ...descriptionStyle, flex: 1 };
  const discoverRow: ViewStyle = {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: PAYMENT_DISCOVER_CONTRACT.gap,
  };
  const discoverIcon: ViewStyle = { ...optionsStyle, marginTop: 4 };
  const discoverContent: ViewStyle = { flex: 1, minWidth: 0 };
  const discoverBody = { ...descriptionStyle, marginTop: 4 };
  if (discover && !visible) return null;
  if (discover)
    return (
      <View style={rootStyle}>
        <View style={discoverRow}>
          <View style={discoverIcon}>
            <SourceCustomIcon
              name="info-circle"
              size={20}
              color={sourceColor('var(--uc-text-inverse)', dark)}
            />
          </View>
          <View style={discoverContent}>
            <Text style={titleStyle}>{title}</Text>
            <Text style={discoverBody}>{description ?? ''}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={PAYMENT_DISCOVER_CONTRACT.closeLabel}
            onPress={() => setVisible(false)}
            style={optionsStyle}
          >
            <SourceCustomIcon
              name="close-x"
              size={32}
              color={sourceColor('var(--uc-text-inverse)', dark)}
            />
          </Pressable>
        </View>
      </View>
    );
  const content =
    variant === 'pending' ? (
      <>
        <View style={backgroundStyle}>
          <SvgXml
            xml='<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pending"><stop offset="0" stop-color="#007A91"/><stop offset="1" stop-color="#44909E"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#pending)"/></svg>'
            width="100%"
            height="100%"
          />
        </View>
        <Text style={titleStyle}>{title}</Text>
        {description && <Text style={pendingBodyStyle}>{description}</Text>}
        {tagLabel && (
          <View style={tagStyle}>
            <SourceCustomIcon name="warning-small" size={15} color={action} />
            <Text style={tagTextStyle}>{tagLabel.toUpperCase()}</Text>
          </View>
        )}
      </>
    ) : (
      <>
        <View style={iconStyle}>
          {iconNode ?? (
            <SourceCustomIcon
              name={
                iconName ??
                (user
                  ? 'user-event-badge'
                  : variant === 'ghost'
                  ? 'add-circle'
                  : 'info-circle')
              }
              size={contract.iconSize}
              color={
                iconColor
                  ? sourceColor(iconColor, dark)
                  : solid || user
                  ? white
                  : variant === 'ghost'
                  ? action
                  : text
              }
            />
          )}
        </View>
        <View style={contentStyle}>
          <View style={messageStyle}>
            <Text
              numberOfLines={
                (variant === 'ghost' && !stacked) || variant === 'info'
                  ? 2
                  : undefined
              }
              style={titleStyle}
            >
              {title}
            </Text>
            {description && (
              <Text
                numberOfLines={
                  variant === 'ghost' || variant === 'info' ? 4 : undefined
                }
                style={descriptionStyle}
              >
                {description}
              </Text>
            )}
          </View>
          {actionLabel && (
            <Pressable
              accessibilityRole="button"
              onPress={onActionPress}
              style={actionStyle}
            >
              <Text style={actionTextStyle}>{actionLabel}</Text>
              {actionIconName && (
                <SourceCustomIcon
                  name={actionIconName}
                  size={actionIconSize}
                  color={action}
                />
              )}
            </Pressable>
          )}
        </View>
        {variant === 'helper' && dismissible && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
            onPress={onClose}
            style={closeStyle}
          >
            {presentation?.closeNode ?? (
              <SourceCustomIcon name="close-x" size={12} color={white} />
            )}
          </Pressable>
        )}
        {user && showOptions && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={optionsLabel}
            onPress={onOptionsPress}
            style={optionsStyle}
          >
            <SourceCustomIcon name={optionsIconName} size={20} color={action} />
          </Pressable>
        )}
      </>
    );
  return contract.rootTag === 'button' ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={rootStyle}
    >
      {content}
    </Pressable>
  ) : (
    <View style={rootStyle}>{content}</View>
  );
}
