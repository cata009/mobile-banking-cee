import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { ModalPanel } from '../../../../universal/ModalPanel';
import down from '@/assets/mobile-first/it/investments/funds/661401-imgNavigationAndActionDownK10.svg';
import securitiesDown from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionDownK10.svg';
import { AssetGlyph, s, tokens } from './Primitives';
export default function FormSelect({
  label,
  value,
  options,
  onChange,
  variant,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  variant?: 'securities';
}) {
  const [open, setOpen] = useState(false);
  return (
    <View
      style={[styles.field, variant === 'securities' && styles.securitiesField]}
    >
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        style={[
          styles.control,
          variant === 'securities' && styles.securitiesControl,
        ]}
      >
        <Text style={s.body}>{value || 'Tutti'}</Text>
        <AssetGlyph
          asset={variant === 'securities' ? securitiesDown : down}
          width={variant === 'securities' ? 16 : 24}
          height={variant === 'securities' ? 16 : 24}
        />
      </Pressable>
      <ModalPanel
        tokens={tokens}
        title={label}
        visible={open}
        onClose={() => setOpen(false)}
        closeLabel={`Chiudi ${label}`}
      >
        <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
          {options.map(option => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${option || 'Tutti'}`}
              accessibilityState={{ selected: option === value }}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={[s.option, option === value && s.optionSelected]}
            >
              <Text style={s.body}>{option || 'Tutti'}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ModalPanel>
    </View>
  );
}
const styles = StyleSheet.create({
  securitiesField: { marginBottom: 0 },
  securitiesControl: {
    minHeight: 50,
    paddingVertical: 12,
    borderRadius: 12,
    borderColor: '#666',
  },
  field: { gap: 8, marginBottom: 16 },
  label: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  control: {
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
  },
  options: { maxHeight: 360 },
});
