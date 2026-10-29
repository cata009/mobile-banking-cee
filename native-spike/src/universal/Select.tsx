import React, { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView } from 'react-native';
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
  renderTrigger,
  renderPanel,
  searchText = '',
  multiple,
}: Themed & {
  label: string;
  value: T;
  items: readonly Choice<T>[];
  onChange: (value: T) => void;
  closeLabel?: string;
  searchText?: string;
  multiple?: { values: readonly T[]; onChange: (values: readonly T[]) => void };
  renderTrigger?: (control: {
    open: () => void;
    expanded: boolean;
    label: string;
    selectedLabels: readonly string[];
  }) => React.ReactNode;
  renderPanel?: (control: {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const selected = items.find(item => item.value === value);
  const selectedLabels = multiple
    ? items
        .filter(item => multiple.values.includes(item.value))
        .map(item => item.label)
    : selected
    ? [selected.label]
    : [];
  const isSelected = (itemValue: T) =>
    multiple ? multiple.values.includes(itemValue) : itemValue === value;
  const choose = (item: Choice<T>) => {
    if (item.disabled) return;
    if (multiple)
      multiple.onChange(
        isSelected(item.value)
          ? multiple.values.filter(v => v !== item.value)
          : [...multiple.values, item.value],
      );
    else {
      onChange(item.value);
      setOpen(false);
    }
  };
  const keyboardProps = (
    item: Choice<T>,
  ): Pick<React.ComponentProps<typeof Pressable>, 'onKeyDown'> =>
    Platform.OS === 'web' && multiple
      ? {
          onKeyDown: event => {
            const key: unknown = Reflect.get(event, 'key');
            if (key === ' ' || key === 'Spacebar') {
              event.preventDefault();
              if (Reflect.get(event, 'repeat') !== true) choose(item);
            }
          },
        }
      : {};
  const options = (
    <>
      {items
        .filter(item =>
          `${item.label} ${item.value}`
            .toLocaleLowerCase()
            .includes(searchText.trim().toLocaleLowerCase()),
        )
        .map(item => (
          <Pressable
            key={item.value}
            {...keyboardProps(item)}
            accessibilityRole={multiple ? 'checkbox' : 'button'}
            accessibilityLabel={item.label}
            accessibilityState={{
              ...(multiple
                ? { checked: isSelected(item.value) }
                : { selected: isSelected(item.value) }),
              disabled: !!item.disabled,
            }}
            disabled={!!item.disabled}
            onPress={() => choose(item)}
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
                  fontFamily: isSelected(item.value)
                    ? tokens.strongFont
                    : tokens.font,
                  color: isSelected(item.value) ? tokens.accent : tokens.text,
                },
              ]}
            >
              {item.label}
            </Text>
            {isSelected(item.value) && (
              <Text style={{ color: tokens.accent }}>✓</Text>
            )}
          </Pressable>
        ))}
    </>
  );
  return (
    <>
      {renderTrigger ? (
        renderTrigger({
          open: () => setOpen(true),
          expanded: open,
          label: selectedLabels.join('; '),
          selectedLabels,
        })
      ) : (
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
      )}
      {renderPanel ? (
        renderPanel({ visible: open, onClose: close, children: options })
      ) : (
        <ModalPanel
          tokens={tokens}
          title={label}
          visible={open}
          onClose={close}
          closeLabel={closeLabel}
        >
          <ScrollView>{options}</ScrollView>
        </ModalPanel>
      )}
    </>
  );
}
