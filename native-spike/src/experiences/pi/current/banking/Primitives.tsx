import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { Text } from '../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { SearchField } from '../../../../universal/SearchField';
import { NavigationRow } from '../../../../universal/NavigationRow';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import type { CurrentScreenProps } from '../contracts';
import { copy } from './model';
import { Page, Heading } from '../Primitives';

/** Source baseline forms and information pages use white, while carousels and hubs use app grey. */
export function BankingPage({
  host,
  surface = !['account', 'card', 'payments', 'transaction'].includes(
    host.route.screen,
  ),
  ...props
}: React.ComponentProps<typeof Page> & {
  surface?: boolean;
}) {
  const [offset, setOffset] = useState(0);
  const progress = Math.max(0, Math.min(1, offset / 64));
  const children = React.Children.map(props.children, child =>
    React.isValidElement<{
      style?: StyleProp<TextStyle>;
    }>(child) && child.type === Heading
      ? React.cloneElement(child, {
          style: [
            {
              fontSize: 28,
              lineHeight: 32,
              opacity: 1 - progress * (surface ? 1 : 0.9),
            },
            child.props.style,
          ],
        })
      : child,
  );
  return (
    <Page
      {...props}
      collapsedTitleProgress={progress}
      onScroll={event => {
        setOffset(event.nativeEvent.contentOffset.y);
        props.onScroll?.(event);
      }}
      host={
        surface
          ? {
              ...host,
              tokens: {
                ...host.tokens,
                background: host.tokens.surface,
              },
            }
          : host
      }
    >
      {children}
    </Page>
  );
}
export function Label({
  host,
  children,
  strong = false,
  size = 16,
  muted = false,
  style,
}: {
  host: CurrentScreenProps;
  children: React.ReactNode;
  strong?: boolean;
  size?: number;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      style={[
        [
          {
            color: muted ? host.tokens.muted : host.tokens.text,
          },
          {
            fontFamily: strong ? host.tokens.strongFont : host.tokens.font,
          },
          {
            fontSize: size,
          },
          {
            lineHeight: size * 1.25,
          },
        ],
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Amount({
  host,
  value,
  currency,
  size = 24,
}: {
  host: CurrentScreenProps;
  value: number;
  currency: string;
  size?: number;
}) {
  return (
    <Label host={host} strong size={size}>
      {maskFormattedAmount(
        formatMoneyNumber(value, host.country),
        host.amountsHidden,
      )}{' '}
      <Text
        style={{
          fontSize: size * 0.7,
        }}
      >
        {currency}
      </Text>
    </Label>
  );
}
export function Section({
  host,
  title,
}: {
  host: CurrentScreenProps;
  title: string;
}) {
  return (
    <View
      style={[
        s.section,
        {
          borderColor: host.tokens.border,
        },
      ]}
    >
      <Label host={host} strong size={14}>
        {title.toUpperCase()}
      </Label>
    </View>
  );
}
export function Fact({
  host,
  label,
  value,
  trailing,
  information = false,
  sensitive = false,
}: {
  host: CurrentScreenProps;
  label: string;
  value: React.ReactNode;
  trailing?: React.ReactNode;
  information?: boolean;
  sensitive?: boolean;
}) {
  return (
    <View
      style={[
        s.fact,
        information && parityStyles.item0,
        sensitive && parityStyles.item1,
      ]}
    >
      <View style={s.factText}>
        <Label
          host={host}
          muted={!information && !sensitive}
          size={information || sensitive ? 16 : 14}
          style={parityStyles.item2}
        >
          {information ? label.toUpperCase() : label}
        </Label>
        <Label
          host={host}
          strong
          size={sensitive ? 18 : 16}
          style={sensitive ? parityStyles.item3 : parityStyles.item2}
        >
          {value}
        </Label>
      </View>
      {trailing}
    </View>
  );
}
export function Row({
  host,
  title,
  subtitle,
  icon = 'chevron-link',
  onPress,
  trailing,
}: {
  host: CurrentScreenProps;
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <NavigationRow
      tokens={host.tokens}
      payload={title}
      title={title}
      subtitle={subtitle}
      onSelect={() => onPress?.()}
      icon={<SourceCustomIcon name={icon} size={24} color={host.tokens.text} />}
      trailing={
        trailing ?? (
          <SourceCustomIcon
            name="chevron-link"
            size={16}
            color={host.tokens.text}
          />
        )
      }
      borderWidth={0}
      containerStyle={s.row}
    />
  );
}
export function QuickActions({
  host,
  items,
}: {
  host: CurrentScreenProps;
  items: {
    id: string;
    icon: string;
    label: string;
    onPress?: () => void;
    hidden?: boolean;
  }[];
}) {
  return (
    <View style={s.actions}>
      {items.map(item =>
        item.hidden ? (
          <View
            key={item.id}
            style={[s.quick, parityStyles.item4]}
            pointerEvents="none"
          />
        ) : (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.label.replace(/\n/g, ' ')}
            accessibilityState={{
              disabled: !item.onPress,
            }}
            disabled={!item.onPress}
            onPress={() => item.onPress?.()}
            style={s.quick}
          >
            <View style={parityStyles.item5}>
              <SourceCustomIcon
                name={item.icon}
                size={24}
                color={host.tokens.text}
              />
            </View>
            <Label host={host} size={14} style={parityStyles.item6}>
              {item.label}
            </Label>
          </Pressable>
        ),
      )}
    </View>
  );
}
export function Search({
  host,
  value,
  onChange,
  trailing,
  compact = false,
}: {
  host: CurrentScreenProps;
  value: string;
  onChange: (value: string) => void;
  trailing?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <SearchField
      tokens={{
        ...host.tokens,
        text:compact ? host.tokens.muted : host.tokens.text,
        searchBackground: host.tokens.background,
        ...(compact
          ? {
              searchRadius: 10,
              searchPaddingHorizontal: 0,
              searchGap: 8,
            }
          : {}),
      }}
      label={copy(host, 'runtime.common.search', 'Search')}
      placeholder={copy(host, 'runtime.common.search', 'Search')}
      value={value}
      onChange={onChange}
      onSubmit={() => {}}
      onClear={() => onChange('')}
      icon={
        <View style={compact ? parityStyles.item5 : undefined}>
          <SourceCustomIcon name="search" size={24} color={host.tokens.text} />
        </View>
      }
      clearIcon={
        <SourceCustomIcon
          name="clear-results"
          size={24}
          color={host.tokens.text}
        />
      }
      clearLabel="Clear search results"
      containerStyle={compact ? parityStyles.item7 : undefined}
      inputStyle={
        compact
          ? [
              parityStyles.item8,
              {
                fontFamily: host.tokens.strongFont,
                color:host.tokens.text,
              },
              parityStyles.item9,
            ]
          : undefined
      }
      idleTrailing={trailing}
    />
  );
}
export function Toggle({
  host,
  label,
  value,
  onChange,
}: {
  host: CurrentScreenProps;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={s.toggle}>
      <View style={s.factText}>
        <Label host={host} strong size={14}>
          {label}
        </Label>
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{
          true: host.tokens.accent,
        }}
      />
    </View>
  );
}
export function Footer({
  host,
  children,
}: {
  host: CurrentScreenProps;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        s.footer,
        {
          backgroundColor: host.tokens.surface,
        },
      ]}
    >
      {children}
    </View>
  );
}
const s = StyleSheet.create({
  section: {
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  fact: {
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  factText: {
    flex: 1,
    gap: 4,
  },
  row: {
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 0,
  },
  quick: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
});
const parityStyles = StyleSheet.create({
  item0: {
    height: 80,
    paddingVertical: 0,
  },
  item1: {
    minHeight: 74,
  },
  item2: {
    lineHeight: 20,
  },
  item3: {
    lineHeight: 22,
  },
  item4: {
    opacity: 0,
  },
  item5: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item6: {
    textAlign: 'center',
    lineHeight: 15,
  },
  item7: {
    height: 32,
    minHeight: 32,
    paddingVertical: 0,
    paddingHorizontal: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  item8: {
    height: 32,
    minHeight: 32,
    paddingVertical: 0,
  },
  item9: {
    fontSize: 14,
    lineHeight: 16,
  },
});
