import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import type { ItalyCard } from '@/experiences/pi/it/mobile-first/cardsContent';
import { accountNameError } from '@/features/accounts-payments/mobileFirstAccounts';
import { Button, Copy, Input, Page, Title } from '../accounts/Primitives';
import CardArt from './CardArt';
import { saveNativeItalyCardSessionMetadata } from './cardSession';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
export default function CardPersonalization({
  cards,
  hidden,
  onBack,
  onProfile,
  onChanged,
}: {
  cards: readonly ItalyCard[];
  hidden: boolean;
  onBack: () => void;
  onProfile: () => void;
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState(() => cards.map(card => ({ ...card }))),
    [editing, setEditing] = useState<string | null>(null),
    [value, setValue] = useState(''),
    [error, setError] = useState<string | null>(null);
  const favorites = draft.filter(card => card.favorite);
  const reorder = (id: string, delta: number) => {
    const index = favorites.findIndex(card => card.id === id),
      next = index + delta;
    if (next < 0 || next >= favorites.length) return;
    const reordered = [...favorites];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    setDraft([...reordered, ...draft.filter(card => !card.favorite)]);
  };
  const card = (item: ItalyCard, index?: number) => (
    <View
      key={item.id}
      testID={`personalize-card-${item.id}`}
      style={styles.card}
    >
      <View style={styles.top}>
        <CardArt card={item} mini hidden={hidden} />
        <View style={styles.copy}>
          <Copy strong>{item.nickname ?? item.holder}</Copy>
          <Copy muted>{hidden ? '•••• ••••' : `**** ${item.lastFour}`}</Copy>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Modifica nome ${item.name} ${
            hidden ? '•••• ••••' : item.lastFour
          }`}
          onPress={() => {
            setEditing(item.id);
            setValue(item.nickname ?? item.holder);
            setError(null);
          }}
        >
          <Text style={styles.action}>Modifica</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.favorite ? 'Rimuovi' : 'Aggiungi'} ${
            item.name
          } ${hidden ? '•••• ••••' : item.lastFour} ${
            item.favorite ? 'dai' : 'ai'
          } preferiti`}
          accessibilityState={{ selected: item.favorite }}
          onPress={() =>
            setDraft(
              draft.map(row =>
                row.id === item.id ? { ...row, favorite: !row.favorite } : row,
              ),
            )
          }
        >
          <Text style={styles.star}>{item.favorite ? '★' : '☆'}</Text>
        </Pressable>
      </View>
      <Copy strong>{item.name}</Copy>
      {index !== undefined && (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sposta ${item.name} ${
              hidden ? '•••• ••••' : item.lastFour
            } in alto`}
            accessibilityState={{ disabled: index === 0 }}
            disabled={index === 0}
            onPress={() => reorder(item.id, -1)}
          >
            <Text style={[styles.action, index === 0 && styles.disabled]}>
              ⌃
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sposta ${item.name} ${
              hidden ? '•••• ••••' : item.lastFour
            } in basso`}
            accessibilityState={{ disabled: index === favorites.length - 1 }}
            disabled={index === favorites.length - 1}
            onPress={() => reorder(item.id, 1)}
          >
            <Text
              style={[
                styles.action,
                index === favorites.length - 1 && styles.disabled,
              ]}
            >
              ⌄
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
  if (editing)
    return (
      <Page
        title="Modifica nome carta"
        onBack={() => setEditing(null)}
        onProfile={onProfile}
        footer={
          <>
            <Button
              onPress={() => {
                const problem = accountNameError(value);
                setError(problem);
                if (!problem) {
                  setDraft(
                    draft.map(row =>
                      row.id === editing
                        ? { ...row, nickname: value.trim() }
                        : row,
                    ),
                  );
                  setEditing(null);
                }
              }}
            >
              Salva
            </Button>
            <Button secondary onPress={() => setEditing(null)}>
              Annulla
            </Button>
          </>
        }
      >
        <Input
          label="Nome carta"
          value={value}
          maxLength={20}
          onChangeText={setValue}
        />
        <Copy muted>Massimo 20 caratteri alfanumerici</Copy>
        {error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
      </Page>
    );
  return (
    <Page
      title="Carte"
      onBack={onBack}
      onProfile={onProfile}
      footer={
        <Button
          onPress={() => {
            saveNativeItalyCardSessionMetadata(draft);
            onChanged();
            onBack();
          }}
        >
          Salva
        </Button>
      }
    >
      <Title>Preferite</Title>
      <Copy>
        Puoi spostare le tue carte preferite per posizionarle secondo l’ordine
        desiderato.
      </Copy>
      {favorites.map((item, index) => card(item, index))}
      <Title>Tutte le carte</Title>
      {draft.filter(item => !item.favorite).map(item => card(item))}
    </Page>
  );
}
const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  top: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  copy: { flex: 1, gap: 4 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  action: { fontFamily: tokens.strongFont, color: tokens.accent, fontSize: 20 },
  star: { fontSize: 24, color: tokens.accent },
  disabled: { opacity: 0.3 },
  error: { color: '#b40000', fontFamily: tokens.font },
});
