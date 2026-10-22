import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BaselineMobileCode } from '../../universal/BaselineMobileCode';
import { Text } from '../../universal/Typography';
import { sourceColor } from '../../universal/sourceColor';
import type {
  MobileCodeBiometric,
  MobileCodeDigits,
} from '@/app/components/contracts/mobileCode';
import type { DesignSystemPreviewProps } from './core';

function MobileCodeSample({
  variantId = 'entry',
  dark,
}: Pick<DesignSystemPreviewProps, 'variantId' | 'dark'>) {
  const parts = variantId.split('-');
  const initialDigits: MobileCodeDigits =
    parts[0] === '7' ? 7 : parts[0] === '8' ? 8 : 6;
  const [digits, setDigits] = useState<MobileCodeDigits>(initialDigits);
  const [biometric, setBiometric] = useState<MobileCodeBiometric>(
    variantId === 'fingerprint' || variantId === 'none' ? variantId : 'face-id',
  );
  const [entered, setEntered] = useState(
    parts[1] === 'partial' ? 3 : parts[1] === 'complete' ? initialDigits : 0,
  );
  const [message, setMessage] = useState('');
  const color = sourceColor('var(--uc-text)', dark);
  return (
    <View style={styles.preview}>
      <View style={styles.controls}>
        {([6, 7, 8] as const).map(count => (
          <Pressable
            key={count}
            accessibilityRole="button"
            accessibilityLabel={`${count} digits variant`}
            accessibilityState={{ selected: digits === count }}
            onPress={() => {
              setDigits(count);
              setEntered(Math.min(entered, count));
            }}
            style={styles.control}
          >
            <Text style={{ color }}>{count} digits</Text>
          </Pressable>
        ))}
        {(['face-id', 'fingerprint', 'none'] as const).map(value => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`${value === 'face-id' ? 'Face ID' : value === 'fingerprint' ? 'Fingerprint' : 'No biometric'} variant`}
            accessibilityState={{ selected: biometric === value }}
            onPress={() => setBiometric(value)}
            style={styles.control}
          >
            <Text style={{ color }}>
              {value === 'face-id'
                ? 'Face ID'
                : value === 'none'
                  ? 'None'
                  : 'Fingerprint'}
            </Text>
          </Pressable>
        ))}
        {(['Empty', 'Partial', 'Complete'] as const).map(state => (
          <Pressable
            key={state}
            accessibilityRole="button"
            accessibilityLabel={`${state} progress variant`}
            onPress={() =>
              setEntered(
                state === 'Empty' ? 0 : state === 'Partial' ? 3 : digits,
              )
            }
            style={styles.control}
          >
            <Text style={{ color }}>{state}</Text>
          </Pressable>
        ))}
      </View>
      <BaselineMobileCode
        digits={digits}
        enteredDigits={entered}
        biometric={biometric}
        dark={dark}
        onDigit={() => setEntered(count => Math.min(digits, count + 1))}
        onDelete={() => setEntered(count => Math.max(0, count - 1))}
        onBiometric={() =>
          setMessage(
            'Biometric action requested. The host owns authentication.',
          )
        }
        onRecover={() =>
          setMessage(
            'Recovery action requested. The host owns the recovery journey.',
          )
        }
      />
      {message ? (
        <Text accessibilityLiveRegion="polite" style={{ color }}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

/** One presentation for the five authored child families; no secret or authorization policy. */
export function MobileCodeDesignSystemPreview({
  componentId,
  variantId,
  dark,
}: DesignSystemPreviewProps) {
  if (componentId !== 'ui.mobile-code') return null;
  return (
    <MobileCodeSample
      key={variantId ?? 'entry'}
      variantId={variantId}
      dark={dark}
    />
  );
}

const styles = StyleSheet.create({
  preview: { width: 375, gap: 20 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  control: {
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#b9b9b9',
  },
});
