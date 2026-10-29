import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { createProfilePdf } from '@/features/profile/mobileFirstProfileSettings';
import { shareDemoFile } from '../../../../../platform/nativeFiles';
import { BaselineBottomSheet } from '../../../../../universal/BaselineBottomSheet';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { Text } from '../../../../../universal/Typography';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { sourceColor } from '../../../../../universal/sourceColor';

const sections = [
  [
    'About this document',
    'This demonstration document illustrates the review step for a virtual debit card. It is not a contract and does not contain the bank’s actual terms.',
  ],
  [
    'Card and account',
    'The virtual card is associated with an eligible account selected in the application. Review the account and currency before continuing.',
  ],
  [
    'Review and confirmation',
    'Read the actual contractual terms provided by the bank before deciding whether to proceed. Confirming this sample does not create or sign a real agreement.',
  ],
  [
    'Use and management',
    'Available card functions and limits depend on the account and the bank’s current product conditions. Review the applicable information in the real application.',
  ],
  [
    'Your choice',
    'You may close this demonstration and return to the request without confirming. A separate signing step follows in the prototype.',
  ],
] as const;
const text = sections.map(([title, body]) => `${title}\n${body}`).join('\n\n');

/** Same scroll-to-confirm document presentation as the CZ Robo demo, with RO demo copy. */
export function VirtualCardTermsSheet({
  onClose,
  onConfirm,
  screenTopInset,
  dark,
}: {
  onClose: () => void;
  onConfirm: () => void;
  screenTopInset: number;
  dark: boolean;
}) {
  const { width, height } = useDemoViewport();
  const [read, setRead] = useState(false);
  const [error, setError] = useState(false);
  const measured = useRef({ viewport: 0, content: 0 });
  const confirmIfFullyVisible = () => {
    const { viewport, content } = measured.current;
    if (viewport > 0 && content > 0 && content <= viewport + 4) setRead(true);
  };
  const surface = sourceColor('var(--uc-surface)', dark);
  const textColor = sourceColor('var(--uc-text)', dark);
  const download = async () => {
    try {
      await shareDemoFile(
        'virtual-card-terms-demo.pdf',
        'application/pdf',
        createProfilePdf('VIRTUAL CARD TERMS — DEMONSTRATION', text),
      );
      setError(false);
    } catch {
      setError(true);
    }
  };
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BaselineBottomSheet
        title="Virtual card terms and conditions"
        width={width}
        height={height}
        fillHeight
        padding={24}
        contentBleed
        maxHeightOffsetPx={Math.max(72, screenTopInset + 16)}
        onClose={onClose}
        closeLabel="Close terms and conditions"
        dark={dark}
        footer={
          <View style={styles.footer}>
            {read && (
              <PrimaryButton
                label="I have read it"
                onPress={onConfirm}
                dark={dark}
              />
            )}
            <PrimaryButton
              label="Download document"
              onPress={download}
              dark={dark}
              variant="secondary"
            />
            {error && (
              <Text style={{ color: textColor }}>
                The document could not be downloaded. Try again.
              </Text>
            )}
          </View>
        }
      >
        <Text style={[styles.description, { color: textColor }]}>
          Read the document to the end to show the confirmation. You can also
          download a copy for your records.
        </Text>
        <ScrollView
          testID="ro-virtual-card-terms-scroll"
          style={styles.document}
          contentContainerStyle={styles.documentContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onLayout={event => {
            measured.current.viewport = event.nativeEvent.layout.height;
            confirmIfFullyVisible();
          }}
          onContentSizeChange={(_width, contentHeight) => {
            measured.current.content = contentHeight;
            confirmIfFullyVisible();
          }}
          onScroll={event => {
            const { contentOffset, layoutMeasurement, contentSize } =
              event.nativeEvent;
            if (
              layoutMeasurement.height > 0 &&
              contentOffset.y + layoutMeasurement.height >=
                contentSize.height - 4
            )
              setRead(true);
          }}
        >
          <View style={[styles.page, { backgroundColor: surface }]}>
            <Text style={[styles.documentTitle, { color: textColor }]}>
              VIRTUAL CARD{'\n'}TERMS AND CONDITIONS
            </Text>
            <Text style={[styles.caption, { color: textColor }]}>
              Demonstration document
            </Text>
            {sections.map(([title, body]) => (
              <View key={title} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  {title}
                </Text>
                <Text style={[styles.paragraph, { color: textColor }]}>
                  {body}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </BaselineBottomSheet>
    </ModalPortal>
  );
}
const styles = StyleSheet.create({
  description: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  document: { flex: 1, backgroundColor: '#e5e5e5' },
  documentContent: { padding: 16 },
  page: { padding: 24, borderWidth: 1, borderColor: '#d8d8d8' },
  documentTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  caption: { fontFamily: 'UniCredit-bold', fontSize: 16, marginTop: 16 },
  section: { marginTop: 24, gap: 12 },
  sectionTitle: { fontFamily: 'UniCredit-bold', fontSize: 18 },
  paragraph: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 24 },
  footer: { paddingTop: 24, paddingBottom: 10, gap: 8 },
});
