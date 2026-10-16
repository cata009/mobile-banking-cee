import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { CurrentScreenProps } from '../contracts';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Button, Copy, useSourceColors } from './Primitives';
export default function AppointmentSuccess({
  host,
  title,
  thanks,
  paragraphs,
  onDone,
  label,
}: {
  host: CurrentScreenProps;
  title: string;
  thanks: string;
  paragraphs: readonly string[];
  onDone: () => void;
  label: string;
}) {
  const color = useSourceColors();
  return (
    <View style={[styles.page, { backgroundColor: color('--uc-surface') }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: host.screenTopInset + 16 },
        ]}
      >
        <Copy strong size={28} lineHeight={31}>
          {title}
        </Copy>
        <View style={styles.markWrap}>
          <View style={styles.mark}>
            <SourceCustomIcon name="check" size={56} color="#43854f" />
          </View>
        </View>
        <View style={styles.thanks}>
          <Copy strong lineHeight={17.5}>
            {thanks}
          </Copy>
        </View>
        {paragraphs.map((paragraph, index) => (
          <View
            key={paragraph}
            style={index < paragraphs.length - 1 ? styles.thanks : undefined}
          >
            <Copy size={18} lineHeight={20}>
              {paragraph}
            </Copy>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Button label={label} onPress={onDone} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  markWrap: { alignItems: 'center', marginVertical: 52 },
  mark: {
    width: 96,
    height: 96,
    borderWidth: 6,
    borderColor: '#43854f',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thanks: { marginBottom: 18 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 },
});
