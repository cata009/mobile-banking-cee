/**
 * Translated panel variant with the optional Co-Apping action enabled.
 */

import PanelMenuSheet from "@/app/components/PanelMenuSheet";

interface PanelWithTranslationsProps {
  aboutSmartBanking: string;
  exchangeRates: string;
  findAtmBranches: string;
  startCoAppingSession: string;
  onClose?: () => void;
  onStartCoApping?: () => void;
}

export default function PanelWithTranslations(props: PanelWithTranslationsProps) {
  return <PanelMenuSheet {...props} />;
}
