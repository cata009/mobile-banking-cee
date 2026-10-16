import React, { useRef, useState } from 'react';
import { Pressable, View, Platform, type TextStyle } from 'react-native';
import {
  resolveSearchBar,
  type SearchBarOptions,
} from '@/app/components/contracts/searchBar';
import { Text, TextInput } from './Typography';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';

export function BaselineSearchBar(
  props: Omit<SearchBarOptions, 'searchValue'> & {
    value?: string;
    placeholder?: string;
    accessibilityLabel?: string;
    removeFiltersLabel?: string;
    trailingLabel?: string;
    onValueChange?: (value: string) => void;
    onFilterClick?: () => void;
    onRemoveFilters?: () => void;
    onClearClick?: () => void;
    onClick?: () => void;
    onFocus?: () => void;
    dark?: boolean;
  },
) {
  const [internalValue, setInternalValue] = useState('');
  const value = props.value ?? internalValue;
  const state = resolveSearchBar({ ...props, searchValue: value });
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  const update = (next: string) => {
    if (props.value === undefined) setInternalValue(next);
    props.onValueChange?.(next);
  };
  const foreground = sourceColor('var(--uc-text)', props.dark);
  const background = sourceColor(
    state.fieldSurface === 'raised' ? 'var(--uc-surface)' : 'var(--uc-app-bg)',
    props.dark,
  );
  const icon = (name: string, color = foreground) => (
    <SourceCustomIcon name={name} size={20} color={color} />
  );
  const formStyle0 = {
    alignSelf: 'stretch',
    minHeight: state.minimumHeight,
    borderRadius: state.showRemoveFilters ? 0 : state.radius,
    backgroundColor: state.showRemoveFilters ? 'transparent' : background,
    padding: state.paddedField ? 8 : 0,
    paddingHorizontal: state.showRemoveFilters ? 16 : state.paddedField ? 8 : 0,
    paddingVertical: state.showRemoveFilters ? 2 : state.paddedField ? 8 : 0,
    gap: state.showRemoveFilters ? 8 : 0,
    boxShadow:
      !state.showRemoveFilters && state.fieldSurface === 'raised'
        ? 'inset 0 0 0 1px ' + sourceColor('var(--uc-border-muted)', props.dark)
        : undefined,
  } as const;
  const formStyle1 = {
    flexDirection: 'row',
    alignItems: 'center',
    height: state.innerHeight,
    borderRadius: state.radius,
    backgroundColor: state.paddedField ? 'transparent' : background,
    boxShadow:
      !state.paddedField && state.fieldSurface === 'raised'
        ? 'inset 0 0 0 1px ' + sourceColor('var(--uc-border-muted)', props.dark)
        : undefined,
  } as const;
  const formStyle2 = {
    width: state.iconSlot,
    height: state.iconSlot,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  const formStyle3 = {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
    outlineWidth: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
    height: state.showRemoveFilters ? 32 : state.fieldHeightPx,
    fontFamily: 'UniCredit-bold',
    fontSize: state.inputFontSize,
    color: foreground,
    backgroundColor: 'transparent',
    padding: 0,
  } as TextStyle;
  const formStyle4 = {
    width: state.iconSlot,
    height: state.iconSlot,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  const formStyle5 = {
    minHeight: 32,
    paddingVertical: 6,
    justifyContent: 'center',
  } as const;
  const formStyle6 = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 15,
    textAlign: 'right',
    color: sourceColor('var(--uc-action)', props.dark),
  } as const;
  return (
    <View style={formStyle0}>
      <View style={formStyle1}>
        <View style={formStyle2}>{icon('search')}</View>
        <TextInput
          accessibilityRole="search"
          role="searchbox"
          ref={input}
          underlineColorAndroid="transparent"
          returnKeyType="search"
          keyboardType={Platform.OS === 'web' ? 'web-search' : undefined}
          blurOnSubmit={Platform.OS === 'web' ? false : undefined}
          accessibilityLabel={props.accessibilityLabel ?? props.placeholder ?? 'Search'}
          value={value}
          placeholder={props.placeholder ?? 'Search'}
          placeholderTextColor={sourceColor('var(--uc-text-muted)', props.dark)}
          onChangeText={update}
          {...(Platform.OS === 'web'
            ? { onClick: props.onClick }
            : { onPressIn: props.onClick })}
          onFocus={props.onFocus}
          style={formStyle3}
        />
        {state.trailingVisible ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              state.hasSearchValue
                ? 'Clear search results'
                : props.trailingLabel ?? 'Filters'
            }
            accessibilityState={{ selected: state.trailingPressed }}
            aria-pressed={state.trailingPressed}
            onPress={
              state.hasSearchValue
                ? () => {
                    update('');
                    props.onClearClick?.();
                    input.current?.focus();
                  }
                : props.onFilterClick
            }
            style={formStyle4}
          >
            {icon(
              state.trailingIcon,
              props.filtersActive &&
                !state.hasSearchValue &&
                !props.trailingIcon
                ? sourceColor('var(--uc-action)', props.dark)
                : foreground,
            )}
          </Pressable>
        ) : null}
      </View>
      {state.showRemoveFilters ? (
        <Pressable
          accessibilityRole="button"
          onPress={props.onRemoveFilters}
          style={formStyle5}
        >
          <Text style={formStyle6}>
            {props.removeFiltersLabel ?? 'REMOVE FILTERS'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
