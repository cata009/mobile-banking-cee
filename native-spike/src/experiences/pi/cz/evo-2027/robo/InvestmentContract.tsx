import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { createProfilePdf } from '@/features/profile/mobileFirstProfileSettings';
import { shareDemoFile } from '../../../../../platform/nativeFiles';
import { BaselineBottomSheet } from '../../../../../universal/BaselineBottomSheet';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import {
  Button,
  Copy,
  czInvestmentTokens,
  investmentColors,
} from '../investments/Primitives';

const documentReference = 'Demo reference INV-DEMO-0001 | Version 1.0';
const documentNotice =
  'Sample terms for the investment goal prototype. Names, terms and amounts are fictional. This document does not open an account, place an order or provide legal or investment advice.';
const documentSections = [
  {
    title: '1. Parties and purpose',
    paragraphs: [
      'For this sample agreement, the account holder is Jana Novakova, client reference DEMO-001, and the service provider is the demo bank shown in this application. The investment account records cash, investments and instructions connected with the goals that the account holder chooses to create.',
      'Each goal describes an intended purpose, target amount and investment period. A goal is a planning tool and does not promise a particular result. These sample terms describe how the account would be used; the review and signature steps in the prototype remain separate from acknowledgement of this document.',
    ],
  },
  {
    title: '2. Investment service',
    paragraphs: [
      'The service presents a suggested portfolio based on the information supplied in the investor profile. The portfolio may contain several funds or other investment instruments. Its composition, expected risk and proposed investment period are displayed before the account holder is asked to confirm an investment instruction.',
      'Money assigned to a goal is recorded separately for planning and reporting purposes. A target date or regular contribution can be changed in the available goal settings. A change to a target does not itself buy or sell investments; any resulting instruction is reviewed and authorised through the relevant flow.',
    ],
  },
  {
    title: '3. Investor profile and suitability',
    paragraphs: [
      'The account holder provides information about investment knowledge, previous experience, financial circumstances, objectives and ability to bear losses. The proposed strategy uses these answers. Information should be complete and up to date so that the service can explain whether a proposed investment is consistent with the profile.',
      'If circumstances or preferences change, the account holder should review the investor profile before submitting another instruction. An incomplete or expired profile may require an update before investing can continue. The account holder can review the proposed strategy and its risk information before deciding whether to proceed.',
    ],
  },
  {
    title: '4. Funding and investment instructions',
    paragraphs: [
      'Contributions are made from the selected linked account, subject to the balance and payment details shown during review. The account holder checks the amount, currency and destination before authorising a contribution. A scheduled contribution is shown separately from a one-time instruction and can be managed using the available controls.',
      'An instruction may remain pending while the related payment, investment order or settlement is processed. The final price and number of units may differ from an earlier estimate. Pending amounts are not treated as settled holdings, and the goal balance is updated when the relevant transaction has been recorded.',
    ],
  },
  {
    title: '5. Investment risks',
    paragraphs: [
      'Investments can rise or fall in value, and the account holder may receive less than the amount contributed. Market movements, interest rates, exchange rates and the financial position of an issuer can affect performance. Diversifying a portfolio can spread exposure but cannot remove the possibility of loss.',
      'Past performance and illustrations of future value do not guarantee future returns. A suggested investment period is an indication for planning, and access to money may depend on selling and settling the underlying investments. The account holder should consider short-term cash needs before assigning money to an investment goal.',
    ],
  },
  {
    title: '6. Fees, charges and taxes',
    paragraphs: [
      'The account holder reviews the applicable fee information before authorising an instruction. Service fees, product costs and any transaction charges may reduce the value of an investment or its return. Where a cost is estimated, the review identifies it as an estimate and the relevant statement records the resulting charge.',
      'Amounts and rates shown elsewhere in this prototype are examples. No fee is collected by reading or acknowledging these sample terms. Tax treatment depends on the account holder and the investment; any tax figures shown in a demonstration are illustrative and should be checked against the documents for an actual service.',
    ],
  },
  {
    title: '7. Statements and communication',
    paragraphs: [
      'The account holder can review goal progress, recorded holdings and available transaction details in the application. Statements distinguish contributions, withdrawals, fees and changes in investment value. Estimated values may use the latest available price and can differ from the amount that would be received if an investment were sold.',
      'Important account messages and documents are made available through the communication channels selected for the service. The account holder should check contact details and report an unfamiliar instruction or an incorrect statement promptly. Personal information is handled according to the privacy information supplied with the actual service.',
    ],
  },
  {
    title: '8. Closing the account and acknowledgement',
    paragraphs: [
      'A request to withdraw money or close a goal may require outstanding instructions to finish and investments to be sold. The account holder reviews any remaining costs and the destination account before confirming such a request. Closing a goal does not cancel a transaction that has already been executed.',
      'By selecting I have read it, the account holder acknowledges reaching the end of this demonstration document. This acknowledgement returns to the review screen and does not sign the contract. The account holder can download a copy, close this preview or continue to the separate signature step when ready.',
    ],
  },
] as const;
const documentEnd = 'End of demonstration document';
const documentText = [
  'Demonstration document',
  documentReference,
  documentNotice,
  ...documentSections.flatMap(section => [
    section.title,
    ...section.paragraphs,
  ]),
  documentEnd,
].join('\n\n');

export function InvestmentContract({
  onClose,
  onConfirm,
  screenTopInset,
}: {
  onClose: () => void;
  onConfirm: () => void;
  screenTopInset: number;
}) {
  const { width, height } = useDemoViewport();
  const [read, setRead] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const download = async () => {
    try {
      await shareDemoFile(
        'investment-account-terms-demo.pdf',
        'application/pdf',
        createProfilePdf('INVESTMENT ACCOUNT TERMS', documentText),
      );
      setDownloadError('');
    } catch {
      setDownloadError('The document could not be downloaded. Try again.');
    }
  };
  return (
    <ModalPortal
      transparent
      visible
      animationType="none"
      onRequestClose={onClose}
    >
      <BaselineBottomSheet
        title="Investment account contract"
        width={width}
        height={height}
        fillHeight
        padding={24}
        contentBleed
        maxHeightOffsetPx={Math.max(72, screenTopInset + 16)}
        onClose={onClose}
        closeLabel="Close investment account contract"
        footer={
          <View style={styles.footer}>
            {read ? (
              <Button canonical label="I have read it" onPress={onConfirm} />
            ) : null}
            <Button
              canonical
              label="Download document"
              secondary
              onPress={download}
            />
            {downloadError ? (
              <Copy style={styles.error}>{downloadError}</Copy>
            ) : null}
          </View>
        }
      >
        <Copy style={styles.description}>
          Read the document to the end to show the confirmation. You can also
          download a copy for your records.
        </Copy>
        <ScrollView
          testID="cz-investment-contract-scroll"
          style={styles.document}
          contentContainerStyle={styles.documentContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator
          scrollEventThrottle={16}
          onScroll={event => {
            const { contentOffset, layoutMeasurement, contentSize } =
              event.nativeEvent;
            if (
              layoutMeasurement.height > 0 &&
              contentSize.height > layoutMeasurement.height + 4 &&
              contentOffset.y > 0 &&
              contentOffset.y + layoutMeasurement.height >=
                contentSize.height - 4
            )
              setRead(true);
          }}
        >
          <View style={styles.documentPage}>
            <Copy strong header style={styles.documentTitle}>
              INVESTMENT{'\n'}ACCOUNT TERMS
            </Copy>
            <Copy strong style={styles.documentCaption}>
              Demonstration document
            </Copy>
            <Copy muted style={styles.documentReference}>
              {documentReference}
            </Copy>
            <Copy style={styles.documentNotice}>{documentNotice}</Copy>
            {documentSections.map(section => (
              <View key={section.title} style={styles.documentSection}>
                <Copy strong header style={styles.sectionTitle}>
                  {section.title}
                </Copy>
                {section.paragraphs.map(paragraph => (
                  <Copy key={paragraph} style={styles.paragraph}>
                    {paragraph}
                  </Copy>
                ))}
              </View>
            ))}
            <Copy muted style={styles.documentEnd}>
              {documentEnd}
            </Copy>
          </View>
        </ScrollView>
      </BaselineBottomSheet>
    </ModalPortal>
  );
}
const styles = StyleSheet.create({
  description: {
    fontSize: 18,
    lineHeight: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  document: { flex: 1, backgroundColor: czInvestmentTokens.surface },
  documentContent: { padding: 16 },
  documentPage: {
    padding: 24,
    backgroundColor: czInvestmentTokens.background,
    borderWidth: 1,
    borderColor: czInvestmentTokens.border,
  },
  documentTitle: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 1,
    textAlign: 'center',
  },
  documentCaption: { fontSize: 16, lineHeight: 22, marginTop: 16 },
  documentReference: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  documentNotice: { fontSize: 16, lineHeight: 24, marginTop: 16 },
  documentSection: { marginTop: 24, gap: 12 },
  sectionTitle: { fontSize: 18, lineHeight: 24 },
  paragraph: { fontSize: 16, lineHeight: 24 },
  documentEnd: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: czInvestmentTokens.border,
  },
  footer: { paddingTop: 24, paddingBottom: 10, gap: 8 },
  error: { color: investmentColors.negative, fontSize: 14 },
});
