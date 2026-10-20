import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../universal/Typography';
import { ActionButton } from '../universal/ActionButton';
import { SourceCustomIcon } from '../universal/SourceCustomIcon';
import { selectorTokens as tokens } from './selectorTokens';
import type { NativeDemoSelection } from './registry';
import {
  NATIVE_DEMO_CHOICES,
  RELEASE_BUNDLES,
  resolveNativeDemo,
} from './registry';
import { Select } from '../universal/Select';

const legacyDemos: readonly {
  id: 'italy' | 'cz-evo';
  name: string;
  version: string;
  selection: Readonly<NativeDemoSelection>;
}[] = [
  {
    id: 'italy',
    name: 'Italia',
    version: 'Mobile First',
    selection: {
      product: 'PI',
      country: 'IT',
      designSystem: 'mobile-first',
      release: 'release-current',
      scenario: 'active',
    },
  },
  {
    id: 'cz-evo',
    name: 'Cehia',
    version: 'Evo 2027',
    selection: {
      product: 'PI',
      country: 'CZ',
      designSystem: 'current',
      release: 'release-future-evo-2027',
      scenario: 'active',
    },
  },
];
const demos = [
  ...legacyDemos,
  ...NATIVE_DEMO_CHOICES.filter(
    choice => choice.id !== 'italy' && choice.id !== 'cz-evo',
  ),
];

export default function GlobalDemoSelector({
  selection,
  onChange,
  onOpen,
  onSearch,
  entryAvailable = true,
}: {
  selection: NativeDemoSelection;
  onChange: (selection: NativeDemoSelection) => void;
  onOpen: () => void;
  onSearch?: () => void;
  entryAvailable?: boolean;
}) {
  const selected = NATIVE_DEMO_CHOICES.find(
    demo =>
      demo.selection.product === selection.product &&
      demo.selection.country === selection.country &&
      demo.selection.designSystem === selection.designSystem &&
      demo.releases.includes(selection.release),
  );
  const canOpen =
    !!selected &&
    !!resolveNativeDemo(selection).implementation &&
    entryAvailable;
  const canSearch =
    selection.scenario === 'active' &&
    (selected?.id === 'cz-evo' ||
      resolveNativeDemo(selection).implementation === 'current') &&
    entryAvailable &&
    !!onSearch;
  return (
    <View style={s.page}>
      <ScrollView
        style={s.page}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.content}>
          <View style={s.brand}>
            <SourceCustomIcon name="nav-home" size={24} color={tokens.accent} />
            <Text style={s.brandName}>Mobile Banking · CEE</Text>
          </View>
          <View style={s.intro}>
            <Text accessibilityRole="header" style={s.title}>
              Alege experiența demo
            </Text>
            <Text style={s.body}>
              Selectează demo-ul pe care vrei să îl explorezi.
            </Text>
          </View>
          <View style={s.options}>
            {demos.map(demo => {
              const chosen = selected?.id === demo.id;
              const available = !!resolveNativeDemo(demo.selection)
                .implementation;
              return (
                <Pressable
                  key={demo.id}
                  testID={`demo-choice-${demo.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${demo.name}, ${demo.version}`}
                  accessibilityHint="Selectează acest demo, apoi apasă Deschide demo."
                  accessibilityState={{
                    selected: chosen,
                    disabled: !available,
                  }}
                  disabled={!available}
                  focusable
                  onPress={() => {
                    if (available) onChange({ ...demo.selection });
                  }}
                  style={({ pressed }) => [
                    s.card,
                    chosen && s.cardSelected,
                    pressed && s.pressed,
                  ]}
                >
                  <View style={s.cardCopy}>
                    <Text style={s.country}>{demo.name}</Text>
                    <Text style={s.version}>{demo.version}</Text>
                  </View>
                  <View
                    style={[s.selectionMark, chosen && s.selectionMarkSelected]}
                    accessible={false}
                    importantForAccessibility="no-hide-descendants"
                  >
                    {chosen && (
                      <SourceCustomIcon
                        name="check"
                        size={18}
                        color={tokens.inverse}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <View style={s.footer}>
        <View style={s.footerContent}>
          {selected && (
            <Text style={s.version}>
              {selected.name} · {selected.version}
            </Text>
          )}
          {selected && (
            <View style={s.actions}>
              {selected.releases.length > 1 && (
                <Select
                  tokens={tokens}
                  label="Versiune"
                  value={selection.release}
                  items={selected.releases.map(release => ({
                    value: release,
                    label: RELEASE_BUNDLES[release].label,
                  }))}
                  onChange={release => onChange({ ...selection, release })}
                />
              )}
              <Select
                tokens={tokens}
                label="Stare app"
                value={selection.scenario}
                items={[
                  { value: 'active', label: 'App activă' },
                  { value: 'inactive', label: 'App inactivă' },
                ]}
                onChange={scenario => onChange({ ...selection, scenario })}
              />
            </View>
          )}
          <View style={s.actions}>
            {!canOpen && (
              <Text accessibilityLiveRegion="polite" style={s.status}>
                {selected
                  ? 'Demo-ul ales nu poate fi deschis acum.'
                  : 'Alege una dintre opțiuni pentru a continua.'}
              </Text>
            )}
            <ActionButton
              tokens={tokens}
              label="Deschide demo"
              disabled={!canOpen}
              onPress={() => {
                if (canOpen) onOpen();
              }}
            />
            {canSearch && (
              <ActionButton
                tokens={tokens}
                label="Caută în demo"
                secondary
                onPress={() => {
                  if (canSearch) onSearch?.();
                }}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.background },
  scroll: { flexGrow: 1, padding: 24 },
  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  brandName: {
    fontFamily: tokens.strongFont,
    fontSize: 16,
    lineHeight: 24,
    color: tokens.text,
    flexShrink: 1,
  },
  intro: { gap: 12 },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: tokens.strongFont,
    color: tokens.text,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: tokens.font,
    color: tokens.muted,
  },
  options: { gap: 16, marginTop: 32 },
  card: {
    minHeight: 120,
    padding: 20,
    borderWidth: 2,
    borderRadius: tokens.radius * 2,
    borderColor: tokens.border,
    backgroundColor: tokens.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardSelected: { borderColor: tokens.accent, backgroundColor: tokens.surface },
  pressed: { opacity: 0.72 },
  cardCopy: { flex: 1, minWidth: 0, gap: 8 },
  country: {
    fontFamily: tokens.strongFont,
    fontSize: 28,
    lineHeight: 34,
    color: tokens.text,
  },
  version: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 24,
    color: tokens.muted,
  },
  selectionMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: tokens.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  selectionMarkSelected: {
    borderColor: tokens.accent,
    backgroundColor: tokens.accent,
  },
  actions: { gap: 12 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: tokens.border,
    backgroundColor: tokens.background,
  },
  footerContent: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: 12 },
  status: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 20,
    color: tokens.muted,
  },
});
