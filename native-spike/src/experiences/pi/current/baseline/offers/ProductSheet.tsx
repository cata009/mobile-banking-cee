import React from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import {
  getProductCardSheetConfig,
  type ProductsCard,
} from '@/app/config/productsMenuConfig';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { SourceBottomSheet } from '../../../../../universal/SourceBottomSheet';
import { sourceColor } from '../../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../../contracts';

/** Source ProductCardBottomSheet: close first, then open the selected product detail. */
export default function ProductSheet({
  host,
  card,
  onClose,
}: {
  host: CurrentScreenProps;
  card: ProductsCard;
  onClose: () => void;
}) {
  const config = getProductCardSheetConfig(card.id, host.country);
  const title = config.title ?? card.title.replace(/\n/g, ' ');
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  return (
    <SourceBottomSheet
      title={title}
      onClose={onClose}
      dark={dark}
      scrollStyle={
        Platform.OS === 'web'
          ? ({ transform: 'none' } as unknown as ViewStyle)
          : undefined
      }
    >
      <View testID="ro-products-card-sheet">
        {config.options.map(option => (
          <BaselineNavigationRow
            key={option.id}
            title={option.title}
            trailingAccessory="chevron"
            style={styles.row}
            titleStyle={styles.title}
            dark={dark}
            onPress={() => {
              onClose();
              host.onNavigate({
                screen: 'product-detail',
                params: {
                  title: option.title,
                  cardId: card.id,
                  optionId: option.id,
                },
              });
            }}
          />
        ))}
      </View>
    </SourceBottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { paddingRight: 16 },
  title: { fontSize: 18, letterSpacing: 0.3 },
});
