/**
 * Legacy static English panel variant without Co-Apping.
 */

import PanelMenuSheet from "@/app/components/PanelMenuSheet";

export default function PanelWithoutCoApping() {
  return (
    <PanelMenuSheet
      aboutSmartBanking="ABOUT SMART BANKING"
      exchangeRates="EXCHANGE RATES"
      findAtmBranches="FIND ATM & BRANCHES"
      closeHandleCursor={false}
    />
  );
}
