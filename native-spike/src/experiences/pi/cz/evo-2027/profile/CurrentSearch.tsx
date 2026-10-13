import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SearchField } from '../../../../../universal/SearchField';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { useCurrentTokens } from './Primitives';
import { useCzechTranslation } from './features/preferences';

/** Current Source AccountSearchBar geometry, composed from the shared input and original icons. */
export function CurrentSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const tokens = useCurrentTokens(),
    t = useCzechTranslation();
  const label = t('runtime.actions.search', 'Search');
  return (
    <SearchField
      tokens={{
        ...tokens,
        searchBackground: tokens.surface,
        searchRadius: 10,
        searchGap: 8,
        searchPaddingHorizontal: 0,
      }}
      label={label}
      placeholder={label}
      value={value}
      onChange={onChange}
      onSubmit={() => {}}
      onClear={() => onChange('')}
      clearLabel={t(
        'runtime.actions.clearSearchResults',
        'Clear search results',
      )}
      containerStyle={styles.field}
      inputStyle={styles.input}
      icon={
        <View style={styles.slot}>
          <SourceCustomIcon name="search" color={tokens.text} size={20} />
        </View>
      }
      clearIcon={
        <SourceCustomIcon name="close-x" color={tokens.text} size={20} />
      }
      idleTrailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('runtime.actions.filters', 'Filters')}
          onPress={() => {}}
          style={[styles.slot, styles.trailing]}
        >
          <SourceCustomIcon name="filters" color={tokens.text} size={20} />
        </Pressable>
      }
    />
  );
}
const styles = StyleSheet.create({
  field: { height: 32, minHeight: 32, paddingVertical: 0 },
  input: {
    height: 32,
    minHeight: 32,
    fontSize: 14,
    lineHeight: 15.5,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  slot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailing: { marginLeft: -8 },
});
