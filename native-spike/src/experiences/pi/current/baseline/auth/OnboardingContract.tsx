import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { BaselineNavigationLink } from '../../../../../universal/BaselineNavigationLink';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { OnboardingSheet } from './OnboardingSheet';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { createProfilePdf } from '@/features/profile/mobileFirstProfileSettings';
import { shareDemoFile } from '../../../../../platform/nativeFiles';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';

export function OnboardingContract({
  checks,
  onToggle,
  onRead,
  onDocument,
  initialWarning = false,
}: {
  checks: Record<string, boolean>;
  onToggle: (key: string) => void;
  onRead: () => void;
  onDocument: (title: string) => void;
  initialWarning?: boolean;
}) {
  const [viewer, setViewer] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [warning, setWarning] = useState(initialWarning);
  const download = async () => {
    try {
      await shareDemoFile(
        'onboarding-document-demo.pdf',
        'application/pdf',
        createProfilePdf(
          'PDF Content',
          'PRIMUL DOCUMENT DE CITIT\n\nDesign placeholder from the supplied Figma source. No legal document was supplied.',
        ),
      );
      setDownloadError(false);
    } catch {
      setDownloadError(true);
    }
  };
  return (
    <View style={s.content}>
      <Text style={s.body}>
        Open the contractual documentation and then sign them with qualified
        signature, by using the OTP code that you will receive via SMS, after
        accepting the Trans Sped contract.{'\n\n'}If you have restarted the
        enrollment process, check if there are updated data in the contract
        below.
      </Text>
      <BaselineNavigationRow
        title="DOCUMENTAȚIE CONTRACTUALĂ"
        leadingVisual={
          <View
            style={[
              s.dot,
              {
                backgroundColor: sourceColor(
                  checks.documentRead
                    ? 'var(--uc-green-olive)'
                    : 'var(--uc-status-red)',
                ),
              },
            ]}
          />
        }
        trailingAccessory="chevron"
        style={s.flush}
        onPress={() => {
          setViewer(true);
          setAtEnd(false);
        }}
      />
      <View style={s.rule} />
      <View style={s.consent}>
        <Text style={[s.body, s.grow]}>
          I give up the term of 15 days provided by law, for their study
        </Text>
        <ToggleButton
          checked={!!checks.contract}
          onToggle={() => {
            if (!checks.documentRead) setWarning(true);
            else onToggle('contract');
          }}
          ariaLabel="I give up the term of 15 days provided by law, for their study"
        />
      </View>
      {warning && !checks.documentRead && (
        <View accessibilityRole="alert" style={s.warning}>
          <SourceCustomIcon
            name="info-circle"
            size={20}
            color={sourceColor('var(--uc-static-white)')}
          />
          <Text style={s.warningText}>
            It's necessary to open the contractual documents by clicking on the
            arrow and if you agree, to press the dedicated button.
          </Text>
        </View>
      )}
      <View style={s.consent}>
        <Text style={[s.body, s.grow]}>
          I agree with the Trans Sped Contract
        </Text>
        <ToggleButton
          checked={!!checks.transsped}
          onToggle={() => onToggle('transsped')}
          ariaLabel="I agree with the Trans Sped Contract"
        />
      </View>
      <BaselineNavigationLink
        text="ISSUING QUALIFIED SIGNATURE CERTIFICATE REQUEST, TERMS & CONDITIONS"
        presentation="primary"
        onPress={() => onDocument('Trans Sped Contract')}
      />
      {viewer && (
        <OnboardingSheet
          title="Contractual documentation"
          onClose={() => setViewer(false)}
          footer={
            <View style={{ gap: 8 }}>
              <PrimaryButton
                label="Am citit și sunt de acord"
                disabled={!atEnd}
                onPress={() => {
                  onRead();
                  setViewer(false);
                }}
              />
              <PrimaryButton
                label="Descarcǎ Documentul"
                variant="secondary"
                onPress={download}
              />
              {downloadError && (
                <Text accessibilityRole="alert" style={s.small}>
                  Documentul nu a putut fi descărcat. Reîncearcă.
                </Text>
              )}
            </View>
          }
        >
          <Text style={s.small}>
            You can accept the contents of the document by scrolling down to
            activate the ‘READ AND AGREE’ button below. You can always download
            the consultation document.
          </Text>
          <ScrollView
            accessibilityLabel="Contractual documentation content"
            style={s.pdfViewport}
            onScroll={event => {
              const { layoutMeasurement, contentOffset, contentSize } =
                event.nativeEvent;
              if (
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - 8
              )
                setAtEnd(true);
            }}
            scrollEventThrottle={16}
          >
            <View style={s.pdf}>
              <Text style={s.pdfTitle}>PDF{'\n'}Content</Text>
              <Text style={s.pdfLabel}>PRIMUL DOCUMENT DE CITIT</Text>
            </View>
          </ScrollView>
        </OnboardingSheet>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  content: { gap: 24 },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  small: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  dot: { width: 11, height: 11, borderRadius: 6 },
  flush: { paddingLeft: 16, paddingRight: 16 },
  rule: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: sourceColor('var(--uc-text-muted)'),
  },
  consent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  grow: { flex: 1 },
  pdfViewport: { height: 280, marginTop: 24 },
  pdf: {
    height: 370,
    backgroundColor: sourceColor('var(--uc-border)'),
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
  },
  pdfTitle: {
    fontFamily: 'UniCredit-medium',
    fontSize: 48,
    letterSpacing: 3.69,
    textAlign: 'center',
    color: sourceColor('var(--uc-text)'),
  },
  pdfLabel: {
    fontFamily: 'UniCredit-medium',
    fontSize: 18,
    textAlign: 'center',
    color: sourceColor('var(--uc-text)'),
  },
  warning: {
    padding: 16,
    borderRadius: 4,
    gap: 8,
    flexDirection: 'row',
    backgroundColor: sourceColor('var(--uc-status-red)'),
  },
  warningText: {
    flex: 1,
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 20,
    color: sourceColor('var(--uc-static-white)'),
  },
});
