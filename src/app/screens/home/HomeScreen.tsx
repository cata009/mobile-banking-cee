/**
 * HomeScreen - Main home screen with account summary and optional unplanned banner
 */

import AccountSummary from "./AccountSummary";
import InactiveState from "./InactiveState";
import HomeHeader from "./HomeHeader";
import UnplannedBanner from "./UnplannedBanner";
import BottomNavigation from "@/app/components/BottomNavigation";
import { useDemo } from "@/app/state/demoStore";
import { getFeatureFlags } from "@/app/state/featureHelpers";
import type { Product } from "@/data/products";

interface HomeScreenProps {
  onPrimeClick?: () => void;
  onMoreClick?: () => void;
  onAccountClick?: (product: Product) => void;
}

export default function HomeScreen({ onPrimeClick, onMoreClick, onAccountClick }: HomeScreenProps) {
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
    // Future: handle other tabs
  };

  // If scenario is inactive, show inactive state only
  if (scenario === "inactive") {
    return <InactiveState />;
  }

  // Active state - compose all sections
  return (
    <div className="w-full h-full relative bg-[#F5F5F5] flex flex-col">
      {/* Status Bar Space */}
      <div className="h-[54px] flex-shrink-0 bg-[#F5F5F5]" />

      {/* STICKY Top Bar - Prime Badge + Icons - FIXED */}
      <div className="sticky top-0 z-10 bg-[#F5F5F5] flex-shrink-0">
        <div className="px-[24px] pb-[24px] flex items-center justify-between">
          {/* Prime Badge */}
          <button
            onClick={onPrimeClick}
            className="flex items-center gap-[6px] hover:opacity-80 transition-opacity cursor-pointer"
            style={{
              padding: '8px 12px',
              borderRadius: '16px',
              background: 'radial-gradient(37.18% 73.78% at 70% 28.98%, rgba(23, 20, 32, 0.00) 0%, rgba(38, 38, 38, 0.20) 100%), radial-gradient(61.85% 49.94% at 50.13% 50.06%, rgba(19, 64, 151, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), linear-gradient(193deg, #7497C0 -32.31%, #262626 60.01%)',
              backgroundBlendMode: 'soft-light, normal, soft-light, normal'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.98926 15L4.69434 6H11.2812L7.98926 15ZM9.70215 13.2139L12.3457 6H16L9.70215 13.2139ZM6.24316 13.2129L0 6H3.63184L6.24316 13.2129ZM3.7041 5H0L2.86523 1.5H5.2334L3.7041 5ZM9.65527 1.5L11.1846 5H4.79395L6.32324 1.5H9.65527ZM15.9785 5H12.2744L10.7451 1.5H13.1133L15.9785 5Z" fill="white"/>
            </svg>
            <span 
              className="font-['UniCredit',sans-serif] text-white"
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
          <div className="flex items-center gap-[8px]">
            {/* Hide Amounts */}
            <button className="w-[32px] h-[32px] flex items-center justify-center cursor-pointer hover:opacity-70">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12.7776 18.3322C11.8595 17.8334 10.9707 17.0822 10.0638 16.0002C11.2794 14.5483 12.4613 13.6827 13.7276 13.2414C13.2032 13.8008 12.8757 14.5477 12.8757 15.3752C12.8757 16.1702 13.1813 16.8872 13.6707 17.439L15.4514 15.6583C15.4064 15.5721 15.3745 15.479 15.3745 15.3752C15.3745 15.0296 15.6552 14.7502 15.9995 14.7502C16.1038 14.7502 16.1976 14.7815 16.2832 14.8265L22.6046 8.50505C20.8421 6.95065 18.5345 6 16.0002 6C10.4776 6 6 10.477 6 16.0002C6 18.5347 6.95064 20.8422 8.50503 22.6048L12.7776 18.3322ZM15.9997 18.4999C17.7254 18.4999 19.1242 17.1005 19.1242 15.3749C19.1242 14.9018 19.0072 14.4612 18.8166 14.0605L14.6797 18.1981C15.0822 18.3862 15.5259 18.4999 15.9997 18.4999ZM19.2024 13.6748L23.4887 9.38845C25.0468 11.1516 26 13.4623 26 15.9998C26 21.5231 21.5225 26.0001 15.9998 26.0001C13.4623 26.0001 11.1517 25.0469 9.38853 23.4894L14.0305 18.8468C14.6586 19.0299 15.3068 19.1249 15.9942 19.1249C18.1955 19.1249 19.9981 18.2368 21.9387 15.9998C21.0149 14.9348 20.1218 14.1773 19.2024 13.6748Z" fill="#262626"/>
              </svg>
            </button>

            {/* Profile */}
            <button className="w-[32px] h-[32px] flex items-center justify-center cursor-pointer hover:opacity-70">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 20C15.5229 20 20 15.5229 20 10C20 4.47715 15.5229 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5229 4.47715 20 10 20ZM9.95831 5C11.2528 5 12.3021 6.04938 12.3021 7.34375C12.3021 8.63812 11.2528 9.6875 9.95831 9.6875C8.664 9.6875 7.61456 8.63812 7.61456 7.34375C7.61456 6.04938 8.664 5 9.95831 5ZM15 15H5.625C5.66906 12.7459 7.50719 10.9409 9.76188 10.9375H15V15Z" fill="#262626"/>
              </svg>
            </button>

            {/* Messages */}
            <button className="w-[32px] h-[32px] flex items-center justify-center cursor-pointer hover:opacity-70">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6 10.67V9.5H26V10.67L16 17.5413L6 10.67ZM6 12.3381L16 19.2094L26 12.3387V18.6669C26 20.5075 24.5075 22 22.6669 22H6V12.3381Z" fill="#262626"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[80px] scrollbar-hide">
        {/* Title - SCROLLABLE */}
        <div className="px-[24px] pb-[24px]">
          <h1 
            className="font-['UniCredit',sans-serif] font-bold text-[#262626]"
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
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] flex items-center justify-center">
        <BottomNavigation onTabChange={handleTabChange} />
      </div>
    </div>
  );
}
