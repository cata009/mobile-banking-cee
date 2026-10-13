import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { loansAssets as a } from '@/experiences/pi/it/mobile-first/loansAssets';
import type { ItalianLoan } from '@/features/credit/mobileFirstLoans';
import { Amount, QuickAction, s } from './LoanPrimitives';

export function LoanAlphabet({
  letters,
  onSelect,
}: {
  letters: readonly string[];
  onSelect: (letter: string) => void;
}) {
  return (
    <View accessibilityLabel="Indice alfabetico" style={p.alphabet}>
      {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
        <Pressable
          key={letter}
          accessibilityRole="button"
          accessibilityLabel={letter}
          accessibilityState={{ disabled: !letters.includes(letter) }}
          disabled={!letters.includes(letter)}
          onPress={() => onSelect(letter)}
          style={p.letterButton}
        >
          <Text
            style={[
              p.letterLabel,
              !letters.includes(letter) && p.disabledLetter,
            ]}
          >
            {letter}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function LoanPortfolio({
  loans,
  favorites,
  editing,
  hidden,
  onOpen,
  onRename,
  onFavorite,
  onMove,
  onSimulation,
  onLetterLayout,
}: {
  loans: readonly ItalianLoan[];
  favorites: readonly string[];
  editing: boolean;
  hidden: boolean;
  onOpen: (id: string) => void;
  onRename: (id: string) => void;
  onFavorite: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onSimulation: () => void;
  onLetterLayout: (letter: string, y: number) => void;
}) {
  const rootY = useRef(0);
  const sectionY = useRef(0);
  const groupY = useRef<Record<string, number>>({});
  const measure = () =>
    Object.entries(groupY.current).forEach(([letter, y]) =>
      onLetterLayout(letter, rootY.current + sectionY.current + y),
    );
  const preferred = favorites
    .map(id => loans.find(item => item.id === id))
    .filter((item): item is ItalianLoan => !!item);
  const others = loans
    .filter(item => !favorites.includes(item.id))
    .sort((left, right) => left.name.localeCompare(right.name, 'it'));
  const tile = (item: ItalianLoan, favorite: boolean, index: number) => (
    <View key={item.id} style={p.tile}>
      {editing ? (
        <>
          <View style={p.top}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Modifica nome ${item.name}`}
              onPress={() => onRename(item.id)}
              style={p.editName}
            >
              <Text style={p.title}>{item.name}</Text>
              <AssetGlyph asset={a.imgNavigationAndActionEditK10} size={16} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${
                favorite ? 'Rimuovi dai' : 'Aggiungi ai'
              } preferiti ${item.name}`}
              accessibilityState={{ selected: favorite }}
              aria-pressed={favorite}
              onPress={() => onFavorite(item.id)}
              style={p.iconButton}
            >
              <AssetGlyph
                asset={
                  favorite
                    ? a.imgIconButtonFavourite
                    : a.imgIconButtonFavourite1
                }
                size={24}
              />
            </Pressable>
          </View>
          <Text style={p.identifier}>
            {item.kind} - {hidden ? '••••' : item.number}
          </Text>
          <View style={p.bottom}>
            <View style={p.amount}>
              <Amount value={item.outstanding} hidden={hidden} />
              <Text style={p.caption}>Capitale residuo</Text>
            </View>
            {favorite && (
              <View style={p.reorder}>
                {([-1, 1] as const).map(direction => {
                  const disabled =
                    direction === -1
                      ? index === 0
                      : index === preferred.length - 1;
                  return (
                    <Pressable
                      key={direction}
                      accessibilityRole="button"
                      accessibilityLabel={`Sposta ${
                        direction === -1 ? 'su' : 'giù'
                      } ${item.name}`}
                      accessibilityState={{ disabled }}
                      disabled={disabled}
                      onPress={() => onMove(item.id, direction)}
                      style={p.iconButton}
                    >
                      <AssetGlyph
                        asset={
                          direction === -1
                            ? disabled
                              ? a.imgNavigationAndActionUpK11
                              : a.imgNavigationAndActionUpK10
                            : disabled
                            ? a.imgNavigationAndActionDownK11
                            : a.imgNavigationAndActionDownK10
                        }
                        size={24}
                      />
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Apri ${item.name}`}
          onPress={() => onOpen(item.id)}
          style={p.open}
        >
          <Text style={p.title}>{item.name}</Text>
          <Text style={p.identifier}>
            {item.kind} - {hidden ? '••••' : item.number}
          </Text>
          <View style={p.amountBlock}>
            <Amount value={item.outstanding} hidden={hidden} />
            <Text style={p.caption}>Capitale residuo</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
  return (
    <View
      onLayout={event => {
        rootY.current = event.nativeEvent.layout.y;
        measure();
      }}
    >
      {!!preferred.length && (
        <View style={p.section}>
          <Text style={p.sectionTitle}>Preferiti</Text>
          {editing && (
            <Text style={p.hint}>
              Puoi spostare i tuoi preferiti per posizionarli secondo l’ordine
              desiderato.
            </Text>
          )}
          <View style={p.cards}>
            {preferred.map((item, index) => tile(item, true, index))}
          </View>
        </View>
      )}
      {!!others.length && (
        <View
          style={p.section}
          onLayout={event => {
            sectionY.current = event.nativeEvent.layout.y;
            measure();
          }}
        >
          <Text style={p.sectionTitle}>Tutti</Text>
          {others.map((item, index) => {
            const letter = item.name[0]?.toLocaleUpperCase('it') ?? '';
            const first =
              index === 0 || others[index - 1]?.name[0] !== item.name[0];
            return (
              <View
                key={item.id}
                onLayout={
                  first
                    ? event => {
                        groupY.current[letter] = event.nativeEvent.layout.y;
                        measure();
                      }
                    : undefined
                }
              >
                {first && <Text style={p.groupLetter}>{item.name[0]}</Text>}
                {tile(item, false, index)}
              </View>
            );
          })}
        </View>
      )}
      {!loans.length && (
        <Text style={s.body}>Non hai mutui o prestiti da visualizzare.</Text>
      )}
      <View style={p.simulation}>
        <QuickAction
          width={90}
          label="Simulazione mutuo"
          asset={a.imgHomeBankingAndPaymentsInstalmentPlansK10}
          onPress={onSimulation}
        />
      </View>
    </View>
  );
}

const p = StyleSheet.create({
  section: { marginTop: 24 },
  sectionTitle: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 28,
    lineHeight: 32,
    marginBottom: 16,
  },
  cards: { gap: 4 },
  tile: {
    minHeight: 160,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  open: { flex: 1 },
  title: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 24,
    lineHeight: 26,
  },
  identifier: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  amountBlock: { marginTop: 32, gap: 4 },
  amount: { gap: 4 },
  caption: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 14,
    lineHeight: 20,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  editName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  bottom: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  reorder: { gap: 8 },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -4,
    marginBottom: 16,
  },
  groupLetter: {
    minHeight: 32,
    marginTop: 24,
    fontFamily: tokens.font,
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
  },
  simulation: { marginTop: 24, alignItems: 'center' },
  alphabet: {
    position: 'absolute',
    top: 172,
    right: 4,
    zIndex: 5,
    alignItems: 'center',
  },
  letterButton: {
    width: 16,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterLabel: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 10,
    lineHeight: 14,
  },
  disabledLetter: { color: '#909090' },
});
