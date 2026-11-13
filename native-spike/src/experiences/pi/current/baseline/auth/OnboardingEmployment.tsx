import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RadioButton } from '../../../../../universal/RadioButton';
import { SearchField } from '../../../../../universal/SearchField';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import { mobileFirstTokens } from '../../../../../universal/tokens';
import { sourceColor } from '../../../../../universal/sourceColor';

export function OnboardingEmployment({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={s.content}>
      <Text style={s.body}>
        If you're employed or retired, we can provide you with a tailored offer.
        Share your status and we'll recommend the perfect offer.
      </Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Employment status"
      >
        {[
          'EMPLOYED',
          'RETIRED',
          'ASSOCIATE',
          'FREELANCER',
          'STUDENT',
          'UNEMPLOYED',
        ].map(label => (
          <RadioButton
            key={label}
            label={label}
            selected={value === label}
            onPress={() => onChange(label)}
            paddingHorizontal={0}
            style={s.option}
            labelStyle={s.label}
          />
        ))}
      </View>
    </View>
  );
}

export function OnboardingEmployer({
  search,
  onSearch,
  onSelect,
}: {
  search: string;
  onSearch: (v: string) => void;
  onSelect: (v: string) => void;
}) {
  const results = [
    'Carrefour Romania',
    'Car Market',
    'Car to Go',
    'Depozitul SRL',
  ].filter(
    label =>
      search.trim() &&
      label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <View style={s.content}>
      <SearchField
        tokens={mobileFirstTokens}
        label="Search employer"
        placeholder="Search"
        value={search}
        onChange={onSearch}
        onSubmit={() => {
          if (search.trim()) onSelect(search.trim());
        }}
        onClear={() => onSearch('')}
        icon={
          <SourceCustomIcon
            name="search"
            size={24}
            color={sourceColor('var(--uc-text)')}
          />
        }
        clearIcon={
          <SourceCustomIcon
            name="close-x"
            size={32}
            color={sourceColor('var(--uc-text)')}
          />
        }
      />
      {!!search.trim() && (
        <BaselineNavigationRow
          title={`Select employer: ${search.trim()}`}
          titleTone="action"
          leadingIconName="plus"
          trailingAccessory="chevron"
          style={s.flush}
          onPress={() => onSelect(search.trim())}
        />
      )}
      {results.length > 0 && (
        <>
          <Text style={s.section}>RELATED RESULTS</Text>
          {results.map(label => (
            <BaselineNavigationRow
              key={label}
              title={label}
              trailingAccessory="chevron"
              rowHeight={64}
              style={s.flush}
              onPress={() => onSelect(label)}
            />
          ))}
        </>
      )}
      {!!search.trim() && results.length === 0 && (
        <View style={s.noResults}>
          <Text style={s.body}>No results found</Text>
          <Text style={s.body}>You can select the employer you indicated</Text>
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  content: { gap: 24 },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  label: { color: sourceColor('var(--uc-text)'), fontSize: 16 },
  option: { height: 64, paddingVertical: 16 },
  section: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    color: sourceColor('var(--uc-text-muted)'),
  },
  flush: { paddingLeft: 0, paddingRight: 0 },
  noResults: { alignItems: 'center', gap: 8, paddingTop: 24 },
});
