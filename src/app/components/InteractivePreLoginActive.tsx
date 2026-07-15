import { useEffect } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import PanelWithTranslations from "@/app/components/PanelWithTranslations";
import PanelWithoutCoAppingTranslations from "@/app/components/PanelWithoutCoAppingTranslations";
import { useCountry } from "@/app/state/demoStore";
import { isCoAppingAvailable } from "@/app/utils/coAppingAvailability";

interface InteractivePreLoginActiveProps {
  onStartCoApping: () => void;
  onClose: () => void;
}

export default function InteractivePreLoginActive({
  onStartCoApping,
  onClose,
}: InteractivePreLoginActiveProps) {
  const country = useCountry();
  const { t } = useLanguage();
  const coAppingAvailable = isCoAppingAvailable(country);

  // Adaugă suport pentru tasta ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        console.log("✅ ESC pressed - closing overlay");
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Handler pentru click pe backdrop (zona întunecată în afara panel-ului)
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Dacă click-ul este direct pe backdrop div (nu pe copiii săi), închide
    if (e.target === e.currentTarget) {
      console.log("✅ Clicked on backdrop - closing overlay");
      onClose();
    }
  };

  const handlePanelAreaClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    console.log("Clicked in panel area:", target);
    console.log("Data-name:", target.getAttribute("data-name"));
    
    // Caută în părinți pentru data-name specific
    let element: HTMLElement | null = target;
    let depth = 0;
    const maxDepth = 15;
    
    while (element && depth < maxDepth) {
      const dataName = element.getAttribute("data-name");
      
      // 1. Click pe drop icon (handle de închidere)
      if (dataName === "11 Native/ContainerStatusBar/More") {
        console.log("✅ Drop icon clicked - closing overlay");
        e.stopPropagation();
        onClose();
        return;
      }
      
      // 2. Click pe butonul START CO-APPING SESSION (doar dacă e disponibil pentru țară)
      if (coAppingAvailable && dataName === "Light Restyle/Navigation") {
        const text = element.textContent?.trim() || "";
        
        // Click specific pe START CO-APPING SESSION
        if (text.includes("START CO-APPING SESSION")) {
          console.log("✅ Start Co-Apping button clicked - proceeding to next screen");
          e.stopPropagation();
          onStartCoApping();
          return;
        }
      }
      
      // 3. Click pe alte menu items (inactive - doar hover effect)
      if (dataName === "Light Restyle/Navigation") {
        const text = element.textContent?.trim() || "";
        
        if (text.includes("ABOUT SMART BANKING") || 
            text.includes("EXCHANGE RATES") || 
            text.includes("FIND ATM")) {
          console.log("ℹ️ Inactive menu item clicked - no action (only hover effect)");
          e.stopPropagation();
          return; // Stop propagation pentru a preveni orice acțiune
        }
      }
      
      element = element.parentElement;
      depth++;
    }
    
    // Dacă ajungem aici și nu am găsit nimic specific, verifică dacă e click pe panel sau backdrop
    // Dacă click-ul este pe panel (nu pe backdrop), nu face nimic
    const isPanelClick = (e.target as HTMLElement).closest('[data-name*="Panel"]');
    if (isPanelClick) {
      console.log("ℹ️ Clicked on panel area (not on any interactive element) - no action");
      e.stopPropagation();
      return;
    }
  };

  return (
    <div 
      onClick={handleBackdropClick} 
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Panel Component - rendered based on Co-Apping availability */}
      <div 
        onClick={handlePanelAreaClick}
        className="absolute inset-0 w-full h-full"
      >
        {coAppingAvailable ? (
          <PanelWithTranslations 
            aboutSmartBanking={t('panel.aboutSmartBanking')}
            exchangeRates={t('panel.exchangeRates')}
            findAtmBranches={t('panel.findAtmBranches')}
            startCoAppingSession={t('panel.startCoAppingSession')}
          />
        ) : (
          <PanelWithoutCoAppingTranslations 
            aboutSmartBanking={t('panel.aboutSmartBanking')}
            exchangeRates={t('panel.exchangeRates')}
            findAtmBranches={t('panel.findAtmBranches')}
          />
        )}
      </div>
      
      {/* Stiluri pentru a face elementele clickable și hoverable */}
      <style>{`
        /* Drop icon - clickable cu hover effect */
        [data-name="11 Native/ContainerStatusBar/More"] {
          cursor: pointer !important;
          transition: opacity 0.2s ease;
        }
        [data-name="11 Native/ContainerStatusBar/More"]:hover {
          opacity: 0.7 !important;
        }
        
        /* Toate menu items - hoverable */
        [data-name="Light Restyle/Navigation"] {
          cursor: pointer !important;
          transition: opacity 0.2s ease, transform 0.1s ease;
        }
        [data-name="Light Restyle/Navigation"]:hover {
          opacity: 0.95 !important;
          transform: scale(1.01);
        }
        [data-name="Light Restyle/Navigation"]:active {
          transform: scale(0.99);
        }
        
        /* Backdrop - cursor pointer */
        [data-name="Screen Dimming"] {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}
