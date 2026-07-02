/**
 * HomeScreen - Main home screen with account summary and optional unplanned banner
 */

import AccountSummary from "./AccountSummary";
import HomeHeader from "./HomeHeader";
import InactiveState from "./InactiveState";
import UnplannedBanner from "./UnplannedBanner";
import BottomNavigation from "@/app/components/BottomNavigation";
import { useDemo } from "@/app/state/demoStore";
import { getFeatureFlags } from "@/app/state/featureHelpers";
import type { Product } from "@/data/products";

interface HomeScreenProps {
  onPrimeClick?: () => void;
  onAnalyticsClick?: () => void;
  onMessagesClick?: () => void;
  onPaymentsClick?: () => void;
  onProductsClick?: () => void;
  onMoreClick?: () => void;
  onAccountClick?: (product: Product) => void;
  onInvestmentsClick?: () => void;
}

export default function HomeScreen({ onPrimeClick, onAnalyticsClick, onMessagesClick, onPaymentsClick, onProductsClick, onMoreClick, onAccountClick, onInvestmentsClick }: HomeScreenProps) {
  const demoState = useDemo();
  const { scenario } = demoState;

  // Get all feature flags from centralized helper
  const features = getFeatureFlags(demoState);

  // Handler for bottom navigation tab changes
  const handleTabChange = (tab: 'home' | 'analytics' | 'payments' | 'products' | 'more') => {
    console.log(`📱 Bottom nav tab clicked: ${tab}`);
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
