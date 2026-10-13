import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, TextInput } from '../../../universal/Typography';
import {
  searchMobileFirst,
  type SearchCategory,
  type SearchEntry,
} from '@/features/search/mobileFirstSearch';
import { resolveItalySearchDestination } from '@/universal/navigation/italySearchJourney';
import { SearchField, Tabs, NavigationRow } from '../../../universal/controls';
import { mobileFirstTokens as tokens } from '../../../universal/tokens';
import { AssetGlyph } from '../../../universal/AssetGlyph';
import { SuggestionChip } from '../../../universal/SuggestionChip';
import searchIcon from '@/assets/mobile-first/it/search-imgNavigationAndActionSearchAi.svg';
import accountsIcon from '@/assets/mobile-first/it/pfm/settings-imgBankProductAndServiceAccountsV2.svg';
import cardsIcon from '@/assets/mobile-first/it/pfm/settings-imgHomeBankingAndPaymentsCard.svg';
import movementsIcon from '@/assets/mobile-first/it/imgBankProductAndServicePfmK10.svg';
import paymentsIcon from '@/assets/mobile-first/it/imgHomeBankingAndPaymentsTransferK10.svg';
import productsIcon from '@/assets/mobile-first/it/pfm/l-imgBankProductAndServiceLoans.svg';
import investmentsIcon from '@/assets/mobile-first/it/investments/imgInvestmentsIndexK10.svg';
import topicsIcon from '@/assets/mobile-first/it/imgBankTouchpointAndCustomerCareKnowledgeCenterK10.svg';
import insuranceIcon from '@/assets/mobile-first/it/investments/imgInvestmentsBankInsuranceK10.svg';
import closeIcon from '@/assets/mobile-first/it/search-imgClose.svg';
import clearIcon from '@/assets/mobile-first/it/search-clear.svg';
import chevron from '@/assets/mobile-first/it/account-chevron.svg';
import { normalizeItalianAutoInteger } from './numberFormatting';

function formatSearchCurrency(value: number, currency: string): string {
  const parts = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
  }).formatToParts(value);
  const integer = parts
    .filter(part => part.type === 'integer' || part.type === 'group')
    .map(part => part.value)
    .join('');
  const retainGroups = normalizeItalianAutoInteger(integer) === integer;
  return parts
    .filter(part => part.type !== 'group' || retainGroups)
    .map(part => part.value)
    .join('');
}

const categories: { id: SearchCategory; label: string; icon: string }[] = [
  { id: 'accounts', label: 'Conti', icon: accountsIcon },
  { id: 'cards', label: 'Carte', icon: cardsIcon },
  { id: 'movements', label: 'Movimenti', icon: movementsIcon },
  { id: 'payments', label: 'Pagamenti', icon: paymentsIcon },
  { id: 'products', label: 'Prodotti', icon: productsIcon },
  { id: 'investments', label: 'Investimenti', icon: investmentsIcon },
  { id: 'topics', label: 'Argomenti', icon: topicsIcon },
];
function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query
      .trim()
      .toLocaleLowerCase('it')
      .split(/\s+/)
      .filter(Boolean),
    lower = text.toLocaleLowerCase('it');
  const segments: { start: number; end: number; matched: boolean }[] = [];
  for (let index = 0; index < text.length; index++) {
    const matched = terms.some(term => {
      const start = lower.lastIndexOf(term, index);
      return start !== -1 && index < start + term.length;
    });
    const last = segments[segments.length - 1];
    if (last?.matched === matched) last.end = index + 1;
    else segments.push({ start: index, end: index + 1, matched });
  }
  return (
    <>
      {segments.map(part => (
        <Text
          key={part.start}
          style={part.matched ? styles.highlight : undefined}
        >
          {text.slice(part.start, part.end)}
        </Text>
      ))}
    </>
  );
}
export interface SearchProps {
  entries?: readonly SearchEntry[];
  onSelect?: (entry: SearchEntry) => void;
  onClose: () => void;
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
  amountsHidden?: boolean;
  systemInsetTop?: number;
}
export default function Search({
  entries = [],
  onSelect,
  onClose,
  initialQuery = '',
  onQueryChange,
  amountsHidden = false,
  systemInsetTop = 0,
}: SearchProps) {
  const [query, setQuery] = useState(initialQuery),
    [category, setCategory] = useState<SearchCategory | 'all'>('all');
  const input = useRef<React.ElementRef<typeof TextInput>>(null);
  useEffect(() => {
    input.current?.focus();
    return () => Keyboard.dismiss();
  }, []);
  const update = (value: string) => {
    setQuery(value);
    setCategory('all');
    onQueryChange?.(value);
  };
  const dismiss = () => {
    input.current?.blur();
    Keyboard.dismiss();
  };
  const suggest = (value: string) => {
    update(value);
    dismiss();
  };
  const matches = searchMobileFirst(entries, query),
    filtered =
      category === 'all'
        ? matches
        : matches.filter(entry => entry.category === category);
  const filters = [
    { value: 'all' as const, label: 'Tutto', count: matches.length },
    ...categories.map(item => ({
      value: item.id,
      label: item.label,
      count: matches.filter(entry => entry.category === item.id).length,
    })),
  ];
  const suggestions = (
    <View style={styles.suggestions}>
      {[
        { label: 'Bonifico', icon: paymentsIcon },
        { label: 'Carte', icon: cardsIcon },
        { label: 'Movimenti', icon: movementsIcon },
      ].map(topic => (
        <SuggestionChip
          key={topic.label}
          tokens={tokens}
          label={topic.label}
          icon={
            <AssetGlyph asset={topic.icon} size={16} tintColor={tokens.text} />
          }
          onPress={() => suggest(topic.label)}
        />
      ))}
    </View>
  );
  const row = (entry: SearchEntry, index: number) => {
    const fallback =
      entry.target.kind === 'insurance'
        ? insuranceIcon
        : entry.target.kind === 'category'
        ? {
            Conti: accountsIcon,
            Carte: cardsIcon,
            'Mutui e Prestiti': productsIcon,
            'Polizze assicurative': insuranceIcon,
          }[entry.target.category]
        : categories.find(item => item.id === entry.category)?.icon ??
          topicsIcon;
    const amount =
      entry.amount === undefined
        ? null
        : amountsHidden
        ? `**,** ${
            entry.currency && entry.currency !== 'EUR' ? entry.currency : '€'
          }`
        : formatSearchCurrency(entry.amount, entry.currency || 'EUR');
    const vector =
      !entry.icon ||
      /(?:^data:image\/svg\+xml|\.svg(?:\?|$))/i.test(entry.icon);
    return (
      <View key={entry.id} style={index > 0 ? styles.separator : undefined}>
        <NavigationRow
          tokens={tokens}
          title={entry.title}
          subtitle={entry.subtitle}
          titleContent={<Highlight text={entry.title} query={query} />}
          subtitleContent={<Highlight text={entry.subtitle} query={query} />}
          payload={entry}
          disabled={!onSelect}
          onSelect={selected => {
            const result = resolveItalySearchDestination(selected, entries);
            if (result.status === 'resolved') {
              dismiss();
              onSelect?.(result.entry);
            }
          }}
          icon={
            <View style={styles.resultIcon}>
              {vector ? (
                <AssetGlyph
                  asset={entry.icon ?? fallback}
                  size={24}
                  tintColor={tokens.text}
                />
              ) : (
                <View style={styles.resultPhoto}>
                  <AssetGlyph asset={entry.icon!} size={40} fit="cover" />
                </View>
              )}
            </View>
          }
          trailing={
            <>
              {amount !== null && <Text style={styles.amount}>{amount}</Text>}
              {!!onSelect && (
                <AssetGlyph asset={chevron} width={12} height={22} />
              )}
            </>
          }
        />
      </View>
    );
  };
  return (
    <KeyboardAvoidingView
      style={[
        styles.page,
        Platform.OS === 'web' && styles.webPage,
        { paddingTop: systemInsetTop },
      ]}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : Platform.OS === 'android'
          ? 'height'
          : undefined
      }
    >
      <View style={styles.header}>
        <View style={styles.field}>
          <SearchField
            autoFocus
            ref={input}
            tokens={tokens}
            label="Come posso aiutarti?"
            placeholder="Come posso aiutarti?..."
            value={query}
            onChange={update}
            onSubmit={dismiss}
            onClear={() => {
              update('');
              input.current?.focus();
            }}
            clearLabel="Cancella ricerca"
            clearIcon={<AssetGlyph asset={clearIcon} size={16} />}
            icon={<AssetGlyph asset={searchIcon} />}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chiudi ricerca"
          onPress={() => {
            dismiss();
            onClose();
          }}
          style={styles.close}
        >
          <AssetGlyph asset={closeIcon} size={40} />
        </Pressable>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {!query.trim() ? (
          suggestions
        ) : (
          <>
            <Tabs
              tokens={tokens}
              label="Categorie di ricerca"
              value={category}
              items={filters}
              onChange={setCategory}
            />
            <Text style={styles.status} accessibilityLiveRegion="polite">
              {filtered.length}{' '}
              {filtered.length === 1 ? 'risultato' : 'risultati'}
            </Text>
            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <AssetGlyph asset={searchIcon} />
                <Text style={styles.heading}>Nessun risultato</Text>
                <Text style={styles.description}>
                  Prova un’altra parola o cerca in tutte le categorie.
                </Text>
                {category !== 'all' && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cerca in tutto"
                    onPress={() => setCategory('all')}
                  >
                    <Text style={styles.link}>Cerca in tutto</Text>
                  </Pressable>
                )}
                {suggestions}
              </View>
            ) : (
              categories.map(item => {
                const group = filtered.filter(
                  entry => entry.category === item.id,
                );
                if (!group.length) return null;
                return (
                  <View key={item.id} style={styles.group}>
                    <View style={styles.groupHeader}>
                      <Text style={styles.heading}>{item.label}</Text>
                      {category === 'all' && group.length > 3 && (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Vedi tutti i ${item.label.toLocaleLowerCase(
                            'it',
                          )}`}
                          onPress={() => setCategory(item.id)}
                        >
                          <Text style={styles.link}>
                            Vedi tutti ({group.length})
                          </Text>
                        </Pressable>
                      )}
                    </View>
                    <View style={styles.rows}>
                      {(category === 'all' ? group.slice(0, 3) : group).map(
                        row,
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  webPage: { height: '100%' },
  header: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  field: { flex: 1 },
  close: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 34 },
  heading: {
    fontFamily: tokens.strongFont,
    fontSize: 20,
    lineHeight: 26,
    color: tokens.text,
  },
  smallHeading: {
    fontFamily: tokens.strongFont,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.text,
  },
  description: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 20,
    color: tokens.muted,
    marginTop: 4,
    marginBottom: 24,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  group: { marginBottom: 24 },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  rows: {
    backgroundColor: tokens.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  separator: { borderTopWidth: 1, borderTopColor: tokens.border },
  resultPhoto: { width: 40, height: 40, borderRadius: 8, overflow: 'hidden' },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 20,
    color: tokens.text,
    maxWidth: '32%',
    textAlign: 'right',
  },
  link: {
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 20,
    color: tokens.accent,
    paddingVertical: 6,
  },
  status: {
    fontFamily: tokens.font,
    fontSize: 12,
    lineHeight: 18,
    color: tokens.muted,
    marginTop: 10,
    marginBottom: 18,
  },
  empty: { alignItems: 'center', paddingTop: 18, paddingBottom: 10 },
  highlight: { color: tokens.accent, fontFamily: tokens.strongFont },
  disclaimer: {
    fontFamily: tokens.font,
    fontSize: 12,
    lineHeight: 18,
    color: tokens.muted,
    borderTopWidth: 1,
    borderTopColor: tokens.border,
    paddingTop: 20,
    marginTop: 26,
  },
});
