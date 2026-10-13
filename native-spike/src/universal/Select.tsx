import React, { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Text } from './Typography';
import { ModalPanel } from './ModalPanel';
import type { Choice } from './types';
import type { Themed } from './types';
import { styles } from './styles';

export function Select<T extends string>({
  tokens,
  label,
  value,
  items,
  onChange,
  closeLabel,
}: Themed & {
  label: string;
  value: T;
  items: readonly Choice<T>[];
  onChange: (value: T) => void;
  closeLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = items.find(item => item.value === value);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: selected?.label ?? '' }}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={[
          styles.select,
          {
            minHeight: tokens.controlHeight,
            borderColor: tokens.border,
            borderRadius: tokens.radius,
          },
        ]}
      >
        <Text
          style={[
            styles.largeLabel,
            { fontFamily: tokens.font, color: tokens.text },
          ]}
        >
          {selected?.label ?? label}
        </Text>
        <Text style={[styles.symbol, { color: tokens.text }]}>⌄</Text>
      </Pressable>
      <ModalPanel
        tokens={tokens}
        title={label}
        visible={open}
        onClose={() => setOpen(false)}
        closeLabel={closeLabel}
      >
        <ScrollView>
          {items.map(item => (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{
                selected: item.value === value,
                disabled: !!item.disabled,
              }}
              disabled={!!item.disabled}
              onPress={() => {
                if (item.disabled) return;
                onChange(item.value);
                setOpen(false);
              }}
              style={[
                styles.option,
                item.disabled && styles.dimmed,
                {
                  borderBottomColor: tokens.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.largeLabel,
                  {
                    fontFamily:
                      item.value === value ? tokens.strongFont : tokens.font,
                    color: item.value === value ? tokens.accent : tokens.text,
                  },
                ]}
              >
                {item.label}
              </Text>
              {item.value === value && (
                <Text style={{ color: tokens.accent }}>✓</Text>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </ModalPanel>
    </>
  );
}
