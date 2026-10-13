import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import type { CardMovement } from '@/features/cards/mobileFirstCards';
import { Button, Copy, Page } from '../accounts/Primitives';
import { money } from './cardFormatting';
import { shareCardMovements } from './cardExports';
export default function CardExportSelection({
  rows,
  hidden,
  onBack,
  onProfile,
}: {
  rows: readonly CardMovement[];
  hidden: boolean;
  onBack: () => void;
  onProfile: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]),
    [notice, setNotice] = useState('');
  const share = (format: 'xlsx' | 'pdf') => {
    shareCardMovements(
      rows.filter(row => selected.includes(row.id)),
      format,
      hidden,
    )
      .then(() => setNotice('Documento condiviso.'))
      .catch(() => setNotice('Condivisione non completata.'));
  };
  return (
    <Page
      title="Condividi movimenti"
      onBack={onBack}
      onProfile={onProfile}
      footer={
        <>
          <Button disabled={!selected.length} onPress={() => share('xlsx')}>
            Condividi Excel
          </Button>
          <Button disabled={!selected.length} onPress={() => share('pdf')}>
            Condividi PDF
          </Button>
        </>
      }
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel="Seleziona tutti i movimenti"
        accessibilityState={{
          checked: rows.length > 0 && selected.length === rows.length,
        }}
        onPress={() =>
          setSelected(
            selected.length === rows.length ? [] : rows.map(row => row.id),
          )
        }
      >
        <Copy>
          {rows.length > 0 && selected.length === rows.length ? '✓' : '○'}{' '}
          Seleziona tutti i movimenti
        </Copy>
      </Pressable>
      {rows.map(row => (
        <Pressable
          key={row.id}
          accessibilityRole="checkbox"
          accessibilityLabel={row.name}
          accessibilityState={{ checked: selected.includes(row.id) }}
          onPress={() =>
            setSelected(
              selected.includes(row.id)
                ? selected.filter(id => id !== row.id)
                : [...selected, row.id],
            )
          }
          style={styles.row}
        >
          <Text>{selected.includes(row.id) ? '✓' : '○'}</Text>
          <View style={styles.copy}>
            <Copy strong>{row.name}</Copy>
            <Copy muted>{row.category}</Copy>
            <Copy muted>{row.date}</Copy>
          </View>
          <Copy strong>{money(row.amount, hidden)}</Copy>
        </Pressable>
      ))}
      {notice && <Copy>{notice}</Copy>}
    </Page>
  );
}
const styles = StyleSheet.create({
  row: { paddingVertical: 16, flexDirection: 'row', gap: 12 },
  copy: { flex: 1, gap: 4 },
});
