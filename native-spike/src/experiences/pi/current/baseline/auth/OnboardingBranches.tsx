import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { searchOnboardingBranches } from '@/features/ro-onboarding/branches';
import { OnboardingSheet } from './OnboardingSheet';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { OnboardingSectionDivider as BaselineSectionDivider } from './OnboardingSectionDivider';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { OnboardingBranchMap } from './OnboardingBranchMap';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
export function OnboardingBranches({
  onSelect,
  onClose,
  initialState = 'map',
}: {
  onSelect: (id: string) => void;
  onClose: () => void;
  initialState?: 'map' | 'list' | 'detail';
}) {
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState<string | null>(
    initialState === 'detail' ? 'branch-1' : null,
  );
  const [expanded, setExpanded] = useState(initialState !== 'map');
  return (
    <OnboardingSheet
      title="Sucursale"
      fixedHeight={expanded && !branch}
      maxHeightOffsetPx={expanded ? 130 : undefined}
      onClose={onClose}
      background={
        <OnboardingBranchMap
          detail={!!branch}
          onClose={onClose}
          onSelect={() => setBranch('branch-1')}
        />
      }
      footer={
        branch ? (
          <View style={s.footer}>
            <PrimaryButton
              label="Alege Sucursala"
              onPress={() => onSelect(branch)}
            />
            <PrimaryButton
              label="Lista sucursale"
              variant="secondary"
              onPress={() => {
                setBranch(null);
                setExpanded(true);
              }}
            />
          </View>
        ) : undefined
      }
    >
      {branch ? (
        <View style={s.content}>
          <View>
            <Text style={s.title}>BUCURESTI</Text>
            <Text style={s.country}>Romania</Text>
          </View>
          <View>
            <Text style={s.distance}>209 m</Text>
            <Text style={s.small}>BULEVARDUL EXPOZITIEI NR. 1 F</Text>
          </View>
          <BaselineSectionDivider title="" ruleOnly width={327} />
          <View style={s.row}>
            <Text style={s.smallBold}>OPENING TIME</Text>
            <Text style={[s.smallBold, s.closed]}>CLOSED</Text>
          </View>
          <View style={s.row}>
            <Text style={s.small}>MON - FRI</Text>
            <Text style={s.small}>9:00 - 19:00</Text>
          </View>
          <View style={s.row}>
            <Text style={s.small}>SAT</Text>
            <Text style={s.small}>9:00 - 15:00</Text>
          </View>
          <BaselineSectionDivider title="" ruleOnly width={327} />
          <View style={s.phone}>
            <SourceCustomIcon
              name="headphones"
              size={24}
              color={sourceColor('var(--uc-text)')}
            />
            <View>
              <Text style={s.smallBold}>LOREM IPSUM DATA</Text>
              <Text style={[s.smallBold, s.phoneNumber]}>+456 79 87 3262</Text>
            </View>
          </View>
        </View>
      ) : (
        <>
          <BaselineTextField
            label="Caută"
            value={search}
            onChange={value => {
              setSearch(value);
              setExpanded(true);
            }}
            onFocus={() => setExpanded(true)}
            trailingIconName="search"
          />
          {expanded &&
            searchOnboardingBranches(search).map(item => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.label}, Address, OPEN, ${item.distance}`}
                onPress={() => setBranch(item.id)}
              >
                <BaselineNavigationRow
                  key={item.id}
                  title={item.label}
                  description="Address"
                  leadingIconName="nav-products"
                  rowHeight={80}
                  style={s.flush}
                  trailing={
                    <View>
                      <Text style={s.label}>OPEN</Text>
                      <Text style={s.label}>{item.distance}</Text>
                    </View>
                  }
                />
              </Pressable>
            ))}
        </>
      )}
    </OnboardingSheet>
  );
}
const s = StyleSheet.create({
  content: { gap: 24 },
  footer: { gap: 8 },
  flush: { paddingHorizontal: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  title: {
    fontFamily: 'UniCredit-bold',
    fontSize: 32,
    color: sourceColor('var(--uc-text)'),
  },
  label: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    color: sourceColor('var(--uc-text)'),
  },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  country: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    color: sourceColor('var(--uc-text-muted)'),
  },
  distance: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    letterSpacing: 1,
    color: sourceColor('var(--uc-text)'),
  },
  small: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 18,
    color: sourceColor('var(--uc-text)'),
  },
  smallBold: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 18,
    color: sourceColor('var(--uc-text)'),
  },
  closed: { color: sourceColor('var(--uc-status-red)') },
  phone: { flexDirection: 'row', alignItems: 'center', gap: 24, minHeight: 48 },
  phoneNumber: { color: sourceColor('var(--uc-action)'), letterSpacing: 1 },
});
