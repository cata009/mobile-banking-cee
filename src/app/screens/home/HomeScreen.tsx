/**
 * HomeScreen - Main home screen with account summary and optional unplanned banner
 */

import AccountSummary from "./AccountSummary";
import App2027HomeScreen from "./App2027HomeScreen";
import HomeHeader from "./HomeHeader";
import InactiveState from "./InactiveState";
import UnplannedBanner from "./UnplannedBanner";
import BottomNavigation from "@/app/components/BottomNavigation";
import { useDemo } from "@/app/state/demoStore";
import { getFeatureFlags } from "@/app/state/featureHelpers";
import type { Product } from "@/data/products";
import type { AccountTransaction } from "@/data/accountDetails";
import type { CardTransactionMerchantEnrichment } from "@/app/screens/payments/DomesticPaymentFlowScreens";

interface HomeScreenProps {
  onPrimeClick?: () => void;
  onAnalyticsClick?: () => void;
  onMessagesClick?: () => void;
  onPaymentsClick?: () => void;
  onDomesticPaymentClick?: () => void;
  onProductsClick?: () => void;
  onMoreClick?: () => void;
  onAccountClick?: (product: Product) => void;
  onAccountInfoClick?: (product: Product) => void;
  onCardDetailsClick?: (product: Product) => void;
  onCardOptionsClick?: (product: Product) => void;
  onInvestmentsClick?: () => void;
  onInvestmentGoalsClick?: () => void;
  onTransactionClick?: (
    transaction: AccountTransaction,
    product: Product,
    merchantEnrichment?: CardTransactionMerchantEnrichment,
  ) => void;
}

export default function HomeScreen({
  onPrimeClick,
  onAnalyticsClick,
  onMessagesClick,
  onPaymentsClick,
  onDomesticPaymentClick,
  onProductsClick,
  onMoreClick,
  onAccountClick,
  onAccountInfoClick,
  onCardDetailsClick,
  onCardOptionsClick,
  onInvestmentsClick,
  onInvestmentGoalsClick,
  onTransactionClick,
}: HomeScreenProps) {
  const demoState = useDemo();
  const { scenario } = demoState;

  // Get all feature flags from centralized helper
  const features = getFeatureFlags(demoState);

  // Handler for bottom navigation tab changes
  const handleTabChange = (tab: 'home' | 'analytics' | 'payments' | 'products' | 'more') => {
    if (tab === 'more' && onMoreClick) {
      onMoreClick();
    }
    if (tab === 'analytics' && onAnalyticsClick) {
      onAnalyticsClick();
    }
    if (tab === 'payments' && onPaymentsClick) {
      onPaymentsClick();
    }
    if (tab === 'products' && onProductsClick) {
      onProductsClick();
    }
    // Future: handle other tabs
  };

  // If scenario is inactive, show inactive state only
  if (scenario === "inactive") {
    return <InactiveState />;
  }

  if (features.app2027Homepage || features.evo2027Homepage) {
    return (
      <App2027HomeScreen
        onPrimeClick={onPrimeClick}
        onAnalyticsClick={onAnalyticsClick}
        onMessagesClick={onMessagesClick}
        onPaymentsClick={onPaymentsClick}
        onDomesticPaymentClick={onDomesticPaymentClick}
        onProductsClick={onProductsClick}
        onMoreClick={onMoreClick}
        onAccountClick={onAccountClick}
        onAccountInfoClick={onAccountInfoClick}
        onCardDetailsClick={onCardDetailsClick}
        onCardOptionsClick={onCardOptionsClick}
        onInvestmentsClick={onInvestmentsClick}
        onInvestmentGoalsClick={onInvestmentGoalsClick}
        onTransactionClick={onTransactionClick}
        useCzRoboAccountCards={features.evo2027Homepage}
      />
    );
  }

  // Active state - compose all sections
  return (
    <div className="w-full h-full relative bg-[var(--uc-app-bg)] flex flex-col text-[var(--uc-text)]">
      {/* Status Bar Space */}
      <div className="h-[var(--uc-phone-top-reserve,54px)] flex-shrink-0 bg-[var(--uc-app-bg)]" />

      {/* STICKY Top Bar - Prime Badge + Icons - FIXED */}
      <div className="sticky top-0 z-10 bg-[var(--uc-app-bg)] flex-shrink-0">
        <HomeHeader onPrimeClick={onPrimeClick} onMessagesClick={onMessagesClick} showTitle={false} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[80px] scrollbar-hide">
        {/* Title - SCROLLABLE */}
        <HomeHeader showActions={false} />

        {/* Account Summary */}
        <AccountSummary
          showRedesign={features.cardsRedesign}
          onAccountClick={onAccountClick}
          onInvestmentsClick={onInvestmentsClick}
          onInvestmentGoalsClick={onInvestmentGoalsClick}
          onDomesticPaymentClick={onDomesticPaymentClick}
          onAccountInfoClick={onAccountInfoClick}
        />

        {/* Unplanned Banner (conditional) */}
        {features.unplannedBanner && <UnplannedBanner />}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-[var(--uc-bottom-bar-bg)] border-t border-[var(--uc-border-muted)] flex items-center justify-center">
        <BottomNavigation onTabChange={handleTabChange} />
      </div>
    </div>
  );
}
