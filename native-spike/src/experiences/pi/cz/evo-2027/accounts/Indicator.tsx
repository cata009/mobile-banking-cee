import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { tokens } from './Primitives';
/** Source AccountCarouselIndicator ink dimensions: active30×6, inactive6×6, mini4×4. */
export default function Indicator({
  ids,
  selectedId,
  onSelect,
  label = 'account',
  controlTokens = tokens,
}: {
  ids: readonly string[];
  selectedId: string;
  onSelect: (id: string) => void;
  label?: string;
  controlTokens?: Pick<typeof tokens, 'accent' | 'muted'>;
}) {
  const index = ids.indexOf(selectedId),
    windowSize = 4,
    hasWindow = ids.length > windowSize;
  const start =
      !hasWindow || index <= 1
        ? 0
        : index >= ids.length - 2
        ? ids.length - windowSize
        : Math.max(0, index - 2),
    end = !hasWindow
      ? ids.length
      : index > 1 && index < ids.length - 2
      ? Math.min(ids.length, index + 3)
      : start + windowSize;
  return (
    <View style={i.rail}>
      {hasWindow && start > 0 && (
        <View style={[i.mini, { backgroundColor: controlTokens.muted }]} />
      )}
      {ids.slice(start, end).map((id, localIndex) => (
        <Pressable
          key={id}
          accessibilityRole="button"
          accessibilityLabel={`Go to ${label} ${start + localIndex + 1}`}
          accessibilityState={{
            selected: id === selectedId,
          }}
          onPress={() => onSelect(id)}
        >
          <View
            style={[
              id === selectedId ? i.active : i.dot,
              {
                backgroundColor:
                  id === selectedId
                    ? controlTokens.accent
                    : controlTokens.muted,
              },
            ]}
          />
        </Pressable>
      ))}
      {hasWindow && end < ids.length && (
        <View style={[i.mini, { backgroundColor: controlTokens.muted }]} />
      )}
    </View>
  );
}
const i = StyleSheet.create({
  rail: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  active: {
    width: 30,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.accent,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.muted,
  },
  mini: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.muted,
  },
});
