/**
 * MoreScreen Component
 * Main screen for "More" section with all 8 cards (baseline for all countries)
 * Individual cards can be enabled/disabled per country
 */

import { useEffect, useState } from 'react';
import { MoreHeader } from './MoreHeader';
import { ContactsCard } from './cards/ContactsCard';
import { DocumentsCard } from './cards/DocumentsCard';
import { SettingsCard } from './cards/SettingsCard';
import { GdprConsentCard } from './cards/GdprConsentCard';
import { ThirdPartyConsentCard } from './cards/ThirdPartyConsentCard';
import { DigitalActivitiesCard } from './cards/DigitalActivitiesCard';
import { MyRequestsCard } from './cards/MyRequestsCard';
import { TutorialCard } from './cards/TutorialCard';
import { TutorialsFlow } from './tutorials/TutorialsFlow';
import BottomNavigation from '@/app/components/BottomNavigation';
import { LogoutConfirmDialog } from '@/app/components/LogoutConfirmDialog';
import { useCountry } from '@/app/state/demoStore';
import { getMoreCardsForCountry, MoreCardType } from '@/app/config/moreCardsConfig';
import { getDocumentsCountForCountry } from '@/app/config/documentsConfig';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { preloadMoreCardImages } from '@/app/config/moreCardAssets';

interface MoreScreenProps {
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
  const country = useCountry();
  const { t } = useLanguage();
  const availableCards = getMoreCardsForCountry(country);
  const documentsCount = getDocumentsCountForCountry(country);
  const usesBosniaHeaderActions = country === "BA" || country === "BA_BL";
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showTutorialsFlow, setShowTutorialsFlow] = useState(false);

  useEffect(() => {
    preloadMoreCardImages(availableCards);
  }, [availableCards]);

  const cardLabels: Record<MoreCardType, string> = {
    contacts: t("more.cards.contacts"),
    documents: t("more.cards.documents"),
    settings: t("more.cards.settings"),
    "gdpr-consent": t("more.cards.gdprConsent"),
    "third-party-consent": t("more.cards.thirdPartyConsent"),
    "digital-activities": t("more.cards.digitalActivities"),
    "my-requests": t("more.cards.myRequests"),
    tutorial: t("more.cards.tutorial"),
  };

  const handleProfileClick = () => {
    console.log('👤 Profile clicked');
    // Future: navigate to profile
  };

  const handleMessagesClick = () => {
    console.log('💬 Messages clicked');
    // Future: navigate to messages
  };

  const handleContactPhoneClick = () => {
    console.log('Contact phone clicked');
    onContactsClick?.();
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
        return <ContactsCard key="contacts" title={cardLabels.contacts} onClick={() => onContactsClick?.()} />;
      case 'documents':
        return <DocumentsCard key="documents" title={cardLabels.documents} onClick={() => onDocumentsClick?.()} badgeCount={documentsCount} />;
      case 'settings':
        return <SettingsCard key="settings" title={cardLabels.settings} onClick={() => onSettingsClick?.()} />;
      case 'gdpr-consent':
        return <GdprConsentCard key="gdpr-consent" title={cardLabels["gdpr-consent"]} onClick={() => handleCardClick(cardLabels["gdpr-consent"])} />;
      case 'third-party-consent':
        return <ThirdPartyConsentCard key="third-party-consent" title={cardLabels["third-party-consent"]} onClick={() => handleCardClick(cardLabels["third-party-consent"])} />;
      case 'digital-activities':
        return <DigitalActivitiesCard key="digital-activities" title={cardLabels["digital-activities"]} onClick={() => handleCardClick(cardLabels["digital-activities"])} />;
      case 'my-requests':
        return <MyRequestsCard key="my-requests" title={cardLabels["my-requests"]} onClick={() => handleCardClick(cardLabels["my-requests"])} />;
      case 'tutorial':
        return <TutorialCard key="tutorial" title={cardLabels.tutorial} onClick={() => setShowTutorialsFlow(true)} />;
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
        onContactPhone={handleContactPhoneClick}
        onMessages={onMessagesClick ?? handleMessagesClick}
        onLogout={handleLogoutClick}
        actionVariant={usesBosniaHeaderActions ? "contact-messages" : "default"}
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

      <TutorialsFlow
        country={country}
        isOpen={showTutorialsFlow}
        onClose={() => setShowTutorialsFlow(false)}
      />
    </div>
  );
}
