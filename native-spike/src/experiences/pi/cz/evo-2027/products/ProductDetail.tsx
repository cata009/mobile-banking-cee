import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Text } from '../../../../../universal/Typography';
import { Header, ActionButton } from '../../../../../universal/controls';
import { Authorization } from '../auth/Authorization';
import { buildShelfProductSelection } from '@/app/config/productsShelfConfig';
import {
  getProductApplyLabel,
  getProductDetailContent,
} from '@/features/products/evoProductDetail';
import type { CzechNativeScreenProps } from '../contracts';
import { evoTokens as tokens } from '../home/tokens';
import { Glyph, textStyles as t } from '../home/Primitives';
import { SourcePhoto } from './SourcePhoto';

export default function ProductDetail(host: CzechNativeScreenProps) {
  const selection = buildShelfProductSelection(host.route.params?.itemId ?? '');
  const [step, setStep] = useState<'none' | 'sign' | 'success'>('none');
  const { width } = useWindowDimensions();
  useEffect(() => {
    setStep('none');
  }, [host.route.params?.itemId]);
  const back = () => {
    if (step === 'sign') setStep('none');
    else host.onBack();
  };
  if (selection && step === 'sign')
    return (
      <Authorization
        title={`Apply for ${selection.title}`}
        pinLabel="Mobile banking PIN"
        pinHelper="Confirm you want to send this request."
        actionLabel="Send request"
        screenTopInset={host.screenTopInset}
        isActive={host.isActive}
        onBack={back}
        onSign={() => {
          setStep('success');
          host.onChanged();
        }}
      />
    );
  if (!selection)
    return (
      <View style={[s.root, { paddingTop: host.screenTopInset ?? 0 }]}>
        <Header
          tokens={tokens}
          title="Product unavailable"
          onBack={host.onBack}
          backIcon={<Glyph name="back" size={16} />}
        />
        <Text style={[t.body, sourceStyles.padding24]}>
          The selected product is not in this catalogue.
        </Text>
      </View>
    );
  const content = getProductDetailContent(
    selection.optionId,
    selection.cardId,
    selection.title,
  );
  const title = step === 'success' ? 'Request sent' : selection.title;
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[s.root, { paddingTop: host.screenTopInset ?? 0 }]}
    >
      <Header
        tokens={tokens}
        variant="current"
        title={title}
        onBack={back}
        backIcon={<Glyph name="back" size={16} />}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 'success' ? (
          <View style={s.success}>
            <Text
              style={[
                t.title,
                [sourceStyles.fontSize56lineHeight64, { color: tokens.accent }],
              ]}
            >
              ✓
            </Text>
            <Text style={t.title}>Request sent</Text>
            <Text
              style={[
                t.body,
                sourceStyles.fontSize16lineHeight22textAligncenter,
              ]}
            >
              We received your request for {selection.title}. You can follow it
              in My applications.
            </Text>
          </View>
        ) : (
          <>
            <SourcePhoto
              asset={selection.heroImage}
              position={selection.heroImagePosition}
              height={(Math.min(512, width - 48) * 5) / 12}
              style={sourceStyles.borderRadius8}
            />
            <Text style={[t.section, sourceStyles.marginTop25lineHeight25]}>
              {selection.headline ?? content.heading}
            </Text>
            {selection.intro && (
              <Text
                style={[
                  t.body,
                  t.muted,
                  sourceStyles.marginTop10fontSize16lineHeight21,
                ]}
              >
                {selection.intro}
              </Text>
            )}
            {content.heading !== selection.headline && (
              <Text
                style={[
                  t.body,
                  t.strong,
                  sourceStyles.marginTop26fontSize16lineHeight20,
                ]}
              >
                {content.heading}
              </Text>
            )}
            <View style={sourceStyles.marginTop24gap22}>
              {content.body.map(paragraph => (
                <Text
                  key={paragraph}
                  style={[t.body, sourceStyles.fontSize16lineHeight20]}
                >
                  {paragraph}
                </Text>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <View style={s.footer}>
        <ActionButton
          tokens={tokens}
          label={
            step === 'success'
              ? 'Back to products'
              : getProductApplyLabel(selection.cardId)
          }
          onPress={step === 'success' ? host.onBack : () => setStep('sign')}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  footer: { paddingHorizontal: 24, paddingBottom: 42, paddingTop: 12 },
  sign: { paddingTop: 100, gap: 12 },
  success: { alignItems: 'center', gap: 24, paddingTop: 80 },
});

const sourceStyles = StyleSheet.create({
  padding24: { padding: 24 },
  fontSize56lineHeight64: { fontSize: 56, lineHeight: 64 },
  fontSize16lineHeight22textAligncenter: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  borderRadius8: { borderRadius: 8 },
  marginTop25lineHeight25: { marginTop: 25, lineHeight: 25 },
  marginTop10fontSize16lineHeight21: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 21,
  },
  marginTop26fontSize16lineHeight20: {
    marginTop: 26,
    fontSize: 16,
    lineHeight: 20,
  },
  marginTop24gap22: { marginTop: 24, gap: 22 },
  fontSize16lineHeight20: { fontSize: 16, lineHeight: 20 },
});
