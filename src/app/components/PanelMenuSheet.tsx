import { AppIcon } from "@/app/components/icons";
import type { IconName } from "@/app/components/icons";

export interface PanelMenuSheetProps {
  aboutSmartBanking: string;
  exchangeRates: string;
  findAtmBranches: string;
  startCoAppingSession?: string;
  onClose?: () => void;
  onStartCoApping?: () => void;
  closeHandleCursor?: boolean;
}

interface PanelMenuRowProps {
  icon: IconName;
  iconDataName: string;
  label: string;
  onClick?: () => void;
  interactive?: boolean;
}

function DragHandle() {
  return (
    <div
      className="-translate-x-1/2 absolute h-[16px] left-[calc(50%+0.5px)] top-0 w-[40px]"
      data-name="11 Native/ContainerStatusBar/More"
    >
      <div className="absolute contents inset-[16%_4.45%_9.75%_4.45%]" data-name="Group">
        <div className="absolute flex inset-[16%_41.95%_9.75%_4.45%] items-center justify-center">
          <div className="flex-none h-[5px] rotate-20 w-[21px]">
            <div className="bg-[var(--uc-border-muted)] rounded-[4px] size-full" />
          </div>
        </div>
        <div className="absolute flex inset-[16%_4.45%_9.75%_41.95%] items-center justify-center">
          <div className="-rotate-20 flex-none h-[5px] w-[21px]">
            <div
              className="bg-[var(--uc-border-muted)] rounded-[4px] size-full"
              data-name="Rectangle 11 Copy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CloseHandle({
  onClose,
  closeHandleCursor = true,
}: Pick<PanelMenuSheetProps, "onClose" | "closeHandleCursor">) {
  return (
    <div className="h-[16px] relative shrink-0 w-full">
      <div
        className={`content-stretch flex items-start p-[10px] relative size-full${closeHandleCursor ? " cursor-pointer" : ""}`}
        onClick={onClose}
      >
        <DragHandle />
      </div>
    </div>
  );
}

function PanelMenuRow({ icon, iconDataName, label, onClick, interactive = false }: PanelMenuRowProps) {
  const interactionClasses = interactive
    ? " cursor-pointer hover:opacity-90 transition-opacity"
    : "";

  return (
    <div
      className={`content-stretch flex gap-[8px] h-[80px] items-center px-[16px] py-[24px] relative shrink-0 w-[375px]${interactionClasses}`}
      data-name="Light Restyle/Navigation"
      onClick={onClick}
    >
      <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
        <div className="relative shrink-0 size-[32px]" data-name={iconDataName}>
          <AppIcon name={icon} color="var(--uc-static-white)" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
          <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-[var(--uc-static-white)] w-full whitespace-pre-wrap">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PanelMenuSheet({
  aboutSmartBanking,
  exchangeRates,
  findAtmBranches,
  startCoAppingSession,
  onClose,
  onStartCoApping,
  closeHandleCursor = true,
}: PanelMenuSheetProps) {
  return (
    <div className="relative size-full" data-name="Panel">
      <div
        className="absolute backdrop-blur-[5.939px] bg-[var(--uc-static-black)] inset-0 opacity-51"
        data-name="Screen Dimming"
        onClick={onClose}
      />
      <div className="-translate-x-1/2 absolute bg-[var(--uc-text)] bottom-0 content-stretch flex flex-col gap-[8px] items-start left-1/2 py-[24px] rounded-tl-[12px] rounded-tr-[12px]">
        <CloseHandle onClose={onClose} closeHandleCursor={closeHandleCursor} />
        <div className="content-stretch flex flex-col items-center relative shrink-0 w-[375px]">
          <PanelMenuRow
            icon="panel-smart-banking"
            iconDataName="ic_navigation_prelogin_activatetokens_white"
            label={aboutSmartBanking}
          />
          <PanelMenuRow
            icon="payment-exchange-rates"
            iconDataName="ic_navigation_payments_exchangerates_white"
            label={exchangeRates}
          />
          <PanelMenuRow
            icon="contact-location"
            iconDataName="ic_navigation_restyle_LocatorWhite"
            label={findAtmBranches}
          />
          {startCoAppingSession !== undefined && (
            <PanelMenuRow
              icon="panel-share-screen"
              iconDataName="ic_navigation_restyle_LocatorWhite"
              label={startCoAppingSession}
              onClick={onStartCoApping}
              interactive
            />
          )}
        </div>
      </div>
    </div>
  );
}
