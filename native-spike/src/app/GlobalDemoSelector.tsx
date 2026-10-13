import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../universal/Typography';
import { ActionButton } from '../universal/ActionButton';
import { SourceCustomIcon } from '../universal/SourceCustomIcon';
import { selectorTokens as tokens } from './selectorTokens';
import type { NativeDemoSelection } from './registry';

const demos: readonly {
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
  const selected = demos.find(demo =>
    Object.entries(demo.selection).every(
      ([axis, value]) => selection[axis as keyof NativeDemoSelection] === value,
    ),
  );
  const canOpen = !!selected && entryAvailable;
  const canSearch = selected?.id === 'cz-evo' && entryAvailable && !!onSearch;
  return (
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
            return (
              <Pressable
                key={demo.id}
                testID={`demo-choice-${demo.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${demo.name}, ${demo.version}`}
                accessibilityHint="Selectează acest demo, apoi apasă Deschide demo."
                accessibilityState={{ selected: chosen }}
                focusable
                onPress={() => onChange({ ...demo.selection })}
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
    </ScrollView>
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
  actions: { gap: 12, marginTop: 32 },
  status: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 20,
    color: tokens.muted,
  },
});
