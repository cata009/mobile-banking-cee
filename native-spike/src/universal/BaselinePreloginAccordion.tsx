import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  View,
  type ViewStyle,
} from 'react-native';
import {
  PRELOGIN_ACCORDION_CONTRACT as geometry,
  accordionEntries,
  promoteAccordionIndex,
} from '@/app/components/contracts/preloginAccordion';
import { Text } from './Typography';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';

type PreloginProduct = { id: string; title: string; description: string };
function CollapsedRow({
  title,
  onPress,
  children,
  style,
}: {
  title: string;
  onPress: () => void;
  children: React.ReactNode;
  style: ViewStyle;
}) {
  const [hovered, setHovered] = useState(false);
  const rowStyle = [style, { opacity: hovered ? geometry.hoverOpacity : 1 }];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={rowStyle}
    >
      {children}
    </Pressable>
  );
}
/** Isolated geometry and 350ms wait-mode slide; device animation fidelity remains unverified. */
export function BaselinePreloginAccordion({
  products,
  productOrder: externalOrder,
  onProductClick,
  variant = 'static',
  welcomeText,
  findOutMoreText = 'FIND OUT MORE',
  expandedProductId,
  dark = false,
}: {
  products: PreloginProduct[];
  productOrder?: number[];
  onProductClick?: (index: number) => void;
  variant?: 'static' | 'animated';
  welcomeText?: string;
  findOutMoreText?: string;
  expandedProductId?: string;
  dark?: boolean;
}) {
  const [internalOrder, setInternalOrder] = useState(() =>
    products.map((_, index) => index),
  );
  const expandedIndex = products.findIndex(
    product => product.id === expandedProductId,
  );
  const productCount = products.length;
  const slide = useRef(
    new Animated.Value(variant === 'animated' ? 1 : 0),
  ).current;
  const [height, setHeight] = useState(0);
  const [actionHovered, setActionHovered] = useState(false);
  useEffect(() => {
    if (variant !== 'animated') return;
    const animation = Animated.timing(slide, {
      toValue: 0,
      duration: geometry.animationDuration * 1000,
      easing: Easing.bezier(...geometry.easing),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [slide, variant]);
  useEffect(() => {
    if (variant !== 'animated') return;
    const order = Array.from({ length: productCount }, (_, index) => index);
    if (expandedIndex > 0) {
      order.splice(expandedIndex, 1);
      order.unshift(expandedIndex);
    }
    setInternalOrder(order);
  }, [productCount, expandedIndex, variant]);
  const entries = accordionEntries(products, externalOrder || internalOrder),
    expanded = entries[0];
  const color = sourceColor('var(--uc-static-white)', dark);
  const rootStyle: ViewStyle = {
    gap: geometry.gap,
    width: '100%',
    overflow: variant === 'animated' ? 'hidden' : undefined,
  };
  const expandedStyle: ViewStyle = { gap: geometry.expandedTitleGap };
  const descriptionContainer: ViewStyle = { gap: geometry.gap };
  const titleStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: geometry.titleFontSize,
    color,
  };
  const descriptionStyle = {
    fontFamily: 'UniCredit-regular',
    fontSize: geometry.descriptionFontSize,
    color,
  };
  const actionStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    alignSelf: 'flex-start',
    opacity: actionHovered ? geometry.hoverOpacity : 1,
  };
  const actionTextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: geometry.actionFontSize,
    color,
  };
  const rowStyle: ViewStyle = {
    paddingVertical: geometry.collapsedPadding,
    gap: geometry.collapsedGap,
    flexDirection: 'row',
    alignItems: 'center',
  };
  const rowTitleStyle = { ...titleStyle, flex: 1 };
  const lineStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    width: geometry.separatorWidth,
    height: geometry.separatorHeight,
    alignSelf: 'center',
    opacity: geometry.separatorOpacity,
    backgroundColor: sourceColor('var(--uc-text-subtle)', dark),
  };
  const welcomeStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: 0.335,
    color,
  };
  const activate = (index: number) => {
    if (onProductClick) {
      onProductClick(index);
      return;
    }
    if (variant !== 'animated') {
      setInternalOrder(order => promoteAccordionIndex(order, index));
      return;
    }
    if (internalOrder.indexOf(index) === 0) return;
    Animated.timing(slide, {
      toValue: -1,
      duration: geometry.animationDuration * 1000,
      easing: Easing.bezier(...geometry.easing),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      setInternalOrder(order => promoteAccordionIndex(order, index));
      slide.setValue(1);
      Animated.timing(slide, {
        toValue: 0,
        duration: geometry.animationDuration * 1000,
        easing: Easing.bezier(...geometry.easing),
        useNativeDriver: true,
      }).start();
    });
  };
  const animatedStyle =
    variant === 'animated'
      ? {
          transform: [
            {
              translateY: slide.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [-height, 0, height],
              }),
            },
          ],
          opacity: slide.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [0, 1, 0],
          }),
        }
      : undefined;
  if (!expanded) return null;
  return (
    <View style={rootStyle}>
      <Animated.View
        onLayout={event => {
          setHeight(event.nativeEvent.layout.height);
        }}
        style={[rootStyle, animatedStyle]}
      >
        {variant === 'animated' && welcomeText && (
          <Text accessibilityRole="header" style={welcomeStyle}>
            {welcomeText}
          </Text>
        )}
        <View style={expandedStyle}>
          <Text accessibilityRole="header" style={titleStyle}>
            {expanded.product.title}
          </Text>
          <View style={descriptionContainer}>
            <Text style={descriptionStyle}>{expanded.product.description}</Text>
            <Pressable
              accessibilityRole="button"
              style={actionStyle}
              onHoverIn={() => setActionHovered(true)}
              onHoverOut={() => setActionHovered(false)}
            >
              <Text style={actionTextStyle}>
                {findOutMoreText.toUpperCase()}
              </Text>
              <SourceCustomIcon name="chevron-link" size={20} color={color} />
            </Pressable>
          </View>
        </View>
        <View>
          {entries.slice(1).map(({ index, product }) => (
            <CollapsedRow
              key={product.id}
              title={product.title}
              onPress={() => activate(index)}
              style={rowStyle}
            >
              <View style={lineStyle} />
              <Text style={rowTitleStyle}>{product.title}</Text>
              <SourceCustomIcon name="chevron-down" size={20} color={color} />
            </CollapsedRow>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
