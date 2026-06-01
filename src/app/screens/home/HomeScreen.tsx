/**
 * HomeScreen - Main home screen with account summary and optional unplanned banner
 */

import AccountSummary from "./AccountSummary";
import InactiveState from "./InactiveState";
import UnplannedBanner from "./UnplannedBanner";
import AmountVisibilityButton from "@/app/components/AmountVisibilityButton";
import BottomNavigation from "@/app/components/BottomNavigation";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { AppIcon } from "@/app/components/icons";
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
}

export default function HomeScreen({ onPrimeClick, onAnalyticsClick, onMessagesClick, onPaymentsClick, onProductsClick, onMoreClick, onAccountClick }: HomeScreenProps) {
  const demoState = useDemo();
  const { scenario, amountsHidden, toggleAmountsHidden } = demoState;

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
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-app-bg)]" />

      {/* STICKY Top Bar - Prime Badge + Icons - FIXED */}
      <div className="sticky top-0 z-10 bg-[var(--uc-app-bg)] flex-shrink-0">
        <div className="px-[24px] pb-[24px] flex h-[56px] items-start justify-between">
          {/* Prime Badge */}
          <button
            onClick={onPrimeClick}
            className="flex items-center gap-[6px] hover:opacity-80 transition-opacity cursor-pointer"
            style={{
              padding: '8px 12px',
              borderRadius: '16px',
              background: 'radial-gradient(37.18% 73.78% at 70% 28.98%, color-mix(in srgb, var(--uc-primary-k1) 0%, transparent) 0%, color-mix(in srgb, var(--uc-primary-k1) 20%, transparent) 100%), radial-gradient(61.85% 49.94% at 50.13% 50.06%, color-mix(in srgb, var(--uc-product-blue-deep) 20%, transparent) 0%, color-mix(in srgb, var(--uc-static-black) 20%, transparent) 100%), linear-gradient(193deg, var(--uc-product-blue) -32.31%, var(--uc-static-black) 60.01%)',
              backgroundBlendMode: 'soft-light, normal, soft-light, normal'
            }}
          >
            <AppIcon name="prime-diamond-16" color="var(--uc-static-white)" />
            <span 
              className="font-['UniCredit',sans-serif] text-[var(--uc-static-white)]"
              style={{
                fontSize: '14px',
                fontWeight: 700,
                lineHeight: '16px'
              }}
            >
              Prime
            </span>
          </button>

          {/* Top Icons */}
          <HeaderActionRail>
            <AmountVisibilityButton hidden={amountsHidden} onToggle={toggleAmountsHidden} />
            <HeaderActionButton icon="profile" label="Profile" />
            <HeaderActionButton icon="messages" label="Messages" onClick={onMessagesClick} />
          </HeaderActionRail>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[80px] scrollbar-hide">
        {/* Title - SCROLLABLE */}
        <div className="px-[24px] pb-[24px]">
          <h1 
            className="font-['UniCredit',sans-serif] font-bold text-[var(--uc-text)]"
            style={{
              fontSize: '28px',
              lineHeight: 'normal'
            }}
          >
            Your Homepage
          </h1>
        </div>

        {/* Account Summary */}
        <AccountSummary showRedesign={features.cardsRedesign} onAccountClick={onAccountClick} />

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
