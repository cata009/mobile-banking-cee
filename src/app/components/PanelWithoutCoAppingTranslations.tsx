/**
 * PanelWithoutCoApping - Version with Translations
 * 
 * Used for countries where Co-Apping feature is not available (RO, HU, RS, BA, BA_BL, SI).
 * Contains only the inactive menu items:
 * - ABOUT SMART BANKING
 * - EXCHANGE RATES
 * - FIND ATM & BRANCHES
 */

import { AppIcon } from "@/app/components/icons";

interface PanelWithoutCoAppingTranslationsProps {
  aboutSmartBanking: string;
  exchangeRates: string;
  findAtmBranches: string;
  onClose?: () => void;
}

function Group() {
  return (
    <div className="absolute contents inset-[16%_4.45%_9.75%_4.45%]" data-name="Group">
      <div className="absolute flex inset-[16%_41.95%_9.75%_4.45%] items-center justify-center">
        <div className="flex-none h-[5px] rotate-20 w-[21px]">
          <div className="bg-[var(--uc-border-muted)] rounded-[4px] size-full" />
        </div>
      </div>
      <div className="absolute flex inset-[16%_4.45%_9.75%_41.95%] items-center justify-center">
        <div className="-rotate-20 flex-none h-[5px] w-[21px]">
          <div className="bg-[var(--uc-border-muted)] rounded-[4px] size-full" data-name="Rectangle 11 Copy" />
        </div>
      </div>
    </div>
  );
}

function Component11NativeContainerStatusBarMore() {
  return (
    <div className="-translate-x-1/2 absolute h-[16px] left-[calc(50%+0.5px)] top-0 w-[40px]" data-name="11 Native/ContainerStatusBar/More">
      <Group />
    </div>
  );
}

function Frame9({ onClose }: { onClose?: () => void }) {
  return (
    <div className="h-[16px] relative shrink-0 w-full">
      <div 
        className="content-stretch flex items-start p-[10px] relative size-full cursor-pointer"
        onClick={onClose}
      >
        <Component11NativeContainerStatusBarMore />
      </div>
    </div>
  );
}

function IcNavigationPreloginActivatetokensWhite() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_prelogin_activatetokens_white">
      <AppIcon name="panel-smart-banking" color="var(--uc-static-white)" />
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-[var(--uc-static-white)] w-full whitespace-pre-wrap">{children}</p>
    </div>
  );
}

function Frame4({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
      <IcNavigationPreloginActivatetokensWhite />
      <Frame>{children}</Frame>
    </div>
  );
}

function LightRestyleNavigation({ aboutSmartBanking }: { aboutSmartBanking: string }) {
  
  return (
    <div className="content-stretch flex gap-[8px] h-[80px] items-center px-[16px] py-[24px] relative shrink-0 w-[375px]" data-name="Light Restyle/Navigation">
      <Frame4>{aboutSmartBanking}</Frame4>
    </div>
  );
}

function IcNavigationPaymentsExchangeratesWhite() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_payments_exchangerates_white">
      <AppIcon name="payment-exchange-rates" color="var(--uc-static-white)" />
    </div>
  );
}

function Frame1({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-[var(--uc-static-white)] w-full whitespace-pre-wrap">{children}</p>
    </div>
  );
}

function Frame5({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
      <IcNavigationPaymentsExchangeratesWhite />
      <Frame1>{children}</Frame1>
    </div>
  );
}

function LightRestyleNavigation1({ exchangeRates }: { exchangeRates: string }) {
  
  return (
    <div className="content-stretch flex gap-[8px] h-[80px] items-center px-[16px] py-[24px] relative shrink-0 w-[375px]" data-name="Light Restyle/Navigation">
      <Frame5>{exchangeRates}</Frame5>
    </div>
  );
}

function IcNavigationRestyleLocatorWhite() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_LocatorWhite">
      <AppIcon name="contact-location" color="var(--uc-static-white)" />
    </div>
  );
}

function Frame2({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-[var(--uc-static-white)] w-full whitespace-pre-wrap">{children}</p>
    </div>
  );
}

function Frame6({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
      <IcNavigationRestyleLocatorWhite />
      <Frame2>{children}</Frame2>
    </div>
  );
}

function LightRestyleNavigation2({ findAtmBranches }: { findAtmBranches: string }) {
  
  return (
    <div className="content-stretch flex gap-[8px] h-[80px] items-center px-[16px] py-[24px] relative shrink-0 w-[375px]" data-name="Light Restyle/Navigation">
      <Frame6>{findAtmBranches}</Frame6>
    </div>
  );
}

// NOTE: LightRestyleNavigation3 (Co-Apping button) is REMOVED for countries without Co-Apping support

function Frame10({ aboutSmartBanking, exchangeRates, findAtmBranches }: { aboutSmartBanking: string; exchangeRates: string; findAtmBranches: string }) {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[375px]">
      <LightRestyleNavigation aboutSmartBanking={aboutSmartBanking} />
      <LightRestyleNavigation1 exchangeRates={exchangeRates} />
      <LightRestyleNavigation2 findAtmBranches={findAtmBranches} />
      {/* LightRestyleNavigation3 (Co-Apping) intentionally removed */}
    </div>
  );
}

function Frame8({ aboutSmartBanking, exchangeRates, findAtmBranches, onClose }: PanelWithoutCoAppingTranslationsProps) {
  return (
    <div className="-translate-x-1/2 absolute bg-[var(--uc-text)] bottom-0 content-stretch flex flex-col gap-[8px] items-start left-1/2 py-[24px] rounded-tl-[12px] rounded-tr-[12px]">
      <Frame9 onClose={onClose} />
      <Frame10 aboutSmartBanking={aboutSmartBanking} exchangeRates={exchangeRates} findAtmBranches={findAtmBranches} />
    </div>
  );
}

export default function PanelWithoutCoAppingTranslations({ aboutSmartBanking, exchangeRates, findAtmBranches, onClose }: PanelWithoutCoAppingTranslationsProps) {
  return (
    <div className="relative size-full" data-name="Panel">
      <div
        className="absolute backdrop-blur-[5.939px] bg-[var(--uc-static-black)] inset-0 opacity-51"
        data-name="Screen Dimming"
        onClick={onClose}
      />
      <Frame8 aboutSmartBanking={aboutSmartBanking} exchangeRates={exchangeRates} findAtmBranches={findAtmBranches} onClose={onClose} />
    </div>
  );
}
