import React from 'react';
import { createRoot } from 'react-dom/client';
import { ScrollView, StyleSheet } from 'react-native';
import { OrderDocuments } from './OrderDocuments';
import { createCzInvestmentSnapshot } from './model';
import { DEFAULT_CZECH_COUNTS } from '../contracts';
const styles = StyleSheet.create({
  frame: { width: 393, height: 852, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 24 },
});
createRoot(document.getElementById('root')!).render(
  <ScrollView style={styles.frame} contentContainerStyle={styles.content}>
    <OrderDocuments
      security={{
        ...createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS).catalog[0]!,
        instrumentCurrency: 'EUR',
      }}
    />
  </ScrollView>,
);
