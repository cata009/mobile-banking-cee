import React, { Children, useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { resolveProductsList } from '@/app/components/contracts/productsList';
import type {
  ProductCardVariant,
  ProductCardStyle,
} from '@/app/components/contracts/productCard';
import { BaselineStackedProductShadow } from './BaselineStackedProductShadow';
import { BaselineTotalRow } from './BaselineTotalRow';
import { sourceColor } from './sourceColor';
export function BaselineProductsList({
  children,
  isOpen,
  showTotal = false,
  variant,
  productStyle,
  totalData,
  totalLabel,
  dark = false,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  showTotal?: boolean;
  variant?: ProductCardVariant;
  productStyle?: ProductCardStyle;
  totalData?: { integer: string; decimals: string; currency: string };
  totalLabel?: string;
  dark?: boolean;
}) {
  const products = Children.toArray(children),
    state = resolveProductsList({
      productCount: products.length,
      isOpen,
      variant,
      showTotal,
      hasTotalData: Boolean(totalData),
    });
  const progress = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  useEffect(() => {
    const motion = Animated.timing(progress, {
      toValue: isOpen ? 1 : 0,
      duration: state.durationMs,
      easing: Easing.bezier(0.42, 0, 0.58, 1),
      useNativeDriver: false,
    });
    motion.start();
    return () => motion.stop();
  }, [isOpen, progress, state.durationMs]);
  const gutter = { paddingHorizontal: state.gutter },
    shadow = {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      opacity: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      }),
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -2],
          }),
        },
      ],
    };
  const content = {
    overflow: 'hidden' as const,
    paddingHorizontal: state.gutter,
    maxHeight: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 2000],
    }),
    opacity: progress,
    paddingTop: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, state.evolution ? 0 : 2],
    }),
  };
  const borderStyle = state.evolution
    ? {
        borderTopWidth: 1,
        borderColor: sourceColor('var(--uc-border-muted)', dark),
      }
    : undefined;
  const legacyTotalStyle = {
    padding: 16,
    gap: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: sourceColor('var(--uc-surface)', dark),
  };
  const total = totalData ? (
    <BaselineTotalRow
      {...totalData}
      label={totalLabel}
      variant={variant}
      productStyle={productStyle}
      dark={dark}
    />
  ) : null;
  if (state.single) return <View style={gutter}>{children}</View>;
  const viewStyle1 = { position: 'relative' } as const;
  const viewStyle2 = { gap: state.gap } as const;
  return (
    <View>
      <View style={gutter}>{products[0]}</View>
      <View style={viewStyle1}>
        <Animated.View
          pointerEvents={isOpen ? 'none' : 'auto'}
          aria-hidden={state.shadowHidden}
          accessibilityElementsHidden={state.shadowHidden}
          importantForAccessibility={
            state.shadowHidden ? 'no-hide-descendants' : 'auto'
          }
          style={shadow}
        >
          <BaselineStackedProductShadow dark={dark} />
        </Animated.View>
        <Animated.View
          aria-hidden={state.contentHidden}
          accessibilityElementsHidden={state.contentHidden}
          importantForAccessibility={
            state.contentHidden ? 'no-hide-descendants' : 'auto'
          }
          style={content}
        >
          <View style={viewStyle2}>
            {products.slice(1).map((child, index) => (
              <View key={index} style={borderStyle}>
                {child}
              </View>
            ))}
            {state.showTotal ? (
              state.evolution ? (
                <View style={borderStyle}>{total}</View>
              ) : (
                <View style={legacyTotalStyle}>{total}</View>
              )
            ) : null}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
