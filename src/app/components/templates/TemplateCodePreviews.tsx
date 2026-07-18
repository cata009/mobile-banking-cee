import { feedbackStatusTemplates, type TemplateCodePreviewProps } from "./templateData";
import {
  AccountDetailHomepageTemplate,
  AccountSelectionPanelTemplate,
  ActivateMtokenTemplate,
  AnalyticsOverviewTemplate,
  ApplePayActivationTemplate,
  CardsOverviewTemplate,
  ContactInfoSheetTemplate,
  DomesticPaymentFormTemplate,
  FeedbackStatusTemplate,
  GenerateTokenTemplate,
  MessageDetailTemplate,
  ProductSelectionTemplate,
  PushRequestFormTemplate,
  ReviewDataTemplate,
  ReviewRequestTemplate,
  SettingsTemplate,
  SignPinTemplate,
  SuccessfulPaymentTemplate,
  TransactionDetailTemplate,
  TravelInsuranceDetailTemplate,
  TutorialIntroTemplate,
} from "./templateFlows";
import {
  AccountOptionsTemplate,
  AccountTransactionsListTemplate,
  CoAppingSessionTemplate,
  ContactsDirectoryTemplate,
  DocumentsTemplate,
  HomeDashboardTemplate,
  LanguageSelectorSheetTemplate,
  LogoutConfirmationTemplate,
  MessagesInboxTemplate,
  MessagesOutboxTemplate,
  MoreMenuTemplate,
  MorePanelMenuTemplate,
  NewPaymentSheetTemplate,
  PaymentsMenuTemplate,
  PreloginActiveTemplate,
  PreloginInactiveTemplate,
  PrimeBenefitsTemplate,
  ProductDetailTemplate,
  ProductsMenuTemplate,
  ProductsShopSmartTemplate,
  RecurrentPaymentTemplate,
  SpendingMoneyOutTemplate,
} from "./templateScreens";

export type { TemplateCodePreviewId } from "./templateData";

export function TemplateCodePreview({ previewId, presentationOnly = false }: TemplateCodePreviewProps) {
  const interactive = !presentationOnly;

  switch (previewId) {
    case "messages-inbox":
      return <MessagesInboxTemplate interactive={interactive} />;
    case "home-dashboard":
      return <HomeDashboardTemplate interactive={interactive} />;
    case "payments-menu":
      return <PaymentsMenuTemplate interactive={interactive} />;
    case "new-payment-sheet":
      return <NewPaymentSheetTemplate interactive={interactive} />;
    case "products-menu":
      return <ProductsMenuTemplate />;
    case "more-menu":
      return <MoreMenuTemplate interactive={interactive} />;
    case "contacts-directory":
      return <ContactsDirectoryTemplate interactive={interactive} />;
    case "messages-outbox":
      return <MessagesOutboxTemplate interactive={interactive} />;
    case "prime-benefits":
      return <PrimeBenefitsTemplate interactive={interactive} />;
    case "prelogin-inactive":
      return <PreloginInactiveTemplate interactive={interactive} />;
    case "prelogin-active":
      return <PreloginActiveTemplate interactive={interactive} />;
    case "language-selector-sheet":
      return <LanguageSelectorSheetTemplate interactive={interactive} />;
    case "more-panel-menu":
      return <MorePanelMenuTemplate />;
    case "co-apping-session":
      return <CoAppingSessionTemplate interactive={interactive} />;
    case "account-transactions-list":
      return <AccountTransactionsListTemplate interactive={interactive} />;
    case "spending-money-out":
      return <SpendingMoneyOutTemplate interactive={interactive} />;
    case "products-shopsmart":
      return <ProductsShopSmartTemplate />;
    case "logout-confirmation":
      return <LogoutConfirmationTemplate interactive={interactive} />;
    case "documents":
      return <DocumentsTemplate interactive={interactive} />;
    case "recurrent-payment":
      return <RecurrentPaymentTemplate interactive={interactive} />;
    case "product-detail":
      return <ProductDetailTemplate interactive={interactive} />;
    case "account-options":
      return <AccountOptionsTemplate interactive={interactive} />;
    case "activate-mtoken":
      return <ActivateMtokenTemplate interactive={interactive} />;
    case "analytics-overview":
      return <AnalyticsOverviewTemplate />;
    case "cards-overview":
      return <CardsOverviewTemplate interactive={interactive} />;
    case "contact-info-sheet":
      return <ContactInfoSheetTemplate interactive={interactive} />;
    case "account-detail-homepage":
      return <AccountDetailHomepageTemplate interactive={interactive} />;
    case "domestic-payment-form":
      return <DomesticPaymentFormTemplate interactive={interactive} />;
    case "review-request":
      return <ReviewRequestTemplate interactive={interactive} />;
    case "review-data":
      return <ReviewDataTemplate interactive={interactive} />;
    case "transaction-detail":
      return <TransactionDetailTemplate interactive={interactive} />;
    case "sign-pin":
      return <SignPinTemplate interactive={interactive} />;
    case "generate-token":
      return <GenerateTokenTemplate interactive={interactive} />;
    case "message-detail":
      return <MessageDetailTemplate interactive={interactive} />;
    case "push-request-form":
      return <PushRequestFormTemplate interactive={interactive} />;
    case "account-selection-panel":
      return <AccountSelectionPanelTemplate interactive={interactive} />;
    case "apple-pay-activation":
      return <ApplePayActivationTemplate interactive={interactive} />;
    case "successful-payment":
      return <SuccessfulPaymentTemplate interactive={interactive} />;
    case "tutorial-intro":
      return <TutorialIntroTemplate interactive={interactive} />;
    case "product-selection":
      return <ProductSelectionTemplate interactive={interactive} />;
    case "settings":
      return <SettingsTemplate interactive={interactive} />;
    case "travel-insurance-detail":
      return <TravelInsuranceDetailTemplate interactive={interactive} />;
    case "informative-status":
    case "pending-status":
    case "success-status":
    case "error-status":
    case "warning-status":
      return <FeedbackStatusTemplate config={feedbackStatusTemplates[previewId]} interactive={interactive} />;
    default:
      return null;
  }
}
