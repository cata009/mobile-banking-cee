import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../../universal/Typography';
import type { Product } from '@/data/products';
import { createEvoTranslations } from '@/translations/evo';
import type { CzechNativeScreenProps } from '../contracts';
import { CardArtwork } from './CardArtwork';
import { Rail, textStyles as t } from './Primitives';
import { createHomeProducts } from './model';
import { evoTokens as tokens } from './tokens';

/** Exact Source presentation previews; Premium intentionally opens the existing standard card. */
export function CardComparison({
  products,
  model,
  host,
}: {
  products: Product[];
  model: ReturnType<typeof createHomeProducts>;
  host: CzechNativeScreenProps;
}) {
  const [standard, euro] = products
    .filter(p => p.type === 'debit_card')
    .slice(0, 2);
  if (!standard || !euro) return null;
  const lastFour = (product: Product) =>
    `**** ${model
      .getProductDisplayNumber(product)
      .replace(/\D/g, '')
      .slice(-4)}`;
  const items = [
    {
      id: standard.id,
      title: 'Debit Standard',
      number: lastFour(standard),
      variant: 'mc-debit-standard' as const,
      product: standard,
    },
    {
      id: `${standard.id}-premium-preview`,
      title: 'Debit Premium',
      number: '**** 5603',
      variant: 'mc-debit-gold' as const,
      product: standard,
    },
    {
      id: euro.id,
      title: 'Debit Standard EUR',
      number: lastFour(euro),
      variant: 'mc-virtual-standard-violet' as const,
      product: euro,
    },
  ];
  const pages = [items.slice(0, 2), items.slice(2)];
  return (
    <Rail
      title={createEvoTranslations(host.language ?? 'en').groups.debitCards}
      hideCount
      peek={false}
      onAdd={() =>
        host.onNavigate({
          screen: 'product-detail',
          params: { itemId: 'debit-card' },
        })
      }
      items={pages.map((page, i) => ({
        id: `cards-page-${i}`,
        label: `Debit cards page ${i + 1}`,
        content: (
          <View style={s.page}>
            {page.map(item => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title} card details`}
                onPress={() =>
                  host.onNavigate({
                    screen: 'card',
                    params: { productId: item.product.id },
                  })
                }
                style={s.tile}
              >
                <View style={s.art}>
                  <View style={s.artClip}>
                    <CardArtwork
                      variant={item.variant}
                      width={80}
                      height={50}
                    />
                  </View>
                </View>
                <View style={s.copy}>
                  <Text style={[t.body, t.strong]}>{item.title}</Text>
                  <Text style={[t.body, t.muted]}>{item.number}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ),
      }))}
    />
  );
}
const s = StyleSheet.create({
  // Same white surface and lift as the Accounts card above it.
  page: {
    flexDirection: 'row',
    backgroundColor: tokens.surface,
    borderRadius: 8,
    padding: 8,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  art: {
    width: 80,
    height: 50,
    borderRadius: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
  },
  artClip: { width: 80, height: 50, borderRadius: 4, overflow: 'hidden' },
  tile: {
    flex: 1,
    minHeight: 120,
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  copy: { alignItems: 'center', gap: 2 },
});
