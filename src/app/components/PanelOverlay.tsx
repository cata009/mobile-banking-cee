/**
 * PanelOverlay - Wrapper component for panel with translations and close handler
 * Automatically selects the correct panel based on co-apping availability
 */

import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry } from "@/app/state/demoStore";
import { isCoAppingAvailable } from "@/app/utils/coAppingAvailability";
import PanelWithTranslations from "@/app/components/PanelWithTranslations";
import PanelWithoutCoAppingTranslations from "@/app/components/PanelWithoutCoAppingTranslations";

interface PanelOverlayProps {
  onClose: () => void;
  onStartCoApping?: () => void;
}

export default function PanelOverlay({ onClose, onStartCoApping }: PanelOverlayProps) {
  const { t } = useLanguage();
  const country = useCountry();
  const coAppingAvailable = isCoAppingAvailable(country);

  // Handler pentru click pe fundal (închide panel-ul)
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Click pe backdrop (fundal blur) = închide panel
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handler pentru start co-apping
  const handleStartCoApping = () => {
    if (onStartCoApping) {
      onStartCoApping();
    }
  };

  return (
    <div 
      className="absolute inset-0 z-50" 
      onClick={handleBackdropClick}
    >
      {coAppingAvailable ? (
        <PanelWithTranslations
          aboutSmartBanking={t('panel.aboutSmartBanking')}
          exchangeRates={t('panel.exchangeRates')}
          findAtmBranches={t('panel.findAtmBranches')}
          startCoAppingSession={t('panel.startCoAppingSession') || ''}
          onClose={onClose}
          onStartCoApping={handleStartCoApping}
        />
      ) : (
        <PanelWithoutCoAppingTranslations
          aboutSmartBanking={t('panel.aboutSmartBanking')}
          exchangeRates={t('panel.exchangeRates')}
          findAtmBranches={t('panel.findAtmBranches')}
          onClose={onClose}
        />
      )}
    </div>
  );
}