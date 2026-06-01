/**
 * MoreScreen Component
 * Main screen for "More" section with all 8 cards (baseline for all countries)
 * Individual cards can be enabled/disabled per country
 */

import { useState } from 'react';
import { MoreHeader } from './MoreHeader';
import { ContactsCard } from './cards/ContactsCard';
import { DocumentsCard } from './cards/DocumentsCard';
import { SettingsCard } from './cards/SettingsCard';
import { GdprConsentCard } from './cards/GdprConsentCard';
import { ThirdPartyConsentCard } from './cards/ThirdPartyConsentCard';
import { DigitalActivitiesCard } from './cards/DigitalActivitiesCard';
import { MyRequestsCard } from './cards/MyRequestsCard';
import { TutorialCard } from './cards/TutorialCard';
import BottomNavigation from '@/app/components/BottomNavigation';
import { LogoutConfirmDialog } from '@/app/components/LogoutConfirmDialog';
import { useDemo } from '@/app/state/demoStore';
import { getMoreCardsForCountry, MoreCardType } from '@/app/config/moreCardsConfig';

interface MoreScreenProps {
  onBack: () => void;
  onHomeClick?: () => void;
  onAnalyticsClick?: () => void;
  onMessagesClick?: () => void;
  onPaymentsClick?: () => void;
  onProductsClick?: () => void;
  onContactsClick?: () => void;
  onDocumentsClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutConfirm?: () => void;
}

export default function MoreScreen({
  onBack,
  onHomeClick,
  onAnalyticsClick,
  onMessagesClick,
  onPaymentsClick,
  onProductsClick,
  onContactsClick,
  onDocumentsClick,
  onSettingsClick,
  onLogoutConfirm,
}: MoreScreenProps) {
  const { country } = useDemo();
  const availableCards = getMoreCardsForCountry(country);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleProfileClick = () => {
    console.log('👤 Profile clicked');
    // Future: navigate to profile
  };

  const handleMessagesClick = () => {
    console.log('💬 Messages clicked');
    // Future: navigate to messages
  };

  const handleLogoutClick = () => {
    console.log('🚪 Logout clicked');
    setShowLogoutDialog(true);
  };

  const handleCloseDialog = () => {
    setShowLogoutDialog(false);
  };

  const handleCardClick = (cardName: string) => {
    console.log(`📋 ${cardName} card clicked`);
    // Future: navigate to respective screen
  };

  // Handler for bottom navigation
  const handleTabChange = (tab: 'home' | 'analytics' | 'payments' | 'products' | 'more') => {
    console.log(`📱 Bottom nav tab clicked: ${tab}`);
    if (tab === 'home' && onHomeClick) {
      onHomeClick();
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

  // Render card based on type
  const renderCard = (cardType: MoreCardType) => {
    switch (cardType) {
      case 'contacts':
        return <ContactsCard key="contacts" onClick={() => onContactsClick?.()} />;
      case 'documents':
        return <DocumentsCard key="documents" onClick={() => onDocumentsClick?.()} badgeCount={12} />;
      case 'settings':
        return <SettingsCard key="settings" onClick={() => onSettingsClick?.()} />;
      case 'gdpr-consent':
        return <GdprConsentCard key="gdpr-consent" onClick={() => handleCardClick('GDPR Consent')} />;
      case 'third-party-consent':
        return <ThirdPartyConsentCard key="third-party-consent" onClick={() => handleCardClick('3rd Party consent')} />;
      case 'digital-activities':
        return <DigitalActivitiesCard key="digital-activities" onClick={() => handleCardClick('Digital activities register')} />;
      case 'my-requests':
        return <MyRequestsCard key="my-requests" onClick={() => handleCardClick('My requests')} />;
      case 'tutorial':
        return <TutorialCard key="tutorial" onClick={() => handleCardClick('Tutorial')} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col bg-[var(--uc-surface)]">
      {/* Status Bar Space - matching HomeScreen exactly */}
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-surface)]" />

      {/* Header - directly after status bar, no wrapper */}
      <MoreHeader
        onProfile={handleProfileClick}
        onMessages={onMessagesClick ?? handleMessagesClick}
        onLogout={handleLogoutClick}
      />

      {/* Scrollable Content - Grid of cards */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[80px]">
        <div className="px-[16px] pt-[16px]">
          {/* Grid 2 columns - gap 15px horizontal, 16px vertical */}
          <div className="grid grid-cols-2 gap-x-[15px] gap-y-[16px]">
            {/* Render cards in order from config */}
            {availableCards.map((cardType) => renderCard(cardType))}
          </div>
        </div>
      </div>

      {/* Footer / Home Indicator - hidden when dialog is open */}
      {!showLogoutDialog && (
        <div className="relative w-full">
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--uc-surface)] border-t border-[var(--uc-border-muted)] flex items-center justify-center">
            <BottomNavigation activeTab="more" onTabChange={handleTabChange} />
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog - ABSOLUTE positioning within MoreScreen */}
      {showLogoutDialog && (
        <LogoutConfirmDialog
          isOpen={showLogoutDialog}
          onClose={handleCloseDialog}
          onConfirm={onLogoutConfirm}
        />
      )}
    </div>
  );
}
