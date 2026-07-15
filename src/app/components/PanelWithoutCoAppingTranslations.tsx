/**
 * Translated panel variant for countries where Co-Apping is unavailable.
 */

import PanelMenuSheet from "@/app/components/PanelMenuSheet";

interface PanelWithoutCoAppingTranslationsProps {
  aboutSmartBanking: string;
  exchangeRates: string;
  findAtmBranches: string;
  onClose?: () => void;
}

export default function PanelWithoutCoAppingTranslations(
  props: PanelWithoutCoAppingTranslationsProps,
) {
  return <PanelMenuSheet {...props} />;
}
