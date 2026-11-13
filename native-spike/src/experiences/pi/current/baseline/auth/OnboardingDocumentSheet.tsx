import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { createProfilePdf } from '@/features/profile/mobileFirstProfileSettings';
import { shareDemoFile } from '../../../../../platform/nativeFiles';
import { OnboardingSheet } from './OnboardingSheet';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

/** Source documents contain a PDF placeholder; no bank/legal terms are invented here. */
export function OnboardingDocumentSheet({
  title,
  annex = false,
  onClose,
  onAgree,
}: {
  title: string;
  annex?: boolean;
  onClose: () => void;
  onAgree: () => void;
}) {
  const [read, setRead] = useState(annex);
  const [error, setError] = useState(false);
  const download = async () => {
    try {
      await shareDemoFile(
        'onboarding-document-demo.pdf',
        'application/pdf',
        createProfilePdf(
          title,
          'PDF content\n\nDesign placeholder from the supplied Figma source. No legal document was supplied.',
        ),
      );
      setError(false);
    } catch {
      setError(true);
    }
  };
  return (
    <OnboardingSheet
      title={annex ? 'Document name example' : title}
      onClose={onClose}
      fixedHeight
      maxHeightOffsetPx={24}
      footer={
        <View style={s.footer}>
          <PrimaryButton
            label={
              annex ? 'Am citit si am inteles' : 'Am citit si sunt de acord'
            }
            disabled={!read}
            onPress={onAgree}
          />
          <PrimaryButton
            label={annex ? 'Descarcă documentul' : 'Descarcă'}
            variant="secondary"
            onPress={download}
          />
          {error && (
            <Text accessibilityRole="alert" style={s.body}>
              Documentul nu a putut fi descărcat. Reîncearcă.
            </Text>
          )}
        </View>
      }
    >
      {!annex && (
        <Text style={s.body}>
          You can accept the contents of the document either by pressing the "I
          READ AND AGREE" button below, or by activating the button on the
          previous screen. You can also download the consultation document."
        </Text>
      )}
      <ScrollView
        style={[s.viewport, annex && s.annex]}
        accessibilityLabel="Document content"
        onScroll={event => {
          const { layoutMeasurement, contentOffset, contentSize } =
            event.nativeEvent;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 8
          )
            setRead(true);
        }}
        scrollEventThrottle={16}
      >
        <View style={s.pdf}>
          <Text style={s.pdfTitle}>PDF{'\n'}content</Text>
        </View>
      </ScrollView>
    </OnboardingSheet>
  );
}
const s = StyleSheet.create({
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  viewport: { height: 306, marginTop: 24 },
  annex: { height: 490, marginTop: 0 },
  pdf: {
    height: 520,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: sourceColor('var(--uc-border)'),
  },
  pdfTitle: {
    fontFamily: 'UniCredit-regular',
    fontSize: 60,
    lineHeight: 70,
    textAlign: 'center',
    color: sourceColor('var(--uc-text)'),
  },
  footer: { gap: 8 },
});
