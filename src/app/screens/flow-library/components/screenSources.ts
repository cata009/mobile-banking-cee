/**
 * The screens as built, as text.
 *
 * The Implementation tab hands developers the exact source that renders what
 * they see in the phone — not a description of it. Vite's `?raw` import gives
 * the module text at build time, so the code shown, copied and zipped is always
 * the code that ran. One entry per flow whose screens are worth taking as-is.
 */

import type { FlowPreviewId } from "../flows/types";
import fraudJourneySource from "@/flows/ba/card-fraud/FraudJourney.tsx?raw";
import fraudBaselineSource from "@/flows/ba/card-fraud/FraudBaselineScreen.tsx?raw";
import fraudNotificationSource from "@/flows/ba/card-fraud/FraudNotification.tsx?raw";
import fraudFormSource from "@/flows/ba/card-fraud/FraudFormLayout.tsx?raw";
import fraudEvidenceSource from "@/flows/ba/card-fraud/FraudEvidenceFields.tsx?raw";
import fraudActivitySource from "@/flows/ba/card-fraud/FraudActivityList.tsx?raw";
import fraudTransactionsSource from "@/features/cards/fraud/transactions.ts?raw";
import fraudCardSource from "@/features/cards/fraud/cardFixture.ts?raw";
import fraudNativeBodySource from "../../../../../native-spike/src/experiences/pi/current/baseline/Body.tsx?raw";
import fraudNativeTransactionSource from "../../../../../native-spike/src/experiences/pi/current/baseline/Transaction.tsx?raw";
import fraudNativeCardRowSource from "../../../../../native-spike/src/universal/BaselineCardNavigationRow.tsx?raw";
import fraudNativeHelperSource from "../../../../../native-spike/src/universal/BaselineBanner.tsx?raw";
import fraudHelperContractSource from "@/app/components/contracts/banner.ts?raw";
import fraudNativeCardSource from "../../../../../native-spike/src/experiences/pi/current/baseline/Card.tsx?raw";
import fraudNativeCardOptionsSource from "../../../../../native-spike/src/experiences/pi/current/baseline/CardOptions.tsx?raw";
import fraudBankingContractSource from "@/features/demo-native/bankingPresentation.ts?raw";
import fraudTransactionContractSource from "@/features/demo-native/transactionPresentation.ts?raw";
import fraudScreensSource from "@/flows/ba/card-fraud/FraudScreens.tsx?raw";
import fraudSuccessSource from "@/app/components/flow/StandardSuccessScreen.tsx?raw";
import fraudSignatureSource from "@/app/components/FaceIdAnimation.tsx?raw";
import fraudInfoBannerSource from "@/app/components/cards/InfoBanner.tsx?raw";
import fraudRadioSource from "@/app/components/common/RadioButton.tsx?raw";
import fraudSheetSource from "@/app/components/BottomSheet.tsx?raw";
import fraudModelSource from "@/features/cards/fraud/model.ts?raw";
import fraudDefinitionSource from "@/flows/ba/card-fraud/definition.ts?raw";
import fraudEntrySource from "@/flows/ba/card-fraud/index.ts?raw";
import fraudContractsSource from "@/flows/ba/card-fraud/screenContracts.ts?raw";
import fraudPreviewSource from "@/flows/ba/card-fraud/preview.tsx?raw";
import fraudCssSource from "@/flows/ba/card-fraud/fraud.css?raw";
import fraudPresentationSource from "@/flows/ba/card-fraud/FraudPresentationDialog.tsx?raw";
import fraudPresentationCssSource from "@/flows/ba/card-fraud/presentation.css?raw";
import fraudPresentationUrlSource from "@/flows/ba/card-fraud/presentationUrl.ts?raw";
import investmentsBulkApprovalSource from "@/flows/shared/investments-bulk-approval/investmentsBulkApprovalPreviews.tsx?raw";

import bulkApprovalModelSource from "@/features/investments/bulk-approval/model.ts?raw";
import nativeOrderDocumentsPreviewSource from "@/flows/shared/investments-bulk-approval/NativeOrderDocumentsPreview.tsx?raw";
import nativeOrderDocumentsSource from "../../../../../native-spike/src/experiences/pi/current/investments/baseline/flows/Documents.tsx?raw";
import nativeExAnteDisclosureSource from "../../../../../native-spike/src/experiences/pi/current/investments/baseline/flows/ExAnteDisclosure.tsx?raw";
import nativeComponentPreviewSource from "@/features/demo-native/componentPreview.ts?raw";
import nativeComponentPreviewAdapterSource from "../../../../../native-spike/src/app/componentPreviewAdapter.tsx?raw";
import primePreviewSource from "@/flows/shared/prime/preview.tsx?raw";
import primeDefinitionSource from "@/flows/shared/prime/definition.ts?raw";
import primePolicySource from "@/features/prime/reference.ts?raw";
import primeContentSource from "@/features/prime/content.ts?raw";
import primeServiceIconsSource from "@/app/components/icons/domains/services/custom.tsx?raw";
import primeNativeSource from "../../../../../native-spike/src/app/PrimeReferencePreview.tsx?raw";
import primeUpgradeSource from "../../../../../native-spike/src/app/PrimeUpgrade.tsx?raw";
import primeEntrySource from "../../../../../native-spike/src/app/PrimeEntryButton.tsx?raw";
import primeAdvisorSource from "../../../../../native-spike/src/experiences/pi/current/baseline/more/Advisor.tsx?raw";
import primeContactSource from "../../../../../native-spike/src/experiences/pi/current/baseline/more/PrimeContact.tsx?raw";
import primeCallPolicySource from "@/features/prime/callAudio.ts?raw";
import primeUpgradeCallSource from "../../../../../native-spike/src/app/PrimeUpgradeCall.tsx?raw";
import primeCallAudioSource from "../../../../../native-spike/src/app/PrimeCallAudio.tsx?raw";
import primeCallAudioWebSource from "../../../../../native-spike/src/app/PrimeCallAudio.web.tsx?raw";
import primePrivateBackgroundSource from "../../../../../native-spike/src/app/PrimePrivateBackground.tsx?raw";
import primePrivateBackgroundWebSource from "../../../../../native-spike/src/app/PrimePrivateBackground.web.tsx?raw";
import primePrivateFillsSource from "../../../../../native-spike/src/app/primePrivateFills.ts?raw";
import primeStandardBackgroundSource from "../../../../../native-spike/src/app/PrimeStandardBackground.tsx?raw";
import primeStandardBackgroundWebSource from "../../../../../native-spike/src/app/PrimeStandardBackground.web.tsx?raw";
import primeStandardFillsSource from "../../../../../native-spike/src/app/primeStandardFills.ts?raw";
import primeAssetsSource from "../../../../../native-spike/src/app/primeReferenceAssets.ts?raw";
import primeAssetsWebSource from "../../../../../native-spike/src/app/primeReferenceAssets.web.ts?raw";
import primeAppointmentSource from "../../../../../native-spike/src/experiences/pi/current/baseline/more/Appointment.tsx?raw";
import primeAppointmentUiSource from "../../../../../native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx?raw";
import primeAppointmentMeetingViewsSource from "../../../../../native-spike/src/experiences/pi/current/baseline/more/appointment/MeetingViews.tsx?raw";
import primeCallbackSource from "../../../../../native-spike/src/experiences/pi/current/baseline/more/CallRequest.tsx?raw";

export interface FlowScreenSource {
  /** Repo-relative path, for the package README and the copy header. */
  file: string;
  source: string;
  /** Extracted runtime sources, preserved at their repository paths in the ZIP. */
  dependencies?: readonly { file: string; source: string }[];
}

export const FLOW_SCREEN_SOURCES: Partial<Record<FlowPreviewId, FlowScreenSource>> = {
  "ba-card-fraud": {
    file: "src/flows/ba/card-fraud/FraudJourney.tsx",
    source: fraudJourneySource,
    dependencies: [
      { file: "src/flows/ba/card-fraud/FraudScreens.tsx", source: fraudScreensSource },
      { file: "src/app/components/flow/StandardSuccessScreen.tsx", source: fraudSuccessSource },
      { file: "src/app/components/FaceIdAnimation.tsx", source: fraudSignatureSource },
      { file: "src/app/components/cards/InfoBanner.tsx", source: fraudInfoBannerSource },
      { file: "src/app/components/common/RadioButton.tsx", source: fraudRadioSource },
      { file: "src/app/components/BottomSheet.tsx", source: fraudSheetSource },
      { file: "src/flows/ba/card-fraud/FraudBaselineScreen.tsx", source: fraudBaselineSource },
      { file: "src/flows/ba/card-fraud/FraudNotification.tsx", source: fraudNotificationSource },
      { file: "src/flows/ba/card-fraud/FraudFormLayout.tsx", source: fraudFormSource },
      { file: "src/flows/ba/card-fraud/FraudEvidenceFields.tsx", source: fraudEvidenceSource },
      { file: "src/flows/ba/card-fraud/FraudActivityList.tsx", source: fraudActivitySource },
      { file: "src/features/cards/fraud/transactions.ts", source: fraudTransactionsSource },
      { file: "src/features/cards/fraud/cardFixture.ts", source: fraudCardSource },
      { file: "native-spike/src/experiences/pi/current/baseline/Body.tsx", source: fraudNativeBodySource },
      { file: "native-spike/src/experiences/pi/current/baseline/Transaction.tsx", source: fraudNativeTransactionSource },
      { file: "native-spike/src/universal/BaselineCardNavigationRow.tsx", source: fraudNativeCardRowSource },
      { file: "native-spike/src/universal/BaselineBanner.tsx", source: fraudNativeHelperSource },
      { file: "src/app/components/contracts/banner.ts", source: fraudHelperContractSource },
      { file: "native-spike/src/experiences/pi/current/baseline/Card.tsx", source: fraudNativeCardSource },
      { file: "native-spike/src/experiences/pi/current/baseline/CardOptions.tsx", source: fraudNativeCardOptionsSource },
      { file: "src/features/demo-native/bankingPresentation.ts", source: fraudBankingContractSource },
      { file: "src/features/demo-native/transactionPresentation.ts", source: fraudTransactionContractSource },
      { file: "src/features/cards/fraud/model.ts", source: fraudModelSource },
      { file: "src/flows/ba/card-fraud/definition.ts", source: fraudDefinitionSource },
      { file: "src/flows/ba/card-fraud/index.ts", source: fraudEntrySource },
      { file: "src/flows/ba/card-fraud/screenContracts.ts", source: fraudContractsSource },
      { file: "src/flows/ba/card-fraud/preview.tsx", source: fraudPreviewSource },
      { file: "src/flows/ba/card-fraud/fraud.css", source: fraudCssSource },
      { file: "src/flows/ba/card-fraud/FraudPresentationDialog.tsx", source: fraudPresentationSource },
      { file: "src/flows/ba/card-fraud/presentation.css", source: fraudPresentationCssSource },
      { file: "src/flows/ba/card-fraud/presentationUrl.ts", source: fraudPresentationUrlSource },
    ],
  },
  "pi-prime": {
    file: "src/flows/shared/prime/preview.tsx",
    source: primePreviewSource,
    dependencies: [
      { file: "src/flows/shared/prime/definition.ts", source: primeDefinitionSource },
      { file: "src/features/prime/reference.ts", source: primePolicySource },
      { file: "src/features/prime/content.ts", source: primeContentSource },
      { file: "src/app/components/icons/domains/services/custom.tsx", source: primeServiceIconsSource },
      { file: "src/features/prime/callAudio.ts", source: primeCallPolicySource },
      { file: "native-spike/src/app/PrimeReferencePreview.tsx", source: primeNativeSource },
      { file: "native-spike/src/app/PrimeUpgrade.tsx", source: primeUpgradeSource },
      { file: "native-spike/src/app/PrimeEntryButton.tsx", source: primeEntrySource },
      { file: "native-spike/src/app/PrimeUpgradeCall.tsx", source: primeUpgradeCallSource },
      { file: "native-spike/src/app/PrimeCallAudio.tsx", source: primeCallAudioSource },
      { file: "native-spike/src/app/PrimeCallAudio.web.tsx", source: primeCallAudioWebSource },
      { file: "native-spike/src/app/PrimePrivateBackground.tsx", source: primePrivateBackgroundSource },
      { file: "native-spike/src/app/PrimePrivateBackground.web.tsx", source: primePrivateBackgroundWebSource },
      { file: "native-spike/src/app/primePrivateFills.ts", source: primePrivateFillsSource },
      { file: "native-spike/src/app/PrimeStandardBackground.tsx", source: primeStandardBackgroundSource },
      { file: "native-spike/src/app/PrimeStandardBackground.web.tsx", source: primeStandardBackgroundWebSource },
      { file: "native-spike/src/app/primeStandardFills.ts", source: primeStandardFillsSource },
      { file: "native-spike/src/app/primeReferenceAssets.ts", source: primeAssetsSource },
      { file: "native-spike/src/app/primeReferenceAssets.web.ts", source: primeAssetsWebSource },
      { file: "native-spike/src/experiences/pi/current/baseline/more/Advisor.tsx", source: primeAdvisorSource },
      { file: "native-spike/src/experiences/pi/current/baseline/more/PrimeContact.tsx", source: primeContactSource },
      { file: "native-spike/src/experiences/pi/current/baseline/more/Appointment.tsx", source: primeAppointmentSource },
      { file: "native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx", source: primeAppointmentUiSource },
      { file: "native-spike/src/experiences/pi/current/baseline/more/appointment/MeetingViews.tsx", source: primeAppointmentMeetingViewsSource },
      { file: "native-spike/src/experiences/pi/current/baseline/more/CallRequest.tsx", source: primeCallbackSource },
      { file: "src/features/demo-native/componentPreview.ts", source: nativeComponentPreviewSource },
      { file: "native-spike/src/app/componentPreviewAdapter.tsx", source: nativeComponentPreviewAdapterSource },
    ],
  },
  "investments-bulk-approval": {
    file: "src/flows/shared/investments-bulk-approval/investmentsBulkApprovalPreviews.tsx",
    source: investmentsBulkApprovalSource,
    dependencies: [
      { file: "src/features/investments/bulk-approval/model.ts", source: bulkApprovalModelSource },
      { file: "src/flows/shared/investments-bulk-approval/NativeOrderDocumentsPreview.tsx", source: nativeOrderDocumentsPreviewSource },
      { file: "native-spike/src/experiences/pi/current/investments/baseline/flows/Documents.tsx", source: nativeOrderDocumentsSource },
      { file: "native-spike/src/experiences/pi/current/investments/baseline/flows/ExAnteDisclosure.tsx", source: nativeExAnteDisclosureSource },
      { file: "src/features/demo-native/componentPreview.ts", source: nativeComponentPreviewSource },
      { file: "native-spike/src/app/componentPreviewAdapter.tsx", source: nativeComponentPreviewAdapterSource },
    ],
  },
};
