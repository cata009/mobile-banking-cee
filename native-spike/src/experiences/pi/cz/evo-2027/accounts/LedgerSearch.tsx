import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { SearchField } from '../../../../../universal/SearchField';
import { Glyph, tokens } from './Primitives';
const searchTokens = {
  ...tokens,
  searchPaddingHorizontal: 0,
  searchGap: 8,
  searchBackground: 'transparent',
};
/** Source raised comfortable field: one48px surface, internal32px controls. */
export default function LedgerSearch({
  value,
  onChange,
  onFilters,
  label = 'Search transactions',
}: {
  value: string;
  onChange: (value: string) => void;
  onFilters?: () => void;
  label?: string;
}) {
  return (
    <View style={l.surface}>
      <SearchField
        tokens={searchTokens}
        label={label}
        value={value}
        onChange={onChange}
        onSubmit={() => {}}
        onClear={() => onChange('')}
        placeholder="Search"
        icon={
          <View style={l.icon}>
            <Glyph name="search" size={20} />
          </View>
        }
        clearIcon={<Glyph name="clear-results" size={20} />}
        containerStyle={l.field}
        inputStyle={l.input}
      />
      {onFilters && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Transaction filters"
          onPress={onFilters}
          style={l.icon}
        >
          <Glyph name="filters" size={20} />
        </Pressable>
      )}
      {!onFilters && (
        <View style={l.icon}>
          <Glyph name="filters" size={20} />
        </View>
      )}
    </View>
  );
}
const l = StyleSheet.create({
  surface: {
    height: 48,
    paddingHorizontal: 8,
    backgroundColor: tokens.surface,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  field: {
    flex: 1,
    height: 32,
    minHeight: 32,
    paddingVertical: 0,
    paddingHorizontal: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  input: {
    height: 32,
    minHeight: 32,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 16,
  },
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
