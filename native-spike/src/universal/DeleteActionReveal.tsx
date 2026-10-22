import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';

export function DeleteActionReveal({
  actionsOpen,
  dark,
  deleteActionLabel,
  deleteAccessibilityLabel,
  onDelete,
  testID,
  children,
}: {
  actionsOpen: boolean;
  dark: boolean;
  deleteActionLabel: string;
  deleteAccessibilityLabel: string;
  onDelete: () => void;
  testID: string;
  children: React.ReactNode;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const actionOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(translateX, {
        toValue: actionsOpen ? -24 : 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(actionOpacity, {
        toValue: actionsOpen ? 1 : 0,
        duration: actionsOpen ? 210 : 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [actionsOpen, actionOpacity, translateX]);

  return (
    <View testID={testID} style={styles.row}>
      <Animated.View
        pointerEvents={actionsOpen ? 'auto' : 'none'}
        accessibilityElementsHidden={!actionsOpen}
        importantForAccessibility={actionsOpen ? 'yes' : 'no-hide-descendants'}
        style={[
          styles.delete,
          {
            backgroundColor: sourceColor('var(--uc-status-red)', dark),
            opacity: actionOpacity,
          },
        ]}
      >
        {actionsOpen ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={deleteAccessibilityLabel}
            onPress={onDelete}
            style={styles.deleteButton}
          >
            <SourceCustomIcon name="trash-2" size={24} color="#ffffff" />
            <Text style={styles.deleteLabel}>{deleteActionLabel}</Text>
          </Pressable>
        ) : null}
      </Animated.View>
      <Animated.View style={[styles.content, { transform: [{ translateX }] }]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 80, overflow: 'hidden' },
  content: { zIndex: 1 },
  delete: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  deleteButton: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLabel: {
    marginTop: 8,
    color: '#ffffff',
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 15,
  },
});
