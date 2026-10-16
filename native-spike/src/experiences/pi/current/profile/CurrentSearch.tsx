import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TextInput } from '../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { useCurrentTokens, useSourceColors } from './Primitives';
import { useProfileTranslation } from './Host';
export function CurrentSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const tokens = useCurrentTokens(),
    color = useSourceColors(),
    t = useProfileTranslation();
  const input = useRef<React.ElementRef<typeof TextInput>>(null);
  const typed = value.trim().length > 0;
  const label = t('runtime.actions.search', 'Search');
  return (
    <View style={[styles.field, { backgroundColor: color('--uc-app-bg') }]}>
      <View style={styles.icon}>
        <SourceCustomIcon name="search" size={24} color={tokens.text} />
      </View>
      <TextInput
        ref={input}
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={label}
        placeholderTextColor={tokens.muted}
        style={[
          styles.input,
          { fontFamily: tokens.strongFont, color: tokens.text },
        ]}
        returnKeyType="search"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          typed
            ? 'Clear search results'
            : t('runtime.actions.filters', 'Filters')
        }
        onPress={
          typed
            ? () => {
                onChange('');
                input.current?.focus();
              }
            : () => {}
        }
        style={styles.icon}
      >
        <SourceCustomIcon
          name={typed ? 'clear-results' : 'filters'}
          size={24}
          color={tokens.text}
        />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  field: {
    height: 32,
    minHeight: 32,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 32,
    fontSize: 14,
    lineHeight: 15.5,
    padding: 0,
    marginLeft: 8,
  },
});
